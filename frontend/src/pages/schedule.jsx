// SchedulePage.jsx
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, X, Edit, CheckCircle, AlertCircle } from 'lucide-react';

const SchedulePage = () => {
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null);

  const scheduledPosts = [
    {
      id: 1,
      date: '2025-01-22',
      time: '09:00',
      platform: 'LinkedIn',
      category: 'LinkedIn Post',
      title: '5 Biggest Mistakes Founders Make',
      content: 'Every founder thinks they have the perfect pitch...',
      status: 'pending'
    },
    {
      id: 2,
      date: '2025-01-22',
      time: '18:00',
      platform: 'Instagram',
      category: 'Instagram Carousel',
      title: 'Instagram Growth Strategy',
      content: 'The algorithm changed again...',
      status: 'pending'
    },
    {
      id: 3,
      date: '2025-01-23',
      time: '08:30',
      platform: 'Email',
      category: 'Cold Email',
      title: 'SaaS Outreach Campaign',
      content: 'Subject: Quick question about...',
      status: 'pending'
    },
    {
      id: 4,
      date: '2025-01-23',
      time: '12:00',
      platform: 'YouTube',
      category: 'YouTube Short',
      title: 'AI Automation Trick',
      content: 'Stop wasting 3 hours a day...',
      status: 'pending'
    },
    {
      id: 5,
      date: '2025-01-24',
      time: '07:00',
      platform: 'Email',
      category: 'Newsletter',
      title: 'Weekly Marketing Newsletter',
      content: 'This week in marketing...',
      status: 'pending'
    },
    {
      id: 6,
      date: '2025-01-20',
      time: '14:00',
      platform: 'LinkedIn',
      category: 'LinkedIn Post',
      title: 'Leadership Insights',
      content: 'What makes a great leader...',
      status: 'posted'
    },
    {
      id: 7,
      date: '2025-01-19',
      time: '16:00',
      platform: 'Instagram',
      category: 'Instagram Reel',
      title: 'Content Creation Hack',
      content: 'POV: You just discovered...',
      status: 'failed'
    }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPostsForDate = (dateStr) => {
    return scheduledPosts.filter(post => post.date === dateStr);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar className="text-yellow-300" />
              Content Scheduler
            </h1>
            <p className="text-gray-400">Plan and manage your content calendar</p>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded transition-all ${
                view === 'month' 
                  ? 'bg-yellow-300 text-gray-900 font-semibold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded transition-all ${
                view === 'week' 
                  ? 'bg-yellow-300 text-gray-900 font-semibold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded transition-all ${
                view === 'day' 
                  ? 'bg-yellow-300 text-gray-900 font-semibold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => changeMonth(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white">{formatDate(currentDate)}</h2>
            <button
              onClick={() => changeMonth(1)}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'month' && <MonthView currentDate={currentDate} scheduledPosts={scheduledPosts} onSelectPost={setSelectedPost} />}
        {view === 'week' && <WeekView scheduledPosts={scheduledPosts} onSelectPost={setSelectedPost} />}
        {view === 'day' && <DayView scheduledPosts={scheduledPosts} onSelectPost={setSelectedPost} />}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

const MonthView = ({ currentDate, scheduledPosts, onSelectPost }) => {
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDateString = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 bg-gray-700/50">
        {days.map(day => (
          <div key={day} className="p-4 text-center text-gray-300 font-semibold border-r border-gray-700 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="bg-gray-900/20 border-r border-b border-gray-700 h-32" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dateStr = getDateString(day);
          const posts = scheduledPosts.filter(post => post.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={day}
              className={`border-r border-b border-gray-700 h-32 p-2 ${
                isToday ? 'bg-yellow-300/10' : 'bg-gray-800/30'
              } hover:bg-gray-700/30 transition-colors`}
            >
              <div className={`text-sm font-semibold mb-1 ${
                isToday ? 'text-yellow-300' : 'text-gray-400'
              }`}>
                {day}
              </div>
              <div className="space-y-1">
                {posts.slice(0, 3).map(post => (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${
                      post.platform === 'LinkedIn' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      post.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                      post.platform === 'YouTube' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {post.time} {post.platform}
                  </div>
                ))}
                {posts.length > 3 && (
                  <div className="text-xs text-gray-400">+{posts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView = ({ scheduledPosts, onSelectPost }) => {
  const platforms = ['LinkedIn', 'Instagram', 'YouTube', 'Email'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 text-left text-gray-300 font-semibold">Platform</th>
              {days.map(day => (
                <th key={day} className="p-4 text-center text-gray-300 font-semibold">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform, idx) => (
              <tr key={platform} className={idx % 2 === 0 ? 'bg-gray-800/30' : ''}>
                <td className="p-4 font-semibold text-white border-r border-gray-700">{platform}</td>
                {days.map((day, dayIdx) => (
                  <td key={day} className="p-2 border-r border-gray-700 align-top">
                    <div className="space-y-1">
                      {scheduledPosts
                        .filter(post => post.platform === platform)
                        .slice(0, 2)
                        .map(post => (
                          <div
                            key={post.id}
                            onClick={() => onSelectPost(post)}
                            className="text-xs p-2 rounded cursor-pointer bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                          >
                            <div className="font-semibold text-white">{post.time}</div>
                            <div className="text-gray-400 truncate">{post.title}</div>
                          </div>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DayView = ({ scheduledPosts, onSelectPost }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date().toISOString().split('T')[0];
  const todayPosts = scheduledPosts.filter(post => post.date === today);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Today's Schedule</h3>
        <div className="space-y-2">
          {hours.map(hour => {
            const timeStr = `${String(hour).padStart(2, '0')}:00`;
            const postsAtHour = todayPosts.filter(post => post.time.startsWith(String(hour).padStart(2, '0')));

            return (
              <div key={hour} className="flex gap-4 border-b border-gray-700 pb-2">
                <div className="w-20 text-gray-400 font-mono text-sm pt-2">{timeStr}</div>
                <div className="flex-1 space-y-2">
                  {postsAtHour.map(post => (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="bg-gray-700/50 hover:bg-gray-600/50 rounded-lg p-3 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-white">{post.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.platform === 'LinkedIn' ? 'bg-blue-500/20 text-blue-300' :
                          post.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-300' :
                          post.platform === 'YouTube' ? 'bg-red-500/20 text-red-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {post.platform}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">{post.category} • {post.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PostDetailModal = ({ post, onClose }) => {
  const getStatusBadge = (status) => {
    if (status === 'posted') {
      return <span className="flex items-center gap-1 text-green-400"><CheckCircle size={16} /> Posted</span>;
    } else if (status === 'failed') {
      return <span className="flex items-center gap-1 text-red-400"><AlertCircle size={16} /> Failed</span>;
    }
    return <span className="flex items-center gap-1 text-yellow-400"><Clock size={16} /> Pending</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{post.title}</h2>
            <p className="text-gray-400 text-sm">{post.category}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Platform</p>
              <p className="text-white font-semibold">{post.platform}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <div className="font-semibold">{getStatusBadge(post.status)}</div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Scheduled For</p>
              <p className="text-white font-semibold">{post.date} at {post.time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Category</p>
              <p className="text-white font-semibold">{post.category}</p>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Content Preview</p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <p className="text-white">{post.content}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <Edit size={18} />
              Edit Post
            </button>
            {post.status === 'failed' && (
              <button className="flex-1 bg-pink-300 hover:bg-pink-400 text-gray-900 font-semibold py-3 rounded-lg transition-all">
                Retry Publishing
              </button>
            )}
            {post.status === 'pending' && (
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
                Cancel Schedule
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;