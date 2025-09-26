import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, Database, Users, Activity, Play, Pause, Square,
  BarChart3, PieChart, LineChart, Monitor, Cpu, HardDrive, Wifi,
  CheckCircle, AlertTriangle, Clock, Target, Award, Zap,
  FileText, BookOpen, Scale, Gavel, Briefcase, Shield,
  Heart, ArrowLeft, Settings, Home, ChevronRight, Bell,
  Search, Filter, Plus, Eye, Download, Share2, Star,
  Layers, Globe, Lock, Sparkles, Calendar, MessageSquare,
  ChevronDown, ChevronUp, Menu, X, Maximize2, Minimize2,
  RefreshCw, Power, WifiOff, AlertCircle
} from 'lucide-react';
import { 
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, Area, AreaChart
} from 'recharts';
import { EnhancedCard, MetricCard, ProgressCard } from './ui/EnhancedCard';
import { EnhancedSidebar, TopNavigation } from './ui/EnhancedNavigation';
import { PerformanceChart, CategoryDistribution, SystemMetrics, RadialProgress } from './charts/EnhancedCharts';
import { cn } from '../utils/cn';

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

export default function UltimatePersianDashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    { epoch: 1, accuracy: 45, loss: 2.3, time: '09:00' },
    { epoch: 5, accuracy: 67, loss: 1.8, time: '09:15' },
    { epoch: 10, accuracy: 78, loss: 1.2, time: '09:30' },
    { epoch: 15, accuracy: 85, loss: 0.9, time: '09:45' },
    { epoch: 20, accuracy: 91, loss: 0.6, time: '10:00' },
    { epoch: 25, accuracy: 94, loss: 0.4, time: '10:15' }
  ];

  const systemMetricsData = [
    { name: 'پردازنده', value: 45, color: '#06b6d4', icon: <Cpu className="w-4 h-4" /> },
    { name: 'حافظه', value: 39, color: '#3b82f6', icon: <HardDrive className="w-4 h-4" /> },
    { name: 'پردازنده گرافیکی', value: 65, color: '#8b5cf6', icon: <Zap className="w-4 h-4" /> },
    { name: 'فضای ذخیره', value: 24, color: '#10b981', icon: <Database className="w-4 h-4" /> }
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
      case 'training': return <Play className="w-5 h-5 text-white" />;
      case 'paused': return <Pause className="w-5 h-5 text-white" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-white" />;
      default: return <Square className="w-5 h-5 text-white" />;
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
      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath="/dashboard-ultimate"
      />

      {/* Main Content */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'mr-16' : 'mr-72')}>
        {/* Top Navigation */}
        <TopNavigation 
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          notifications={3}
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
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/30"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                داشبورد نهایی هوش مصنوعی حقوقی
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300"
            >
              سیستم پیشرفته مدیریت و نظارت بر مدل‌های یادگیری عمیق
            </motion.p>
          </motion.div>

          {/* Key Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
              title="دقت میانگین"
              value="89%"
              icon={<Target className="w-6 h-6 text-white" />}
              trend={{ value: '+5%', direction: 'up' }}
              color="blue"
              delay={0.2}
            />
            
            <MetricCard
              title="نرخ موفقیت"
              value="87%"
              icon={<Award className="w-6 h-6 text-white" />}
              trend={{ value: '+3%', direction: 'up' }}
              color="purple"
              delay={0.3}
            />
            
            <MetricCard
              title="مدل‌های فعال"
              value="3"
              icon={<Brain className="w-6 h-6 text-white" />}
              trend={{ value: '+1', direction: 'up' }}
              color="cyan"
              delay={0.4}
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceChart data={performanceData} delay={0.6} />
            <CategoryDistribution data={legalCategories} delay={0.7} />
          </div>

          {/* System Metrics */}
          <SystemMetrics data={systemMetricsData} delay={0.8} />

          {/* Enhanced Models Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative group"
          >
            {/* Section glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl shadow-purple-500/30">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                    مدل‌های یادگیری عمیق
                  </span>
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white font-semibold flex items-center gap-3 shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  مدل جدید
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence>
                  {models.map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="relative group/model cursor-pointer"
                      onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    >
                      {/* Model card glow effects */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(model.status)}/20 rounded-3xl blur-xl group-hover/model:blur-2xl transition-all duration-500`} />
                      
                      <div className={`relative rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm p-8 ${
                        selectedModel === model.id 
                          ? 'bg-gradient-to-br from-blue-900/60 to-cyan-900/60 border-cyan-400/50 shadow-2xl shadow-cyan-500/20' 
                          : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/30 hover:border-slate-500/50 shadow-xl hover:shadow-2xl'
                      }`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getStatusColor(model.status)} flex items-center justify-center shadow-xl`}>
                              {getStatusIcon(model.status)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg leading-tight mb-1">{model.name}</h3>
                              <p className="text-sm text-slate-300 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  model.status === 'training' ? 'bg-emerald-400 animate-pulse' :
                                  model.status === 'completed' ? 'bg-emerald-400' :
                                  model.status === 'paused' ? 'bg-amber-400' :
                                  model.status === 'error' ? 'bg-red-400' :
                                  'bg-slate-400'
                                }`} />
                                {getStatusText(model.status)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{model.accuracy.toFixed(1)}%</div>
                            <div className="text-sm text-slate-400">دقت</div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-slate-300 mb-3">
                            <span className="font-medium">پیشرفت آموزش</span>
                            <span className="font-bold text-emerald-400">{model.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-4 shadow-inner overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${model.progress}%` }}
                              transition={{ duration: 2, delay: 1.1 + index * 0.1, ease: "easeOut" }}
                              className={`h-4 bg-gradient-to-r ${getStatusColor(model.status)} rounded-full shadow-lg relative overflow-hidden`}
                            >
                              {/* Animated effects */}
                              <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              />
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full"
                              />
                            </motion.div>
                          </div>
                        </div>

                        {/* Model Details */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                            <div className="text-lg font-bold text-cyan-400">{model.epochs}</div>
                            <div className="text-xs text-slate-400">دوره</div>
                          </div>
                          <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                            <div className="text-lg font-bold text-emerald-400">
                              {Math.floor(Math.random() * 1000 + 5000).toLocaleString('fa-IR')}
                            </div>
                            <div className="text-xs text-slate-400">نمونه</div>
                          </div>
                          <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                            <div className="text-lg font-bold text-purple-400">
                              {Math.floor(Math.random() * 60 + 15)} دق
                            </div>
                            <div className="text-xs text-slate-400">باقیمانده</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-emerald-500/30"
                          >
                            <Play className="w-4 h-4" />
                            شروع
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-blue-500/30"
                          >
                            <Settings className="w-4 h-4" />
                            تنظیمات
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-purple-500/30"
                          >
                            <BarChart3 className="w-4 h-4" />
                            آمار
                          </motion.button>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedModel === model.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-6 pt-6 border-t border-slate-600/50"
                            >
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <div className="text-sm text-blue-300 mb-1">نوع مدل</div>
                                    <div className="text-white font-medium">{model.type}</div>
                                  </div>
                                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <div className="text-sm text-emerald-300 mb-1">تاریخ ایجاد</div>
                                    <div className="text-white font-medium">
                                      {new Date(model.created_at).toLocaleDateString('fa-IR')}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                  <div className="text-sm text-purple-300 mb-2">عملکرد جزئی</div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-300">دقت تدریجی:</span>
                                      <span className="text-emerald-300 font-medium">94.2%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-300">نرخ یادگیری:</span>
                                      <span className="text-blue-300 font-medium">0.001</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-300">Loss فعلی:</span>
                                      <span className="text-purple-300 font-medium">0.42</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Footer Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: 'کل اسناد پردازش شده', value: '54,782', icon: FileText, color: 'blue' },
                  { title: 'ساعات آموزش', value: '1,247', icon: Clock, color: 'emerald' },
                  { title: 'دقت کلی سیستم', value: '92.4%', icon: Target, color: 'purple' },
                  { title: 'کاربران فعال', value: '156', icon: Users, color: 'cyan' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                    className="text-center relative group/stat"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-${stat.color}-500/10 to-${stat.color}-600/10 rounded-2xl blur-lg group-hover/stat:blur-xl transition-all duration-300`} />
                    
                    <div className="relative p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center shadow-lg shadow-${stat.color}-500/30`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.title}</div>
                    </div>
                  </motion.div>
                ))}
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
          onClick={loadData}
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-cyan-500/30 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <RefreshCw className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </motion.div>
    </div>
  );
}