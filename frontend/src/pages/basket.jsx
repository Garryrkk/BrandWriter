import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Calendar, Edit, Trash2, X, Clock, Loader2, AlertCircle, Plus, Filter, Archive } from 'lucide-react';

// Mock API client for demonstration
const mainApi = {
  basket: {
    list: async (brandId, page, pageSize, filters) => {
      return { items: [], total: 0 };
    },
    getStats: async (brandId) => {
      return { total_items: 0, by_status: { ready: 0, draft: 0, scheduled: 0 } };
    },
    getReady: async (brandId, limit) => {
      return [];
    },
    create: async (itemData) => {
      return itemData;
    },
    get: async (basketId) => {
      return null;
    },
    update: async (basketId, updateData) => {
      return updateData;
    },
    delete: async (id) => {
      return { success: true };
    }
  },
  request: async (url, method, data) => {
    return { upload_url: '', file_url: '' };
  }
};

// Brand ID Configuration
const BRAND_ID = '00000000-0000-0000-0000-000000000000';

// Helper function to extract text from content (handles both string and object formats)
const getContentText = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    return content.text || content.body || content.caption || content.message || JSON.stringify(content);
  }
  return String(content);
};

const BasketPage = () => {
  const [basketItems, setBasketItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    item_type: null,
    platform: null,
    status: null
  });
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch basket items using centralized API client
  const fetchBasketItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {};
      if (filters.item_type) filterParams.item_type = filters.item_type;
      if (filters.platform) filterParams.platform = filters.platform;
      if (filters.status) filterParams.status = filters.status;

      const data = await mainApi.basket.list(BRAND_ID, page, pageSize, filterParams);
      setBasketItems(data.items || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching basket items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch basket stats
  const fetchBasketStats = async () => {
    try {
      const data = await mainApi.basket.getStats(BRAND_ID);
      setStats(data);
    } catch (err) {
      console.error('Error fetching basket stats:', err);
    }
  };

  // Fetch ready items
  const fetchReadyItems = async () => {
    try {
      const data = await mainApi.basket.getReady(BRAND_ID, 50);
      return data;
    } catch (err) {
      console.error('Error fetching ready items:', err);
    }
    return [];
  };

  // Create basket item
  const createBasketItem = async (itemData) => {
    try {
      const newItem = await mainApi.basket.create(itemData);
      alert('Basket item created successfully!');
      fetchBasketItems();
      fetchBasketStats();
      return newItem;
    } catch (err) {
      alert(`Error creating item: ${err.message}`);
      console.error('Error creating basket item:', err);
      return null;
    }
  };

  // Create basket item from draft
  const createFromDraft = async (draftId) => {
    try {
      const newItem = await mainApi.request(`/v1/basket/from-draft?brand_id=${BRAND_ID}`, 'POST', { draft_id: draftId });
      alert('Basket item created from draft successfully!');
      fetchBasketItems();
      fetchBasketStats();
      return newItem;
    } catch (err) {
      alert(`Error creating from draft: ${err.message}`);
      console.error('Error creating from draft:', err);
      return null;
    }
  };

  // Get single basket item
  const getBasketItem = async (basketId) => {
    try {
      const item = await mainApi.basket.get(basketId);
      return item;
    } catch (err) {
      console.error('Error fetching basket item:', err);
      return null;
    }
  };

  // Update basket item
  const updateBasketItem = async (basketId, updateData) => {
    try {
      const updatedItem = await mainApi.basket.update(basketId, updateData);
      
      // Update local state
      setBasketItems(basketItems.map(item => 
        item.id === basketId ? updatedItem : item
      ));
      
      fetchBasketStats();
      return updatedItem;
    } catch (err) {
      alert(`Error updating item: ${err.message}`);
      console.error('Error updating basket item:', err);
      return null;
    }
  };

  // Delete basket item
  const removeItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await mainApi.basket.delete(id);
      
      // Update local state
      setBasketItems(basketItems.filter(item => item.id !== id));
      setTotalItems(prev => prev - 1);
      
      // Refresh stats
      fetchBasketStats();
      alert('Item deleted successfully!');
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
      console.error('Error deleting item:', err);
    }
  };

  // Archive basket item
  const archiveItem = async (id) => {
    try {
      const updatedItem = await mainApi.request(`/v1/basket/${id}/archive`, 'POST');
      
      // Update local state
      setBasketItems(basketItems.map(item => 
        item.id === id ? updatedItem : item
      ));
      
      fetchBasketStats();
      alert('Item archived successfully!');
    } catch (err) {
      alert(`Error archiving item: ${err.message}`);
      console.error('Error archiving item:', err);
    }
  };

  // Bulk delete items
  const bulkDeleteItems = async (itemIds) => {
    if (!window.confirm(`Are you sure you want to delete ${itemIds.length} items?`)) {
      return;
    }
    
    try {
      const result = await mainApi.request('/v1/basket/bulk-delete', 'POST', itemIds);
      
      // Refresh data
      fetchBasketItems();
      fetchBasketStats();
      setSelectedItems([]);
      
      alert(`Successfully deleted ${result.deleted_count} items`);
    } catch (err) {
      alert(`Error deleting items: ${err.message}`);
      console.error('Error bulk deleting items:', err);
    }
  };

  // Clear all items
  const clearAllItems = async () => {
    const itemIds = basketItems.map(item => item.id);
    await bulkDeleteItems(itemIds);
  };

  // Handle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === basketItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(basketItems.map(item => item.id));
    }
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Load data on mount and when filters/page change
  useEffect(() => {
    fetchBasketItems();
    fetchBasketStats();
  }, [page, filters, pageSize]);

  const displayedTotalItems = basketItems.length;

  return (
    <div className="fixed top-20 left-0 right-0 z-50 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingBasket className="text-pink-300" />
            Content Basket
          </h1>
          <p className="text-gray-400">Review and schedule your selected content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all font-medium flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg text-white px-6 py-3 rounded-lg transition-all font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <p className="text-red-400 font-semibold">Error loading basket</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchBasketItems}
            className="ml-auto bg-red-500/30 hover:bg-red-500/50 text-red-200 px-4 py-2 rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel 
          filters={filters} 
          onApplyFilters={applyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Stats Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-pink-300" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Total Items</p>
                <p className="text-3xl font-bold">{stats?.total_items || totalItems}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Ready</p>
                <p className="text-3xl font-bold">{stats?.by_status?.ready || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Draft</p>
                <p className="text-3xl font-bold">{stats?.by_status?.draft || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Scheduled</p>
                <p className="text-3xl font-bold">{stats?.by_status?.scheduled || 0}</p>
              </div>
            </div>
          )}
        </div>

        {/* Selection Bar */}
        {selectedItems.length > 0 && (
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.length === basketItems.length}
                onChange={selectAllItems}
                className="w-5 h-5 rounded"
              />
              <p className="text-white font-semibold">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItems([])}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Clear Selection
              </button>
              <button
                onClick={() => bulkDeleteItems(selectedItems)}
                className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Basket Items */}
        {loading ? (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <Loader2 className="animate-spin text-pink-300 mx-auto mb-4" size={64} />
            <p className="text-gray-400 text-lg">Loading basket items...</p>
          </div>
        ) : basketItems.length === 0 ? (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
            <ShoppingBasket size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Your basket is empty</p>
            <p className="text-gray-500 text-sm">Add content from Drafts or Generator to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-all font-semibold"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {basketItems.map(item => (
              <BasketItemCard 
                key={item.id} 
                item={item} 
                onEdit={setEditingItem}
                onRemove={removeItem}
                onArchive={archiveItem}
                onUpdate={updateBasketItem}
                selected={selectedItems.includes(item.id)}
                onToggleSelect={toggleItemSelection}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 flex justify-between items-center">
            <p className="text-gray-400">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} of {totalItems}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalItems}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {basketItems.length > 0 && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-white font-semibold">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in basket
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={clearAllItems}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all font-medium"
                >
                  Clear All
                </button>
                <button className="bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 px-8 py-3 rounded-lg transition-all font-bold">
                  Schedule All Items
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modals */}
      {editingItem && (
        <EditBasketModal 
          item={editingItem} 
          onClose={() => setEditingItem(null)}
          onUpdate={updateBasketItem}
        />
      )}
      
      {showCreateModal && (
        <CreateBasketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createBasketItem}
        />
      )}
    </div>
  );
};

const BasketItemCard = ({ item, onEdit, onRemove, onArchive, onUpdate, selected, onToggleSelect }) => {
  const platformColors = {
    LinkedIn: 'from-blue-500 to-blue-600',
    Instagram: 'from-pink-500 to-purple-600',
    YouTube: 'from-red-500 to-red-600',
    Email: 'from-emerald-500 to-teal-600',
    Twitter: 'from-sky-500 to-blue-600',
    Facebook: 'from-indigo-500 to-purple-600'
  };

  const getThumbnail = () => {
    if (item.thumbnail) return item.thumbnail;
    
    const thumbnailMap = {
      'LinkedIn': '📱',
      'Instagram': '🎨',
      'YouTube': '🎥',
      'Email': '📧',
      'Twitter': '🐦',
      'Facebook': '👥'
    };
    
    return thumbnailMap[item.platform] || '📄';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      ready: 'bg-green-500/20 text-green-300 border-green-500/30',
      scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      archived: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border transition-all overflow-hidden ${
      selected ? 'border-pink-300 ring-2 ring-pink-300/50' : 'border-gray-700 hover:border-pink-300'
    }`}>
      <div className="p-6">
        <div className="flex gap-6">
          {/* Checkbox */}
          <div className="flex items-start pt-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              className="w-5 h-5 rounded"
            />
          </div>

          {/* Thumbnail */}
          <div className={`bg-gradient-to-br ${platformColors[item.platform] || 'from-gray-500 to-gray-600'} w-24 h-24 rounded-xl flex items-center justify-center text-4xl flex-shrink-0`}>
            {getThumbnail()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-1">{item.title || 'Untitled'}</h3>
                <div className="flex gap-3 text-sm text-gray-400 flex-wrap">
                  <span className="text-pink-300 font-medium">{item.item_type || item.category || 'Post'}</span>
                  <span>•</span>
                  <span>{item.platform || 'Unknown'}</span>
                  {item.status && (
                    <>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Date/Time */}
            {item.scheduled_time && (
              <div className="bg-gray-700/50 rounded-lg px-4 py-2 inline-flex items-center gap-2 mb-3">
                <Clock className="text-yellow-300" size={16} />
                <span className="text-white text-sm font-medium">{formatDateTime(item.scheduled_time)}</span>
              </div>
            )}

            {/* Content Preview */}
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{getContentText(item.content) || 'No content preview available'}</p>

            {/* Assets */}
            <div className="flex gap-4 text-xs text-gray-400 mb-4 flex-wrap">
              {item.content && (
                <span className="bg-gray-700/50 px-2 py-1 rounded">📝 Text</span>
              )}

              {item.assets && (
                <>
                  {item.assets.images?.length > 0 && (
                    <span className="bg-gray-700/50 px-2 py-1 rounded">
                      🖼️ {item.assets.images.length} Images
                    </span>
                  )}
                  {item.assets.videos?.length > 0 && (
                    <span className="bg-gray-700/50 px-2 py-1 rounded">
                      🎥 {item.assets.videos.length} Videos
                    </span>
                  )}
                  {item.assets.audio?.length > 0 && (
                    <span className="bg-gray-700/50 px-2 py-1 rounded">
                      🎧 {item.assets.audio.length} Audio
                    </span>
                  )}
                  {item.assets.documents?.length > 0 && (
                    <span className="bg-gray-700/50 px-2 py-1 rounded">
                      📄 {item.assets.documents.length} Files
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 min-w-[120px] bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button 
                onClick={() => onArchive(item.id)}
                className="flex-1 min-w-[120px] bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Archive size={16} />
                Archive
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 px-4 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditBasketModal = ({ item, onClose, onUpdate }) => {
  const [dateTime, setDateTime] = useState(item.scheduled_time ? new Date(item.scheduled_time).toISOString().slice(0, 16) : '');
  const [content, setContent] = useState(getContentText(item.content) || '');
  const [title, setTitle] = useState(item.title || '');
  const [status, setStatus] = useState(item.status || 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState(
    item.assets || {
      images: [],
      videos: [],
      audio: [],
      documents: []
    }
  );

  // ✅ FIX: Single async asset uploader
  const handleAssetUpload = async (files) => {
    const fileArray = Array.from(files);
    const uploadedAssets = {
      images: [...assets.images],
      videos: [...assets.videos],
      audio: [...assets.audio],
      documents: [...assets.documents]
    };

    for (const file of fileArray) {
      let bucket;
      if (file.type.startsWith("image/")) bucket = "images";
      else if (file.type.startsWith("video/")) bucket = "videos";
      else if (file.type.startsWith("audio/")) bucket = "audio";
      else bucket = "documents";

      try {
        // 1️⃣ Ask backend for signed upload URL
        const { upload_url, file_url } = await mainApi.request(
          "/v1/assets/presign",
          "POST",
          {
            filename: file.name,
            content_type: file.type
          }
        );

        // 2️⃣ Upload directly to storage
        await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        });

        // 3️⃣ Store asset reference
        uploadedAssets[bucket].push({
          url: file_url,
          name: file.name,
          type: file.type
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
      }
    }

    setAssets(uploadedAssets);
  };

  // ✅ FIX: Remove asset function
  const removeAsset = (type, index) => {
    setAssets(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title,
        content: { text: content },
        assets,
        scheduled_time: dateTime ? new Date(dateTime).toISOString() : null,
        status
      };

      const result = await onUpdate(item.id, updateData);
      
      if (result) {
        alert('Basket item updated successfully!');
        onClose();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating basket item:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Edit Basket Item</h2>
            <p className="text-gray-400 text-sm">{item.title || 'Untitled'}</p>
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
          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Platform & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <div className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600">
                {item.platform}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <div className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600">
                {item.item_type || item.category}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
              placeholder="Enter title..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-pink-300 focus:outline-none resize-none"
            />
          </div>

          {/* Asset Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload / Replace Media
            </label>

            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => handleAssetUpload(e.target.files)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            />
          </div>

          {/* Asset Preview with Remove Buttons */}
          {Object.values(assets).some(arr => arr?.length > 0) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attached Assets
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(assets).map(([type, items]) =>
                  items?.map((asset, i) => (
                    <div
                      key={`${type}-${i}`}
                      className="bg-gray-700 rounded-lg p-2 text-xs text-gray-300 relative group"
                    >
                      <button
                        onClick={() => removeAsset(type, i)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <div className="truncate">
                        {type === "images" && "🖼️"}
                        {type === "videos" && "🎥"}
                        {type === "audio" && "🎧"}
                        {type === "documents" && "📄"}{" "}
                        {asset.name || asset.url}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  Update & Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateBasketModal = ({ onClose, onCreate }) => {
  // ✅ FIX 1: Added missing assets state
  const [assets, setAssets] = useState({
    images: [],
    videos: [],
    audio: [],
    documents: []
  });

  const [formData, setFormData] = useState({
    brand_id: BRAND_ID,
    title: '',
    content: '',
    platform: 'linkedin',
    item_type: 'post',
    category: 'linkedin_post',
    status: 'draft', // ✅ FIX 5: Changed from 'pending' to 'draft'
    scheduled_time: '',
    notes: '',
    priority: 0
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Map platform to category
  const platformCategoryMap = {
    linkedin: 'linkedin_post',
    instagram: 'instagram_post',
    twitter: 'twitter_post',
    facebook: 'facebook_post',
    youtube: 'youtube_video',
    email: 'newsletter'
  };

  const handlePlatformChange = (platform) => {
    const category = platformCategoryMap[platform.toLowerCase()] || 'general';
    setFormData({...formData, platform: platform.toLowerCase(), category});
  };

  // ✅ FIX 2: Single async asset uploader (removed duplicates)
  const handleAssetUpload = async (files) => {
    const fileArray = Array.from(files);
    const uploadedAssets = {
      images: [...assets.images],
      videos: [...assets.videos],
      audio: [...assets.audio],
      documents: [...assets.documents]
    };

    for (const file of fileArray) {
      let bucket;
      if (file.type.startsWith("image/")) bucket = "images";
      else if (file.type.startsWith("video/")) bucket = "videos";
      else if (file.type.startsWith("audio/")) bucket = "audio";
      else bucket = "documents";

      try {
        // 1️⃣ Ask backend for signed upload URL
        const { upload_url, file_url } = await mainApi.request(
          "/v1/assets/presign",
          "POST",
          {
            filename: file.name,
            content_type: file.type
          }
        );

        // 2️⃣ Upload directly to storage
        await fetch(upload_url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        });

        // 3️⃣ Store asset reference
        uploadedAssets[bucket].push({
          url: file_url,
          name: file.name,
          type: file.type
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
      }
    }

    setAssets(uploadedAssets);
  };

  // ✅ FIX: Remove asset function
  const removeAsset = (type, index) => {
    setAssets(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      setError(null);

      if (!formData.title || !formData.content) {
        setError('Title and content are required');
        return;
      }

      // Format data to match backend schema
      const createData = {
        brand_id: formData.brand_id,
        category: formData.category,
        platform: formData.platform,
        item_type: formData.item_type,
        title: formData.title,
        content: { text: formData.content },
        assets,
        status: formData.status,
        notes: formData.notes || null,
        priority: formData.priority
      };

      // Only add scheduled fields if a time is set
      if (formData.scheduled_time) {
        const dt = new Date(formData.scheduled_time);
        const isoString = dt.toISOString().replace('Z', '');
        createData.scheduled_date = isoString;
        createData.scheduled_time = isoString;
      }

      const result = await onCreate(createData);
      
      if (result) {
        onClose();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating basket item:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create Basket Item</h2>
            <p className="text-gray-400 text-sm">Add a new item to your content basket</p>
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
          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Platform & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Item Type</label>
              <select
                value={formData.item_type}
                onChange={(e) => setFormData({...formData, item_type: e.target.value})}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
              >
                <option value="post">Post</option>
                <option value="reel">Reel</option>
                <option value="short">Short</option>
                <option value="carousel">Carousel</option>
                <option value="story">Story</option>
                <option value="email">Email</option>
                <option value="dm">DM</option>
                <option value="idea">Idea</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
              placeholder="Enter title..."
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date & Time (Optional)</label>
            <input
              type="datetime-local"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={10}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-pink-300 focus:outline-none resize-none"
              placeholder="Enter content..."
              required
            />
          </div>

          {/* ✅ FIX 3: Removed duplicate media upload, kept only one */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Media (Images / Videos / Audio / Docs)
            </label>

            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => handleAssetUpload(e.target.files)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            />
          </div>
                  
          {/* Asset Preview with Remove Buttons */}
          {Object.values(assets).some(arr => arr.length > 0) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attached Assets
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(assets).map(([type, items]) =>
                  items.map((asset, i) => (
                    <div
                      key={`${type}-${i}`}
                      className="bg-gray-700 rounded-lg p-2 text-xs text-gray-300 relative group"
                    >
                      <button
                        onClick={() => removeAsset(type, i)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <div className="truncate">
                        {type === "images" && "🖼️"}
                        {type === "videos" && "🎥"}
                        {type === "audio" && "🎧"}
                        {type === "documents" && "📄"}{" "}
                        {asset.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={creating}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, onApplyFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      item_type: null,
      platform: null,
      status: null
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Filter size={20} />
          Filters
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Platform Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
          <select
            value={localFilters.platform || ''}
            onChange={(e) => setLocalFilters({...localFilters, platform: e.target.value || null})}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
          >
            <option value="">All Platforms</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Twitter">Twitter</option>
            <option value="Facebook">Facebook</option>
            <option value="YouTube">YouTube</option>
            <option value="Email">Email</option>
          </select>
        </div>

        {/* Item Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Item Type</label>
          <select
            value={localFilters.item_type || ''}
            onChange={(e) => setLocalFilters({...localFilters, item_type: e.target.value || null})}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="post">Post</option>
            <option value="video">Video</option>
            <option value="carousel">Carousel</option>
            <option value="story">Story</option>
            <option value="article">Article</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({...localFilters, status: e.target.value || null})}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-all"
        >
          Clear Filters
        </button>
        <button
          onClick={handleApply}
          className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default BasketPage;