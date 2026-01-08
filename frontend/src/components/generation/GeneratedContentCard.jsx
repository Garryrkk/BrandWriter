import React, { useState } from 'react';
import { Edit, RefreshCw, Target, Eye, Save, ShoppingCart, Trash2, Clock } from 'lucide-react';

import ImprovePromptModal from './ImprovePromptModal';
import EditContentModal from './EditContentModal';
import PreviewModal from '../../previews/PreviewModal';


const GeneratedContentCard = ({ content }) => {
  const [showImprove, setShowImprove] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleImprove = async (modifiers) => {
    setIsRegenerating(true);
    try {
      await regenerateWithModifiers({
        platform: content.platform,
        category: content.category,
        brand_id: content.brand_id,
        base_content_id: content.id,
        prompt_modifiers: modifiers
      });
      setShowImprove(false);
    } catch (error) {
      console.error('Error improving content:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateWithModifiers({
        platform: content.platform,
        category: content.category,
        brand_id: content.brand_id,
        base_content_id: content.id,
        prompt_modifiers: {}
      });
    } catch (error) {
      console.error('Error regenerating content:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdit = (editedContent) => {
    // Save edited content logic
    console.log('Saving edited content:', editedContent);
    setShowEdit(false);
  };

  const getPlatformColor = () => {
    switch (content.platform?.toLowerCase()) {
      case 'linkedin': return 'from-blue-500 to-blue-600';
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'youtube': return 'from-red-500 to-red-600';
      case 'email': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-slate-600 to-slate-700';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getPlatformIcon = () => {
    switch (content.platform?.toLowerCase()) {
      case 'linkedin': return '💼';
      case 'instagram': return '📸';
      case 'youtube': return '🎥';
      case 'email': return '📧';
      case 'medium': return '📝';
      default: return '📄';
    }
  };

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-yellow-300/30 transition-all p-6 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getPlatformColor()} rounded-lg flex items-center justify-center text-2xl`}>
              {getPlatformIcon()}
            </div>
            <div>
              <h3 className="font-bold text-lg">{content.platform}</h3>
              <p className="text-sm text-slate-400">{content.category}</p>
            </div>
          </div>
          {content.created_at && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} />
              <span>{new Date(content.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
          <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
            {content.text || content.body || content.script || 'No content'}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium"
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>

          <button
            onClick={() => setShowImprove(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all text-sm font-medium"
          >
            <Target size={16} />
            Improve
          </button>

          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm font-medium"
          >
            <Eye size={16} />
            Preview
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 rounded-lg transition-all text-sm font-medium">
            <Save size={16} />
            Save Draft
          </button>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all text-sm font-medium">
            <ShoppingCart size={16} />
            Add to Basket
          </button>
        </div>

        {/* Delete Button (Full Width) */}
        <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-medium">
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Modals */}
      {showImprove && (
        <ImprovePromptModal
          onSubmit={handleImprove}
          onClose={() => setShowImprove(false)}
          isProcessing={isRegenerating}
        />
      )}

      {showPreview && (
        <PreviewModal
          content={content}
          platform={content.platform}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showEdit && (
        <EditContentModal
          content={content}
          platform={content.platform}
          onSave={handleSaveEdit}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
};

export default GeneratedContentCard;