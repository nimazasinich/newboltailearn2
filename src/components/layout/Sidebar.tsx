import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  Database, 
  Settings, 
  Download, 
  Activity, 
  FileText, 
  TrendingUp,
  Users,
  X,
  Trophy,
  Clock,
  HardDrive,
  Layout,
  Monitor
} from 'lucide-react';
import { ChartBarIcon, BoltIcon, PlayCircleIcon, CloudArrowDownIcon } from '../ui/icons';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'نمای کلی', href: '/overview', icon: ChartBarIcon, description: 'نمای کلی سیستم' },
  { name: 'داشبورد پیشرفته', href: '/dashboard-advanced', icon: BoltIcon, description: 'داشبورد تعاملی' },
  { name: 'تحلیل‌ها', href: '/analytics', icon: TrendingUp, description: 'گزارش‌ها و آمار' },
  { name: 'دیتاست‌ها', href: '/data', icon: Database, description: 'مدیریت داده‌ها' },
  { name: 'گالری دیتاست‌ها', href: '/data-gallery', icon: CloudArrowDownIcon, description: 'دانلود دیتاست‌ها' },
  { name: 'لاگ‌ها', href: '/logs', icon: FileText, description: 'سوابق سیستم' },
  { name: 'مدل‌ها', href: '/models', icon: PlayCircleIcon, description: 'مدیریت مدل‌های AI' },
  { name: 'نظارت سیستم', href: '/monitoring', icon: Monitor, description: 'وضعیت سیستم' },
  { name: 'آموزش مدل‌ها', href: '/training', icon: Activity, description: 'مدیریت آموزش AI' },
  { name: 'تیم', href: '/team', icon: Users, description: 'اعضای تیم' },
  { name: 'تنظیمات', href: '/settings', icon: Settings, description: 'تنظیمات سیستم' },
  { name: 'دانلود پروژه', href: '/download', icon: Download, description: 'دانلود فایل‌ها' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 bg-white/80 backdrop-blur-xl border-l border-slate-200/50 shadow-2xl">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo/Brand */}
          <div className="flex items-center h-20 px-6 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  هوش مصنوعی حقوقی ایران
                </h1>
                <p className="text-sm text-blue-100">
                  Persian Legal AI
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href === '/dashboard-advanced' && location.pathname === '/dashboard');
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-primary-600 hover:bg-primary-50/80 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                  )}
                  title={item.description}
                  aria-label={`${item.name} - ${item.description}`}
                >
                  <Icon className={cn(
                    "icon icon-muted group-hover:text-primary-600",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <div className="flex flex-col">
                    <span className="font-vazir">{item.name}</span>
                    <span className="text-xs opacity-70 font-vazir">{item.description}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  هوش مصنوعی حقوقی ایران
                </h1>
                <p className="text-sm text-blue-100">
                  Persian Legal AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="بستن منو"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href === '/dashboard-advanced' && location.pathname === '/dashboard');
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                  )}
                  title={item.description}
                  aria-label={`${item.name} - ${item.description}`}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <div className="flex flex-col">
                    <span className="font-vazir">{item.name}</span>
                    <span className="text-xs opacity-70 font-vazir">{item.description}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}