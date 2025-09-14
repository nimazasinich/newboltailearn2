import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { API } from '../services/api';
import { websocketService } from '../services/websocket';
import { Monitor, Cpu, HardDrive, Wifi, AlertTriangle, Activity } from 'lucide-react';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: { used: 0, total: 0, percentage: 0 },
    uptime: 0,
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await API.getSystemMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load system metrics:', err);
        setError('خطا در بارگذاری معیارهای سیستم');
        // Fallback data
        setMetrics({
          cpu: 45,
          memory: { used: 8192, total: 16384, percentage: 50 },
          uptime: 86400,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    websocketService.connect();

    const handleSystemMetrics = (data: any) => {
      setMetrics(prev => ({
        ...prev,
        ...data,
        timestamp: new Date().toISOString()
      }));
    };

    websocketService.on('system_metrics', handleSystemMetrics);

    return () => {
      websocketService.off('system_metrics', handleSystemMetrics);
    };
  }, []);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) return `${days} روز و ${remainingHours} ساعت`;
    return `${hours} ساعت`;
  };

  const formatMemory = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">نظارت سیستم</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          نظارت بر وضعیت سخت‌افزار و عملکرد سیستم
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          آخرین بروزرسانی: {new Date(metrics.timestamp).toLocaleTimeString('fa-IR')}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            در حال نمایش داده‌های نمونه
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وضعیت سیستم</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">فعال</div>
            <p className="text-xs text-muted-foreground">
              آپتایم: {formatUptime(metrics.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu}%</div>
            <Progress value={metrics.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حافظه</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {formatMemory(metrics.memory.used)} / {formatMemory(metrics.memory.total)}
            </p>
            <Progress value={metrics.memory.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">شبکه</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">متصل</div>
            <p className="text-xs text-muted-foreground">
              عملکرد مطلوب
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              جزئیات سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">سیستم عامل:</span>
                <p className="text-muted-foreground">Linux Ubuntu 22.04</p>
              </div>
              <div>
                <span className="font-medium">معماری:</span>
                <p className="text-muted-foreground">x86_64</p>
              </div>
              <div>
                <span className="font-medium">Node.js:</span>
                <p className="text-muted-foreground">v18.17.0</p>
              </div>
              <div>
                <span className="font-medium">Python:</span>
                <p className="text-muted-foreground">3.10.6</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>نمودار عملکرد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              نمودار عملکرد در حال توسعه است
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}