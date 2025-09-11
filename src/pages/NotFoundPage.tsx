import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">
          ۴۰۴
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" tabIndex={-1}>
          صفحه پیدا نشد
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              صفحه اصلی
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app/dashboard" className="flex items-center gap-2">
              داشبورد
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}