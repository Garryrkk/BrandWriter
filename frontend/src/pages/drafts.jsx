// DraftsPage.jsx
import React, { useState } from 'react';
import { FileText, Edit, ShoppingBasket, Trash2, X, RefreshCw, Search, Filter } from 'lucide-react';

const DraftsPage = () => {
  const [drafts] = useState([
    {
      id: 1,
      title: '5 Biggest Mistakes Founders Make When Pitching',
      preview: 'Every founder thinks they have the perfect pitch. But here\'s the truth - most pitches fail before they even start...',
      category: 'LinkedIn Post',
      platform: 'LinkedIn',
      generated: '2025-01-20',
      tone: 'Professional',
      wordCount: 245
    },
    {
      id: 2,
      title: 'Instagram Growth Strategy for 2025',
      preview: 'The algorithm changed again. But this time, it\'s actually good news for creators who know how to adapt...',
      category: 'Instagram Carousel',
      platform: 'Instagram',
      generated: '2025-01-19',
      tone: 'Casual',
      wordCount: 180
    },
    {
      id: 3,
      title: 'Cold Email Template: SaaS Outreach',
      preview: 'Subject: Quick question about [Company]\'s growth\n\nHi [Name], I noticed you recently...',
      category: 'Cold Email',
      platform: 'Email',
      generated: '2025-01-19',
      tone: 'Professional',
      wordCount: 156
    },
    {
      id: 4,
      title: 'YouTube Short: AI Automation Trick',
      preview: '[Hook] Stop wasting 3 hours a day on repetitive tasks. [Body] This AI trick will change everything...',
      category: 'YouTube Short',
      platform: 'YouTube',
      generated: '2025-01-18',
      tone: 'Inspiring',
      wordCount: 89
    },
    {
      id: 5,
      title: 'Newsletter: Weekly Marketing Roundup',
      preview: 'This week in marketing: 3 trends you can\'t ignore, 2 tools that will save you hours, and 1 strategy...',
      category: 'Newsletter',
      platform: 'Email',
      generated: '2025-01-18',
      tone: 'Educational',
      wordCount: 890
    },
    {
      id: 6,
      title: 'IG Reel Script: Content Creation Hack',
      preview: '[Scene 1] POV: You just discovered the easiest way to create content [Scene 2] Show phone screen...',
      category: 'Instagram Reel',
      platform: 'Instagram',
      generated: '2025-01-17',
      tone: 'Humorous',
      wordCount: 67
    }
  ]);

  const [filters, setFilters] = useState({
    category: 'all',
    platform: 'all',
    tone: 'all',
    search: ''
  });

  const [editingDraft, setEditingDraft] = useState(null);

  const categories = ['All', 'LinkedIn Post', 'Instagram Carousel', 'Instagram Reel', 'YouTube Short', 'Newsletter', 'Cold Email', 'Cold DM'];
  const platforms = ['All', 'LinkedIn', 'Instagram', 'YouTube', 'Email'];
  const tones = ['All', 'Professional', 'Casual', 'Inspiring', 'Educational', 'Humorous'];

  const filteredDrafts = drafts.filter(draft => {
    if (filters.category !== 'all' && draft.category !== filters.category) return false;
    if (filters.platform !== 'all' && draft.platform !== filters.platform) return false;
    if (filters.tone !== 'all' && draft.tone !== filters.tone) return false;
    if (filters.search && !draft.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="text-yellow-300" />
            Drafts
          </h1>
          <p className="text-gray-400">Manage and edit your saved content drafts</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-yellow-300" size={20} />
            <h2 className="text-white font-bold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search drafts..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select 
                value={filters.platform}
                onChange={(e) => setFilters({...filters, platform: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {platforms.map(plat => (
                  <option key={plat} value={plat.toLowerCase()}>{plat}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
              <select 
                value={filters.tone}
                onChange={(e) => setFilters({...filters, tone: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {tones.map(tone => (
                  <option key={tone} value={tone.toLowerCase()}>{tone}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: 'all', platform: 'all', tone: 'all', search: '' })}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{filteredDrafts.length}</span> of {drafts.length} drafts
          </p>
        </div>

        {/* Drafts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map(draft => (
            <DraftCard key={draft.id} draft={draft} onEdit={setEditingDraft} />
          ))}
        </div>

        {filteredDrafts.length === 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
            <FileText size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No drafts found matching your filters</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDraft && (
        <EditDraftModal draft={editingDraft} onClose={() => setEditingDraft(null)} />
      )}
    </div>
  );
};

const DraftCard = ({ draft, onEdit }) => {
  const platformColors = {
    LinkedIn: 'from-blue-500 to-blue-600',
    Instagram: 'from-pink-500 to-purple-600',
    YouTube: 'from-red-500 to-red-600',
    Email: 'from-emerald-500 to-teal-600'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-yellow-300 transition-all overflow-hidden">
      {/* Platform Badge */}
      <div className={`bg-gradient-to-r ${platformColors[draft.platform]} px-4 py-2`}>
        <p className="text-white text-sm font-bold">{draft.platform}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{draft.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">{draft.preview}</p>

        {/* Meta Info */}
        <div className="space-y-1 mb-4 text-xs text-gray-400">
          <p><span className="text-gray-300 font-medium">Category:</span> {draft.category}</p>
          <p><span className="text-gray-300 font-medium">Generated:</span> {draft.generated}</p>
          <p><span className="text-gray-300 font-medium">Tone:</span> {draft.tone}</p>
          <p><span className="text-gray-300 font-medium">Words:</span> {draft.wordCount}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(draft)}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
          >
            <Edit size={14} />
            Edit
          </button>
          <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm">
            <ShoppingBasket size={14} />
            Basket
          </button>
          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 px-3 rounded-lg transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EditDraftModal = ({ draft, onClose }) => {
  const [content, setContent] = useState(draft.preview);
  const [tone, setTone] = useState(draft.tone);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Edit Draft</h2>
            <p className="text-gray-400 text-sm">{draft.title}</p>
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
          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Inspiring">Inspiring</option>
              <option value="Educational">Educational</option>
              <option value="Humorous">Humorous</option>
            </select>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              Regenerate
            </button>
            <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <ShoppingBasket size={18} />
              Move to Basket
            </button>
            <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;