import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, X, Copy, Eye, RefreshCw, BarChart3 } from 'lucide-react';

const API_BASE_URL = '/api/templates';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const categories = [
    'All',
    'LINKEDIN_POST',
    'INSTAGRAM_CAROUSEL',
    'COLD_EMAIL',
    'YOUTUBE_SHORT',
    'NEWSLETTER',
    'COLD_DM',
    'INSTAGRAM_STORY',
    'TWITTER_THREAD',
    'BLOG_POST'
  ];

  const platforms = [
    'All',
    'LINKEDIN',
    'INSTAGRAM',
    'TWITTER',
    'FACEBOOK',
    'YOUTUBE',
    'TIKTOK',
    'EMAIL'
  ];

  // Fetch templates with filters
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterPlatform !== 'all') params.append('platform', filterPlatform);
      if (activeOnly) params.append('active', 'true');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.items);
      setTotal(data.total);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (error) {
      console.error('Error fetching templates:', error);
      alert('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch template statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create template
  const createTemplate = async (templateData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) throw new Error('Failed to create template');
      
      const newTemplate = await response.json();
      await fetchTemplates();
      setIsCreating(false);
      alert('Template created successfully!');
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
      return null;
    }
  };

  // Update template
  const updateTemplate = async (templateId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update template');
      
      const updated = await response.json();
      await fetchTemplates();
      alert('Template updated successfully!');
      return updated;
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template. Please try again.');
      return null;
    }
  };

  // Duplicate template
  const duplicateTemplate = async (templateId, newName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${templateId}/duplicate?new_name=${encodeURIComponent(newName)}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to duplicate template');
      
      const duplicated = await response.json();
      await fetchTemplates();
      alert('Template duplicated successfully!');
      return duplicated;
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template. Please try again.');
      return null;
    }
  };

  // Delete template
  const deleteTemplate = async (templateId, hardDelete = false) => {
    if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'deactivate'} this template?`)) {
      return;
    }

    try {
      const url = hardDelete 
        ? `${API_BASE_URL}/${templateId}?hard_delete=true`
        : `${API_BASE_URL}/${templateId}`;
      
      const response = await fetch(url, { method: 'DELETE' });

      if (!response.ok) throw new Error('Failed to delete template');
      
      await fetchTemplates();
      setSelectedTemplate(null);
      alert(`Template ${hardDelete ? 'deleted' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  // Get template by ID
  const fetchTemplateById = async (templateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      const data = await response.json();
      setSelectedTemplate(data);
    } catch (error) {
      console.error('Error fetching template:', error);
      alert('Failed to load template details.');
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchStats();
  }, [page, filterCategory, filterPlatform, activeOnly, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCategoryFilter = (value) => {
    setFilterCategory(value);
    setPage(1);
  };

  const handlePlatformFilter = (value) => {
    setFilterPlatform(value);
    setPage(1);
  };

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
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-lg transition-all flex items-center gap-2"
            >
              <BarChart3 size={20} />
              Stats
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Create Template
            </button>
          </div>
        </div>

        {/* Stats Banner */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 text-sm mb-1">Total Templates</p>
              <p className="text-white text-2xl font-bold">{stats.total_templates || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-300 text-sm mb-1">Active Templates</p>
              <p className="text-white text-2xl font-bold">{stats.active_templates || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-300 text-sm mb-1">Categories</p>
              <p className="text-white text-2xl font-bold">{stats.categories_count || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-4">
              <p className="text-pink-300 text-sm mb-1">Total Uses</p>
              <p className="text-white text-2xl font-bold">{stats.total_uses || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterPlatform}
                onChange={(e) => handlePlatformFilter(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {platforms.map(plat => (
                  <option key={plat} value={plat.toLowerCase()}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeOnly"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-300 focus:ring-yellow-300"
              />
              <label htmlFor="activeOnly" className="text-white cursor-pointer">
                Active Only
              </label>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{templates.length}</span> of {total} templates
          </p>
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw size={48} className="text-yellow-300 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onView={fetchTemplateById}
                  onDuplicate={duplicateTemplate}
                  onDelete={deleteTemplate}
                />
              ))}
            </div>

            {templates.length === 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
                <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No templates found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or create a new template</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
                >
                  Previous
                </button>
                <span className="text-white px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View/Edit Modal */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUpdate={updateTemplate}
          onDuplicate={duplicateTemplate}
          onDelete={deleteTemplate}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <CreateTemplateModal
          onClose={() => setIsCreating(false)}
          onCreate={createTemplate}
        />
      )}
    </div>
  );
};

const TemplateCard = ({ template, onView, onDuplicate, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'LINKEDIN_POST': 'from-blue-500 to-blue-600',
      'INSTAGRAM_CAROUSEL': 'from-pink-500 to-purple-600',
      'COLD_EMAIL': 'from-emerald-500 to-teal-600',
      'YOUTUBE_SHORT': 'from-red-500 to-red-600',
      'NEWSLETTER': 'from-yellow-500 to-orange-600',
      'COLD_DM': 'from-purple-500 to-pink-600',
      'INSTAGRAM_STORY': 'from-pink-500 to-red-600',
      'TWITTER_THREAD': 'from-blue-400 to-blue-500',
      'BLOG_POST': 'from-indigo-500 to-indigo-600'
    };
    return colors[template.category] || 'from-gray-500 to-gray-600';
  };

  const handleDuplicate = async () => {
    const newName = prompt('Enter a name for the duplicated template:', `${template.name} (Copy)`);
    if (newName) {
      await onDuplicate(template.id, newName);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-yellow-300 transition-all overflow-hidden group">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor(template.category)} px-4 py-3`}>
        <h3 className="text-white font-bold text-lg">{template.name}</h3>
        {!template.is_active && (
          <span className="inline-block mt-1 text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded">
            Inactive
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-1">Category</p>
          <p className="text-white font-semibold">{template.category.replace(/_/g, ' ')}</p>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-1">Platforms</p>
          <div className="flex flex-wrap gap-1">
            {template.platforms?.map(platform => (
              <span key={platform} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">
                {platform}
              </span>
            )) || <span className="text-gray-500 text-xs">No platforms</span>}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-1">Preview</p>
          <p className="text-white text-sm line-clamp-2">{template.example_output || 'No preview available'}</p>
        </div>

        <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
          <span>Used {template.usage_count || 0} times</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(template.id)}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-all"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onDelete(template.id, false)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplateModal = ({ template, onClose, onUpdate, onDuplicate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: template.name,
    structure: template.structure,
    example_output: template.example_output,
    is_active: template.is_active
  });

  const handleUpdate = async () => {
    const result = await onUpdate(template.id, editData);
    if (result) {
      setIsEditing(false);
      onClose();
    }
  };

  const handleDuplicate = async () => {
    const newName = prompt('Enter a name for the duplicated template:', `${template.name} (Copy)`);
    if (newName) {
      const result = await onDuplicate(template.id, newName);
      if (result) onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="text-2xl font-bold text-white bg-gray-700 rounded px-3 py-1 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white mb-1">{template.name}</h2>
            )}
            <p className="text-gray-400 text-sm mt-2">{template.category.replace(/_/g, ' ')}</p>
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
          {/* Active Status */}
          {isEditing && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={editData.is_active}
                onChange={(e) => setEditData({...editData, is_active: e.target.checked})}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-300"
              />
              <label htmlFor="isActive" className="text-white font-medium">
                Template is active
              </label>
            </div>
          )}

          {/* Platforms */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Supported Platforms</p>
            <div className="flex flex-wrap gap-2">
              {template.platforms?.map(platform => (
                <span key={platform} className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium">
                  {platform}
                </span>
              )) || <span className="text-gray-500">No platforms specified</span>}
            </div>
          </div>

          {/* Structure */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Template Structure</p>
            {isEditing ? (
              <textarea
                value={editData.structure}
                onChange={(e) => setEditData({...editData, structure: e.target.value})}
                rows={8}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
              />
            ) : (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <pre className="text-white text-sm whitespace-pre-wrap">{template.structure}</pre>
              </div>
            )}
          </div>

          {/* Example Output */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Example Output</p>
            {isEditing ? (
              <textarea
                value={editData.example_output}
                onChange={(e) => setEditData({...editData, example_output: e.target.value})}
                rows={4}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
              />
            ) : (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-white">{template.example_output || 'No example provided'}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-700/30 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Usage Count</p>
              <p className="text-white text-2xl font-bold mt-1">{template.usage_count || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className={`text-xl font-bold mt-1 ${template.is_active ? 'text-green-400' : 'text-red-400'}`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 font-bold py-3 rounded-lg transition-all"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit Template
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={18} />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete(template.id, false);
                    onClose();
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateTemplateModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'LINKEDIN_POST',
    platforms: [],
    structure: '',
    example_output: '',
    is_active: true
  });

  const categories = [
    'LINKEDIN_POST',
    'INSTAGRAM_CAROUSEL',
    'COLD_EMAIL',
    'YOUTUBE_SHORT',
    'NEWSLETTER',
    'COLD_DM',
    'INSTAGRAM_STORY',
    'TWITTER_THREAD',
    'BLOG_POST'
  ];

  const availablePlatforms = [
    'LINKEDIN',
    'INSTAGRAM',
    'TWITTER',
    'FACEBOOK',
    'YOUTUBE',
    'TIKTOK',
    'EMAIL'
  ];

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.structure) {
      alert('Please fill in all required fields (Name and Structure)');
      return;
    }

    await onCreate(formData);
  };

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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Name <span className="text-red-400">*</span>
            </label>
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
            <div className="grid grid-cols-3 gap-2">
              {availablePlatforms.map(platform => (
                <label
                  key={platform}
                  className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-300"
                  />
                  <span className="text-white text-sm">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Structure <span className="text-red-400">*</span>
            </label>
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
              value={formData.example_output}
              onChange={(e) => setFormData({...formData, example_output: e.target.value})}
              rows={4}
              placeholder="Show an example of this template in action..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActiveCreate"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-300"
            />
            <label htmlFor="isActiveCreate" className="text-white font-medium cursor-pointer">
              Set as active template
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 font-bold py-3 rounded-lg transition-all"
            >
              Create Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;