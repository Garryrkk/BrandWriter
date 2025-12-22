import React, { useState } from 'react';
import { X, Edit, Save, AlertCircle, GitBranch } from 'lucide-react';

const EditContentModal = ({ content, platform, onSave, onClose, baseContent }) => {
  const [edited, setEdited] = useState({ ...content });
  const [wordCount, setWordCount] = useState(0);
  const [text, setText] = useState(baseContent || '');

  const updateField = (key, value) => {
    setEdited(prev => ({ ...prev, [key]: value }));
    
    // Update word count for text fields
    if (key === 'text' || key === 'body' || key === 'script') {
      const count = value.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(count);
    }
  };

  const handleTextChange = (value) => {
    setText(value);
    const count = value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  };

  const renderEditor = () => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
      case 'linkedin':
        return (
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-300">
              Post Content
            </label>
            <textarea
              value={edited.text || ''}
              onChange={e => updateField('text', e.target.value)}
              placeholder="Write your post content..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
              rows="8"
            />
            {wordCount > 0 && (
              <p className="text-xs text-slate-400 mt-2">{wordCount} words</p>
            )}
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Email Subject
              </label>
              <input
                type="text"
                value={edited.subject || ''}
                onChange={e => updateField('subject', e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Email Body
              </label>
              <textarea
                value={edited.body || ''}
                onChange={e => updateField('body', e.target.value)}
                placeholder="Write your email content..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="10"
              />
              {wordCount > 0 && (
                <p className="text-xs text-slate-400 mt-2">{wordCount} words</p>
              )}
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Video Title
              </label>
              <input
                type="text"
                value={edited.title || ''}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Enter video title..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Video Script
              </label>
              <textarea
                value={edited.script || ''}
                onChange={e => updateField('script', e.target.value)}
                placeholder="Write your video script..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="10"
              />
              {wordCount > 0 && (
                <p className="text-xs text-slate-400 mt-2">{wordCount} words</p>
              )}
            </div>
          </div>
        );

      case 'medium':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Article Title
              </label>
              <input
                type="text"
                value={edited.title || ''}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Article Body
              </label>
              <textarea
                value={edited.body || ''}
                onChange={e => updateField('body', e.target.value)}
                placeholder="Write your article..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="12"
              />
              {wordCount > 0 && (
                <p className="text-xs text-slate-400 mt-2">{wordCount} words</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-300">
              Content
            </label>
            <textarea
              value={edited.text || ''}
              onChange={e => updateField('text', e.target.value)}
              placeholder="Edit your content..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
              rows="8"
            />
          </div>
        );
    }
  };

  const handleSave = () => {
    if (baseContent) {
      onSave(text);
    } else {
      onSave(edited);
    }
  };

  // Calculate original word count for baseContent mode
  const originalWordCount = baseContent ? baseContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentWordCount = baseContent ? text.trim().split(/\s+/).filter(Boolean).length : wordCount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Edit size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Content</h2>
                <p className="text-sm text-slate-400">
                  {baseContent ? 'Create a new version with your changes' : (
                    <>Platform: <span className="text-yellow-300 font-semibold">{platform}</span></>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Alert */}
            {baseContent ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                <GitBranch className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-blue-400 font-semibold mb-1">Version Control</p>
                  <p className="text-slate-400 text-sm">
                    Your edits will be saved as a new version. The original content remains intact in version history.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-blue-400 font-semibold mb-1">Manual Editing</p>
                  <p className="text-slate-400 text-sm">
                    Edits only affect this draft. Scheduled content remains unchanged until you update it.
                  </p>
                </div>
              </div>
            )}

            {/* Editor Fields */}
            {baseContent ? (
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-300">
                  Content
                </label>
                <textarea
                  value={text}
                  onChange={e => handleTextChange(e.target.value)}
                  placeholder="Edit your content..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                  rows="12"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">{currentWordCount} words</p>
                  <p className="text-xs text-slate-400">
                    Original: {originalWordCount} words
                  </p>
                </div>
              </div>
            ) : (
              renderEditor()
            )}

            {/* Warning for significant changes */}
            {baseContent && Math.abs(currentWordCount - originalWordCount) > 50 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-yellow-400 font-semibold mb-1">Significant Change</p>
                  <p className="text-slate-400 text-sm">
                    Your edit differs significantly from the original. This will create a new version branch.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center gap-2"
            >
              <Save size={20} />
              {baseContent ? 'Save as New Version' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContentModal;