import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import GeneratedContentCard from '../components/generation/GeneratedContentCard';
import EditContentModal from '../components/generation/EditContentModal';
import ImprovePromptModal from '../components/generation/ImprovePromptModal';
import PreviewModal from '../previews/PreviewModal';

// Mock API function (replace with actual API call)
const generateContent = async (params) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    content_id: Date.now(),
    title: 'The Future of Remote Work in 2025',
    text: `The landscape of remote work has transformed dramatically over the past few years. As we step into 2025, organizations worldwide are reimagining how they approach distributed teams and flexible work arrangements.

The shift to remote work was once seen as a temporary solution, but it has now become a permanent fixture in the modern workplace. Companies that once resisted remote policies are now embracing hybrid models, recognizing the benefits of flexibility and access to global talent.

One of the most significant changes has been the evolution of collaboration tools. Modern platforms now offer seamless integration, making it easier than ever for teams to work together regardless of their physical location. Virtual reality meetings are becoming more common, providing a sense of presence that was previously missing from remote interactions.

However, challenges remain. Organizations must navigate issues of work-life balance, maintaining company culture, and ensuring equitable treatment for both remote and in-office employees. The most successful companies are those that have developed clear policies and invested in the technology and training needed to support their distributed workforce.

Looking ahead, the future of remote work will likely be defined by flexibility, intentionality, and a focus on outcomes rather than hours logged. As technology continues to advance and attitudes shift, we can expect to see even more innovative approaches to how and where we work.`
  };
};

const MediumGeneratorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('autogen');
  
  const [contentType, setContentType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [editingContent, setEditingContent] = useState(null);
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
    { Icon: Cpu, top: '25%', right: '20%', size: 28, opacity: 0.08 },
    { Icon: Network, top: '45%', left: '10%', size: 36, opacity: 0.12 },
    { Icon: Bot, top: '60%', right: '15%', size: 30, opacity: 0.1 },
    { Icon: Sparkles, top: '15%', right: '40%', size: 24, opacity: 0.09 },
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

  const contentTypes = [
    { value: 'blog', label: 'Blog Article' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'opinion', label: 'Opinion Piece' },
    { value: 'tutorial', label: 'Tutorial Article' },
    { value: 'listicle', label: 'Listicle' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateContent({
        platform: 'medium',
        category: contentType,
        brand_id: 'BRAND_ID',
        prompt: `Topic: ${topic}\nAudience: ${audience}\nGoal: ${goal}\n${customInstruction ? `Additional: ${customInstruction}` : ''}`
      });

      setGeneratedContent({
        id: result.content_id || Date.now(),
        platform: 'Medium',
        category: contentType,
        title: result.title || '',
        body: result.text,
        text: result.text,
        created_at: new Date().toISOString(),
        brand_id: 'BRAND_ID'
      });
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = (editedContent) => {
    setGeneratedContent({
      ...generatedContent,
      title: editedContent.title,
      body: editedContent.body,
      text: editedContent.body
    });
    setEditingContent(null);
  };

  const handleImproveContent = async (modifiers) => {
    setIsImproving(true);
    try {
      const improvePrompt = `
        Original content: ${generatedContent.body}
        
        Improvement parameters:
        - Tone: ${modifiers.tone || 'default'}
        - Length: ${modifiers.length || 'default'}
        - Add CTA: ${modifiers.cta ? 'yes' : 'no'}
        - Brand Heavy: ${modifiers.brand_heavy ? 'yes' : 'no'}
        - Platform Native: ${modifiers.platform_native ? 'yes' : 'no'}
        ${modifiers.extra_instruction ? `- Extra: ${modifiers.extra_instruction}` : ''}
      `;

      const result = await generateContent({
        platform: 'medium',
        category: contentType,
        brand_id: 'BRAND_ID',
        prompt: improvePrompt
      });

      setGeneratedContent({
        ...generatedContent,
        title: result.title || generatedContent.title,
        body: result.text,
        text: result.text
      });
      
      setShowImproveModal(false);
    } catch (error) {
      console.error('Improvement error:', error);
      alert('Failed to improve content. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

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
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Medium Article Generator</h1>
                <p className="text-slate-400">Create engaging long-form content for Medium</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/20 border border-slate-500/30 rounded-lg">
              <AlertCircle size={16} className="text-slate-400" />
              <span className="text-slate-400 text-sm font-medium">Title + body separation • Readability focus • 7-10 min read ideal</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6">Content Settings</h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  >
                    {contentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The future of remote work in 2025"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Tech professionals, entrepreneurs"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Goal</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Thought leadership, education"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Additional Instructions (Optional)</label>
                  <textarea
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    placeholder="Any specific requirements..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                    rows="4"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-bold hover:shadow-xl hover:shadow-slate-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate Medium Article
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              {generatedContent ? (
                <GeneratedContentCard 
                  content={generatedContent}
                />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 border-dashed p-12 text-center">
                  <BookOpen size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">No content generated yet</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to create your Medium article</p>
                </div>
              )}
            </div>
          </div>

          <footer className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
            </p>
          </footer>
        </main>
      </div>

      {editingContent && (
        <EditContentModal
          content={editingContent}
          platform="Medium"
          onSave={handleSaveEdit}
          onClose={() => setEditingContent(null)}
        />
      )}

      {showImproveModal && generatedContent && (
        <ImprovePromptModal
          onSubmit={handleImproveContent}
          onClose={() => setShowImproveModal(false)}
          isProcessing={isImproving}
        />
      )}

      {showPreviewModal && generatedContent && (
        <PreviewModal
          content={generatedContent}
          platform="Medium"
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default MediumGeneratorPage;