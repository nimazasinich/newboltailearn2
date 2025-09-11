import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Brain, Home, BarChart3, FileText, Download, Menu, X, Database, Settings, Monitor, FileX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'داشبورد', href: '/app/dashboard', icon: Home },
  { name: 'آموزش مدل‌ها', href: '/app/training', icon: Brain },
  { name: 'تحلیل‌ها', href: '/app/analytics', icon: BarChart3 },
  { name: 'مدیریت داده', href: '/app/data', icon: Database },
  { name: 'مدیریت مدل‌ها', href: '/app/models', icon: Brain },
  { name: 'نظارت سیستم', href: '/app/monitoring', icon: Monitor },
  { name: 'لاگ‌ها', href: '/app/logs', icon: FileX },
  { name: 'مدیریت اسناد', href: '/app/documents', icon: FileText },
  { name: 'تنظیمات', href: '/app/settings', icon: Settings },
  { name: 'دانلود پروژه', href: '/app/download', icon: Download },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Focus management for route changes
  useEffect(() => {
    // Set focus to main heading when route changes
    const timer = setTimeout(() => {
      const mainHeading = document.querySelector('main h1');
      if (mainHeading) {
        (mainHeading as HTMLElement).setAttribute('tabindex', '-1');
        (mainHeading as HTMLElement).focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:grid lg:grid-cols-[20rem_1fr]" dir="rtl">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-800 border-s border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out lg:transform-none lg:static lg:w-auto lg:col-span-1
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="منوی اصلی"
        aria-expanded={sidebarOpen}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  سیستم حقوقی
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Legal AI System
                </p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(false)}
              aria-label="بستن منو"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  خوش آمدید، {user.name}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`
                  }
                  aria-current={({ isActive }) => isActive ? 'page' : undefined}
                >
                  <Icon className="ml-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <NavLink
              to="/"
              className="group flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            >
              <Home className="ml-3 h-5 w-5 flex-shrink-0" />
              صفحه اصلی
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col min-h-screen lg:col-span-1">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
              aria-label="باز کردن منو"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                سیستم حقوقی
              </h1>
            </div>

            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}