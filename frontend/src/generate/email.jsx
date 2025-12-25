import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Mail, AlertCircle } from 'lucide-react';

const EmailGeneratorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('autogen');
  
  // Generation state
  const [contentType, setContentType] = useState('promotional');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    { value: 'promotional', label: 'Promotional Email' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'welcome', label: 'Welcome Series' },
    { value: 'abandoned', label: 'Abandoned Cart' },
    { value: 'announcement', label: 'Announcement' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const mockContent = {
        id: Date.now(),
        platform: 'Email',
        category: contentType,
        brand_id: 'BRAND_ID',
        subject: `${topic} - Exclusive Offer Inside!`,
        body: `Dear Valued Customer,

We're excited to share this special opportunity with you regarding ${topic}.

${audience ? `As one of our ${audience}, you're getting early access to this exclusive offer.` : 'You\'re getting early access to this exclusive offer.'}

${goal ? `Our goal is simple: ${goal}. That's why we've crafted this special promotion just for you.` : ''}

Here's what you can expect:
• Premium quality products at unbeatable prices
• Fast and reliable shipping
• 24/7 customer support

${customInstruction || 'Don\'t miss out on this limited-time opportunity!'}

Click the button below to explore our special offers and start saving today.

[Shop Now]

Best regards,
The Team`,
        created_at: new Date().toISOString(),
      };

      setGeneratedContent(mockContent);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Floating Background Icons */}
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

      {/* Header */}
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
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 relative z-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Mail size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Email Content Generator</h1>
                <p className="text-slate-400">Create compelling email campaigns and newsletters</p>
              </div>
            </div>

            {/* Constraints Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <AlertCircle size={16} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Subject line optimization • Mobile-friendly • Clear CTA placement</span>
            </div>
          </div>

          {/* Generator Form */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6">Content Settings</h2>

                {/* Content Type Selector */}
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

                {/* Topic Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Black Friday Sale Announcement"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* Audience Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Loyal customers, subscribers"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* Goal Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Goal</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Increase click-through rate, boost sales"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* Custom Instruction */}
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

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

            {/* Output Panel */}
            <div>
              {generatedContent ? (
                <GeneratedContentCard content={generatedContent} />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 border-dashed p-12 text-center">
                  <Mail size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">No content generated yet</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to create your email</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

// GeneratedContentCard Component (embedded to avoid import issues)
const GeneratedContentCard = ({ content }) => {
  const [showImprove, setShowImprove] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-yellow-300/30 transition-all p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-2xl">
              📧
            </div>
            <div>
              <h3 className="font-bold text-lg">{content.platform}</h3>
              <p className="text-sm text-slate-400">{content.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={14} />
            <span>{new Date(content.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Subject Line */}
        {content.subject && (
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-400 font-semibold mb-1">Subject Line:</p>
            <p className="text-blue-300 font-medium">{content.subject}</p>
          </div>
        )}

        {/* Content Preview */}
        <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
          <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
            {content.body || content.text || 'No content'}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium"
          >
            <FileText size={16} />
            Edit
          </button>

          <button
            onClick={() => alert('Regenerating content...')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm font-medium"
          >
            <Zap size={16} />
            Regenerate
          </button>

          <button
            onClick={() => setShowImprove(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all text-sm font-medium"
          >
            <Sparkles size={16} />
            Improve
          </button>

          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm font-medium"
          >
            <Mail size={16} />
            Preview
          </button>
        </div>
      </div>

      {/* Simple Modals */}
      {showEdit && <SimpleModal title="Edit Content" onClose={() => setShowEdit(false)} content={content} />}
      {showImprove && <SimpleModal title="Improve Content" onClose={() => setShowImprove(false)} content={content} />}
      {showPreview && <PreviewModalSimple content={content} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// Simple Modal Component
const SimpleModal = ({ title, onClose, content }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
            <X size={24} />
          </button>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4">
          <p className="text-slate-300">{content.body || content.text}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Simple Preview Modal
const PreviewModalSimple = ({ content, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Email Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
            <X size={24} />
          </button>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
          <div className="bg-slate-50 p-4 border-b">
            <p className="text-xs text-slate-600 mb-1">Subject:</p>
            <p className="font-semibold text-slate-900">{content.subject}</p>
          </div>
          <div className="p-6">
            <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
              {content.body}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
};

export default EmailGeneratorPage;