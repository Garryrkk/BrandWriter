import React, { useState, useEffect } from 'react';
import { FileText, Zap, Sparkles, Plus, Lightbulb, Loader, CheckCircle, XCircle, X, TrendingUp, History, Linkedin, Instagram, Youtube, Mail, Layers, MessageSquare, Users } from 'lucide-react';
import { mainApi, instaApi } from '../api/client';

<<<<<<< HEAD
const QuickGenShortcutsPage = () => {
=======
const Generate = () => {
>>>>>>> 49b8c9ceae342615158baec52c564e659a20fd93
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [generationStats, setGenerationStats] = useState(null);
  const [recentGenerationsData, setRecentGenerationsData] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [brandId, setBrandId] = useState(localStorage.getItem('active_brand_id'));

  useEffect(() => {
    loadActiveBrand();
  }, []);

  useEffect(() => {
    if (brandId) {
      loadGenerationStats();
      loadRecentGenerations();
    }
  }, [brandId]);

  const loadActiveBrand = async () => {
    try {
      const brand = await mainApi.brands.getActive();
      if (brand && brand.id) {
        setActiveBrand(brand);
        setBrandId(brand.id);
        localStorage.setItem('active_brand_id', brand.id);
      }
    } catch (err) {
      console.error('Failed to load active brand:', err);
    }
  };

  const loadGenerationStats = async () => {
    if (!brandId) return;
    try {
      const stats = await mainApi.generations.getStats(brandId);
      setGenerationStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadRecentGenerations = async () => {
    if (!brandId) return;
    try {
      const data = await mainApi.generations.list(brandId, 1, 10);
      setRecentGenerationsData(data.generations || []);
    } catch (err) {
      console.error('Failed to load recent generations:', err);
    }
  };

  const quickGenerate = async (category, platform = null, customPrompt = null) => {
    if (!brandId) {
      setError('No brand selected. Please create or select a brand first.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await mainApi.generations.quickGenerate(brandId, category, platform, customPrompt);
      setSuccessMessage(`Successfully generated ${category}!`);
      
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

  const batchGenerate = async (categories, countPerCategory = 5) => {
    if (!brandId) {
      setError('No brand selected. Please create or select a brand first.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const result = await mainApi.generations.batchGenerate(brandId, categories);
      setSuccessMessage(`Successfully generated ${result.total_generated} pieces of content!`);
      
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

  const addFeedback = async (generationId, rating, comments = null) => {
    try {
      await mainApi.generations.addFeedback(generationId, rating, comments);
      setSuccessMessage('Feedback submitted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const convertToDraft = async (generationId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mainApi.generations.convertToDraft(generationId);
      setSuccessMessage('Successfully converted to draft!');
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGeneration = async (generationId) => {
    try {
      await mainApi.generations.delete(generationId);
      setSuccessMessage('Generation deleted successfully!');
      await loadRecentGenerations();
    } catch (err) {
      setError(err.message);
    }
  };

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

  const handleGenerateContent = async (shortcut) => {
    try {
      if (shortcut.category === 'brand_ideas') {
        await batchGenerate(['blog_post', 'social_media', 'newsletter', 'video_script'], 10);
      } else {
        await quickGenerate(shortcut.category, shortcut.platform);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const quickStats = {
    totalGenerated: generationStats?.total_generated || 247,
    thisWeek: generationStats?.this_week || 89,
    thisMonth: generationStats?.this_month || 247,
    avgPerDay: generationStats?.avg_per_day || 35
  };

  return (
    <div className="space-y-8">
      {/* Status Messages */}
      {loading && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-6 py-3 flex items-center gap-2">
          <Loader className="animate-spin" size={16} />
          <span className="text-sm">Generating content...</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-6 py-3 flex items-center gap-2">
          <CheckCircle size={16} />
          <span className="text-sm">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-6 py-3 flex items-center gap-2">
          <XCircle size={16} />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
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
                        <p className="font-semibold">{item.category?.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
            <p className="text-sm text-slate-400">
              We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
            </p>
          </footer>
    </div>
  );
};

<<<<<<< HEAD
export default QuickGenShortcutsPage;
=======
export default Generate;
>>>>>>> 49b8c9ceae342615158baec52c564e659a20fd93
