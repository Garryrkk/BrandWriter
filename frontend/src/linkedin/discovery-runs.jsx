import React, { useState } from 'react';
import { Home, FileText, Search, Settings, BarChart3, Download, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Activity, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Eye, Users, Target } from 'lucide-react';

const DiscoveryRunsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('runs');
  const [expandedRow, setExpandedRow] = useState(null);

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
    { Icon: Cpu, top: '25%', right: '20%', size: 28, opacity: 0.08 },
    { Icon: Network, top: '45%', left: '10%', size: 36, opacity: 0.12 },
    { Icon: Bot, top: '60%', right: '15%', size: 30, opacity: 0.1 },
  ];

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Activity, label: 'Discovery Runs', id: 'runs' },
    { icon: Users, label: 'Lead Inbox', id: 'leads' },
    { icon: Settings, label: 'Rules & Targeting', id: 'rules' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics' },
    { icon: Download, label: 'Exports', id: 'exports' },
  ];

  const discoveryRuns = [
    {
      id: 'RUN-2024-001',
      date: 'Dec 8, 2024',
      time: '6:00 AM',
      ruleSet: 'Default Targeting',
      queriesExecuted: 45,
      leadsDiscovered: 127,
      leadsAccepted: 127,
      leadsDiscarded: 0,
      status: 'completed',
      duration: '12 min',
      details: {
        searchQueries: [
          'AI Product Lead site:linkedin.com',
          'Machine Learning Engineer GenAI site:linkedin.com',
          'VP Engineering AI startup site:linkedin.com'
        ],
        keywordsUsed: ['GenAI', 'LLM', 'AI Infrastructure', 'ML Platform'],
        exclusionsTriggered: [],
        errors: []
      }
    },
    {
      id: 'RUN-2024-002',
      date: 'Dec 7, 2024',
      time: '6:00 AM',
      ruleSet: 'Default Targeting',
      queriesExecuted: 43,
      leadsDiscovered: 104,
      leadsAccepted: 98,
      leadsDiscarded: 6,
      discardReasons: ['Low score (<50)', 'Duplicate profile'],
      status: 'completed',
      duration: '11 min',
      details: {
        searchQueries: [
          'Founder AI startup site:linkedin.com',
          'CTO machine learning site:linkedin.com'
        ],
        keywordsUsed: ['AI', 'Machine Learning', 'Startup'],
        exclusionsTriggered: ['recruiting', 'hiring managers'],
        errors: []
      }
    },
    {
      id: 'RUN-2024-003',
      date: 'Dec 6, 2024',
      time: '6:00 AM',
      ruleSet: 'Default Targeting',
      queriesExecuted: 42,
      leadsDiscovered: 89,
      leadsAccepted: 89,
      leadsDiscarded: 0,
      status: 'completed',
      duration: '10 min',
      details: {
        searchQueries: [
          'Product Manager AI tools site:linkedin.com',
          'Engineering Lead ML site:linkedin.com'
        ],
        keywordsUsed: ['AI tools', 'ML infrastructure'],
        exclusionsTriggered: [],
        errors: []
      }
    },
    {
      id: 'RUN-2024-004',
      date: 'Dec 5, 2024',
      time: '6:00 AM',
      ruleSet: 'Aggressive Targeting',
      queriesExecuted: 58,
      leadsDiscovered: 156,
      leadsAccepted: 142,
      leadsDiscarded: 14,
      discardReasons: ['Low score (<50)', 'Excluded keywords matched'],
      status: 'completed_with_warnings',
      duration: '15 min',
      details: {
        searchQueries: [
          'AI Engineer site:linkedin.com',
          'Data Scientist GenAI site:linkedin.com'
        ],
        keywordsUsed: ['GenAI', 'Data Science', 'AI Research'],
        exclusionsTriggered: ['student', 'intern'],
        errors: ['Rate limit warning on query 45']
      }
    }
  ];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
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
              <Target className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Lead Discovery
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm">
              <span className="text-slate-400">Total Runs:</span>
              <span className="ml-2 font-semibold text-yellow-300">{discoveryRuns.length}</span>
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

        <main className="flex-1 p-6 lg:p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Activity className="text-yellow-300" size={36} />
              Discovery Runs
            </h1>
            <p className="text-slate-400">Backend transparency - debug and track all discovery runs</p>
          </div>

          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700/30 border-b border-slate-700/50 font-semibold text-sm">
                <div className="col-span-1">Run ID</div>
                <div className="col-span-2">Date & Time</div>
                <div className="col-span-2">Rule Set</div>
                <div className="col-span-1 text-center">Queries</div>
                <div className="col-span-2 text-center">Discovered</div>
                <div className="col-span-2 text-center">Accepted</div>
                <div className="col-span-1 text-center">Discarded</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              {discoveryRuns.map((run) => (
                <div key={run.id}>
                  {/* Main Row */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 hover:bg-slate-700/20 transition-all items-center">
                    <div className="col-span-1">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">{run.id.split('-')[2]}</span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-semibold">{run.date}</p>
                      <p className="text-xs text-slate-400">{run.time} • {run.duration}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                        {run.ruleSet}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className="font-bold">{run.queriesExecuted}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="font-bold text-yellow-300">{run.leadsDiscovered}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="font-bold text-green-400">{run.leadsAccepted}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <p className={`font-bold ${run.leadsDiscarded > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {run.leadsDiscarded}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => toggleRow(run.id)}
                        className="p-2 hover:bg-slate-600/50 rounded-lg transition-all"
                      >
                        {expandedRow === run.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRow === run.id && (
                    <div className="p-6 bg-slate-700/20 border-b border-slate-700/50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Search Queries */}
                        <div>
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Search className="text-yellow-300" size={18} />
                            Search Queries Generated
                          </h3>
                          <div className="space-y-2">
                            {run.details.searchQueries.map((query, idx) => (
                              <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                                <code className="text-sm text-slate-300">{query}</code>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Keywords Used */}
                        <div>
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Target className="text-yellow-300" size={18} />
                            Keywords Used
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {run.details.keywordsUsed.map((keyword, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                                {keyword}
                              </span>
                            ))}
                          </div>

                          {/* Exclusions */}
                          {run.details.exclusionsTriggered.length > 0 && (
                            <>
                              <h3 className="font-bold mb-3 flex items-center gap-2 mt-4">
                                <XCircle className="text-red-400" size={18} />
                                Exclusions Triggered
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {run.details.exclusionsTriggered.map((exclusion, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30">
                                    {exclusion}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Errors/Warnings */}
                      {run.details.errors.length > 0 && (
                        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <h3 className="font-bold mb-2 flex items-center gap-2 text-yellow-400">
                            <AlertTriangle size={18} />
                            Errors / Warnings
                          </h3>
                          {run.details.errors.map((error, idx) => (
                            <p key={idx} className="text-sm text-yellow-300">{error}</p>
                          ))}
                        </div>
                      )}

                      {/* Discard Reasons */}
                      {run.leadsDiscarded > 0 && run.discardReasons && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h3 className="font-bold mb-2 flex items-center gap-2 text-red-400">
                            <XCircle size={18} />
                            Discard Reasons ({run.leadsDiscarded} leads)
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {run.discardReasons.map((reason, idx) => (
                              <li key={idx} className="text-sm text-red-300">{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
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

export default DiscoveryRunsPage;