import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Edit, ShoppingBasket, Trash2, X, RefreshCw, Search, Filter, Loader, AlertCircle, CheckCircle, Copy, Download, Eye } from 'lucide-react';


const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [toast, setToast] = useState(null);
  const [basket, setBasket] = useState([]);
  const [showBasket, setShowBasket] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0
  });

  const [filters, setFilters] = useState({
    category: 'all',
    platform: 'all',
    status: 'all',
    search: ''
  });

  const categories = ['all', 'linkedin post', 'instagram carousel', 'instagram reel', 'youtube short', 'newsletter', 'cold email', 'cold dm'];
  const platforms = ['all', 'linkedin', 'instagram', 'youtube', 'email'];
  const statuses = ['all', 'draft', 'scheduled', 'published', 'archived'];
  const tones = ['Professional', 'Casual', 'Inspiring', 'Educational', 'Humorous'];

  // Fetch drafts
  useEffect(() => {
    fetchDrafts();
  }, [pagination.page, filters]);

  // Fetch stats
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load basket
  useEffect(() => {
    const savedBasket = localStorage.getItem('drafts-basket');
    if (savedBasket) {
      try {
        setBasket(JSON.parse(savedBasket));
      } catch (e) {
        console.error('Failed to load basket:', e);
      }
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        brand_id: BRAND_ID,
        page: pagination.page,
        page_size: pagination.pageSize,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.platform !== 'all' && { platform: filters.platform }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search_query: filters.search })
      });

      const response = await fetch(`${API_BASE_URL}/drafts?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setDrafts([]);
          setPagination(prev => ({ ...prev, total: 0 }));
        } else {
          throw new Error(`Error: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      setDrafts(data.drafts || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast('Failed to load drafts', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/stats?brand_id=${BRAND_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const updateDraft = async (draftId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update draft');

      const updatedDraft = await response.json();
      setDrafts(drafts.map(d => d.id === draftId ? updatedDraft : d));
      showToast('Draft saved', 'success');
      setEditingDraft(null);
      await fetchStats();
      return updatedDraft;
    } catch (err) {
      showToast('Failed to save draft', 'error');
      throw err;
    }
  };

  const deleteDraft = async (draftId) => {
    if (!window.confirm('Delete this draft?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete draft');

      setDrafts(drafts.filter(d => d.id !== draftId));
      setSelectedDrafts(selectedDrafts.filter(id => id !== draftId));
      showToast('Draft deleted', 'success');
      await fetchStats();
    } catch (err) {
      showToast('Failed to delete draft', 'error');
    }
  };

  const bulkDeleteDrafts = async (draftIds) => {
    if (!window.confirm(`Delete ${draftIds.length} draft(s)?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/drafts/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({ draft_ids: draftIds })
      });

      if (!response.ok) throw new Error('Failed to delete drafts');

      const data = await response.json();
      setDrafts(drafts.filter(d => !draftIds.includes(d.id)));
      setSelectedDrafts([]);
      showToast(`${data.deleted_count} draft(s) deleted`, 'success');
      await fetchStats();
    } catch (err) {
      showToast('Failed to delete drafts', 'error');
    }
  };

  const addToBasket = (draft) => {
    setBasket(prev => {
      const newBasket = [...prev, draft];
      localStorage.setItem('drafts-basket', JSON.stringify(newBasket));
      showToast('Added to basket', 'success');
      return newBasket;
    });
  };

  const removeFromBasket = (draftId) => {
    setBasket(prev => {
      const newBasket = prev.filter(d => d.id !== draftId);
      localStorage.setItem('drafts-basket', JSON.stringify(newBasket));
      return newBasket;
    });
  };

  const clearBasket = () => {
    if (!window.confirm('Clear basket?')) return;
    setBasket([]);
    localStorage.setItem('drafts-basket', JSON.stringify([]));
    showToast('Basket cleared', 'success');
  };

  const downloadBasket = () => {
    const content = basket.map(d => `${d.title}\n${d.preview}\n\n---\n\n`).join('');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `drafts-basket-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Basket downloaded', 'success');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const toggleSelectDraft = (draftId) => {
    setSelectedDrafts(prev =>
      prev.includes(draftId) ? prev.filter(id => id !== draftId) : [...prev, draftId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDrafts.length === drafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(drafts.map(d => d.id));
    }
  };

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
            onClick={() => setShowBasket(!showBasket)}
            className="relative bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
          >
            <ShoppingBasket size={20} />
            Basket
            {basket.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {basket.length}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-yellow-300 transition-all">
                <p className="text-gray-400 text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Basket Panel */}
        {showBasket && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">Basket ({basket.length})</h2>
              <button onClick={() => setShowBasket(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {basket.length > 0 ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {basket.map(item => (
                    <div key={item.id} className="bg-gray-700/50 rounded p-3 flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-gray-400 text-xs">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromBasket(item.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadBasket}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={clearBasket}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-8">Basket is empty</p>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-yellow-300" size={20} />
            <h2 className="text-white font-bold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search drafts..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none text-sm"
              >
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat.charAt(0).toUpperCase() + plat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none text-sm"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ category: 'all', platform: 'all', status: 'all', search: '' });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedDrafts.length === drafts.length && drafts.length > 0}
              onChange={toggleSelectAll}
              className="cursor-pointer"
            />
            <p className="text-gray-400">
              {selectedDrafts.length > 0 ? (
                <><span className="text-yellow-300 font-bold">{selectedDrafts.length}</span> selected</>
              ) : (
                <><span className="text-white font-bold">{drafts.length}</span> of {pagination.total} drafts</>
              )}
            </p>
          </div>
          {selectedDrafts.length > 0 && (
            <button
              onClick={() => bulkDeleteDrafts(selectedDrafts)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 px-4 rounded-lg transition-all text-sm"
            >
              Delete Selected
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-yellow-300" size={32} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-400" size={20} />
            <p className="text-red-400 flex-1">{error}</p>
            <button onClick={() => fetchDrafts()} className="text-red-400 hover:text-red-300 text-sm underline">Retry</button>
          </div>
        )}

        {/* Drafts Grid */}
        {!loading && drafts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {drafts.map(draft => (
              <DraftCard
                key={draft.id}
                draft={draft}
                isSelected={selectedDrafts.includes(draft.id)}
                onToggleSelect={() => toggleSelectDraft(draft.id)}
                onEdit={setEditingDraft}
                onDelete={deleteDraft}
                onAddToBasket={addToBasket}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && drafts.length === 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
            <FileText size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No drafts found matching your filters</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total > pagination.pageSize && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-all"
            >
              Previous
            </button>
            <span className="text-white py-2 px-4">Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg flex items-center gap-2 z-40 ${
          toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
          toast.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
          'bg-blue-500/20 border border-blue-500/30 text-blue-400'
        }`}>
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Edit Modal */}
      {editingDraft && (
        <EditDraftModal
          draft={editingDraft}
          tones={tones}
          onClose={() => setEditingDraft(null)}
          onSave={(updates) => updateDraft(editingDraft.id, updates)}
          onDelete={() => {
            deleteDraft(editingDraft.id);
            setEditingDraft(null);
          }}
        />
      )}
    </div>
  );
};

const DraftCard = ({ draft, isSelected, onToggleSelect, onEdit, onDelete, onAddToBasket, onCopy }) => {
  const platformColors = {
    linkedin: 'from-blue-500 to-blue-600',
    instagram: 'from-pink-500 to-purple-600',
    youtube: 'from-red-500 to-red-600',
    email: 'from-emerald-500 to-teal-600'
  };

  const statusColors = {
    draft: 'bg-gray-500',
    scheduled: 'bg-blue-500',
    published: 'bg-green-500',
    archived: 'bg-gray-600'
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all overflow-hidden ${
      isSelected ? 'border-yellow-300' : 'border-gray-700 hover:border-yellow-300'
    }`}>
      <div className={`bg-gradient-to-r ${platformColors[draft.platform?.toLowerCase()] || platformColors.email} px-4 py-2 flex justify-between items-center`}>
        <p className="text-white text-sm font-bold">{draft.platform}</p>
        {draft.status && <span className={`text-white text-xs px-2 py-1 rounded ${statusColors[draft.status.toLowerCase()] || statusColors.draft}`}>
          {draft.status}
        </span>}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="cursor-pointer mt-1"
          />
          <h3 className="text-white font-bold text-lg line-clamp-2">{draft.title}</h3>
        </div>

        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{draft.preview}</p>

        <div className="space-y-1 mb-4 text-xs text-gray-400">
          <p><span className="text-gray-300 font-medium">Category:</span> {draft.category}</p>
          {draft.generated_at && <p><span className="text-gray-300 font-medium">Generated:</span> {new Date(draft.generated_at).toLocaleDateString()}</p>}
          {draft.tone && <p><span className="text-gray-300 font-medium">Tone:</span> {draft.tone}</p>}
          {draft.word_count && <p><span className="text-gray-300 font-medium">Words:</span> {draft.word_count}</p>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(draft)}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => onAddToBasket(draft)}
            className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1 text-sm"
          >
            <ShoppingBasket size={14} />
            Basket
          </button>
          <button
            onClick={() => onDelete(draft.id)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 px-3 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EditDraftModal = ({ draft, tones, onClose, onSave, onDelete }) => {
  const [content, setContent] = useState(draft.preview || '');
  const [tone, setTone] = useState(draft.tone || 'Professional');
  const [title, setTitle] = useState(draft.title || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        preview: content,
        tone
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Edit Draft</h2>
            <p className="text-gray-400 text-sm">{draft.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            >
              {tones.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-yellow-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              Regenerate
            </button>
            <button
              onClick={() => onDelete(draft.id)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-3 rounded-lg transition-all"
            >
              <Trash2 size={18} />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;