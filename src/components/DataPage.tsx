import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { apiService } from '../services/api';
import { Database, Download, Upload, FileText, AlertTriangle } from 'lucide-react';

export default function DataPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDatasets();
        setDatasets(data || []);
      } catch (err) {
        console.error('Failed to load datasets:', err);
        setError('خطا در بارگذاری مجموعه داده‌ها');
        // Fallback data
        setDatasets([
          {
            id: '1',
            name: 'قوانین مدنی ایران',
            size: '245 MB',
            samples: 15000,
            status: 'آماده',
            lastUpdated: '۱۴۰۲/۱۲/۰۵'
          },
          {
            id: '2', 
            name: 'قوانین جزایی',
            size: '180 MB',
            samples: 12500,
            status: 'در حال پردازش',
            lastUpdated: '۱۴۰۲/۱۲/۰۳'
          },
          {
            id: '3',
            name: 'آیین دادرسی مدنی',
            size: '95 MB', 
            samples: 8200,
            status: 'آماده',
            lastUpdated: '۱۴۰۲/۱۱/۲۸'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, []);

  const handleDownload = async (datasetId: string) => {
    try {
      await apiService.downloadDataset(datasetId);
      alert('دانلود شروع شد');
    } catch (err) {
      console.error('Download failed:', err);
      alert('خطا در دانلود');
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت داده‌ها</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            مدیریت مجموعه داده‌های آموزشی و اسناد حقوقی
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 ml-2" />
          آپلود داده جدید
        </Button>
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

      <div className="grid gap-4">
        {datasets.map((dataset) => (
          <Card key={dataset.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {dataset.name}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>حجم: {dataset.size}</span>
                    <span>تعداد نمونه: {dataset.samples?.toLocaleString('fa-IR')}</span>
                    <span>آخرین بروزرسانی: {dataset.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(dataset.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dataset.status === 'آماده' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {dataset.status}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {datasets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              هیچ مجموعه داده‌ای یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              برای شروع، اولین مجموعه داده خود را آپلود کنید
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 ml-2" />
              آپلود داده جدید
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}