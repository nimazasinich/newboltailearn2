import React, { useState, useEffect } from 'react';
import { ModernCard } from './ui/ModernCard';
import { SlimBadge } from './ui/SlimBadge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { trainingService } from '../services/training';
import { tensorFlowEngine, TensorFlowTrainingConfig, TrainingProgress } from '../services/ai/TensorFlowIntegration';
import * as tf from '@tensorflow/tfjs';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Brain, 
  Database,
  Clock,
  Target,
  Zap,
  Plus,
  Eye,
  Download,
  TrendingUp,
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Enhanced Training Management Component with Real API Integration
export default function TrainingManagement() {
  const [trainingSessions, setTrainingSessions] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [trainingConfig, setTrainingConfig] = useState<TensorFlowTrainingConfig>({
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    earlyStopping: true,
    patience: 5
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load models, datasets, and training sessions
      const [modelsData, datasetsData, sessionsData] = await Promise.all([
        trainingService.getModels(),
        trainingService.getDatasets(),
        trainingService.getTrainingSessions()
      ]);
      
      setModels(modelsData.models || []);
      setDatasets(datasetsData.datasets || []);
      setTrainingSessions(sessionsData || []);
    } catch (err) {
      console.error('Failed to load training data:', err);
      setError('خطا در بارگذاری داده‌ها');
      // Use mock data as fallback
      setTrainingSessions(MOCK_TRAINING_SESSIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async (modelId: number) => {
    try {
      setIsTraining(true);
      setTrainingProgress(null);
      
      const result = await trainingService.startTraining(modelId, {
        epochs: trainingConfig.epochs,
        batchSize: trainingConfig.batchSize,
        learningRate: trainingConfig.learningRate,
        validationSplit: trainingConfig.validationSplit,
        earlyStopping: trainingConfig.earlyStopping,
        patience: trainingConfig.patience
      });
      
      if (result.success) {
        // Start TensorFlow training with progress tracking
        await startTensorFlowTraining(modelId, trainingConfig);
      }
    } catch (err) {
      console.error('Failed to start training:', err);
      setError('خطا در شروع آموزش');
    }
  };

  const startTensorFlowTraining = async (modelId: number, config: TensorFlowTrainingConfig) => {
    try {
      // Create model
      const model = tensorFlowEngine.createModel(config);
      
      // Generate mock training data (in real implementation, this would come from datasets)
      const xTrain = tf.randomNormal([1000, 768]); // Mock BERT embeddings
      const yTrain = tf.oneHot(tf.randomUniform([1000], 0, 10, 'int32'), 10);
      
      // Train with progress tracking
      const metrics = await tensorFlowEngine.trainModel(
        xTrain,
        yTrain,
        config,
        (progress) => {
          setTrainingProgress(progress);
        }
      );
      
      console.log('Training completed:', metrics);
      setIsTraining(false);
      setTrainingProgress(null);
      
      // Refresh data
      await loadData();
    } catch (err) {
      console.error('TensorFlow training failed:', err);
      setError('خطا در آموزش TensorFlow');
      setIsTraining(false);
    }
  };

  const handlePauseTraining = async (modelId: number) => {
    try {
      await trainingService.pauseTraining(modelId);
      tensorFlowEngine.pauseTraining();
      await loadData();
    } catch (err) {
      console.error('Failed to pause training:', err);
      setError('خطا در توقف آموزش');
    }
  };

  const handleResumeTraining = async (modelId: number) => {
    try {
      await trainingService.resumeTraining(modelId);
      tensorFlowEngine.resumeTraining();
      await loadData();
    } catch (err) {
      console.error('Failed to resume training:', err);
      setError('خطا در ادامه آموزش');
    }
  };

  const handleStopTraining = async (modelId: number) => {
    try {
      await trainingService.stopTraining(modelId);
      tensorFlowEngine.stopTraining();
      setIsTraining(false);
      setTrainingProgress(null);
      await loadData();
    } catch (err) {
      console.error('Failed to stop training:', err);
      setError('خطا در متوقف کردن آموزش');
    }
  };

// Mock Data برای Training Management (fallback)
const MOCK_TRAINING_SESSIONS = [
  {
    id: 1,
    model_name: 'Persian BERT Legal v3.0',
    model_type: 'persian-bert',
    dataset: 'Legal QA Persian Extended',
    status: 'training',
    progress: 64,
    current_epoch: 32,
    total_epochs: 50,
    accuracy: 0.89,
    loss: 0.23,
    learning_rate: 0.001,
    batch_size: 32,
    estimated_completion: '2h 15m',
    elapsed_time: '1h 45m',
    started_at: new Date(Date.now() - 6300000).toISOString(),
    gpu_usage: 85,
    memory_usage: 12.4
  },
  {
    id: 2,
    model_name: 'Contract Analyzer Pro',
    model_type: 'dora',
    dataset: 'Contract Analysis Dataset',
    status: 'training',
    progress: 28,
    current_epoch: 14,
    total_epochs: 50,
    accuracy: 0.76,
    loss: 0.45,
    learning_rate: 0.0005,
    batch_size: 16,
    estimated_completion: '4h 30m',
    elapsed_time: '1h 20m',
    started_at: new Date(Date.now() - 4800000).toISOString(),
    gpu_usage: 72,
    memory_usage: 8.2
  },
  {
    id: 3,
    model_name: 'Legal Document Classifier',
    model_type: 'qr-adaptor',
    dataset: 'Legal Documents Collection',
    status: 'paused',
    progress: 45,
    current_epoch: 18,
    total_epochs: 40,
    accuracy: 0.82,
    loss: 0.31,
    learning_rate: 0.002,
    batch_size: 64,
    estimated_completion: 'متوقف شده',
    elapsed_time: '2h 10m',
    started_at: new Date(Date.now() - 8400000).toISOString(),
    gpu_usage: 0,
    memory_usage: 0
  }
];

const MOCK_TRAINING_QUEUE = [
  {
    id: 4,
    model_name: 'Case Law Predictor v2',
    model_type: 'persian-bert',
    dataset: 'Case Law Database',
    priority: 'high',
    estimated_duration: '6h',
    scheduled_for: new Date(Date.now() + 3600000).toISOString()
  },
  {
    id: 5,
    model_name: 'Legal Summarizer',
    model_type: 'dora',
    dataset: 'Legal Documents',
    priority: 'medium',
    estimated_duration: '4h',
    scheduled_for: new Date(Date.now() + 7200000).toISOString()
  }
];

const MOCK_TRAINING_HISTORY = Array.from({ length: 10 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('fa-IR'),
  sessions: Math.floor(Math.random() * 5) + 1,
  avg_accuracy: Math.random() * 0.2 + 0.8,
  total_time: Math.floor(Math.random() * 8) + 2
}));

const MOCK_MODEL_PERFORMANCE = [
  { name: 'Persian BERT', accuracy: 94, training_time: 8.5, efficiency: 92 },
  { name: 'DORA', accuracy: 89, training_time: 6.2, efficiency: 88 },
  { name: 'QR Adaptor', accuracy: 85, training_time: 4.8, efficiency: 85 }
];

const MOCK_RESOURCE_USAGE = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  gpu_usage: Math.floor(Math.random() * 40) + 30,
  memory_usage: Math.floor(Math.random() * 30) + 40,
  cpu_usage: Math.floor(Math.random() * 25) + 25
}));

  // Update active sessions when training sessions change
  useEffect(() => {
    setActiveSessions(trainingSessions.filter(session => 
      session.status === 'training' || session.status === 'paused'
    ));
  }, [trainingSessions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'info';
      case 'paused': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <Play className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'failed': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'training': return 'در حال آموزش';
      case 'paused': return 'متوقف شده';
      case 'completed': return 'تکمیل شده';
      case 'failed': return 'ناموفق';
      default: return 'نامشخص';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'neutral';
      default: return 'neutral';
    }
  };

  // آمار کلی
  const stats = {
    active: activeSessions.filter(s => s.status === 'training').length,
    paused: activeSessions.filter(s => s.status === 'paused').length,
    queued: trainingQueue.length,
    avgAccuracy: activeSessions.reduce((sum, s) => sum + s.accuracy, 0) / activeSessions.length * 100,
    totalGpuUsage: activeSessions.reduce((sum, s) => sum + s.gpu_usage, 0),
    totalMemoryUsage: activeSessions.reduce((sum, s) => sum + s.memory_usage, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 mb-2">
              آموزش مدل‌ها
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              مدیریت و نظارت بر فرآیند آموزش مدل‌های هوش مصنوعی
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl">
              <Settings className="w-4 h-4 ml-2" />
              تنظیمات آموزش
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Plus className="w-4 h-4 ml-2" />
              آموزش جدید
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.active}</h3>
            <p className="text-slate-600 dark:text-slate-400">در حال آموزش</p>
            <div className="mt-2">
              <SlimBadge variant="info" size="xs">فعال</SlimBadge>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.avgAccuracy.toFixed(1)}%</h3>
            <p className="text-slate-600 dark:text-slate-400">میانگین دقت</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-600">+2.3%</span>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.totalGpuUsage}%</h3>
            <p className="text-slate-600 dark:text-slate-400">استفاده GPU</p>
            <div className="mt-2">
              <SlimBadge variant={stats.totalGpuUsage > 80 ? 'warning' : 'success'} size="xs">
                {stats.totalGpuUsage > 80 ? 'بالا' : 'نرمال'}
              </SlimBadge>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.queued}</h3>
            <p className="text-slate-600 dark:text-slate-400">در صف انتظار</p>
            <div className="mt-2">
              <SlimBadge variant="neutral" size="xs">آماده</SlimBadge>
            </div>
          </ModernCard>
        </div>

        {/* Active Training Sessions */}
        <ModernCard variant="outlined">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              جلسات آموزش فعال
            </h3>
            <SlimBadge variant="info">{stats.active} فعال</SlimBadge>
          </div>
          <div className="space-y-6">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {session.model_name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {session.model_type} • {session.dataset}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SlimBadge variant={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      {getStatusText(session.status)}
                    </SlimBadge>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">پیشرفت آموزش</span>
                    <span className="font-medium">{session.current_epoch}/{session.total_epochs} epochs</span>
                  </div>
                  <Progress value={session.progress} className="h-3" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>دقت: {(session.accuracy * 100).toFixed(1)}%</span>
                    <span>خطا: {session.loss.toFixed(3)}</span>
                    <span>زمان باقی‌مانده: {session.estimated_completion}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{session.learning_rate}</div>
                    <div className="text-xs text-slate-500">Learning Rate</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{session.batch_size}</div>
                    <div className="text-xs text-slate-500">Batch Size</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{session.gpu_usage}%</div>
                    <div className="text-xs text-slate-500">GPU Usage</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{session.memory_usage}GB</div>
                    <div className="text-xs text-slate-500">Memory</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {session.status === 'training' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg"
                      onClick={() => handlePauseTraining(session.id)}
                    >
                      <Pause className="w-3 h-3 ml-1" />
                      توقف
                    </Button>
                  )}
                  {session.status === 'paused' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg"
                      onClick={() => handleResumeTraining(session.id)}
                    >
                      <Play className="w-3 h-3 ml-1" />
                      ادامه
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg"
                    onClick={() => handleStopTraining(session.id)}
                    disabled={session.status === 'completed'}
                  >
                    <Square className="w-3 h-3 ml-1" />
                    توقف کامل
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Eye className="w-3 h-3 ml-1" />
                    جزئیات
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Settings className="w-3 h-3 ml-1" />
                    تنظیمات
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Training Progress Display */}
        {isTraining && trainingProgress && (
          <ModernCard variant="outlined" className="mb-8">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                پیشرفت آموزش
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{trainingProgress.epoch}</div>
                  <div className="text-sm text-slate-600">دوره فعلی</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{(trainingProgress.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-sm text-slate-600">دقت</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{trainingProgress.loss.toFixed(3)}</div>
                  <div className="text-sm text-slate-600">خطا</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={trainingProgress.progress} className="h-2" />
                <div className="text-sm text-slate-600 mt-2 text-center">
                  {trainingProgress.progress.toFixed(1)}% تکمیل شده
                </div>
              </div>
            </div>
          </ModernCard>
        )}

        {/* Error Display */}
        {error && (
          <ModernCard variant="outlined" className="mb-8 border-red-200 bg-red-50">
            <div className="p-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">خطا</span>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setError(null)}
              >
                بستن
              </Button>
            </div>
          </ModernCard>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Training History */}
          <ModernCard variant="outlined">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                تاریخچه آموزش
              </h3>
              <SlimBadge variant="neutral">10 روز گذشته</SlimBadge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TRAINING_HISTORY.slice().reverse()}>
                  <defs>
                    <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#sessionsGradient)"
                    name="جلسات آموزش"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ModernCard>

          {/* Resource Usage */}
          <ModernCard variant="outlined">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                استفاده از منابع
              </h3>
              <SlimBadge variant="warning">زنده</SlimBadge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_RESOURCE_USAGE.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gpu_usage" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="GPU (%)"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memory_usage" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Memory (%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ModernCard>
        </div>

        {/* Training Queue */}
        <ModernCard variant="outlined">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              صف آموزش
            </h3>
            <SlimBadge variant="neutral">{trainingQueue.length} در انتظار</SlimBadge>
          </div>
          <div className="space-y-4">
            {trainingQueue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.model_name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.model_type} • {item.dataset}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SlimBadge variant={getPriorityColor(item.priority)} size="sm">
                    {item.priority === 'high' ? 'اولویت بالا' : 
                     item.priority === 'medium' ? 'اولویت متوسط' : 'اولویت پایین'}
                  </SlimBadge>
                  <div className="text-sm text-slate-500">
                    زمان تخمینی: {item.estimated_duration}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Play className="w-3 h-3 ml-1" />
                    شروع فوری
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Create Training Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <ModernCard className="w-full max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">شروع آموزش جدید</h3>
                <p className="text-slate-600 mb-6">فرم ایجاد جلسه آموزش در حال توسعه است...</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    انصراف
                  </Button>
                  <Button onClick={() => setShowCreateModal(false)}>
                    شروع آموزش
                  </Button>
                </div>
              </div>
            </ModernCard>
          </div>
        )}
      </div>
    </div>
  );
}