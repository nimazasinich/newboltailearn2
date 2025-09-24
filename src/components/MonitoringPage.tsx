import React, { useState, useEffect } from 'react';
import { ModernCard } from './ui/ModernCard';
import { SlimBadge } from './ui/SlimBadge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Zap,
  Database,
  Server,
  Globe,
  Shield,
  Clock,
  BarChart3,
  TrendingUp,
  Thermometer
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell
} from 'recharts';

// Mock Data برای System Monitoring
const MOCK_SYSTEM_METRICS = {
  cpu: {
    usage: 45,
    cores: 8,
    temperature: 68,
    frequency: 3.2
  },
  memory: {
    used: 12.4,
    total: 32,
    percentage: 38.75,
    available: 19.6
  },
  disk: {
    used: 245,
    total: 512,
    percentage: 47.8,
    read_speed: 1250,
    write_speed: 980
  },
  network: {
    download: 125.6,
    upload: 45.2,
    latency: 12,
    packets_sent: 15420,
    packets_received: 18650
  },
  gpu: {
    usage: 72,
    memory_used: 6.2,
    memory_total: 8,
    temperature: 75
  }
};

const MOCK_PERFORMANCE_HISTORY = Array.from({ length: 60 }, (_, i) => ({
  time: new Date(Date.now() - (59 - i) * 60000).toLocaleTimeString('fa-IR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }),
  cpu: Math.random() * 30 + 35,
  memory: Math.random() * 25 + 35,
  disk: Math.random() * 20 + 25,
  network: Math.random() * 100 + 50
}));

const MOCK_SYSTEM_HEALTH = [
  { name: 'CPU', value: 95, color: '#10b981' },
  { name: 'Memory', value: 88, color: '#3b82f6' },
  { name: 'Disk', value: 92, color: '#f59e0b' },
  { name: 'Network', value: 97, color: '#8b5cf6' }
];

const MOCK_SERVICES_STATUS = [
  { name: 'API Server', status: 'running', uptime: '15d 8h 23m', port: 8080, cpu: 12, memory: 256 },
  { name: 'Database', status: 'running', uptime: '15d 8h 23m', port: 5432, cpu: 8, memory: 512 },
  { name: 'Redis Cache', status: 'running', uptime: '15d 8h 23m', port: 6379, cpu: 3, memory: 128 },
  { name: 'Training Worker', status: 'running', uptime: '2d 14h 45m', port: 9000, cpu: 45, memory: 2048 },
  { name: 'WebSocket Server', status: 'stopped', uptime: '0m', port: 3001, cpu: 0, memory: 0 },
  { name: 'File Storage', status: 'running', uptime: '15d 8h 23m', port: 9001, cpu: 5, memory: 64 }
];

const MOCK_RECENT_ALERTS = [
  {
    id: 1,
    type: 'warning',
    message: 'استفاده از CPU بیش از 80% برای 5 دقیقه',
    timestamp: new Date(Date.now() - 300000),
    resolved: false
  },
  {
    id: 2,
    type: 'info',
    message: 'بک‌آپ خودکار با موفقیت انجام شد',
    timestamp: new Date(Date.now() - 3600000),
    resolved: true
  },
  {
    id: 3,
    type: 'error',
    message: 'WebSocket Server قطع شده است',
    timestamp: new Date(Date.now() - 7200000),
    resolved: false
  }
];

export default function MonitoringPage() {
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} TB`;
    }
    return `${bytes.toFixed(1)} GB`;
  };

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} GB/s`;
    }
    return `${speed.toFixed(0)} MB/s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'error';
      case 'warning': return 'warning';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-3 h-3" />;
      case 'stopped': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 mb-2">
              نظارت سیستم
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              مانیتورینگ لحظه‌ای منابع و عملکرد سرور
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">تازه‌سازی خودکار:</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  autoRefresh ? 'translate-x-5' : 'translate-x-1'
                } mt-1`} />
              </button>
            </div>
            <Button variant="outline" className="rounded-xl">
              <Settings className="w-4 h-4 ml-2" />
              تنظیمات
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <RefreshCw className="w-4 h-4 ml-2" />
              رفرش
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU */}
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_SYSTEM_METRICS.cpu.usage}%
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-2">CPU Usage</p>
            <div className="space-y-1 text-xs text-slate-500">
              <div>8 cores • {MOCK_SYSTEM_METRICS.cpu.frequency} GHz</div>
              <div className="flex items-center justify-center gap-1">
                <Thermometer className="w-3 h-3" />
                {MOCK_SYSTEM_METRICS.cpu.temperature}°C
              </div>
            </div>
          </ModernCard>

          {/* Memory */}
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_SYSTEM_METRICS.memory.percentage.toFixed(1)}%
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-2">Memory</p>
            <div className="space-y-1 text-xs text-slate-500">
              <div>{formatBytes(MOCK_SYSTEM_METRICS.memory.used)} / {formatBytes(MOCK_SYSTEM_METRICS.memory.total)}</div>
              <div>{formatBytes(MOCK_SYSTEM_METRICS.memory.available)} آزاد</div>
            </div>
          </ModernCard>

          {/* Disk */}
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mb-4">
              <HardDrive className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_SYSTEM_METRICS.disk.percentage.toFixed(1)}%
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-2">Storage</p>
            <div className="space-y-1 text-xs text-slate-500">
              <div>{formatBytes(MOCK_SYSTEM_METRICS.disk.used)} / {formatBytes(MOCK_SYSTEM_METRICS.disk.total)}</div>
              <div>R: {formatSpeed(MOCK_SYSTEM_METRICS.disk.read_speed)} W: {formatSpeed(MOCK_SYSTEM_METRICS.disk.write_speed)}</div>
            </div>
          </ModernCard>

          {/* Network */}
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4">
              <Wifi className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_SYSTEM_METRICS.network.latency}ms
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-2">Network</p>
            <div className="space-y-1 text-xs text-slate-500">
              <div>↓{MOCK_SYSTEM_METRICS.network.download}MB/s ↑{MOCK_SYSTEM_METRICS.network.upload}MB/s</div>
              <div>{MOCK_SYSTEM_METRICS.network.packets_received} بسته دریافتی</div>
            </div>
          </ModernCard>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Performance */}
          <div className="lg:col-span-2">
            <ModernCard variant="outlined">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  عملکرد لحظه‌ای
                </h3>
                <SlimBadge variant="success">زنده</SlimBadge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PERFORMANCE_HISTORY.slice(-20)}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                      domain={[0, 100]}
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
                      dataKey="cpu" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="url(#cpuGradient)"
                      name="CPU (%)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#memoryGradient)"
                      name="Memory (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ModernCard>
          </div>

          {/* System Health */}
          <ModernCard variant="outlined">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                سلامت سیستم
              </h3>
            </div>
            <div className="space-y-6">
              {MOCK_SYSTEM_HEALTH.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.value}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">93%</div>
                  <div className="text-sm text-slate-500">سلامت کلی سیستم</div>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Services Status */}
        <ModernCard variant="outlined">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              وضعیت سرویس‌ها
            </h3>
            <SlimBadge variant="info">{MOCK_SERVICES_STATUS.filter(s => s.status === 'running').length} فعال</SlimBadge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_SERVICES_STATUS.map((service, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">{service.name}</h4>
                  <SlimBadge variant={getStatusColor(service.status)} size="xs">
                    {getStatusIcon(service.status)}
                    {service.status === 'running' ? 'فعال' : 'متوقف'}
                  </SlimBadge>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>آپ‌تایم:</span>
                    <span className="font-medium">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>پورت:</span>
                    <span className="font-medium">{service.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU:</span>
                    <span className="font-medium">{service.cpu}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span className="font-medium">{service.memory}MB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Recent Alerts */}
        <ModernCard variant="outlined">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              هشدارهای اخیر
            </h3>
            <Button variant="outline" size="sm" className="rounded-lg">
              مشاهده همه
            </Button>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  alert.type === 'error' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{alert.message}</p>
                  <p className="text-xs text-slate-500">
                    {alert.timestamp.toLocaleString('fa-IR')}
                  </p>
                </div>
                {!alert.resolved && (
                  <Button variant="outline" size="sm" className="text-xs">
                    حل شده
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ModernCard>
      </div>
    </div>
  );
}