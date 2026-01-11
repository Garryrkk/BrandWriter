import React, { useState } from 'react';

import { Home, Activity, Users, Settings, BarChart3, Download, Menu, X, Brain, Target, ArrowLeft, ExternalLink, Check, XCircle, StickyNote, Calendar, Award, TrendingUp, Briefcase, MapPin, Mail, Phone } from 'lucide-react';

const LeadDetailPage = () => {
  const [note, setNote] = useState('');

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
  ];

  const leadDetail = {
    id: 1,
    name: 'Sarah Chen',
    role: 'AI Product Lead',
    company: 'Anthropic',
    bucket: 'Builder',
    score: 92,
    headline: 'Building the future of AI safety | Ex-Google Brain | Stanford CS PhD',
    location: 'San Francisco, CA',
    email: 'sarah.chen@anthropic.com',
    phone: '+1 (415) 555-0123',
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    firstSeen: 'Dec 8, 2024',
    timesSurfaced: 1,
    status: 'new',
    matchedRoles: ['AI Product Lead', 'Product Manager AI'],
    matchedKeywords: ['GenAI', 'LLM', 'Product', 'AI Safety', 'Machine Learning'],
    scoreBreakdown: {
      roleMatch: 35,
      keywordRelevance: 30,
      seniorityLevel: 15,
      companyRelevance: 12
    },
    recentActivity: [
      { date: 'Dec 7, 2024', activity: 'Posted about AI safety frameworks on LinkedIn' },
      { date: 'Dec 5, 2024', activity: 'Shared article on LLM evaluation methods' },
      { date: 'Dec 3, 2024', activity: 'Attended AI Safety Summit 2024' }
    ],
    about: 'Passionate about building safe and beneficial AI systems. Currently leading product development for next-generation language models at Anthropic. Previously worked on Google Brain\'s research team, focusing on AI alignment and safety. PhD in Computer Science from Stanford, specializing in reinforcement learning and human feedback systems.',
    experience: [
      { title: 'AI Product Lead', company: 'Anthropic', duration: '2023 - Present' },
      { title: 'Senior Product Manager', company: 'Google Brain', duration: '2020 - 2023' },
      { title: 'ML Research Engineer', company: 'DeepMind', duration: '2018 - 2020' }
    ]
  };

  const handleAction = (action) => {
    console.log(`Action: ${action}`);
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
            <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-2">
              <ArrowLeft size={18} />
              Back to Inbox
            </button>
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
              Lead Detail
            </h1>
            <p className="text-slate-400">Full context to personalize your DMs fast</p>
          </div>

          {/* Profile Header */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-3xl">
                    {leadDetail.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{leadDetail.name}</h2>
                    <p className="text-xl text-slate-300 mb-3">{leadDetail.role} at {leadDetail.company}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {leadDetail.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={16} />
                        {leadDetail.email}
                      </span>
                    </div>
                    <p className="text-slate-300 max-w-2xl">{leadDetail.headline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg font-bold text-2xl">
                      {leadDetail.score}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    leadDetail.bucket === 'Builder' ? 'bg-blue-500/20 text-blue-400' :
                    leadDetail.bucket === 'Buyer' ? 'bg-green-500/20 text-green-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {leadDetail.bucket}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('contacted')}
                  className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-green-500/30"
                >
                  <Check size={20} />
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleAction('skip')}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-red-500/30"
                >
                  <XCircle size={20} />
                  Skip Lead
                </button>
                <a
                  href={leadDetail.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-blue-500/30"
                >
                  <ExternalLink size={20} />
                  Open LinkedIn
                </a>
              </div>
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Main Info */}
            <div className="xl:col-span-2 space-y-8">
              {/* Score Breakdown */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award className="text-yellow-300" />
                  Score Breakdown (Why they scored high)
                </h3>
                <div className="space-y-4">
                  {Object.entries(leadDetail.scoreBreakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-yellow-300 font-bold">{value} pts</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-pink-400"
                          style={{ width: `${(value / 35) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Roles & Keywords */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Target className="text-yellow-300" />
                  Matched Criteria
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 mb-3">Matched Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {leadDetail.matchedRoles.map((role, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold border border-blue-500/30">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400 mb-3">Matched Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {leadDetail.matchedKeywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold border border-green-500/30">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold mb-4">About</h3>
                <p className="text-slate-300 leading-relaxed">{leadDetail.about}</p>
              </div>

              {/* Experience */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="text-yellow-300" />
                  Experience
                </h3>
                <div className="space-y-4">
                  {leadDetail.experience.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <p className="font-bold text-lg">{exp.title}</p>
                      <p className="text-slate-400">{exp.company}</p>
                      <p className="text-sm text-slate-500 mt-1">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Discovery Info */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-yellow-300" />
                  Discovery Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">First Seen</p>
                    <p className="font-semibold">{leadDetail.firstSeen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Times Surfaced</p>
                    <p className="font-semibold">{leadDetail.timesSurfaced}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Current Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                      leadDetail.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                      leadDetail.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {leadDetail.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-yellow-300" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {leadDetail.recentActivity.map((activity, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-700/50 last:border-b-0 last:pb-0">
                      <p className="text-xs text-slate-400 mb-1">{activity.date}</p>
                      <p className="text-sm text-slate-300">{activity.activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <StickyNote className="text-yellow-300" />
                  Add Note
                </h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                  rows="4"
                  placeholder="Add notes about this lead..."
                />
                <button className="w-full mt-3 py-2 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg transition-all">
                  Save Note
                </button>
              </div>
            </div>
          </div>

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

export default LeadDetailPage;