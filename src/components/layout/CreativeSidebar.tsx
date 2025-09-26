import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Zap,
  TrendingUp,
  Database,
  Download,
  FileText,
  PlayCircle,
  Monitor,
  Activity,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Target,
  Layers
} from 'lucide-react';

const navigationItems = [
  { 
    name: 'نمای کلی', 
    href: '/overview', 
    icon: BarChart3, 
    description: 'داشبورد اصلی',
    gradient: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  { 
    name: 'داشبورد پیشرفته', 
    href: '/dashboard-advanced', 
    icon: Zap, 
    description: 'تحلیل پیشرفته',
    gradient: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  { 
    name: 'تحلیل‌ها', 
    href: '/analytics', 
    icon: TrendingUp, 
    description: 'گزارش‌ها و آمار',
    gradient: 'from-emerald-400 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  { 
    name: 'دیتاست‌ها', 
    href: '/data', 
    icon: Database, 
    description: 'مدیریت داده‌ها',
    gradient: 'from-amber-400 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20'
  },
  { 
    name: 'گالری دیتاست‌ها', 
    href: '/data-gallery', 
    icon: Download, 
    description: 'دانلود دیتاست‌ها',
    gradient: 'from-teal-400 to-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20'
  },
  { 
    name: 'لاگ‌ها', 
    href: '/logs', 
    icon: FileText, 
    description: 'سوابق سیستم',
    gradient: 'from-slate-400 to-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20'
  },
  { 
    name: 'مدل‌ها', 
    href: '/models', 
    icon: PlayCircle, 
    description: 'مدیریت مدل‌های AI',
    gradient: 'from-indigo-400 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  { 
    name: 'نظارت سیستم', 
    href: '/monitoring', 
    icon: Monitor, 
    description: 'وضعیت سیستم',
    gradient: 'from-rose-400 to-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20'
  },
  { 
    name: 'آموزش مدل‌ها', 
    href: '/training', 
    icon: Activity, 
    description: 'مدیریت آموزش AI',
    gradient: 'from-cyan-400 to-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
  },
  { 
    name: 'تیم', 
    href: '/team', 
    icon: Users, 
    description: 'اعضای تیم',
    gradient: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  { 
    name: 'تنظیمات', 
    href: '/settings', 
    icon: Settings, 
    description: 'تنظیمات سیستم',
    gradient: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
  },
  { 
    name: 'دانلود پروژه', 
    href: '/download', 
    icon: Download, 
    description: 'دانلود فایل‌ها',
    gradient: 'from-pink-400 to-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  }
];

export function CreativeSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      className="relative bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  AI Legal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  v2.1.0
                </p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <div key={item.href} className="relative">
              <NavLink
                to={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive }) => `
                  relative group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? `${item.bgColor} shadow-lg` 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with gradient background */}
                <div className={`
                  relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                    : 'bg-slate-100 dark:bg-slate-800 group-hover:scale-110'
                  }
                `}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                  
                  {/* Glow effect */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-lg opacity-30 -z-10`} />
                  )}
                </div>

                {/* Text content */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={itemVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2 }}
                      className="flex-1"
                    >
                      <div className={`
                        font-medium transition-colors
                        ${isActive 
                          ? 'text-slate-900 dark:text-white' 
                          : 'text-slate-700 dark:text-slate-300'
                        }
                      `}>
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover tooltip for collapsed state */}
                {isCollapsed && hoveredItem === item.href && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.9 }}
                    className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50"
                  >
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl shadow-lg whitespace-nowrap">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                      {/* Arrow */}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                        <div className="w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </NavLink>

              {/* Animated border effect */}
              {isActive && (
                <motion.div
                  layoutId="activeBorder"
                  className="absolute inset-0 rounded-2xl border-2 border-gradient-to-r from-blue-500 to-purple-600 opacity-50"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm font-bold text-emerald-600">5</div>
                <div className="text-xs text-emerald-500">فعال</div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm font-bold text-blue-600">12</div>
                <div className="text-xs text-blue-500">مدل</div>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm font-bold text-purple-600">94%</div>
                <div className="text-xs text-purple-500">دقت</div>
              </div>
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">ع</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  عضو تیم
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  آنلاین
                </div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">ع</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

