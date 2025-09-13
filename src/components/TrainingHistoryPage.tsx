import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Database,
  Brain,
  Download,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TrainingSession {
  id: number;
  model_id: number;
  dataset_id: string;
  parameters: string;
  start_time: string;
  end_time: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  final_accuracy: number;
  final_loss: number;
  total_epochs: number;
  training_duration_seconds: number;
  result: string;
  model_name: string;
  model_type: string;
  dataset_name: string;
}

interface TrainingHistoryData {
  sessions: TrainingSession[];
  total: number;
  limit: number;
  offset: number;
}

export function TrainingHistoryPage() {
  const [historyData, setHistoryData] = useState<TrainingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const statusOptions = [
    { value: '', label: 'همه وضعیت‌ها', icon: Filter },
    { value: 'completed', label: 'تکمیل شده', icon: CheckCircle, color: 'text-green-600' },
    { value: 'running', label: 'در حال اجرا', icon: Play, color: 'text-blue-600' },
    { value: 'failed', label: 'ناموفق', icon: XCircle, color: 'text-red-600' },
    { value: 'paused', label: 'متوقف شده', icon: Pause, color: 'text-yellow-600' }
  ];

  useEffect(() => {
    loadTrainingHistory();
  }, [selectedStatus, currentPage]);

  const loadTrainingHistory = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: offset.toString()
      });
      
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      
      const response = await fetch(`/api/sessions?${params}`);
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error('Failed to load training history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running': return <Play className="w-5 h-5 text-blue-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'paused': return <Pause className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'تکمیل شده';
      case 'running': return 'در حال اجرا';
      case 'failed': return 'ناموفق';
      case 'paused': return 'متوقف شده';
      default: return status;
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'persian-bert': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dora': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'qr-adaptor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getModelTypeLabel = (type: string) => {
    switch (type) {
      case 'dora': return 'DoRA';
      case 'qr-adaptor': return 'QR-Adaptor';
      case 'persian-bert': return 'Persian BERT';
      default: return type;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const filteredSessions = historyData?.sessions.filter(session => 
    session.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.dataset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.model_type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'start_time':
        aValue = new Date(a.start_time).getTime();
        bValue = new Date(b.start_time).getTime();
        break;
      case 'final_accuracy':
        aValue = a.final_accuracy || 0;
        bValue = b.final_accuracy || 0;
        break;
      case 'training_duration_seconds':
        aValue = a.training_duration_seconds || 0;
        bValue = b.training_duration_seconds || 0;
        break;
      default:
        aValue = new Date(a.start_time).getTime();
        bValue = new Date(b.start_time).getTime();
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const totalPages = historyData ? Math.ceil(historyData.total / pageSize) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            تاریخچه آموزش
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            مشاهده و مدیریت جلسات آموزش مدل‌های هوش مصنوعی
          </p>
        </div>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در مدل‌ها، دیتاست‌ها یا نوع مدل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
            >
              <option value="start_time">تاریخ شروع</option>
              <option value="final_accuracy">دقت نهایی</option>
              <option value="training_duration_seconds">مدت زمان</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Training Sessions List */}
      <div className="space-y-4">
        {sortedSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Session Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(session.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.model_name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelTypeColor(session.model_type)}`}>
                      {getModelTypeLabel(session.model_type)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">دیتاست:</span>
                    <span className="text-gray-900 dark:text-white">{session.dataset_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">شروع:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(session.start_time).toLocaleString('fa-IR')}
                    </span>
                  </div>
                  
                  {session.end_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">مدت:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDuration(session.training_duration_seconds || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Session Metrics */}
              {session.status === 'completed' && (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {session.final_accuracy ? (session.final_accuracy * 100).toFixed(1) : '0.0'}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">دقت نهایی</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {session.total_epochs || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Epochs</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {session.final_loss ? session.final_loss.toFixed(4) : '0.0000'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Loss</div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {session.status === 'completed' && (
                  <button
                    onClick={() => {
                      // Export session results
                      const exportData = {
                        sessionId: session.id,
                        modelName: session.model_name,
                        datasetName: session.dataset_name,
                        finalAccuracy: session.final_accuracy,
                        finalLoss: session.final_loss,
                        totalEpochs: session.total_epochs,
                        duration: session.training_duration_seconds,
                        startTime: session.start_time,
                        endTime: session.end_time,
                        parameters: JSON.parse(session.parameters || '{}')
                      };
                      
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `training_session_${session.id}_${session.model_name}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Expanded Session Details */}
            {expandedSession === session.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Training Parameters */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">پارامترهای آموزش</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(session.parameters || '{}'), null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Training Results */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">نتایج آموزش</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">وضعیت:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusLabel(session.status)}
                        </span>
                      </div>
                      
                      {session.final_accuracy && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">دقت نهایی:</span>
                          <span className="text-gray-900 dark:text-white">{(session.final_accuracy * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      
                      {session.final_loss && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Loss نهایی:</span>
                          <span className="text-gray-900 dark:text-white">{session.final_loss.toFixed(4)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">تعداد Epochs:</span>
                        <span className="text-gray-900 dark:text-white">{session.total_epochs || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">مدت زمان:</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatDuration(session.training_duration_seconds || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">شروع:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(session.start_time).toLocaleString('fa-IR')}
                        </span>
                      </div>
                      
                      {session.end_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">پایان:</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(session.end_time).toLocaleString('fa-IR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            قبلی
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            صفحه {currentPage} از {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            بعدی
          </button>
        </div>
      )}

      {/* Empty State */}
      {sortedSessions.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            هیچ جلسه آموزشی یافت نشد
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'هنوز جلسه آموزشی وجود ندارد'}
          </p>
        </div>
      )}
    </div>
  );
}