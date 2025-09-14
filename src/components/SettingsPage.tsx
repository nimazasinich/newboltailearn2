import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { API } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import { Settings, Save, Moon, Sun, Globe, Bell, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    language: 'fa',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await API.getSettings();
        setSettings(data || settings);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('خطا در بارگذاری تنظیمات');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.updateSettings(settings);
      alert('تنظیمات با موفقیت ذخیره شد');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تنظیمات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          پیکربندی سیستم و تنظیمات کاربری
        </p>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              ظاهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تم
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                    className="text-blue-600"
                  />
                  <Sun className="h-4 w-4" />
                  روشن
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                    className="text-blue-600"
                  />
                  <Moon className="h-4 w-4" />
                  تیره
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                زبان
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              اعلان‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  فعال‌سازی اعلان‌ها
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  دریافت اعلان‌های سیستم و آموزش
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="text-blue-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  بروزرسانی خودکار
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  بروزرسانی خودکار داده‌ها
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                className="text-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                فاصله بروزرسانی (ثانیه)
              </label>
              <input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                min="5"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 ml-2" />
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </Button>
        </div>
      </div>
    </div>
  );
}