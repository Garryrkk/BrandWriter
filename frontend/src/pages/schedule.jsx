import React, { useState } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Clock, ChevronRight, Edit, Trash2, CheckCircle, Play } from 'lucide-react';

const SchedulerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');

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

  const todaySchedule = [
    {
      id: 1,
      time: '9:00 AM',
      platform: 'LinkedIn',
      type: 'Thought leadership post',
      content: '5 biggest mistakes founders make when pitching investors...',
      status: 'scheduled',
      color: 'from-blue-500 to-blue-600',
      icon: '💼'
    },
    {
      id: 2,
      time: '12:00 PM',
      platform: 'Instagram Reel',
      type: 'How to stay consistent',
      content: 'Hook: "If you\'re struggling with consistency, watch this..."',
      status: 'scheduled',
      color: 'from-pink-500 to-purple-600',
      icon: '📸'
    },
    {
      id: 3,
      time: '4:00 PM',
      platform: 'Email Campaign',
      type: 'Spring CTA blast',
      content: 'Subject: Your exclusive spring offer ends tonight...',
      status: 'scheduled',
      color: 'from-green-500 to-emerald-600',
      icon: '📧'
    },
    {
      id: 4,
      time: '7:00 PM',
      platform: 'YouTube Short',
      type: 'AI automation trick',
      content: 'This ONE automation saved me 10 hours per week...',
      status: 'scheduled',
      color: 'from-red-500 to-red-600',
      icon: '🎥'
    }
  ];

  const upcomingSchedule = [
    {
      date: 'Tomorrow, Dec 9',
      items: [
        { time: '8:00 AM', platform: 'Twitter Thread', type: '10 growth hacks', icon: '🐦' },
        { time: '2:00 PM', platform: 'Instagram Post', type: 'Behind the scenes', icon: '📷' },
        { time: '6:00 PM', platform: 'LinkedIn Article', type: 'Industry insights', icon: '📝' }
      ]
    },
    {
      date: 'Wednesday, Dec 10',
      items: [
        { time: '10:00 AM', platform: 'Blog Post', type: 'Complete SEO guide', icon: '📄' },
        { time: '3:00 PM', platform: 'TikTok Video', type: 'Quick tips', icon: '🎵' },
        { time: '8:00 PM', platform: 'Newsletter', type: 'Weekly roundup', icon: '📬' }
      ]
    },
    {
      date: 'Thursday, Dec 11',
      items: [
        { time: '9:30 AM', platform: 'LinkedIn Poll', type: 'Audience engagement', icon: '📊' },
        { time: '1:00 PM', platform: 'Instagram Story', type: 'Q&A session', icon: '💬' },
        { time: '5:00 PM', platform: 'YouTube Video', type: 'Tutorial series', icon: '🎬' }
      ]
    }
  ];

  const stats = {
    todayScheduled: 4,
    weekScheduled: 15,
    monthScheduled: 52,
    completedToday: 0
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
              <Calendar className="text-yellow-300" size={36} />
              Today's Schedule
            </h1>
            <p className="text-slate-400 mb-4">Monday, December 8, 2025</p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Today Scheduled</p>
                <p className="text-2xl font-bold text-yellow-300">{stats.todayScheduled}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">This Week</p>
                <p className="text-2xl font-bold text-blue-400">{stats.weekScheduled}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-400">{stats.monthScheduled}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Completed Today</p>
                <p className="text-2xl font-bold text-green-400">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Today's Timeline - Main Section */}
            <div className="xl:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="text-yellow-300" />
                    Today's Timeline
                  </h2>
                  <button className="px-4 py-2 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/30 transition-all text-sm">
                    Add New Post
                  </button>
                </div>

                <div className="space-y-4">
                  {todaySchedule.map((item, index) => (
                    <div key={item.id} className="relative">
                      {/* Timeline Line */}
                      {index < todaySchedule.length - 1 && (
                        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-yellow-300/50 to-transparent"></div>
                      )}
                      
                      <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50 hover:border-yellow-300/30 transition-all group">
                        <div className="flex items-start gap-4">
                          {/* Time Badge */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-full flex items-center justify-center font-bold text-slate-900 text-sm relative z-10">
                              {item.time.split(' ')[0]}
                            </div>
                            <p className="text-xs text-center text-slate-400 mt-1">{item.time.split(' ')[1]}</p>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                  <h3 className="font-bold text-lg">{item.platform}</h3>
                                  <p className="text-sm text-slate-400">{item.type}</p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Clock size={12} />
                                Scheduled
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm mb-4">{item.content}</p>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm font-medium flex items-center gap-1">
                                <Play size={14} />
                                Post Now
                              </button>
                              <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium flex items-center gap-1">
                                <Edit size={14} />
                                Edit
                              </button>
                              <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-medium flex items-center gap-1">
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View Full Calendar Button */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <button className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all font-semibold flex items-center justify-center gap-2">
                    Open Full Scheduler
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Schedule - Right Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="text-yellow-300" />
                  Coming Up
                </h2>

                <div className="space-y-6">
                  {upcomingSchedule.map((day, dayIndex) => (
                    <div key={dayIndex}>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3">{day.date}</h3>
                      <div className="space-y-2">
                        {day.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-yellow-300/30 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400">{item.time}</p>
                                <p className="font-semibold text-sm truncate">{item.platform}</p>
                                <p className="text-xs text-slate-400 truncate">{item.type}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">This Week Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">LinkedIn Posts</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Instagram Content</span>
                      <span className="font-semibold">4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Video Content</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Email Campaigns</span>
                      <span className="font-semibold">3</span>
                    </div>
                  </div>
                </div>
              </div>
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

export default SchedulerPage;