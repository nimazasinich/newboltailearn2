import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { API, SystemMetrics } from '../services/api';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Globe,
  Monitor
} from 'lucide-react';

interface SystemStatusProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function SystemStatus({ compact = false, showDetails = true }: SystemStatusProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await API.monitoring();
        setMetrics(data);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        console.error('Failed to load system metrics:', err);
        setError('خطا در بارگذاری وضعیت سیستم');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days} روز ${hours} ساعت`;
    if (hours > 0) return `${hours} ساعت ${minutes} دقیقه`;
    return `${minutes} دقیقه`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    if (bytes === 0) return '0 بایت';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-2">در حال بارگذاری...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          {getStatusIcon(metrics?.cpu || 0, { warning: 70, critical: 90 })}
          <span className="text-sm font-medium">CPU: {metrics?.cpu || 0}%</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(metrics?.memory?.percentage || 0, { warning: 80, critical: 95 })}
          <span className="text-sm font-medium">RAM: {metrics?.memory?.percentage || 0}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">آنلاین</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          وضعیت سیستم
          <Badge variant="outline" className="text-xs">
            {lastUpdate.toLocaleTimeString('fa-IR')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Cpu className="h-6 w-6 text-blue-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">پردازنده</span>
                <span className={`text-sm font-bold ${getStatusColor(metrics?.cpu || 0, { warning: 70, critical: 90 })}`}>
                  {metrics?.cpu || 0}%
                </span>
              </div>
              <Progress value={metrics?.cpu || 0} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MemoryStick className="h-6 w-6 text-green-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">حافظه</span>
                <span className={`text-sm font-bold ${getStatusColor(metrics?.memory?.percentage || 0, { warning: 80, critical: 95 })}`}>
                  {metrics?.memory?.percentage || 0}%
                </span>
              </div>
              <Progress value={metrics?.memory?.percentage || 0} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <HardDrive className="h-6 w-6 text-purple-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">دیسک</span>
                <span className="text-sm font-bold text-gray-600">
                  {formatBytes(metrics?.memory?.used || 0)} / {formatBytes(metrics?.memory?.total || 0)}
                </span>
              </div>
              <Progress value={metrics?.memory?.percentage || 0} className="h-2" />
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* System Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">اطلاعات سیستم</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">پلتفرم:</span>
                    <span className="font-medium">{metrics?.platform || 'نامشخص'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">معماری:</span>
                    <span className="font-medium">{metrics?.arch || 'نامشخص'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">آپتایم:</span>
                    <span className="font-medium">{formatUptime(metrics?.uptime || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">وضعیت اتصال</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm">اتصال به پایگاه داده</span>
                    <Badge variant="outline" className="text-xs">متصل</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="text-sm">اتصال به اینترنت</span>
                    <Badge variant="outline" className="text-xs">آنلاین</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">امنیت سیستم</span>
                    <Badge variant="outline" className="text-xs">فعال</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Status */}
            {metrics?.training && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">وضعیت آموزش</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{metrics.training.active}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">جلسات فعال</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{metrics.training.completed}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">تکمیل شده</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{metrics.training.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">کل جلسات</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
