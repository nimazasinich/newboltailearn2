import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { monitoring, models } from '../lib/api';
import { BarChart, LineChart, PieChart, TrendingUp, Brain, Activity, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { data: modelsData, loading: modelsLoading, error: modelsError } = useApi('/models');
  const { data: metricsData, loading: metricsLoading, error: metricsError } = useApi('/monitoring');
  const { connected, subscribe } = useWebSocket();

  useEffect(() => {
    // Subscribe to WebSocket updates
    const unsubscribe = subscribe('system:metrics', (data: any) => {
      console.log('Received system metrics:', data);
    });
    
    const unsubscribeTraining = subscribe('training:progress', (data: any) => {
      console.log('Received training progress:', data);
    });

    return () => {
      unsubscribe();
      unsubscribeTraining();
    };
  }, [subscribe]);

  const loading = modelsLoading || metricsLoading;
  const error = modelsError || metricsError;

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">داشبورد پیشرفته</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          نمای جامع از عملکرد سیستم و مدل‌های آموزشی
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-500">وضعیت اتصال:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {connected ? 'متصل' : 'قطع شده'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل مدل‌ها</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelsData?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جلسات فعال</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelsData?.filter((m: any) => m.status === 'training').length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط دقت</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              نمودار عملکرد مدل‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              نمودار در حال توسعه است
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              روند آموزش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              نمودار در حال توسعه است
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            توزیع انواع مدل‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            نمودار در حال توسعه است
          </div>
        </CardContent>
      </Card>
    </div>
  );
}