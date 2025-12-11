import React, { useState, useEffect } from 'react';
import { FileText, Edit, ShoppingBasket, Trash2, X, RefreshCw, Search, Filter, AlertCircle, Loader2, Check, Download, Copy } from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const BRAND_ID = process.env.REACT_APP_BRAND_ID || '00000000-0000-0000-0000-000000000000';

const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0
  });

  const [filters, setFilters] = useState({
    category: '',
    platform: '',
    status: '',
    search: ''
  });

  const [editingDraft, setEditingDraft] = useState(null);
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [deletingDrafts, setDeletingDrafts] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // API Functions
  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        brand_id: BRAND_ID,
        page: pagination.page.toString(),
        page_size: pagination.pageSize.toString()
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search_query', filters.search);

      const response = await fetch(`${API_BASE_URL}/drafts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch drafts');
      
      const data = await response.json();
      setDrafts(data.drafts || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/stats?brand_id=${BRAND_ID}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchDraftById = async (draftId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`);
      if (!response.ok) throw new Error('Failed to fetch draft');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching draft:', err);
      return null;
    }
  };

  const createDraft = async (draftData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draftData,
          brand_id: BRAND_ID
        })
      });
      if (!response.ok) throw new Error('Failed to create draft');
      const data = await response.json();
      setSuccess('Draft created successfully!');
      await fetchDrafts();
      await fetchStats();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating draft:', err);
      return null;
    }
  };

  const updateDraft = async (draftId, draftData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });
      if (!response.ok) throw new Error('Failed to update draft');
      const data = await response.json();
      setSuccess('Draft updated successfully!');
      await fetchDrafts();
      await fetchStats();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating draft:', err);
      return null;
    }
  };

  const deleteDraft = async (draftId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete draft');
      setSuccess('Draft deleted successfully!');
      await fetchDrafts();
      await fetchStats();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting draft:', err);
    }
  };

  const bulkDeleteDrafts = async (draftIds) => {
    try {
      setDeletingDrafts(true);
      const response = await fetch(`${API_BASE_URL}/drafts/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftIds)
      });
      if (!response.ok) throw new Error('Failed to delete drafts');
      const data = await response.json();
      setSuccess(`${data.deleted_count} drafts deleted successfully!`);
      setSelectedDrafts([]);
      await fetchDrafts();
      await fetchStats();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error bulk deleting drafts:', err);
    } finally {
      setDeletingDrafts(false);
    }
  };

  const getDraftsByCategory = async (category) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        brand_id: BRAND_ID,
        page: '1',
        page_size: pagination.pageSize.toString()
      });

      const response = await fetch(`${API_BASE_URL}/drafts/category/${category}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch drafts by category');
      const data = await response.json();
      setDrafts(data.drafts || []);
      setPagination(prev => ({ ...prev, total: data.total || 0, page: 1 }));
      setFilters(prev => ({ ...prev, category }));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching drafts by category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchDrafts();
    fetchStats();
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchDrafts();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', platform: '', status: '', search: '' });
  };

  const categories = ['linkedin_post', 'instagram_carousel', 'instagram_reel', 'youtube_short', 'newsletter', 'cold_email', 'cold_dm'];
  const platforms = ['linkedin', 'instagram', 'youtube', 'email', 'twitter'];
  const statuses = ['draft', 'published', 'scheduled', 'archived'];

  const filteredDrafts = drafts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="text-yellow-300" />
              Drafts
            </h1>
            <p className="text-gray-400">Manage and edit your saved content drafts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <FileText size={20} />
            Create Draft
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Check className="text-green-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-green-400 font-semibold">Success</p>
              <p className="text-green-300 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {Object.entries(stats).map(([category, count]) => (
              <div 
                key={category} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-yellow-300 transition-all cursor-pointer"
                onClick={() => getDraftsByCategory(category)}
              >
                <p className="text-gray-400 text-sm capitalize mb-1">{category.replace('_', ' ')}</p>
                <p className="text-white text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="text-yellow-300" size={20} />
              <h2 className="text-white font-bold">Filters</h2>
            </div>
            {selectedDrafts.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedDrafts.length} draft(s)?`)) {
                    bulkDeleteDrafts(selectedDrafts);
                  }
                }}
                disabled={deletingDrafts}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deletingDrafts ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                Delete Selected ({selectedDrafts.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search drafts by title or content..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select 
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="">All Platforms</option>
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Per Page</label>
              <select 
                value={pagination.pageSize}
                onChange={(e) => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value), page: 1 }))}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count & Pagination */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{filteredDrafts.length}</span> of <span className="text-white font-bold">{pagination.total}</span> drafts
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-yellow-300 animate-spin" size={48} />
          </div>
        )}

        {/* Drafts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrafts.map(draft => (
              <DraftCard 
                key={draft.id} 
                draft={draft} 
                onEdit={setEditingDraft}
                onDelete={deleteDraft}
                onView={fetchDraftById}
                selected={selectedDrafts.includes(draft.id)}
                onSelect={(id) => {
                  setSelectedDrafts(prev => 
                    prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
                  );
                }}
              />
            ))}
          </div>
        )}

        {!loading && filteredDrafts.length === 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
            <FileText size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No drafts found matching your filters</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-all"
            >
              Create Your First Draft
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDraft && (
        <EditDraftModal 
          draft={editingDraft} 
          onClose={() => setEditingDraft(null)}
          onSave={updateDraft}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDraftModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={createDraft}
        />
      )}
    </div>
  );
};

const DraftCard = ({ draft, onEdit, onDelete, onView, selected, onSelect }) => {
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      setDeleting(true);
      await onDelete(draft.id);
      setDeleting(false);
    }
  };

  const handleView = async () => {
    setViewing(true);
    const fullDraft = await onView(draft.id);
    if (fullDraft) {
      onEdit(fullDraft);
    }
    setViewing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformColors = {
    linkedin: 'from-blue-500 to-blue-600',
    instagram: 'from-pink-500 to-purple-600',
    youtube: 'from-red-500 to-red-600',
    email: 'from-emerald-500 to-teal-600',
    twitter: 'from-sky-400 to-blue-500'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${selected ? 'border-yellow-300 ring-2 ring-yellow-300' : 'border-gray-700'} hover:border-yellow-300 transition-all overflow-hidden relative`}>
      {/* Selection Checkbox */}
      <div className="absolute top-4 right-4 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(draft.id)}
          className="w-5 h-5 rounded border-gray-600 text-yellow-300 focus:ring-yellow-300 cursor-pointer"
        />
      </div>

      {/* Platform Badge */}
      <div className={`bg-gradient-to-r ${platformColors[draft.platform] || 'from-gray-500 to-gray-600'} px-4 py-2`}>
        <p className="text-white text-sm font-bold uppercase">{draft.platform}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 pr-6">{draft.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">{draft.content?.substring(0, 150)}...</p>

        {/* Meta Info */}
        <div className="space-y-1 mb-4 text-xs text-gray-400">
          <p><span className="text-gray-300 font-medium">Category:</span> {draft.category?.replace('_', ' ')}</p>
          <p><span className="text-gray-300 font-medium">Created:</span> {formatDate(draft.created_at)}</p>
          <p><span className="text-gray-300 font-medium">Updated:</span> {formatDate(draft.updated_at)}</p>
          <p><span className="text-gray-300 font-medium">Status:</span> <span className={`px-2 py-0.5 rounded ${draft.status === 'published' ? 'bg-green-500/20 text-green-400' : draft.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{draft.status}</span></p>
          {draft.tone && <p><span className="text-gray-300 font-medium">Tone:</span> {draft.tone}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleView}
            disabled={viewing}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm disabled:opacity-50"
          >
            {viewing ? <Loader2 className="animate-spin" size={14} /> : <Edit size={14} />}
            Edit
          </button>
          <button 
            onClick={handleCopy}
            className="flex-1 bg-purple-300 hover:bg-purple-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm">
            <ShoppingBasket size={14} />
            Basket
          </button>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 px-3 rounded-lg transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateDraftModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'linkedin_post',
    platform: 'linkedin',
    tone: 'professional',
    status: 'draft'
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    setCreating(true);
    const result = await onCreate(formData);
    setCreating(false);
    if (result) {
      onClose();
    }
  };

  const categories = ['linkedin_post', 'instagram_carousel', 'instagram_reel', 'youtube_short', 'newsletter', 'cold_email', 'cold_dm'];
  const platforms = ['linkedin', 'instagram', 'youtube', 'email', 'twitter'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create New Draft</h2>
            <p className="text-gray-400 text-sm">Fill in the details to create a new content draft</p>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter draft title..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            />
          </div>

          {/* Category & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform *</label>
              <select 
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
              <select 
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="">Select Tone</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="inspiring">Inspiring</option>
                <option value="educational">Educational</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={12}
              placeholder="Write your content here..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
            <p className="text-gray-400 text-sm mt-2">
              {formData.content.length} characters | {formData.content.split(/\s+/).filter(Boolean).length} words
            </p>
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
              onClick={handleCreate}
              disabled={creating || !formData.title || !formData.content}
              className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Create Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditDraftModal = ({ draft, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: draft.title || '',
    content: draft.content || '',
    tone: draft.tone || '',
    status: draft.status || 'draft',
    category: draft.category || '',
    platform: draft.platform || ''
  });
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    setSaving(true);
    const result = await onSave(draft.id, formData);
    setSaving(false);
    if (result) {
      onClose();
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    // Call regeneration API endpoint here if available
    setTimeout(() => {
      setRegenerating(false);
      alert('Regeneration feature coming soon!');
    }, 1000);
  };

  const handleExport = () => {
    const blob = new Blob([formData.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = ['linkedin_post', 'instagram_carousel', 'instagram_reel', 'youtube_short', 'newsletter', 'cold_email', 'cold_dm'];
  const platforms = ['linkedin', 'instagram', 'youtube', 'email', 'twitter'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Edit Draft</h2>
            <p className="text-gray-400 text-sm">{draft.category?.replace('_', ' ')} • Created {new Date(draft.created_at).toLocaleDateString()}</p>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            />
          </div>

          {/* Category & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select 
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
              <select 
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="">Select Tone</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="inspiring">Inspiring</option>
                <option value="educational">Educational</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={12}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
            <p className="text-gray-400 text-sm mt-2">
              {formData.content.length} characters | {formData.content.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {regenerating ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Regen
            </button>
            <button 
              onClick={handleExport}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
            <button className="bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <ShoppingBasket size={18} />
              Basket
            </button>
            <button 
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.content}
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;