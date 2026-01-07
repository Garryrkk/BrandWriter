import React from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({ selectedDate, onDateChange }) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2 text-slate-300">
        Select Date
      </label>
      <div className="relative inline-block w-full md:w-auto">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={today}
          className="w-full md:w-auto px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-yellow-300/50 focus:ring-2 focus:ring-yellow-300/20 transition-all cursor-pointer"
        />
        <Calendar 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-300 pointer-events-none" 
          size={20} 
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Select a date to view email statistics
      </p>
    </div>
  );
};

export default DatePicker;