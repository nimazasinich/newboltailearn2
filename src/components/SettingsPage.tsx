import React, { useState } from 'react';
import { ModernCard } from './ui/ModernCard';
import { SlimBadge } from './ui/SlimBadge';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Cpu,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

// Mock Data برای Settings
const MOCK_USER_SETTINGS = {
  profile: {
    name: 'احمد محمدی',
    email: 'ahmad.mohammadi@example.com',
    role: 'admin',
    avatar: null,
    timezone: 'Asia/Tehran',
    language: 'fa'
  },
  preferences: {
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      training_completed: true,
      system_alerts: true,
      weekly_reports: false
    },
    dashboard: {
      refresh_interval: 30,
      show_advanced_metrics: true,
      default_chart_type: 'area'
    }
  },
  system: {
    storage_used: 245,
    storage_total: 512,
    backup_enabled: true,
    auto_cleanup: true,
    debug_mode: false
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(MOCK_USER_SETTINGS);
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'profile', name: 'پروفایل', icon: User },
    { id: 'notifications', name: 'اعلانات', icon: Bell },
    { id: 'appearance', name: 'ظاهر', icon: Palette },
    { id: 'system', name: 'سیستم', icon: Settings },
    { id: 'security', name: 'امنیت', icon: Shield },
    { id: 'storage', name: 'ذخیره‌سازی', icon: Database }
  ];

  const updateSetting = (path: string, value: any) => {
    setHasChanges(true);
    // Implementation would update the settings state
  };

  const saveSettings = () => {
    // Implementation would save settings to backend
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 mb-2">
              تنظیمات
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              مدیریت تنظیمات حساب کاربری و سیستم
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <SlimBadge variant="warning">تغییرات ذخیره نشده</SlimBadge>
            )}
            <Button variant="outline" className="rounded-xl">
              <RefreshCw className="w-4 h-4 ml-2" />
              بازنشانی
            </Button>
            <Button 
              onClick={saveSettings}
              disabled={!hasChanges}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 ml-2" />
              ذخیره تغییرات
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ModernCard variant="outlined">
              <div className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </ModernCard>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <ModernCard variant="outlined">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    اطلاعات پروفایل
                  </h3>
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {settings.profile.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Upload className="w-3 h-3 ml-1" />
                          آپلود تصویر
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg text-red-600">
                          <Trash2 className="w-3 h-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          نام کامل
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          ایمیل
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          منطقه زمانی
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                          <option value="UTC">UTC (UTC+0)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          زبان
                        </label>
                        <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="fa">فارسی</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <ModernCard variant="outlined">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    تنظیمات اعلانات
                  </h3>
                  <div className="space-y-6">
                    {[
                      { key: 'email', label: 'اعلانات ایمیل', description: 'دریافت اعلانات از طریق ایمیل' },
                      { key: 'push', label: 'اعلانات push', description: 'نمایش اعلانات در مرورگر' },
                      { key: 'training_completed', label: 'تکمیل آموزش', description: 'اعلان هنگام تکمیل آموزش مدل' },
                      { key: 'system_alerts', label: 'هشدارهای سیستم', description: 'اعلان خطاها و مشکلات سیستم' },
                      { key: 'weekly_reports', label: 'گزارش هفتگی', description: 'دریافت گزارش عملکرد هفتگی' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">{item.label}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-colors ${
                            settings.preferences.notifications[item.key as keyof typeof settings.preferences.notifications]
                              ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.preferences.notifications[item.key as keyof typeof settings.preferences.notifications]
                              ? 'translate-x-7' : 'translate-x-1'
                          } mt-1`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <ModernCard variant="outlined">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    ظاهر و تم
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        تم رنگی
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', name: 'روشن', icon: Sun },
                          { id: 'dark', name: 'تیره', icon: Moon },
                          { id: 'system', name: 'سیستم', icon: Monitor }
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                              settings.preferences.theme === theme.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <theme.icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        فاصله بازخوانی داشبورد (ثانیه)
                      </label>
                      <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <option value="15">15 ثانیه</option>
                        <option value="30">30 ثانیه</option>
                        <option value="60">1 دقیقه</option>
                        <option value="300">5 دقیقه</option>
                      </select>
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Storage Tab */}
            {activeTab === 'storage' && (
              <ModernCard variant="outlined">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    مدیریت ذخیره‌سازی
                  </h3>
                  <div className="space-y-6">
                    {/* Storage Usage */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">استفاده از فضای ذخیره‌سازی</span>
                        <span className="text-sm text-slate-600">
                          {settings.system.storage_used} GB / {settings.system.storage_total} GB
                        </span>
                      </div>
                      <Progress 
                        value={(settings.system.storage_used / settings.system.storage_total) * 100} 
                        className="mb-2"
                      />
                      <div className="text-xs text-slate-500">
                        {settings.system.storage_total - settings.system.storage_used} GB آزاد
                      </div>
                    </div>

                    {/* Storage Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: 'مدل‌ها', size: 120, color: 'bg-blue-500' },
                        { name: 'دیتاست‌ها', size: 85, color: 'bg-emerald-500' },
                        { name: 'لاگ‌ها', size: 40, color: 'bg-amber-500' }
                      ].map((category) => (
                        <div key={category.name} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-2xl font-bold">{category.size} GB</div>
                        </div>
                      ))}
                    </div>

                    {/* Cleanup Options */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">گزینه‌های پاکسازی</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'پاکسازی خودکار فایل‌های موقت', enabled: true },
                          { label: 'حذف لاگ‌های قدیمی (بیش از 30 روز)', enabled: true },
                          { label: 'فشرده‌سازی مدل‌های تکمیل شده', enabled: false }
                        ].map((option, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{option.label}</span>
                            <button
                              className={`w-10 h-6 rounded-full transition-colors ${
                                option.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                option.enabled ? 'translate-x-5' : 'translate-x-1'
                              } mt-1`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button variant="outline" className="rounded-lg">
                        <Download className="w-4 h-4 ml-2" />
                        بک‌آپ
                      </Button>
                      <Button variant="outline" className="rounded-lg">
                        <RefreshCw className="w-4 h-4 ml-2" />
                        پاکسازی
                      </Button>
                      <Button variant="outline" className="rounded-lg text-red-600">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف همه
                      </Button>
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <ModernCard variant="outlined">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    تنظیمات سیستم
                  </h3>
                  <div className="space-y-6">
                    {/* System Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-800 dark:text-emerald-200">سیستم سالم</span>
                        </div>
                        <div className="text-sm text-emerald-600">همه سرویس‌ها فعال</div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800 dark:text-blue-200">CPU: 45%</span>
                        </div>
                        <div className="text-sm text-blue-600">عملکرد نرمال</div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-800 dark:text-purple-200">DB: متصل</span>
                        </div>
                        <div className="text-sm text-purple-600">پاسخ‌دهی سریع</div>
                      </div>
                    </div>

                    {/* System Settings */}
                    <div className="space-y-4">
                      {[
                        { label: 'بک‌آپ خودکار', description: 'بک‌آپ روزانه از داده‌ها', enabled: true },
                        { label: 'حالت دیباگ', description: 'فعال‌سازی لاگ‌های تفصیلی', enabled: false },
                        { label: 'نظارت عملکرد', description: 'جمع‌آوری آمار عملکرد', enabled: true }
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{setting.label}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
                          </div>
                          <button
                            className={`w-12 h-6 rounded-full transition-colors ${
                              setting.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              setting.enabled ? 'translate-x-7' : 'translate-x-1'
                            } mt-1`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <ModernCard variant="outlined">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    امنیت و دسترسی
                  </h3>
                  <div className="space-y-6">
                    {/* Password Section */}
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-4">تغییر رمز عبور</h4>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="رمز عبور فعلی"
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <input
                          type="password"
                          placeholder="رمز عبور جدید"
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <input
                          type="password"
                          placeholder="تکرار رمز عبور جدید"
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <Button className="rounded-lg">
                          تغییر رمز عبور
                        </Button>
                      </div>
                    </div>

                    {/* Security Alerts */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">فعالیت‌های اخیر</h4>
                      {[
                        { action: 'ورود موفق', time: '5 دقیقه پیش', ip: '192.168.1.100', status: 'success' },
                        { action: 'تغییر تنظیمات', time: '2 ساعت پیش', ip: '192.168.1.100', status: 'info' },
                        { action: 'تلاش ورود ناموفق', time: '1 روز پیش', ip: '10.0.0.50', status: 'warning' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              activity.status === 'success' ? 'bg-emerald-500' :
                              activity.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">{activity.action}</div>
                              <div className="text-xs text-slate-500">{activity.ip}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">{activity.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}