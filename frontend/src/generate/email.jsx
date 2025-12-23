import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Mail, AlertCircle, Eye, Target } from 'lucide-react';
import GeneratedContentCard from '../components/generation/GeneratedContentCard';
import EditContentModal from '../components/generation/EditContentModal';
import ImprovePromptModal from '../components/generation/ImprovePromptModal';
import PreviewModal from '../previews/PreviewModal';
// GeneratedContentCard Component
const GeneratedContentCard = ({ content, onEdit, onImprove, onPreview }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Mail size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{content.platform}</h3>
            <p className="text-sm text-slate-400">{content.category}</p>
          </div>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(content.created_at).toLocaleString()}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        {content.subject && (
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">Subject Line</label>
            <p className="text-white font-medium">{content.subject}</p>
          </div>
        )}
        <div>
          <label className="text-xs text-slate-400 font-semibold mb-1 block">Email Body</label>
          <div className="bg-slate-700/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
              {content.body}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPreview}
          className="flex-1 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Eye size={18} />
          Preview
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-semibold transition-all"
        >
          Edit
        </button>
        <button
          onClick={onImprove}
          className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Target size={18} />
          Improve
        </button>
      </div>
    </div>
  );
};

// EditContentModal Component
const EditContentModal = ({ content, platform, onSave, onClose }) => {
  const [editedContent, setEditedContent] = useState({
    subject: content.subject || '',
    body: content.body || ''
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit {platform} Content</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {content.subject !== undefined && (
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-300">Subject Line</label>
                <input
                  type="text"
                  value={editedContent.subject}
                  onChange={(e) => setEditedContent({...editedContent, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">Content</label>
              <textarea
                value={editedContent.body}
                onChange={(e) => setEditedContent({...editedContent, body: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="12"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold">
              Cancel
            </button>
            <button onClick={() => onSave(editedContent)} className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ImprovePromptModal Component
const ImprovePromptModal = ({ onSubmit, onClose, isProcessing = false }) => {
  const [modifiers, setModifiers] = useState({
    tone: '',
    length: '',
    cta: false,
    brand_heavy: false,
    platform_native: true,
    extra_instruction: ''
  });

  const update = (key, value) => setModifiers(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-lg flex items-center justify-center">
                <Target size={20} className="text-white" />
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
                  className="w-5 h-5 rounded"
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
                  className="w-5 h-5 rounded"
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
                  className="w-5 h-5 rounded"
                />
                <div>
                  <span className="font-medium text-white">Platform-Native Style</span>
                  <p className="text-sm text-slate-400">Optimize for the target platform</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">Extra Instructions (Optional)</label>
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
              onClick={() => onSubmit(modifiers)}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Sparkles size={20} className="animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Target size={20} />
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

// PreviewModal Component
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
              <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
                <div className="bg-slate-50 p-4 border-b">
                  <p className="text-xs text-slate-600 mb-1">Subject:</p>
                  <p className="font-semibold text-slate-900">{content.subject}</p>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {content.body}
                    </p>
                  </div>
                </div>
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

// Main EmailGeneratorPage Component
const EmailGeneratorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [activeTab, setActiveTab] = useState('autogen');
  
  const [contentType, setContentType] = useState('newsletter');
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
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'cold-email', label: 'Cold Email' },
    { value: 'promo', label: 'Promotional Email' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'follow-up', label: 'Follow-up Email' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = {
        id: Date.now(),
        platform: 'Email',
        category: contentType,
        subject: `Exciting Updates: ${topic}`,
        body: `Dear valued subscriber,\n\nWe're thrilled to share some exciting news about ${topic}.\n\nOur team has been working hard to bring you the best experience possible. Here's what you can expect:\n\n• Enhanced features tailored for ${audience || 'our customers'}\n• New opportunities to ${goal || 'engage with our content'}\n• Exclusive insights you won't find anywhere else\n\n${customInstruction ? customInstruction + '\n\n' : ''}Thank you for being part of our community!\n\nBest regards,\nThe Team`,
        created_at: new Date().toISOString(),
      };

      setGeneratedContent(mockContent);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async (modifiers) => {
    setIsImproving(true);
    try {
      // Simulate API call with modifiers
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let improvedBody = generatedContent.body;
      
      if (modifiers.length === 'shorter') {
        improvedBody = improvedBody.split('\n\n').slice(0, 3).join('\n\n');
      } else if (modifiers.length === 'longer') {
        improvedBody += '\n\nP.S. We have even more exciting updates coming soon!';
      }
      
      if (modifiers.cta) {
        improvedBody += '\n\n👉 Click here to learn more and take action today!';
      }
      
      if (modifiers.extra_instruction) {
        improvedBody += `\n\n${modifiers.extra_instruction}`;
      }

      setGeneratedContent({
        ...generatedContent,
        body: improvedBody,
        subject: modifiers.tone ? `[${modifiers.tone.toUpperCase()}] ${generatedContent.subject}` : generatedContent.subject
      });
      
      setShowImproveModal(false);
    } catch (error) {
      console.error('Improvement error:', error);
      alert('Failed to improve content. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleSaveEdit = (editedContent) => {
    setGeneratedContent({
      ...generatedContent,
      subject: editedContent.subject,
      body: editedContent.body
    });
    setEditingContent(null);
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
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Mail size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Email Generator</h1>
                <p className="text-slate-400">Create compelling newsletters and marketing emails</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <AlertCircle size={16} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Subject line critical • Preheader text • Mobile-optimized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6">Content Settings</h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Email Type</label>
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
                    placeholder="e.g., Monthly product updates and insights"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Existing customers, prospects"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Goal</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Conversions, engagement"
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
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate Email
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
                  <Mail size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">No content generated yet</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to create your email</p>
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
          platform="Email"
          onSave={handleSaveEdit}
          onClose={() => setEditingContent(null)}
        />
      )}

      {showImproveModal && (
        <ImprovePromptModal
          onSubmit={handleImprove}
          onClose={() => setShowImproveModal(false)}
          isProcessing={isImproving}
        />
      )}

      {showPreviewModal && generatedContent && (
        <PreviewModal
          content={generatedContent}
          platform="Email"
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default EmailGeneratorPage;