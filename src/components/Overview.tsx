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
  TrendingUp, 
  Cpu,
  HardDrive,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export function Overview() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [models, setModels] = useState<TrainingSession[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [metricsResult, modelsResult, datasetsResult] = await Promise.allSettled([
          API.monitoring(),
          API.models(),
          API.datasets()
        ]);

        if (metricsResult.status === 'fulfilled') {
          setSystemMetrics(metricsResult.value);
        }

        if (modelsResult.status === 'fulfilled') {
          setModels(modelsResult.value);
        }

        if (datasetsResult.status === 'fulfilled') {
          setDatasets(datasetsResult.value);
        }

        // If all failed, show error
        if (metricsResult.status === 'rejected' && modelsResult.status === 'rejected' && datasetsResult.status === 'rejected') {
          setError('خطا در بارگذاری داده‌ها');
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

  const formatPersianNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const formatPersianPercentage = (num: number, decimals = 1): string => {
    return `${num.toFixed(decimals).replace('.', '/')}%`;
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${formatPersianNumber(days)} روز`;
    if (hours > 0) return `${formatPersianNumber(hours)} ساعت`;
    return `${formatPersianNumber(minutes)} دقیقه`;
  };

  // Calculate stats
  const runningModels = models.filter(m => m.status === 'training' || m.status === 'running').length;
  const completedModels = models.filter(m => m.status === 'completed').length;
  const bestAccuracy = models.length > 0 ? Math.max(...models.map(m => m.accuracy || 0)) : 0;
  const avgAccuracy = models.length > 0 ? models.reduce((acc, m) => acc + (m.accuracy || 0), 0) / models.length : 0;
  const totalSamples = datasets.reduce((acc, d) => acc + (d.samples || 0), 0);

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
    <div className="space-y-6" dir="rtl" data-testid="overview-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          نمای کلی سیستم
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400">
            آخرین بروزرسانی: {systemMetrics ? new Date(systemMetrics.timestamp).toLocaleString('fa-IR') : 'نامشخص'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            بروزرسانی
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              وضعیت سیستم
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <Badge variant={systemMetrics ? "default" : "secondary"}>
                {systemMetrics ? 'سالم' : 'نامشخص'}
              </Badge>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              آپ‌تایم: {systemMetrics ? formatUptime(systemMetrics.uptime) : 'نامشخص'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              جلسات آموزش فعال
            </CardTitle>
            <Brain className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatPersianNumber(runningModels)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              کل مدل‌ها: {formatPersianNumber(models.length)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              دیتاست‌ها
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatPersianNumber(datasets.length)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              کل نمونه‌ها: {formatPersianNumber(totalSamples)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              بهترین دقت
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {formatPersianPercentage(bestAccuracy * 100)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              متوسط: {formatPersianPercentage(avgAccuracy * 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      {systemMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cpu className="h-5 w-5" />
                منابع سیستم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>CPU</span>
                  <span className="font-bold">{formatPersianPercentage(systemMetrics.cpu)}</span>
                </div>
                <Progress value={systemMetrics.cpu} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>حافظه</span>
                  <span className="font-bold">{formatPersianPercentage(systemMetrics.memory.percentage)}</span>
                </div>
                <Progress value={systemMetrics.memory.percentage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>فضای ذخیره</span>
                  <span className="font-bold">{formatPersianPercentage(systemMetrics.disk.percentage)}</span>
                </div>
                <Progress value={systemMetrics.disk.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <HardDrive className="h-5 w-5" />
                آمار آموزش
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatPersianNumber(completedModels)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">تکمیل شده</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatPersianNumber(runningModels)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">در حال اجرا</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">میانگین دقت کلی</span>
                  <span className="font-bold">{formatPersianPercentage(avgAccuracy * 100)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!systemMetrics && !models.length && !datasets.length && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              داده‌ای یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              هیچ داده‌ای از سرور دریافت نشد. لطفاً وضعیت اتصال را بررسی کنید.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Overview;