import React from 'react';
import { Mail, Star, Archive, Trash2, MoreVertical, Reply, Forward, Printer } from 'lucide-react';

const EmailPreview = ({ content }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
      {/* Email Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 rounded">
            <Archive size={18} className="text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-200 rounded">
            <Trash2 size={18} className="text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-200 rounded">
            <Star size={18} className="text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-200 rounded">
            <MoreVertical size={18} className="text-slate-600" />
          </button>
        </div>
        <div className="text-xs text-slate-500">
          1 of 1,234
        </div>
      </div>

      {/* Email Details */}
      <div className="p-6 border-b border-slate-200">
        {/* Subject */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail size={24} className="text-blue-600" />
            {content.subject || 'No Subject'}
          </h2>
        </div>

        {/* From/To Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              YB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">Your Brand</p>
                <span className="text-sm text-slate-500">&lt;hello@yourbrand.com&gt;</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="font-medium">to</span> recipient@example.com
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-500 text-right">
            <p>Today, 10:30 AM</p>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6">
        <div className="prose prose-slate max-w-none">
          <div className="text-slate-900 whitespace-pre-wrap leading-relaxed">
            {content.body || content.text || 'No content'}
          </div>
        </div>
      </div>

      {/* Email Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
            <Reply size={16} />
            Reply
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium transition-colors">
            <Forward size={16} />
            Forward
          </button>
          <button className="p-2 hover:bg-slate-200 rounded transition-colors">
            <Printer size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Gmail-style Quick Reply */}
      <div className="px-6 py-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
          <div className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-sm text-slate-500">
            Click here to Reply
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;