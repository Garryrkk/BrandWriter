import React, { useState } from 'react';
import { Zap, Sparkles, Instagram, AlertCircle } from 'lucide-react';

// Importing the modal components
import GeneratedContentCard from '../components/generation/GeneratedContentCard';
import EditContentModal from '../components/generation/EditContentModal';
import ImprovePromptModal from '../components/generation/ImprovePromptModal';
import PreviewModal from '../previews/PreviewModal';

const InstagramGeneratorPage = () => {
  // Generation state
  const [contentType, setContentType] = useState('reel-script');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal states
  const [editingContent, setEditingContent] = useState(null);
  const [showImprove, setShowImprove] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const contentTypes = [
    { value: 'reel-script', label: 'Reel Script' },
    { value: 'carousel-captions', label: 'Carousel Captions' },
    { value: 'story-copy', label: 'Story Copy' },
    { value: 'post-caption', label: 'Post Caption' },
    { value: 'bio', label: 'Bio Text' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = {
        text: `🎬 ${topic}\n\nHey everyone! Today we're diving deep into "${topic}". This is going to change the way you think about this. \n\nDon't forget to like, comment, and subscribe for more insights!\n\n#instagram #content #${topic.split(' ')[0].toLowerCase()}`,
        content_id: Date.now()
      };

      setGeneratedContent({
        id: mockResponse.content_id,
        platform: 'Instagram',
        category: contentType,
        text: mockResponse.text,
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
      text: editedContent.text || editedContent
    });
    setEditingContent(null);
  };

  const handleImprove = async (modifiers) => {
    // This will be handled by ImprovePromptModal component
    console.log('Improving content with modifiers:', modifiers);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Instagram size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Instagram Content Generator</h1>
                <p className="text-slate-400">Create engaging reels, carousels, and captions</p>
              </div>
            </div>

            {/* Constraints Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg">
              <AlertCircle size={16} className="text-pink-400" />
              <span className="text-pink-400 text-sm font-medium">Hook emphasis • Emoji-friendly • 2,200 char limit</span>
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
                    placeholder="e.g., 5 morning habits for productivity"
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
                    placeholder="e.g., Young professionals, Gen Z"
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
                    placeholder="e.g., Engagement, viral reach"
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
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate Instagram Content
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
                  <Instagram size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">No content generated yet</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to create your Instagram content</p>
                </div>
              )}
            </div>
          </div>

      {/* Using Imported Modal Components */}
      {editingContent && (
        <EditContentModal
          content={editingContent}
          platform="Instagram"
          onSave={handleSaveEdit}
          onClose={() => setEditingContent(null)}
        />
      )}

      {showImprove && (
        <ImprovePromptModal
          onSubmit={handleImprove}
          onClose={() => setShowImprove(false)}
          isProcessing={false}
        />
      )}

      {showPreview && (
        <PreviewModal
          content={generatedContent}
          platform="Instagram"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default InstagramGeneratorPage;