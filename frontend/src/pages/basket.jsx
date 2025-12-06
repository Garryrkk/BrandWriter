// BasketPage.jsx
import React, { useState } from 'react';
import { ShoppingBasket, Calendar, Edit, Trash2, X, Clock } from 'lucide-react';

const BasketPage = () => {
  const [basketItems, setBasketItems] = useState([
    {
      id: 1,
      thumbnail: '📱',
      title: '5 Biggest Mistakes Founders Make When Pitching',
      category: 'LinkedIn Post',
      platform: 'LinkedIn',
      dateTime: '2025-01-22 09:00 AM',
      content: 'Every founder thinks they have the perfect pitch. But here\'s the truth - most pitches fail before they even start. After reviewing 500+ pitch decks...',
      assets: { text: true, images: 0, video: false }
    },
    {
      id: 2,
      thumbnail: '🎨',
      title: 'Instagram Growth Strategy for 2025',
      category: 'Instagram Carousel',
      platform: 'Instagram',
      dateTime: '2025-01-22 06:00 PM',
      content: 'The algorithm changed again. But this time, it\'s actually good news for creators who know how to adapt. Slide 1: Hook...',
      assets: { text: true, images: 10, video: false }
    },
    {
      id: 3,
      thumbnail: '📧',
      title: 'Cold Email: SaaS Outreach Campaign',
      category: 'Cold Email',
      platform: 'Email',
      dateTime: '2025-01-23 08:30 AM',
      content: 'Subject: Quick question about [Company]\'s growth\n\nHi [Name],\n\nI noticed you recently launched...',
      assets: { text: true, images: 1, video: false }
    },
    {
      id: 4,
      thumbnail: '🎥',
      title: 'YouTube Short: AI Automation Trick',
      category: 'YouTube Short',
      platform: 'YouTube',
      dateTime: '2025-01-23 12:00 PM',
      content: '[Hook] Stop wasting 3 hours a day on repetitive tasks. [Body] This AI trick will change everything about how you work...',
      assets: { text: true, images: 0, video: true }
    },
    {
      id: 5,
      thumbnail: '📰',
      title: 'Weekly Marketing Newsletter',
      category: 'Newsletter',
      platform: 'Email',
      dateTime: '2025-01-24 07:00 AM',
      content: 'This week in marketing: 3 trends you can\'t ignore, 2 tools that will save you hours, and 1 strategy that changed everything...',
      assets: { text: true, images: 5, video: false }
    }
  ]);

  const [editingItem, setEditingItem] = useState(null);

  const removeItem = (id) => {
    setBasketItems(basketItems.filter(item => item.id !== id));
  };

  const totalItems = basketItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingBasket className="text-pink-300" />
            Content Basket
          </h1>
          <p className="text-gray-400">Review and schedule your selected content</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Total Items</p>
              <p className="text-3xl font-bold">{totalItems}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">LinkedIn</p>
              <p className="text-3xl font-bold">{basketItems.filter(i => i.platform === 'LinkedIn').length}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Instagram</p>
              <p className="text-3xl font-bold">{basketItems.filter(i => i.platform === 'Instagram').length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Emails</p>
              <p className="text-3xl font-bold">{basketItems.filter(i => i.platform === 'Email').length}</p>
            </div>
          </div>
        </div>

        {/* Basket Items */}
        {basketItems.length === 0 ? (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed text-center">
            <ShoppingBasket size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Your basket is empty</p>
            <p className="text-gray-500 text-sm">Add content from Drafts or Generator to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {basketItems.map(item => (
              <BasketItemCard 
                key={item.id} 
                item={item} 
                onEdit={setEditingItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {basketItems.length > 0 && (
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-white font-semibold">
                {totalItems} item{totalItems !== 1 ? 's' : ''} ready to schedule
              </p>
              <div className="flex gap-3">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all font-medium">
                  Clear All
                </button>
                <button className="bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 px-8 py-3 rounded-lg transition-all font-bold">
                  Schedule All Items
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditBasketModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
};

const BasketItemCard = ({ item, onEdit, onRemove }) => {
  const platformColors = {
    LinkedIn: 'from-blue-500 to-blue-600',
    Instagram: 'from-pink-500 to-purple-600',
    YouTube: 'from-red-500 to-red-600',
    Email: 'from-emerald-500 to-teal-600'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-pink-300 transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex gap-6">
          {/* Thumbnail */}
          <div className={`bg-gradient-to-br ${platformColors[item.platform]} w-24 h-24 rounded-xl flex items-center justify-center text-4xl flex-shrink-0`}>
            {item.thumbnail}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-1">{item.title}</h3>
                <div className="flex gap-3 text-sm text-gray-400">
                  <span className="text-pink-300 font-medium">{item.category}</span>
                  <span>•</span>
                  <span>{item.platform}</span>
                </div>
              </div>
            </div>

            {/* Date/Time */}
            <div className="bg-gray-700/50 rounded-lg px-4 py-2 inline-flex items-center gap-2 mb-3">
              <Clock className="text-yellow-300" size={16} />
              <span className="text-white text-sm font-medium">{item.dateTime}</span>
            </div>

            {/* Content Preview */}
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{item.content}</p>

            {/* Assets */}
            <div className="flex gap-4 text-xs text-gray-400 mb-4">
              {item.assets.text && <span className="bg-gray-700/50 px-2 py-1 rounded">📝 Text</span>}
              {item.assets.images > 0 && <span className="bg-gray-700/50 px-2 py-1 rounded">🖼️ {item.assets.images} Images</span>}
              {item.assets.video && <span className="bg-gray-700/50 px-2 py-1 rounded">🎥 Video</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
                <Calendar size={16} />
                Schedule Now
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

const EditBasketModal = ({ item, onClose }) => {
  const [dateTime, setDateTime] = useState(item.dateTime);
  const [content, setContent] = useState(item.content);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Edit Basket Item</h2>
            <p className="text-gray-400 text-sm">{item.title}</p>
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
          {/* Platform & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <div className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600">
                {item.platform}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <div className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600">
                {item.category}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date & Time</label>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-pink-300 focus:outline-none"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-pink-300 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
              Cancel
            </button>
            <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <Calendar size={18} />
              Update & Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;