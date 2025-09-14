import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { API, TrainingSession, SystemMetrics } from '../services/api';
import { wsClient } from '../services/wsClient';
import { BarChart, LineChart, PieChart, TrendingUp, Brain, Activity, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [models, setModels] = useState<TrainingSession[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [modelsResult, metricsResult] = await Promise.allSettled([
          API.models(),
          API.monitoring()
        ]);

        if (modelsResult.status === 'fulfilled') {
          setModels(modelsResult.value);
        }

        if (metricsResult.status === 'fulfilled') {
          setMetrics(metricsResult.value);
        }

        if (modelsResult.status === 'rejected' && metricsResult.status === 'rejected') {
          setError('خطا در بارگذاری داده‌ها');
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('خطا در بارگذاری داده‌ها');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const ws = createWS('/ws');
    
    ws.onopen = () => {
      setWsStatus('connected');
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setWsData(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      setWsStatus('disconnected');
      console.log('WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      setWsStatus('disconnected');
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, []);

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
            wsStatus === 'connected' ? 'bg-green-100 text-green-800' :
            wsStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {wsStatus === 'connected' ? 'متصل' : wsStatus === 'connecting' ? 'در حال اتصال' : 'قطع شده'}
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
            <div className="text-2xl font-bold">{data?.models?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جلسات فعال</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
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