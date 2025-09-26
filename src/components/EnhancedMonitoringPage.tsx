import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Zap,
  Database,
  Server,
  Globe,
  Shield,
  Clock,
  BarChart3,
  TrendingUp,
  Thermometer,
  Eye,
  Download,
  Share2,
  Bell,
  Power,
  WifiOff,
  AlertCircle,
  Heart,
  Target,
  Award,
  Brain,
  Layers,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { EnhancedCard, MetricCard, ProgressCard } from './ui/EnhancedCard';
import { EnhancedSidebar, TopNavigation } from './ui/EnhancedNavigation';
import { PerformanceChart, CategoryDistribution, SystemMetrics, RadialProgress } from './charts/EnhancedCharts';
import { cn } from '../utils/cn';

// Mock Data for System Monitoring
const MOCK_SYSTEM_METRICS = {
  cpu: {
    usage: 45,
    cores: 8,
    temperature: 68,
    frequency: 3.2
  },
  memory: {
    used: 12.4,
    total: 32,
    percentage: 39,
    available: 19.6
  },
  disk: {
    used: 120,
    total: 500,
    percentage: 24,
    read_speed: 150,
    write_speed: 120
  },
  gpu: {
    usage: 65,
    temperature: 72,
    memory_used: 8.2,
    memory_total: 16
  },
  network: {
    download: 45.2,
    upload: 12.8,
    latency: 12,
    packets_lost: 0.1
  },
  uptime: 86400,
  status: 'healthy' as const
};

const MOCK_PERFORMANCE_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  cpu: Math.floor(Math.random() * 30 + 30),
  memory: Math.floor(Math.random() * 25 + 35),
  gpu: Math.floor(Math.random() * 40 + 50),
  disk: Math.floor(Math.random() * 15 + 20)
}));

const MOCK_SERVICES = [
  { name: 'API Server', status: 'healthy', uptime: '99.9%', response_time: '45ms', color: '#10b981' },
  { name: 'Database', status: 'healthy', uptime: '99.8%', response_time: '12ms', color: '#3b82f6' },
  { name: 'AI Service', status: 'warning', uptime: '98.5%', response_time: '120ms', color: '#f59e0b' },
  { name: 'WebSocket', status: 'healthy', uptime: '99.7%', response_time: '8ms', color: '#8b5cf6' },
  { name: 'File Storage', status: 'healthy', uptime: '99.6%', response_time: '25ms', color: '#06b6d4' }
];

const MOCK_ALERTS = [
  { id: 1, type: 'warning', message: 'GPU usage is high (85%)', time: '2 minutes ago', severity: 'medium' },
  { id: 2, type: 'info', message: 'New model training started', time: '5 minutes ago', severity: 'low' },
  { id: 3, type: 'error', message: 'Database connection timeout', time: '10 minutes ago', severity: 'high' },
  { id: 4, type: 'success', message: 'Backup completed successfully', time: '1 hour ago', severity: 'low' }
];

export default function EnhancedMonitoringPage() {
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState(MOCK_SYSTEM_METRICS);
  const [performanceData, setPerformanceData] = useState(MOCK_PERFORMANCE_DATA);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Simulate real-time data updates
      const newMetrics = {
        ...MOCK_SYSTEM_METRICS,
        cpu: {
          ...MOCK_SYSTEM_METRICS.cpu,
          usage: Math.floor(Math.random() * 30 + 30),
          temperature: Math.floor(Math.random() * 20 + 60)
        },
        memory: {
          ...MOCK_SYSTEM_METRICS.memory,
          percentage: Math.floor(Math.random() * 20 + 35)
        },
        gpu: {
          ...MOCK_SYSTEM_METRICS.gpu,
          usage: Math.floor(Math.random() * 40 + 50),
          temperature: Math.floor(Math.random() * 15 + 65)
        }
      };
      
      setSystemMetrics(newMetrics);
      
      // Update performance data
      const newPerformanceData = MOCK_PERFORMANCE_DATA.map(item => ({
        ...item,
        cpu: Math.floor(Math.random() * 30 + 30),
        memory: Math.floor(Math.random() * 25 + 35),
        gpu: Math.floor(Math.random() * 40 + 50),
        disk: Math.floor(Math.random() * 15 + 20)
      }));
      
      setPerformanceData(newPerformanceData);
      
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'info': return <Bell className="w-4 h-4 text-blue-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-amber-500/30 bg-amber-500/10';
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      case 'success': return 'border-emerald-500/30 bg-emerald-500/10';
      default: return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  const systemMetricsData = [
    { name: 'پردازنده', value: systemMetrics.cpu.usage, color: '#06b6d4', icon: <Cpu className="w-4 h-4" /> },
    { name: 'حافظه', value: systemMetrics.memory.percentage, color: '#3b82f6', icon: <HardDrive className="w-4 h-4" /> },
    { name: 'پردازنده گرافیکی', value: systemMetrics.gpu.usage, color: '#8b5cf6', icon: <Zap className="w-4 h-4" /> },
    { name: 'فضای ذخیره', value: systemMetrics.disk.percentage, color: '#10b981', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" dir="rtl">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath="/monitoring"
      />

      {/* Main Content */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'mr-16' : 'mr-72')}>
        {/* Top Navigation */}
        <TopNavigation 
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          notifications={alerts.filter(a => a.type === 'error' || a.type === 'warning').length}
        />

        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl mb-4 shadow-2xl shadow-emerald-500/30"
            >
              <Monitor className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              <span className="bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent">
                نظارت سیستم
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 mb-6"
            >
              مانیتورینگ زمان واقعی عملکرد سیستم و سرویس‌ها
            </motion.p>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  <option value="1h">۱ ساعت گذشته</option>
                  <option value="24h">۲۴ ساعت گذشته</option>
                  <option value="7d">۷ روز گذشته</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300',
                  autoRefresh 
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg hover:shadow-emerald-500/30' 
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                )}
              >
                <Activity className="w-4 h-4" />
                {autoRefresh ? 'خودکار فعال' : 'خودکار غیرفعال'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMonitoringData}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                بروزرسانی
              </motion.button>
            </motion.div>
          </motion.div>

          {/* System Health Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <MetricCard
              title="سلامت سیستم"
              value="94%"
              icon={<Heart className="w-6 h-6 text-white" />}
              trend={{ value: '+2%', direction: 'up' }}
              color="emerald"
              delay={0.1}
            />
            
            <MetricCard
              title="آپتایم"
              value="99.8%"
              icon={<Clock className="w-6 h-6 text-white" />}
              trend={{ value: '+0.1%', direction: 'up' }}
              color="blue"
              delay={0.2}
            />
            
            <MetricCard
              title="سرویس‌های فعال"
              value="4/5"
              icon={<Server className="w-6 h-6 text-white" />}
              trend={{ value: '-1', direction: 'down' }}
              color="purple"
              delay={0.3}
            />
            
            <MetricCard
              title="هشدارها"
              value={alerts.filter(a => a.type === 'error' || a.type === 'warning').length}
              icon={<Bell className="w-6 h-6 text-white" />}
              trend={{ value: '+1', direction: 'up' }}
              color="cyan"
              delay={0.4}
            />
          </motion.div>

          {/* System Metrics */}
          <SystemMetrics data={systemMetricsData} delay={0.8} />

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  عملکرد سیستم (۲۴ ساعت گذشته)
                </h3>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '12px',
                          color: '#f9fafb',
                          backdropFilter: 'blur(16px)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="url(#cpuGradient)"
                        name="CPU (%)"
                      />
                      <Area
                        type="monotone"
                        dataKey="memory"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#memoryGradient)"
                        name="Memory (%)"
                      />
                      <Area
                        type="monotone"
                        dataKey="gpu"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#gpuGradient)"
                        name="GPU (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                    <Thermometer className="w-5 h-5 text-white" />
                  </div>
                  دمای سیستم
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">پردازنده</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{systemMetrics.cpu.temperature}°C</div>
                      <div className="text-xs text-slate-400">{systemMetrics.cpu.frequency} GHz</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">پردازنده گرافیکی</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{systemMetrics.gpu.temperature}°C</div>
                      <div className="text-xs text-slate-400">{systemMetrics.gpu.memory_used}/{systemMetrics.gpu.memory_total} GB</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-medium">فضای ذخیره</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{systemMetrics.disk.used}/{systemMetrics.disk.total} GB</div>
                      <div className="text-xs text-slate-400">{systemMetrics.disk.percentage}% استفاده</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Services Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                وضعیت سرویس‌ها
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative group/service"
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl blur-lg group-hover/service:blur-xl transition-all duration-300 opacity-60"
                      style={{ backgroundColor: `${service.color}20` }}
                    />
                    
                    <div className="relative p-6 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{service.name}</h3>
                        <div 
                          className="w-3 h-3 rounded-full shadow-lg animate-pulse"
                          style={{ backgroundColor: service.color }}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">وضعیت:</span>
                          <span className="text-white font-medium capitalize">{service.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">آپتایم:</span>
                          <span className="text-emerald-400 font-medium">{service.uptime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">زمان پاسخ:</span>
                          <span className="text-blue-400 font-medium">{service.response_time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                هشدارها و اعلان‌ها
              </h2>

              <div className="space-y-4">
                <AnimatePresence>
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                      whileHover={{ x: 8, transition: { duration: 0.2 } }}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                        getAlertColor(alert.type)
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{alert.message}</p>
                        <p className="text-slate-400 text-sm">{alert.time}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          alert.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                          alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        )}>
                          {alert.severity === 'high' ? 'بالا' :
                           alert.severity === 'medium' ? 'متوسط' : 'پایین'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Refresh Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.0 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={loadMonitoringData}
          className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-emerald-500/30 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <RefreshCw className={cn('w-6 h-6 text-white relative z-10', loading && 'animate-spin')} />
        </motion.button>
      </motion.div>
    </div>
  );
}