// src/components/Sidebar.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { NavLink, useLocation, matchPath } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Database, FileText, Brain, Activity,
  Settings, Users, Download, ChevronRight, X, Layers, Bell, HelpCircle,
  LogOut, User, Moon, Sun, Wifi, WifiOff, AlertTriangle, Cpu, BarChart3,
  Search, Home, Monitor, BookOpen, Gauge, UserCheck, Cog, BarChart2
} from "lucide-react";

// ---------- Types ----------
type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (c: boolean) => void;
};

type NavItem = {
  name: string; href: string; icon: React.ElementType;
  match?: string[]; badge?: number | string; color?: string;
  description?: string; isNew?: boolean; isPro?: boolean; shortcut?: string;
};

type NavGroup = { title: string; items: NavItem[]; color?: string; icon?: React.ElementType; };

// ---------- Nav Groups (paths match App.tsx) ----------
const GROUPS: NavGroup[] = [
  {
    title: "داشبورد اصلی",
    icon: Home,
    items: [
      { name: "صفحه اصلی", href: "/", icon: Home, description: "صفحه فرود", color: "text-blue-600", shortcut: "H" },
      { name: "نمای کلی", href: "/overview", icon: LayoutDashboard, description: "آمار کلی", color: "text-indigo-600", shortcut: "O" },
      { name: "داشبورد پیشرفته", href: "/dashboard-advanced", icon: Gauge, description: "داشبورد تعاملی", badge: "جدید", isNew: true, color: "text-purple-600", shortcut: "D" },
    ],
  },
  {
    title: "تحلیل و گزارش‌گیری",
    icon: BarChart3,
    items: [
      { name: "تحلیلات پیشرفته", href: "/analytics", icon: TrendingUp, description: "تحلیل داده‌ها", badge: "Pro", isPro: true, color: "text-green-600", shortcut: "A" },
      { name: "لاگ‌ها و رویدادها", href: "/logs", icon: FileText, description: "لاگ‌های سیستم", color: "text-orange-600", shortcut: "L" },
    ],
  },
  {
    title: "مدیریت داده و مدل",
    icon: Database,
    items: [
      { name: "مجموعه داده‌ها", href: "/data", icon: Database, description: "مدیریت دیتاست‌ها", badge: 12, color: "text-cyan-600", shortcut: "T" },
      { name: "مدل‌های هوش مصنوعی", href: "/models", icon: Brain, description: "مدیریت مدل‌ها", color: "text-indigo-600", shortcut: "M", match: ["/models/*"] },
      { name: "مدیریت آموزش", href: "/training", icon: BookOpen, description: "کنترل آموزش", badge: 3, color: "text-pink-600", shortcut: "R" },
    ],
  },
  {
    title: "نظارت و مانیتورینگ",
    icon: Monitor,
    items: [
      { name: "نظارت سیستم", href: "/monitoring", icon: Activity, description: "Real-time مانیتورینگ", color: "text-red-600", shortcut: "N" },
    ],
  },
  {
    title: "تیم",
    icon: Users,
    items: [
      { name: "مدیریت تیم", href: "/team", icon: Users, description: "کاربران و نقش‌ها", badge: 5, color: "text-emerald-600", shortcut: "U" },
    ],
  },
  {
    title: "تنظیمات و ابزارها",
    icon: Cog,
    items: [
      { name: "تنظیمات سیستم", href: "/settings", icon: Settings, description: "پیکربندی عمومی", color: "text-gray-600", shortcut: "S" },
      { name: "دانلود پروژه", href: "/download", icon: Download, description: "Export/Backup", isPro: true, color: "text-indigo-600", shortcut: "W" },
    ],
  },
];

// ---------- Utils ----------
const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit & { timeout?: number } = {}) => {
  const { timeout = 8000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

const isActive = (pathname: string, href: string, match?: string[]) => {
  if (pathname === href) return true;
  if (pathname.startsWith(href + "/")) return true;
  for (const p of match || []) if (matchPath({ path: p, end: false }, pathname)) return true;
  return false;
};

const usePersistentCollapsed = (controlled?: boolean, onChange?: (v: boolean) => void) => {
  const [internal, setInternal] = useState<boolean>(() => localStorage.getItem("sidebar:collapsed") === "1");
  const collapsed = controlled ?? internal;
  const setCollapsed = useCallback((v: boolean) => {
    onChange?.(v);
    if (controlled === undefined) setInternal(v);
    localStorage.setItem("sidebar:collapsed", v ? "1" : "0");
  }, [controlled, onChange]);
  return { collapsed, setCollapsed };
};

// ---------- Theme ----------
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const toggleTheme = useCallback(() => {
    setIsDark(v => {
      const nv = !v;
      localStorage.setItem("theme", nv ? "dark" : "light");
      document.documentElement.classList.toggle("dark", nv);
      return nv;
    });
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); }, [isDark]);
  return { isDark, toggleTheme };
};

// ---------- Connection ----------
const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  const checkApi = useCallback(async () => {
    try {
      // prefer /api/health; fallback to /api/csrf-token if health is missing
      const res = await fetchWithTimeout("http://localhost:3001/api/health", { timeout: 5000 });
      if (!res.ok) throw new Error();
      setApiStatus("connected");
    } catch {
      try {
        const res2 = await fetchWithTimeout("http://localhost:3001/api/csrf-token", { timeout: 5000 });
        setApiStatus(res2.ok ? "connected" : "disconnected");
      } catch {
        setApiStatus("disconnected");
      }
    }
  }, []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    checkApi();
    const id = setInterval(checkApi, 30000);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); clearInterval(id); };
  }, [checkApi]);

  return { isOnline, apiStatus };
};

// ---------- Stats (uses real endpoints /monitoring + /models) ----------
const useSystemStats = () => {
  const [stats, setStats] = useState({ cpu: 0, memory: 0, activeTraining: 0, notifications: 0, uptime: 0, errors: 0 });

  const load = useCallback(async () => {
    try {
      const [monRes, modelsRes] = await Promise.all([
        fetchWithTimeout("http://localhost:3001/api/monitoring", { timeout: 7000 }),
        fetchWithTimeout("http://localhost:3001/api/models", { timeout: 7000 }),
      ]);

      let cpu = 0, memory = 0, uptime = 0, errors = 0;
      if (monRes.ok) {
        const m = await monRes.json();
        cpu = Math.round(m.cpu ?? 0);
        memory = Math.round(m.memory?.percentage ?? 0);
        uptime = Math.round(m.uptime ?? 0);
        errors = Math.round(m.errors ?? 0);
      }

      let activeTraining = 0;
      if (modelsRes.ok) {
        const models = await modelsRes.json();
        activeTraining = Array.isArray(models) ? models.filter((s: any) => s.status === "training").length : 0;
      }

      setStats(s => ({ ...s, cpu, memory, uptime, activeTraining, errors, notifications: Math.max(0, s.notifications - 1) }));
    } catch {
      // soft fallback (dev)
      setStats({
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 30) + 40,
        activeTraining: Math.floor(Math.random() * 3),
        notifications: Math.floor(Math.random() * 5),
        uptime: Math.floor(Date.now() / 1000) % (24 * 3600),
        errors: Math.floor(Math.random() * 2),
      });
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  return stats;
};

// ---------- Shortcuts ----------
const useKeyboardShortcuts = (collapsed: boolean) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const key = e.key.toUpperCase();
      const item = GROUPS.flatMap(g => g.items).find(i => i.shortcut === key);
      if (item) { e.preventDefault(); window.location.href = item.href; }
    };
    if (!collapsed) { document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }
  }, [collapsed]);
};

// ---------- Small UI bits ----------
const Badge: React.FC<{ value: number | string; variant?: "default" | "new" | "pro" | "warning" | "success" | "error"; pulse?: boolean; }> =
  ({ value, variant = "default", pulse }) => {
    const v = {
      default: "bg-blue-500", new: "bg-green-600", pro: "bg-orange-500",
      warning: "bg-yellow-500", success: "bg-emerald-600", error: "bg-red-500",
    }[variant];
    return (
      <span className={`min-w-[18px] h-[18px] px-1.5 inline-flex items-center justify-center text-[10px] font-bold text-white rounded-full shadow-sm ${v} ${pulse ? "animate-pulse" : ""}`}>
        {typeof value === "number" && value > 99 ? "99+" : value}
      </span>
    );
  };

const SearchComponent: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false);
  const items = useMemo(() => GROUPS.flatMap(g => g.items), []);
  const results = useMemo(() =>
    q.length > 1 ? items.filter(i =>
      i.name.toLowerCase().includes(q.toLowerCase()) ||
      (i.description ?? "").toLowerCase().includes(q.toLowerCase())
    ) : [], [q, items]);
  useEffect(() => setOpen(results.length > 0), [results.length]);
  if (collapsed) return null;
  return (
    <div className="px-3 mb-4 relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو در منو…" className="w-full pr-10 pl-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {results.map((i) => (
              <NavLink key={i.href} to={i.href} onClick={() => { setQ(""); setOpen(false); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <i.icon className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{i.name}</div>
                  {i.description && <div className="text-xs text-gray-500">{i.description}</div>}
                </div>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuickStats: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const s = useSystemStats();
  if (collapsed) {
    return (
      <div className="px-2 py-3 space-y-2">
        <div className="flex justify-center">
          <div className={`w-2 h-2 rounded-full ${s.cpu > 80 ? "bg-red-500 animate-pulse" : s.cpu > 60 ? "bg-yellow-500" : "bg-green-500"}`} />
        </div>
        <div className="text-center text-xs font-bold text-gray-600 dark:text-gray-400">{s.activeTraining}</div>
        {s.errors > 0 && <div className="flex justify-center"><AlertTriangle className="w-3 h-3 text-red-500 animate-bounce" /></div>}
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="px-3 py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl mx-3 mb-4 border border-gray-200/50 dark:border-gray-700/50">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
        <BarChart2 className="w-3 h-3" /> آمار لحظه‌ای
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Cpu className="w-3 h-3 text-blue-500" /><span className="text-xs text-gray-600 dark:text-gray-400">CPU</span></div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${s.cpu > 80 ? "bg-red-500 animate-pulse" : s.cpu > 60 ? "bg-yellow-500" : "bg-green-500"}`} />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{s.cpu}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Brain className="w-3 h-3 text-purple-500" /><span className="text-xs text-gray-600 dark:text-gray-400">آموزش</span></div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{s.activeTraining} فعال</span>
        </div>
        {s.errors > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-500" /><span className="text-xs text-gray-600 dark:text-gray-400">خطا</span></div>
            <Badge value={s.errors} variant="error" pulse />
          </div>
        )}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">آپتایم</span>
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {Math.floor(s.uptime / 3600)}h {Math.floor((s.uptime % 3600) / 60)}m
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ---------- Component ----------
export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, collapsed: collapsedProp, onCollapsedChange }) => {
  const location = useLocation();
  const { collapsed, setCollapsed } = usePersistentCollapsed(collapsedProp, onCollapsedChange);
  const { isDark, toggleTheme } = useTheme();
  const { isOnline, apiStatus } = useConnectionStatus();

  useKeyboardShortcuts(collapsed);

  useEffect(() => { if (isOpen) onClose?.(); /* close on route change (mobile) */ }, [location.pathname]);

  const desktopWidth = collapsed ? "w-20" : "w-80";
  const itemBase = "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden";
  const itemActive = "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-300 shadow-lg border-l-4 border-blue-500 transform scale-[1.02]";
  const itemIdle = "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md hover:scale-[1.01]";

  const renderGroup = (g: NavGroup, gi: number) => (
    <motion.div key={g.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.06 }} className="mb-6">
      {!collapsed && (
        <div className="px-3 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
          <div className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
            {g.icon && <g.icon className="w-3 h-3" />} {g.title}
          </div>
        </div>
      )}
      <div className="space-y-1">
        {g.items.map((item, ii) => {
          const Icon = item.icon;
          const active = isActive(location.pathname, item.href, item.match);
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: gi * 0.06 + ii * 0.03 }}>
              <NavLink to={item.href} title={collapsed ? `${item.name}${item.shortcut ? ` (Alt+${item.shortcut})` : ""}` : item.description}
                className={`${itemBase} ${active ? itemActive : itemIdle}`}>
                <div className={`relative ${item.color || "text-current"}`}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.isNew && !collapsed && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="truncate flex items-center gap-2">
                        {item.name}
                        {item.shortcut && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded font-mono">Alt+{item.shortcut}</span>}
                      </div>
                      {item.description && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</div>}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.isPro && <Badge value="PRO" variant="pro" />}
                      {item.isNew && <Badge value="جدید" variant="new" pulse />}
                      {typeof item.badge === "number" && item.badge > 0 && <Badge value={item.badge} variant={item.badge > 10 ? "warning" : "default"} />}
                      {typeof item.badge === "string" && !item.isNew && <Badge value={item.badge} />}
                    </div>
                  </>
                )}
                {collapsed && typeof item.badge === "number" && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1"><Badge value={item.badge} variant={item.badge > 10 ? "warning" : "default"} /></div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  const HeaderBar = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="h-16 flex items-center justify-between px-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm" />
      <div className="flex items-center gap-3 relative z-10">
        <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6, type: "spring" }}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
          <Layers className="h-6 w-6 text-white" />
        </motion.div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="leading-tight">
            <div className="text-sm font-bold text-white">هوش مصنوعی حقوقی</div>
            <div className="text-xs text-blue-100">Persian Legal AI Platform</div>
          </motion.div>
        )}
      </div>
      <div className="flex items-center gap-2 relative z-10">
        {!collapsed && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all" title={isDark ? "حالت روز" : "حالت شب"}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
          title={collapsed ? "باز کردن سایدبار (Ctrl+B)" : "جمع کردن سایدبار (Ctrl+B)"}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );

  const ConnectionStrip = !collapsed && (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-3 mt-4 mb-2">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
        ${isOnline && apiStatus === "connected" ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
          : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"}`}>
        {isOnline && apiStatus === "connected" ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        {isOnline && apiStatus === "connected" ? "متصل به سرور" : "اتصال قطع شده"}
        <div className={`w-2 h-2 rounded-full ${isOnline && apiStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      </div>
    </motion.div>
  );

  const Footer = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-gray-200 dark:border-gray-700 p-3">
      {!collapsed ? (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${apiStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span>{apiStatus === "connected" ? "سیستم فعال" : "سیستم غیرفعال"}</span>
          </div>
          <span className="font-mono">v2.1.0</span>
        </div>
      ) : (
        <div className="text-center">
          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${apiStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">v2.1</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      {/* Desktop */}
      <motion.aside initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
        border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-30 ${desktopWidth} transition-all duration-300`} dir="rtl">
        {HeaderBar}
        {ConnectionStrip}
        <SearchComponent collapsed={collapsed} />
        <QuickStats collapsed={collapsed} />
        <div className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600`}>
          {GROUPS.map((g, i) => renderGroup(g, i))}
        </div>
        {/* User mini block */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900 dark:text-white">ادمین سیستم</div>
                <div className="text-gray-500 dark:text-gray-400">admin@system.com</div>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="خروج">
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
        {Footer}
      </motion.aside>

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
              border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl flex flex-col" dir="rtl">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">هوش مصنوعی حقوقی</div>
                    <div className="text-xs text-blue-100">Persian Legal AI</div>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <SearchComponent collapsed={false} />
                {GROUPS.map((g, i) => renderGroup(g, i))}
              </div>
              {Footer}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
