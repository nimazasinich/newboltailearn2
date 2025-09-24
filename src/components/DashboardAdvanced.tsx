import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  HardDrive,
  Database,
  Zap,
  BarChart3,
  PieChart,
  Target,
  Award,
  Layers,
  Settings
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
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

// Mock Data برای Dashboard
const MOCK_TRAINING_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  models_trained: Math.floor(Math.random() * 5) + 1,
  avg_accuracy: Math.random() * 0.3 + 0.7,
  total_epochs: Math.floor(Math.random() * 100) + 50
}));

const MOCK_MODEL_PERFORMANCE = [
  { name: 'Persian BERT', accuracy: 94, loss: 0.15, epochs: 50, type: 'persian-bert' },
  { name: 'Legal QA', accuracy: 91, loss: 0.18, epochs: 45, type: 'dora' },
  { name: 'Doc Classifier', accuracy: 88, loss: 0.22, epochs: 40, type: 'qr-adaptor' },
  { name: 'Contract Analysis', accuracy: 85, loss: 0.25, epochs: 35, type: 'persian-bert' },
  { name: 'Case Predictor', accuracy: 82, loss: 0.28, epochs: 30, type: 'dora' }
];

const MOCK_RESOURCE_USAGE = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  cpu: Math.floor(Math.random() * 40) + 30,
  memory: Math.floor(Math.random() * 30) + 40,
  gpu: Math.floor(Math.random() * 60) + 20,
  disk_io: Math.floor(Math.random() * 50) + 10
}));

const MOCK_MODEL_TYPES = [
  { name: 'Persian BERT', value: 12, color: '#3b82f6' },
  { name: 'DORA', value: 8, color: '#10b981' },
  { name: 'QR Adaptor', value: 6, color: '#f59e0b' },
  { name: 'Custom', value: 4, color: '#ef4444' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardAdvanced() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');

  // آمار کلی
  const totalModels = MOCK_MODEL_PERFORMANCE.length;
  const avgAccuracy = MOCK_MODEL_PERFORMANCE.reduce((sum, model) => sum + model.accuracy, 0) / totalModels;
  const activeTraining = 3;
  const completedToday = 2;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              داشبورد پیشرفته
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              تحلیل جامع عملکرد مدل‌ها و منابع سیستم
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="1d">24 ساعت</option>
              <option value="7d">7 روز</option>
              <option value="30d">30 روز</option>
              <option value="90d">90 روز</option>
            </select>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              تنظیمات
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">کل مدل‌ها</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalModels}</p>
                  <p className="text-xs text-green-600 mt-1">↗ +12% از ماه قبل</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">میانگین دقت</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{avgAccuracy.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1">↗ +3.2% از هفته قبل</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">در حال آموزش</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{activeTraining}</p>
                  <p className="text-xs text-blue-600 mt-1">فعال در حال حاضر</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">تکمیل امروز</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{completedToday}</p>
                  <p className="text-xs text-green-600 mt-1">↗ روند مثبت</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Training History */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                روند آموزش مدل‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_TRAINING_HISTORY.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('fa-IR')}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="models_trained" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="مدل‌های آموزش دیده"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Model Performance */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                عملکرد مدل‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_MODEL_PERFORMANCE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="accuracy" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="دقت (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Types Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                توزیع انواع مدل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={MOCK_MODEL_TYPES}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {MOCK_MODEL_TYPES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                استفاده از منابع (24 ساعت)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_RESOURCE_USAGE.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cpu" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="CPU (%)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Memory (%)"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gpu" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="GPU (%)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Models Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              مدل‌های فعال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">نام مدل</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">نوع</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">وضعیت</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">دقت</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">پیشرفت</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600 dark:text-slate-400">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_MODEL_PERFORMANCE.slice(0, 5).map((model, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Brain className="w-8 h-8 text-blue-500" />
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm text-slate-500">{model.epochs} epochs</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {model.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={index < 2 ? "default" : "secondary"} className={
                          index < 2 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }>
                          {index < 2 ? "تکمیل شده" : "در حال آموزش"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.accuracy}%</span>
                          <div className="w-16 h-2 bg-slate-200 rounded-full">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Progress value={index < 2 ? 100 : Math.random() * 100} className="w-20" />
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="outline" size="sm">
                          مشاهده
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}