import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, BarChart3, Database, FileText, Users, Settings, 
  Monitor, LogOut, Home, BookOpen, Scale, Gavel, Shield,
  TrendingUp, Activity, Cpu, Globe, Download, Upload,
  ChevronDown, ChevronRight, Dot, Sparkles, Briefcase,
  ChevronUp, Zap, Clock, HardDrive, Target, Heart, Play, CheckCircle
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
  children?: NavItem[];
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  models_training: number;
  cpu_usage: number;
  memory_usage: number;
}

export function ModernSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main']);
  const [systemSpecsExpanded, setSystemSpecsExpanded] = useState(false);
  const [trainingExpanded, setTrainingExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    models_training: 2,
    cpu_usage: 45,
    memory_usage: 68
  });

  // Navigation structure for Persian Legal AI
  const navigation: { group: string; label: string; items: NavItem[] }[] = [
    {
      group: 'main',
      label: 'داشبورد اصلی',
      items: [
        { path: '/overview', label: 'نمای کلی', icon: Home, description: 'داشبورد اصلی سیستم' },
        { path: '/dashboard', label: 'مانیتورینگ', icon: BarChart3, description: 'آمار و نمودارها', badge: 'جدید' },
        { path: '/dashboard-ultimate', label: 'داشبورد پیشرفته', icon: Sparkles, description: 'داشبورد تعاملی پیشرفته', badge: 'ویژه' }
      ]
    },
    {
      group: 'legal',
      label: 'سیستم حقوقی',
      items: [
        { 
          path: '/models', 
          label: 'مدل‌های یادگیری', 
          icon: Brain, 
          description: 'مدیریت مدل‌های AI',
          children: [
            { path: '/models/civil', label: 'قوانین مدنی', icon: Scale },
            { path: '/models/criminal', label: 'قوانین جزایی', icon: Gavel },
            { path: '/models/commercial', label: 'قوانین تجاری', icon: Briefcase },
            { path: '/models/administrative', label: 'قوانین اداری', icon: Shield }
          ]
        },
        { path: '/datasets', label: 'مجموعه‌ داده‌ها', icon: Database, description: 'مدیریت داده‌های حقوقی' },
        { path: '/legal-docs', label: 'اسناد قانونی', icon: FileText, description: 'آرشیو اسناد حقوقی' }
      ]
    },
    {
      group: 'analytics',
      label: 'تحلیل و گزارش',
      items: [
        { path: '/analytics', label: 'آنالیتیکس', icon: TrendingUp, description: 'تحلیل عملکرد' },
        { path: '/monitoring', label: 'نظارت سیستم', icon: Monitor, description: 'مانیتورینگ real-time' },
        { path: '/logs', label: 'گزارش‌ها', icon: Activity, description: 'لاگ‌های سیستم' }
      ]
    },
    {
      group: 'tools',
      label: 'ابزارها',
      items: [
        { path: '/export', label: 'صادرات داده', icon: Download, description: 'صادرات و پشتیبان‌گیری' },
        { path: '/import', label: 'واردات داده', icon: Upload, description: 'واردات داده‌های جدید' }
      ]
    },
    {
      group: 'management',
      label: 'مدیریت',
      items: [
        { path: '/team', label: 'تیم', icon: Users, description: 'مدیریت کاربران' },
        { path: '/settings', label: 'تنظیمات', icon: Settings, description: 'پیکربندی سیستم' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate system status updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        cpu_usage: Math.floor(Math.random() * 30 + 30),
        memory_usage: Math.floor(Math.random() * 20 + 50),
        models_training: Math.floor(Math.random() * 3 + 1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className={`${
        collapsed ? 'w-20' : 'w-80'
      } h-screen bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-l border-slate-600/50 transition-all duration-300 flex flex-col`}
      dir="rtl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-600/50">
        <motion.div
          className="flex items-center gap-4"
          layout
        >
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h2 className="text-lg font-bold text-white">AI حقوقی ایران</h2>
                <p className="text-xs text-slate-300">سامانه یادگیری عمیق</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors mr-auto"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((section, sectionIndex) => (
          <motion.div
            key={section.group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: sectionIndex * 0.1 }}
          >
            {/* Section Header */}
            <AnimatePresence>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => toggleGroup(section.group)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <motion.div
                    animate={{ rotate: expandedGroups.includes(section.group) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </motion.div>
                  {section.label}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Navigation Items */}
            <AnimatePresence>
              {(collapsed || expandedGroups.includes(section.group)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1"
                >
                  {section.items.map((item, itemIndex) => (
                    <div key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `
                          group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                          ${isActive 
                            ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 text-white' 
                            : 'hover:bg-slate-700/30 text-slate-300 hover:text-white'
                          }
                        `}
                      >
                        {/* Active indicator */}
                        {isActive(item.path) && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-blue-400 rounded-full"
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive(item.path) 
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' 
                            : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>

                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex-1 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium">{item.label}</h3>
                                  {item.description && (
                                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {item.badge && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs rounded-full font-medium"
                                    >
                                      {item.badge}
                                    </motion.span>
                                  )}
                                  
                                  {item.children && (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </NavLink>

                      {/* Sub-navigation */}
                      <AnimatePresence>
                        {!collapsed && item.children && isActive(item.path) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 mt-2 space-y-1"
                          >
                            {item.children.map((child, childIndex) => (
                              <motion.div
                                key={child.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: childIndex * 0.05 }}
                              >
                                <NavLink
                                  to={child.path}
                                  className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                                    ${isActive 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                                    }
                                  `}
                                >
                                  <Dot className="w-4 h-4" />
                                  <child.icon className="w-4 h-4" />
                                  <span className="text-sm font-medium">{child.label}</span>
                                </NavLink>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </nav>

      {/* Collapsible System Specifications */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mx-4 mb-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSystemSpecsExpanded(!systemSpecsExpanded)}
              className="w-full p-4 bg-gradient-to-r from-teal-500/25 to-emerald-500/25 rounded-2xl border border-teal-400/40 hover:from-teal-500/35 hover:to-emerald-500/35 transition-all duration-300 shadow-xl hover:shadow-teal-500/25 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">وضعیت سیستم</span>
                    <span className="text-xs text-teal-200">سیستم فعال و آماده</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-3 py-1 bg-white/20 text-white text-xs rounded-full font-bold backdrop-blur-sm"
                  >
                    {systemStatus.status === 'healthy' ? 'سالم' :
                     systemStatus.status === 'warning' ? 'هشدار' : 'خطا'}
                  </motion.span>
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-white/60 rounded-full shadow-sm"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 bg-white/40 rounded-full shadow-sm"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      className="w-2 h-2 bg-white/60 rounded-full shadow-sm"
                    />
                  </div>
                  <motion.div
                    animate={{ rotate: systemSpecsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 text-white/80"
                  >
                    <ChevronUp className="w-full h-full" />
                  </motion.div>
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {systemSpecsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-400/20 shadow-lg"
                  >
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-emerald-200 p-2 bg-emerald-500/10 rounded-lg border border-emerald-400/20 shadow-sm shadow-emerald-500/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>مدل‌های در حال آموزش</span>
                      </div>
                      <span className="font-bold text-emerald-300">{systemStatus.models_training}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-blue-200 p-2 bg-blue-500/10 rounded-lg border border-blue-400/20 shadow-sm shadow-blue-500/10">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-blue-400" />
                        <span>استفاده پردازنده</span>
                      </div>
                      <span className="font-bold text-blue-300">{systemStatus.cpu_usage}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-purple-200 p-2 bg-purple-500/10 rounded-lg border border-purple-400/20 shadow-sm shadow-purple-500/10">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3 text-purple-400" />
                        <span>استفاده حافظه</span>
                      </div>
                      <span className="font-bold text-purple-300">{systemStatus.memory_usage}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Training Status Indicator - Collapsible */}
      <AnimatePresence>
        {!collapsed && (
              <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mx-4 mb-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTrainingExpanded(!trainingExpanded)}
              className="w-full p-4 bg-gradient-to-r from-blue-500/25 to-purple-500/25 rounded-2xl border border-blue-400/40 hover:from-blue-500/35 hover:to-purple-500/35 transition-all duration-300 shadow-xl hover:shadow-blue-500/25 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">آموزش فعال</span>
                    <span className="text-xs text-blue-200">مدل‌های در حال آموزش</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                    className="px-3 py-1 bg-white/20 text-white text-xs rounded-full font-bold backdrop-blur-sm"
                  >
                    در حال اجرا
                  </motion.span>
                  <motion.div
                    animate={{ rotate: trainingExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 text-white/80"
                  >
                    <ChevronUp className="w-full h-full" />
              </motion.div>
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {trainingExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-400/20"
                >
                  <div className="text-xs text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-blue-400" />
                        <span>مدل قوانین مدنی</span>
                      </div>
                      <span className="font-bold text-emerald-400">87%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>زمان باقیمانده</span>
                      </div>
                      <span className="font-bold text-blue-400">23 دقیقه</span>
            </div>
            
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-purple-400" />
                        <span>دقت فعلی</span>
                      </div>
                      <span className="font-bold text-purple-400">94.2%</span>
                    </div>
            </div>
            
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "87%" }}
                transition={{ duration: 2 }}
                      className="h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-500 rounded-full shadow-lg relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    </motion.div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs rounded-lg transition-all duration-300"
                    >
                      مدیریت
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded-lg transition-all duration-300"
                    >
                      جزئیات
                    </motion.button>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Enhanced System Status & Model Status Tabs */}
        <div className="p-3 border-t border-slate-600/50 mt-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
                className="mb-2"
              >
                {/* Enhanced Tab Navigation */}
                <div className="flex bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-lg p-0.5 shadow-2xl backdrop-blur-sm border border-slate-500/40">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('status')}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 relative overflow-hidden ${
                      activeTab === 'status'
                        ? 'bg-gradient-to-r from-cyan-500/50 to-teal-500/50 text-white shadow-xl shadow-cyan-500/40 border border-cyan-400/60'
                        : 'text-slate-300 hover:text-white hover:bg-slate-600/30'
                    }`}
                  >
                    {activeTab === 'status' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-teal-400/30 rounded-md"
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-center gap-1.5">
                      <Heart className="w-3 h-3" />
                      <span>وضعیت سیستم</span>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('models')}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 relative overflow-hidden ${
                      activeTab === 'models'
                        ? 'bg-gradient-to-r from-indigo-500/50 to-slate-600/50 text-white shadow-xl shadow-indigo-500/40 border border-indigo-400/60'
                        : 'text-slate-300 hover:text-white hover:bg-slate-600/30'
                    }`}
                  >
                    {activeTab === 'models' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-400/30 to-slate-400/30 rounded-md"
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-center gap-1.5">
                      <Brain className="w-3 h-3" />
                      <span>وضعیت مدل‌ها</span>
                    </div>
                  </motion.button>
                </div>

                {/* Enhanced Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'status' && (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 p-3 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 rounded-lg border border-cyan-400/30 shadow-lg backdrop-blur-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shadow-lg shadow-teal-400/50" />
                            <span className="text-sm text-teal-200 font-bold">وضعیت کلی</span>
                          </div>
                          <span className="text-sm text-white font-bold bg-white/20 px-2 py-1 rounded-full">سالم</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                              <Cpu className="w-3 h-3 text-blue-400" />
                            </div>
                            <span className="text-sm text-slate-200">CPU</span>
                          </div>
                          <span className="text-sm text-blue-300 font-bold">{systemStatus.cpu_usage}%</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                              <HardDrive className="w-3 h-3 text-purple-400" />
                            </div>
                            <span className="text-sm text-slate-200">حافظه</span>
                          </div>
                          <span className="text-sm text-purple-300 font-bold">{systemStatus.memory_usage}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'models' && (
                    <motion.div
                      key="models"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 p-3 bg-gradient-to-r from-indigo-500/15 to-slate-500/15 rounded-lg border border-indigo-400/30 shadow-lg backdrop-blur-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                            <span className="text-sm text-blue-200 font-bold">مدل‌های فعال</span>
                          </div>
                          <span className="text-sm text-white font-bold bg-white/20 px-2 py-1 rounded-full">{systemStatus.models_training}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center">
                              <Play className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span className="text-sm text-slate-200">در حال آموزش</span>
                          </div>
                          <span className="text-sm text-emerald-300 font-bold">2</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-white/5 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="text-sm text-slate-200">تکمیل شده</span>
                          </div>
                          <span className="text-sm text-green-300 font-bold">1</span>
              </div>
              </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Enhanced Collapse/Expand Toggle */}
        <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
            className="w-full p-2.5 bg-gradient-to-r from-slate-700/40 to-slate-600/40 hover:from-slate-600/50 hover:to-slate-500/50 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
              className="w-4 h-4 text-slate-300"
          >
              <ChevronRight className="w-full h-full" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}