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
import { useAuth } from '../../hooks/useAuth';
import { useTraining } from '../../hooks/useTraining';
import { useDocuments } from '../../hooks/useDocuments';
import { db } from '../../services/database';
import { SystemMetrics } from '../../types/training';
import { formatPersianDate, formatPersianDuration, formatPersianPercentage } from '../../services/persian/PersianUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export function Overview() {
  const { user } = useAuth();
  const { trainingSessions, getTrainingStatistics } = useTraining();
  const { documents, getDocumentStatistics } = useDocuments();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [trainingStats, setTrainingStats] = useState<any>(null);
  const [documentStats, setDocumentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load system metrics
        const metrics = await db.getSystemMetrics();
        if (metrics) {
          setSystemMetrics(metrics);
        }

        // Load training statistics
        const tStats = await getTrainingStatistics();
        setTrainingStats(tStats);

        // Load document statistics
        const dStats = await getDocumentStatistics();
        setDocumentStats(dStats);
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Update metrics every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [getTrainingStatistics, getDocumentStatistics]);

  // Simulate real-time system metrics
  useEffect(() => {
    const updateSystemMetrics = async () => {
      const activeSessions = trainingSessions.filter(s => s.status === 'running').length;
      const totalDocs = documents.length;

      await db.updateSystemMetrics({
        cpuUsage: Math.min(95, 10 + (activeSessions * 20) + Math.random() * 10),
        memoryUsage: Math.min(90, 15 + (activeSessions * 15) + Math.random() * 8),
        storageUsage: Math.min(80, 20 + (totalDocs * 0.1)),
        networkUsage: Math.random() * 15 + 5,
        activeTrainingSessions: activeSessions,
        totalDocuments: totalDocs,
        systemHealth: activeSessions > 3 ? 'fair' : activeSessions > 0 ? 'good' : 'excellent',
        uptime: Date.now() - (new Date().getTime() - 24 * 60 * 60 * 1000) // 24 hours uptime
      });

      const updatedMetrics = await db.getSystemMetrics();
      if (updatedMetrics) {
        setSystemMetrics(updatedMetrics);
      }
    };

    updateSystemMetrics();
    const interval = setInterval(updateSystemMetrics, 5000);
    return () => clearInterval(interval);
  }, [trainingSessions, documents]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'success';
      case 'good': return 'default';
      case 'fair': return 'warning';
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

  // Sample data for charts
  const trainingProgressData = [
    { name: 'فروردین', sessions: 12, accuracy: 0.75 },
    { name: 'اردیبهشت', sessions: 19, accuracy: 0.82 },
    { name: 'خرداد', sessions: 15, accuracy: 0.78 },
    { name: 'تیر', sessions: 22, accuracy: 0.85 },
    { name: 'مرداد', sessions: 18, accuracy: 0.88 },
    { name: 'شهریور', sessions: 25, accuracy: 0.91 }
  ];

  const modelPerformanceData = [
    { name: 'DoRA', performance: 92, sessions: 45 },
    { name: 'QR-Adaptor', performance: 88, sessions: 38 },
    { name: 'Persian BERT', performance: 94, sessions: 52 }
  ];

  const documentCategoryData = documentStats ? Object.entries(documentStats.categoryStats).map(([category, count]) => ({
    name: category,
    value: count as number,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  })) : [];

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
          خوش آمدید، {user?.name || 'کاربر گرامی'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          آخرین بروزرسانی: {systemMetrics ? formatPersianDate(systemMetrics.lastUpdate, true) : 'در حال بارگذاری...'}
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
              <Badge variant={getHealthColor(systemMetrics?.systemHealth || 'good')}>
                {getHealthText(systemMetrics?.systemHealth || 'good')}
              </Badge>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              آپ‌تایم: {systemMetrics ? formatPersianDuration(systemMetrics.uptime) : '---'}
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
              {systemMetrics?.activeTrainingSessions || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              کل جلسات: {trainingStats?.totalSessions || 0}
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
              {systemMetrics?.totalDocuments || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              کل کلمات: {documentStats?.totalWords.toLocaleString('fa-IR') || '---'}
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
              {formatPersianPercentage((trainingStats?.bestAccuracy || 0) * 100, 1)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              متوسط: {formatPersianPercentage((trainingStats?.averageAccuracy || 0) * 100, 1)}
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
                  {formatPersianPercentage(systemMetrics?.cpuUsage || 0, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics?.cpuUsage || 0} 
                variant={systemMetrics?.cpuUsage && systemMetrics.cpuUsage > 80 ? 'danger' : systemMetrics?.cpuUsage && systemMetrics.cpuUsage > 60 ? 'warning' : 'default'}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">حافظه</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics?.memoryUsage || 0, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics?.memoryUsage || 0} 
                variant={systemMetrics?.memoryUsage && systemMetrics.memoryUsage > 80 ? 'danger' : systemMetrics?.memoryUsage && systemMetrics.memoryUsage > 60 ? 'warning' : 'default'}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">فضای ذخیره‌سازی</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics?.storageUsage || 0, 0)}
                </span>
              </div>
              <Progress 
                value={systemMetrics?.storageUsage || 0} 
                variant={systemMetrics?.storageUsage && systemMetrics.storageUsage > 80 ? 'danger' : systemMetrics?.storageUsage && systemMetrics.storageUsage > 60 ? 'warning' : 'success'}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-base font-medium text-gray-600 dark:text-gray-400">شبکه</span>
                <span className="text-base font-bold">
                  {formatPersianPercentage(systemMetrics?.networkUsage || 0, 0)}
                </span>
              </div>
              <Progress value={systemMetrics?.networkUsage || 0} variant="default" />
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
                  {trainingStats?.completedSessions || 0}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-yellow-600" />
                  <span className="text-base font-medium text-yellow-700 dark:text-yellow-300">در حال اجرا</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {trainingStats?.runningSessions || 0}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-base font-medium text-red-700 dark:text-red-300">ناموفق</span>
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {trainingStats?.failedSessions || 0}
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive className="h-5 w-5 text-green-600" />
                  <span className="text-base font-medium text-green-700 dark:text-green-300">زمان کل</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round(trainingStats?.totalTrainingTime || 0)}د
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">پیشرفت آموزش ماهانه</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trainingProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">عملکرد مدل‌های مختلف</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={modelPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Document Categories */}
      {documentCategoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">توزیع دسته‌بندی اسناد</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={documentCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {documentCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">فعالیت‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            {trainingSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-base">{session.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatPersianDate(session.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  session.status === 'completed' ? 'success' :
                  session.status === 'running' ? 'default' :
                  session.status === 'failed' ? 'destructive' : 'secondary'
                }>
                  {session.status === 'completed' ? 'تکمیل شده' :
                   session.status === 'running' ? 'در حال اجرا' :
                   session.status === 'failed' ? 'ناموفق' :
                   session.status === 'paused' ? 'متوقف شده' : 'در انتظار'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}