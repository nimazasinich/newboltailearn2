import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Database, 
  Users, 
  Activity, 
  Play, 
  Pause, 
  Square,
  BarChart3, 
  PieChart, 
  LineChart, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi,
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  Award, 
  Zap,
  FileText, 
  BookOpen, 
  Scale, 
  Gavel, 
  Briefcase, 
  Shield,
  Heart, 
  ArrowRight, 
  Settings, 
  Home, 
  ChevronRight, 
  Bell,
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Download, 
  Share2, 
  Star,
  Layers, 
  Globe, 
  Lock, 
  Sparkles, 
  Calendar, 
  MessageSquare,
  RefreshCw,
  Power,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { EnhancedCard, MetricCard, ProgressCard } from './ui/EnhancedCard';
import { TopNavigation } from './ui/EnhancedNavigation';
import { PerformanceChart, CategoryDistribution, SystemMetrics, RadialProgress } from './charts/EnhancedCharts';
import { cn } from '../utils/cn';

// Mock Data
const MOCK_MODELS: Array<{
  id: number;
  name: string;
  type: string;
  status: 'training' | 'completed' | 'paused' | 'error' | 'idle';
  accuracy: number;
  loss: number;
  epochs: number;
  current_epoch: number;
  created_at: string;
  updated_at: string;
}> = [
  {
    id: 1,
    name: 'Persian BERT Legal',
    type: 'persian-bert',
    status: 'training' as const,
    accuracy: 0.89,
    loss: 0.23,
    epochs: 50,
    current_epoch: 32,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Legal QA Model',
    type: 'dora',
    status: 'completed' as const,
    accuracy: 0.94,
    loss: 0.15,
    epochs: 30,
    current_epoch: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Document Classifier',
    type: 'qr-adaptor',
    status: 'training' as const,
    accuracy: 0.76,
    loss: 0.35,
    epochs: 40,
    current_epoch: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_DATASETS = [
  {
    id: 'legal-qa-persian',
    name: 'Persian Legal QA Dataset',
    samples: 15000,
    size_mb: 45.2,
    status: 'available' as const,
    source: 'Internal',
    description: 'مجموعه داده پرسش و پاسخ حقوقی فارسی'
  },
  {
    id: 'court-decisions',
    name: 'Court Decisions Dataset',
    samples: 8500,
    size_mb: 32.1,
    status: 'available' as const,
    source: 'Public',
    description: 'مجموعه تصمیمات دادگاه'
  }
];

const MOCK_SYSTEM_METRICS = {
  cpu: 45,
  memory: { used: 6.2, total: 16, percentage: 39 },
  disk: { used: 120, total: 500, percentage: 24 },
  uptime: 86400,
  status: 'ok' as const
};

const performanceData = [
  { epoch: 1, accuracy: 45, loss: 2.3, time: '09:00' },
  { epoch: 5, accuracy: 67, loss: 1.8, time: '09:15' },
  { epoch: 10, accuracy: 78, loss: 1.2, time: '09:30' },
  { epoch: 15, accuracy: 85, loss: 0.9, time: '09:45' },
  { epoch: 20, accuracy: 91, loss: 0.6, time: '10:00' },
  { epoch: 25, accuracy: 94, loss: 0.4, time: '10:15' }
];

const legalCategories = [
  { name: 'قوانین مدنی', value: 4, color: '#10b981', models: 4, documents: 15400 },
  { name: 'قوانین جزایی', value: 3, color: '#3b82f6', models: 3, documents: 12800 },
  { name: 'قوانین تجاری', value: 2, color: '#06b6d4', models: 2, documents: 8900 },
  { name: 'قوانین اداری', value: 2, color: '#8b5cf6', models: 2, documents: 11200 },
  { name: 'قوانین قضایی', value: 1, color: '#f59e0b', models: 1, documents: 6700 }
];

const systemMetricsData = [
  { name: 'پردازنده', value: 45, color: '#06b6d4', icon: <Cpu className="w-4 h-4" /> },
  { name: 'حافظه', value: 39, color: '#3b82f6', icon: <HardDrive className="w-4 h-4" /> },
  { name: 'پردازنده گرافیکی', value: 65, color: '#8b5cf6', icon: <Zap className="w-4 h-4" /> },
  { name: 'فضای ذخیره', value: 24, color: '#10b981', icon: <Database className="w-4 h-4" /> }
];

export default function EnhancedOverview() {
  const [systemMetrics, setSystemMetrics] = useState<typeof MOCK_SYSTEM_METRICS | null>(null);
  const [models, setModels] = useState<typeof MOCK_MODELS>(MOCK_MODELS);
  const [datasets, setDatasets] = useState<typeof MOCK_DATASETS>(MOCK_DATASETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

  // Load real data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Load models
        const modelsResponse = await fetch('/api/models');
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          setModels(modelsData);
        } else {
          setModels(MOCK_MODELS);
        }

        // Load datasets
        const datasetsResponse = await fetch('/api/datasets');
        if (datasetsResponse.ok) {
          const datasetsData = await datasetsResponse.json();
          setDatasets(datasetsData);
        } else {
          setDatasets(MOCK_DATASETS);
        }

        // Load system metrics
        const metricsResponse = await fetch('/api/system/metrics');
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setSystemMetrics(metricsData);
        } else {
          setSystemMetrics(MOCK_SYSTEM_METRICS);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('خطا در بارگذاری داده‌ها');
        // Fallback to mock data on error
        setSystemMetrics(MOCK_SYSTEM_METRICS);
        setModels(MOCK_MODELS);
        setDatasets(MOCK_DATASETS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate stats
  const stats = {
    totalModels: models.length,
    activeTraining: models.filter(m => m.status === 'training').length,
    completedToday: models.filter(m => m.status === 'completed').length,
    totalDatasets: datasets.length,
    systemHealth: systemMetrics ? Math.min(100, Math.max(0, 100 - (systemMetrics.cpu + systemMetrics.memory.percentage) / 2)) : 0,
    cpuUsage: systemMetrics?.cpu || 0,
    memoryUsage: systemMetrics?.memory?.percentage || 0,
    successRate: models.length > 0 ? (models.filter(m => m.status === 'completed').length / models.length * 100) : 0,
    avgAccuracy: models.filter(m => m.accuracy && m.status === 'completed').length > 0
      ? (models.filter(m => m.accuracy && m.status === 'completed')
          .reduce((sum, m) => sum + (m.accuracy || 0), 0) / 
         models.filter(m => m.accuracy && m.status === 'completed').length * 100)
      : 0
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
            className="w-16 h-16 mx-auto mb-6 border-4 border-emerald-500/50 border-t-emerald-500 rounded-full"
          />
          <h2 className="text-2xl font-bold text-white mb-2">در حال بارگذاری...</h2>
          <p className="text-slate-400">آماده‌سازی سیستم هوش مصنوعی حقوقی</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" dir="rtl">
      {/* Main Content */}
      <div className="w-full">
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
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl mb-6 shadow-2xl shadow-emerald-500/30"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-4"
            >
              <span className="bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent">
                هوش مصنوعی حقوقی فارسی
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-300 mb-8"
            >
              سیستم مدیریت و آموزش مدل‌های هوش مصنوعی پیشرفته
            </motion.p>
            
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: 'مدل‌ها', value: stats.totalModels, color: 'blue' },
                { label: 'نرخ موفقیت', value: `${stats.successRate.toFixed(0)}%`, color: 'emerald' },
                { label: 'دقت میانگین', value: `${stats.avgAccuracy.toFixed(0)}%`, color: 'purple' },
                { label: 'سلامت سیستم', value: `${stats.systemHealth.toFixed(0)}%`, color: 'cyan' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-3xl font-bold text-${stat.color}-400 mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Key Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <MetricCard
              title="مدل‌های فعال"
              value={stats.activeTraining}
              icon={<Activity className="w-6 h-6 text-white" />}
              trend={{ value: '+2', direction: 'up' }}
              color="blue"
              delay={0.1}
            />
            
            <MetricCard
              title="دیتاست‌ها"
              value={stats.totalDatasets}
              icon={<Database className="w-6 h-6 text-white" />}
              trend={{ value: '+1', direction: 'up' }}
              color="emerald"
              delay={0.2}
            />
            
            <MetricCard
              title="تکمیل شده"
              value={stats.completedToday}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              trend={{ value: '+3', direction: 'up' }}
              color="purple"
              delay={0.3}
            />
            
            <MetricCard
              title="CPU"
              value={`${stats.cpuUsage}%`}
              icon={<Cpu className="w-6 h-6 text-white" />}
              trend={{ value: '-5%', direction: 'down' }}
              color="cyan"
              delay={0.4}
            />
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceChart data={performanceData} delay={0.8} />
            <CategoryDistribution data={legalCategories} delay={0.9} />
          </div>

          {/* System Metrics */}
          <SystemMetrics data={systemMetricsData} delay={1.0} />

          {/* Models Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="relative group"
          >
            {/* Section Glow */}
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
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="relative group/model cursor-pointer"
                      onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    >
                      {/* Model Card Glow */}
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
                            <div className="text-2xl font-bold text-white">{(model.accuracy * 100).toFixed(1)}%</div>
                            <div className="text-sm text-slate-400">دقت</div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-slate-300 mb-3">
                            <span className="font-medium">پیشرفت آموزش</span>
                            <span className="font-bold text-emerald-400">{Math.round((model.current_epoch / model.epochs) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-4 shadow-inner overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(model.current_epoch / model.epochs) * 100}%` }}
                              transition={{ duration: 2, delay: 1.3 + index * 0.1, ease: "easeOut" }}
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
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                دسترسی سریع
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    title: 'مدیریت مدل‌ها',
                    icon: <Brain className="w-5 h-5" />,
                    href: '#/models',
                    color: 'text-blue-600'
                  },
                  {
                    title: 'گالری دیتاست',
                    icon: <Database className="w-5 h-5" />,
                    href: '#/data-gallery',
                    color: 'text-green-600'
                  },
                  {
                    title: 'تحلیل‌ها',
                    icon: <BarChart3 className="w-5 h-5" />,
                    href: '#/analytics',
                    color: 'text-purple-600'
                  },
                  {
                    title: 'نظارت سیستم',
                    icon: <Monitor className="w-5 h-5" />,
                    href: '#/monitoring',
                    color: 'text-orange-600'
                  }
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => location.hash = action.href}
                    className="p-6 text-center bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all group/action"
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl flex items-center justify-center group-hover/action:from-emerald-500 group-hover/action:to-blue-600 transition-all duration-300`}>
                      <div className={action.color}>
                        {action.icon}
                      </div>
                    </div>
                    <span className="font-medium text-white text-sm">{action.title}</span>
                  </motion.button>
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
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-cyan-500/30 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <RefreshCw className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </motion.div>
    </div>
  );
}