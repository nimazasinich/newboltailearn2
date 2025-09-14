import React from 'react';

// src/components/ui/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-75"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            در حال بارگذاری...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            لطفاً صبر کنید
          </p>
        </div>
        
        {/* Pulsing dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </div>
      
      <style jsx>{`
        .animation-delay-75 {
          animation-delay: 75ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}