import React from 'react';

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="در حال بارگذاری...">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`stat-${i}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="ms-4 space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`content-${i}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Announcement for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        در حال بارگذاری محتوا، لطفاً صبر کنید...
      </div>
    </div>
  );
}

export function InlineLoader({ 
  size = 'sm', 
  className = '', 
  text,
  variant = 'spinner' 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 ${sizeClasses[size]}`}></div>
  );

  const renderDots = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <div 
          key={i}
          className={`bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse ${sizeClasses[size]}`}
          style={{ animationDelay: `${i * 0.2}s` }}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-blue-600 dark:bg-blue-400 rounded animate-pulse ${sizeClasses[size]}`}></div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="status" aria-label="در حال بارگذاری...">
      {renderLoader()}
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
      )}
      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}