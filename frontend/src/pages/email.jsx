import React, { useState } from 'react';
import { Mail, Calendar, TrendingUp, Users, RefreshCw, History, Sparkles, Database, Brain, Cpu, Network, Bot } from 'lucide-react';

// Stats Cards Component
const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Sent */}
      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Mail size={24} className="text-white" />
          </div>
          <TrendingUp className="text-blue-400" size={20} />
        </div>
        <p className="text-slate-400 text-sm mb-1">Total Sent</p>
        <p className="text-4xl font-bold text-blue-400">{stats.total}</p>
      </div>

      {/* New Emails */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 hover:shadow-xl hover:shadow-green-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <Sparkles className="text-green-400" size={20} />
        </div>
        <p className="text-slate-400 text-sm mb-1">New Emails</p>
        <p className="text-4xl font-bold text-green-400">{stats.new}</p>
      </div>

      {/* Repeated Emails */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 hover:shadow-xl hover:shadow-yellow-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <RefreshCw size={24} className="text-white" />
          </div>
          <History className="text-yellow-400" size={20} />
        </div>
        <p className="text-slate-400 text-sm mb-1">Repeated Emails</p>
        <p className="text-4xl font-bold text-yellow-400">{stats.repeated}</p>
      </div>
    </div>
  );
};

// Date Picker Component
const DatePicker = ({ selectedDate, onDateChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2 text-slate-300">Select Date</label>
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 transition-all"
        />
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-300 pointer-events-none" size={20} />
      </div>
    </div>
  );
};

// Email Table Component
const EmailTable = ({ emails, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
        <RefreshCw className="animate-spin mx-auto mb-4 text-yellow-300" size={32} />
        <p className="text-slate-400">Loading email data...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-12 text-center">
        <Mail className="mx-auto mb-4 text-slate-600" size={48} />
        <p className="text-slate-400">No emails sent on this date</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email Address</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Type</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email, index) => (
              <tr
                key={index}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="px-6 py-4 text-slate-300">{email.address}</td>
                <td className="px-6 py-4 text-center">
                  {email.type === 'new' ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                      New
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30">
                      Repeated
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Dashboard Component
const EmailStatsDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats state - fetched from API
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    repeated: 0
  });

  const [emails, setEmails] = useState([]);

  // Fetch stats when date changes
  const fetchStats = async (date) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/stats/${date}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      const data = await response.json();
      setStats({
        total: data.total || 0,
        new: data.new || 0,
        repeated: data.repeated || 0
      });
      // Map emails from API format to component format
      const mappedEmails = (data.emails || []).map(e => ({
        address: e.email,
        type: e.repeat ? 'repeated' : 'new'
      }));
      setEmails(mappedEmails);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
      // Set empty data on error
      setStats({ total: 0, new: 0, repeated: 0 });
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and date change
  React.useEffect(() => {
    fetchStats(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-6 py-3 flex items-center gap-2">
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Mail className="text-yellow-300" size={36} />
          Email Stats Dashboard
        </h1>
        <p className="text-slate-400">Daily email statistics and tracking</p>
      </div>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Email Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database className="text-yellow-300" />
          Email List ({emails.length})
        </h2>
        <EmailTable emails={emails} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-700/50">
        <p className="text-sm text-slate-400">
          We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
        </p>
      </footer>
    </div>
  );
};

export default EmailStatsDashboard;