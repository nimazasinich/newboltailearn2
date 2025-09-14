import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="relative">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
          <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          در حال بارگذاری...
        </p>
      </div>
    </div>
  );
}