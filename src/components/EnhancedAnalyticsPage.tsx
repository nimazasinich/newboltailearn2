import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Brain, 
  Database,
  Clock,
  Target,
  Zap,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Share2,
  Star,
  Award,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Layers,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts';
import { EnhancedCard, MetricCard, ProgressCard } from './ui/EnhancedCard';
import { EnhancedSidebar, TopNavigation } from './ui/EnhancedNavigation';
import { PerformanceChart, CategoryDistribution, SystemMetrics, RadialProgress } from './charts/EnhancedCharts';
import { cn } from '../utils/cn';

// Mock Data for Analytics
const MOCK_PERFORMANCE_DATA = Array.from({ length: 30 }, (_, i) => ({
  epoch: i + 1,
  accuracy: Math.random() * 0.2 + 0.8,
  loss: Math.random() * 0.5 + 0.1,
  time: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('fa-IR')
}));

const MOCK_MODEL_ACCURACY = [
  { name: 'Persian BERT Legal', accuracy: 94.2, training_time: 24, documents: 15400, color: '#10b981' },
  { name: 'Legal QA Model', accuracy: 91.8, training_time: 18, documents: 12800, color: '#3b82f6' },
  { name: 'Document Classifier', accuracy: 88.5, training_time: 32, documents: 8900, color: '#06b6d4' },
  { name: 'Court Decision Analyzer', accuracy: 92.1, training_time: 28, documents: 11200, color: '#8b5cf6' },
  { name: 'Contract Review Model', accuracy: 87.3, training_time: 22, documents: 6700, color: '#f59e0b' }
];

const MOCK_CATEGORY_DISTRIBUTION = [
  { name: 'قوانین مدنی', value: 35, color: '#10b981', models: 8, documents: 15400 },
  { name: 'قوانین جزایی', value: 28, color: '#3b82f6', models: 6, documents: 12800 },
  { name: 'قوانین تجاری', value: 20, color: '#06b6d4', models: 4, documents: 8900 },
  { name: 'قوانین اداری', value: 12, color: '#8b5cf6', models: 3, documents: 11200 },
  { name: 'قوانین قضایی', value: 5, color: '#f59e0b', models: 2, documents: 6700 }
];

const MOCK_TRAINING_TRENDS = Array.from({ length: 12 }, (_, i) => ({
  month: `ماه ${i + 1}`,
  accuracy: Math.random() * 10 + 85,
  loss: Math.random() * 0.5 + 0.2,
  training_time: Math.floor(Math.random() * 200) + 100
}));

const MOCK_SYSTEM_PERFORMANCE = [
  { name: 'پردازنده', value: 45, color: '#06b6d4', icon: <Zap className="w-4 h-4" /> },
  { name: 'حافظه', value: 62, color: '#3b82f6', icon: <Database className="w-4 h-4" /> },
  { name: 'پردازنده گرافیکی', value: 78, color: '#8b5cf6', icon: <Brain className="w-4 h-4" /> },
  { name: 'فضای ذخیره', value: 34, color: '#10b981', icon: <Layers className="w-4 h-4" /> }
];

export default function EnhancedAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [performanceData, setPerformanceData] = useState(MOCK_PERFORMANCE_DATA);
  const [modelAccuracy, setModelAccuracy] = useState(MOCK_MODEL_ACCURACY);
  const [categoryDistribution, setCategoryDistribution] = useState(MOCK_CATEGORY_DISTRIBUTION);
  const [trainingTrends, setTrainingTrends] = useState(MOCK_TRAINING_TRENDS);
  const [systemPerformance, setSystemPerformance] = useState(MOCK_SYSTEM_PERFORMANCE);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update data based on time range
      const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
      const newData = Array.from({ length: days }, (_, i) => ({
        epoch: i + 1,
        accuracy: Math.random() * 0.2 + 0.8,
        loss: Math.random() * 0.5 + 0.1,
        time: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('fa-IR')
      }));
      
      setPerformanceData(newData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: '۷ روز گذشته' },
    { value: '30d', label: '۳۰ روز گذشته' },
    { value: '90d', label: '۹۰ روز گذشته' }
  ];

  const metricOptions = [
    { value: 'accuracy', label: 'دقت' },
    { value: 'training_time', label: 'زمان آموزش' },
    { value: 'success_rate', label: 'نرخ موفقیت' }
  ];

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
          <h2 className="text-2xl font-bold text-white mb-2">در حال بارگذاری تحلیل‌ها...</h2>
          <p className="text-slate-400">آماده‌سازی داده‌های تحلیلی</p>
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
        currentPath="/analytics"
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
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-4 shadow-2xl shadow-blue-500/30"
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                تحلیل‌ها و گزارش‌ها
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 mb-6"
            >
              تحلیل جامع عملکرد سیستم و مدل‌های هوش مصنوعی
            </motion.p>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  {timeRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  {metricOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadAnalyticsData}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                بروزرسانی
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <MetricCard
              title="میانگین دقت"
              value="92.4%"
              icon={<Target className="w-6 h-6 text-white" />}
              trend={{ value: '+3.2%', direction: 'up' }}
              color="emerald"
              delay={0.1}
            />
            
            <MetricCard
              title="مدل‌های آموزش دیده"
              value="24"
              icon={<Brain className="w-6 h-6 text-white" />}
              trend={{ value: '+5', direction: 'up' }}
              color="blue"
              delay={0.2}
            />
            
            <MetricCard
              title="ساعات آموزش"
              value="1,247"
              icon={<Clock className="w-6 h-6 text-white" />}
              trend={{ value: '+89', direction: 'up' }}
              color="purple"
              delay={0.3}
            />
            
            <MetricCard
              title="نرخ موفقیت"
              value="94.8%"
              icon={<Award className="w-6 h-6 text-white" />}
              trend={{ value: '+1.5%', direction: 'up' }}
              color="cyan"
              delay={0.4}
            />
          </motion.div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceChart data={performanceData} delay={0.8} />
            <CategoryDistribution data={categoryDistribution} delay={0.9} />
          </div>

          {/* System Performance */}
          <SystemMetrics data={systemPerformance} delay={1.0} />

          {/* Model Accuracy Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  مقایسه دقت مدل‌ها
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <Download className="w-5 h-5 text-slate-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <Share2 className="w-5 h-5 text-slate-400" />
                  </motion.button>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
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
                    <Bar 
                      dataKey="accuracy" 
                      radius={[4, 4, 0, 0]}
                    >
                      {modelAccuracy.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Training Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  روند آموزش ماهانه
                </h2>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingTrends}>
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
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
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Detailed Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Model Performance */}
            <EnhancedCard variant="glass" delay={1.4}>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  عملکرد مدل‌ها
                </h3>
                {modelAccuracy.slice(0, 3).map((model, index) => (
                  <ProgressCard
                    key={model.name}
                    title={model.name}
                    value={model.accuracy}
                    max={100}
                    color="emerald"
                    delay={1.5 + index * 0.1}
                  />
                ))}
              </div>
            </EnhancedCard>

            {/* Training Statistics */}
            <EnhancedCard variant="glass" delay={1.5}>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  آمار آموزش
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300">کل ساعات آموزش</span>
                    <span className="text-white font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300">میانگین زمان آموزش</span>
                    <span className="text-white font-bold">24.5 ساعت</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300">نرخ موفقیت</span>
                    <span className="text-emerald-400 font-bold">94.8%</span>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* System Health */}
            <EnhancedCard variant="glass" delay={1.6}>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  سلامت سیستم
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300">CPU</span>
                    <span className="text-emerald-400 font-bold">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300">حافظه</span>
                    <span className="text-blue-400 font-bold">62%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300">GPU</span>
                    <span className="text-purple-400 font-bold">78%</span>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.0 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={loadAnalyticsData}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-blue-500/30 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <RefreshCw className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </motion.div>
    </div>
  );
}