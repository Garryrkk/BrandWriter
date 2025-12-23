import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, BookOpen, AlertCircle, Edit, Eye, RefreshCw } from 'lucide-react';
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

const ImprovePromptModal = ({ onSubmit, onClose, isProcessing = false }) => {
  const [modifiers, setModifiers] = useState({
    tone: '',
    length: '',
    cta: false,
    brand_heavy: false,
    platform_native: true,
    extra_instruction: ''
  });

  const update = (key, value) =>
    setModifiers(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(modifiers);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-lg flex items-center justify-center">
                <RefreshCw size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Improve Content</h2>
                <p className="text-sm text-slate-400">Customize regeneration parameters</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">Tone</label>
              <select
                value={modifiers.tone}
                onChange={e => update('tone', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
              >
                <option value="">Default (Use Brand Voice)</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="persuasive">Persuasive</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">Length</label>
              <div className="grid grid-cols-3 gap-3">
                {['shorter', '', 'longer'].map((length, idx) => (
                  <button
                    key={idx}
                    onClick={() => update('length', length)}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      modifiers.length === length
                        ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {length === 'shorter' ? 'Shorter' : length === 'longer' ? 'Longer' : 'Default'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={modifiers.cta}
                  onChange={e => update('cta', e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-600 border-slate-500"
                />
                <div>
                  <span className="font-medium text-white">Strong Call-to-Action</span>
                  <p className="text-sm text-slate-400">Add a compelling CTA at the end</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={modifiers.brand_heavy}
                  onChange={e => update('brand_heavy', e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-600 border-slate-500"
                />
                <div>
                  <span className="font-medium text-white">Brand Heavy</span>
                  <p className="text-sm text-slate-400">Emphasize brand voice and messaging</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={modifiers.platform_native}
                  onChange={e => update('platform_native', e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-600 border-slate-500"
                />
                <div>
                  <span className="font-medium text-white">Platform-Native Style</span>
                  <p className="text-sm text-slate-400">Optimize for the target platform</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Extra Instructions (Optional)
              </label>
              <textarea
                value={modifiers.extra_instruction}
                onChange={e => update('extra_instruction', e.target.value)}
                placeholder="Add any specific requirements or changes you'd like..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="4"
              />
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
              <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-blue-400 font-semibold mb-1">AI Enhancement</p>
                <p className="text-slate-400 text-sm">
                  Your content will be regenerated with these parameters while maintaining your brand voice and style.
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Improve Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewModal = ({ content, platform, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Content Preview</h2>
                <p className="text-sm text-slate-400">
                  Platform: <span className="text-yellow-300 font-semibold">{platform}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
              <div className="max-w-3xl mx-auto bg-white rounded-lg p-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">
                  {content.title}
                </h1>
                <div className="flex items-center gap-3 mb-8 pb-6 border-b">
                  <div className="w-12 h-12 bg-slate-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-slate-900">Your Name</p>
                    <p className="text-sm text-slate-600">5 min read · Just now</p>
                  </div>
                </div>
                <article className="prose prose-lg max-w-none">
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {content.body}
                  </p>
                </article>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditContentModal = ({ content, platform, onSave, onClose }) => {
  const [editedContent, setEditedContent] = useState({
    title: content.title || '',
    body: content.body || content.text || ''
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <Edit size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Content</h2>
                <p className="text-sm text-slate-400">Platform: {platform}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">Title</label>
              <input
                type="text"
                value={editedContent.title}
                onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">Content</label>
              <textarea
                value={editedContent.body}
                onChange={(e) => setEditedContent(prev => ({ ...prev, body: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="20"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedContent)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GeneratedContentCard = ({ content, onEdit, onImprove, onPreview }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{content.title}</h3>
          <p className="text-slate-400 text-sm">
            Generated on {new Date(content.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-700/50 rounded-full text-sm font-medium">
          {content.platform}
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
        <p className="text-slate-300 whitespace-pre-wrap">{content.body}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Edit size={18} />
          Edit
        </button>
        <button
          onClick={onImprove}
          className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Improve
        </button>
        <button
          onClick={onPreview}
          className="flex-1 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Eye size={18} />
          Preview
        </button>
      </div>
    </div>
  );
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
        created_at: new Date().toISOString(),
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
      body: editedContent.body
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
                  onEdit={() => setEditingContent(generatedContent)}
                  onImprove={() => setShowImproveModal(true)}
                  onPreview={() => setShowPreviewModal(true)}
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