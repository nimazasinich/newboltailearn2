import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Brain, 
  Clock, 
  TrendingUp,
  Save,
  Trash2,
  BarChart3,
  Plus
} from 'lucide-react';
import { useTraining } from '../../hooks/useTraining';
import { useAuth } from '../../hooks/useAuth';
import { TrainingSession, ModelConfiguration } from '../../types/training';
import { formatPersianDate, formatPersianDuration, formatPersianPercentage } from '../../services/PersianUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function TrainingManagement() {
  const { user, hasPermission } = useAuth();
  const {
    trainingSessions,
    activeSession,
    sessionProgress,
    sessionMetrics,
    loading,
    error,
    createSession,
    startTraining,
    stopTraining,
    deleteSession,
    createCheckpoint
  } = useTraining();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [newSessionData, setNewSessionData] = useState({
    name: '',
    modelType: 'dora' as TrainingSession['modelType'],
    epochs: 10,
    learningRate: 0.001,
    batchSize: 32
  });
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const canTrainModels = hasPermission('train_models');
  const canDeleteSessions = hasPermission('delete_sessions');

  const handleCreateSession = async () => {
    if (!canTrainModels) return;

    setIsCreating(true);
    try {
      const configuration: ModelConfiguration = {
        learningRate: newSessionData.learningRate,
        batchSize: newSessionData.batchSize,
        epochs: newSessionData.epochs,
        optimizer: 'adam',
        scheduler: 'cosine',
        warmupSteps: 100,
        weightDecay: 0.01,
        dropout: 0.1
      };

      // Add model-specific configurations
      switch (newSessionData.modelType) {
        case 'dora':
          configuration.doraConfig = {
            rank: 16,
            alpha: 32,
            targetModules: ['dense', 'attention'],
            magnitudeVector: true,
            directionMatrix: true,
            decompositionMethod: 'svd',
            adaptiveRank: true,
            rankReduction: 0.1
          };
          break;
        case 'qr-adaptor':
          configuration.qrConfig = {
            quantizationBits: 8,
            compressionRatio: 0.5,
            jointOptimization: true,
            precisionMode: 'int8',
            rankOptimization: true,
            dynamicRank: true
          };
          break;
        case 'persian-bert':
          configuration.bertConfig = {
            modelSize: 'base',
            vocabSize: 30000,
            maxSequenceLength: 512,
            hiddenSize: 768,
            numAttentionHeads: 12,
            numLayers: 12,
            persianTokenization: true,
            legalDomainPretraining: true
          };
          break;
      }

      await createSession(newSessionData.name, newSessionData.modelType, configuration);
      setShowCreateForm(false);
      setNewSessionData({
        name: '',
        modelType: 'dora',
        epochs: 10,
        learningRate: 0.001,
        batchSize: 32
      });
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartTraining = async (sessionId: string) => {
    if (!canTrainModels) return;

    setActionLoading(sessionId);
    try {
      await startTraining(sessionId);
    } catch (error) {
      console.error('Error starting training:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopTraining = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      await stopTraining(sessionId);
    } catch (error) {
      console.error('Error stopping training:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!canDeleteSessions) return;
    if (!confirm('آیا مطمئن هستید که می‌خواهید این جلسه آموزش را حذف کنید؟')) return;

    setActionLoading(sessionId);
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCheckpoint = async (sessionId: string) => {
    try {
      await createCheckpoint(sessionId, `Checkpoint ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error creating checkpoint:', error);
    }
  };

  const getStatusBadgeVariant = (status: TrainingSession['status']) => {
    switch (status) {
      case 'running': return 'default';
      case 'completed': return 'success';
      case 'failed': return 'destructive';
      case 'paused': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: TrainingSession['status']) => {
    switch (status) {
      case 'running': return 'در حال اجرا';
      case 'completed': return 'تکمیل شده';
      case 'failed': return 'ناموفق';
      case 'paused': return 'متوقف شده';
      case 'pending': return 'در انتظار';
      default: return 'نامشخص';
    }
  };

  const getModelTypeText = (modelType: TrainingSession['modelType']) => {
    switch (modelType) {
      case 'dora': return 'DoRA';
      case 'qr-adaptor': return 'QR-Adaptor';
      case 'persian-bert': return 'Persian BERT';
      default: return modelType;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-300 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-vazir" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            مدیریت آموزش مدل‌ها
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            مدیریت و نظارت بر جلسات آموزش هوش مصنوعی
          </p>
        </div>
        {canTrainModels && (
          <Button onClick={() => setShowCreateForm(true)} className="px-6 py-3 text-base">
            <Plus className="h-5 w-5 ml-2" />
            جلسه جدید
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Create Session Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>ایجاد جلسه آموزش جدید</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">نام جلسه</label>
                <input
                  type="text"
                  value={newSessionData.name}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  placeholder="نام جلسه آموزش..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع مدل</label>
                <select
                  value={newSessionData.modelType}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, modelType: e.target.value as any }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="dora">DoRA - Weight-Decomposed Low-Rank Adaptation</option>
                  <option value="qr-adaptor">QR-Adaptor - Joint Quantization & Rank Optimization</option>
                  <option value="persian-bert">Persian BERT - Legal Document Processing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تعداد Epochs</label>
                <input
                  type="number"
                  value={newSessionData.epochs}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, epochs: parseInt(e.target.value) || 10 }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نرخ یادگیری</label>
                <input
                  type="number"
                  value={newSessionData.learningRate}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, learningRate: parseFloat(e.target.value) || 0.001 }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  step="0.0001"
                  min="0.0001"
                  max="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اندازه Batch</label>
                <input
                  type="number"
                  value={newSessionData.batchSize}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 32 }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  min="1"
                  max="512"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSession} loading={isCreating}>
                <Brain className="h-4 w-4 ml-2" />
                ایجاد جلسه
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Session Details */}
      {activeSession && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Brain className="h-5 w-5" />
              جلسه فعال: {activeSession.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">پیشرفت</div>
                <div className="text-xl font-bold">
                  {formatPersianPercentage(sessionProgress.get(activeSession.id)?.completionPercentage || 0, 1)}
                </div>
                <Progress 
                  value={sessionProgress.get(activeSession.id)?.completionPercentage || 0} 
                  className="mt-2"
                />
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Epoch فعلی</div>
                <div className="text-xl font-bold">
                  {sessionProgress.get(activeSession.id)?.currentEpoch || 0} / {sessionProgress.get(activeSession.id)?.totalEpochs || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">زمان باقی‌مانده</div>
                <div className="text-xl font-bold">
                  {formatPersianDuration(sessionProgress.get(activeSession.id)?.estimatedTimeRemaining || 0)}
                </div>
              </div>
            </div>

            {/* Training Metrics */}
            {sessionMetrics.get(activeSession.id) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">سرعت آموزش</div>
                  <div className="text-lg font-semibold">
                    {Math.round(sessionMetrics.get(activeSession.id)!.trainingSpeed)} steps/s
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">مصرف CPU</div>
                  <div className="text-lg font-semibold">
                    {formatPersianPercentage(sessionMetrics.get(activeSession.id)!.cpuUsage, 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">مصرف حافظه</div>
                  <div className="text-lg font-semibold">
                    {Math.round(sessionMetrics.get(activeSession.id)!.memoryUsage)}MB
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">راندمان</div>
                  <div className="text-lg font-semibold">
                    {formatPersianPercentage(sessionMetrics.get(activeSession.id)!.efficiency * 100, 1)}
                  </div>
                </div>
              </div>
            )}

            {/* Training Chart */}
            {sessionProgress.get(activeSession.id)?.trainingLoss.length && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">نمودار Loss و Accuracy</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sessionProgress.get(activeSession.id)?.trainingLoss.map((loss, index) => ({
                    epoch: index + 1,
                    loss,
                    accuracy: sessionProgress.get(activeSession.id)?.validationAccuracy[index] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="loss" stackId="1" stroke="#EF4444" fill="#FEE2E2" />
                    <Area type="monotone" dataKey="accuracy" stackId="2" stroke="#10B981" fill="#D1FAE5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => handleStopTraining(activeSession.id)}
                loading={actionLoading === activeSession.id}
              >
                <Square className="h-4 w-4 ml-2" />
                توقف آموزش
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleCreateCheckpoint(activeSession.id)}
              >
                <Save className="h-4 w-4 ml-2" />
                ایجاد Checkpoint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {trainingSessions.map((session) => (
          <Card 
            key={session.id} 
            className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
              selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedSession(session)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{session.name}</CardTitle>
                <Badge variant={getStatusBadgeVariant(session.status)}>
                  {getStatusText(session.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Brain className="h-4 w-4" />
                {getModelTypeText(session.modelType)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>پیشرفت</span>
                  <span>
                    {formatPersianPercentage(session.progress.completionPercentage, 1)}
                  </span>
                </div>
                <Progress value={session.progress.completionPercentage} />
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  Epochs: {session.progress.currentEpoch}/{session.progress.totalEpochs}
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Settings className="h-3 w-3" />
                  Batch: {session.configuration.batchSize}
                </div>
              </div>

              {/* Latest metrics */}
              {session.progress.validationAccuracy.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    بهترین دقت: {formatPersianPercentage(
                      Math.max(...session.progress.validationAccuracy) * 100, 1
                    )}
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="text-xs text-gray-500">
                {formatPersianDate(session.createdAt)}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {session.status === 'pending' && canTrainModels && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTraining(session.id);
                    }}
                    loading={actionLoading === session.id}
                  >
                    <Play className="h-3 w-3 ml-1" />
                    شروع
                  </Button>
                )}

                {session.status === 'running' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopTraining(session.id);
                    }}
                    loading={actionLoading === session.id}
                  >
                    <Pause className="h-3 w-3 ml-1" />
                    توقف
                  </Button>
                )}

                {session.status === 'paused' && canTrainModels && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTraining(session.id);
                    }}
                    loading={actionLoading === session.id}
                  >
                    <Play className="h-3 w-3 ml-1" />
                    ادامه
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSession(session);
                  }}
                >
                  <BarChart3 className="h-3 w-3 ml-1" />
                  جزئیات
                </Button>

                {canDeleteSessions && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    loading={actionLoading === session.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {trainingSessions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              هیچ جلسه آموزشی یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              برای شروع، اولین جلسه آموزش مدل خود را ایجاد کنید
            </p>
            {canTrainModels && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
                ایجاد جلسه جدید
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white dark:bg-gray-900 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedSession.name} - جزئیات کامل</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedSession(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">وضعیت</h4>
                <Badge variant={getStatusBadgeVariant(selectedSession.status)}>
                  {getStatusText(selectedSession.status)}
                </Badge>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">نوع مدل</h4>
                <p>{getModelTypeText(selectedSession.modelType)}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">پیشرفت</h4>
                <p>{formatPersianPercentage(selectedSession.progress.completionPercentage, 1)}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">تاریخ ایجاد</h4>
                <p>{formatPersianDate(selectedSession.createdAt)}</p>
              </div>
            </div>

            {/* Configuration Details */}
            <div>
              <h4 className="font-semibold mb-3">تنظیمات مدل</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><strong>نرخ یادگیری:</strong> {selectedSession.configuration.learningRate}</div>
                  <div><strong>Batch Size:</strong> {selectedSession.configuration.batchSize}</div>
                  <div><strong>Epochs:</strong> {selectedSession.configuration.epochs}</div>
                  <div><strong>Optimizer:</strong> {selectedSession.configuration.optimizer}</div>
                  <div><strong>Scheduler:</strong> {selectedSession.configuration.scheduler}</div>
                  <div><strong>Weight Decay:</strong> {selectedSession.configuration.weightDecay}</div>
                </div>
              </div>
            </div>

            {/* Training Progress Chart */}
            {selectedSession.progress.trainingLoss.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">نمودار پیشرفت آموزش</h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={selectedSession.progress.trainingLoss.map((loss, index) => ({
                      epoch: index + 1,
                      'Training Loss': loss,
                      'Validation Loss': selectedSession.progress.validationLoss[index] || 0,
                      'Accuracy': (selectedSession.progress.validationAccuracy[index] || 0) * 100
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="Training Loss" stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="Validation Loss" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="Accuracy" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Checkpoints */}
            <div>
              <h4 className="font-semibold mb-3">Checkpoints ({selectedSession.checkpoints.length})</h4>
              <div className="space-y-2">
                {selectedSession.checkpoints.slice(0, 5).map((checkpoint) => (
                  <div key={checkpoint.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">Epoch {checkpoint.epoch} - Step {checkpoint.step}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Loss: {checkpoint.loss.toFixed(4)}, Accuracy: {formatPersianPercentage(checkpoint.accuracy * 100, 1)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPersianDate(checkpoint.timestamp)}
                    </div>
                  </div>
                ))}
                {selectedSession.checkpoints.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">هیچ checkpoint موجود نیست</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}