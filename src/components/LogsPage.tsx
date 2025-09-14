import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { apiService } from '../services/api';
import { websocketService } from '../services/websocket';
import { FileText, Filter, Search, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await apiService.getLogs({ limit: 100 });
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to load logs:', err);
        // Fallback data
        setLogs([
          {
            id: 1,
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'سیستم با موفقیت راه‌اندازی شد',
            source: 'system'
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            level: 'warning',
            message: 'استفاده از حافظه بالا است',
            source: 'monitoring'
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            level: 'error',
            message: 'خطا در اتصال به پایگاه داده',
            source: 'database'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Real-time log updates
  useEffect(() => {
    websocketService.connect();

    const handleLogUpdate = (data: any) => {
      setLogs(prev => [data, ...prev].slice(0, 100));
    };

    websocketService.on('log_update', handleLogUpdate);

    return () => {
      websocketService.off('log_update', handleLogUpdate);
    };
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لاگ‌های سیستم</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          مشاهده و نظارت بر رویدادهای سیستم
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فیلترها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'error' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                خطا
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'warning' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                هشدار
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'info' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                اطلاعات
              </button>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در لاگ‌ها..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>لاگ‌های اخیر ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {log.source}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {log.message}
                  </p>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                هیچ لاگی یافت نشد
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}