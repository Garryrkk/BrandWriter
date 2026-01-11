import React, { useState } from 'react';
import { Home, Activity, Users, Settings, BarChart3, Download, Menu, X, Brain, Target, FileText, CheckSquare, Table, FileSpreadsheet, CheckCircle, Calendar } from 'lucide-react';

const ExportsPage = () => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    role: true,
    company: true,
    linkedinUrl: true,
    score: true,
    bucket: true,
    keywords: true,
    notes: false,
    headline: false,
    email: false,
    phone: false,
    firstSeen: false,
    timesSurfaced: false,
    status: true
  });
  const [dateRange, setDateRange] = useState('today');

  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
  ];
  const exportHistory = [
    { id: 1, date: 'Dec 8, 2024 - 10:30 AM', format: 'CSV', leads: 127, fileName: 'leads_dec_8_2024.csv', status: 'completed' },
    { id: 2, date: 'Dec 7, 2024 - 6:15 PM', format: 'Google Sheets', leads: 104, fileName: 'Weekly Leads Export', status: 'completed' },
    { id: 3, date: 'Dec 6, 2024 - 2:45 PM', format: 'CSV', leads: 89, fileName: 'leads_dec_6_2024.csv', status: 'completed' },
    { id: 4, date: 'Dec 5, 2024 - 9:00 AM', format: 'CSV', leads: 156, fileName: 'leads_dec_5_2024.csv', status: 'completed' },
  ];

  const toggleField = (field) => {
    setSelectedFields({ ...selectedFields, [field]: !selectedFields[field] });
  };

  const handleExport = () => {
    console.log('Exporting with format:', exportFormat);
    console.log('Selected fields:', selectedFields);
    console.log('Date range:', dateRange);
  };

  const fieldsList = [
    { key: 'name', label: 'Name', required: true },
    { key: 'role', label: 'Role', required: true },
    { key: 'company', label: 'Company', required: true },
    { key: 'linkedinUrl', label: 'LinkedIn URL', required: true },
    { key: 'score', label: 'Score', required: false },
    { key: 'bucket', label: 'Bucket', required: false },
    { key: 'keywords', label: 'Matched Keywords', required: false },
    { key: 'headline', label: 'Headline', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'firstSeen', label: 'First Seen', required: false },
    { key: 'timesSurfaced', label: 'Times Surfaced', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'notes', label: 'Notes', required: false },
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
            <div className="flex items-center gap-2">
              <Target className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Lead Discovery
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
              <Download className="text-yellow-300" size={36} />
              Exports & Integrations
            </h1>
            <p className="text-slate-400">Get your leads out cleanly and efficiently</p>
          </div>

          {/* Export Configuration */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6">Configure Export</h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column - Format & Filters */}
                <div className="space-y-6">
                  {/* Export Format */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Export Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setExportFormat('csv')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          exportFormat === 'csv'
                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                            : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                        }`}
                      >
                        <FileText className="mx-auto mb-2" size={24} />
                        <p className="font-semibold text-sm">CSV</p>
                      </button>
                      <button
                        onClick={() => setExportFormat('sheets')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          exportFormat === 'sheets'
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                        }`}
                      >
                        <Table className="mx-auto mb-2" size={24} />
                        <p className="font-semibold text-sm">Sheets</p>
                      </button>
                      <button
                        disabled
                        className="p-4 rounded-lg border-2 bg-slate-700/20 border-slate-600/30 text-slate-500 cursor-not-allowed"
                      >
                        <FileSpreadsheet className="mx-auto mb-2" size={24} />
                        <p className="font-semibold text-sm">Notion</p>
                        <p className="text-xs">Soon</p>
                      </button>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                    >
                      <option value="today">Today's Leads</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="all">All Time</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Lead Status</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                    >
                      <option value="all">All Leads</option>
                      <option value="new">New Only</option>
                      <option value="contacted">Contacted Only</option>
                      <option value="skipped">Skipped Only</option>
                    </select>
                  </div>

                  {/* Score Filter */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-300">Minimum Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 80"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                    />
                  </div>
                </div>

                {/* Right Column - Field Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Select Fields to Export</label>
                  <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {fieldsList.map((field) => (
                        <div
                          key={field.key}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            selectedFields[field.key]
                              ? 'bg-yellow-500/10 border border-yellow-500/30'
                              : 'bg-slate-800/50 border border-slate-600/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => !field.required && toggleField(field.key)}
                              disabled={field.required}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedFields[field.key]
                                  ? 'bg-yellow-400 border-yellow-400'
                                  : 'border-slate-500'
                              } ${field.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-yellow-400'}`}
                            >
                              {selectedFields[field.key] && <CheckCircle size={16} className="text-slate-900" />}
                            </button>
                            <span className={`font-medium ${selectedFields[field.key] ? 'text-white' : 'text-slate-400'}`}>
                              {field.label}
                            </span>
                          </div>
                          {field.required && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                              Required
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    {Object.values(selectedFields).filter(Boolean).length} fields selected
                  </p>
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <button
                  onClick={handleExport}
                  className="w-full py-4 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={24} />
                  Export Leads
                </button>
              </div>
            </div>
          </section>

          {/* Export History */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-yellow-300" />
                Recent Exports
              </h2>

              <div className="space-y-3">
                {exportHistory.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-300/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        {exp.format === 'CSV' ? <FileText size={24} /> : <Table size={24} />}
                      </div>
                      <div>
                        <p className="font-bold">{exp.fileName}</p>
                        <p className="text-sm text-slate-400">{exp.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Leads Exported</p>
                        <p className="font-bold text-xl text-yellow-300">{exp.leads}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle size={14} />
                        {exp.status}
                      </span>
                      <button className="p-2 hover:bg-slate-600/50 rounded-lg transition-all text-blue-400">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Integration Cards */}
          <section className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-2xl font-bold mb-6">Future Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-700/20 rounded-lg border border-slate-600/30 text-center">
                  <FileSpreadsheet className="mx-auto mb-3 text-slate-500" size={32} />
                  <h3 className="font-bold mb-2 text-slate-400">Notion</h3>
                  <span className="px-3 py-1 bg-slate-600/30 text-slate-400 rounded-full text-xs">Coming Soon</span>
                </div>
                <div className="p-5 bg-slate-700/20 rounded-lg border border-slate-600/30 text-center">
                  <Table className="mx-auto mb-3 text-slate-500" size={32} />
                  <h3 className="font-bold mb-2 text-slate-400">Airtable</h3>
                  <span className="px-3 py-1 bg-slate-600/30 text-slate-400 rounded-full text-xs">Coming Soon</span>
                </div>
                <div className="p-5 bg-slate-700/20 rounded-lg border border-slate-600/30 text-center">
                  <Users className="mx-auto mb-3 text-slate-500" size={32} />
                  <h3 className="font-bold mb-2 text-slate-400">HubSpot</h3>
                  <span className="px-3 py-1 bg-slate-600/30 text-slate-400 rounded-full text-xs">Coming Soon</span>
                </div>
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

export default ExportsPage;