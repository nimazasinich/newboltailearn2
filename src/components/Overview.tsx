import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { ZenProgress } from './ui/ZenProgress';
import { Button } from './ui/Button';
import { API, SystemMetrics, TrainingSession, Dataset } from '../services/api';
import { 
  Activity, 
  Brain, 
  Database,
  TrendingUp, 
  Cpu,
  RefreshCw,
  CheckCircle,
  Monitor,
  BarChart3,
  PlayCircle,
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react';
import { PlayCircleIcon, CloudArrowDownIcon } from './ui/icons';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// Mock Data برای تست
const MOCK_MODELS = [
  {
    id: 1,
    name: 'Persian BERT Legal',
    type: 'persian-bert',
    status: 'training' as const,
    accuracy: 0.89,
    loss: 0.23,
    epochs: 50,
    current_epoch: 32,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Legal QA Model',
    type: 'dora',
    status: 'completed' as const,
    accuracy: 0.94,
    loss: 0.15,
    epochs: 30,
    current_epoch: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Document Classifier',
    type: 'qr-adaptor',
    status: 'training' as const,
    accuracy: 0.76,
    loss: 0.35,
    epochs: 40,
    current_epoch: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_DATASETS = [
  {
    id: 'legal-qa-persian',
    name: 'Persian Legal QA Dataset',
    samples: 15000,
    size_mb: 45.2,
    status: 'available' as const,
    source: 'Internal',
    description: 'مجموعه داده پرسش و پاسخ حقوقی فارسی'
  },
  {
    id: 'court-decisions',
    name: 'Court Decisions Dataset',
    samples: 8500,
    size_mb: 32.1,
    status: 'available' as const,
    source: 'Public',
    description: 'مجموعه تصمیمات دادگاه'
  }
];

const MOCK_SYSTEM_METRICS = {
  cpu: 45,
  memory: { used: 6.2, total: 16, percentage: 39 },
  disk: { used: 120, total: 500, percentage: 24 },
  uptime: 86400,
  status: 'ok' as const
};

export default function Overview() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(MOCK_SYSTEM_METRICS);
  const [models, setModels] = useState<TrainingSession[]>(MOCK_MODELS);
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // آمار محاسبه شده
  const stats = {
    totalModels: models.length,
    activeTraining: models.filter(m => m.status === 'training').length,
    completedToday: models.filter(m => m.status === 'completed').length,
    totalDatasets: datasets.length,
    systemHealth: systemMetrics ? Math.min(100, Math.max(0, 100 - (systemMetrics.cpu + systemMetrics.memory.percentage) / 2)) : 0,
    cpuUsage: systemMetrics?.cpu || 0,
    memoryUsage: systemMetrics?.memory?.percentage || 0,
    successRate: models.length > 0 ? (models.filter(m => m.status === 'completed').length / models.length * 100) : 0,
    avgAccuracy: models.filter(m => m.accuracy && m.status === 'completed').length > 0
      ? (models.filter(m => m.accuracy && m.status === 'completed')
          .reduce((sum, m) => sum + (m.accuracy || 0), 0) / 
         models.filter(m => m.accuracy && m.status === 'completed').length * 100)
      : 0
  };

  // داده نمودار
  const chartData = [
    { name: 'تکمیل شده', value: models.filter(m => m.status === 'completed').length, color: '#10b981' },
    { name: 'در حال آموزش', value: models.filter(m => m.status === 'training').length, color: '#3b82f6' },
    { name: 'متوقف شده', value: models.filter(m => m.status === 'paused').length, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const performanceData = Array.from({ length: 7 }, (_, i) => ({
    day: `${i + 1}`,
    cpu: Math.floor(Math.random() * 30 + 30),
    memory: Math.floor(Math.random() * 25 + 35),
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header ساده */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              هوش مصنوعی حقوقی فارسی
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              سیستم مدیریت و آموزش مدل‌های هوش مصنوعی
            </p>
            
            {/* آمار کلی */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalModels}</div>
                <div className="text-sm text-slate-500">مدل‌ها</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(0)}%</div>
                <div className="text-sm text-slate-500">نرخ موفقیت</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.avgAccuracy.toFixed(0)}%</div>
                <div className="text-sm text-slate-500">دقت میانگین</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.systemHealth.toFixed(0)}%</div>
                <div className="text-sm text-slate-500">سلامت سیستم</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">مدل‌های فعال</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.activeTraining}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">دیتاست‌ها</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalDatasets}
                  </p>
                </div>
                <Database className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">تکمیل شده</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.completedToday}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">CPU</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.cpuUsage}%
                  </p>
                </div>
                <Cpu className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نمودارها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                وضعیت مدل‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    داده‌ای موجود نیست
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                عملکرد هفتگی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="CPU (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Memory (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* مدل‌های فعال و دسترسی سریع */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* مدل‌های فعال */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    مدل‌های در حال آموزش
                  </div>
                  <Badge variant="secondary">{stats.activeTraining} فعال</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {models.filter(m => m.status === 'training').length > 0 ? (
                  <div className="space-y-4">
                    {models.filter(m => m.status === 'training').map((model) => (
                      <div key={model.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Brain className="w-8 h-8 text-blue-500" />
                            <div>
                              <h4 className="font-medium">{model.name}</h4>
                              <p className="text-sm text-slate-500">{model.type}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            <PlayCircle className="w-3 h-3 mr-1" />
                            آموزش
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>پیشرفت</span>
                            <span>{model.current_epoch}/{model.epochs}</span>
                          </div>
                          <ZenProgress 
                            value={(model.current_epoch / model.epochs) * 100} 
                            variant="gradient"
                            organic={true}
                            animated={true}
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>دقت: {model.accuracy ? (model.accuracy * 100).toFixed(1) + '%' : '--'}</span>
                            <span>خطا: {model.loss?.toFixed(3) || '--'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">هیچ مدلی در حال آموزش نیست</h3>
                    <p className="text-slate-500 mb-4">برای شروع آموزش، از منوی آموزش استفاده کنید</p>
                    <Button onClick={() => location.hash = '#/training'}>
                      <PlayCircleIcon className="w-4 h-4 mr-2" />
                      شروع آموزش
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* دسترسی سریع */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                دسترسی سریع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: 'مدیریت مدل‌ها',
                    icon: <Brain className="w-5 h-5" />,
                    href: '#/models',
                    color: 'text-blue-600'
                  },
                  {
                    title: 'گالری دیتاست',
                    icon: <CloudArrowDownIcon className="w-5 h-5" />,
                    href: '#/data-gallery',
                    color: 'text-green-600'
                  },
                  {
                    title: 'تحلیل‌ها',
                    icon: <BarChart3 className="w-5 h-5" />,
                    href: '#/analytics',
                    color: 'text-purple-600'
                  },
                  {
                    title: 'نظارت سیستم',
                    icon: <Monitor className="w-5 h-5" />,
                    href: '#/monitoring',
                    color: 'text-orange-600'
                  }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => location.hash = action.href}
                    className="w-full p-3 text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={action.color}>
                          {action.icon}
                        </div>
                        <span className="font-medium">{action.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}