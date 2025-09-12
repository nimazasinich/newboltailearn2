import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { Sidebar } from './layout/Sidebar';
import { apiClient, connectSocket, onSystemMetrics, SystemMetrics } from '../services/api';

interface DashboardProps {}

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'مدل جدید با موفقیت آموزش داده شد',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      message: 'سیستم نیاز به بروزرسانی دارد',
      type: 'warning',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    }
  ]);

  // Initialize dashboard
  useEffect(() => {
    connectSocket();

    // Real-time system metrics
    const unsubscribeMetrics = onSystemMetrics((metrics) => {
      setSystemMetrics(metrics);
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    // Click outside to close dropdowns
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribeMetrics();
      document.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Handle search with real functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        // Search across models, datasets, logs, etc.
        const searchResults = await Promise.allSettled([
          apiClient.getModels().then(models => 
            models.filter((model: any) => 
              model.name.toLowerCase().includes(query.toLowerCase()) ||
              model.type.toLowerCase().includes(query.toLowerCase())
            )
          ),
          apiClient.getDatasets().then(datasets => 
            datasets.filter((dataset: any) => 
              dataset.name.toLowerCase().includes(query.toLowerCase())
            )
          ),
          apiClient.getLogs({ type: 'system', limit: 50 }).then(logs => 
            logs.filter((log: any) => 
              log.message.toLowerCase().includes(query.toLowerCase())
            )
          )
        ]);

        console.log('Search results:', searchResults);
        // Here you could set search results state and show them in a dropdown
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Implement logout logic
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/app/dashboard': return 'داشبورد مدیریت';
      case '/app/training': return 'آموزش مدل‌ها';
      case '/app/monitoring': return 'نظارت سیستم';
      case '/app/analytics': return 'تحلیل‌ها و گزارش‌ها';
      case '/app/models': return 'مدیریت مدل‌ها';
      case '/app/data': return 'مدیریت دیتاست‌ها';
      case '/app/logs': return 'لاگ‌های سیستم';
      case '/app/team': return 'تیم توسعه';
      default: return 'هوش مصنوعی حقوقی ایران';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:mr-80">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Left Section - Menu & Search */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 lg:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="جستجو در مدل‌ها، دیتاست‌ها، گزارش‌ها..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10 pl-16 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 w-80 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm font-vazir"
                  aria-label="جستجو در سیستم"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    Ctrl
                  </kbd>
                  <span className="text-xs text-gray-400">+</span>
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                    K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Center - Page Title */}
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-vazir">
                {getPageTitle()}
              </h1>
            </motion.div>

            {/* Right Section - System Status, Theme, Notifications & User */}
            <div className="flex items-center gap-3">
              {/* System Status Indicator */}
              {systemMetrics && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
                  title={`CPU: ${systemMetrics.cpu.toFixed(1)}% | Memory: ${systemMetrics.memory.percentage}%`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    systemMetrics.cpu < 70 && systemMetrics.memory.percentage < 70 
                      ? 'bg-green-500 animate-pulse' 
                      : systemMetrics.cpu < 90 && systemMetrics.memory.percentage < 90
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500 animate-pulse'
                  }`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
                    {systemMetrics.cpu < 70 && systemMetrics.memory.percentage < 70 ? 'سالم' : 
                     systemMetrics.cpu < 90 && systemMetrics.memory.percentage < 90 ? 'متوسط' : 'بحرانی'}
                  </span>
                </motion.div>
              )}
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDarkMode ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-600" />
                )}
              </motion.button>

              {/* Notifications */}
              <div className="relative" data-dropdown="notifications">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {notifications.filter(n => !n.read).length}
                    </motion.span>
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white font-vazir">اعلان‌ها</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`} />
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleString('fa-IR')}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" data-dropdown="user-menu">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">مدیر سیستم</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                  </div>
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </motion.div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 py-2 z-50"
                    >
                      <motion.button
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">پروفایل</span>
                      </motion.button>
                      <motion.button
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">تنظیمات</span>
                      </motion.button>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">خروج</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Renders nested routes */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};