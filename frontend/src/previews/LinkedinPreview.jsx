import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Send, MoreHorizontal, Globe } from 'lucide-react';

const LinkedInPreview = ({ content }) => {
  const [expanded, setExpanded] = useState(false);
  
  // LinkedIn typically shows 210 characters before "see more"
  const previewLength = 210;
  const needsTruncation = content.length > previewLength;
  const displayContent = expanded || !needsTruncation 
    ? content 
    : content.slice(0, previewLength);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl border border-slate-200">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            YB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">Your Brand</p>
              <span className="text-slate-600">• 3rd+</span>
            </div>
            <p className="text-sm text-slate-600">Company Tagline | Industry Leader</p>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <span>2h</span>
              <span>•</span>
              <Globe size={12} />
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-slate-100 rounded">
          <MoreHorizontal className="text-slate-600" size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
          {displayContent}
          {needsTruncation && !expanded && '...'}
        </p>
        {needsTruncation && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 font-semibold text-sm mt-1 hover:underline"
          >
            {expanded ? 'see less' : '...see more'}
          </button>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-slate-600 border-t border-b border-slate-200">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
              <ThumbsUp size={10} className="text-white" fill="white" />
            </div>
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              ❤
            </div>
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              💡
            </div>
          </div>
          <span>237</span>
        </div>
        <div className="flex items-center gap-3">
          <span>18 comments</span>
          <span>•</span>
          <span>5 reposts</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 grid grid-cols-4 gap-1">
        <button className="flex items-center justify-center gap-2 py-3 px-4 hover:bg-slate-100 rounded transition-colors">
          <ThumbsUp size={20} className="text-slate-600" />
          <span className="text-sm font-semibold text-slate-600">Like</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-3 px-4 hover:bg-slate-100 rounded transition-colors">
          <MessageSquare size={20} className="text-slate-600" />
          <span className="text-sm font-semibold text-slate-600">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-3 px-4 hover:bg-slate-100 rounded transition-colors">
          <Share2 size={20} className="text-slate-600" />
          <span className="text-sm font-semibold text-slate-600">Repost</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-3 px-4 hover:bg-slate-100 rounded transition-colors">
          <Send size={20} className="text-slate-600" />
          <span className="text-sm font-semibold text-slate-600">Send</span>
        </button>
      </div>
    </div>
  );
};

export default LinkedInPreview;