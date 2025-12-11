import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Edit, Trash2, Clock, Image, Video, Send, Save, ChevronRight, Filter, Grid, List, Upload, RefreshCw } from 'lucide-react';

const BasketPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('basket');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    platform: 'all',
    category: 'all',
    dateRange: 'all',
    status: 'all'
  });

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

  const basketContent = [
    {
      id: 1,
      title: '5 biggest mistakes founders make when pitching',
      platform: 'LinkedIn',
      category: 'LinkedIn Post',
      type: 'Post',
      content: 'Full post: Stop trying to be perfect. Investors don\'t want perfection—they want founders who can adapt...',
      status: 'In Basket',
      createdDate: '2 hours ago',
      hasMedia: false,
      scheduledDate: null,
      scheduledTime: null
    },
    {
      id: 2,
      title: 'How to stay consistent with content creation',
      platform: 'Instagram',
      category: 'Insta Reel',
      type: 'Reel',
      content: 'Hook: "If you\'re struggling with consistency, watch this..." Script: The secret isn\'t motivation...',
      status: 'Awaiting Schedule',
      createdDate: '5 hours ago',
      hasMedia: true,
      scheduledDate: null,
      scheduledTime: null
    },
    {
      id: 3,
      title: '10-slide carousel: Content marketing tips',
      platform: 'Instagram',
      category: 'Insta Carousel',
      type: 'Carousel',
      content: 'Slide 1: Stop posting randomly. Slide 2: Create a content calendar. Slide 3: Batch your content...',
      status: 'In Basket',
      createdDate: '1 day ago',
      hasMedia: false,
      scheduledDate: null,
      scheduledTime: null
    },
    {
      id: 4,
      title: 'This ONE automation saved me 10 hours per week',
      platform: 'YouTube',
      category: 'YouTube Short',
      type: 'Short',
      content: '[Scene 1] Show cluttered calendar [Scene 2] Show automation tool [Scene 3] Show free time...',
      status: 'Scheduled',
      createdDate: '2 days ago',
      hasMedia: true,
      scheduledDate: 'Dec 10, 2025',
      scheduledTime: '3:00 PM'
    },
    {
      id: 5,
      title: 'Weekly Newsletter: Top 5 Marketing Insights',
      platform: 'Newsletter',
      category: 'Newsletter',
      type: 'Email',
      content: 'Hey there! Welcome to this week\'s newsletter. Here are the 5 things you need to know...',
      status: 'Draft',
      createdDate: '3 days ago',
      hasMedia: false,
      scheduledDate: null,
      scheduledTime: null
    },
    {
      id: 6,
      title: 'Quick question about scaling your growth',
      platform: 'Cold Email',
      category: 'Cold Email',
      type: 'Email',
      content: 'Hi [Name], I noticed you recently expanded into the SaaS market. Quick question: What\'s your biggest...',
      status: 'In Basket',
      createdDate: '4 hours ago',
      hasMedia: false,
      scheduledDate: null,
      scheduledTime: null
    }
  ];

  const platforms = ['All', 'LinkedIn', 'Instagram', 'YouTube', 'Newsletter', 'Cold Email', 'Cold DM'];
  const categories = ['All', 'LinkedIn Post', 'Insta Reel', 'Insta Carousel', 'Insta Story', 'Insta Post', 'YouTube Short', 'Newsletter', 'Cold Email', 'Cold DM', 'Lead Generation', 'Brand Ideas'];
  const statuses = ['All', 'In Basket', 'Draft', 'Awaiting Schedule', 'Scheduled'];

  const [editContent, setEditContent] = useState({
    content: '',
    platform: 'LinkedIn',
    category: 'LinkedIn Post',
    scheduledDate: '',
    scheduledTime: '',
    mediaFiles: []
  });

  const openDetailPanel = (content) => {
    setSelectedContent(content);
    setEditContent({
      content: content.content,
      platform: content.platform,
      category: content.category,
      scheduledDate: content.scheduledDate || '',
      scheduledTime: content.scheduledTime || '',
      mediaFiles: []
    });
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedContent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Basket': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Awaiting Schedule': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Scheduled': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'LinkedIn': return 'from-blue-500 to-blue-600';
      case 'Instagram': return 'from-pink-500 to-purple-600';
      case 'YouTube': return 'from-red-500 to-red-600';
      case 'Newsletter': return 'from-teal-500 to-cyan-600';
      case 'Cold Email': return 'from-green-500 to-emerald-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'LinkedIn': return '💼';
      case 'Instagram': return '📸';
      case 'YouTube': return '🎥';
      case 'Newsletter': return '📬';
      case 'Cold Email': return '📧';
      default: return '📝';
    }
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
                  <ShoppingCart className="text-yellow-300" size={36} />
                  Basket (Staging Area)
                </h1>
                <p className="text-slate-400">Review, edit, and schedule your generated content</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-yellow-300 text-slate-900' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-yellow-300 text-slate-900' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Total in Basket</p>
                <p className="text-2xl font-bold text-yellow-300">{basketContent.length}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Awaiting Schedule</p>
                <p className="text-2xl font-bold text-purple-400">{basketContent.filter(c => c.status === 'Awaiting Schedule').length}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-green-400">{basketContent.filter(c => c.status === 'Scheduled').length}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Drafts</p>
                <p className="text-2xl font-bold text-blue-400">{basketContent.filter(c => c.status === 'Draft').length}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <section className="mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="text-yellow-300" size={20} />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters({...filters, platform: e.target.value})}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                >
                  <option value="all">All Platforms</option>
                  {platforms.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                >
                  <option value="all">All Statuses</option>
                  {statuses.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Content Cards */}
          <section>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {basketContent.map((content) => (
                <div
                  key={content.id}
                  onClick={() => openDetailPanel(content)}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-yellow-300/30 transition-all p-5 cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getPlatformColor(content.platform)} rounded-lg flex items-center justify-center text-2xl`}>
                      {getPlatformIcon(content.platform)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(content.status)}`}>
                      {content.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                    {content.title}
                    </h3>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
                    <span>{content.platform}</span>
                    <span>•</span>
                    <span>{content.type}</span>
                  </div>

                  {/* Content Preview */}
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{content.content}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />
                      <span>{content.createdDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {content.hasMedia && (
                        <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                          <Image size={14} className="text-blue-400" />
                        </div>
                      )}
                      <ChevronRight size={16} className="text-yellow-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Detail Panel (Slide Over) */}
      {showDetailPanel && selectedContent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetailPanel}></div>
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-slate-800 shadow-2xl overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedContent.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedContent.status)}`}>
                      {selectedContent.status}
                    </span>
                    <span className="text-sm text-slate-400">{selectedContent.createdDate}</span>
                  </div>
                </div>
                <button
                  onClick={closeDetailPanel}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content Editor */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">Content</label>
                <textarea
                  value={editContent.content}
                  onChange={(e) => setEditContent({...editContent, content: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                  rows="8"
                />
              </div>

              {/* Media Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">Media Upload</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-yellow-300/50 transition-all cursor-pointer">
                  <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                  <p className="text-slate-400 text-sm mb-2">Drag & drop images or videos</p>
                  <p className="text-slate-500 text-xs">or click to browse</p>
                </div>
              </div>

              {/* Platform Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">Platform</label>
                <select
                  value={editContent.platform}
                  onChange={(e) => setEditContent({...editContent, platform: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                >
                  {platforms.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Category Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">Category</label>
                <select
                  value={editContent.category}
                  onChange={(e) => setEditContent({...editContent, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                >
                  {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Date</label>
                  <input
                    type="date"
                    value={editContent.scheduledDate}
                    onChange={(e) => setEditContent({...editContent, scheduledDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Time</label>
                  <input
                    type="time"
                    value={editContent.scheduledTime}
                    onChange={(e) => setEditContent({...editContent, scheduledTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Choose the date, time, platform, and category to schedule this post. Once scheduled, it will appear in your Calendar View.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all font-semibold flex items-center justify-center gap-2">
                  <RefreshCw size={20} />
                  AI Enhance (Regenerate Variations)
                </button>
                <button className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all font-semibold flex items-center justify-center gap-2">
                  <Save size={20} />
                  Save to Draft
                </button>
                <button className="w-full py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Send size={20} />
                  Schedule Post
                </button>
                <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all font-semibold flex items-center justify-center gap-2">
                  <Trash2 size={20} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketPage;