/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: Replaced by simplified Overview component in Phase 2 full functionality refactor
   Moved: 2025-09-14
   Original complexity: 500+ lines with complex state management
   New version: Simplified with proper API integration and loading states
*/
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { API, SystemMetrics, TrainingSession, Dataset } from '../services/api';
import { wsClient } from '../services/wsClient';
import { 
  Activity, 
  Brain, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Cpu,
  HardDrive,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface TrainingStats {
  totalSessions: number;
  completedSessions: number;
  runningSessions: number;
  failedSessions: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTrainingTime: number;
}

interface DocumentStats {
  totalWords: number;
  categoryStats: Record<string, number>;
}

export function Overview() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);

  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [models, setModels] = useState<TrainingSession[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

      // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [metricsResult, modelsResult, datasetsResult] = await Promise.allSettled([
          API.monitoring(),
          API.models(),
          API.datasets()
        ]);

        // Process system metrics
        if (metricsResult.status === 'fulfilled') {
          setSystemMetrics(metricsResult.value);
        } else {
          console.error('Failed to load system metrics:', metricsResult.reason);
        }

        // Process models data
        if (modelsResult.status === 'fulfilled') {
          const modelsData = modelsResult.value;
          setModels(modelsData);
          
          setTrainingStats({
            totalSessions: modelsData.length,
            completedSessions: modelsData.filter(m => m.status === 'completed').length,
            runningSessions: modelsData.filter(m => m.status === 'training' || m.status === 'running').length,
            failedSessions: modelsData.filter(m => m.status === 'failed' || m.status === 'error').length,
            bestAccuracy: modelsData.length > 0 ? Math.max(...modelsData.map(m => m.accuracy || 0)) : 0,
            averageAccuracy: modelsData.length > 0 ? modelsData.reduce((acc, m) => acc + (m.accuracy || 0), 0) / modelsData.length : 0,
            totalTrainingTime: modelsData.reduce((acc, m) => acc + (m.estimated_time || 0), 0)
          });
        } else {
          console.error('Failed to load models:', modelsResult.reason);
        }

        // Process datasets data
        if (datasetsResult.status === 'fulfilled') {
          const datasetsData = datasetsResult.value;
          setDatasets(datasetsData);
          
          setDocumentStats({
            totalWords: datasetsData.reduce((acc, d) => acc + (d.samples || 0), 0),
            categoryStats: datasetsData.reduce((acc: any, d) => {
              const category = d.type || 'نامشخص';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {})
          });
        } else {
          console.error('Failed to load datasets:', datasetsResult.reason);
        }

      } catch (err) {
        console.error('Failed to load overview data:', err);
        setError('خطا در بارگذاری داده‌ها');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    const handleSystemMetrics = (event: any) => {
      if (event.data) {
        setSystemMetrics(event.data);
      }
    };

    const handleTrainingProgress = (event: any) => {
      // Refresh models data when training updates
      if (event.data) {
        API.models().then(setModels).catch(console.error);
      }
    };

    wsClient.on('system_metrics', handleSystemMetrics);
    wsClient.on('training_progress', handleTrainingProgress);

    return () => {
      wsClient.off('system_metrics', handleSystemMetrics);
      wsClient.off('training_progress', handleTrainingProgress);
    };
  }, []);

  // Utility functions
  const formatPersianDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'همین الان';
    if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ساعت پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  const formatPersianDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) return `${days} روز و ${remainingHours} ساعت`;
    return `${hours} ساعت`;
  };

  const formatPersianPercentage = (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'destructive';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'excellent': return 'عالی';
      case 'good': return 'خوب';
      case 'fair': return 'متوسط';
      case 'poor': return 'ضعیف';
      default: return 'نامشخص';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری داده‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          نمای کلی سیستم
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          آخرین بروزرسانی: {systemMetrics ? formatPersianDate(systemMetrics.timestamp) : 'نامشخص'}
        </p>
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 underline hover:no-underline"
            >
              تلاش مجدد
            </button>
          </div>
        )}
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              وضعیت سیستم
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <Badge variant="default">
                {systemMetrics ? 'سالم' : 'نامشخص'}
              </Badge>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              آپ‌تایم: {systemMetrics ? formatPersianDuration(systemMetrics.uptime) : 'نامشخص'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              جلسات آموزش فعال
            </CardTitle>
            <Brain className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {trainingStats?.runningSessions ?? 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              کل جلسات: {trainingStats?.totalSessions ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              اسناد پردازش شده
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {datasets.length.toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              کل نمونه‌ها: {documentStats?.totalWords.toLocaleString('fa-IR') ?? '0'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              بهترین دقت مدل
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {formatPersianPercentage((trainingStats?.bestAccuracy ?? 0) * 100, 1)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              متوسط: {formatPersianPercentage((trainingStats?.averageAccuracy ?? 0) * 100, 1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Cpu className="h-6 w-6" />
              منابع سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">CPU</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics?.cpu ?? 0, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics?.cpu ?? 0} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">حافظه</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics?.memory.percentage ?? 0, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics?.memory.percentage ?? 0} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">فضای ذخیره‌سازی</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics?.disk.percentage ?? 0, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics?.disk.percentage ?? 0} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">شبکه</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics.networkUsage, 0)}
                </span>
              </div>
              <Progress value={systemMetrics.networkUsage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Clock className="h-6 w-6" />
              آمار آموزش
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-base font-medium text-blue-700 dark:text-blue-300">تکمیل شده</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {trainingStats.completedSessions}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-yellow-600" />
                  <span className="text-base font-medium text-yellow-700 dark:text-yellow-300">در حال اجرا</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {trainingStats.runningSessions}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-base font-medium text-red-700 dark:text-red-300">ناموفق</span>
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {trainingStats.failedSessions}
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="h-5 w-5 text-green-600" />
                  <span className="text-base font-medium text-green-700 dark:text-green-300">زمان کل</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round(trainingStats.totalTrainingTime)}ساعت
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">توزیع دسته‌بندی اسناد</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Object.entries(documentStats.categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-base font-medium">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(count / Math.max(...Object.values(documentStats.categoryStats))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold w-12 text-left">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}