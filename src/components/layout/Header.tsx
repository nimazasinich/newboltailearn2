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
    <header className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-lg border-b border-slate-600/50 shadow-lg sticky top-0 z-40">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 lg:hidden transition-all duration-300"
            aria-expanded="false"
            aria-label="باز کردن منو"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop logo - hidden on mobile since it's in sidebar */}
          <div className="hidden lg:flex items-center">
            <h1 className="text-2xl font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              سیستم آموزش هوش مصنوعی حقوقی
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="default" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                <Home className="h-5 w-5 ml-2" />
                صفحه اصلی
              </Button>
            </Link>
            
            {user && (
              <div className="text-sm text-slate-300 font-medium">
                خوش آمدید، {user.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}