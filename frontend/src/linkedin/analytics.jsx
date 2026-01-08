import React, { useState } from 'react';
import { Home, Activity, Users, Settings, BarChart3, Download, Menu, X, Brain, Target, TrendingUp, Award, MessageSquare } from 'lucide-react';

const AnalyticsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
  ];

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Activity, label: 'Discovery Runs', id: 'runs' },
    { icon: Users, label: 'Lead Inbox', id: 'leads' },
    { icon: Settings, label: 'Rules & Targeting', id: 'rules' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Download, label: 'Exports', id: 'exports' },
  ];

  const overallMetrics = {
    totalLeadsContacted: 247,
    totalReplies: 168,
    overallReplyRate: 68,
    avgScore: 78,
    bestPerformingScore: '85-95'
  };

  const replyRateByRole = [
    { role: 'AI Product Lead', contacted: 45, replied: 34, replyRate: 76 },
    { role: 'Founder & CEO', contacted: 38, replied: 28, replyRate: 74 },
    { role: 'ML Engineer', contacted: 52, replied: 36, replyRate: 69 },
    { role: 'VP Engineering', contacted: 41, replied: 26, replyRate: 63 },
    { role: 'Head of AI', contacted: 35, replied: 22, replyRate: 63 },
    { role: 'Senior ML Engineer', contacted: 36, replied: 22, replyRate: 61 },
  ];

  const replyRateByBucket = [
    { bucket: 'Founder', contacted: 68, replied: 51, replyRate: 75 },
    { bucket: 'Builder', contacted: 112, replied: 74, replyRate: 66 },
    { bucket: 'Buyer', contacted: 67, replied: 43, replyRate: 64 },
  ];

  const replyRateByKeyword = [
    { cluster: 'GenAI', contacted: 89, replied: 64, replyRate: 72 },
    { cluster: 'AI Infrastructure', contacted: 67, replied: 44, replyRate: 66 },
    { cluster: 'Machine Learning', contacted: 58, replied: 37, replyRate: 64 },
    { cluster: 'AI Research', contacted: 33, replied: 23, replyRate: 70 },
  ];

  const scorePerformance = [
    { scoreRange: '90-100', contacted: 42, replied: 35, replyRate: 83 },
    { scoreRange: '80-89', contacted: 76, replied: 54, replyRate: 71 },
    { scoreRange: '70-79', contacted: 64, replied: 41, replyRate: 64 },
    { scoreRange: '60-69', contacted: 45, replied: 26, replyRate: 58 },
    { scoreRange: '50-59', contacted: 20, replied: 12, replyRate: 60 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {floatingIcons.map((item, idx) => {
        const IconComponent = item.Icon;
        return (
          <div key={idx} className="absolute pointer-events-none" style={{ top: item.top, left: item.left, opacity: item.opacity }}>
            <IconComponent size={item.size} className="text-yellow-200" />
          </div>
        );
      })}

      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Target className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Lead Discovery
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm">
              <span className="text-slate-400">Overall Reply Rate:</span>
              <span className="ml-2 font-semibold text-green-400">{overallMetrics.overallReplyRate}%</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold">
              JD
            </div>
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
                    activeTab === item.id ? 'bg-gradient-to-r from-yellow-200/20 to-pink-200/20 border border-yellow-300/30' : 'hover:bg-slate-700/30'
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
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="text-yellow-300" size={36} />
              Analytics & Feedback Loop
            </h1>
            <p className="text-slate-400">Improve results over time with data-driven insights</p>
          </div>

          {/* Overall Metrics */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <Users className="text-blue-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm mb-1">Total Contacted</p>
                <p className="text-3xl font-bold">{overallMetrics.totalLeadsContacted}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <MessageSquare className="text-green-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm mb-1">Total Replies</p>
                <p className="text-3xl font-bold text-green-400">{overallMetrics.totalReplies}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <TrendingUp className="text-yellow-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm mb-1">Reply Rate</p>
                <p className="text-3xl font-bold text-yellow-400">{overallMetrics.overallReplyRate}%</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <Target className="text-purple-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-purple-400">{overallMetrics.avgScore}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <Award className="text-pink-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm mb-1">Best Score Range</p>
                <p className="text-2xl font-bold text-pink-400">{overallMetrics.bestPerformingScore}</p>
              </div>
            </div>
          </section>

          {/* Reply Rate by Role */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-yellow-300" />
                Reply Rate by Role
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Role</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-400">Contacted</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-400">Replied</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-400">Reply Rate</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {replyRateByRole.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-all">
                        <td className="py-4 px-4 font-semibold">{item.role}</td>
                        <td className="py-4 px-4 text-center">{item.contacted}</td>
                        <td className="py-4 px-4 text-center text-green-400 font-semibold">{item.replied}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-lg font-bold ${
                            item.replyRate >= 70 ? 'bg-green-500/20 text-green-400' :
                            item.replyRate >= 65 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.replyRate}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                              style={{ width: `${item.replyRate}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Reply Rate by Bucket */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="text-yellow-300" />
                Reply Rate by Bucket
              </h2>
              <div className="space-y-4">
                {replyRateByBucket.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg">{item.bucket}</span>
                      <span className="text-2xl font-bold text-green-400">{item.replyRate}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-slate-400">Contacted</p>
                        <p className="font-semibold">{item.contacted}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Replied</p>
                        <p className="font-semibold text-green-400">{item.replied}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                        style={{ width: `${item.replyRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Rate by Keyword Cluster */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="text-yellow-300" />
                Reply Rate by Keyword Cluster
              </h2>
              <div className="space-y-4">
                {replyRateByKeyword.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg">{item.cluster}</span>
                      <span className="text-2xl font-bold text-yellow-400">{item.replyRate}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-slate-400">Contacted</p>
                        <p className="font-semibold">{item.contacted}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Replied</p>
                        <p className="font-semibold text-green-400">{item.replied}</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-pink-400"
                        style={{ width: `${item.replyRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Performing Scores */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-yellow-300" />
                Performance by Score Range
              </h2>
              <div className="space-y-3">
                {scorePerformance.map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-xl">Score {item.scoreRange}</span>
                        <p className="text-sm text-slate-400 mt-1">
                          {item.contacted} contacted • {item.replied} replied
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-lg font-bold text-2xl ${
                        item.replyRate >= 80 ? 'bg-green-500/20 text-green-400' :
                        item.replyRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        item.replyRate >= 60 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {item.replyRate}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.replyRate >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                          item.replyRate >= 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' :
                          'bg-gradient-to-r from-blue-400 to-cyan-400'
                        }`}
                        style={{ width: `${item.replyRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              Lead Discovery System - Powered by AI-driven targeting and real-time discovery
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;