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
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">
      {/* Sidebar */}
      <motion.aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } relative z-10`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-persian-500 to-persian-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {isSidebarOpen && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-vazir">Legal AI</h2>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-persian-50 text-persian-600 border-r-2 border-persian-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-6">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-persian-500 focus:border-transparent outline-none transition-all duration-200 w-80"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <motion.button
                  onClick={handleNotificationClick}
                  className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </motion.button>

                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">Document processing completed</p>
                          <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-persian-400 to-persian-600 rounded-full flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
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
          >
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your documents today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                        <Icon className={`w-6 h-6 text-${stat.color}`} />
                      </div>
                      <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Line Chart */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Document Processing Trend</h3>
                  <button className="text-persian-600 hover:text-persian-700 text-sm font-medium">View Details</button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="documents" 
                      stroke="#0ea5e9" 
                      strokeWidth={3}
                      dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="processed" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Document Status Distribution</h3>
                  <button className="text-persian-600 hover:text-persian-700 text-sm font-medium">Export</button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Recent Documents Table */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </motion.button>
                    <motion.button
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-persian-600 text-white hover:bg-persian-700 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Document</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDocuments.map((doc, index) => (
                      <motion.tr
                        key={doc.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{doc.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              className="text-persian-600 hover:text-persian-900 p-1 rounded"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="text-gray-600 hover:text-gray-900 p-1 rounded"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="text-gray-600 hover:text-gray-900 p-1 rounded"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="text-red-600 hover:text-red-900 p-1 rounded"
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