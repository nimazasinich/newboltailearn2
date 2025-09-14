import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
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
  HardDrive
} from 'lucide-react';

// Mock data interfaces
interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkUsage: number;
  activeTrainingSessions: number;
  totalDocuments: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  uptime: number;
  lastUpdate: string;
}

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
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    storageUsage: 35,
    networkUsage: 12,
    activeTrainingSessions: 3,
    totalDocuments: 1247,
    systemHealth: 'good',
    uptime: 86400000, // 1 day in milliseconds
    lastUpdate: new Date().toISOString()
  });

  const [trainingStats] = useState<TrainingStats>({
    totalSessions: 156,
    completedSessions: 142,
    runningSessions: 3,
    failedSessions: 11,
    bestAccuracy: 0.94,
    averageAccuracy: 0.87,
    totalTrainingTime: 2847
  });

  const [documentStats] = useState<DocumentStats>({
    totalWords: 2450000,
    categoryStats: {
      'قوانین مدنی': 450,
      'قوانین جزایی': 380,
      'قوانین تجاری': 290,
      'آیین دادرسی': 127
    }
  });

  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(15, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkUsage: Math.max(2, Math.min(30, Math.random() * 15 + 5)),
        lastUpdate: new Date().toISOString()
      }));
    }, 5000);

    return () => clearInterval(interval);
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

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          خوش آمدید، کاربر گرامی
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          آخرین بروزرسانی: {formatPersianDate(systemMetrics.lastUpdate)}
        </p>
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
              <Badge variant={getHealthColor(systemMetrics.systemHealth)}>
                {getHealthText(systemMetrics.systemHealth)}
              </Badge>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              آپ‌تایم: {formatPersianDuration(systemMetrics.uptime)}
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
              {systemMetrics.activeTrainingSessions}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              کل جلسات: {trainingStats.totalSessions}
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
              {systemMetrics.totalDocuments.toLocaleString('fa-IR')}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              کل کلمات: {documentStats.totalWords.toLocaleString('fa-IR')}
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
              {formatPersianPercentage(trainingStats.bestAccuracy * 100, 1)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              متوسط: {formatPersianPercentage(trainingStats.averageAccuracy * 100, 1)}
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
                  {formatPersianPercentage(systemMetrics.cpuUsage, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics.cpuUsage} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">حافظه</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics.memoryUsage, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics.memoryUsage} 
                className="h-3"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">فضای ذخیره‌سازی</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics.storageUsage, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics.storageUsage} 
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