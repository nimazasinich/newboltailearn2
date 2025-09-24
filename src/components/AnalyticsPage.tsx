import React, { useState, useEffect } from 'react';
import { ModernCard } from './ui/ModernCard';
import { SlimBadge } from './ui/SlimBadge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Brain, 
  Database,
  Clock,
  Target,
  Zap,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Mock Data برای Analytics
const MOCK_PERFORMANCE_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('fa-IR'),
  models_trained: Math.floor(Math.random() * 8) + 2,
  avg_accuracy: Math.random() * 0.2 + 0.8,
  training_hours: Math.floor(Math.random() * 12) + 4,
  success_rate: Math.random() * 0.15 + 0.85
}));

const MOCK_MODEL_ACCURACY = [
  { model: 'Persian BERT', accuracy: 94.2, improvement: 2.3, trend: 'up' },
  { model: 'Legal QA', accuracy: 91.8, improvement: -0.5, trend: 'down' },
  { model: 'Doc Classifier', accuracy: 88.5, improvement: 4.1, trend: 'up' },
  { model: 'Contract Analyzer', accuracy: 85.7, improvement: 1.8, trend: 'up' },
  { model: 'Case Predictor', accuracy: 82.3, improvement: -1.2, trend: 'down' }
];

const MOCK_USAGE_STATS = [
  { name: 'BERT Models', value: 45, color: '#3b82f6' },
  { name: 'DORA Models', value: 30, color: '#10b981' },
  { name: 'QR Adaptors', value: 20, color: '#f59e0b' },
  { name: 'Custom Models', value: 5, color: '#ef4444' }
];

const MOCK_TRAINING_EFFICIENCY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  cpu_usage: Math.floor(Math.random() * 40) + 30,
  gpu_usage: Math.floor(Math.random() * 60) + 20,
  memory_usage: Math.floor(Math.random() * 30) + 40,
  training_speed: Math.floor(Math.random() * 50) + 50
}));

const MOCK_DATASET_USAGE = [
  { dataset: 'Legal QA Persian', usage: 85, models: 12, last_used: '2 ساعت پیش' },
  { dataset: 'Court Decisions', usage: 72, models: 8, last_used: '5 ساعت پیش' },
  { dataset: 'Legal Documents', usage: 64, models: 6, last_used: '1 روز پیش' },
  { dataset: 'Contracts', usage: 58, models: 4, last_used: '2 روز پیش' },
  { dataset: 'Case Law', usage: 34, models: 2, last_used: '1 هفته پیش' }
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');

  // آمار کلی
  const totalModels = 30;
  const avgAccuracy = MOCK_MODEL_ACCURACY.reduce((sum, model) => sum + model.accuracy, 0) / MOCK_MODEL_ACCURACY.length;
  const totalTrainingHours = MOCK_PERFORMANCE_DATA.reduce((sum, day) => sum + day.training_hours, 0);
  const avgSuccessRate = MOCK_PERFORMANCE_DATA.reduce((sum, day) => sum + day.success_rate, 0) / MOCK_PERFORMANCE_DATA.length * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 mb-2">
              تحلیل‌ها و گزارش‌ها
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              آمار جامع عملکرد مدل‌ها و سیستم
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border-0 rounded-xl shadow-sm"
            >
              <option value="7d">7 روز گذشته</option>
              <option value="30d">30 روز گذشته</option>
              <option value="90d">90 روز گذشته</option>
            </select>
            <Button variant="outline" className="rounded-xl">
              <Download className="w-4 h-4 ml-2" />
              گزارش PDF
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <RefreshCw className="w-4 h-4 ml-2" />
              به‌روزرسانی
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{totalModels}</h3>
            <p className="text-slate-600 dark:text-slate-400">کل مدل‌ها</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">+12% این ماه</span>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{avgAccuracy.toFixed(1)}%</h3>
            <p className="text-slate-600 dark:text-slate-400">میانگین دقت</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">+2.3% هفته گذشته</span>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mb-4">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{totalTrainingHours}</h3>
            <p className="text-slate-600 dark:text-slate-400">ساعت آموزش</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">+8% این ماه</span>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{avgSuccessRate.toFixed(1)}%</h3>
            <p className="text-slate-600 dark:text-slate-400">نرخ موفقیت</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-rose-600 font-medium">-1.2% هفته گذشته</span>
            </div>
          </ModernCard>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Trend */}
          <ModernCard variant="outlined">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                روند عملکرد ماهانه
              </h3>
              <SlimBadge variant="info">30 روز گذشته</SlimBadge>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PERFORMANCE_DATA.slice(-7)}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avg_accuracy" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#accuracyGradient)"
                    name="میانگین دقت"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ModernCard>

          {/* Model Usage Distribution */}
          <ModernCard variant="outlined">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                توزیع استفاده از مدل‌ها
              </h3>
              <SlimBadge variant="neutral">کل مدل‌ها</SlimBadge>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_USAGE_STATS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {MOCK_USAGE_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ModernCard>
        </div>

        {/* Model Accuracy Comparison */}
        <ModernCard variant="outlined">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              مقایسه دقت مدل‌ها
            </h3>
            <SlimBadge variant="success">بروزرسانی شده</SlimBadge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {MOCK_MODEL_ACCURACY.map((model, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">{model.model}</h4>
                  <SlimBadge variant={model.trend === 'up' ? 'success' : 'error'} size="xs">
                    {model.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 ml-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 ml-1" />
                    )}
                    {Math.abs(model.improvement)}%
                  </SlimBadge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">دقت</span>
                    <span className="font-semibold">{model.accuracy}%</span>
                  </div>
                  <Progress value={model.accuracy} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Training Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ModernCard variant="outlined">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  کارایی آموزش (24 ساعت)
                </h3>
                <SlimBadge variant="warning">زنده</SlimBadge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_TRAINING_EFFICIENCY.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cpu_usage" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="CPU (%)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gpu_usage" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="GPU (%)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="training_speed" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="سرعت آموزش"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ModernCard>
          </div>

          {/* Dataset Usage */}
          <ModernCard variant="outlined">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                استفاده از دیتاست‌ها
              </h3>
            </div>
            <div className="space-y-4">
              {MOCK_DATASET_USAGE.map((dataset, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {dataset.dataset}
                    </h4>
                    <SlimBadge variant="neutral" size="xs">{dataset.models} مدل</SlimBadge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={dataset.usage} className="h-1.5" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{dataset.usage}% استفاده</span>
                      <span>{dataset.last_used}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
}