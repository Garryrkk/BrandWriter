import React from 'react';
import { X, Eye, Image as ImageIcon } from 'lucide-react';

const PreviewModal = ({ content, platform, onClose }) => {
  const renderPreview = () => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return (
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            {/* Instagram Preview */}
            <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-900">Your Brand</p>
                  <p className="text-xs text-slate-600">Just now</p>
                </div>
              </div>

              {/* Images/Carousel */}
              {content.assets?.images && content.assets.images.length > 0 ? (
                <div className="relative bg-slate-100 aspect-square">
                  <img 
                    src={content.assets.images[0]} 
                    alt="Instagram post" 
                    className="w-full h-full object-cover"
                  />
                  {content.assets.images.length > 1 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                      1/{content.assets.images.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-200 aspect-square flex items-center justify-center">
                  <ImageIcon size={48} className="text-slate-400" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <p className="text-slate-900 text-sm whitespace-pre-wrap">
                  {content.text || content.body}
                </p>
              </div>
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            {/* LinkedIn Preview */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  YB
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Your Brand</p>
                  <p className="text-xs text-slate-600">Just now · 🌐</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {content.text || content.body}
                </p>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            {/* Email Preview */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
              {/* Email Header */}
              <div className="bg-slate-50 p-4 border-b">
                <p className="text-xs text-slate-600 mb-1">Subject:</p>
                <p className="font-semibold text-slate-900">{content.subject}</p>
              </div>

              {/* Email Body */}
              <div className="p-6">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {content.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            {/* YouTube Preview */}
            <div className="max-w-3xl mx-auto">
              {/* Video Placeholder */}
              <div className="bg-black aspect-video rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-white text-sm">Video Preview</p>
                </div>
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {content.title}
                </h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">
                  {content.script}
                </p>
              </div>
            </div>
          </div>
        );

      case 'medium':
        return (
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            {/* Medium Preview */}
            <div className="max-w-3xl mx-auto bg-white rounded-lg p-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-6">
                {content.title}
              </h1>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b">
                <div className="w-12 h-12 bg-slate-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-900">Your Name</p>
                  <p className="text-sm text-slate-600">5 min read · Just now</p>
                </div>
              </div>
              <article className="prose prose-lg max-w-none">
                <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {content.body}
                </p>
              </article>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
            <pre className="text-slate-300 text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Content Preview</h2>
                <p className="text-sm text-slate-400">
                  Platform: <span className="text-yellow-300 font-semibold">{platform}</span>
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
          <div className="p-6">
            {renderPreview()}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;