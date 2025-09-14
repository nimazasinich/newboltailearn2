/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  Menu,
  X,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Brain,
  Database,
  Monitor,
  FileX,
  Upload,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Award,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { apiClient, connectSocket, onSystemMetrics, onTrainingProgress, SystemMetrics, TrainingProgress } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

interface DashboardProps {}

interface DashboardData {
  stats: {
    totalModels: number;
    activeTraining: number;
    completedModels: number;
    totalDatasets: number;
    totalDocuments: number;
    processedToday: number;
    activeUsers: number;
    successRate: number;
  };
  chartData: {
    trainingProgress: Array<{
      date: string;
      models: number;
      accuracy: number;
    }>;
    modelDistribution: Array<{
      type: string;
      count: number;
      color: string;
    }>;
    systemMetrics: Array<{
      time: string;
      cpu: number;
      memory: number;
    }>;
  };
  recentDocuments: Array<{
    id: number;
    name: string;
    type: string;
    status: string;
    date: string;
    size: string;
    accuracy?: number;
  }>;
  notifications: Array<{
    id: number;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: string;
    read: boolean;
  }>;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retrying, setRetrying] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'داشبورد', icon: Home, route: '/app/dashboard' },
    { id: 'training', label: 'آموزش مدل‌ها', icon: Brain, route: '/app/training' },
    { id: 'models', label: 'مدل‌ها', icon: Brain, route: '/app/models' },
    { id: 'analytics', label: 'تحلیل‌ها', icon: BarChart3, route: '/app/analytics' },
    { id: 'data', label: 'مدیریت داده', icon: Database, route: '/app/data' },
    { id: 'monitoring', label: 'نظارت سیستم', icon: Monitor, route: '/app/monitoring' },
    { id: 'logs', label: 'لاگ‌ها', icon: FileX, route: '/app/logs' },
    { id: 'documents', label: 'اسناد', icon: FileText, route: '/app/documents' },
    { id: 'settings', label: 'تنظیمات', icon: Settings, route: '/app/settings' },
  ];

  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      setError(null);
      setRetrying(true);
      
      const [modelsData, analyticsData, datasetsData] = await Promise.all([
        apiClient.getModels(),
        apiClient.getAnalytics(),
        apiClient.getDatasets()
      ]);

      // Process and format data
      const stats = {
        totalModels: modelsData.length,
        activeTraining: modelsData.filter((m: any) => m.status === 'training').length,
        completedModels: modelsData.filter((m: any) => m.status === 'completed').length,
        totalDatasets: datasetsData.length,
        totalDocuments: datasetsData.reduce((sum: number, d: any) => sum + d.samples, 0),
        processedToday: Math.floor(Math.random() * 1000), // This would come from API
        activeUsers: 15, // This would come from API
        successRate: modelsData.length > 0 ? 
          (modelsData.filter((m: any) => m.status === 'completed').length / modelsData.length) * 100 : 0
      };

      const chartData = {
        trainingProgress: analyticsData.trainingStats?.map((item: any) => ({
          date: item.date,
          models: item.models_created,
          accuracy: Math.random() * 0.3 + 0.7 // This would come from actual data
        })) || [],
        modelDistribution: analyticsData.modelStats?.map((item: any, index: number) => ({
          type: item.type,
          count: item.count,
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
        })) || [],
        systemMetrics: [] // Will be populated by real-time data
      };

      const recentDocuments = modelsData.slice(0, 10).map((model: any, index: number) => ({
        id: model.id,
        name: model.name,
        type: model.type,
        status: model.status,
        date: model.created_at,
        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        accuracy: model.accuracy
      }));

      const notifications = [
        {
          id: 1,
          message: 'مدل جدید با موفقیت آموزش داده شد',
          type: 'success' as const,
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          message: 'سیستم نیاز به بروزرسانی دارد',
          type: 'warning' as const,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: 3,
          message: 'دیتاست جدید بارگذاری شد',
          type: 'info' as const,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true
        }
      ];

      setDashboardData({
        stats,
        chartData,
        recentDocuments,
        notifications
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    loadDashboardData();
    connectSocket();

    // Real-time system metrics
    const unsubscribeMetrics = onSystemMetrics((metrics) => {
      setSystemMetrics(metrics);
      
      // Update chart data with new metrics
      if (dashboardData) {
        setDashboardData(prev => prev ? {
          ...prev,
          chartData: {
            ...prev.chartData,
            systemMetrics: [
              ...prev.chartData.systemMetrics.slice(-9),
              {
                time: new Date().toLocaleTimeString('fa-IR'),
                cpu: metrics.cpu,
                memory: metrics.memory.percentage
              }
            ]
          }
        } : null);
      }
    });

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        loadDashboardData();
      }
    }, 30000);

    return () => {
      unsubscribeMetrics();
      clearInterval(interval);
    };
  }, []);

  // Handle navigation
  const handleNavigation = (route: string, pageId: string) => {
    setCurrentPage(pageId);
    navigate(route);
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        // This would search across models, datasets, documents etc.
        console.log('Searching for:', query);
        // Implement actual search logic here
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  // Handle action buttons
  const handleTrainModel = async () => {
    try {
      navigate('/app/training');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleUploadData = async () => {
    try {
      navigate('/app/data');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      navigate('/app/analytics');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked');
    navigate('/');
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'processed': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'training':
      case 'processing': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
      case 'error': 
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'idle': return 'آماده';
      case 'training': return 'در حال آموزش';
      case 'completed': return 'تکمیل شده';
      case 'failed': return 'ناموفق';
      case 'paused': return 'متوقف شده';
      case 'processing': return 'در حال پردازش';
      case 'processed': return 'پردازش شده';
      case 'pending': return 'در انتظار';
      default: return status;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      case 'info': return Bell;
      default: return Bell;
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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-vazir">در حال بارگذاری داشبورد...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-vazir">خطا در بارگذاری</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            disabled={retrying}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
          >
            {retrying ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            تلاش مجدد
          </motion.button>
        </motion.div>
      </div>
    );
  }

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

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/30 shadow-2xl transition-all duration-300 ${
          isSidebarOpen ? 'w-80' : 'w-0 lg:w-20'
        }`}
        initial={{ x: isSidebarOpen ? 0 : 320 }}
        animate={{ x: isSidebarOpen ? 0 : 320 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10 dark:border-gray-700/30">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-vazir">سیستم حقوقی</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Legal AI Platform</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.route;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.route, item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  {isActive && isSidebarOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-2 h-2 bg-blue-500 rounded-full mr-auto"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10 dark:border-gray-700/30">
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium text-sm">خروج</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
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
                  className="pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 w-80 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Center - Page Title */}
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-vazir">داشبورد مدیریت</h1>
            </motion.div>

            {/* Right Section - Notifications & User */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={handleNotificationClick}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  {dashboardData?.notifications.filter(n => !n.read).length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {dashboardData.notifications.filter(n => !n.read).length}
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
                        {dashboardData?.notifications.map((notification, index) => {
                          const NotificationIcon = getNotificationIcon(notification.type);
                          return (
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
                                <NotificationIcon className={`w-5 h-5 mt-0.5 ${getNotificationColor(notification.type)}`} />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(notification.timestamp).toLocaleString('fa-IR')}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  onClick={handleUserMenuClick}
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
                        onClick={() => navigate('/app/settings')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">پروفایل</span>
                      </motion.button>
                      <motion.button
                        onClick={() => navigate('/app/settings')}
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

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Welcome Section */}
            <div className="mb-8">
              <motion.h1 
                className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-vazir"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                خوش آمدید به داشبورد مدیریت
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                نمای کلی از عملکرد سیستم آموزش هوش مصنوعی حقوقی و مدیریت پروژه‌ها
              </motion.p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'کل مدل‌ها',
                  value: dashboardData?.stats.totalModels || 0,
                  change: '+12%',
                  icon: Brain,
                  color: 'blue',
                  bgColor: 'from-blue-500 to-blue-600'
                },
                {
                  title: 'آموزش فعال',
                  value: dashboardData?.stats.activeTraining || 0,
                  change: '+8%',
                  icon: Activity,
                  color: 'green',
                  bgColor: 'from-green-500 to-green-600'
                },
                {
                  title: 'کل دیتاست‌ها',
                  value: dashboardData?.stats.totalDatasets || 0,
                  change: '+15%',
                  icon: Database,
                  color: 'purple',
                  bgColor: 'from-purple-500 to-purple-600'
                },
                {
                  title: 'نرخ موفقیت',
                  value: `${dashboardData?.stats.successRate.toFixed(1) || 0}%`,
                  change: '+2%',
                  icon: Target,
                  color: 'orange',
                  bgColor: 'from-orange-500 to-orange-600'
                }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <motion.div 
                        className={`p-3 rounded-2xl bg-gradient-to-r ${stat.bgColor} shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <motion.span 
                        className="text-green-600 dark:text-green-400 text-sm font-medium bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {stat.change}
                      </motion.span>
                    </div>
                    <motion.h3 
                      className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={handleTrainModel}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5" />
                <span className="font-medium">آموزش مدل جدید</span>
              </motion.button>
              
              <motion.button
                onClick={handleUploadData}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">بارگذاری داده</span>
              </motion.button>
              
              <motion.button
                onClick={handleGenerateReport}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">تولید گزارش</span>
              </motion.button>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Training Progress Chart */}
              <motion.div
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-vazir">پیشرفت آموزش مدل‌ها</h3>
                  <motion.button 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    جزئیات بیشتر
                  </motion.button>
                </div>
                <div className="h-64">
                  {dashboardData?.chartData.trainingProgress && (
                    <Line
                      data={{
                        labels: dashboardData.chartData.trainingProgress.map(item => 
                          new Date(item.date).toLocaleDateString('fa-IR')
                        ),
                        datasets: [
                          {
                            label: 'تعداد مدل‌ها',
                            data: dashboardData.chartData.trainingProgress.map(item => item.models),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(59, 130, 246)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                          },
                          {
                            label: 'میانگین دقت',
                            data: dashboardData.chartData.trainingProgress.map(item => item.accuracy * 100),
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(16, 185, 129)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            yAxisID: 'y1',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              color: '#6B7280'
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            titleColor: '#F9FAFB',
                            bodyColor: '#F9FAFB',
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              color: 'rgba(107, 114, 128, 0.1)',
                            },
                            ticks: {
                              color: '#6B7280'
                            }
                          },
                          y: {
                            type: 'linear' as const,
                            display: true,
                            position: 'left' as const,
                            grid: {
                              color: 'rgba(107, 114, 128, 0.1)',
                            },
                            ticks: {
                              color: '#6B7280'
                            }
                          },
                          y1: {
                            type: 'linear' as const,
                            display: true,
                            position: 'right' as const,
                            grid: {
                              drawOnChartArea: false,
                            },
                            ticks: {
                              color: '#6B7280',
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index' as const,
                        }
                      }}
                    />
                  )}
                </div>
              </motion.div>

              {/* Model Distribution Chart */}
              <motion.div
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-vazir">توزیع انواع مدل‌ها</h3>
                  <motion.button 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    صادرات
                  </motion.button>
                </div>
                <div className="h-64">
                  {dashboardData?.chartData.modelDistribution && (
                    <Doughnut
                      data={{
                        labels: dashboardData.chartData.modelDistribution.map(item => {
                          switch(item.type) {
                            case 'dora': return 'DoRA';
                            case 'qr-adaptor': return 'QR-Adaptor';
                            case 'persian-bert': return 'Persian BERT';
                            default: return item.type;
                          }
                        }),
                        datasets: [
                          {
                            data: dashboardData.chartData.modelDistribution.map(item => item.count),
                            backgroundColor: dashboardData.chartData.modelDistribution.map(item => item.color),
                            borderColor: '#ffffff',
                            borderWidth: 3,
                            hoverBorderWidth: 4,
                            hoverOffset: 8,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              color: '#6B7280',
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            titleColor: '#F9FAFB',
                            bodyColor: '#F9FAFB',
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                              label: function(context) {
                                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                              }
                            }
                          }
                        },
                        cutout: '60%',
                        animation: {
                          animateRotate: true,
                          animateScale: true
                        }
                      }}
                    />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Recent Documents/Models Table */}
            <motion.div
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-vazir">مدل‌های اخیر</h3>
                  <div className="flex items-center gap-3">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Filter className="w-4 h-4" />
                      <span>فیلتر</span>
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/app/models')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>مدل جدید</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">نام مدل</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">نوع</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">وضعیت</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">دقت</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاریخ ایجاد</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                    {dashboardData?.recentDocuments.map((doc, index) => (
                      <motion.tr
                        key={doc.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div 
                              className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-3"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{doc.size}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {doc.type === 'dora' ? 'DoRA' : 
                             doc.type === 'qr-adaptor' ? 'QR-Adaptor' : 
                             doc.type === 'persian-bert' ? 'Persian BERT' : doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {getStatusLabel(doc.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {doc.accuracy ? `${(doc.accuracy * 100).toFixed(1)}%` : '-'}
                            </span>
                            {doc.accuracy && doc.accuracy > 0.8 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mr-2"
                              >
                                <Award className="w-4 h-4 text-yellow-500" />
                              </motion.div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(doc.date).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <motion.button
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/app/models`)}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};