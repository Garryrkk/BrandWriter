import React, { useState } from 'react';
import { 
  Linkedin, Instagram, Youtube, BookOpen, Mail, 
  TrendingUp, Clock, Zap, Target, ArrowRight,
  FileText, Plus, MoreHorizontal, Eye, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge, LoadingSpinner, EmptyState } from '../components/ui';

const DashboardV2 = ({ setCurrentPage }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const platforms = [
    {
      key: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      generated: 24,
      published: 8,
      engagement: 342,
      bgGradient: 'from-blue-500 to-blue-600',
      page: 'generate-linkedin'
    },
    {
      key: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      generated: 18,
      published: 5,
      engagement: 1240,
      bgGradient: 'from-pink-500 to-rose-600',
      page: 'generate-instagram'
    },
    {
      key: 'youtube',
      icon: Youtube,
      label: 'YouTube',
      generated: 6,
      published: 2,
      engagement: 89,
      bgGradient: 'from-red-500 to-red-600',
      page: 'generate-youtube'
    },
    {
      key: 'medium',
      icon: BookOpen,
      label: 'Medium',
      generated: 12,
      published: 3,
      engagement: 156,
      bgGradient: 'from-orange-500 to-amber-600',
      page: 'generate-medium'
    },
  ];

  const recentContent = [
    {
      id: 1,
      platform: 'LinkedIn',
      icon: Linkedin,
      title: 'How to scale your SaaS business...',
      status: 'published',
      engagement: 245,
      time: '2 hours ago'
    },
    {
      id: 2,
      platform: 'Instagram',
      icon: Instagram,
      title: 'Brand storytelling tips for 2025',
      status: 'scheduled',
      engagement: 0,
      time: 'Tomorrow 9:00 AM'
    },
    {
      id: 3,
      platform: 'Medium',
      icon: BookOpen,
      title: 'The future of AI in content creation',
      status: 'draft',
      engagement: 0,
      time: 'Draft'
    },
  ];

  const scheduleItems = [
    { time: '9:00 AM', content: 'LinkedIn Thought Leadership', platform: 'linkedin', status: 'upcoming' },
    { time: '12:00 PM', content: 'Instagram Carousel Post', platform: 'instagram', status: 'upcoming' },
    { time: '3:00 PM', content: 'Email Newsletter', platform: 'email', status: 'upcoming' },
    { time: '6:00 PM', content: 'YouTube Community Post', platform: 'youtube', status: 'upcoming' },
  ];

  const stats = [
    { label: 'Total Generated', value: '60', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Published', value: '18', icon: Share2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Engagement', value: '1.8K', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
    { label: 'Scheduled', value: '12', icon: Clock, color: 'from-blue-500 to-blue-600' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'scheduled':
        return 'default';
      case 'draft':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back! Here's your content overview.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all hover:translate-y-[-2px]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Performance Cards */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Platform Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(platform.page)}
                className="text-left"
              >
                <Card className="p-6 h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${platform.bgGradient} rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <MoreHorizontal size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{platform.label}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Generated</span>
                      <span className="font-bold text-slate-900 dark:text-white">{platform.generated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Published</span>
                      <span className="font-bold text-slate-900 dark:text-white">{platform.published}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Engagement</span>
                      <span className="font-bold text-slate-900 dark:text-white">{platform.engagement}</span>
                    </div>
                  </div>
                </Card>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Recent Content & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Content</h2>
            <button
              onClick={() => setCurrentPage('history')}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recentContent.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Icon size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">{item.title}</h3>
                        <Badge variant={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.engagement > 0 && (
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.engagement}</span>
                      )}
                      <Eye size={16} className="text-slate-400" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => setCurrentPage('drafts')}
          >
            <Plus size={16} />
            Create New Content
          </Button>
        </div>

        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Today's Schedule</h2>
            <Clock size={20} className="text-slate-400" />
          </div>
          <Card className="p-6 space-y-4">
            {scheduleItems.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="text-center pt-1">
                  <div className="text-xs font-bold text-primary">{item.time}</div>
                </div>
                <div className="flex-1 border-l border-slate-200 dark:border-slate-700 pl-4 pb-4">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{item.content}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                className="w-full justify-center"
                onClick={() => setCurrentPage('schedule')}
              >
                View Full Schedule
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Linkedin, label: 'LinkedIn Post', page: 'generate-linkedin', color: 'text-blue-500' },
            { icon: Instagram, label: 'Instagram Reel', page: 'generate-instagram', color: 'text-pink-500' },
            { icon: Youtube, label: 'YouTube Short', page: 'generate-youtube', color: 'text-red-500' },
            { icon: Mail, label: 'Email Campaign', page: 'email-outreach', color: 'text-emerald-500' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(action.page)}
              >
                <Card className="p-4 text-center hover:shadow-md transition-all h-full flex flex-col items-center justify-center">
                  <Icon size={32} className={`mb-2 ${action.color}`} />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{action.label}</p>
                </Card>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardV2;
