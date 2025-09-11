import React from 'react';
import { ProjectDownloader } from '../components/ProjectDownloader';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function DownloadPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
          دانلود پروژه
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          دانلود مدل‌های آموزش‌دیده و فایل‌های پروژه
        </p>
      </div>
      
      <ErrorBoundary>
        <ProjectDownloader />
      </ErrorBoundary>
    </div>
  );
}