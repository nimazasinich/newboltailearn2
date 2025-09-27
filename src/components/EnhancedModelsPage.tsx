import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trainingService, type ModelInfo } from '../services/training';
import { getDatasets } from '../services/datasets';
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
import { TopNavigation } from './ui/EnhancedNavigation';
import { PerformanceChart, CategoryDistribution, SystemMetrics, RadialProgress } from './charts/EnhancedCharts';
import { cn } from '../utils/cn';

type Model = ModelInfo & {
  performance?: {
    precision: number;
    recall: number;
    f1_score: number;
  };
};

interface Dataset {
  id: string | number;
  name: string;
  samples: number;
  size_mb: number;
  status: string;
  type?: string;
  description?: string;
}

// Enhanced Models Page with Real API Integration
export default function EnhancedModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load models and datasets
      const [modelsData, datasetsData] = await Promise.all([
        trainingService.getModels(),
        getDatasets()
      ]);
      
      setModels(modelsData.models || []);
      setDatasets(datasetsData || []);
    } catch (err) {
      console.error('Failed to load models data:', err);
      setError('خطا در بارگذاری داده‌ها');
      // Use mock data as fallback
      setModels(MOCK_MODELS);
      setDatasets(MOCK_DATASETS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (modelData: any) => {
    try {
      const newModel = await trainingService.createModel(modelData);
      setModels(prev => [...prev, newModel]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create model:', err);
      setError('خطا در ایجاد مدل');
    }
  };

  const handleStartTraining = async (modelId: number) => {
    try {
      await trainingService.startTraining(modelId, {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001
      });
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to start training:', err);
      setError('خطا در شروع آموزش');
    }
  };

  const handlePauseTraining = async (modelId: number) => {
    try {
      await trainingService.pauseTraining(modelId);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to pause training:', err);
      setError('خطا در توقف آموزش');
    }
  };

  const handleResumeTraining = async (modelId: number) => {
    try {
      await trainingService.resumeTraining(modelId);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to resume training:', err);
      setError('خطا در ادامه آموزش');
    }
  };

  const handleDeleteModel = async (modelId: number) => {
    try {
      await trainingService.deleteModel(modelId);
      setModels(prev => prev.filter(m => String(m.id) !== String(modelId)));
    } catch (err) {
      console.error('Failed to delete model:', err);
      setError('خطا در حذف مدل');
    }
  };

  // Filter models based on search and filters
  const filteredModels = models.filter(model => {
    const typeValue = (model.type ?? '').toLowerCase();
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         typeValue.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
    const matchesType = filterType === 'all' || model.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

// Mock Data (fallback)
const MOCK_MODELS: Model[] = [
  {
    id: '1',
    name: 'Persian BERT Legal v2.1',
    type: 'persian-bert',
    status: 'training',
    accuracy: 0.892,
    loss: 0.234,
    epochs: 50,
    currentEpoch: 32,
    datasetId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'مدل پیشرفته برای تحلیل اسناد حقوقی فارسی',
    category: 'قوانین مدنی',
    performance: {
      precision: 0.89,
      recall: 0.91,
      f1_score: 0.90
    }
  },
  {
    id: '2',
    name: 'Legal QA Model Pro',
    type: 'dora',
    status: 'completed',
    accuracy: 0.943,
    loss: 0.156,
    epochs: 30,
    currentEpoch: 30,
    datasetId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'مدل تخصصی برای پاسخ‌دهی به سوالات حقوقی',
    category: 'قوانین جزایی',
    performance: {
      precision: 0.94,
      recall: 0.93,
      f1_score: 0.935
    }
  },
  {
    id: '3',
    name: 'Document Classifier Advanced',
    type: 'qr-adaptor',
    status: 'paused',
    accuracy: 0.768,
    loss: 0.345,
    epochs: 40,
    currentEpoch: 18,
    datasetId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'دسته‌بندی کننده اسناد حقوقی',
    category: 'قوانین تجاری',
    performance: {
      precision: 0.77,
      recall: 0.76,
      f1_score: 0.765
    }
  },
  {
    id: '4',
    name: 'Court Decision Analyzer',
    type: 'persian-bert',
    status: 'idle',
    accuracy: 0,
    loss: 0,
    epochs: 25,
    currentEpoch: 0,
    datasetId: '4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-xl border-l border-slate-700/50 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">مدل‌های یادگیری</h2>
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-2">فیلترها</div>
              <div className="space-y-2">
                <button className="w-full text-right px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                  همه مدل‌ها
                </button>
                <button className="w-full text-right px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                  در حال آموزش
                </button>
                <button className="w-full text-right px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                  تکمیل شده
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">مدیریت مدل‌ها</h1>
            <p className="text-slate-400">مدیریت و نظارت بر مدل‌های یادگیری ماشین</p>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <div key={model.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    model.status === 'training' ? 'bg-blue-500/20 text-blue-300' :
                    model.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {model.status === 'training' ? 'در حال آموزش' :
                     model.status === 'completed' ? 'تکمیل شده' : 'آماده'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{model.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">دقت:</span>
                    <span className="text-white">{((model.accuracy || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">نوع:</span>
                    <span className="text-white">{model.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {model.status === 'idle' && (
                    <button
                      onClick={() => handleStartTraining(Number(model.id))}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      شروع آموزش
                    </button>
                  )}
                  {model.status === 'training' && (
                    <button
                      onClick={() => handlePauseTraining(Number(model.id))}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      توقف
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteModel(Number(model.id))}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
