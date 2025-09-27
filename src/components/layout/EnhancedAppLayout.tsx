import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernSidebar } from './ModernSidebar';
import { AuthOverlay } from '../Auth/AuthOverlay';
import { 
  Bell, Search, Wifi, WifiOff,
  Sun, Moon, Monitor, Sparkles, Brain, Shield
} from 'lucide-react';

interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface ConnectionStatus {
  backend: boolean;
  websocket: boolean;
  database: boolean;
}

export function EnhancedAppLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    backend: false,
    websocket: false,
    database: false
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');

  // Page titles for different routes
  const getPageTitle = (pathname: string) => {
    const titles: Record<string, string> = {
      '/overview': 'نمای کلی سیستم',
      '/dashboard': 'داشبورد تحلیلی',
      '/models': 'مدل‌های یادگیری',
      '/datasets': 'مجموعه داده‌ها',
      '/analytics': 'آنالیتیکس پیشرفته',
      '/monitoring': 'نظارت سیستم',
      '/logs': 'گزارش‌های سیستم',
      '/training': 'مدیریت آموزش',
      '/settings': 'تنظیمات سیستم',
      '/team': 'مدیریت تیم'
    };
    return titles[pathname] || 'سیستم هوش مصنوعی حقوقی';
  };

  useEffect(() => {
    // Check system connections
    const checkConnections = async () => {
      try {
        const backendResponse = await fetch('/api/health').catch(() => null);
        const wsTest = new Promise((resolve) => {
          try {
            const ws = new WebSocket('ws://localhost:8080/');
            ws.onopen = () => { ws.close(); resolve(true); };
            ws.onerror = () => resolve(false);
            setTimeout(() => resolve(false), 3000);
          } catch {
            resolve(false);
          }
        });

        setConnectionStatus({
          backend: backendResponse?.ok || false,
          websocket: await wsTest as boolean,
          database: backendResponse?.ok || false // Simplified check
        });

        // Add sample notifications
        if (notifications.length === 0) {
          setNotifications([
            {
              id: '1',
              type: 'success',
              title: 'آموزش تکمیل شد',
              message: 'مدل قوانین جزایی با دقت 92.3% آموزش دید',
              timestamp: new Date(Date.now() - 5 * 60000),
              read: false
            },
            {
              id: '2',
              type: 'info',
              title: 'بروزرسانی داده',
              message: 'مجموعه داده جدید قوانین تجاری افزوده شد',
              timestamp: new Date(Date.now() - 15 * 60000),
              read: false
            },
            {
              id: '3',
              type: 'warning',
              title: 'هشدار سیستم',
              message: 'استفاده حافظه به 85% رسیده است',
              timestamp: new Date(Date.now() - 30 * 60000),
              read: true
            }
          ]);
        }
      } catch (error) {
        console.error('Connection check failed:', error);
      }
    };

    checkConnections();
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex" dir="rtl">
      <ModernSidebar />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-slate-700/50"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Page Title and Breadcrumb */}
              <div className="flex items-center gap-4">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-2xl font-bold text-white">
                    {getPageTitle(location.pathname)}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>داشبورد</span>
                    <span>•</span>
                    <span>{getPageTitle(location.pathname)}</span>
                  </div>
                </motion.div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجو در سیستم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-4 pr-10 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>

                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {[
                    { key: 'backend', label: 'بک‌اند', status: connectionStatus.backend },
                    { key: 'websocket', label: 'WebSocket', status: connectionStatus.websocket },
                    { key: 'database', label: 'دیتابیس', status: connectionStatus.database }
                  ].map((conn) => (
                    <motion.div
                      key={conn.key}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                        conn.status 
                          ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-400/30'
                      }`}
                      title={`${conn.label}: ${conn.status ? 'متصل' : 'قطع'}`}
                    >
                      {conn.status ? (
                        <Wifi className="w-3 h-3" />
                      ) : (
                        <WifiOff className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">{conn.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all"
                  >
                    <Bell className="w-5 h-5 text-slate-300" />
                    {unreadNotifications > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      >
                        {unreadNotifications}
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl z-50"
                      >
                        <div className="p-4 border-b border-slate-700/50">
                          <h3 className="font-bold text-white">اعلان‌ها</h3>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                              اعلانی وجود ندارد
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-blue-500/5' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                      {notification.timestamp.toLocaleTimeString('fa-IR')}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                  )}
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Authentication Overlay */}
                <AuthOverlay />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 relative flex flex-col">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div 
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                backgroundSize: "50px 50px"
              }}
              className="w-full h-full"
            />
          </div>

          {/* Page Content */}
          <div className="relative z-10 p-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* Status Bar */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50 px-6 py-3"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3 text-blue-400" />
                <span>سیستم هوش مصنوعی حقوقی ایران</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-green-400" />
                <span>امنیت: فعال</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div>نسخه 2.1.0</div>
              <div>آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>آنلاین</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {/* You can add global loading states here */}
      </AnimatePresence>

      {/* Click outside handlers */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
}