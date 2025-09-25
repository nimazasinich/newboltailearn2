import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Button } from './ui/Button';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  Filter,
  FileText,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Plus,
  BarChart3
} from 'lucide-react';

// Mock Data برای Datasets
const MOCK_DATASETS = [
  {
    id: 'legal-qa-persian',
    name: 'Persian Legal QA Dataset',
    source: 'Internal',
    samples: 15000,
    size_mb: 45.2,
    status: 'available',
    type: 'qa',
    description: 'مجموعه داده پرسش و پاسخ حقوقی فارسی شامل 15 هزار جفت پرسش و پاسخ',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    download_count: 45,
    usage_count: 12,
    quality_score: 94
  },
  {
    id: 'court-decisions',
    name: 'Court Decisions Dataset',
    source: 'Public',
    samples: 8500,
    size_mb: 32.1,
    status: 'available',
    type: 'classification',
    description: 'مجموعه تصمیمات دادگاه شامل رای‌های مختلف دادگاه‌های کشور',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    download_count: 78,
    usage_count: 23,
    quality_score: 89
  },
  {
    id: 'legal-docs',
    name: 'Legal Documents Collection',
    source: 'Mixed',
    samples: 12000,
    size_mb: 67.8,
    status: 'processing',
    type: 'text',
    description: 'مجموعه اسناد حقوقی متنوع شامل قراردادها، وصیت‌نامه‌ها و سایر اسناد',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    download_count: 23,
    usage_count: 5,
    quality_score: 76
  },
  {
    id: 'contracts-dataset',
    name: 'Contracts Analysis Dataset',
    source: 'Internal',
    samples: 6500,
    size_mb: 28.4,
    status: 'available',
    type: 'analysis',
    description: 'مجموعه داده تحلیل قراردادها برای شناسایی بندهای مهم',
    created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    download_count: 34,
    usage_count: 8,
    quality_score: 91
  },
  {
    id: 'case-law-db',
    name: 'Case Law Database',
    source: 'External',
    samples: 9800,
    size_mb: 54.6,
    status: 'error',
    type: 'reference',
    description: 'پایگاه داده رویه قضایی و سوابق دادگاهی',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    download_count: 12,
    usage_count: 2,
    quality_score: 65
  }
];

export default function DataPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load real data from API
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/datasets');
        if (response.ok) {
          const data = await response.json();
          setDatasets(data);
        } else {
          throw new Error('Failed to load datasets');
        }
      } catch (err) {
        console.error('Error loading datasets:', err);
        setError('خطا در بارگذاری دیتاست‌ها');
        // Fallback to mock data
        setDatasets(MOCK_DATASETS);
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, []);

  // فیلتر کردن دیتاست‌ها
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dataset.status === statusFilter;
    const matchesType = typeFilter === 'all' || dataset.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // تابع برای گرفتن رنگ وضعیت
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'downloading': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // تابع برای گرفتن آیکون وضعیت
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-3 h-3" />;
      case 'processing': return <RefreshCw className="w-3 h-3 animate-spin" />;
      case 'downloading': return <Download className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // تابع برای گرفتن متن وضعیت به فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'آماده';
      case 'processing': return 'در حال پردازش';
      case 'downloading': return 'در حال دانلود';
      case 'error': return 'خطا';
      default: return 'نامشخص';
    }
  };

  // تابع برای فرمت کردن حجم فایل
  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  // آمار
  const stats = {
    total: datasets.length,
    available: datasets.filter(d => d.status === 'available').length,
    processing: datasets.filter(d => d.status === 'processing').length,
    totalSamples: datasets.reduce((sum, d) => sum + d.samples, 0),
    totalSize: datasets.reduce((sum, d) => sum + d.size_mb, 0),
    avgQuality: datasets.reduce((sum, d) => sum + d.quality_score, 0) / datasets.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <div className="text-slate-600 dark:text-slate-400 font-persian text-lg">
            در حال بارگذاری دیتاست‌ها...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              مدیریت دیتاست‌ها
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              مدیریت و سازماندهی مجموعه داده‌های آموزشی
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => location.hash = '#/data-gallery'}>
              <Database className="w-4 h-4 mr-2" />
              گالری دیتاست
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              آپلود جدید
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">کل دیتاست‌ها</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">آماده استفاده</p>
                  <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">کل نمونه‌ها</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalSamples.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">حجم کل</p>
                  <p className="text-3xl font-bold text-orange-600">{formatFileSize(stats.totalSize)}</p>
                </div>
                <HardDrive className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجو در دیتاست‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="available">آماده</option>
                    <option value="processing">در حال پردازش</option>
                    <option value="downloading">در حال دانلود</option>
                    <option value="error">خطا</option>
                  </select>
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="all">همه انواع</option>
                  <option value="qa">پرسش و پاسخ</option>
                  <option value="classification">دسته‌بندی</option>
                  <option value="text">متن</option>
                  <option value="analysis">تحلیل</option>
                  <option value="reference">مرجع</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => (
            <Card key={dataset.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <p className="text-sm text-slate-500">{dataset.source} • {dataset.type}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(dataset.status)} flex items-center gap-1`}>
                    {getStatusIcon(dataset.status)}
                    {getStatusText(dataset.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {dataset.description}
                </p>

                {/* Progress for processing datasets */}
                {dataset.status === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>پیشرفت پردازش</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">نمونه‌ها:</span>
                    <span className="font-medium mr-2">{dataset.samples.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">حجم:</span>
                    <span className="font-medium mr-2">{formatFileSize(dataset.size_mb)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">دانلودها:</span>
                    <span className="font-medium mr-2">{dataset.download_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">کیفیت:</span>
                    <span className="font-medium mr-2">{dataset.quality_score}%</span>
                  </div>
                </div>

                {/* Quality Score Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>امتیاز کیفیت</span>
                    <span>{dataset.quality_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        dataset.quality_score >= 90 ? 'bg-green-500' :
                        dataset.quality_score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dataset.quality_score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {dataset.status === 'available' && (
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      دانلود
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    پیش‌نمایش
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    آمار
                  </Button>
                  {dataset.status === 'error' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      تلاش مجدد
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                هیچ دیتاستی یافت نشد
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'فیلترهای انتخابی را تغییر دهید یا دیتاست جدیدی آپلود کنید'
                  : 'هنوز هیچ دیتاستی آپلود نشده است'
                }
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  آپلود دیتاست
                </Button>
                <Button variant="outline" onClick={() => location.hash = '#/data-gallery'}>
                  <Database className="w-4 h-4 mr-2" />
                  گالری دیتاست
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Modal Placeholder */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>آپلود دیتاست جدید</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">فرم آپلود دیتاست در حال توسعه است...</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                    انصراف
                  </Button>
                  <Button onClick={() => setShowUploadModal(false)}>
                    آپلود
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}