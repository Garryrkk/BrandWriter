import React, { useState } from 'react';
import { Zap, Sparkles, Youtube, AlertCircle } from 'lucide-react';
import GeneratedContentCard from '../components/generation/GeneratedContentCard';
import EditContentModal from '../components/generation/EditContentModal';
import ImprovePromptModal from '../components/generation/ImprovePromptModal';
import PreviewModal from '../previews/PreviewModal';

const YouTubeGeneratorPage = () => {
  // Generation state
  const [contentType, setContentType] = useState('long-script');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal state
  const [editingContent, setEditingContent] = useState(null);
  const [showImprove, setShowImprove] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const contentTypes = [
    { value: 'long-script', label: 'Long Form Script' },
    { value: 'shorts-script', label: 'YouTube Shorts Script' },
    { value: 'description', label: 'Video Description' },
    { value: 'tutorial', label: 'Tutorial Script' },
    { value: 'review', label: 'Review Script' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateContent({
        platform: 'youtube',
        category: contentType,
        brand_id: 'BRAND_ID',
        prompt: `Topic: ${topic}\nAudience: ${audience}\nGoal: ${goal}\n${customInstruction ? `Additional: ${customInstruction}` : ''}`
      });

      setGeneratedContent({
        id: result.content_id || Date.now(),
        platform: 'YouTube',
        category: contentType,
        script: result.text,
        title: result.title || '',
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = (editedContent) => {
    setGeneratedContent({
      ...generatedContent,
      script: editedContent.script,
      title: editedContent.title
    });
    setEditingContent(null);
  };

  const handleImprove = async (modifiers) => {
    setIsImproving(true);
    try {
      // Simulate improvement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let improvedScript = generatedContent.script;
      
      if (modifiers.tone) {
        improvedScript = `[${modifiers.tone.toUpperCase()} TONE]\n\n${improvedScript}`;
      }
      if (modifiers.cta) {
        improvedScript += '\n\n[CTA] Don\'t forget to like, subscribe, and hit the bell icon for more videos!';
      }
      
      setGeneratedContent({
        ...generatedContent,
        script: improvedScript,
      });
      
      setShowImprove(false);
    } catch (error) {
      console.error('Improvement error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Youtube size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">YouTube Script Generator</h1>
                <p className="text-slate-400">Create compelling video scripts and descriptions</p>
              </div>
            </div>

            {/* Constraints Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">Hook in first 8 seconds • CTA placement • Timestamps recommended</span>
            </div>
          </div>

          {/* Generator Form */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6">Content Settings</h2>

                {/* Content Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  >
                    {contentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Complete guide to home recording"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* Audience Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Beginner musicians, podcasters"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* Goal Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Goal</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Education, subscriber growth"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                {/* Custom Instruction */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Additional Instructions (Optional)</label>
                  <textarea
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    placeholder="Any specific requirements..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all resize-none"
                    rows="4"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate YouTube Script
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div>
              {generatedContent ? (
                <GeneratedContentCard 
                  content={generatedContent}
                  onEdit={() => setEditingContent(generatedContent)}
                  onImprove={() => setShowImprove(true)}
                  onPreview={() => setShowPreview(true)}
                />
              ) : (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 border-dashed p-12 text-center">
                  <Youtube size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">No content generated yet</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to create your YouTube script</p>
                </div>
              )}
            </div>
          </div>

      {/* Using Imported Components - NO declarations */}
      {editingContent && (
        <EditContentModal
          content={editingContent}
          platform="YouTube"
          onSave={handleSaveEdit}
          onClose={() => setEditingContent(null)}
        />
      )}

      {showImprove && generatedContent && (
        <ImprovePromptModal
          onSubmit={handleImprove}
          onClose={() => setShowImprove(false)}
          isProcessing={isImproving}
        />
      )}

      {showPreview && generatedContent && (
        <PreviewModal
          content={generatedContent}
          platform="YouTube"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default YouTubeGeneratorPage;