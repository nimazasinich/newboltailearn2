import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  BarChart3, 
  Database, 
  FileText, 
  Users, 
  Settings, 
  Home,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Monitor,
  BookOpen,
  Scale,
  Gavel,
  Briefcase
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string | number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'نمای کلی سیستم',
    icon: Home,
    href: '/overview'
  },
  {
    id: 'dashboard',
    label: 'داشبورد پیشرفته',
    icon: BarChart3,
    href: '/dashboard-ultimate',
    badge: 'جدید'
  },
  {
    id: 'models',
    label: 'مدیریت مدل‌ها',
    icon: Brain,
    href: '/models',
    badge: 4
  },
  {
    id: 'analytics',
    label: 'تحلیل و گزارش',
    icon: TrendingUp,
    href: '/analytics'
  },
  {
    id: 'data',
    label: 'مجموعه داده‌ها',
    icon: Database,
    href: '/data-gallery'
  },
  {
    id: 'legal-docs',
    label: 'اسناد حقوقی',
    icon: FileText,
    href: '/legal-docs',
    badge: '12K'
  },
  {
    id: 'monitoring',
    label: 'نظارت سیستم',
    icon: Monitor,
    href: '/monitoring'
  },
  {
    id: 'team',
    label: 'مدیریت کاربران',
    icon: Users,
    href: '/team'
  },
  {
    id: 'settings',
    label: 'تنظیمات سیستم',
    icon: Settings,
    href: '/settings'
  }
];

interface EnhancedSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  currentPath?: string;
}

export function EnhancedSidebar({ 
  collapsed = false, 
  onToggle,
  currentPath = '/overview'
}: EnhancedSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <motion.div
      initial={{ x: collapsed ? -300 : 0 }}
      animate={{ x: collapsed ? -240 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed right-0 top-0 h-full z-30 transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      <div className="h-full bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl border-l border-slate-600/50 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-600/50">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI حقوقی ایران</h2>
                  <p className="text-xs text-slate-300">سامانه یادگیری عمیق</p>
                </div>
              </motion.div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
            >
              <ChevronLeft className={cn(
                'w-5 h-5 text-slate-300 transition-transform',
                collapsed ? 'rotate-180' : ''
              )} />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4"
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در منو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  index={index}
                  collapsed={collapsed}
                  currentPath={currentPath}
                  expanded={expandedItems.includes(item.id)}
                  onToggleExpanded={() => toggleExpanded(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer - System Status */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 border-t border-slate-600/50"
          >
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-medium text-emerald-200">وضعیت سیستم: سالم</span>
              </div>
              <div className="text-xs text-slate-300">
                آموزش فعال: 3 مدل
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface NavigationItemProps {
  item: NavigationItem;
  index: number;
  collapsed: boolean;
  currentPath: string;
  expanded: boolean;
  onToggleExpanded: () => void;
}

function NavigationItem({ 
  item, 
  index, 
  collapsed, 
  currentPath, 
  expanded, 
  onToggleExpanded 
}: NavigationItemProps) {
  const isActive = currentPath === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={hasChildren ? onToggleExpanded : undefined}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
          'border border-transparent',
          isActive
            ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-emerald-500/30 shadow-lg'
            : 'hover:bg-slate-700/50 hover:border-slate-600/30'
        )}
      >
        <motion.div
          className={cn(
            'p-2 rounded-lg transition-all',
            isActive
              ? 'bg-gradient-to-r from-emerald-500 to-blue-600 shadow-lg'
              : 'bg-slate-700/50'
          )}
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <item.icon className={cn(
            'w-4 h-4',
            isActive ? 'text-white' : 'text-slate-300'
          )} />
        </motion.div>
        
        {!collapsed && (
          <>
            <div className="flex-1 text-right">
              <span className={cn(
                'text-sm font-medium',
                isActive ? 'text-white' : 'text-slate-300'
              )}>
                {item.label}
              </span>
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="float-left bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}
            </div>
            
            {hasChildren && (
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </motion.div>
            )}
          </>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && expanded && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 mr-8 space-y-1"
          >
            {item.children?.map((child, childIndex) => (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: childIndex * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'w-full flex items-center gap-2 p-2 rounded-lg transition-all',
                  'text-sm text-slate-400 hover:text-white hover:bg-slate-700/30'
                )}
              >
                <child.icon className="w-3 h-3" />
                <span>{child.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface TopNavigationProps {
  onMenuToggle?: () => void;
  onNotificationClick?: () => void;
  notifications?: number;
}

export function TopNavigation({ 
  onMenuToggle, 
  onNotificationClick,
  notifications = 3
}: TopNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-600/50 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-all lg:hidden"
          >
            <Menu className="w-6 h-6 text-white" />
          </motion.button>
          
          <div>
            <h1 className="text-2xl font-bold text-white">داشبورد هوش مصنوعی حقوقی</h1>
            <p className="text-slate-300">مانیتورینگ و مدیریت مدل‌های یادگیری عمیق</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30"
            whileHover={{ scale: 1.05 }}
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span className="text-emerald-200 text-sm">
              {new Date().toLocaleTimeString('fa-IR')}
            </span>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNotificationClick}
            className="relative p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl text-white hover:shadow-lg transition-all"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {notifications}
              </motion.div>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-2 space-x-reverse text-sm"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          )}
          {item.href ? (
            <motion.a
              href={item.href}
              whileHover={{ scale: 1.05 }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {item.label}
            </motion.a>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
}