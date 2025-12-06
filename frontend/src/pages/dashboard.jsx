import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, ShoppingBasket, History, Calendar, Settings, 
  BookOpen, Mic, Plus, Linkedin, Instagram, Youtube, Mail, 
  MessageSquare, TrendingUp, Clock, Zap, Brain, Cpu, Network,
  Bot, Sparkles, Code, Database, CloudLightning, Atom, Binary,
  CircuitBoard, Workflow, GitBranch, Layers, Target, Activity
} from 'lucide-react';

// Zustand-like simple state management
const createStore = (initialState) => {
  let state = initialState;
  const listeners = new Set();
  
  return {
    getState: () => state,
    setState: (newState) => {
      state = { ...state, ...newState };
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

const useStore = (store) => {
  const [state, setState] = useState(store.getState());
  
  useEffect(() => {
    return store.subscribe(setState);
  }, [store]);
  
  return [state, store.setState];
};

// Stores
const dashboardStore = createStore({
  stats: {
    linkedin: { generated: 12, scheduled: 3, published: 1, quota: 88 },
    instagram: { generated: 20, scheduled: 5, published: 3, quota: 80 },
    youtube: { generated: 3, scheduled: 2, published: 1, quota: 97 },
    emails: { coldEmails: 100, coldDMs: 100, status: 'Completed at 6:00 AM' }
  },
  autoGenFeed: [
    { id: 1, type: 'linkedin', time: '2 mins ago', preview: '5 biggest mistakes founders make when pitching investors…' },
    { id: 2, type: 'email', time: '5 mins ago', preview: 'Subject: Quick question about scaling your growth' },
    { id: 3, type: 'reel', time: '8 mins ago', preview: 'Hook: "If you\'re struggling with reach in 2025, it\'s not your fault…"' }
  ],
  todaySchedule: [
    { time: '9:00 AM', platform: 'LinkedIn', content: 'Thought leadership post' },
    { time: '12:00 PM', platform: 'Instagram', content: 'How to stay consistent' },
    { time: '4:00 PM', platform: 'Email', content: 'Spring CTA blast' },
    { time: '7:00 PM', platform: 'YouTube', content: 'AI automation trick' }
  ]
});

// Floating Icons Component
const FloatingIcons = () => {
  const icons = [
    { Icon: Brain, top: '10%', left: '15%', delay: 0, size: 32 },
    { Icon: Cpu, top: '25%', right: '20%', delay: 1, size: 28 },
    { Icon: Network, bottom: '30%', left: '10%', delay: 2, size: 36 },
    { Icon: Bot, top: '45%', right: '15%', delay: 0.5, size: 40 },
    { Icon: Sparkles, top: '60%', left: '25%', delay: 1.5, size: 24 },
    { Icon: Code, bottom: '15%', right: '25%', delay: 2.5, size: 30 },
    { Icon: Database, top: '35%', left: '8%', delay: 1.8, size: 26 },
    { Icon: CloudLightning, bottom: '45%', right: '10%', delay: 0.8, size: 34 },
    { Icon: Atom, top: '70%', right: '30%', delay: 2.2, size: 28 },
    { Icon: Binary, top: '15%', left: '35%', delay: 1.2, size: 32 },
    { Icon: CircuitBoard, bottom: '25%', left: '30%', delay: 0.3, size: 38 },
    { Icon: Workflow, top: '80%', left: '18%', delay: 1.7, size: 30 },
    { Icon: GitBranch, top: '50%', left: '5%', delay: 2.8, size: 26 },
    { Icon: Layers, bottom: '60%', right: '8%', delay: 0.6, size: 32 },
    { Icon: Target, top: '22%', right: '35%', delay: 1.4, size: 28 },
    { Icon: Activity, bottom: '10%', left: '40%', delay: 2.4, size: 34 }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
      {icons.map(({ Icon, top, left, right, bottom, delay, size }, idx) => (
        <div
          key={idx}
          className="absolute animate-float"
          style={{
            top,
            left,
            right,
            bottom,
            animationDelay: `${delay}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }}
        >
          <Icon size={size} className="text-purple-500" />
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'Drafts', id: 'drafts' },
    { icon: ShoppingBasket, label: 'Basket', id: 'basket' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: Settings, label: 'Auto-Gen', id: 'autogen' },
    { icon: BookOpen, label: 'Templates', id: 'templates' },
    { icon: Mic, label: 'Brand Voice', id: 'brand' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 h-screen fixed left-0 top-0 border-r border-gray-700 shadow-2xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-lg flex items-center justify-center">
            <Sparkles className="text-gray-900" size={20} />
          </div>
          <span className="text-2xl font-bold text-white">Marketeam</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === id
                  ? 'bg-gradient-to-r from-yellow-300 to-pink-300 text-gray-900 shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
        <div className="text-sm text-gray-400 text-center">
          <p>Built with 💜 by & For</p>
          <p className="font-semibold text-pink-300">GenJecX Team</p>
          <p className="text-xs mt-1">Two sisters Garima and Aurin</p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page
const Dashboard = () => {
  const [state] = useStore(dashboardStore);

  return (
    <div className="space-y-6">
      <FloatingIcons />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Today's Performance Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
          <Zap size={16} />
          <span className="text-sm font-medium">System Active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Linkedin}
          platform="LinkedIn"
          color="from-blue-500 to-blue-600"
          stats={state.stats.linkedin}
        />
        <StatCard
          icon={Instagram}
          platform="Instagram"
          color="from-pink-500 to-purple-600"
          stats={state.stats.instagram}
        />
        <StatCard
          icon={Youtube}
          platform="YouTube"
          color="from-red-500 to-red-600"
          stats={state.stats.youtube}
        />
        <StatCard
          icon={Mail}
          platform="Emails"
          color="from-emerald-500 to-teal-600"
          stats={state.stats.emails}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auto-Gen Feed */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Bot className="text-yellow-300" />
            Auto-Generated Content Feed
          </h2>
          <div className="space-y-3">
            {state.autoGenFeed.map(item => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-pink-300" />
            Today's Schedule
          </h2>
          <div className="space-y-3">
            {state.todaySchedule.map((item, idx) => (
              <ScheduleItem key={idx} item={item} />
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all">
            Open Full Scheduler
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <QuickAction icon={Linkedin} label="LinkedIn Post" />
          <QuickAction icon={Instagram} label="IG Reel" />
          <QuickAction icon={Instagram} label="IG Carousel" />
          <QuickAction icon={Youtube} label="YouTube Short" />
          <QuickAction icon={Mail} label="Newsletter" />
          <QuickAction icon={Mail} label="Cold Email" />
          <QuickAction icon={MessageSquare} label="Cold DM" />
          <QuickAction icon={TrendingUp} label="Lead List" />
          <QuickAction icon={Sparkles} label="Brand Ideas" />
        </div>
      </div>

      {/* Content Pipeline */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Content Pipeline</h2>
        <div className="space-y-4">
          <PipelineBar label="Auto-Generated" count={120} max={150} color="bg-yellow-300" />
          <PipelineBar label="Drafts" count={43} max={150} color="bg-blue-400" />
          <PipelineBar label="Basket" count={18} max={150} color="bg-purple-400" />
          <PipelineBar label="Scheduled" count={27} max={150} color="bg-pink-400" />
          <PipelineBar label="Published" count={11} max={150} color="bg-green-400" />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, platform, color, stats }) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
      <div className="absolute top-0 right-0 opacity-10">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={24} />
          <span className="font-bold text-lg">{platform}</span>
        </div>
        {platform === 'Emails' ? (
          <div className="space-y-2">
            <p className="text-sm opacity-90">Cold Emails: {stats.coldEmails}</p>
            <p className="text-sm opacity-90">Cold DMs: {stats.coldDMs}</p>
            <p className="text-xs opacity-75 mt-2">{stats.status}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold">{stats.generated}</p>
            <div className="text-sm space-y-1 opacity-90">
              <p>Scheduled: {stats.scheduled}</p>
              <p>Published: {stats.published}</p>
              <p className="text-xs opacity-75">Quota: {stats.quota}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Feed Item Component
const FeedItem = ({ item }) => {
  const icons = { linkedin: Linkedin, email: Mail, reel: Instagram };
  const Icon = icons[item.type];
  
  return (
    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-yellow-300 transition-all">
      <div className="flex items-start gap-3">
        <Icon size={20} className="text-yellow-300 mt-1" />
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1">{item.time}</p>
          <p className="text-white text-sm">{item.preview}</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 bg-yellow-300 text-gray-900 rounded text-xs font-medium hover:bg-yellow-400 transition-all">
              Save to Draft
            </button>
            <button className="px-3 py-1 bg-pink-300 text-gray-900 rounded text-xs font-medium hover:bg-pink-400 transition-all">
              Add to Basket
            </button>
            <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Item Component
const ScheduleItem = ({ item }) => {
  return (
    <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={14} className="text-yellow-300" />
        <span className="text-xs font-bold text-yellow-300">{item.time}</span>
      </div>
      <p className="text-sm text-white font-medium">{item.platform}</p>
      <p className="text-xs text-gray-400">{item.content}</p>
    </div>
  );
};

// Quick Action Component
const QuickAction = ({ icon: Icon, label }) => {
  return (
    <button className="bg-gray-700/50 hover:bg-gray-600 border border-gray-600 hover:border-yellow-300 rounded-xl p-4 transition-all group">
      <Icon size={24} className="text-yellow-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
      <p className="text-xs text-white text-center">{label}</p>
    </button>
  );
};

// Pipeline Bar Component
const PipelineBar = ({ label, count, max, color }) => {
  const percentage = (count / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-white font-medium">{label}</span>
        <span className="text-gray-400">{count}</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="ml-64 p-8">
        <Dashboard />
      </div>
    </div>
  );
};

export default App;