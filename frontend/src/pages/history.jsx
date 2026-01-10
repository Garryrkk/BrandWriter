// HistoryPage.jsx
import React, { useState } from 'react';
import { History, Search, Download, Eye, X, CheckCircle, Clock, XCircle } from 'lucide-react';

const HistoryPage = () => {
  const [history] = useState([
    {
      id: 'GEN-2025-001',
      category: 'LinkedIn Post',
      platform: 'LinkedIn',
      variationId: 'VAR-3',
      generatedAt: '2025-01-20 14:30:22',
      ragDocs: ['Brand Voice Guide', 'Industry Research 2025', 'Competitor Analysis'],
      status: 'Posted',
      content: '5 biggest mistakes founders make when pitching investors...',
      engagement: { likes: 245, comments: 34, shares: 12 }
    },
    {
      id: 'GEN-2025-002',
      category: 'Instagram Carousel',
      platform: 'Instagram',
      variationId: 'VAR-1',
      generatedAt: '2025-01-20 12:15:10',
      ragDocs: ['Visual Guidelines', 'Instagram Best Practices', 'Color Palette'],
      status: 'Scheduled',
      content: 'Instagram Growth Strategy for 2025...',
      scheduledFor: '2025-01-22 18:00:00'
    },
    {
      id: 'GEN-2025-003',
      category: 'Cold Email',
      platform: 'Email',
      variationId: 'VAR-2',
      generatedAt: '2025-01-20 09:45:33',
      ragDocs: ['Email Templates', 'SaaS Outreach Guide', 'Lead Database'],
      status: 'Generated',
      content: 'Subject: Quick question about [Company]\'s growth...'
    },
    {
      id: 'GEN-2025-004',
      category: 'YouTube Short',
      platform: 'YouTube',
      variationId: 'VAR-1',
      generatedAt: '2025-01-19 16:20:45',
      ragDocs: ['Video Script Templates', 'YouTube Trends Q1', 'Hook Library'],
      status: 'Posted',
      content: 'Stop wasting 3 hours a day on repetitive tasks...',
      engagement: { views: 12400, likes: 890, comments: 67 }
    },
    {
      id: 'GEN-2025-005',
      category: 'Newsletter',
      platform: 'Email',
      variationId: 'VAR-3',
      generatedAt: '2025-01-19 08:00:00',
      ragDocs: ['Newsletter Archive', 'Industry News', 'Tool Reviews'],
      status: 'Posted',
      content: 'This week in marketing: 3 trends you can\'t ignore...',
      engagement: { opens: 2340, clicks: 567, unsubscribes: 12 }
    },
    {
      id: 'GEN-2025-006',
      category: 'Instagram Reel',
      platform: 'Instagram',
      variationId: 'VAR-2',
      generatedAt: '2025-01-18 14:30:00',
      ragDocs: ['Reel Scripts', 'Trending Audio', 'Hook Formulas'],
      status: 'Failed',
      content: 'POV: You just discovered the easiest way to create content...',
      error: 'API Rate Limit Exceeded'
    },
    {
      id: 'GEN-2025-007',
      category: 'LinkedIn Post',
      platform: 'LinkedIn',
      variationId: 'VAR-1',
      generatedAt: '2025-01-18 11:00:00',
      ragDocs: ['Brand Voice Guide', 'Leadership Topics', 'Case Studies'],
      status: 'Scheduled',
      content: 'The future of AI in marketing is not what you think...',
      scheduledFor: '2025-01-21 09:00:00'
    },
    {
      id: 'GEN-2025-008',
      category: 'Cold DM',
      platform: 'Instagram',
      variationId: 'VAR-3',
      generatedAt: '2025-01-17 15:30:00',
      ragDocs: ['DM Templates', 'Influencer Database', 'Outreach Strategy'],
      status: 'Generated',
      content: 'Hey! Love your content on [topic]...'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      Posted: 'bg-green-500/20 text-green-400 border-green-500/30',
      Scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Generated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    const icons = {
      Posted: CheckCircle,
      Scheduled: Clock,
      Generated: Eye,
      Failed: XCircle
    };
    
    const Icon = icons[status];
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <History className="text-yellow-300" />
            Generation History
          </h1>
          <p className="text-gray-400">Track all your content generations and their performance</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by category, platform, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'posted', 'scheduled', 'generated', 'failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{filteredHistory.length}</span> of {history.length} generations
          </p>
          <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all">
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* History Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">ID</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">Category</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">Platform</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">Variation</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">Generated At</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">Status</th>
                  <th className="text-left px-6 py-4 text-gray-300 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, idx) => (
                  <tr 
                    key={item.id}
                    className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                      idx % 2 === 0 ? 'bg-gray-800/20' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-6 py-4 text-yellow-300 font-mono text-sm">{item.id}</td>
                    <td className="px-6 py-4 text-white text-sm">{item.category}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{item.platform}</td>
                    <td className="px-6 py-4 text-pink-300 font-mono text-sm">{item.variationId}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{item.generatedAt}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-yellow-300 hover:text-yellow-400 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center mt-6">
            <History size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No history found matching your filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <HistoryDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

const HistoryDetailModal = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{item.category}</h2>
            <p className="text-gray-400 text-sm">{item.id} • {item.variationId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Platform</p>
              <p className="text-white font-semibold">{item.platform}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <div className="mt-1">
                {item.status === 'Posted' && <span className="text-green-400 font-semibold">✓ Posted</span>}
                {item.status === 'Scheduled' && <span className="text-blue-400 font-semibold">⏰ Scheduled</span>}
                {item.status === 'Generated' && <span className="text-yellow-400 font-semibold">• Generated</span>}
                {item.status === 'Failed' && <span className="text-red-400 font-semibold">✕ Failed</span>}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Generated At</p>
              <p className="text-white">{item.generatedAt}</p>
            </div>
            {item.scheduledFor && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Scheduled For</p>
                <p className="text-white">{item.scheduledFor}</p>
              </div>
            )}
          </div>

          {/* RAG Documents */}
          <div>
            <p className="text-gray-400 text-sm mb-2">RAG Documents Used</p>
            <div className="flex flex-wrap gap-2">
              {item.ragDocs.map((doc, idx) => (
                <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30">
                  {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Content</p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <p className="text-white">{item.content}</p>
            </div>
          </div>

          {/* Engagement Stats */}
          {item.engagement && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Performance</p>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(item.engagement).map(([key, value]) => (
                  <div key={key} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                    <p className="text-gray-400 text-xs mb-1 capitalize">{key}</p>
                    <p className="text-white text-2xl font-bold">{value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {item.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400"><strong>Error:</strong> {item.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;