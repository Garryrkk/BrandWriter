// TemplatesPage.jsx
import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, X, Copy, Eye } from 'lucide-react';

const TemplatesPage = () => {
  const [templates] = useState([
    {
      id: 1,
      name: 'Problem-Solution Framework',
      category: 'LinkedIn Post',
      platforms: ['LinkedIn', 'Facebook'],
      structure: '1. Present the problem\n2. Agitate the issue\n3. Offer solution\n4. Call to action',
      preview: 'Ever struggled with [problem]? You\'re not alone...',
      useCount: 145
    },
    {
      id: 2,
      name: 'Listicle Format',
      category: 'Instagram Carousel',
      platforms: ['Instagram', 'LinkedIn'],
      structure: 'Slide 1: Hook\nSlides 2-9: Individual points\nSlide 10: CTA',
      preview: '10 Things Nobody Tells You About...',
      useCount: 289
    },
    {
      id: 3,
      name: 'Cold Outreach - SaaS',
      category: 'Cold Email',
      platforms: ['Email'],
      structure: 'Subject line\nPersonal opener\nValue proposition\nSocial proof\nSoft CTA',
      preview: 'Subject: Quick question about [Company]\'s growth',
      useCount: 567
    },
    {
      id: 4,
      name: 'Hook-Story-Lesson',
      category: 'YouTube Short',
      platforms: ['YouTube', 'TikTok', 'Instagram Reels'],
      structure: 'Hook (0-3s)\nStory/Context (3-20s)\nLesson/Takeaway (20-30s)',
      preview: '[Hook] This changed everything...',
      useCount: 234
    },
    {
      id: 5,
      name: 'Newsletter - Weekly Roundup',
      category: 'Newsletter',
      platforms: ['Email'],
      structure: 'Opening hook\n3 trending topics\n2 tool recommendations\n1 pro tip\nClosing CTA',
      preview: 'This week: 3 trends that matter...',
      useCount: 89
    },
    {
      id: 6,
      name: 'Influencer DM - Collaboration',
      category: 'Cold DM',
      platforms: ['Instagram', 'Twitter'],
      structure: 'Compliment\nCommon ground\nCollaboration idea\nNext step',
      preview: 'Hey! Loved your recent post about...',
      useCount: 178
    },
    {
      id: 7,
      name: 'Case Study Template',
      category: 'LinkedIn Post',
      platforms: ['LinkedIn'],
      structure: 'Challenge faced\nStrategy implemented\nResults achieved\nKey lessons\nCTA',
      preview: 'How we helped [Client] achieve [Result]...',
      useCount: 203
    },
    {
      id: 8,
      name: 'Poll & Engage',
      category: 'Instagram Story',
      platforms: ['Instagram'],
      structure: 'Question sticker\nPoll options\nFollow-up context\nSwipe up CTA',
      preview: 'Quick question: Which one do you prefer?',
      useCount: 412
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['All', 'LinkedIn Post', 'Instagram Carousel', 'Cold Email', 'YouTube Short', 'Newsletter', 'Cold DM', 'Instagram Story'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="text-yellow-300" />
              Templates Library
            </h1>
            <p className="text-gray-400">Manage content templates for consistent, high-quality generation</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Create Template
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{filteredTemplates.length}</span> of {templates.length} templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onView={setSelectedTemplate}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
            <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No templates found</p>
          </div>
        )}
      </div>

      {/* View/Edit Modal */}
      {selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
      )}

      {/* Create Modal */}
      {isCreating && (
        <CreateTemplateModal onClose={() => setIsCreating(false)} />
      )}
    </div>
  );
};

const TemplateCard = ({ template, onView }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'LinkedIn Post': 'from-blue-500 to-blue-600',
      'Instagram Carousel': 'from-pink-500 to-purple-600',
      'Cold Email': 'from-emerald-500 to-teal-600',
      'YouTube Short': 'from-red-500 to-red-600',
      'Newsletter': 'from-yellow-500 to-orange-600',
      'Cold DM': 'from-purple-500 to-pink-600',
      'Instagram Story': 'from-pink-500 to-red-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-yellow-300 transition-all overflow-hidden group">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor(template.category)} px-4 py-3`}>
        <h3 className="text-white font-bold text-lg">{template.name}</h3>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-1">Category</p>
          <p className="text-white font-semibold">{template.category}</p>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-1">Platforms</p>
          <div className="flex flex-wrap gap-1">
            {template.platforms.map(platform => (
              <span key={platform} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-1">Preview</p>
          <p className="text-white text-sm line-clamp-2">{template.preview}</p>
        </div>

        <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
          <span>Used {template.useCount} times</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(template)}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
          >
            <Eye size={14} />
            View
          </button>
          <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm">
            <Edit size={14} />
            Edit
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-all">
            <Copy size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplateModal = ({ template, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{template.name}</h2>
            <p className="text-gray-400 text-sm">{template.category}</p>
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
          {/* Platforms */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Supported Platforms</p>
            <div className="flex flex-wrap gap-2">
              {template.platforms.map(platform => (
                <span key={platform} className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Structure */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Template Structure</p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <pre className="text-white text-sm whitespace-pre-line">{template.structure}</pre>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Example Output</p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <p className="text-white">{template.preview}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Usage Statistics</p>
            <p className="text-white text-2xl font-bold mt-1">{template.useCount} times</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <Edit size={18} />
              Edit Template
            </button>
            <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <Copy size={18} />
              Duplicate
            </button>
            <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-3 px-6 rounded-lg transition-all flex items-center gap-2">
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateTemplateModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'LinkedIn Post',
    platforms: [],
    structure: '',
    preview: ''
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create New Template</h2>
            <p className="text-gray-400 text-sm">Define a reusable content structure</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Problem-Solution Framework"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            >
              <option>LinkedIn Post</option>
              <option>Instagram Carousel</option>
              <option>Cold Email</option>
              <option>YouTube Short</option>
              <option>Newsletter</option>
              <option>Cold DM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Template Structure</label>
            <textarea
              value={formData.structure}
              onChange={(e) => setFormData({...formData, structure: e.target.value})}
              rows={8}
              placeholder="Define the structure of your template..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Example Preview</label>
            <textarea
              value={formData.preview}
              onChange={(e) => setFormData({...formData, preview: e.target.value})}
              rows={4}
              placeholder="Show an example of this template in action..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button className="flex-1 bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 font-bold py-3 rounded-lg transition-all">
              Create Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;