// AutoGenSettingsPage.jsx
import React, { useState } from 'react';
import { Settings, Zap, Clock, Save, RotateCcw } from 'lucide-react';

const AutoGenSettingsPage = () => {
  const [settings, setSettings] = useState({
    coldEmails: { enabled: true, count: 100 },
    coldDMs: { enabled: true, count: 100 },
    leadGen: { enabled: true, count: 50 },
    linkedinPosts: { enabled: true, count: 5 },
    instagramPosts: { enabled: true, count: 3 },
    youtubeShorts: { enabled: false, count: 2 },
    defaultTone: 'professional',
    autoSaveDestination: 'drafts',
    generationTime: '06:00',
    enableWeekends: false
  });

  const toggleService = (service) => {
    setSettings({
      ...settings,
      [service]: { ...settings[service], enabled: !settings[service].enabled }
    });
  };

  const updateCount = (service, value) => {
    setSettings({
      ...settings,
      [service]: { ...settings[service], count: parseInt(value) || 0 }
    });
  };

  const saveSettings = () => {
    alert('Settings saved successfully!');
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      setSettings({
        coldEmails: { enabled: true, count: 100 },
        coldDMs: { enabled: true, count: 100 },
        leadGen: { enabled: true, count: 50 },
        linkedinPosts: { enabled: true, count: 5 },
        instagramPosts: { enabled: true, count: 3 },
        youtubeShorts: { enabled: false, count: 2 },
        defaultTone: 'professional',
        autoSaveDestination: 'drafts',
        generationTime: '06:00',
        enableWeekends: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="text-yellow-300" />
            Auto-Generation Settings
          </h1>
          <p className="text-gray-400">Configure your daily automated content generation</p>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={24} />
                <h2 className="text-2xl font-bold">Automation Active</h2>
              </div>
              <p className="opacity-90">
                Next generation scheduled for today at {settings.generationTime}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {(settings.coldEmails.enabled ? settings.coldEmails.count : 0) +
                 (settings.coldDMs.enabled ? settings.coldDMs.count : 0) +
                 (settings.leadGen.enabled ? settings.leadGen.count : 0) +
                 (settings.linkedinPosts.enabled ? settings.linkedinPosts.count : 0) +
                 (settings.instagramPosts.enabled ? settings.instagramPosts.count : 0) +
                 (settings.youtubeShorts.enabled ? settings.youtubeShorts.count : 0)}
              </p>
              <p className="text-sm opacity-90">items/day</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Types */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Daily Generation Quotas</h2>
              
              <div className="space-y-4">
                <ServiceToggle
                  title="Cold Emails"
                  description="Automated email outreach campaigns"
                  enabled={settings.coldEmails.enabled}
                  count={settings.coldEmails.count}
                  onToggle={() => toggleService('coldEmails')}
                  onCountChange={(val) => updateCount('coldEmails', val)}
                  icon="📧"
                  color="emerald"
                />

                <ServiceToggle
                  title="Cold DMs"
                  description="Direct message campaigns for social platforms"
                  enabled={settings.coldDMs.enabled}
                  count={settings.coldDMs.count}
                  onToggle={() => toggleService('coldDMs')}
                  onCountChange={(val) => updateCount('coldDMs', val)}
                  icon="💬"
                  color="purple"
                />

                <ServiceToggle
                  title="Lead Generation Ideas"
                  description="Daily lead gen strategies and tactics"
                  enabled={settings.leadGen.enabled}
                  count={settings.leadGen.count}
                  onToggle={() => toggleService('leadGen')}
                  onCountChange={(val) => updateCount('leadGen', val)}
                  icon="🎯"
                  color="yellow"
                />

                <ServiceToggle
                  title="LinkedIn Posts"
                  description="Professional thought leadership content"
                  enabled={settings.linkedinPosts.enabled}
                  count={settings.linkedinPosts.count}
                  onToggle={() => toggleService('linkedinPosts')}
                  onCountChange={(val) => updateCount('linkedinPosts', val)}
                  icon="💼"
                  color="blue"
                />

                <ServiceToggle
                  title="Instagram Posts"
                  description="Visual content for Instagram feed"
                  enabled={settings.instagramPosts.enabled}
                  count={settings.instagramPosts.count}
                  onToggle={() => toggleService('instagramPosts')}
                  onCountChange={(val) => updateCount('instagramPosts', val)}
                  icon="📸"
                  color="pink"
                />

                <ServiceToggle
                  title="YouTube Shorts"
                  description="Short-form video scripts"
                  enabled={settings.youtubeShorts.enabled}
                  count={settings.youtubeShorts.count}
                  onToggle={() => toggleService('youtubeShorts')}
                  onCountChange={(val) => updateCount('youtubeShorts', val)}
                  icon="🎥"
                  color="red"
                />
              </div>
            </div>
          </div>

          {/* Side Settings */}
          <div className="space-y-6">
            {/* Generation Schedule */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="text-yellow-300" size={20} />
                Schedule
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Generation Time
                  </label>
                  <input
                    type="time"
                    value={settings.generationTime}
                    onChange={(e) => setSettings({...settings, generationTime: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                  />
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-300">Generate on Weekends</span>
                  <input
                    type="checkbox"
                    checked={settings.enableWeekends}
                    onChange={(e) => setSettings({...settings, enableWeekends: e.target.checked})}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-300 focus:ring-2 focus:ring-yellow-300"
                  />
                </label>
              </div>
            </div>

            {/* Default Settings */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Default Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Tone
                  </label>
                  <select
                    value={settings.defaultTone}
                    onChange={(e) => setSettings({...settings, defaultTone: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="inspiring">Inspiring</option>
                    <option value="educational">Educational</option>
                    <option value="humorous">Humorous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-Save Destination
                  </label>
                  <select
                    value={settings.autoSaveDestination}
                    onChange={(e) => setSettings({...settings, autoSaveDestination: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
                  >
                    <option value="drafts">Drafts</option>
                    <option value="basket">Basket</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={saveSettings}
                className="w-full bg-gradient-to-r from-yellow-300 to-pink-300 hover:shadow-lg text-gray-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Settings
              </button>
              
              <button
                onClick={resetToDefaults}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceToggle = ({ title, description, enabled, count, onToggle, onCountChange, icon, color }) => {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-pink-600',
    yellow: 'from-yellow-400 to-orange-500',
    blue: 'from-blue-500 to-blue-600',
    pink: 'from-pink-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`rounded-xl border transition-all ${
      enabled 
        ? 'border-gray-600 bg-gray-700/30' 
        : 'border-gray-700 bg-gray-800/20 opacity-60'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`bg-gradient-to-br ${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-300"></div>
          </label>
        </div>

        {enabled && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300">Items per day:</label>
            <input
              type="number"
              value={count}
              onChange={(e) => onCountChange(e.target.value)}
              min="0"
              max="1000"
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-yellow-300 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoGenSettingsPage;