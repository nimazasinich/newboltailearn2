import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Brain, Play, Pause, Square, BarChart3, Settings, Download, Upload,
  CheckCircle, AlertTriangle, Clock, Target, Zap, Database, FileText,
  TrendingUp, Activity, Cpu, Monitor, Award, Scale, Gavel, Briefcase, Shield
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'error';
  accuracy: number;
  progress: number;
  epochs: number;
  training_time: number;
  data_size: number;
  description: string;
  created_at: string;
  last_training: string;
}

interface TrainingMetrics {
  loss: number[];
  accuracy: number[];
  validation_loss: number[];
  validation_accuracy: number[];
  epochs: number[];
}

export default function EnhancedModelsPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Persian Legal Model Categories
  const categories = [
    { id: 'all', name: 'همه مدل‌ها', icon: Brain, color: 'blue' },
    { id: 'civil', name: 'قوانین مدنی', icon: Scale, color: 'emerald' },
    { id: 'criminal', name: 'قوانین جزایی', icon: Gavel, color: 'red' },
    { id: 'commercial', name: 'قوانین تجاری', icon: Briefcase, color: 'amber' },
    { id: 'administrative', name: 'قوانین اداری', icon: Shield, color: 'purple' }
  ];

  useEffect(() => {
    loadModels();
  }, [category]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models').catch(() => null);
      
      if (response?.ok) {
        const data = await response.json();
        setModels(data.data || []);
      } else {
        // Enhanced mock data for Persian legal models
        const mockModels: Model[] = [
          {
            id: 'model-001',
            name: 'مدل جامع قوانین مدنی ایران',
            type: 'civil-law',
            status: 'training',
            accuracy: 87.5,
            progress: 65,
            epochs: 15,
            training_time: 142,
            data_size: 15400,
            description: 'مدل یادگیری عمیق برای تحلیل و طبقه‌بندی قوانین مدنی جمهوری اسلامی ایران',
            created_at: '2024-01-15T10:30:00Z',
            last_training: '2024-01-20T14:25:00Z'
          },
          {
            id: 'model-002',
            name: 'مدل تخصصی قوانین جزایی',
            type: 'criminal-law',
            status: 'completed',
            accuracy: 92.3,
            progress: 100,
            epochs: 25,
            training_time: 287,
            data_size: 12800,
            description: 'مدل پیشرفته برای شناسایی و تحلیل مواد قانونی جزایی و مجازات‌ها',
            created_at: '2024-01-10T09:15:00Z',
            last_training: '2024-01-18T16:45:00Z'
          },
          {
            id: 'model-003',
            name: 'مدل قوانین تجاری و بازرگانی',
            type: 'commercial-law',
            status: 'paused',
            accuracy: 78.9,
            progress: 40,
            epochs: 8,
            training_time: 95,
            data_size: 8900,
            description: 'مدل تحلیل قوانین تجارت، شرکت‌ها و معاملات بازرگانی',
            created_at: '2024-01-12T11:20:00Z',
            last_training: '2024-01-19T13:30:00Z'
          },
          {
            id: 'model-004',
            name: 'مدل قوانین اداری و دولتی',
            type: 'administrative-law',
            status: 'idle',
            accuracy: 0,
            progress: 0,
            epochs: 0,
            training_time: 0,
            data_size: 11200,
            description: 'مدل پردازش قوانین اداری، آئین‌نامه‌ها و مقررات دولتی',
            created_at: '2024-01-20T08:45:00Z',
            last_training: ''
          },
          {
            id: 'model-005',
            name: 'مدل قوانین قضایی و رویه‌ها',
            type: 'judicial-law',
            status: 'training',
            accuracy: 84.1,
            progress: 72,
            epochs: 18,
            training_time: 198,
            data_size: 9600,
            description: 'مدل تحلیل رویه‌های قضایی، احکام و نظریات حقوقی',
            created_at: '2024-01-14T15:10:00Z',
            last_training: '2024-01-21T10:15:00Z'
          }
        ];
        setModels(mockModels);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading models:', error);
      setLoading(false);
    }
  };

  const filteredModels = category && category !== 'all' 
    ? models.filter(model => model.type === `${category}-law`)
    : models;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return Play;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      case 'error': return AlertTriangle;
      default: return Square;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'training': return 'در حال آموزش';
      case 'paused': return 'متوقف شده';
      case 'completed': return 'تکمیل شده';
      case 'error': return 'خطا در آموزش';
      default: return 'آماده آموزش';
    }
  };

  const startTraining = async (modelId: string) => {
    try {
      const response = await fetch(`/api/models/${modelId}/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Update model status locally
        setModels(prev => prev.map(model => 
          model.id === modelId 
            ? { ...model, status: 'training' as const }
            : model
        ));
      }
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-slate-400">در حال بارگذاری مدل‌ها...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">مدل‌های یادگیری عمیق</h1>
              <p className="text-slate-300">مدیریت و نظارت بر مدل‌های هوش مصنوعی حقوقی</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              مدل جدید
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              صادرات
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10"
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat, index) => {
            const isActive = activeTab === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  setActiveTab(cat.id);
                  if (cat.id !== 'all') {
                    navigate(`/models/${cat.id}`);
                  } else {
                    navigate('/models');
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? `bg-${cat.color}-500/20 text-${cat.color}-300 border border-${cat.color}-400/30`
                    : 'hover:bg-slate-700/30 text-slate-400 hover:text-slate-300'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="font-medium">{cat.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isActive 
                    ? `bg-${cat.color}-400/30 text-${cat.color}-200`
                    : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {cat.id === 'all' ? models.length : filteredModels.length}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Models Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredModels.map((model, index) => {
            const StatusIcon = getStatusIcon(model.status);
            return (
              <motion.div
                key={model.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 group"
              >
                {/* Model Header */}
                <div className="p-6 border-b border-slate-700/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStatusColor(model.status)} flex items-center justify-center`}>
                        <StatusIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">
                          {model.name}
                        </h3>
                        <p className="text-sm text-slate-400">{getStatusText(model.status)}</p>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <div className="text-2xl font-bold text-white">{model.accuracy.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">دقت مدل</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {model.description}
                  </p>
                </div>

                {/* Progress Section */}
                <div className="p-6 border-b border-slate-700/30">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>پیشرفت آموزش</span>
                    <span>{model.progress}% • دوره {model.epochs}</span>
                  </div>
                  
                  <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${model.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      className={`h-3 bg-gradient-to-r ${getStatusColor(model.status)} rounded-full relative overflow-hidden`}
                    >
                      {model.status === 'training' && (
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Model Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-800/50 rounded-xl p-3">
                      <div className="text-lg font-bold text-cyan-400">
                        {(model.data_size / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-slate-400">داده آموزش</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3">
                      <div className="text-lg font-bold text-green-400">
                        {Math.floor(model.training_time / 60)}h {model.training_time % 60}m
                      </div>
                      <div className="text-xs text-slate-400">زمان آموزش</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3">
                      <div className="text-lg font-bold text-purple-400">
                        {model.epochs}
                      </div>
                      <div className="text-xs text-slate-400">دوره تکمیل</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    {model.status === 'idle' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startTraining(model.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium"
                      >
                        <Play className="w-4 h-4" />
                        شروع آموزش
                      </motion.button>
                    )}
                    
                    {model.status === 'training' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium"
                      >
                        <Pause className="w-4 h-4" />
                        توقف آموزش
                      </motion.button>
                    )}
                    
                    {model.status === 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium"
                      >
                        <Download className="w-4 h-4" />
                        دانلود مدل
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedModel(model)}
                      className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl"
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Model Details Modal */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedModel(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-slate-600/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getStatusColor(selectedModel.status)} flex items-center justify-center`}>
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedModel.name}</h2>
                      <p className="text-slate-400">{getStatusText(selectedModel.status)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedModel(null)}
                    className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    <Square className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'دقت مدل', value: `${selectedModel.accuracy}%`, icon: Target, color: 'cyan' },
                    { label: 'پیشرفت', value: `${selectedModel.progress}%`, icon: TrendingUp, color: 'blue' },
                    { label: 'دوره‌های آموزش', value: selectedModel.epochs, icon: Activity, color: 'purple' },
                    { label: 'زمان آموزش', value: `${Math.floor(selectedModel.training_time / 60)}h`, icon: Clock, color: 'green' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`bg-${stat.color}-500/10 border border-${stat.color}-400/30 rounded-2xl p-6 text-center`}
                    >
                      <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-3`} />
                      <div className={`text-2xl font-bold text-${stat.color}-300 mb-2`}>{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Training Timeline */}
                <div className="bg-slate-700/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    تاریخچه آموزش
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { event: 'شروع آموزش مدل', time: selectedModel.created_at, status: 'completed' },
                      { event: 'تکمیل دوره اول آموزش', time: selectedModel.last_training, status: 'completed' },
                      { event: 'بهینه‌سازی فراپارامترها', time: new Date().toISOString(), status: 'in_progress' },
                      { event: 'تکمیل نهایی مدل', time: '', status: 'pending' }
                    ].map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.status === 'completed' ? 'bg-green-500' :
                          event.status === 'in_progress' ? 'bg-yellow-500' :
                          'bg-slate-600'
                        }`}>
                          {event.status === 'completed' ? <CheckCircle className="w-5 h-5 text-white" /> :
                           event.status === 'in_progress' ? <Clock className="w-5 h-5 text-white" /> :
                           <div className="w-3 h-3 bg-slate-400 rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{event.event}</div>
                          {event.time && (
                            <div className="text-sm text-slate-400">
                              {new Date(event.time).toLocaleDateString('fa-IR')} • {new Date(event.time).toLocaleTimeString('fa-IR')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Model Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-slate-600/50 w-full max-w-2xl"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">ایجاد مدل جدید</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">نام مدل</label>
                    <input
                      type="text"
                      placeholder="نام مدل را وارد کنید..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">نوع مدل</label>
                    <select className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-400">
                      <option value="civil-law">قوانین مدنی</option>
                      <option value="criminal-law">قوانین جزایی</option>
                      <option value="commercial-law">قوانین تجاری</option>
                      <option value="administrative-law">قوانین اداری</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl font-medium transition-all"
                    >
                      انصراف
                    </button>
                    <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium">
                      ایجاد مدل
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}