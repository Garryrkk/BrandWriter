// GeneratorPage.jsx
import React, { useState } from 'react';
import { Sparkles, RefreshCw, Save, ShoppingBasket, X } from 'lucide-react';

const GeneratorPage = ({ contentType = 'LinkedIn Post' }) => {
  const [settings, setSettings] = useState({
    tone: 'professional',
    template: 'default',
    wordCount: 'medium',
    cta: true,
    emoji: true,
    format: 'text'
  });

  const [variations, setVariations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const tones = ['Professional', 'Casual', 'Inspiring', 'Educational', 'Humorous', 'Storytelling'];
  const templates = ['Default', 'Problem-Solution', 'Listicle', 'Case Study', 'Question Hook', 'Stats Driven'];
  const wordCounts = ['Short (50-100)', 'Medium (100-250)', 'Long (250-500)'];
  const formats = ['Text Only', 'Text + Image', 'Carousel', 'Video Script', 'Story Format'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setVariations([
        {
          id: 1,
          content: `🚀 Variation 1: The future of marketing is here...\n\n${contentType} content generated with ${settings.tone} tone.\n\nThis is where your AI-generated content would appear with proper formatting, hooks, and CTAs based on your settings.\n\n#Marketing #AI #ContentCreation`,
          engagement: '★★★★☆',
          wordCount: 156
        },
        {
          id: 2,
          content: `💡 Variation 2: Ever wondered how top brands...\n\nAlternative ${contentType} approach using ${settings.template} template.\n\nComplete with storytelling elements, data points, and strategic call-to-action.\n\n#Business #Growth #Strategy`,
          engagement: '★★★★★',
          wordCount: 142
        },
        {
          id: 3,
          content: `✨ Variation 3: Here's what nobody tells you about...\n\nFresh ${contentType} angle with ${settings.tone} voice.\n\nEngaging narrative, clear value proposition, and compelling hook to capture attention.\n\n#Innovation #Digital #Success`,
          engagement: '★★★☆☆',
          wordCount: 138
        }
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Generate {contentType}</h1>
          <p className="text-gray-400">Configure your settings and generate AI-powered content variations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PANEL: Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-yellow-300" size={20} />
              Settings
            </h2>

            <div className="space-y-6">
              {/* Tone Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <select 
                  value={settings.tone}
                  onChange={(e) => setSettings({...settings, tone: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                >
                  {tones.map(tone => (
                    <option key={tone} value={tone.toLowerCase()}>{tone}</option>
                  ))}
                </select>
              </div>

              {/* Template Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
                <select 
                  value={settings.template}
                  onChange={(e) => setSettings({...settings, template: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                >
                  {templates.map(template => (
                    <option key={template} value={template.toLowerCase().replace(' ', '-')}>{template}</option>
                  ))}
                </select>
              </div>

              {/* Format Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <select 
                  value={settings.format}
                  onChange={(e) => setSettings({...settings, format: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                >
                  {formats.map(format => (
                    <option key={format} value={format.toLowerCase()}>{format}</option>
                  ))}
                </select>
              </div>

              {/* Word Count */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Word Count</label>
                <select 
                  value={settings.wordCount}
                  onChange={(e) => setSettings({...settings, wordCount: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                >
                  {wordCounts.map(count => (
                    <option key={count} value={count.split(' ')[0].toLowerCase()}>{count}</option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">Include CTA</span>
                  <input
                    type="checkbox"
                    checked={settings.cta}
                    onChange={(e) => setSettings({...settings, cta: e.target.checked})}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-300 focus:ring-2 focus:ring-yellow-300"
                  />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">Include Emojis</span>
                  <input
                    type="checkbox"
                    checked={settings.emoji}
                    onChange={(e) => setSettings({...settings, emoji: e.target.checked})}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-pink-300 focus:ring-2 focus:ring-pink-300"
                  />
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-yellow-300 to-pink-300 text-gray-900 font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Output Area */}
          <div className="lg:col-span-2 space-y-4">
            {variations.length === 0 ? (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 border-dashed flex flex-col items-center justify-center min-h-[500px]">
                <Sparkles size={64} className="text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg text-center">
                  Configure your settings and click "Generate Content" to see AI-powered variations
                </p>
              </div>
            ) : (
              variations.map((variation) => (
                <VariationCard key={variation.id} variation={variation} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VariationCard = ({ variation }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-yellow-300 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Variation {variation.id}</h3>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Words: {variation.wordCount}</span>
            <span>Engagement: {variation.engagement}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
        <p className="text-white whitespace-pre-line">{variation.content}</p>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
          <Save size={16} />
          Save to Draft
        </button>
        <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
          <ShoppingBasket size={16} />
          Add to Basket
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all">
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default GeneratorPage;