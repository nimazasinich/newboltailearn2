import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-expanded="false"
            aria-label="باز کردن منو"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop logo - hidden on mobile since it's in sidebar */}
          <div className="hidden lg:flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              سیستم آموزش هوش مصنوعی حقوقی
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="default">
                <Home className="h-5 w-5 ml-2" />
                صفحه اصلی
              </Button>
            </Link>
            
            {user && (
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                خوش آمدید، {user.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}