import React from 'react';
import { Mail, RefreshCw } from 'lucide-react';

const EmailTable = ({ emails, isLoading }) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
        <RefreshCw className="animate-spin mx-auto mb-4 text-yellow-300" size={32} />
        <p className="text-slate-400">Loading email data...</p>
      </div>
    );
  }

  // Empty state
  if (emails.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
        <Mail className="mx-auto mb-4 text-slate-600" size={48} />
        <p className="text-slate-400">No emails sent on this date</p>
      </div>
    );
  }

  // Table with data
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Email Address
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email, index) => (
              <tr
                key={index}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-6 py-4 text-slate-300 font-medium">
                  {email.address}
                </td>
                <td className="px-6 py-4 text-center">
                  {email.type === 'new' ? (
                    <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                      New
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30">
                      Repeated
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-700/20 border-t border-slate-700/50 px-6 py-3">
        <p className="text-sm text-slate-400">
          Showing {emails.length} email{emails.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default EmailTable;