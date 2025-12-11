import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Plus, Linkedin, Instagram, Youtube, Mail, MessageSquare, Users, Lightbulb, Image, Layers } from 'lucide-react';

const QuickGenShortcutsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('autogen');

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

  const generationShortcuts = [
    {
      id: 1,
      title: 'LinkedIn Post',
      icon: Linkedin,
      description: 'Create professional thought leadership content',
      color: 'from-blue-500 to-blue-600',
      emoji: '💼',
      category: 'Social Media'
    },
    {
      id: 2,
      title: 'Instagram Reel',
      icon: Instagram,
      description: 'Generate viral short-form video scripts',
      color: 'from-pink-500 to-purple-600',
      emoji: '🎥',
      category: 'Social Media'
    },
    {
      id: 3,
      title: 'Instagram Carousel',
      icon: Layers,
      description: 'Design multi-slide educational posts',
      color: 'from-purple-500 to-pink-500',
      emoji: '📱',
      category: 'Social Media'
    },
    {
      id: 4,
      title: 'YouTube Short',
      icon: Youtube,
      description: 'Script attention-grabbing 60s videos',
      color: 'from-red-500 to-red-600',
      emoji: '📹',
      category: 'Video Content'
    },
    {
      id: 5,
      title: 'Newsletter',
      icon: Mail,
      description: 'Craft engaging email newsletters',
      color: 'from-teal-500 to-cyan-600',
      emoji: '📬',
      category: 'Email Marketing'
    },
    {
      id: 6,
      title: 'Cold Email',
      icon: Mail,
      description: 'Write personalized outreach emails',
      color: 'from-green-500 to-emerald-600',
      emoji: '📧',
      category: 'Email Marketing'
    },
    {
      id: 7,
      title: 'Cold DM',
      icon: MessageSquare,
      description: 'Generate Instagram/LinkedIn DMs',
      color: 'from-violet-500 to-purple-600',
      emoji: '💬',
      category: 'Outreach'
    },
    {
      id: 8,
      title: 'Lead List (100/day)',
      icon: Users,
      description: 'Auto-generate targeted prospect lists',
      color: 'from-orange-500 to-amber-600',
      emoji: '👥',
      category: 'Lead Generation'
    },
    {
      id: 9,
      title: 'Brand Idea Batch',
      icon: Lightbulb,
      description: 'Get 50+ content ideas instantly',
      color: 'from-yellow-400 to-orange-500',
      emoji: '💡',
      category: 'Ideation'
    }
  ];

  const recentGenerations = [
    { type: 'LinkedIn Post', count: 12, time: 'Today' },
    { type: 'Instagram Reel', count: 8, time: 'Today' },
    { type: 'Cold Email', count: 100, time: 'Today' },
    { type: 'Newsletter', count: 3, time: 'This Week' }
  ];

  const quickStats = {
    totalGenerated: 247,
    thisWeek: 89,
    thisMonth: 247,
    avgPerDay: 35
  };

  const handleGenerateContent = (title) => {
    console.log('Opening generator for:', title);
    // This would navigate to the specific generation page
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
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Zap className="text-yellow-300" size={36} />
              Quick Generation Shortcuts
            </h1>
            <p className="text-slate-400 mb-6">Create content instantly with one click — choose your format and let AI do the work</p>

            {/* Quick Stats */}
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

          {/* Generation Shortcuts Grid */}
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
                    onClick={() => handleGenerateContent(shortcut.title)}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-yellow-300/30 transition-all hover:shadow-xl hover:shadow-yellow-500/10 group text-left relative overflow-hidden"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${shortcut.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${shortcut.color} rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                          {shortcut.emoji}
                        </div>
                        <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium">
                          {shortcut.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Plus size={20} className="text-yellow-300" />
                        {shortcut.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 text-sm mb-4">{shortcut.description}</p>

                      {/* Action Indicator */}
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

          {/* Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Generations */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <History className="text-yellow-300" />
                Recent Generations
              </h2>
              <div className="space-y-4">
                {recentGenerations.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all"
                  >
                    <div>
                      <p className="font-semibold">{item.type}</p>
                      <p className="text-sm text-slate-400">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-300">{item.count}</p>
                      <p className="text-xs text-slate-400">generated</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
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

export default QuickGenShortcutsPage;