import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Database, Folder, Key, Sliders, Palette, Globe } from 'lucide-react';
import { apiClient } from '../services/api';

interface Settings {
  dataset_directory: { value: string; description: string };
  model_directory: { value: string; description: string };
  huggingface_token: { value: string; description: string };
  max_concurrent_training: { value: string; description: string };
  default_batch_size: { value: string; description: string };
  default_learning_rate: { value: string; description: string };
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiClient.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const settingsToSave = Object.entries(settings).reduce((acc, [key, setting]) => {
        acc[key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      await apiClient.updateSettings(settingsToSave);
      alert('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [key]: {
        ...prev![key as keyof Settings],
        value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">خطا در بارگذاری تنظیمات</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تنظیمات سیستم</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            پیکربندی و تنظیمات سیستم آموزش هوش مصنوعی
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSettings}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            بروزرسانی
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            ذخیره تنظیمات
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              سیستم
            </div>
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'training'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              آموزش
            </div>
          </button>
          <button
            onClick={() => setActiveTab('interface')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interface'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              رابط کاربری
            </div>
          </button>
        </nav>
      </div>

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5" />
              مسیرهای فایل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مسیر دیتاست‌ها
                </label>
                <input
                  type="text"
                  value={settings.dataset_directory.value}
                  onChange={(e) => updateSetting('dataset_directory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="./datasets"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {settings.dataset_directory.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مسیر مدل‌ها
                </label>
                <input
                  type="text"
                  value={settings.model_directory.value}
                  onChange={(e) => updateSetting('model_directory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="./models"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {settings.model_directory.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HuggingFace Token
              </label>
              <input
                type="password"
                value={settings.huggingface_token.value}
                onChange={(e) => updateSetting('huggingface_token', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {settings.huggingface_token.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Settings Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              پارامترهای آموزش
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  حداکثر آموزش همزمان
                </label>
                <input
                  type="number"
                  value={settings.max_concurrent_training.value}
                  onChange={(e) => updateSetting('max_concurrent_training', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {settings.max_concurrent_training.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Size پیش‌فرض
                </label>
                <input
                  type="number"
                  value={settings.default_batch_size.value}
                  onChange={(e) => updateSetting('default_batch_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="512"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {settings.default_batch_size.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Learning Rate پیش‌فرض
                </label>
                <input
                  type="number"
                  value={settings.default_learning_rate.value}
                  onChange={(e) => updateSetting('default_learning_rate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  step="0.0001"
                  min="0.0001"
                  max="1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {settings.default_learning_rate.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              راهنمای تنظیمات آموزش
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <h5 className="font-medium mb-2">حداکثر آموزش همزمان</h5>
                <p>تعداد مدل‌هایی که می‌توانند همزمان آموزش ببینند. مقدار بالاتر نیاز به منابع بیشتری دارد.</p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Batch Size</h5>
                <p>تعداد نمونه‌هایی که در هر مرحله آموزش پردازش می‌شوند. مقدار بالاتر سرعت را افزایش می‌دهد.</p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Learning Rate</h5>
                <p>نرخ یادگیری مدل. مقدار کمتر آموزش پایدارتر اما کندتر، مقدار بالاتر سریعتر اما ناپایدارتر.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interface Settings Tab */}
      {activeTab === 'interface' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              تنظیمات ظاهری
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تم رنگی
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="dark">تیره</option>
                  <option value="light">روشن</option>
                  <option value="auto">خودکار</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  زبان رابط کاربری
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              تنظیمات منطقه‌ای
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  منطقه زمانی
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                  <option value="UTC">UTC (UTC+0)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  فرمت تاریخ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="persian">شمسی (۱۴۰۳/۰۱/۰۱)</option>
                  <option value="gregorian">میلادی (2024/01/01)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button (Fixed at bottom) */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-6">
        <div className="flex justify-end gap-3">
          <button
            onClick={loadSettings}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            بازنشانی
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            ذخیره تنظیمات
          </button>
        </div>
      </div>
    </div>
  );
}