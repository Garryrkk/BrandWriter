import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Save, Plus, Trash2, AlertCircle, Check, Settings, Target, Lightbulb, Key, Users } from 'lucide-react';

const BrandVoicePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('brandvoice');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Floating icons data
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

  const [brandVoice, setBrandVoice] = useState({
    brandName: 'Brand X',
    tone: ['Professional', 'Friendly', 'Authoritative'],
    personality: 'Innovative thought leader with a human touch',
    writingStyle: {
      sentenceLength: 'Mixed',
      formality: 'Semi-formal',
      vocabulary: 'Industry-specific with accessible explanations',
      formatting: 'Short paragraphs, bullet points, emojis sparingly'
    },
    messagingPillars: [
      'Innovation drives success',
      'Simplicity is powerful',
      'Community-first approach',
      'Data-informed decisions'
    ],
    keywordsToUse: ['innovation', 'growth', 'scalable', 'data-driven', 'community', 'transform'],
    keywordsToAvoid: ['revolutionary', 'game-changer', 'disruptive', 'synergy', 'leverage'],
    targetAudience: {
      primary: 'B2B SaaS founders and executives',
      secondary: 'Marketing professionals and content creators',
      demographics: 'Ages 28-45, tech-savvy, growth-focused',
      painPoints: 'Time management, content consistency, scaling content'
    },
    seedCorpus: [
      { title: 'Top Performing Post', content: 'The biggest mistake I see founders make is trying to do everything...', engagement: '2.4K likes' },
      { title: 'Newsletter #12', content: 'This week we\'re diving into why most content strategies fail...', engagement: '18% open rate' },
      { title: 'LinkedIn Article', content: 'Data shows that 73% of B2B buyers prefer educational content...', engagement: '156 comments' }
    ],
    aiBehavior: {
      creativity: 75,
      formality: 60,
      emojiUsage: 30,
      hashtagCount: 3,
      ctaStyle: 'Soft ask with value proposition',
      contentLength: 'Medium (150-250 words)'
    }
  });

  const [newPillar, setNewPillar] = useState('');
  const [newKeywordUse, setNewKeywordUse] = useState('');
  const [newKeywordAvoid, setNewKeywordAvoid] = useState('');

  const toneOptions = ['Professional', 'Friendly', 'Authoritative', 'Casual', 'Humorous', 'Inspirational', 'Educational', 'Conversational'];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    console.log('Brand voice saved:', brandVoice);
  };

  const toggleTone = (tone) => {
    setBrandVoice(prev => ({
      ...prev,
      tone: prev.tone.includes(tone)
        ? prev.tone.filter(t => t !== tone)
        : [...prev.tone, tone]
    }));
  };

  const addPillar = () => {
    if (newPillar.trim()) {
      setBrandVoice(prev => ({
        ...prev,
        messagingPillars: [...prev.messagingPillars, newPillar.trim()]
      }));
      setNewPillar('');
    }
  };

  const removePillar = (index) => {
    setBrandVoice(prev => ({
      ...prev,
      messagingPillars: prev.messagingPillars.filter((_, i) => i !== index)
    }));
  };

  const addKeywordUse = () => {
    if (newKeywordUse.trim()) {
      setBrandVoice(prev => ({
        ...prev,
        keywordsToUse: [...prev.keywordsToUse, newKeywordUse.trim()]
      }));
      setNewKeywordUse('');
    }
  };

  const removeKeywordUse = (index) => {
    setBrandVoice(prev => ({
      ...prev,
      keywordsToUse: prev.keywordsToUse.filter((_, i) => i !== index)
    }));
  };

  const addKeywordAvoid = () => {
    if (newKeywordAvoid.trim()) {
      setBrandVoice(prev => ({
        ...prev,
        keywordsToAvoid: [...prev.keywordsToAvoid, newKeywordAvoid.trim()]
      }));
      setNewKeywordAvoid('');
    }
  };

  const removeKeywordAvoid = (index) => {
    setBrandVoice(prev => ({
      ...prev,
      keywordsToAvoid: prev.keywordsToAvoid.filter((_, i) => i !== index)
    }));
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Mic className="text-yellow-300" size={36} />
                  Brand Voice Settings
                </h1>
                <p className="text-slate-400 mb-6">Define how AI speaks for <span className="text-yellow-300 font-semibold">{brandVoice.brandName}</span></p>
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center gap-2"
              >
                <Save size={20} />
                Save Brand Voice
              </button>
            </div>

            {/* Success Message */}
            {savedSuccess && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
                <Check className="text-green-400" size={20} />
                <span className="text-green-400 font-semibold">Brand voice saved successfully!</span>
              </div>
            )}

            {/* Info Alert */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-blue-400 font-semibold mb-1">Admin-Only Feature</p>
                <p className="text-slate-400 text-sm">These settings control how AI generates content for your brand. Changes affect all future auto-generated content.</p>
              </div>
            </div>
          </div>

          {/* Tone & Personality */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mic className="text-yellow-300" />
                🎤 Tone & Personality
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">Select Brand Tones (Multiple)</label>
                <div className="flex flex-wrap gap-3">
                  {toneOptions.map(tone => (
                    <button
                      key={tone}
                      onClick={() => toggleTone(tone)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        brandVoice.tone.includes(tone)
                          ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-300">Personality Description</label>
                <textarea
                  value={brandVoice.personality}
                  onChange={(e) => setBrandVoice(prev => ({ ...prev, personality: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                  rows="3"
                  placeholder="Describe your brand's personality..."
                />
              </div>
            </div>
          </section>

          {/* Writing Style */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-yellow-300" />
                ✍️ Writing Style
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Sentence Length</label>
                  <select
                    value={brandVoice.writingStyle.sentenceLength}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      writingStyle: { ...prev.writingStyle, sentenceLength: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  >
                    <option>Short</option>
                    <option>Mixed</option>
                    <option>Long</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Formality Level</label>
                  <select
                    value={brandVoice.writingStyle.formality}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      writingStyle: { ...prev.writingStyle, formality: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  >
                    <option>Casual</option>
                    <option>Semi-formal</option>
                    <option>Formal</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Vocabulary Style</label>
                  <input
                    type="text"
                    value={brandVoice.writingStyle.vocabulary}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      writingStyle: { ...prev.writingStyle, vocabulary: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                    placeholder="e.g., Industry-specific with accessible explanations"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Formatting Preferences</label>
                  <input
                    type="text"
                    value={brandVoice.writingStyle.formatting}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      writingStyle: { ...prev.writingStyle, formatting: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                    placeholder="e.g., Short paragraphs, bullet points, emojis sparingly"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Messaging Pillars */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="text-yellow-300" />
                🧩 Messaging Pillars
              </h2>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPillar()}
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                    placeholder="Add a new messaging pillar..."
                  />
                  <button
                    onClick={addPillar}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {brandVoice.messagingPillars.map((pillar, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 group hover:border-yellow-300/30 transition-all"
                  >
                    <span className="font-medium">{pillar}</span>
                    <button
                      onClick={() => removePillar(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Keywords */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keywords to Use */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Key className="text-green-400" />
                  🔑 Keywords to Use
                </h2>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeywordUse}
                      onChange={(e) => setNewKeywordUse(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeywordUse()}
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-300/50 transition-all text-sm"
                      placeholder="Add keyword..."
                    />
                    <button
                      onClick={addKeywordUse}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {brandVoice.keywordsToUse.map((keyword, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-2 border border-green-500/30"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeywordUse(index)}
                        className="hover:text-green-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords to Avoid */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Key className="text-red-400" />
                  🔑 Keywords to Avoid
                </h2>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeywordAvoid}
                      onChange={(e) => setNewKeywordAvoid(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeywordAvoid()}
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-300/50 transition-all text-sm"
                      placeholder="Add keyword..."
                    />
                    <button
                      onClick={addKeywordAvoid}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {brandVoice.keywordsToAvoid.map((keyword, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm font-medium flex items-center gap-2 border border-red-500/30"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeywordAvoid(index)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Target Audience */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-yellow-300" />
                🎯 Target Audience
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Primary Audience</label>
                  <input
                    type="text"
                    value={brandVoice.targetAudience.primary}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, primary: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Secondary Audience</label>
                  <input
                    type="text"
                    value={brandVoice.targetAudience.secondary}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, secondary: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Demographics</label>
                  <input
                    type="text"
                    value={brandVoice.targetAudience.demographics}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, demographics: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Key Pain Points</label>
                  <input
                    type="text"
                    value={brandVoice.targetAudience.painPoints}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, painPoints: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seed Corpus View */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="text-yellow-300" />
                📚 Seed Corpus View
              </h2>

              <div className="space-y-4">
                {brandVoice.seedCorpus.map((item, index) => (
                  <div
                    key={index}
                    className="p-5 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                        {item.engagement}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{item.content}</p>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all font-semibold flex items-center justify-center gap-2">
                <Plus size={20} />
                Add More Corpus Examples
              </button>
            </div>
          </section>

          {/* AI Behavior Settings */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings className="text-yellow-300" />
                ⚙️ AI Behavior Settings
              </h2>

              <div className="space-y-6">
                {/* Creativity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-300">Creativity Level</label>
                    <span className="text-yellow-300 font-bold">{brandVoice.aiBehavior.creativity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brandVoice.aiBehavior.creativity}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      aiBehavior: { ...prev.aiBehavior, creativity: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Conservative</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Formality Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-300">Formality Level</label>
                    <span className="text-blue-300 font-bold">{brandVoice.aiBehavior.formality}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brandVoice.aiBehavior.formality}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      aiBehavior: { ...prev.aiBehavior, formality: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Casual</span>
                    <span>Professional</span>
                    <span>Formal</span>
                  </div>
                </div>

                {/* Emoji Usage Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-300">Emoji Usage</label>
                    <span className="text-pink-300 font-bold">{brandVoice.aiBehavior.emojiUsage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brandVoice.aiBehavior.emojiUsage}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      aiBehavior: { ...prev.aiBehavior, emojiUsage: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>None</span>
                    <span>Moderate</span>
                    <span>Frequent</span>
                  </div>
                </div>

                {/* Hashtag Count */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Average Hashtag Count</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={brandVoice.aiBehavior.hashtagCount}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      aiBehavior: { ...prev.aiBehavior, hashtagCount: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* CTA Style */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Call-to-Action Style</label>
                  <select
                    value={brandVoice.aiBehavior.ctaStyle}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      aiBehavior: { ...prev.aiBehavior, ctaStyle: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  >
                    <option>Soft ask with value proposition</option>
                    <option>Direct call to action</option>
                    <option>Question-based engagement</option>
                    <option>No CTA (informational only)</option>
                  </select>
                </div>

                {/* Content Length */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Preferred Content Length</label>
                  <select
                    value={brandVoice.aiBehavior.contentLength}
                    onChange={(e) => setBrandVoice(prev => ({
                      ...prev,
                      aiBehavior: { ...prev.aiBehavior, contentLength: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  >
                    <option>Short (50-100 words)</option>
                    <option>Medium (150-250 words)</option>
                    <option>Long (300-500 words)</option>
                    <option>Very Long (500+ words)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Save Button (Bottom) */}
          <div className="sticky bottom-6 z-20">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-3"
            >
              <Save size={24} />
              Save Brand Voice Settings
            </button>
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

export default BrandVoicePage;
