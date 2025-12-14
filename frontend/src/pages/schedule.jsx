import React, { useState, useEffect } from 'react';
import { Home, FileText, ShoppingCart, History, Calendar, Zap, FileCode, Mic, Menu, X, Brain, Cpu, Network, Bot, Sparkles, Rocket, Code, Database, Globe, Server, Terminal, Clock, ChevronRight, Edit, Trash2, CheckCircle, Play, AlertCircle, Plus, Filter } from 'lucide-react';
import { mainApi, instaApi } from '../api/client';

const SchedulerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [stats, setStats] = useState({
    todayScheduled: 0,
    weekScheduled: 0,
    monthScheduled: 0,
    completedToday: 0
  });
  const [brandId, setBrandId] = useState(localStorage.getItem('active_brand_id') || 'your-brand-id-here');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filters, setFilters] = useState({
    platform: null,
    posting_status: null,
    category: null
  });

  // Floating icons data
  const floatingIcons = [
    { Icon: Brain, top: '10%', left: '15%', size: 32, opacity: 0.1 },
    { Icon: Cpu, top: '25%', right: '20%', size: 28, opacity: 0.08 },
    { Icon: Network, top: '45%', left: '10%', size: 36, opacity: 0.12 },
    { Icon: Bot, top: '60%', right: '15%', size: 30, opacity: 0.1 },
    { Icon: Sparkles, top: '15%', right: '40%', size: 24, opacity: 0.09 },
    { Icon: Rocket, top: '75%', left: '25%', size: 28, opacity: 0.11 },
    { Icon: Code, top: '35%', left: '85%', size: 26, opacity: 0.08 },
    { Icon: Database, top: '80%', right: '30%', size: 32, opacity: 0.1 },
    { Icon: Globe, top: '20%', left: '70%', size: 30, opacity: 0.09 },
    { Icon: Server, top: '90%', left: '50%', size: 28, opacity: 0.12 },
    { Icon: Terminal, top: '50%', right: '45%', size: 24, opacity: 0.08 },
    { Icon: Brain, top: '70%', left: '60%', size: 34, opacity: 0.1 },
    { Icon: Cpu, top: '5%', left: '45%', size: 26, opacity: 0.09 },
    { Icon: Network, top: '85%', right: '10%', size: 30, opacity: 0.11 },
    { Icon: Bot, top: '40%', left: '30%', size: 28, opacity: 0.08 },
  ];

  // API Functions
  // API Functions using centralized client
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      if (filters.platform) filterParams.platform = filters.platform;
      if (filters.posting_status) filterParams.posting_status = filters.posting_status;
      if (filters.category) filterParams.category = filters.category;

      const data = await mainApi.schedule.list(brandId, 1, 50, filterParams);
      processScheduleData(data.schedules);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await mainApi.schedule.getStats(brandId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchCalendarView = async () => {
    try {
      const now = new Date();
      const data = await mainApi.schedule.getCalendar(brandId, now.getMonth() + 1, now.getFullYear());
      return data;
    } catch (err) {
      console.error('Error fetching calendar:', err);
    }
  };

  const createSchedule = async (scheduleData) => {
    try {
      const data = await mainApi.schedule.create(scheduleData);
      await fetchSchedules();
      await fetchStats();
      setShowAddModal(false);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating schedule:', err);
    }
  };

  const createFromBasket = async (basketItemId, scheduledTime) => {
    try {
      const data = await mainApi.schedule.fromBasket(brandId, basketItemId, scheduledTime);
      await fetchSchedules();
      await fetchStats();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating from basket:', err);
    }
  };

  const updateSchedule = async (scheduleId, updateData) => {
    try {
      const data = await mainApi.schedule.update(scheduleId, updateData);
      await fetchSchedules();
      await fetchStats();
      setShowEditModal(false);
      setSelectedSchedule(null);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating schedule:', err);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      await mainApi.schedule.delete(scheduleId);
      await fetchSchedules();
      await fetchStats();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting schedule:', err);
    }
  };

  const cancelSchedule = async (scheduleId) => {
    try {
      const data = await mainApi.schedule.cancel(scheduleId);
      await fetchSchedules();
      await fetchStats();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error canceling schedule:', err);
    }
  };

  // Post to Instagram using Insta-App backend
  const postToInstagram = async (scheduleId, accountUsername, caption, mediaIds) => {
    try {
      const result = await instaApi.posts.postNow(accountUsername, caption, 'post', mediaIds);
      // Update schedule status in main backend
      await updateSchedule(scheduleId, {
        posting_status: 'posted',
        posted_at: new Date().toISOString()
      });
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error posting to Instagram:', err);
    }
  };

  // Schedule Instagram post using Insta-App backend
  const scheduleInstagramPost = async (accountUsername, caption, mediaIds, scheduledAt) => {
    try {
      const result = await instaApi.posts.schedule(accountUsername, caption, 'post', mediaIds, scheduledAt);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error scheduling Instagram post:', err);
    }
  };

  const postNow = async (scheduleId) => {
    try {
      await updateSchedule(scheduleId, {
        posting_status: 'posted',
        posted_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error posting now:', err);
    }
  };

  const processScheduleData = (schedules) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayItems = [];
    const upcomingItems = {};

    schedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.scheduled_time);
      const dateKey = scheduleDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });

      const item = {
        id: schedule.id,
        time: scheduleDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        platform: schedule.platform || 'Social Media',
        type: schedule.category || 'Post',
        content: schedule.content ? schedule.content.substring(0, 60) + '...' : 'No content',
        status: schedule.posting_status,
        color: getPlatformColor(schedule.platform),
        icon: getPlatformIcon(schedule.platform)
      };

      if (scheduleDate >= today && scheduleDate < tomorrow) {
        todayItems.push(item);
      } else if (scheduleDate >= tomorrow) {
        if (!upcomingItems[dateKey]) {
          upcomingItems[dateKey] = [];
        }
        upcomingItems[dateKey].push(item);
      }
    });

    setTodaySchedule(todayItems.sort((a, b) => 
      new Date('2000/01/01 ' + a.time) - new Date('2000/01/01 ' + b.time)
    ));

    const upcomingArray = Object.entries(upcomingItems)
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => 
          new Date('2000/01/01 ' + a.time) - new Date('2000/01/01 ' + b.time)
        )
      }))
      .slice(0, 3);

    setUpcomingSchedule(upcomingArray);
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'LinkedIn': 'from-blue-500 to-blue-600',
      'Instagram': 'from-pink-500 to-purple-600',
      'Email': 'from-green-500 to-emerald-600',
      'YouTube': 'from-red-500 to-red-600',
      'Twitter': 'from-sky-400 to-blue-500',
      'TikTok': 'from-pink-400 to-purple-500',
      'Facebook': 'from-blue-600 to-indigo-600'
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'LinkedIn': '💼',
      'Instagram': '📸',
      'Email': '📧',
      'YouTube': '🎥',
      'Twitter': '🐦',
      'TikTok': '🎵',
      'Facebook': '👍',
      'Blog': '📄'
    };
    return icons[platform] || '📱';
  };

  useEffect(() => {
    if (brandId && brandId !== 'your-brand-id-here') {
      fetchSchedules();
      fetchStats();
    }
  }, [brandId, filters]);

  const handleEdit = (item) => {
    setSelectedSchedule(item);
    setShowEditModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      await deleteSchedule(scheduleId);
    }
  };

  const handlePostNow = async (scheduleId) => {
    if (window.confirm('Post this content now?')) {
      await postNow(scheduleId);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'Drafts', id: 'drafts' },
    { icon: ShoppingCart, label: 'Basket', id: 'basket' },
    { icon: History, label: 'History', id: 'history' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: Zap, label: 'Auto-Gen', id: 'autogen' },
    { icon: FileCode, label: 'Templates', id: 'templates' },
    { icon: Mic, label: 'Brand Voice', id: 'brandvoice' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Floating Background Icons */}
      {floatingIcons.map((item, idx) => {
        const IconComponent = item.Icon;
        return (
          <div
            key={idx}
            className="absolute pointer-events-none"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              opacity: item.opacity,
            }}
          >
            <IconComponent size={item.size} className="text-yellow-200" />
          </div>
        );
      })}

      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Brain className="text-yellow-300" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
                Brand Writer
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-200 to-yellow-300 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
              Products
            </button>
            <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
              Contact
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold">
              {stats.todayScheduled}
            </div>
            <button className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-800/30 backdrop-blur-md border-r border-slate-700/50 transition-transform duration-300 z-40 pt-20 lg:pt-0`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-yellow-200/20 to-pink-200/20 border border-yellow-300/30'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <Icon size={20} className={activeTab === item.id ? 'text-yellow-300' : ''} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 relative z-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Calendar className="text-yellow-300" size={36} />
                  Today's Schedule
                </h1>
                <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button 
                onClick={() => fetchSchedules()}
                disabled={loading}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Today Scheduled</p>
                <p className="text-2xl font-bold text-yellow-300">{stats.todayScheduled}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">This Week</p>
                <p className="text-2xl font-bold text-blue-400">{stats.weekScheduled}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-400">{stats.monthScheduled}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Completed Today</p>
                <p className="text-2xl font-bold text-green-400">{stats.completedToday}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Today's Timeline - Main Section */}
            <div className="xl:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="text-yellow-300" />
                    Today's Timeline
                  </h2>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/30 transition-all text-sm flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add New Post
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300"></div>
                  </div>
                ) : todaySchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-400">No schedules for today</p>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-yellow-300/20 hover:bg-yellow-300/30 text-yellow-300 rounded-lg transition-all"
                    >
                      Create Your First Schedule
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaySchedule.map((item, index) => (
                      <div key={item.id} className="relative">
                        {/* Timeline Line */}
                        {index < todaySchedule.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-yellow-300/50 to-transparent"></div>
                        )}
                        
                        <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50 hover:border-yellow-300/30 transition-all group">
                          <div className="flex items-start gap-4">
                            {/* Time Badge */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-full flex items-center justify-center font-bold text-slate-900 text-sm relative z-10">
                                {item.time.split(' ')[0]}
                              </div>
                              <p className="text-xs text-center text-slate-400 mt-1">{item.time.split(' ')[1]}</p>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{item.icon}</span>
                                  <div>
                                    <h3 className="font-bold text-lg">{item.platform}</h3>
                                    <p className="text-sm text-slate-400">{item.type}</p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <Clock size={12} />
                                  {item.status || 'Scheduled'}
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm mb-4">{item.content}</p>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handlePostNow(item.id)}
                                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
                                >
                                  <Play size={14} />
                                  Post Now
                                </button>
                                <button 
                                  onClick={() => handleEdit(item)}
                                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
                                >
                                  <Edit size={14} />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View Full Calendar Button */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <button className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all font-semibold flex items-center justify-center gap-2">
                    Open Full Scheduler
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Schedule - Right Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="text-yellow-300" />
                  Coming Up
                </h2>

                <div className="space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
                    </div>
                  ) : upcomingSchedule.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">No upcoming schedules</p>
                    </div>
                  ) : (
                    upcomingSchedule.map((day, dayIndex) => (
                      <div key={dayIndex}>
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">{day.date}</h3>
                        <div className="space-y-2">
                          {day.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-yellow-300/30 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-slate-400">{item.time}</p>
                                  <p className="font-semibold text-sm truncate">{item.platform}</p>
                                  <p className="text-xs text-slate-400 truncate">{item.type}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">This Week Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">LinkedIn Posts</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Instagram Content</span>
                      <span className="font-semibold">4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Video Content</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Email Campaigns</span>
                      <span className="font-semibold">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              We work in close partnership with our clients – including content creators, agencies, major brands, and marketing professionals.
            </p>
          </footer>
        </main>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Schedule</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await createSchedule({
                brand_id: brandId,
                platform: formData.get('platform'),
                category: formData.get('category'),
                content: formData.get('content'),
                scheduled_time: formData.get('scheduled_time'),
                posting_status: 'pending'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select 
                    name="platform"
                    required
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none"
                  >
                    <option value="">Select Platform</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Email">Email</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input 
                    type="text"
                    name="category"
                    placeholder="e.g., Thought leadership, Tutorial, Announcement"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea 
                    name="content"
                    required
                    rows="6"
                    placeholder="Enter your post content..."
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Schedule Time</label>
                  <input 
                    type="datetime-local"
                    name="scheduled_time"
                    required
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
                  >
                    Create Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Schedule</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await updateSchedule(selectedSchedule.id, {
                platform: formData.get('platform'),
                category: formData.get('category'),
                content: formData.get('content'),
                scheduled_time: formData.get('scheduled_time')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select 
                    name="platform"
                    defaultValue={selectedSchedule.platform}
                    required
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Email">Email</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input 
                    type="text"
                    name="category"
                    defaultValue={selectedSchedule.type}
                    placeholder="e.g., Thought leadership, Tutorial, Announcement"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea 
                    name="content"
                    defaultValue={selectedSchedule.content}
                    required
                    rows="6"
                    placeholder="Enter your post content..."
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Schedule Time</label>
                  <input 
                    type="datetime-local"
                    name="scheduled_time"
                    required
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-yellow-300 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-200 to-pink-200 text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
                  >
                    Update Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSchedule(null);
                    }}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerPage;