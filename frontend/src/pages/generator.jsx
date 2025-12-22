import React, { useState, useEffect } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Plus, Linkedin, Instagram, Youtube, Mail, MessageSquare, Users, Lightbulb, Image, Layers, Loader, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { mainApi, instaApi } from '../api/client';

const QuickGenShortcutsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('autogen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [generationStats, setGenerationStats] = useState(null);
  const [recentGenerationsData, setRecentGenerationsData] = useState([]);
  const [batchStatus, setBatchStatus] = useState(null);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  
  const BRAND_ID = localStorage.getItem('active_brand_id') || 'your-brand-id-here';

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
    { Icon: Cpu, top: '25%', right: '20%', size: 28, opacity: 0.08 },
    { Icon: Network, top: '45%', left: '10%', size: 36, opacity: 0.12 },
    { Icon: Bot, top: '60%', right: '15%', size: 30, opacity: 0.1 },
    { Icon: Sparkles, top: '15%', right: '40%', size: 24, opacity: 0.09 },
    { Icon: Rocket, top: '75%', left: '25%', size: 28, opacity: 0.11 },
    { Icon: Code, top: '35%', left: '85%', size: 26, opacity: 0.08 },
    { Icon: Database, top: '80%', right: '30%', size: 32, opacity: 0.1 },
    { Icon: Globe, top: '20%', left: '70%', size: 30, opacity: 0.09 },
    { Icon: Server, top: '90%', left: '50%', size: 28, opacity: 0.12 },
    { Icon: Terminal, top: '50%', right: '45%', size: 24, opacity: 0.08 },
    { Icon: Brain, top: '70%', left: '60%', size: 34, opacity: 0.1 },
    { Icon: Cpu, top: '5%', left: '45%', size: 26, opacity: 0.09 },
    { Icon: Network, top: '85%', right: '10%', size: 30, opacity: 0.11 },
    { Icon: Bot, top: '40%', left: '30%', size: 28, opacity: 0.08 },
  ];

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'Drafts', id: 'drafts' },
    { icon: ShoppingCart, label: 'Basket', id: 'basket' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: Zap, label: 'Auto-Gen', id: 'autogen' },
    { icon: FileCode, label: 'Templates', id: 'templates' },
    { icon: Mic, label: 'Brand Voice', id: 'brandvoice' },
  ];

  // ==================== LOAD DATA ====================
  useEffect(() => {
    loadGenerationStats();
    loadRecentGenerations();
  }, []);

  const loadGenerationStats = async () => {
    try {
      const stats = await mainApi.generations.getStats(BRAND_ID);
      setGenerationStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setGenerationStats({
        total_generated: 0,
        this_week: 0,
        this_month: 0,
        avg_per_day: 0
      });
    }
  };

  const loadRecentGenerations = async () => {
    try {
      const data = await mainApi.generations.list(BRAND_ID, 1, 10);
      setRecentGenerationsData(data.generations || []);
    } catch (err) {
      console.error('Failed to load recent generations:', err);
      setRecentGenerationsData([]);
    }
  };

  // ==================== GENERATION ENDPOINTS ====================
  
  // Quick content generation
  const quickGenerate = async (category, platform = null, customPrompt = null) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await mainApi.generations.quickGenerate(BRAND_ID, category, platform, customPrompt);
      setSuccessMessage(`✨ Successfully generated ${category.replace(/_/g, ' ')}!`);
      
      await loadGenerationStats();
      await loadRecentGenerations();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Batch generate content
  const batchGenerate = async (categories, countPerCategory = 5) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setBatchStatus('processing');
    
    try {
      const result = await mainApi.generations.batchGenerate(BRAND_ID, categories);
      setSuccessMessage(`🎉 Successfully generated ${result.total_generated} pieces of content across ${Object.keys(result.generations_by_category).length} categories!`);
      setBatchStatus('completed');
      
      await loadGenerationStats();
      await loadRecentGenerations();
      
      return result;
    } catch (err) {
      setError(err.message);
      setBatchStatus('failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all generations with filters
  const getGenerationsWithFilters = async (filters = {}) => {
    try {
      const data = await mainApi.generations.list(BRAND_ID, filters.page || 1, filters.page_size || 50);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get generation by ID
  const getGenerationById = async (generationId) => {
    try {
      const generation = await mainApi.generations.get(generationId);
      setSelectedGeneration(generation);
      return generation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add feedback to generation
  const addFeedback = async (generationId, rating, comments = null) => {
    try {
      await mainApi.request(`/v1/generations/${generationId}/feedback`, 'POST', { rating, comments });
      setSuccessMessage('👍 Feedback submitted successfully!');
      await loadRecentGenerations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Convert generation to draft
  const convertToDraft = async (generationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mainApi.request(`/v1/generations/${generationId}/to-draft`, 'POST');
      setSuccessMessage('📝 Successfully converted to draft!');
      await loadRecentGenerations();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete generation
  const deleteGeneration = async (generationId) => {
    try {
      await mainApi.generations.delete(generationId);
      setSuccessMessage('🗑️ Generation deleted successfully!');
      await loadRecentGenerations();
      await loadGenerationStats();
    } catch (err) {
      setError(err.message);
    }
  };

  // Regenerate content (uses GET then POST)
  const regenerateContent = async (generationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const originalGen = await getGenerationById(generationId);
      
      const result = await quickGenerate(
        originalGen.category,
        originalGen.platform,
        originalGen.prompt
      );
      
      setSuccessMessage('🔄 Content regenerated successfully!');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  
  const getDefaultPrompt = (category, platform) => {
    const prompts = {
      'linkedin_post': 'Create an engaging LinkedIn post about industry insights and professional growth',
      'instagram_reel': 'Write a viral Instagram Reel script with hooks, storytelling, and call-to-action',
      'instagram_carousel': 'Design a 5-slide educational Instagram carousel with clear messaging',
      'youtube_short': 'Script a 60-second YouTube Short with attention-grabbing opening and value delivery',
      'newsletter': 'Craft an engaging email newsletter with valuable insights and clear CTAs',
      'cold_email': 'Write a personalized cold email that builds rapport and drives response',
      'cold_dm': 'Create a friendly, non-salesy DM that starts meaningful conversations',
      'blog_post': 'Write an informative blog post that provides value and drives engagement',
      'social_media': 'Create engaging social media content that resonates with the audience',
      'lead_list': 'Generate 100 targeted leads with relevant contact information and insights'
    };
    
    return prompts[category] || `Create compelling ${category} content for ${platform || 'multiple platforms'}`;
  };

  const handleGenerateContent = async (shortcut) => {
    try {
      if (shortcut.category === 'brand_ideas') {
        const categories = ['blog_post', 'social_media', 'newsletter', 'video_script', 'instagram_post'];
        await batchGenerate(categories, 10);
      } else if (shortcut.category === 'lead_list') {
        setSuccessMessage('🎯 Lead list generation started! You will receive 100 leads shortly.');
        await quickGenerate(shortcut.category, shortcut.platform, 'Generate 100 targeted leads');
      } else {
        const customPrompt = getDefaultPrompt(shortcut.category, shortcut.platform);
        await quickGenerate(shortcut.category, shortcut.platform, customPrompt);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  // ==================== GENERATION SHORTCUTS DATA ====================
  
  const generationShortcuts = [
    {
      id: 1,
      title: 'LinkedIn Post',
      icon: Linkedin,
      description: 'Create professional thought leadership content',
      color: 'from-blue-500 to-blue-600',
      emoji: '💼',
      category: 'linkedin_post',
      platform: 'linkedin'
    },
    {
      id: 2,
      title: 'Instagram Reel',
      icon: Instagram,
      description: 'Generate viral short-form video scripts',
      color: 'from-pink-500 to-purple-600',
      emoji: '🎥',
      category: 'instagram_reel',
      platform: 'instagram'
    },
    {
      id: 3,
      title: 'Instagram Carousel',
      icon: Layers,
      description: 'Design multi-slide educational posts',
      color: 'from-purple-500 to-pink-500',
      emoji: '📱',
      category: 'instagram_carousel',
      platform: 'instagram'
    },
    {
      id: 4,
      title: 'YouTube Short',
      icon: Youtube,
      description: 'Script attention-grabbing 60s videos',
      color: 'from-red-500 to-red-600',
      emoji: '📹',
      category: 'youtube_short',
      platform: 'youtube'
    },
    {
      id: 5,
      title: 'Newsletter',
      icon: Mail,
      description: 'Craft engaging email newsletters',
      color: 'from-teal-500 to-cyan-600',
      emoji: '📬',
      category: 'newsletter',
      platform: 'email'
    },
    {
      id: 6,
      title: 'Cold Email',
      icon: Mail,
      description: 'Write personalized outreach emails',
      color: 'from-green-500 to-emerald-600',
      emoji: '📧',
      category: 'cold_email',
      platform: 'email'
    },
    {
      id: 7,
      title: 'Cold DM',
      icon: MessageSquare,
      description: 'Generate Instagram/LinkedIn DMs',
      color: 'from-violet-500 to-purple-600',
      emoji: '💬',
      category: 'cold_dm',
      platform: 'social'
    },
    {
      id: 8,
      title: 'Lead List (100/day)',
      icon: Users,
      description: 'Auto-generate targeted prospect lists',
      color: 'from-orange-500 to-amber-600',
      emoji: '👥',
      category: 'lead_list',
      platform: null
    },
    {
      id: 9,
      title: 'Brand Idea Batch',
      icon: Lightbulb,
      description: 'Get 50+ content ideas instantly',
      color: 'from-yellow-400 to-orange-500',
      emoji: '💡',
      category: 'brand_ideas',
      platform: null
    }
  ];

  const quickStats = {
    totalGenerated: generationStats?.total_generated || 0,
    thisWeek: generationStats?.this_week || 0,
    thisMonth: generationStats?.this_month || 0,
    avgPerDay: generationStats?.avg_per_day || 0
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {floatingIcons.map((item, idx) => {
        const IconComponent = item.Icon;
        return (
          <div
            key={idx}
            className="absolute pointer-events-none"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              opacity: item.opacity,
            }}
          >
            <IconComponent size={item.size} className="text-yellow-200" />
          </div>
        );
      })}

      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Brain className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Brand Writer
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-200 to-yellow-300 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
              Products
            </button>
            <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              Contact
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold">
              8
            </div>
            <button className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-500/20 border-b border-blue-500/30 px-6 py-2 flex items-center gap-2">
            <Loader className="animate-spin" size={16} />
            <span className="text-sm">Generating content...</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/20 border-b border-green-500/30 px-6 py-2 flex items-center gap-2">
            <CheckCircle size={16} />
            <span className="text-sm">{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-2 flex items-center gap-2">
            <XCircle size={16} />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-800/30 backdrop-blur-md border-r border-slate-700/50 transition-transform duration-300 z-40 pt-20 lg:pt-0`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-yellow-200/20 to-pink-200/20 border border-yellow-300/30'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <Icon size={20} className={activeTab === item.id ? 'text-yellow-300' : ''} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Zap className="text-yellow-300" size={36} />
              Quick Generation Shortcuts
            </h1>
            <p className="text-slate-400 mb-6">Create content instantly with one click — choose your format and let AI do the work</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Total Generated</p>
                <p className="text-2xl font-bold text-yellow-300">{quickStats.totalGenerated}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">This Week</p>
                <p className="text-2xl font-bold text-blue-400">{quickStats.thisWeek}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-400">{quickStats.thisMonth}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Avg Per Day</p>
                <p className="text-2xl font-bold text-green-400">{quickStats.avgPerDay}</p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              Content Generators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generationShortcuts.map((shortcut) => {
                const IconComponent = shortcut.icon;
                return (
                  <button
                    key={shortcut.id}
                    onClick={() => handleGenerateContent(shortcut)}
                    disabled={loading}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-yellow-300/30 transition-all hover:shadow-xl hover:shadow-yellow-500/10 group text-left relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${shortcut.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${shortcut.color} rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                          {shortcut.emoji}
                        </div>
                        <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium">
                          {shortcut.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Plus size={20} className="text-yellow-300" />
                        {shortcut.title}
                      </h3>

                      <p className="text-slate-400 text-sm mb-4">{shortcut.description}</p>

                      <div className="flex items-center gap-2 text-yellow-300 font-semibold text-sm group-hover:gap-3 transition-all">
                        <span>Generate Now</span>
                        <Zap size={16} className="group-hover:rotate-12 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {batchStatus && (
            <section className="mb-8">
              <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border p-6 ${
                batchStatus === 'processing' ? 'border-blue-500/50' :
                batchStatus === 'completed' ? 'border-green-500/50' :
                'border-red-500/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {batchStatus === 'processing' && (
                      <>
                        <Loader className="animate-spin text-blue-400" size={24} />
                        <div>
                          <h3 className="font-bold text-lg">Batch Generation in Progress</h3>
                          <p className="text-sm text-slate-400">Creating multiple content pieces...</p>
                        </div>
                      </>
                    )}
                    {batchStatus === 'completed' && (
                      <>
                        <CheckCircle className="text-green-400" size={24} />
                        <div>
                          <h3 className="font-bold text-lg">Batch Generation Complete!</h3>
                          <p className="text-sm text-slate-400">All content has been generated successfully</p>
                        </div>
                      </>
                    )}
                    {batchStatus === 'failed' && (
                      <>
                        <XCircle className="text-red-400" size={24} />
                        <div>
                          <h3 className="font-bold text-lg">Batch Generation Failed</h3>
                          <p className="text-sm text-slate-400">Please try again or contact support</p>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setBatchStatus(null)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <History className="text-yellow-300" />
                Recent Generations
              </h2>
              {recentGenerationsData.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No generations yet. Start creating!</p>
              ) : (
                <div className="space-y-4">
                  {recentGenerationsData.slice(0, 4).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{item.category?.replace(/_/g, ' ').toUpperCase()}</p>
                          {item.platform && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                              {item.platform}
                            </span>
                          )}
                          {item.is_auto_generated && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs flex items-center gap-1">
                              <Zap size={12} />
                              Auto
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()} • {item.model_used || 'AI Model'}
                        </p>
                        {item.generation_time && (
                          <p className="text-xs text-slate-500 mt-1">
                            Generated in {item.generation_time.toFixed(2)}s
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => regenerateContent(item.id)}
                          className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-sm transition-all flex items-center gap-1"
                          disabled={loading}
                          title="Regenerate"
                        >
                          <Zap size={14} />
                          Regen
                        </button>
                        <button
                          onClick={() => convertToDraft(item.id)}
                          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-sm transition-all"
                          disabled={loading}
                        >
                          To Draft
                        </button>
                        <button
                          onClick={() => deleteGeneration(item.id)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition-all"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {recentGenerationsData.length > 4 && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className="w-full py-2 text-sm text-yellow-300 hover:text-yellow-200 transition-colors flex items-center justify-center gap-2"
                    >
                      View All Generations
                      <TrendingUp size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="text-yellow-300" />
                Pro Tips
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-400">💡</span>
                    Batch Generate Content
                  </p>
                  <p className="text-sm text-slate-400">Generate multiple posts at once and save them to drafts for the week ahead.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-lg border border-pink-500/20">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-pink-400">✨</span>
                    Use Brand Voice
                  </p>
                  <p className="text-sm text-slate-400">Set up your brand voice once and all content will match your unique style automatically.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-400">🚀</span>
                    Schedule Instantly
                  </p>
                  <p className="text-sm text-slate-400">After generating, schedule directly to your calendar with one click.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    Use Templates
                  </p>
                  <p className="text-sm text-slate-400">Save time by creating templates for your most frequent content types.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
              </p>
              <button 
                onClick={loadRecentGenerations}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default QuickGenShortcutsPage;