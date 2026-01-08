import React, { useState } from 'react';
import { Home, Activity, Users, Settings, BarChart3, Download, Menu, X, Brain, Target, Plus, Trash2, Save, Eye, AlertCircle, ToggleLeft, ToggleRight, Sliders } from 'lucide-react';

const RulesTargetingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');
  const [newRole, setNewRole] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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

  const [roles, setRoles] = useState([
    { name: 'AI Product Lead', weight: 10, enabled: true },
    { name: 'ML Engineer', weight: 8, enabled: true },
    { name: 'Founder & CEO', weight: 9, enabled: true },
    { name: 'VP Engineering', weight: 7, enabled: true },
    { name: 'Head of AI', weight: 8, enabled: true },
  ]);

  const [keywordClusters, setKeywordClusters] = useState([
    { name: 'GenAI', keywords: ['GPT', 'LLM', 'Generative AI', 'Foundation Models'], weight: 10, enabled: true },
    { name: 'AI Infrastructure', keywords: ['MLOps', 'AI Platform', 'Model Training'], weight: 8, enabled: true },
    { name: 'Machine Learning', keywords: ['Deep Learning', 'Neural Networks', 'ML'], weight: 7, enabled: true },
    { name: 'AI Research', keywords: ['Research Scientist', 'AI Lab', 'Publications'], weight: 6, enabled: false },
  ]);

  const [exclusions, setExclusions] = useState([
    { keyword: 'recruiting', type: 'hard' },
    { keyword: 'hiring manager', type: 'hard' },
    { keyword: 'student', type: 'hard' },
    { keyword: 'intern', type: 'hard' },
  ]);

  const previewQueries = [
    'AI Product Lead GenAI site:linkedin.com',
    'ML Engineer LLM site:linkedin.com',
    'Founder & CEO AI Infrastructure site:linkedin.com',
    'VP Engineering MLOps site:linkedin.com',
    'Head of AI Machine Learning site:linkedin.com',
  ];

  const addRole = () => {
    if (newRole.trim()) {
      setRoles([...roles, { name: newRole.trim(), weight: 5, enabled: true }]);
      setNewRole('');
    }
  };

  const removeRole = (index) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const toggleRole = (index) => {
    setRoles(roles.map((role, i) => i === index ? { ...role, enabled: !role.enabled } : role));
  };

  const updateRoleWeight = (index, weight) => {
    setRoles(roles.map((role, i) => i === index ? { ...role, weight: parseInt(weight) } : role));
  };

  const toggleCluster = (index) => {
    setKeywordClusters(keywordClusters.map((cluster, i) => i === index ? { ...cluster, enabled: !cluster.enabled } : cluster));
  };

  const updateClusterWeight = (index, weight) => {
    setKeywordClusters(keywordClusters.map((cluster, i) => i === index ? { ...cluster, weight: parseInt(weight) } : cluster));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions([...exclusions, { keyword: newExclusion.trim(), type: 'hard' }]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

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
            <button className="px-6 py-2 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Save size={20} />
              Save Rules
            </button>
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
              <Settings className="text-yellow-300" size={36} />
              Rules & Targeting
            </h1>
            <p className="text-slate-400">Control your targeting without code - iterate and refine</p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-blue-400 font-semibold mb-1">Important</p>
              <p className="text-slate-400 text-sm">Changes don't affect past runs. Changes apply to next run only.</p>
            </div>
          </div>

          {/* Roles Section */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-yellow-300" />
                Target Roles
              </h2>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRole()}
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                    placeholder="Add a new role (e.g., Director of AI)"
                  />
                  <button
                    onClick={addRole}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {roles.map((role, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleRole(index)}
                          className="p-2 hover:bg-slate-600/50 rounded transition-all"
                        >
                          {role.enabled ? <ToggleRight className="text-green-400" size={24} /> : <ToggleLeft className="text-slate-500" size={24} />}
                        </button>
                        <span className={`font-semibold ${role.enabled ? 'text-white' : 'text-slate-500'}`}>{role.name}</span>
                      </div>
                      <button
                        onClick={() => removeRole(index)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sliders size={16} className="text-slate-400" />
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={role.weight}
                        onChange={(e) => updateRoleWeight(index, e.target.value)}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        disabled={!role.enabled}
                      />
                      <span className="text-sm font-bold text-yellow-300 w-8 text-right">{role.weight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Keyword Clusters */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="text-yellow-300" />
                Keyword Clusters
              </h2>

              <div className="space-y-4">
                {keywordClusters.map((cluster, index) => (
                  <div key={index} className="p-5 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleCluster(index)}
                          className="p-2 hover:bg-slate-600/50 rounded transition-all"
                        >
                          {cluster.enabled ? <ToggleRight className="text-green-400" size={24} /> : <ToggleLeft className="text-slate-500" size={24} />}
                        </button>
                        <h3 className={`font-bold text-lg ${cluster.enabled ? 'text-white' : 'text-slate-500'}`}>{cluster.name}</h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {cluster.keywords.map((keyword, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          cluster.enabled ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-600/20 text-slate-500 border border-slate-600/30'
                        }`}>
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <Sliders size={16} className="text-slate-400" />
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={cluster.weight}
                        onChange={(e) => updateClusterWeight(index, e.target.value)}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        disabled={!cluster.enabled}
                      />
                      <span className="text-sm font-bold text-yellow-300 w-8 text-right">{cluster.weight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Exclusions */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertCircle className="text-red-400" />
                Exclusions (Hard Filters)
              </h2>

              <p className="text-slate-400 text-sm mb-6">These keywords will automatically disqualify leads</p>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-300/50 transition-all"
                    placeholder="Add exclusion keyword (e.g., recruiter)"
                  />
                  <button
                    onClick={addExclusion}
                    className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all flex items-center gap-2 border border-red-500/30"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {exclusions.map((exclusion, index) => (
                  <div key={index} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-semibold flex items-center gap-2 border border-red-500/30">
                    {exclusion.keyword}
                    <button
                      onClick={() => removeExclusion(index)}
                      className="hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Query Preview */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="text-yellow-300" />
                  Query Preview
                </h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold transition-all border border-blue-500/30"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>

              {showPreview && (
                <div className="space-y-2">
                  {previewQueries.map((query, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <code className="text-sm text-green-400">{query}</code>
                    </div>
                  ))}
                </div>
              )}
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

export default RulesTargetingPage;