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
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'داشبورد اصلی', href: '/app/dashboard', icon: BarChart3, description: 'نمای کلی سیستم' },
  { name: 'آموزش مدل‌ها', href: '/app/training', icon: Brain, description: 'مدیریت آموزش AI' },
  { name: 'نظارت سیستم', href: '/app/monitoring', icon: Activity, description: 'وضعیت سیستم' },
  { name: 'تحلیل‌ها', href: '/app/analytics', icon: TrendingUp, description: 'گزارش‌ها و آمار' },
  { name: 'مدل‌ها', href: '/app/models', icon: Brain, description: 'مدیریت مدل‌های AI' },
  { name: 'دیتاست‌ها', href: '/app/data', icon: Database, description: 'مدیریت داده‌ها' },
  { name: 'لاگ‌ها', href: '/app/logs', icon: FileText, description: 'سوابق سیستم' },
  { name: 'تیم', href: '/app/team', icon: Users, description: 'اعضای تیم' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
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
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
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
              const isActive = location.pathname === item.href;
              
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