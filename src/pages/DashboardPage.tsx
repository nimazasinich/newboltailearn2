import React from 'react';
import { Overview } from '../components/dashboard/Overview';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
          داشبورد سیستم
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          نمای کلی از عملکرد سیستم آموزش هوش مصنوعی حقوقی
        </p>
      </div>
      
      <ErrorBoundary>
        <Overview />
      </ErrorBoundary>
    </div>
  );
}