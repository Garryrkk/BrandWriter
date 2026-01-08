import React, { useState } from 'react';
import { Zap, Sparkles, Linkedin, AlertCircle } from 'lucide-react';

// Import components - NO declarations, just imports
import GeneratedContentCard from '../components/generation/GeneratedContentCard';
import EditContentModal from '../components/generation/EditContentModal';
import ImprovePromptModal from '../components/generation/ImprovePromptModal';
import PreviewModal from '../previews/PreviewModal';

const LinkedInGeneratorPage = () => {
  const [contentType, setContentType] = useState('thought-leadership');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [editingContent, setEditingContent] = useState(null);
  const [showImprove, setShowImprove] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const contentTypes = [
    { value: 'thought-leadership', label: 'Thought Leadership Post' },
    { value: 'carousel', label: 'Carousel Text' },
    { value: 'founder-story', label: 'Founder Story' },
    { value: 'industry-insight', label: 'Industry Insight' },
    { value: 'how-to', label: 'How-To Guide' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = `💡 ${topic}\n\nAs a professional working with ${audience || 'various clients'}, I've learned that ${goal || 'creating value'} requires both strategy and execution.\n\nHere are my key insights:\n\n1. Always start with clear objectives\n2. Understand your audience deeply\n3. Deliver consistent value\n\n${customInstruction ? `\n${customInstruction}\n` : ''}\nWhat's your experience with this? Let's discuss in the comments.\n\n#Leadership #Business #Growth`;

      setGeneratedContent({
        id: Date.now(),
        platform: 'LinkedIn',
        category: contentType,
        text: mockContent,
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
    setGeneratedContent(editedContent);
    setEditingContent(null);
  };

  const handleImprove = async (modifiers) => {
    setIsImproving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let improvedText = generatedContent.text;
      
      if (modifiers.tone) {
        improvedText = `[${modifiers.tone.toUpperCase()} TONE]\n\n` + improvedText;
      }
      if (modifiers.length === 'shorter') {
        improvedText = improvedText.substring(0, improvedText.length / 2) + '...';
      } else if (modifiers.length === 'longer') {
        improvedText += '\n\nAdditional insights:\n• Deep dive into best practices\n• Real-world case studies\n• Actionable takeaways for your business';
      }
      if (modifiers.cta) {
        improvedText += '\n\n👉 What are your thoughts? Comment below or DM me to discuss further!';
      }
      if (modifiers.extra_instruction) {
        improvedText += `\n\nNote: ${modifiers.extra_instruction}`;
      }

      setGeneratedContent({
        ...generatedContent,
        text: improvedText,
      });
      
      setShowImprove(false);
    } catch (error) {
      console.error('Improvement error:', error);
      alert('Failed to improve content. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Linkedin size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">LinkedIn Post Generator</h1>
                <p className="text-slate-400">Create professional thought leadership content</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <AlertCircle size={16} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Max 3,000 chars • Professional tone • CTA encouraged</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-bold mb-6">Content Settings</h2>

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

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Why founders fail at hiring"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Early-stage startup founders"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-300">Goal</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Authority building"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-300/50 transition-all"
                  />
                </div>

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

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate LinkedIn Post
                    </>
                  )}
                </button>
              </div>
            </div>

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
                  <Linkedin size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">No content generated yet</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate to create your LinkedIn post</p>
                </div>
              )}
            </div>
          </div>

      {/* Using Imported Components - NO inline declarations */}
      {editingContent && (
        <EditContentModal
          content={editingContent}
          platform="LinkedIn"
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
          platform="LinkedIn"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default LinkedInGeneratorPage;