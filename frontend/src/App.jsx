import { useState } from 'react';
import { Zap, Cpu, Brain, BookOpen, Home, FileText, Trash2, Clock, Calendar, Menu, X, Mic, Code, Database, Bot, Sparkles, Mail } from 'lucide-react';

// Import page components
import QuickGenShortcutsPage from './pages/auto_generate'
import DraftsPage from './pages/drafts';
import HistoryPage from './pages/history';
import TemplatesPage from './pages/templates';
import SchedulerPage from './pages/schedule';
import BasketPage from './pages/basket';
import BrandVoicePage from './pages/brand_voice';
import EmailStatsPage from './pages/email';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
    { Icon: Cpu, top: '25%', right: '20%', size: 28, opacity: 0.08 },
    { Icon: Bot, top: '45%', left: '10%', size: 36, opacity: 0.12 },
    { Icon: Bot, top: '60%', right: '15%', size: 30, opacity: 0.1 },
    { Icon: Sparkles, top: '15%', right: '40%', size: 24, opacity: 0.09 },
    { Icon: Zap, top: '75%', left: '25%', size: 28, opacity: 0.11 },
    { Icon: Code, top: '35%', left: '85%', size: 26, opacity: 0.08 },
    { Icon: Database, top: '80%', right: '30%', size: 32, opacity: 0.1 },
    { Icon: Cpu, top: '20%', left: '70%', size: 30, opacity: 0.09 },
    { Icon: Zap, top: '90%', left: '50%', size: 28, opacity: 0.12 },
    { Icon: Brain, top: '50%', right: '45%', size: 24, opacity: 0.08 },
    { Icon: Brain, top: '70%', left: '60%', size: 34, opacity: 0.1 },
    { Icon: Cpu, top: '5%', left: '45%', size: 26, opacity: 0.09 },
    { Icon: Bot, top: '85%', right: '10%', size: 30, opacity: 0.11 },
    { Icon: Sparkles, top: '40%', left: '30%', size: 28, opacity: 0.08 },
  ];

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'Drafts', id: 'drafts' },
    { icon: Trash2, label: 'Basket', id: 'basket' },
    { icon: Clock, label: 'History', id: 'history' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: Zap, label: 'Auto-Gen', id: 'autogen' },
    { icon: BookOpen, label: 'Templates', id: 'templates' },
    { icon: Mic, label: 'Brand Voice', id: 'brandvoice' },
    { icon: Mail, label: 'Email Stats', id: 'emailstats' },
  ];

  const platformStats = [
    {
      name: 'LinkedIn',
      generated: 12,
      scheduled: 3,
      published: 1,
      remaining: 88,
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Instagram',
      generated: 20,
      scheduled: 5,
      published: 3,
      remaining: 80,
      color: 'from-pink-400 to-purple-600'
    },
    {
      name: 'YouTube',
      generated: 3,
      scheduled: 2,
      published: 1,
      remaining: 97,
      color: 'from-red-400 to-red-600'
    },
    {
      name: 'Emails',
      coldEmails: 100,
      coldDMs: 100,
      status: 'Completed at 6:00 AM',
      color: 'from-green-400 to-emerald-600'
    }
  ];

  const recentContent = [
    { title: '10 Tips for Better Sleep', platform: 'LinkedIn', status: 'Published', time: '2 hours ago' },
    { title: 'Summer Collection Launch', platform: 'Instagram', status: 'Scheduled', time: '4 hours ago' },
    { title: 'Product Review: Tech Gadgets', platform: 'YouTube', status: 'Draft', time: '1 day ago' },
    { title: 'Newsletter: Weekly Updates', platform: 'Email', status: 'Sent', time: '2 days ago' },
  ];

  const quickActions = [
    { title: 'Generate LinkedIn Post', icon: FileText, color: 'bg-blue-500' },
    { title: 'Create Instagram Story', icon: Sparkles, color: 'bg-pink-500' },
    { title: 'Write Email Campaign', icon: Zap, color: 'bg-green-500' },
    { title: 'Draft YouTube Script', icon: Mic, color: 'bg-red-500' },
  ];

  const renderPage = () => {
    switch (activeTab) {
      case 'drafts':
        return <DraftsPage />;
      case 'basket':
        return <BasketPage />;
      case 'history':
        return <HistoryPage />;
      case 'schedule':
        return <SchedulerPage />;
      case 'autogen':
        return <QuickGenShortcutsPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'brandvoice':
        return <BrandVoicePage />;
      case 'emailstats':
        return <EmailStatsPage />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-24">
            {/* Daily Performance Summary */}
            <section>
              <h2 className="text-4xl font-bold mb-16 flex items-center gap-5 tracking-wide">
                <Sparkles className="text-yellow-300" size={32} />
                Daily Performance Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-14">
                {platformStats.map((platform, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl py-10 px-6 border border-slate-700/50 hover:border-yellow-300/30 transition-all hover:shadow-xl hover:shadow-yellow-500/10 max-w-xs"
                  >
                    <div className={`bg-gradient-to-r ${platform.color} w-12 h-12 rounded-lg flex items-center justify-center mb-7`}>
                      <Bot size={24} className="text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold mb-8 tracking-wide">{platform.name}</h3>
                    
                    {platform.coldEmails ? (
                      <div className="space-y-5 text-base">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Cold Emails:</span>
                          <span className="font-semibold text-green-400 text-lg">{platform.coldEmails}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Cold DMs:</span>
                          <span className="font-semibold text-green-400 text-lg">{platform.coldDMs}</span>
                        </div>
                        
                        <div className="pt-5 mt-2 border-t border-slate-700">
                          <span className="text-sm text-emerald-400">✓ {platform.status}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5 text-base">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Generated today:</span>
                          <span className="font-semibold text-lg">{platform.generated}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Scheduled today:</span>
                          <span className="font-semibold text-lg">{platform.scheduled}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Published today:</span>
                          <span className="font-semibold text-lg">{platform.published}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-5 mt-2 border-t border-slate-700">
                          <span className="text-slate-400">Remaining quota:</span>
                          <span className="font-semibold text-yellow-300 text-lg">{platform.remaining}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-32">
              <h2 className="text-4xl font-bold mb-16 flex items-center gap-5 tracking-wide">
                <Zap className="text-yellow-300" size={32} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl py-10 px-6 border border-slate-700/50 hover:border-pink-300/30 transition-all hover:shadow-xl hover:shadow-pink-500/10 group max-w-xs"
                    >
                      <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-left text-base tracking-wide">{action.title}</h3>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
              {/* Recent Content */}
              <section>
                <h2 className="text-4xl font-bold mb-16 flex items-center gap-5 tracking-wide">
                  <Cpu className="text-yellow-300" size={32} />
                  Recent Content
                </h2>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden max-w-md">
                  {recentContent.map((content, idx) => (
                    <div
                      key={idx}
                      className="p-8 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-base tracking-wide">{content.title}</h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          content.status === 'Published' ? 'bg-green-500/20 text-green-400' :
                          content.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          content.status === 'Sent' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {content.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>{content.platform}</span>
                        <span>•</span>
                        <span>{content.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Content Pipeline */}
              <section>
                <h2 className="text-4xl font-bold mb-16 flex items-center gap-5 tracking-wide">
                  <Cpu className="text-yellow-300" size={32} />
                  Content Pipeline
                </h2>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-10 border border-slate-700/50 max-w-md">
                  <div className="space-y-9">
                    <div>
                      <div className="flex justify-between mb-5">
                        <span className="text-base text-slate-400 tracking-wide">Drafts in Progress</span>
                        <span className="font-semibold text-lg">24</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-yellow-300 to-pink-300 h-3 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-5">
                        <span className="text-base text-slate-400 tracking-wide">Scheduled Posts</span>
                        <span className="font-semibold text-lg">10</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-5">
                        <span className="text-base text-slate-400 tracking-wide">Published Today</span>
                        <span className="font-semibold text-lg">8</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-5">
                        <span className="text-base text-slate-400 tracking-wide">Templates Available</span>
                        <span className="font-semibold text-lg">45</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="pt-20 mt-12 border-t border-slate-700/50">
              <p className="text-base text-slate-400 leading-relaxed tracking-wide">
                We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
              </p>
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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
        <div className="flex items-center justify-between px-10 py-7">
          <div className="flex items-center gap-7">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-5">
              <Brain className="text-yellow-300" size={44} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent tracking-wide">
                Brand Writer
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg">
              G
            </div>
            <button className="w-12 h-12 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors">
              <Trash2 size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} overflow-hidden bg-slate-800/30 backdrop-blur-md border-r border-slate-700/50 transition-all duration-300 z-40`}>
          <nav className="p-8 space-y-5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-5 px-6 py-5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-yellow-200/20 to-pink-200/20 border border-yellow-300/30'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <Icon size={24} className={activeTab === item.id ? 'text-yellow-300' : ''} />
                  <span className="font-medium text-base tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-14 lg:p-20 relative z-10">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;