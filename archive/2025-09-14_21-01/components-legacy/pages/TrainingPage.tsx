/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import React from 'react';
import { TrainingManagement } from '../components/dashboard/TrainingManagement';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function TrainingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
          آموزش مدل‌ها
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          مدیریت و آموزش مدل‌های هوش مصنوعی حقوقی
        </p>
      </div>
      
      <ErrorBoundary>
        <TrainingManagement />
      </ErrorBoundary>
    </div>
  );
}