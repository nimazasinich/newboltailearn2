/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Settings, 
  Brain, 
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  HardDrive,
  Eye,
  RefreshCw,
  Search
} from 'lucide-react';

interface Model {
  id: number;
  name: string;
  type: 'dora' | 'qr-adaptor' | 'persian-bert';
  status: 'idle' | 'training' | 'completed' | 'failed' | 'paused';
  accuracy: number;
  loss: number;
  epochs: number;
  current_epoch: number;
  dataset_id: string;
  config: string;
  created_at: string;
  updated_at: string;
}

interface Checkpoint {
  id: number;
  model_id: number;
  session_id: number;
  epoch: number;
  accuracy: number;
  loss: number;
  file_path: string;
  file_size_mb: number;
  metadata: string;
  timestamp: string;
  session_start_time: string;
}

interface ModelExport {
  id: number;
  model_id: number;
  export_type: string;
  file_path: string;
  file_size_mb: number;
  export_format: string;
  metadata: string;
  created_at: string;
}

export function ModelManagementPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [checkpoints, setCheckpoints] = useState<Map<number, Checkpoint[]>>(new Map());
  const [exports, setExports] = useState<Map<number, ModelExport[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [expandedModel, setExpandedModel] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    exportType: 'full_model',
    format: 'json'
  });
  const [loadConfig, setLoadConfig] = useState({
    checkpointPath: '',
    sessionId: ''
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data);
      
      // Load checkpoints and exports for each model
      for (const model of data) {
        await loadModelCheckpoints(model.id);
        await loadModelExports(model.id);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModelCheckpoints = async (modelId: number) => {
    try {
      const response = await fetch(`/api/models/${modelId}/checkpoints`);
      const data = await response.json();
      setCheckpoints(prev => new Map(prev).set(modelId, data));
    } catch (error) {
      console.error(`Failed to load checkpoints for model ${modelId}:`, error);
    }
  };

  const loadModelExports = async (modelId: number) => {
    try {
      // This would be a new endpoint to get model exports
      // For now, we'll simulate it
      setExports(prev => new Map(prev).set(modelId, []));
    } catch (error) {
      console.error(`Failed to load exports for model ${modelId}:`, error);
    }
  };

  const handleExportModel = async (modelId: number) => {
    try {
      const response = await fetch(`/api/models/${modelId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportConfig)
      });
      
      const data = await response.json();
      
      if (data.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `model_${modelId}_export.${exportConfig.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setShowExportModal(false);
      await loadModelExports(modelId);
    } catch (error) {
      console.error('Export failed:', error);
      alert('خطا در صادرات مدل');
    }
  };

  const handleLoadModel = async (modelId: number) => {
    try {
      const response = await fetch(`/api/models/${modelId}/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadConfig)
      });
      
      const data = await response.json();
      
      if (data.message) {
        alert('مدل با موفقیت بارگذاری شد');
        setShowLoadModal(false);
        await loadModels();
      }
    } catch (error) {
      console.error('Load failed:', error);
      alert('خطا در بارگذاری مدل');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'training': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'paused': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'training': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'idle': return 'آماده';
      case 'training': return 'در حال آموزش';
      case 'completed': return 'تکمیل شده';
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

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getStatusLabel(model.status).toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Settings className="w-8 h-8 text-blue-500" />
            مدیریت مدل‌ها
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            صادرات، بارگذاری و مدیریت چک‌پوینت‌های مدل‌های هوش مصنوعی
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو در مدل‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Model Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelTypeColor(model.type)}`}>
                    {getModelTypeLabel(model.type)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(model.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                  {getStatusLabel(model.status)}
                </span>
              </div>
            </div>

            {/* Model Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {model.accuracy ? (model.accuracy * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">دقت</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {model.current_epoch || 0}/{model.epochs || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Epochs</div>
              </div>
            </div>

            {/* Model Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">دیتاست:</span>
                <span className="text-gray-900 dark:text-white">{model.dataset_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">ایجاد:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(model.created_at).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <Eye className="h-3 w-3" />
                جزئیات
              </button>
              
              {model.status === 'completed' && (
                <button
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowExportModal(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  صادرات
                </button>
              )}
              
              <button
                onClick={() => {
                  setSelectedModel(model.id);
                  setShowLoadModal(true);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <Upload className="h-3 w-3" />
                بارگذاری
              </button>
            </div>

            {/* Expanded Details */}
            {expandedModel === model.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                {/* Checkpoints */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    چک‌پوینت‌ها ({checkpoints.get(model.id)?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {checkpoints.get(model.id)?.map((checkpoint) => (
                      <div key={checkpoint.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>Epoch {checkpoint.epoch}</span>
                          <span className="text-gray-500">({checkpoint.file_size_mb.toFixed(1)} MB)</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(checkpoint.timestamp).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 text-center py-2">
                        هیچ چک‌پوینتی یافت نشد
                      </div>
                    )}
                  </div>
                </div>

                {/* Exports */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    صادرات ({exports.get(model.id)?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {exports.get(model.id)?.map((exportItem) => (
                      <div key={exportItem.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>{exportItem.export_type}</span>
                          <span className="text-gray-500">({exportItem.file_size_mb.toFixed(1)} MB)</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(exportItem.created_at).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    )) || (
                      <div className="text-sm text-gray-500 text-center py-2">
                        هیچ صادراتی یافت نشد
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            هیچ مدلی یافت نشد
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'هنوز مدلی وجود ندارد'}
          </p>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">صادرات مدل</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نوع صادرات
                </label>
                <select
                  value={exportConfig.exportType}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, exportType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="full_model">مدل کامل</option>
                  <option value="weights">وزن‌ها</option>
                  <option value="config">پیکربندی</option>
                  <option value="checkpoint">چک‌پوینت</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  فرمت فایل
                </label>
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="json">JSON</option>
                  <option value="h5">HDF5</option>
                  <option value="pb">Protocol Buffer</option>
                  <option value="onnx">ONNX</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleExportModel(selectedModel)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                صادرات
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">بارگذاری مدل</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  مسیر چک‌پوینت
                </label>
                <input
                  type="text"
                  value={loadConfig.checkpointPath}
                  onChange={(e) => setLoadConfig(prev => ({ ...prev, checkpointPath: e.target.value }))}
                  placeholder="/path/to/checkpoint.json"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="text-center text-gray-500">یا</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  شناسه جلسه
                </label>
                <input
                  type="text"
                  value={loadConfig.sessionId}
                  onChange={(e) => setLoadConfig(prev => ({ ...prev, sessionId: e.target.value }))}
                  placeholder="Session ID"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleLoadModel(selectedModel)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                بارگذاری
              </button>
              <button
                onClick={() => setShowLoadModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}