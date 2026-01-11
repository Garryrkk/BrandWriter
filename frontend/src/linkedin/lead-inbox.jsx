import React, { useState } from 'react';
import { Home, FileText, Search, Settings, BarChart3, Download, Menu, X, Brain, Target, Activity, Users, Filter, ExternalLink, Check, StickyNote, Star, ChevronDown, XCircle } from 'lucide-react';

const LeadInboxPage = () => {
  const [filters, setFilters] = useState({
    scoreMin: 0,
    scoreMax: 100,
    bucket: 'all',
    role: 'all',
    keyword: 'all',
    status: 'new'
  });

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
  ];

  const leads = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'AI Product Lead',
      company: 'Anthropic',
      bucket: 'Builder',
      score: 92,
      keywords: ['GenAI', 'LLM', 'Product'],
      status: 'new',
      headline: 'Building the future of AI safety | Ex-Google Brain',
      linkedinUrl: 'https://linkedin.com/in/sarahchen'
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      role: 'Founder & CEO',
      company: 'Vector AI',
      bucket: 'Founder',
      score: 88,
      keywords: ['AI Infrastructure', 'Startup', 'Founder'],
      status: 'new',
      headline: 'Building AI infrastructure for the next generation',
      linkedinUrl: 'https://linkedin.com/in/mikerodriguez'
    },
    {
      id: 3,
      name: 'Emily Watson',
      role: 'ML Engineer',
      company: 'OpenAI',
      bucket: 'Builder',
      score: 85,
      keywords: ['Machine Learning', 'GPT', 'Research'],
      status: 'contacted',
      headline: 'ML Engineer @ OpenAI | Training large language models',
      linkedinUrl: 'https://linkedin.com/in/emilywatson'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'VP Engineering',
      company: 'Databricks',
      bucket: 'Buyer',
      score: 82,
      keywords: ['Data Platform', 'MLOps', 'Enterprise'],
      status: 'new',
      headline: 'VP Engineering at Databricks | Building data + AI platform',
      linkedinUrl: 'https://linkedin.com/in/davidkim'
    },
    {
      id: 5,
      name: 'Jessica Park',
      role: 'Head of AI',
      company: 'Stripe',
      bucket: 'Buyer',
      score: 80,
      keywords: ['AI Strategy', 'FinTech', 'ML'],
      status: 'new',
      headline: 'Head of AI @ Stripe | Scaling AI in payments',
      linkedinUrl: 'https://linkedin.com/in/jessicapark'
    },
    {
      id: 6,
      name: 'Alex Turner',
      role: 'Senior ML Engineer',
      company: 'Meta',
      bucket: 'Builder',
      score: 78,
      keywords: ['Computer Vision', 'Deep Learning'],
      status: 'skipped',
      headline: 'Senior ML Engineer @ Meta | Working on Llama models',
      linkedinUrl: 'https://linkedin.com/in/alexturner'
    },
    {
      id: 7,
      name: 'Rachel Green',
      role: 'AI Research Scientist',
      company: 'DeepMind',
      bucket: 'Builder',
      score: 95,
      keywords: ['AI Research', 'Reinforcement Learning', 'GenAI'],
      status: 'new',
      headline: 'Research Scientist @ DeepMind | PhD in ML from Stanford',
      linkedinUrl: 'https://linkedin.com/in/rachelgreen'
    }
  ];

  const filteredLeads = leads.filter(lead => {
    if (filters.scoreMin && lead.score < filters.scoreMin) return false;
    if (filters.scoreMax && lead.score > filters.scoreMax) return false;
    if (filters.bucket !== 'all' && lead.bucket !== filters.bucket) return false;
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    return true;
  }).sort((a, b) => b.score - a.score);

  const handleAction = (leadId, action) => {
    console.log(`${action} lead ${leadId}`);
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
            <div className="flex items-center gap-2">
              <Target className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Lead Discovery
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm">
              <span className="text-slate-400">Today's Leads:</span>
              <span className="ml-2 font-semibold text-yellow-300">{filteredLeads.length}</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 p-6 lg:p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="text-yellow-300" size={36} />
              Lead Inbox
            </h1>
            <p className="text-slate-400">Your daily workhorse - sorted by score (high to low)</p>
          </div>

          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700/30 border-b border-slate-700/50 font-semibold text-sm">
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Company</div>
                <div className="col-span-1">Bucket</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-2">Keywords</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 hover:bg-slate-700/20 transition-all items-center">
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{lead.name}</p>
                        {lead.score >= 90 && <Star size={14} className="text-yellow-400 inline" />}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm">{lead.role}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-semibold">{lead.company}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lead.bucket === 'Builder' ? 'bg-blue-500/20 text-blue-400' :
                      lead.bucket === 'Buyer' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {lead.bucket}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`px-3 py-1 rounded-lg font-bold ${
                      lead.score >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                      lead.score >= 80 ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {lead.score}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {lead.keywords.slice(0, 2).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-600/50 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lead.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                      lead.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center gap-1">
                    <button
                      onClick={() => handleAction(lead.id, 'contacted')}
                      className="p-1.5 hover:bg-green-500/20 rounded transition-all text-green-400"
                      title="Mark Contacted"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(lead.id, 'skip')}
                      className="p-1.5 hover:bg-red-500/20 rounded transition-all text-red-400"
                      title="Skip"
                    >
                      <X size={16} />
                    </button>
                    <a
                      href={lead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-blue-500/20 rounded transition-all text-blue-400"
                      title="Open LinkedIn"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleAction(lead.id, 'note')}
                      className="p-1.5 hover:bg-purple-500/20 rounded transition-all text-purple-400"
                      title="Add Note"
                    >
                      <StickyNote size={16} />
                    </button>
                  </div>
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

export default LeadInboxPage;