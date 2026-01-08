import React, { useState } from 'react';
import { Home, FileText, Settings, BarChart3, Download, Target, CheckCircle, Play, Eye, Activity, Users, TrendingUp } from 'lucide-react';
import AnalyticsPage from './analytics';
import DiscoveryRunsPage from './discovery-runs';
import ExportsPage from './exports';
//import LeadDetailPage from './lead-detail';
import LeadInboxPage from './lead-inbox';
import RulesTargetingPage from './rules&targeting';

const LeadDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const navItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Activity, label: 'Discovery Runs', id: 'runs' },
    { icon: Users, label: 'Lead Inbox', id: 'leads' },
    { icon: Settings, label: 'Rules & Targeting', id: 'rules' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Download, label: 'Exports', id: 'exports' },
  ];

  const summaryCards = [
    {
      title: 'Leads Found Today',
      value: '127',
      change: '+23 from yesterday',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'High-Score Leads (80+)',
      value: '34',
      change: '26.8% of total',
      icon: Target,
      color: 'from-yellow-500 to-amber-600',
    },
    {
      title: 'Leads DMed',
      value: '25',
      change: '73.5% response rate',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Reply Rate (7 days)',
      value: '68%',
      change: '+12% from last week',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
    }
  ];

  const lastRun = {
    status: 'Completed',
    timeStarted: '6:00 AM',
    timeFinished: '6:12 AM',
    leadsPulled: 127,
    rulesUsed: 'Default Targeting',
    queries: 45,
    duration: '12 min'
  };

  const recentInteractions = [
    { name: 'Sarah Chen', role: 'AI Product Lead', action: 'Replied', time: '2 hours ago', sentiment: 'positive' },
    { name: 'Mike Rodriguez', role: 'Founder & CEO', action: 'Viewed DM', time: '4 hours ago', sentiment: 'neutral' },
    { name: 'Emily Watson', role: 'ML Engineer', action: 'Replied', time: '6 hours ago', sentiment: 'positive' },
    { name: 'David Kim', role: 'VP Engineering', action: 'Contacted', time: '8 hours ago', sentiment: 'neutral' }
  ];

  const DashboardPage = () => (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Home className="text-yellow-300" size={36} />
          Command Center
        </h1>
        <p className="text-slate-400">What happened today?</p>
      </div>

      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {summaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-yellow-300/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-slate-400 text-sm mb-2">{card.title}</h3>
                <p className="text-4xl font-bold mb-2">{card.value}</p>
                <p className="text-sm text-slate-400">{card.change}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Activity className="text-yellow-300" />
          Last Discovery Run
        </h2>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{lastRun.status}</h3>
                <p className="text-sm text-slate-400">Run completed successfully</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Duration</p>
              <p className="text-xl font-bold text-green-400">{lastRun.duration}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Time Started</p>
              <p className="font-bold text-lg">{lastRun.timeStarted}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Time Finished</p>
              <p className="font-bold text-lg">{lastRun.timeFinished}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Leads Pulled</p>
              <p className="font-bold text-lg text-yellow-300">{lastRun.leadsPulled}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Rules Used</p>
              <p className="font-bold text-sm">{lastRun.rulesUsed}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Queries Executed</p>
              <p className="font-bold text-lg">{lastRun.queries}</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Status</p>
              <p className="font-bold text-sm text-green-400">✓ Complete</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setActivePage('leads')}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Eye size={20} />
              View Today's Leads
            </button>
            <button className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-green-500/30">
              <Play size={20} />
              Run Discovery
            </button>
            <button 
              onClick={() => setActivePage('runs')}
              className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              View Logs
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="text-yellow-300" />
          Recent Interactions
        </h2>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          {recentInteractions.map((interaction, idx) => (
            <div
              key={idx}
              className="p-5 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                    {interaction.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{interaction.name}</h3>
                    <p className="text-sm text-slate-400">{interaction.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    interaction.sentiment === 'positive' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {interaction.action}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{interaction.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'runs':
        return <DiscoveryRunsPage />;
      case 'leads':
        return <LeadInboxPage />;
      case 'rules':
        return <RulesTargetingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'exports':
        return <ExportsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-yellow-300" size={32} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
              Lead Discovery
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm">
              <span className="text-slate-400">Last sync:</span>
              <span className="ml-2 font-semibold text-green-400">12 min ago</span>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                  activePage === item.id
                    ? 'bg-gradient-to-r from-yellow-200/20 to-pink-200/20 border-2 border-yellow-300/30'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent'
                }`}
              >
                <Icon size={18} className={activePage === item.id ? 'text-yellow-300' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      {renderPage()}
    </div>
  );
};

export default LeadDashboard;