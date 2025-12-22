import React from 'react';
import { Mail, TrendingUp, Users, RefreshCw, History, Sparkles } from 'lucide-react';

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Sent Card */}
      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Mail size={24} className="text-white" />
          </div>
          <TrendingUp className="text-blue-400" size={20} />
        </div>
        <p className="text-slate-400 text-sm mb-1">Total Sent</p>
        <p className="text-4xl font-bold text-blue-400">{stats.total}</p>
        <p className="text-xs text-slate-500 mt-2">All emails sent today</p>
      </div>

      {/* New Emails Card */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 hover:shadow-xl hover:shadow-green-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <Sparkles className="text-green-400" size={20} />
        </div>
        <p className="text-slate-400 text-sm mb-1">New Emails</p>
        <p className="text-4xl font-bold text-green-400">{stats.new}</p>
        <p className="text-xs text-slate-500 mt-2">First-time recipients</p>
      </div>

      {/* Repeated Emails Card */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 hover:shadow-xl hover:shadow-yellow-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <RefreshCw size={24} className="text-white" />
          </div>
          <History className="text-yellow-400" size={20} />
        </div>
        <p className="text-slate-400 text-sm mb-1">Repeated Emails</p>
        <p className="text-4xl font-bold text-yellow-400">{stats.repeated}</p>
        <p className="text-xs text-slate-500 mt-2">Previous recipients</p>
      </div>
    </div>
  );
};

export default StatsCards;