import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, Lightbulb } from 'lucide-react';

const RegenerateModal = ({ onRegenerate, onClose }) => {
  const [instruction, setInstruction] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  const quickModifiers = [
    { id: 'shorter', label: 'Make Shorter', color: 'blue' },
    { id: 'longer', label: 'Make Longer', color: 'purple' },
    { id: 'professional', label: 'More Professional', color: 'slate' },
    { id: 'casual', label: 'More Casual', color: 'green' },
    { id: 'persuasive', label: 'More Persuasive', color: 'orange' },
    { id: 'add-cta', label: 'Add Strong CTA', color: 'red' },
    { id: 'add-emojis', label: 'Add Emojis', color: 'yellow' },
    { id: 'remove-emojis', label: 'Remove Emojis', color: 'slate' },
  ];

  const toggleModifier = (modifierId) => {
    setSelectedModifiers(prev => 
      prev.includes(modifierId)
        ? prev.filter(id => id !== modifierId)
        : [...prev, modifierId]
    );
  };

  const getModifierColor = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
      slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
    };
    return colors[color] || colors.slate;
  };

  const getSelectedModifierColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white border-blue-600',
      purple: 'bg-purple-500 text-white border-purple-600',
      slate: 'bg-slate-500 text-white border-slate-600',
      green: 'bg-green-500 text-white border-green-600',
      orange: 'bg-orange-500 text-white border-orange-600',
      red: 'bg-red-500 text-white border-red-600',
      yellow: 'bg-yellow-500 text-slate-900 border-yellow-600',
    };
    return colors[color] || colors.slate;
  };

  const handleRegenerate = () => {
    const fullInstruction = [
      ...selectedModifiers,
      instruction
    ].filter(Boolean).join(', ');
    
    onRegenerate(fullInstruction);
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <RefreshCw size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Regenerate Content</h2>
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
            {/* Quick Modifiers */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-300" />
                Quick Modifiers
              </label>
              <div className="flex flex-wrap gap-2">
                {quickModifiers.map((modifier) => (
                  <button
                    key={modifier.id}
                    onClick={() => toggleModifier(modifier.id)}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      selectedModifiers.includes(modifier.id)
                        ? getSelectedModifierColor(modifier.color)
                        : getModifierColor(modifier.color)
                    }`}
                  >
                    {modifier.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Selected: {selectedModifiers.length} modifier{selectedModifiers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Custom Instruction */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-300 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-300" />
                Custom Instructions (Optional)
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Improve tone, length, CTA, add specific details..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                rows="4"
              />
              <p className="text-xs text-slate-400 mt-2">
                Be specific about what you want to change or improve
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-start gap-3">
              <RefreshCw className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-purple-400 font-semibold mb-1">AI Regeneration</p>
                <p className="text-slate-400 text-sm">
                  A completely new version will be generated using your selected modifiers and instructions. The current version will be preserved in history.
                </p>
              </div>
            </div>
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
              onClick={handleRegenerate}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Regenerate Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegenerateModal;