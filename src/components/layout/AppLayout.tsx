import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Brain, Home, BarChart3, FileText, Menu, X, Database, Settings, Monitor, FileX, Users } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const navigation = [
  { name: 'نمای کلی', href: '/overview', icon: Home },
  { name: 'داشبورد پیشرفته', href: '/dashboard-advanced', icon: BarChart3 },
  { name: 'تحلیل‌ها', href: '/analytics', icon: BarChart3 },
  { name: 'مدیریت داده', href: '/data', icon: Database },
  { name: 'مدیریت مدل‌ها', href: '/models', icon: Brain },
  { name: 'آموزش مدل‌ها', href: '/training', icon: Brain },
  { name: 'نظارت سیستم', href: '/monitoring', icon: Monitor },
  { name: 'لاگ‌ها', href: '/logs', icon: FileX },
  { name: 'تیم', href: '/team', icon: Users },
  { name: 'تنظیمات', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        // Announce the page change to screen readers
        const announcement = `صفحه ${mainHeading.textContent} بارگذاری شد`;
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => document.body.removeChild(announcer), 1000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:grid lg:grid-cols-[20rem_1fr]" dir="rtl">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        پرش به محتوای اصلی
      </a>
      
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

          {/* Connection status */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                متصل به سرور
              </p>
            </div>
          </div>

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
                  <Icon className="me-3 h-5 w-5 flex-shrink-0" />
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
              <Home className="me-3 h-5 w-5 flex-shrink-0" />
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
        <main 
          id="main-content"
          className="flex-1 bg-gray-50 dark:bg-gray-900 p-6" 
          tabIndex={-1}
          role="main"
          aria-label="محتوای اصلی"
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}