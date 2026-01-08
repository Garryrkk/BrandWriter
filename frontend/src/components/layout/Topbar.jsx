import React, { useState } from 'react';
import { Menu, Search, Bell, Moon, Sun, User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui';

const Topbar = ({ sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery, theme, setTheme }) => {
  const [userDropdown, setUserDropdown] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifications = [
    { id: 1, message: 'New lead discovered', time: '5 mins ago' },
    { id: 2, message: 'Email campaign completed', time: '1 hour ago' },
    { id: 3, message: 'Content draft ready', time: '2 hours ago' },
  ];

  return (
    <header className={`fixed top-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 z-30 shadow-sm transition-all duration-300 ${sidebarOpen ? 'left-0 lg:left-64' : 'left-0'}`}>
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-300" />
          </button>

          {/* Search Bar */}
          <motion.div
            animate={{
              width: searchFocused ? 320 : 240,
            }}
            transition={{ duration: 0.3 }}
            className="hidden sm:block relative"
          >
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all"
            />
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors relative"
            >
              <Bell size={20} className="text-slate-600 dark:text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.message}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      View all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-slate-600" />
            ) : (
              <Sun size={20} className="text-slate-300" />
            )}
          </motion.button>

          {/* User Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <Avatar name="GenJecX" size="sm" />
              <span className="hidden sm:inline text-sm font-medium text-slate-900 dark:text-white">GenJecX</span>
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {userDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                    <User size={16} />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                    <Settings size={16} />
                    Settings
                  </button>
                  <hr className="border-slate-200 dark:border-slate-700 my-1" />
                  <button className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/5 dark:hover:bg-danger/10 transition-colors flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
