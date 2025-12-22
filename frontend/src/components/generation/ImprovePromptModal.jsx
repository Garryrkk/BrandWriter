import React, { useState } from 'react';
import { X, Target, Sparkles, RefreshCw } from 'lucide-react';

const ImprovePromptModal = ({ onSubmit, onClose, isProcessing = false }) => {
  const [modifiers, setModifiers] = useState({
    tone: '',
    length: '',
    cta: false,
    brand_heavy: false,
    platform_native: true,
    extra_instruction: ''
  });

  const update = (key, value) =>
    setModifiers(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(modifiers);
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
        <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-lg flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Improve Content</h2>
                <p className="text-sm text-slate-400">Customize regeneration parameters</p>
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
            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Tone
              </label>
              <select
                value={modifiers.tone}
                onChange={e => update('tone', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
              >
                <option value="">Default (Use Brand Voice)</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="persuasive">Persuasive</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            {/* Length Selector */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Length
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['shorter', '', 'longer'].map((length, idx) => (
                  <button
                    key={idx}
                    onClick={() => update('length', length)}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      modifiers.length === length
                        ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-slate-900'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {length === 'shorter' ? 'Shorter' : length === 'longer' ? 'Longer' : 'Default'}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={modifiers.cta}
                  onChange={e => update('cta', e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-400"
                />
                <div>
                  <span className="font-medium text-white">Strong Call-to-Action</span>
                  <p className="text-sm text-slate-400">Add a compelling CTA at the end</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={modifiers.brand_heavy}
                  onChange={e => update('brand_heavy', e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-400"
                />
                <div>
                  <span className="font-medium text-white">Brand Heavy</span>
                  <p className="text-sm text-slate-400">Emphasize brand voice and messaging</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={modifiers.platform_native}
                  onChange={e => update('platform_native', e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-yellow-400 focus:ring-yellow-400"
                />
                <div>
                  <span className="font-medium text-white">Platform-Native Style</span>
                  <p className="text-sm text-slate-400">Optimize for the target platform</p>
                </div>
              </label>
            </div>

            {/* Extra Instructions */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300">
                Extra Instructions (Optional)
              </label>
              <textarea
                value={modifiers.extra_instruction}
                onChange={e => update('extra_instruction', e.target.value)}
                placeholder="Add any specific requirements or changes you'd like..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="4"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
              <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-blue-400 font-semibold mb-1">AI Enhancement</p>
                <p className="text-slate-400 text-sm">
                  Your content will be regenerated with these parameters while maintaining your brand voice and style.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Target size={20} />
                  Improve Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovePromptModal;