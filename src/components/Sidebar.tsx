import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  LayoutDashboard, TrendingUp, Database, FileText, Brain, 
  Activity, Settings, Users, ChevronRight, X, Layers,
  Monitor, BookOpen, Gauge, Sun, Moon, Wifi, WifiOff
} from 'lucide-react';

const cn = (...classes: any[]) => clsx(...classes);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isConnected?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "داشبورد اصلی",
    items: [
      { name: "نمای کلی", href: "/overview", icon: LayoutDashboard, description: "نمای کلی سیستم" },
      { name: "داشبورد پیشرفته", href: "/dashboard-advanced", icon: Gauge, description: "داشبورد تعاملی" }
    ]
  },
  {
    title: "تحلیل و گزارشات",
    items: [
      { name: "آنالیتیکس", href: "/analytics", icon: TrendingUp, description: "تحلیل داده‌ها" },
      { name: "لاگ‌ها", href: "/logs", icon: FileText, description: "گزارشات سیستم" }
    ]
  },
  {
    title: "داده و مدل‌ها",
    items: [
      { name: "دیتاست‌ها", href: "/data", icon: Database, description: "مدیریت دیتاست‌ها" },
      { name: "مدل‌ها", href: "/models", icon: Brain, description: "مدیریت مدل‌های AI" },
      { name: "آموزش", href: "/training", icon: BookOpen, description: "کنترل فرآیند آموزش" }
    ]
  },
  {
    title: "نظارت سیستم",
    items: [
      { name: "مانیتورینگ", href: "/monitoring", icon: Activity, description: "نظارت بلادرنگ" }
    ]
  },
  {
    title: "تیم و تنظیمات",
    items: [
      { name: "تیم", href: "/team", icon: Users, description: "مدیریت کاربران" },
      { name: "تنظیمات", href: "/settings", icon: Settings, description: "پیکربندی سیستم" }
    ]
  }
];

export default function Sidebar({ isOpen = false, onClose, isConnected = false }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => 
    localStorage.getItem('sidebar:collapsed') === 'true'
  );
  const [isDark, setIsDark] = useState(() => 
    localStorage.getItem('theme') === 'dark'
  );

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebar:collapsed', newCollapsed.toString());
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-gradient-to-l from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-white">هوش مصنوعی حقوقی</div>
              <div className="text-xs text-blue-100">پلتفرم ایران</div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!collapsed && (
            <button
              onClick={toggleTheme}
              className="p-1.5 text-white/90 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-1.5 text-white/90 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronRight 
              className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} 
            />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-2">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
            isConnected 
              ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
          )}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? 'متصل' : 'قطع اتصال'}
            <div className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {navigation.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1, type: 'spring' }}
            className="mb-6"
          >
            {!collapsed && (
              <div className="px-3 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
                <div className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  {group.title}
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href);
                
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300 shadow-lg border-r-4 border-blue-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    title={collapsed ? item.name : item.description}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
              <span>{isConnected ? 'سیستم فعال' : 'سیستم غیرفعال'}</span>
            </div>
            <span className="font-mono">v2.1.0</span>
          </div>
        ) : (
          <div className="text-center">
            <div className={cn('w-2 h-2 rounded-full mx-auto mb-1', isConnected ? 'bg-green-500' : 'bg-red-500')} />
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">v2.1</span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring' }}
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:right-0 bg-white/95 dark:bg-gray-800/95 border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-30 transition-all duration-300',
          collapsed ? 'w-20' : 'w-80'
        )}
        dir="rtl"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-80 bg-white/95 dark:bg-gray-800/95 border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl flex flex-col"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-l from-blue-600 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">هوش مصنوعی حقوقی</div>
                    <div className="text-xs text-blue-100">پلتفرم ایران</div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                {navigation.map((group, groupIndex) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1, type: 'spring' }}
                    className="mb-6"
                  >
                    <div className="px-3 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
                      <div className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                        {group.title}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveRoute(item.href);
                        
                        return (
                          <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={onClose}
                            className={cn(
                              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              active
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300 shadow-lg border-r-4 border-blue-500'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                            )}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {item.badge && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}