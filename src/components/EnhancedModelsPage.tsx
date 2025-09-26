import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Settings, 
  Brain, 
  TrendingUp, 
  Clock, 
  Database,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Copy,
  Share2,
  Star,
  Award,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  Layers,
  Globe,
  Lock,
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EnhancedCard, MetricCard, ProgressCard } from './ui/EnhancedCard';
import { EnhancedSidebar, TopNavigation } from './ui/EnhancedNavigation';
import { PerformanceChart, CategoryDistribution, SystemMetrics, RadialProgress } from './charts/EnhancedCharts';
import { cn } from '../utils/cn';

interface Model {
  id: string | number;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'error';
  accuracy: number;
  loss: number;
  epochs: number;
  current_epoch: number;
  dataset_id?: string | number;
  config?: string;
  created_at: string;
  updated_at: string;
  description?: string;
  category?: string;
  performance?: {
    precision: number;
    recall: number;
    f1_score: number;
  };
}

interface Dataset {
  id: string | number;
  name: string;
  samples: number;
  size_mb: number;
  status: string;
  type?: string;
  description?: string;
}

// Mock Data
const MOCK_MODELS: Model[] = [
  {
    id: 1,
    name: 'Persian BERT Legal v2.1',
    type: 'persian-bert',
    status: 'training',
    accuracy: 0.892,
    loss: 0.234,
    epochs: 50,
    current_epoch: 32,
    dataset_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'مدل پیشرفته برای تحلیل اسناد حقوقی فارسی',
    category: 'قوانین مدنی',
    performance: {
      precision: 0.89,
      recall: 0.91,
      f1_score: 0.90
    }
  },
  {
    id: 2,
    name: 'Legal QA Model Pro',
    type: 'dora',
    status: 'completed',
    accuracy: 0.943,
    loss: 0.156,
    epochs: 30,
    current_epoch: 30,
    dataset_id: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'مدل تخصصی برای پاسخ‌دهی به سوالات حقوقی',
    category: 'قوانین جزایی',
    performance: {
      precision: 0.94,
      recall: 0.93,
      f1_score: 0.935
    }
  },
  {
    id: 3,
    name: 'Document Classifier Advanced',
    type: 'qr-adaptor',
    status: 'paused',
    accuracy: 0.768,
    loss: 0.345,
    epochs: 40,
    current_epoch: 18,
    dataset_id: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'دسته‌بندی کننده اسناد حقوقی',
    category: 'قوانین تجاری',
    performance: {
      precision: 0.77,
      recall: 0.76,
      f1_score: 0.765
    }
  },
  {
    id: 4,
    name: 'Court Decision Analyzer',
    type: 'persian-bert',
    status: 'idle',
    accuracy: 0,
    loss: 0,
    epochs: 25,
    current_epoch: 0,
    dataset_id: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: 'تحلیلگر تصمیمات دادگاه',
    category: 'قوانین قضایی',
    performance: {
      precision: 0,
      recall: 0,
      f1_score: 0
    }
  }
];

const MOCK_DATASETS: Dataset[] = [
  {
    id: 1,
    name: 'Persian Legal Documents v3.0',
    samples: 15400,
    size_mb: 245.2,
    status: 'available',
    type: 'legal-documents',
    description: 'مجموعه جامع اسناد حقوقی فارسی'
  },
  {
    id: 2,
    name: 'Legal QA Dataset Pro',
    samples: 12800,
    size_mb: 189.7,
    status: 'available',
    type: 'qa-pairs',
    description: 'دیتاست پرسش و پاسخ حقوقی'
  },
  {
    id: 3,
    name: 'Court Decisions Archive',
    samples: 8900,
    size_mb: 156.3,
    status: 'available',
    type: 'court-decisions',
    description: 'آرشیو تصمیمات دادگاه'
  }
];

const MODEL_CATEGORIES = [
  { name: 'قوانین مدنی', count: 4, color: '#10b981' },
  { name: 'قوانین جزایی', count: 3, color: '#3b82f6' },
  { name: 'قوانین تجاری', count: 2, color: '#06b6d4' },
  { name: 'قوانین اداری', count: 2, color: '#8b5cf6' },
  { name: 'قوانین قضایی', count: 1, color: '#f59e0b' }
];

export default function EnhancedModelsPage() {
  const [models, setModels] = useState<Model[]>(MOCK_MODELS);
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setModels(MOCK_MODELS);
      setDatasets(MOCK_DATASETS);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
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

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalModels: models.length,
    activeTraining: models.filter(m => m.status === 'training').length,
    completed: models.filter(m => m.status === 'completed').length,
    avgAccuracy: models.filter(m => m.status === 'completed').length > 0
      ? models.filter(m => m.status === 'completed')
          .reduce((sum, m) => sum + m.accuracy, 0) / models.filter(m => m.status === 'completed').length * 100
      : 0
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
          <h2 className="text-2xl font-bold text-white mb-2">در حال بارگذاری مدل‌ها...</h2>
          <p className="text-slate-400">آماده‌سازی لیست مدل‌های هوش مصنوعی</p>
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
        currentPath="/models"
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
                مدیریت مدل‌های هوش مصنوعی
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 mb-6"
            >
              مدیریت، آموزش و نظارت بر مدل‌های یادگیری عمیق
            </motion.p>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو در مدل‌ها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all w-64"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              >
                <option value="all">همه دسته‌ها</option>
                {MODEL_CATEGORIES.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'grid' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  )}
                >
                  <Layers className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'list' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  )}
                >
                  <Database className="w-5 h-5" />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                مدل جدید
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
              title="کل مدل‌ها"
              value={stats.totalModels}
              icon={<Brain className="w-6 h-6 text-white" />}
              trend={{ value: '+2', direction: 'up' }}
              color="purple"
              delay={0.1}
            />
            
            <MetricCard
              title="در حال آموزش"
              value={stats.activeTraining}
              icon={<Activity className="w-6 h-6 text-white" />}
              trend={{ value: '+1', direction: 'up' }}
              color="emerald"
              delay={0.2}
            />
            
            <MetricCard
              title="تکمیل شده"
              value={stats.completed}
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              trend={{ value: '+3', direction: 'up' }}
              color="blue"
              delay={0.3}
            />
            
            <MetricCard
              title="دقت میانگین"
              value={`${stats.avgAccuracy.toFixed(1)}%`}
              icon={<Target className="w-6 h-6 text-white" />}
              trend={{ value: '+2.1%', direction: 'up' }}
              color="cyan"
              delay={0.4}
            />
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                توزیع مدل‌ها بر اساس دسته‌بندی
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {MODEL_CATEGORIES.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    className="text-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div 
                      className="w-8 h-8 mx-auto mb-3 rounded-full shadow-lg"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="text-lg font-bold text-white mb-1">{category.count}</div>
                    <div className="text-sm text-slate-400">{category.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Models Grid/List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  مدل‌های هوش مصنوعی ({filteredModels.length})
                </h2>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadModels}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                  </motion.button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredModels.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className="relative group/model cursor-pointer"
                        onClick={() => setSelectedModel(model)}
                      >
                        {/* Model Card Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(model.status)}/20 rounded-3xl blur-xl group-hover/model:blur-2xl transition-all duration-500`} />
                        
                        <div className={`relative rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm p-6 ${
                          selectedModel?.id === model.id 
                            ? 'bg-gradient-to-br from-blue-900/60 to-cyan-900/60 border-cyan-400/50 shadow-2xl shadow-cyan-500/20' 
                            : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/30 hover:border-slate-500/50 shadow-xl hover:shadow-2xl'
                        }`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getStatusColor(model.status)} flex items-center justify-center shadow-xl`}>
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
                              <div className="text-xl font-bold text-white">{(model.accuracy * 100).toFixed(1)}%</div>
                              <div className="text-xs text-slate-400">دقت</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-slate-300 mb-2">
                              <span className="font-medium">پیشرفت</span>
                              <span className="font-bold text-emerald-400">{Math.round((model.current_epoch / model.epochs) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3 shadow-inner overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(model.current_epoch / model.epochs) * 100}%` }}
                                transition={{ duration: 2, delay: 1.1 + index * 0.1, ease: "easeOut" }}
                                className={`h-3 bg-gradient-to-r ${getStatusColor(model.status)} rounded-full shadow-lg relative overflow-hidden`}
                              >
                                <motion.div
                                  animate={{ x: ['-100%', '200%'] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                />
                              </motion.div>
                            </div>
                          </div>

                          {/* Model Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">دسته‌بندی:</span>
                              <span className="text-white font-medium">{model.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">دوره:</span>
                              <span className="text-white font-medium">{model.current_epoch}/{model.epochs}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">Loss:</span>
                              <span className="text-white font-medium">{model.loss.toFixed(3)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1 border border-emerald-500/30"
                            >
                              <Play className="w-3 h-3" />
                              شروع
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1 border border-blue-500/30"
                            >
                              <Settings className="w-3 h-3" />
                              تنظیمات
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1 border border-purple-500/30"
                            >
                              <Eye className="w-3 h-3" />
                              مشاهده
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredModels.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 + index * 0.05 }}
                        whileHover={{ x: 8, transition: { duration: 0.2 } }}
                        className="flex items-center justify-between p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer"
                        onClick={() => setSelectedModel(model)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${getStatusColor(model.status)} flex items-center justify-center shadow-xl`}>
                            {getStatusIcon(model.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{model.name}</h3>
                            <p className="text-sm text-slate-300">{model.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-slate-400">{model.category}</span>
                              <span className="text-xs text-slate-400">{model.type}</span>
                              <span className="text-xs text-emerald-400">{getStatusText(model.status)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{(model.accuracy * 100).toFixed(1)}%</div>
                            <div className="text-xs text-slate-400">دقت</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{model.current_epoch}/{model.epochs}</div>
                            <div className="text-xs text-slate-400">دوره</div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                            >
                              <Play className="w-4 h-4 text-emerald-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                            >
                              <Settings className="w-4 h-4 text-blue-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                            >
                              <Eye className="w-4 h-4 text-purple-400" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Model Detail Modal */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedModel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedModel.name}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedModel(null)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </motion.button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-sm text-blue-300 mb-1">نوع مدل</div>
                    <div className="text-white font-medium">{selectedModel.type}</div>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="text-sm text-emerald-300 mb-1">دسته‌بندی</div>
                    <div className="text-white font-medium">{selectedModel.category}</div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <div className="text-sm text-purple-300 mb-2">عملکرد مدل</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">دقت:</span>
                      <span className="text-emerald-300 font-medium">{(selectedModel.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Loss:</span>
                      <span className="text-red-300 font-medium">{selectedModel.loss.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">پیشرفت:</span>
                      <span className="text-blue-300 font-medium">{Math.round((selectedModel.current_epoch / selectedModel.epochs) * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="text-sm text-slate-300 mb-2">توضیحات</div>
                  <div className="text-white">{selectedModel.description}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          onClick={() => setShowCreateModal(true)}
          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-purple-500/30 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <Plus className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      </motion.div>
    </div>
  );
}