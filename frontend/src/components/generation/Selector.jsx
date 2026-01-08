import React, { useState } from 'react';
import { ChevronDown, History } from 'lucide-react';

const VersionSelector = ({ generation }) => {
  const [selectedVersion, setSelectedVersion] = useState(generation.active_version_id);

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
    // In real app, this would update the active version in parent component
    console.log('Selected version:', versionId);
  };

  const getVersionBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'original':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'edited':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'regenerated':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'improved':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
        <History size={16} className="text-yellow-300" />
        Content Version History
      </label>
      <div className="relative">
        <select
          value={selectedVersion}
          onChange={(e) => handleVersionChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all appearance-none cursor-pointer"
        >
          {generation.content_versions.map((v, index) => (
            <option key={v.id} value={v.id}>
              Version {generation.content_versions.length - index}: {v.type} - {new Date(v.created_at).toLocaleDateString()}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-300 pointer-events-none" 
          size={20} 
        />
      </div>

      {/* Version Details */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400">
          {generation.content_versions.length} version{generation.content_versions.length !== 1 ? 's' : ''} available
        </span>
        {generation.content_versions.map((v) => (
          v.id === selectedVersion && (
            <span 
              key={v.id}
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${getVersionBadgeColor(v.type)}`}
            >
              {v.type}
            </span>
          )
        ))}
      </div>
    </div>
  );
};

export default VersionSelector;