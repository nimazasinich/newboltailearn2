import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, Database, Users, Activity, Play, Pause, Square,
  BarChart3, PieChart, LineChart, Monitor, Cpu, HardDrive, Wifi,
  CheckCircle, AlertTriangle, Clock, Target, Award, Zap,
  FileText, BookOpen, Scale, Gavel, Briefcase, Shield,
  Heart, ArrowLeft, Settings, Home, ChevronRight, Bell,
  Search, Filter, Plus, Eye, Download, Share2, Star,
  Layers, Globe, Lock, Sparkles, Calendar, MessageSquare
} from 'lucide-react';
import { 
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, Area, AreaChart
} from 'recharts';

interface Model {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'error';
  accuracy: number;
  progress: number;
  epochs: number;
  created_at: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  disk_usage: number;
  active_connections: number;
  uptime: number;
}

interface LegalCategory {
  name: string;
  models: number;
  accuracy: number;
  documents: number;
  color: string;
}

export default function EnhancedPersianDashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showStandaloneSidebar = false;

  // Legal categories specific to Iranian law
  const legalCategories: LegalCategory[] = [
    { name: 'قوانین مدنی', models: 4, accuracy: 94.2, documents: 15400, color: '#10b981' },
    { name: 'قوانین جزایی', models: 3, accuracy: 91.8, documents: 12800, color: '#3b82f6' },
    { name: 'قوانین تجاری', models: 2, accuracy: 88.5, documents: 8900, color: '#06b6d4' },
    { name: 'قوانین اداری', models: 2, accuracy: 92.1, documents: 11200, color: '#8b5cf6' },
    { name: 'قوانین قضایی', models: 1, accuracy: 87.3, documents: 6700, color: '#f59e0b' }
  ];

  // Performance data over time
  const performanceData = [
    { epoch: 1, accuracy: 0.45, loss: 2.3, time: '09:00' },
    { epoch: 5, accuracy: 0.67, loss: 1.8, time: '09:15' },
    { epoch: 10, accuracy: 0.78, loss: 1.2, time: '09:30' },
    { epoch: 15, accuracy: 0.85, loss: 0.9, time: '09:45' },
    { epoch: 20, accuracy: 0.91, loss: 0.6, time: '10:00' },
    { epoch: 25, accuracy: 0.94, loss: 0.4, time: '10:15' }
  ];

  // Sidebar menu items
  const sidebarMenuItems = [
    { icon: Home, label: 'نمای کلی سیستم', active: true, badge: null },
    { icon: Brain, label: 'مدیریت مدل‌ها', active: false, badge: '4' },
    { icon: Database, label: 'مجموعه داده‌ها', active: false, badge: null },
    { icon: BarChart3, label: 'تحلیل و گزارش', active: false, badge: null },
    { icon: FileText, label: 'اسناد حقوقی', active: false, badge: '12K' },
    { icon: Users, label: 'مدیریت کاربران', active: false, badge: null },
    { icon: Settings, label: 'تنظیمات سیستم', active: false, badge: null },
  ];

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Mock data for Iranian legal models
      setModels([
        {
          id: 'model-001',
          name: 'مدل قوانین مدنی - نسخه پیشرفته',
          type: 'civil-law',
          status: 'training',
          accuracy: 87.5,
          progress: 65,
          epochs: 15,
          created_at: new Date().toISOString()
        },
        {
          id: 'model-002',
          name: 'مدل قوانین جزایی - نسخه تخصصی',
          type: 'criminal-law',
          status: 'completed',
          accuracy: 92.3,
          progress: 100,
          epochs: 25,
          created_at: new Date().toISOString()
        },
        {
          id: 'model-003',
          name: 'مدل قوانین تجاری - نسخه جامع',
          type: 'commercial-law',
          status: 'paused',
          accuracy: 78.9,
          progress: 40,
          epochs: 8,
          created_at: new Date().toISOString()
        },
        {
          id: 'model-004',
          name: 'مدل قوانین اداری - نسخه ویژه',
          type: 'administrative-law',
          status: 'idle',
          accuracy: 0,
          progress: 0,
          epochs: 0,
          created_at: new Date().toISOString()
        }
      ]);

      // Mock metrics
      setMetrics({
        cpu_usage: Math.floor(Math.random() * 30 + 40),
        memory_usage: Math.floor(Math.random() * 20 + 60),
        gpu_usage: Math.floor(Math.random() * 40 + 50),
        disk_usage: Math.floor(Math.random() * 15 + 75),
        active_connections: Math.floor(Math.random() * 10 + 15),
        uptime: Math.floor(Math.random() * 86400 + 3600)
      });

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <Play className="w-4 h-4 text-emerald-400" />;
      case 'paused': return <Pause className="w-4 h-4 text-amber-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Square className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'training': return 'در حال آموزش';
      case 'paused': return 'متوقف';
      case 'completed': return 'تکمیل شده';
      case 'error': return 'خطا';
      default: return 'آماده';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'from-emerald-400 via-teal-500 to-blue-500';
      case 'paused': return 'from-amber-400 to-orange-500';
      case 'completed': return 'from-emerald-400 via-teal-500 to-blue-500';
      case 'error': return 'from-red-400 to-pink-500';
      default: return 'from-emerald-400 via-teal-500 to-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 mx-auto mb-3 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full"
          />
          <h2 className="text-sm font-semibold text-white mb-1">در حال بارگذاری...</h2>
          <p className="text-xs text-slate-400">آماده‌سازی سیستم</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" dir="rtl">
      {showStandaloneSidebar && (
        <motion.div
          initial={{ x: sidebarCollapsed ? -300 : 0 }}
          animate={{ x: sidebarCollapsed ? -240 : 0 }}
          className={`fixed right-0 top-0 h-full z-30 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-72'
          }`}
        >
          <div className="h-full bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-600/50 shadow-2xl">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-600/50">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">AI حقوقی ایران</h2>
                      <p className="text-xs text-slate-300">سامانه یادگیری عمیق</p>
                    </div>
                  </motion.div>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <ArrowLeft className={`w-5 h-5 text-slate-300 transition-transform ${
                    sidebarCollapsed ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="p-4">
              <div className="space-y-2">
                {sidebarMenuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      item.active
                        ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg'
                        : 'hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      item.active
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-600 shadow-lg'
                        : 'bg-slate-700/50'
                    }`}>
                      <item.icon className={`w-4 h-4 ${
                        item.active ? 'text-white' : 'text-slate-300'
                      }`} />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-right">
                        <span className={`text-sm font-medium ${
                          item.active ? 'text-white' : 'text-slate-300'
                        }`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="float-left bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {!sidebarCollapsed && (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sidebar Footer - System Status */}
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-emerald-200">وضعیت سیستم: سالم</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    آموزش فعال: {models.filter(m => m.status === 'training').length}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${showStandaloneSidebar ? (sidebarCollapsed ? 'mr-16' : 'mr-72') : 'mr-0'}`}>
        {/* Top Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-600/50 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">داشبورد هوش مصنوعی حقوقی</h1>
                <p className="text-slate-300">مانیتورینگ و مدیریت مدل‌های یادگیری عمیق</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200 text-sm">
                  {lastUpdate.toLocaleTimeString('fa-IR')}
                </span>
              </div>
              
              <button className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl text-white hover:shadow-lg transition-all">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="p-6">
          {/* Key Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              { title: 'سلامت سیستم', value: '94%', icon: Heart, color: 'emerald', trend: '+2%' },
              { title: 'دقت میانگین', value: '89%', icon: Target, color: 'blue', trend: '+5%' },
              { title: 'نرخ موفقیت', value: '87%', icon: Award, color: 'purple', trend: '+3%' },
              { title: 'مدل‌های فعال', value: '3', icon: Brain, color: 'cyan', trend: '+1' },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative group"
              >
                {/* Glowing Background */}
                <div className={`absolute inset-0 bg-gradient-to-r from-${metric.color}-500/20 to-${metric.color}-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60 group-hover:opacity-100`} />
                
                {/* Card Content */}
                <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 rounded-xl shadow-lg`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full bg-${metric.color}-500/20 text-${metric.color}-300`}>
                      {metric.trend}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-slate-300 text-sm">{metric.title}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* CPU, Memory, GPU Usage */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 relative group"
            >
              {/* Glowing Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  وضعیت سیستم
                </h3>
                
                {metrics && (
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'پردازنده', value: metrics.cpu_usage, color: 'cyan', icon: Cpu },
                      { label: 'حافظه', value: metrics.memory_usage, color: 'blue', icon: HardDrive },
                      { label: 'پردازنده گرافیکی', value: metrics.gpu_usage, color: 'purple', icon: Zap },
                      { label: 'فضای ذخیره', value: metrics.disk_usage, color: 'emerald', icon: Database }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        className="relative group/item"
                      >
                        {/* Mini Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-${item.color}-500/10 to-${item.color}-600/10 rounded-xl blur-lg group-hover/item:blur-xl transition-all duration-300`} />
                        
                        <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                              <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                            </div>
                            <span className="text-sm font-bold text-white">{item.value}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full shadow-lg relative`}
                            >
                              <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              {/* Glowing Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all h-full">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  سلامت سیستم
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'سرور اصلی', status: 'healthy', uptime: '99.9%' },
                    { name: 'پایگاه داده', status: 'healthy', uptime: '99.8%' },
                    { name: 'سرویس AI', status: 'healthy', uptime: '99.7%' },
                    { name: 'WebSocket', status: 'warning', uptime: '98.5%' }
                  ].map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl hover:bg-slate-700/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-lg ${
                          service.status === 'healthy' 
                            ? 'bg-emerald-400 shadow-emerald-400/50' 
                            : 'bg-amber-400 shadow-amber-400/50'
                        } animate-pulse`} />
                        <span className="text-sm text-white font-medium">{service.name}</span>
                      </div>
                      <span className="text-sm text-slate-300">{service.uptime}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Models Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group mb-8"
          >
            {/* Glowing Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  مدل‌های یادگیری عمیق
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-purple-500/25"
                >
                  <Plus className="w-4 h-4" />
                  مدل جدید
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {models.map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="relative group/model cursor-pointer"
                      onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    >
                      {/* Model Card Glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-lg group-hover/model:blur-xl transition-all duration-300 opacity-60 group-hover/model:opacity-100" />
                      
                      <div className={`relative rounded-2xl border transition-all duration-300 ${
                        selectedModel === model.id 
                          ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-400/50 shadow-xl' 
                          : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-600/30 hover:border-slate-500/50'
                      } backdrop-blur-sm p-6`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg">
                              {getStatusIcon(model.status)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{model.name}</h3>
                              <p className="text-sm text-slate-400">{getStatusText(model.status)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{model.accuracy}%</div>
                            <div className="text-xs text-slate-400">دقت</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-slate-300 mb-2">
                            <span>پیشرفت</span>
                            <span>{model.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3 shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${model.progress}%` }}
                              transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                              className={`h-3 bg-gradient-to-r ${getStatusColor(model.status)} rounded-full shadow-lg relative overflow-hidden`}
                            >
                              <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              />
                            </motion.div>
                          </div>
                        </div>

                        {/* Model Details */}
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4" />
                            <span>{model.epochs} دوره</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(model.created_at).toLocaleDateString('fa-IR')}</span>
                          </div>
                        </div>

                        {/* Model Management Buttons */}
                        <div className="flex gap-2 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            شروع
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
                          >
                            <Settings className="w-3 h-3" />
                            تنظیمات
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
                          >
                            <BarChart3 className="w-3 h-3" />
                            آمار
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Legal Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            {/* Glowing Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                دسته‌بندی‌های حقوقی
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {legalCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="relative group/category"
                  >
                    {/* Category Glow */}
                    <div 
                      className="absolute inset-0 rounded-xl blur-lg group-hover/category:blur-xl transition-all duration-300 opacity-60 group-hover/category:opacity-100"
                      style={{ backgroundColor: `${category.color}20` }}
                    />
                    
                    <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">{category.name}</h3>
                        <div 
                          className="w-3 h-3 rounded-full shadow-lg"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">مدل‌ها</span>
                          <span className="text-white font-semibold">{category.models}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">دقت</span>
                          <span className="text-white font-semibold">{category.accuracy}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">اسناد</span>
                          <span className="text-white font-semibold">{category.documents.toLocaleString('fa-IR')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}