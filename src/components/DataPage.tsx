import React, { useState, useEffect } from 'react';
import { Download, Upload, RefreshCw, Database, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiClient, connectSocket, onDatasetUpdated } from '../services/api';

interface Dataset {
  id: string;
  name: string;
  source: string;
  huggingface_id: string;
  samples: number;
  size_mb: number;
  status: 'available' | 'downloading' | 'processing' | 'error';
  local_path?: string;
  created_at: string;
  updated_at: string;
}

export function DataPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDatasets();
    connectSocket();

    const unsubscribeDatasetUpdate = onDatasetUpdated((data) => {
      setDatasets(prev => prev.map(dataset => 
        dataset.id === data.id 
          ? { ...dataset, status: data.status as any }
          : dataset
      ));
      
      if (data.status === 'available') {
        setDownloadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.id);
          return newSet;
        });
      }
    });

    return () => {
      unsubscribeDatasetUpdate();
    };
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await apiClient.getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDataset = async (id: string) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(id));
      await apiClient.downloadDataset(id);
      
      // Update local state immediately
      setDatasets(prev => prev.map(dataset => 
        dataset.id === id 
          ? { ...dataset, status: 'downloading' }
          : dataset
      ));
    } catch (error) {
      console.error('Failed to download dataset:', error);
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      alert('خطا در دانلود دیتاست');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'downloading':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'در دسترس';
      case 'downloading': return 'در حال دانلود';
      case 'processing': return 'در حال پردازش';
      case 'error': return 'خطا';
      default: return 'نامشخص';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'downloading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت دیتاست‌ها</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            دانلود و مدیریت دیتاست‌های حقوقی فارسی از HuggingFace
          </p>
        </div>
        <button
          onClick={loadDatasets}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          بروزرسانی
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">کل دیتاست‌ها</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{datasets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">در دسترس</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {datasets.filter(d => d.status === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">کل نمونه‌ها</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {datasets.reduce((sum, d) => sum + d.samples, 0).toLocaleString('fa-IR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Download className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">حجم کل</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {datasets.reduce((sum, d) => sum + d.size_mb, 0).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {datasets.map((dataset) => (
          <div key={dataset.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Dataset Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {dataset.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ExternalLink className="h-3 w-3" />
                  <a 
                    href={`https://huggingface.co/datasets/${dataset.huggingface_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {dataset.huggingface_id}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(dataset.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dataset.status)}`}>
                  {getStatusLabel(dataset.status)}
                </span>
              </div>
            </div>

            {/* Dataset Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {dataset.samples.toLocaleString('fa-IR')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">نمونه</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {dataset.size_mb.toFixed(1)} MB
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">حجم</div>
              </div>
            </div>

            {/* Progress Bar for Downloading */}
            {dataset.status === 'downloading' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>در حال دانلود...</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {dataset.status === 'available' && dataset.local_path ? (
                <div className="flex-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-2 rounded text-sm text-center">
                  دانلود شده
                </div>
              ) : (
                <button
                  onClick={() => handleDownloadDataset(dataset.id)}
                  disabled={downloadingIds.has(dataset.id) || dataset.status === 'downloading'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                >
                  {downloadingIds.has(dataset.id) || dataset.status === 'downloading' ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      در حال دانلود
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      دانلود
                    </>
                  )}
                </button>
              )}

              <a
                href={`https://huggingface.co/datasets/${dataset.huggingface_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              آخرین بروزرسانی: {new Date(dataset.updated_at).toLocaleDateString('fa-IR')}
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Information */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          درباره دیتاست‌های حقوقی فارسی
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">پرسش و پاسخ حقوقی ایران</h4>
            <p>مجموعه‌ای از پرسش‌ها و پاسخ‌های حقوقی به زبان فارسی که برای آموزش مدل‌های پرسش و پاسخ استفاده می‌شود.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">متون قوانین ایران</h4>
            <p>شامل متون قوانین و مقررات جمهوری اسلامی ایران که برای درک بهتر زمینه حقوقی استفاده می‌شود.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">تشخیص موجودیت فارسی</h4>
            <p>دیتاست بزرگ برای تشخیص موجودیت‌های نامدار در متون فارسی که شامل اسامی اشخاص، مکان‌ها و سازمان‌ها است.</p>
          </div>
        </div>
      </div>
    </div>
  );
}