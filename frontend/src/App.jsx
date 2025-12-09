import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, Cpu, Brain, Workflow, Settings, Grid3x3, BookOpen, Palette, Home, FileText, Trash2, Clock, Calendar, Wand2, LogOut, Menu, X, Mic, Code, Database, CloudLightning, Atom, Binary, CircuitBoard, GitBranch, Layers, Target, Activity, Bot, Sparkles } from 'lucide-react';

// Import page components
import AutoGenSettingsPage from './pages/auto_generate';
import DraftsPage from './pages/drafts';
import HistoryPage from './pages/history';
import TemplatesPage from './pages/templates';
import SchedulePage from './pages/schedule';
import BasketPage from './pages/basket';

const WriterDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState({
    linkedin: { generated: 12, scheduled: 3, published: 1, quota: 88 },
    instagram: { generated: 20, scheduled: 5, published: 3, quota: 80 },
    youtube: { generated: 3, scheduled: 2, published: 1, quota: 97 },
    emails: { generated: 100, dms: 100, status: 'Completed at 6:00 AM' }
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animated icon background
  const FloatingIcons = () => {
    const icons = [
      { Icon: Brain, top: '5%', left: '10%', delay: 0, size: 56 },
      { Icon: Cpu, top: '8%', left: '25%', delay: 0.5, size: 64 },
      { Icon: Workflow, top: '3%', left: '45%', delay: 1, size: 52 },
      { Icon: Bot, top: '7%', left: '65%', delay: 1.5, size: 72 },
      { Icon: Sparkles, top: '10%', left: '82%', delay: 2, size: 48 },
      { Icon: Code, top: '22%', left: '5%', delay: 0.3, size: 60 },
      { Icon: Database, top: '20%', left: '20%', delay: 0.8, size: 68 },
      { Icon: CloudLightning, top: '25%', left: '38%', delay: 1.3, size: 76 },
      { Icon: Atom, top: '18%', left: '58%', delay: 1.8, size: 52 },
      { Icon: Binary, top: '23%', left: '75%', delay: 2.3, size: 64 },
      { Icon: CircuitBoard, top: '19%', left: '90%', delay: 0.6, size: 58 },
      { Icon: Workflow, top: '40%', left: '8%', delay: 1.2, size: 70 },
      { Icon: GitBranch, top: '38%', left: '28%', delay: 1.7, size: 54 },
      { Icon: Layers, top: '42%', left: '48%', delay: 2.2, size: 66 },
      { Icon: Target, top: '37%', left: '68%', delay: 0.4, size: 62 },
      { Icon: Activity, top: '43%', left: '85%', delay: 0.9, size: 58 },
      { Icon: Brain, top: '58%', left: '12%', delay: 1.4, size: 64 },
      { Icon: Cpu, top: '55%', left: '32%', delay: 1.9, size: 72 },
      { Icon: Workflow, top: '60%', left: '52%', delay: 2.4, size: 56 },
      { Icon: Bot, top: '57%', left: '72%', delay: 0.2, size: 68 },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
        {icons.map((item, i) => {
          const Icon = item.Icon;
          return (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: item.top,
                left: item.left,
                animation: `float ${5 + Math.random() * 3}s linear infinite`,
                animationDelay: `${item.delay}s`
              }}
            >
              <Icon size={item.size} className="text-yellow-300" />
            </div>
          );
        })}
      </div>
    );
  };

  // Timer Component
  const TimerBlock = () => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    const day = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
    const date = currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <div className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-pink-400/10 border border-yellow-400/30 rounded-lg">
        <Clock size={20} className="text-yellow-400 animate-spin" style={{ animationDuration: '2s' }} />
        <div className="flex flex-col">
          <div className="text-sm font-bold text-yellow-400 font-mono tracking-wider">
            {hours}:{minutes}:{seconds}
          </div>
          <div className="text-xs text-gray-400">
            {day}, {date}
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ platform, data, icon: Icon, color }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border-2 transition-all hover:scale-105 ${color}`}>
      <div className="absolute top-0 right-0 -m-4 opacity-10">
        <Icon size={100} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={24} className="text-white" />
          <h3 className="text-lg font-bold text-white">{platform}</h3>
        </div>
        <div className="space-y-2 text-sm">
          {platform === 'Emails' ? (
            <>
              <p className="text-gray-100">Cold Emails: <span className="font-bold text-white">{data.generated}</span></p>
              <p className="text-gray-100">Cold DMs: <span className="font-bold text-white">{data.dms}</span></p>
              <p className="text-yellow-100 font-semibold">{data.status}</p>
            </>
          ) : (
            <>
              <p className="text-gray-100">Generated: <span className="font-bold text-white">{data.generated}</span></p>
              <p className="text-gray-100">Scheduled: <span className="font-bold text-white">{data.scheduled}</span></p>
              <p className="text-gray-100">Published: <span className="font-bold text-white">{data.published}</span></p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-100">Quota Left:</span>
                  <span className="text-lg font-bold text-white">{data.quota}%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-gray-900 font-bold'
          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
      }`}
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </button>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'drafts':
        return <DraftsPage />;
      case 'basket':
        return <BasketPage />;
      case 'history':
        return <HistoryPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'autogen':
        return <AutoGenSettingsPage />;
      case 'templates':
        return <TemplatesPage />;
      default:
        return (
          <div className="space-y-8">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Welcome back! 🚀
              </h1>
              <p className="text-gray-400">Here's your content generation dashboard for today</p>
            </div>

            {/* Daily Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatCard
                platform="LinkedIn"
                data={stats.linkedin}
                icon={BarChart3}
                color="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500/50"
              />
              <StatCard
                platform="Instagram"
                data={stats.instagram}
                icon={Grid3x3}
                color="bg-gradient-to-br from-pink-600 to-purple-800 border-pink-500/50"
              />
              <StatCard
                platform="YouTube"
                data={stats.youtube}
                icon={Workflow}
                color="bg-gradient-to-br from-red-600 to-orange-800 border-red-500/50"
              />
              <StatCard
                platform="Emails"
                data={stats.emails}
                icon={Zap}
                color="bg-gradient-to-br from-yellow-600 to-orange-800 border-yellow-500/50"
              />
            </div>

            {/* Auto-Gen Content Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Brain size={24} className="text-yellow-400" />
                  <h2 className="text-2xl font-bold">Auto-Gen Content Feed</h2>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-gray-700/30 border border-gray-600 hover:border-yellow-400/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-yellow-100">LinkedIn Post #{i}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Generated 2h ago</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">Engaging content about AI and automation trends with industry insights...</p>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 rounded-lg bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 transition-all">Edit</button>
                        <button className="text-xs px-3 py-1 rounded-lg bg-blue-400/20 text-blue-300 hover:bg-blue-400/30 transition-all">Schedule</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu size={24} className="text-pink-400" />
                  <h2 className="text-xl font-bold">Quick Actions</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Wand2, label: 'Generate Content', color: 'from-yellow-500 to-yellow-600' },
                    { icon: Brain, label: 'Refine Text', color: 'from-pink-500 to-pink-600' },
                    { icon: Workflow, label: 'Schedule Post', color: 'from-purple-500 to-purple-600' },
                    { icon: BarChart3, label: 'View Analytics', color: 'from-blue-500 to-blue-600' },
                  ].map((action, i) => {
                    const IconComp = action.icon;
                    return (
                      <button
                        key={i}
                        className={`w-full p-3 rounded-xl bg-gradient-to-r ${action.color} hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-semibold text-white`}
                      >
                        <IconComp size={18} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Pipeline Overview */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Workflow size={24} className="text-purple-400" />
                <h2 className="text-2xl font-bold">Content Pipeline Overview</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { stage: 'Drafts', count: 24, color: 'bg-blue-500/20 border-blue-500/50' },
                  { stage: 'In Review', count: 12, color: 'bg-yellow-500/20 border-yellow-500/50' },
                  { stage: 'Scheduled', count: 18, color: 'bg-purple-500/20 border-purple-500/50' },
                  { stage: 'Published', count: 156, color: 'bg-green-500/20 border-green-500/50' },
                ].map((stage, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${stage.color} text-center backdrop-blur-sm`}>
                    <p className="text-gray-400 text-sm mb-2">{stage.stage}</p>
                    <p className="text-3xl font-bold text-white">{stage.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-30px) translateX(20px); }
          50% { transform: translateY(-60px) translateX(-20px); }
          75% { transform: translateY(-30px) translateX(30px); }
        }
      `}</style>

      {/* Floating background icons */}
      <FloatingIcons />

      {/* Main container */}
      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-black border-r border-gray-700 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          } overflow-y-auto`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-pink-400 flex items-center justify-center">
                <Wand2 size={24} className="text-gray-900" />
              </div>
              {sidebarOpen && <span className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Writer</span>}
            </div>
          </div>

          {/* Menu items */}
          <div className="p-4 space-y-2">
            <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
            <SidebarItem icon={FileText} label="Drafts" active={currentPage === 'drafts'} onClick={() => setCurrentPage('drafts')} />
            <SidebarItem icon={Trash2} label="Basket" active={currentPage === 'basket'} onClick={() => setCurrentPage('basket')} />
            <SidebarItem icon={Clock} label="History" active={currentPage === 'history'} onClick={() => setCurrentPage('history')} />
            <SidebarItem icon={Calendar} label="Schedule" active={currentPage === 'schedule'} onClick={() => setCurrentPage('schedule')} />
            <SidebarItem icon={Zap} label="Auto-Gen" active={currentPage === 'autogen'} onClick={() => setCurrentPage('autogen')} />
            <SidebarItem icon={BookOpen} label="Templates" active={currentPage === 'templates'} onClick={() => setCurrentPage('templates')} />
            <SidebarItem icon={Brain} label="Brand Voice" active={currentPage === 'brand'} onClick={() => setCurrentPage('brand')} />
          </div>

          {/* Logout */}
          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/20 transition-all">
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {/* Header */}
          <div className="h-20 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 flex items-center justify-between px-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <Settings size={24} className="text-gray-300 hover:text-white cursor-pointer transition-colors" />
              <TimerBlock />
            </div>
          </div>

          {/* Content area */}
          <div className="p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterDashboard;