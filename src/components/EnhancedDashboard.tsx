import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, Database, Users, Activity, Play, Pause, Square,
  BarChart3, PieChart, LineChart, Monitor, Cpu, HardDrive, Wifi,
  CheckCircle, AlertTriangle, Clock, Target, Award, Zap,
  FileText, BookOpen, Scale, Gavel, Briefcase, Shield,
  Heart, ArrowLeft
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

export default function EnhancedDashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Legal categories specific to Iranian law
  const legalCategories: LegalCategory[] = [
    { name: 'قوانین مدنی', models: 4, accuracy: 94.2, documents: 15400, color: '#3b82f6' },
    { name: 'قوانین جزایی', models: 3, accuracy: 91.8, documents: 12800, color: '#ef4444' },
    { name: 'قوانین تجاری', models: 2, accuracy: 88.5, documents: 8900, color: '#10b981' },
    { name: 'قوانین اداری', models: 2, accuracy: 92.1, documents: 11200, color: '#f59e0b' },
    { name: 'قوانین قضایی', models: 1, accuracy: 87.3, documents: 6700, color: '#8b5cf6' }
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

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Try to load from API, fallback to mock data
      const modelsResponse = await fetch('/api/models').catch(() => null);
      const metricsResponse = await fetch('/api/monitoring/metrics').catch(() => null);

      if (modelsResponse?.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData.data || []);
      } else {
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
      }

      if (metricsResponse?.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      } else {
        // Mock metrics
        setMetrics({
          cpu_usage: Math.floor(Math.random() * 30 + 40),
          memory_usage: Math.floor(Math.random() * 20 + 60),
          gpu_usage: Math.floor(Math.random() * 40 + 50),
          disk_usage: Math.floor(Math.random() * 15 + 75),
          active_connections: Math.floor(Math.random() * 10 + 15),
          uptime: Math.floor(Math.random() * 86400 + 3600)
        });
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <Play className="w-4 h-4 text-blue-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Square className="w-4 h-4 text-gray-500" />;
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
      case 'training': return 'from-blue-500 to-cyan-500';
      case 'paused': return 'from-yellow-500 to-orange-500';
      case 'completed': return 'from-green-500 to-emerald-500';
      case 'error': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <h2 className="text-2xl font-bold text-white mb-2">در حال بارگذاری داشبورد</h2>
          <p className="text-slate-400">لطفاً صبر کنید...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">داشبورد هوش مصنوعی حقوقی</h1>
                <p className="text-slate-300">مانیتورینگ و مدیریت مدل‌های یادگیری عمیق</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="text-sm text-slate-400">آخرین بروزرسانی</div>
                <div className="text-sm text-white font-medium">
                  {lastUpdate.toLocaleTimeString('fa-IR')}
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-xl border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-200 text-sm font-medium">سیستم فعال</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - System Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* System Status */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400" />
              وضعیت سیستم
            </h3>
            
            {metrics && (
              <div className="space-y-4">
                {[
                  { label: 'پردازنده', value: metrics.cpu_usage, color: 'cyan', icon: Cpu },
                  { label: 'حافظه', value: metrics.memory_usage, color: 'blue', icon: HardDrive },
                  { label: 'پردازنده گرافیکی', value: metrics.gpu_usage, color: 'purple', icon: Zap },
                  { label: 'فضای ذخیره', value: metrics.disk_usage, color: 'green', icon: Database }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        className={`h-2 bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              آمار کلی
            </h3>
            
            <div className="space-y-3">
              {[
                { label: 'مدل‌های فعال', value: models.filter(m => m.status === 'training').length, icon: Play },
                { label: 'مدل‌های تکمیل شده', value: models.filter(m => m.status === 'completed').length, icon: CheckCircle },
                { label: 'دقت میانگین', value: `${(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length || 0).toFixed(1)}%`, icon: Award },
                { label: 'زمان کار سیستم', value: metrics ? `${Math.floor(metrics.uptime / 3600)} ساعت` : '0', icon: Clock }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Models Grid */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="w-6 h-6 text-blue-400" />
                مدل‌های یادگیری عمیق
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium"
              >
                مدل جدید
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {models.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      selectedModel === model.id 
                        ? 'bg-blue-500/20 border-blue-400/50' 
                        : 'bg-slate-800/50 border-slate-600/30 hover:border-slate-500/50'
                    }`}
                    onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusColor(model.status)} flex items-center justify-center`}>
                          {getStatusIcon(model.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{model.name}</h3>
                          <p className="text-xs text-slate-400">{getStatusText(model.status)}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-white">{model.accuracy.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400">دقت</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>پیشرفت آموزش</span>
                        <span>{model.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${model.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className={`h-2 bg-gradient-to-r ${getStatusColor(model.status)} rounded-full`}
                        />
                      </div>
                    </div>

                    {/* Model Details */}
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>دوره‌ها: {model.epochs}</span>
                      <span>{new Date(model.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedModel === model.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-slate-600/50"
                        >
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-blue-400">{model.epochs}</div>
                              <div className="text-xs text-slate-400">دوره آموزش</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-400">
                                {Math.floor(Math.random() * 1000 + 5000).toLocaleString('fa-IR')}
                              </div>
                              <div className="text-xs text-slate-400">نمونه آموزش</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-400">
                                {Math.floor(Math.random() * 10 + 15)} دقیقه
                              </div>
                              <div className="text-xs text-slate-400">زمان باقیمانده</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-400" />
                عملکرد آموزش
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="epoch" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb'
                      }}
                      labelStyle={{ color: '#d1d5db' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#accuracyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legal Categories */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-yellow-400" />
                دسته‌بندی قوانین
              </h3>
              
              <div className="space-y-3">
                {legalCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{category.name}</div>
                        <div className="text-xs text-slate-400">
                          {category.models} مدل • {category.documents.toLocaleString('fa-IR')} سند
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-green-400">{category.accuracy}%</div>
                      <div className="text-xs text-slate-400">دقت</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Training Activity */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              فعالیت‌های اخیر
            </h3>
            
            <div className="space-y-3">
              {[
                { action: 'آموزش مدل قوانین مدنی آغاز شد', time: '2 دقیقه پیش', type: 'info' },
                { action: 'مدل قوانین جزایی با موفقیت تکمیل شد', time: '15 دقیقه پیش', type: 'success' },
                { action: 'بروزرسانی مجموعه داده تجاری', time: '30 دقیقه پیش', type: 'info' },
                { action: 'خطا در مدل قوانین اداری رفع شد', time: '1 ساعت پیش', type: 'warning' }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-400' :
                    activity.type === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Charts and Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Training Overview Chart */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                نمای کلی آموزش مدل‌ها
              </h3>
              <div className="flex gap-2">
                {['روز', 'هفته', 'ماه'].map((period) => (
                  <button
                    key={period}
                    className="px-3 py-1 text-xs bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-all"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBar data={legalCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    style={{ fontSize: '11px' }}
                    interval={0}
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
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#f9fafb'
                    }}
                    labelStyle={{ color: '#d1d5db' }}
                  />
                  <Bar 
                    dataKey="accuracy" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </RechartsBar>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legal Document Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Distribution */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                توزیع اسناد حقوقی
              </h3>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={legalCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="documents"
                    >
                      {legalCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
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
                    className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'
                      } animate-pulse`} />
                      <span className="text-sm text-white font-medium">{service.name}</span>
                    </div>
                    <span className="text-sm text-slate-300">{service.uptime}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
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
          onClick={() => window.location.hash = '#/training'}
          className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-cyan-500/30 transition-all duration-300"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
}