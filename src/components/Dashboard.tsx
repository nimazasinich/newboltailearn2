// src/components/Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line, Doughnut } from "react-chartjs-2";
import io from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import AppLayout from "./layout/AppLayout";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";

import {
  Activity,
  AlertCircle,
  Brain,
  Cpu,
  Database,
  TrendingUp,
  Server,
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/* ---------- Types ---------- */
interface SystemMetrics {
  cpu: number;
  memory: { used: number; total: number; percentage: number };
  disk?: { used: number; total: number; percentage: number };
  uptime: number;
  temperature?: number;
  timestamp: string;
}
interface TrainingSession {
  id: number;
  name: string;
  type: "dora" | "qr-adaptor" | "persian-bert";
  status: "idle" | "training" | "completed" | "failed" | "paused";
  accuracy: number;
  loss: number;
  epochs: number;
  current_epoch: number;
  progress?: number;
  dataset_id: string;
  estimated_time?: number;
  learning_rate?: number;
  batch_size?: number;
  created_at: string;
  updated_at: string;
  metrics_history?: Array<{ epoch: number; accuracy: number; loss: number; timestamp: string }>;
}
interface Dataset {
  id: string;
  name: string;
  source: string;
  samples: number;
  size_mb: number;
  status: "ready" | "processing" | "error" | "available" | "downloading";
  type?: "text" | "image" | "audio";
  created_at?: string;
  last_used?: string;
}

/* ---------- API helpers (relative /api + auth + csrf + retry) ---------- */
const API_BASE = "/api";

async function getCsrfToken(): Promise<string> {
  try {
    const r = await fetch(`${API_BASE}/csrf-token`, { credentials: "include" });
    const j = await r.json();
    return j?.token || "";
  } catch {
    return "";
  }
}

async function ensureLogin(): Promise<string | null> {
  const current = localStorage.getItem("token");
  if (current) return current;

  const csrf = await getCsrfToken();
  try {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf,
      },
      body: JSON.stringify({ username: "admin", password: "admin" }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    if (j?.token) {
      localStorage.setItem("token", j.token);
      return j.token;
    }
  } catch {
    /* ignore */
  }
  return null;
}

class APIService {
  private cache = new Map<string, { t: number; d: unknown }>();
  private ttl = 30_000;

  private async authHeaders(mutating: boolean): Promise<Record<string, string>> {
    const h: Record<string, string> = { Accept: "application/json" };
    const token = await ensureLogin();
    if (token) h.Authorization = `Bearer ${token}`;
    if (mutating) h["Content-Type"] = "application/json";
    if (mutating) h["X-CSRF-Token"] = await getCsrfToken();
    return h;
  }

  async get<T>(endpoint: string, cache = true): Promise<T | null> {
    const key = `GET ${endpoint}`;
    if (cache && this.cache.has(key)) {
      const c = this.cache.get(key)!;
      if (Date.now() - c.t < this.ttl) return c.d as T;
    }
    const headers = await this.authHeaders(false);
    try {
      const r = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        headers,
      });
      if (r.status === 401) {
        await ensureLogin();
        const r2 = await fetch(`${API_BASE}${endpoint}`, {
          credentials: "include",
          headers: await this.authHeaders(false),
        });
        if (!r2.ok) return null;
        const j = (await r2.json()) as T;
        if (cache) this.cache.set(key, { t: Date.now(), d: j });
        return j;
      }
      if (!r.ok) return null;
      const j = (await r.json()) as T;
      if (cache) this.cache.set(key, { t: Date.now(), d: j });
      return j;
    } catch {
      return null;
    }
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T | null> {
    const headers = await this.authHeaders(true);
    try {
      const r = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (r.status === 401) {
        await ensureLogin();
        const r2 = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          credentials: "include",
          headers: await this.authHeaders(true),
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!r2.ok) return null;
        return (await r2.json()) as T;
      }
      if (!r.ok) return null;
      return (await r.json()) as T;
    } catch {
      return null;
    }
  }
}
const api = new APIService();

/* ---------- Small UI helpers ---------- */
const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}> = ({ title, value, subtitle, icon, color, trend }) => (
  <GlassCard className="p-6 relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        {typeof trend === "number" && (
          <div className={`flex items-center mt-2 text-sm ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"}`}>
            <TrendingUp className={`w-4 h-4 ml-1 ${trend < 0 ? "rotate-180" : ""}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className={`p-3 ${color} rounded-xl text-white`}>{icon}</div>
    </div>
  </GlassCard>
);

const StatusBadge: React.FC<{ status: string; size?: "sm" | "md" | "lg" }> = ({ status, size = "md" }) => {
  const map = {
    training: { color: "bg-blue-600", icon: <Loader className="animate-spin" />, txt: "در حال آموزش" },
    completed: { color: "bg-green-600", icon: <CheckCircle />, txt: "تکمیل" },
    failed: { color: "bg-red-600", icon: <XCircle />, txt: "ناموفق" },
    paused: { color: "bg-yellow-600", icon: <Pause />, txt: "متوقف" },
    idle: { color: "bg-gray-600", icon: <Clock />, txt: "آماده" },
    ready: { color: "bg-emerald-600", icon: <CheckCircle />, txt: "آماده" },
    processing: { color: "bg-blue-600", icon: <Loader className="animate-spin" />, txt: "پردازش" },
    error: { color: "bg-red-600", icon: <XCircle />, txt: "خطا" },
    connected: { color: "bg-emerald-600", icon: <Activity />, txt: "متصل" },
    disconnected: { color: "bg-red-600", icon: <AlertCircle />, txt: "قطع" },
  } as const;
  const cfg = (map as any)[status] || map.idle;
  const sizeCls = { sm: "px-2 py-1 text-xs", md: "px-3 py-1.5 text-sm", lg: "px-4 py-2 text-base" }[size];
  return (
    <span className={`inline-flex items-center ${sizeCls} text-white rounded-full ${cfg.color}`}>
      <span className="w-4 h-4 ml-1">{React.cloneElement(cfg.icon as any, { className: "w-4 h-4" })}</span>
      {cfg.txt}
    </span>
  );
};

const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#4F46E5",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference;
  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-200 dark:text-gray-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

/* ---------- Dashboard ---------- */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [connection, setConnection] = useState<"connected" | "disconnected" | "connecting">("connecting");
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [m, s, d] = await Promise.all([
      api.get<SystemMetrics>("/monitoring"),
      api.get<TrainingSession[]>("/models"),
      api.get<Dataset[]>("/datasets"),
    ]);
    if (m) {
      setSystemMetrics(m);
      setMetricsHistory((prev) => [...prev.slice(-19), m]);
    }
    if (s) setSessions(s);
    if (d) setDatasets(d);
    setConnection(m ? "connected" : "disconnected");
    setLoading(false);
  }, []);

  // socket.io live
  useEffect(() => {
    (async () => {
      await ensureLogin(); // ensure token before socket handshake
      const token = localStorage.getItem("token") || "";
      const socket = io("/", { transports: ["websocket"], auth: { token } }); // same-origin (works on 5137)
      socket.on("connect", () => setConnection("connected"));
      socket.on("metrics", (m: SystemMetrics) => {
        setSystemMetrics(m);
        setMetricsHistory((p) => [...p.slice(-19), m]);
      });
      socket.on("training:update", (list: TrainingSession[]) => setSessions(list));
      socket.on("datasets:update", (list: Dataset[]) => setDatasets(list));
      socket.on("disconnect", () => setConnection("disconnected"));
      return () => socket.disconnect();
    })();
  }, []);

  // initial + poll
  useEffect(() => {
    fetchAllData();
    const t = setInterval(fetchAllData, 30_000);
    return () => clearInterval(t);
  }, [fetchAllData]);

  const stats = useMemo(() => {
    const active = sessions.filter((s) => s.status === "training").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const failed = sessions.filter((s) => s.status === "failed").length;
    const totalSize = datasets.reduce((sum, d) => sum + (d.size_mb || 0), 0);
    const bestAcc = Math.max(...sessions.map((s) => s.accuracy || 0), 0);
    const avgAcc = sessions.length ? sessions.reduce((a, b) => a + (b.accuracy || 0), 0) / sessions.length : 0;
    return { active, completed, failed, bestAcc, avgAcc, totalDatasets: datasets.length, totalSize };
  }, [sessions, datasets]);

  const systemMetricsChart = useMemo(
    () => ({
      labels: metricsHistory.map((_, i) => `${i + 1}`),
      datasets: [
        { label: "CPU (%)", data: metricsHistory.map((m) => m.cpu), borderColor: "#EF4444", backgroundColor: "rgba(239,68,68,0.1)", tension: 0.35, fill: true },
        { label: "Memory (%)", data: metricsHistory.map((m) => m.memory.percentage), borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.1)", tension: 0.35, fill: true },
      ],
    }),
    [metricsHistory]
  );

  const modelTypeChart = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => (counts[s.type] = (counts[s.type] || 0) + 1));
    return {
      labels: Object.keys(counts).map((t) => ({ dora: "DoRA", "qr-adaptor": "QR-Adaptor", "persian-bert": "Persian BERT" } as any)[t] || t),
      datasets: [{ data: Object.values(counts), backgroundColor: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"], borderWidth: 0 }],
    };
  }, [sessions]);

  const trainingProgressChart = useMemo(() => {
    if (!selectedSession?.metrics_history) return null;
    return {
      labels: selectedSession.metrics_history.map((m) => `Epoch ${m.epoch}`),
      datasets: [
        { label: "دقت", data: selectedSession.metrics_history.map((m) => m.accuracy), borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.12)", yAxisID: "y" },
        { label: "خطا", data: selectedSession.metrics_history.map((m) => m.loss), borderColor: "#F59E0B", backgroundColor: "rgba(245,158,11,0.12)", yAxisID: "y1" },
      ],
    };
  }, [selectedSession]);

  const controlSession = useCallback(
    async (id: number, action: "start" | "pause" | "stop") => {
      // map to project endpoints
      const ep =
        action === "start"
          ? `/models/${id}/train`
          : action === "pause"
          ? `/models/${id}/pause`
          : `/models/${id}/pause`; // stop -> pause fallback
      const ok = await api.post(ep, {});
      if (ok) fetchAllData();
    },
    [fetchAllData]
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );

  return (
    <AppLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="max-w-7xl w-full mx-auto p-6 space-y-8 overflow-y-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">داشبورد آموزش هوش مصنوعی</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">مدیریت و نظارت روی مدل‌ها، دیتاست‌ها و منابع سیستم</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={connection} />
                <Button onClick={fetchAllData} className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  بروزرسانی
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="مدل‌های فعال" value={stats.active} subtitle={`از ${sessions.length} مدل`} icon={<Brain className="w-6 h-6" />} color="bg-gradient-to-r from-purple-500 to-purple-600" />
              <MetricCard title="دیتاست‌ها" value={stats.totalDatasets} subtitle={`${(stats.totalSize / 1024).toFixed(1)} GB`} icon={<Database className="w-6 h-6" />} color="bg-gradient-to-r from-blue-500 to-blue-600" />
              <MetricCard title="بهترین دقت" value={`${stats.bestAcc.toFixed(1)}%`} subtitle={`میانگین: ${stats.avgAcc.toFixed(1)}%`} icon={<TrendingUp className="w-6 h-6" />} color="bg-gradient-to-r from-green-500 to-green-600" />
              <GlassCard className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">CPU / RAM</p>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>CPU</span>
                    <span>{systemMetrics?.cpu ?? 0}%</span>
                  </div>
                  <Progress value={systemMetrics?.cpu ?? 0} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>RAM</span>
                    <span>{systemMetrics?.memory.percentage ?? 0}%</span>
                  </div>
                  <Progress value={systemMetrics?.memory.percentage ?? 0} />
                </div>
              </GlassCard>
            </div>

            {/* Monitoring + Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">نظارت سیستم</h2>
                  <Server className="w-5 h-5 text-gray-600" />
                </div>
                <div className="h-64">
                  <Line
                    data={systemMetricsChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" as const } },
                      scales: { y: { beginAtZero: true, max: 100 } },
                    }}
                  />
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4">وضعیت سیستم</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>CPU</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 ml-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${systemMetrics?.cpu ?? 0}%` }} />
                      </div>
                      <span className="font-bold">{systemMetrics?.cpu ?? 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>حافظه</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 ml-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemMetrics?.memory.percentage ?? 0}%` }} />
                      </div>
                      <span className="font-bold">{systemMetrics?.memory.percentage ?? 0}%</span>
                    </div>
                  </div>
                  {systemMetrics?.disk && (
                    <div className="flex items-center justify-between">
                      <span>دیسک</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 ml-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${systemMetrics.disk.percentage}%` }} />
                        </div>
                        <span className="font-bold">{systemMetrics.disk.percentage}%</span>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>آپتایم: {Math.floor((systemMetrics?.uptime || 0) / 3600)} ساعت</div>
                    {typeof systemMetrics?.temperature === "number" && <div>دما: {systemMetrics.temperature}°C</div>}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Training sessions */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold">جلسات آموزش</h2>
                <div className="flex items-center gap-2">
                  <Button className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    آموزش جدید
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {sessions.map((s) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow transition cursor-pointer"
                      onClick={() => setSelectedSession(s)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold truncate">{s.name}</h3>
                        <Badge>{s.status}</Badge>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">نوع:</span>
                          <span className="font-medium">{s.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">دقت:</span>
                          <span className="font-medium">{(s.accuracy ?? 0).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">پیشرفت:</span>
                          <span className="font-medium">
                            {s.current_epoch}/{s.epochs}
                          </span>
                        </div>
                      </div>

                      {s.status === "training" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>پیشرفت</span>
                            <span>{Math.round((s.progress ?? (s.current_epoch / s.epochs) * 100))}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.round((s.progress ?? (s.current_epoch / s.epochs) * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        {s.status === "training" ? (
                          <>
                            <Button onClick={(e) => (e.stopPropagation(), controlSession(s.id, "pause"))} className="w-full flex items-center justify-center gap-1">
                              <Pause className="w-4 h-4" /> توقف
                            </Button>
                            <Button disabled className="w-full">—</Button>
                            <Button onClick={(e) => (e.stopPropagation(), controlSession(s.id, "stop"))} className="w-full flex items-center justify-center gap-1">
                              <Square className="w-4 h-4" /> توقف سریع
                            </Button>
                          </>
                        ) : s.status === "paused" ? (
                          <>
                            <Button onClick={(e) => (e.stopPropagation(), controlSession(s.id, "start"))} className="w-full flex items-center justify-center gap-1">
                              <Play className="w-4 h-4" /> ادامه
                            </Button>
                            <Button disabled className="w-full">—</Button>
                            <Button disabled className="w-full">—</Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={(e) => (e.stopPropagation(), controlSession(s.id, "start"))} className="w-full flex items-center justify-center gap-1">
                              <Play className="w-4 h-4" /> شروع
                            </Button>
                            <Button disabled className="w-full">—</Button>
                            <Button disabled className="w-full">—</Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>

            {/* Analytics + Datasets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">توزیع انواع مدل</h3>
                <div className="h-64 flex items-center justify-center">
                  {sessions.length ? (
                    <Doughnut
                      data={modelTypeChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" as const } },
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>هنوز مدلی آموزش نداده‌اید</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">دیتاست‌ها</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {datasets.length ? (
                    datasets.map((d) => (
                      <motion.div key={d.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                          <h4 className="font-medium">{d.name}</h4>
                          <p className="text-xs text-gray-500">
                            {d.samples.toLocaleString()} نمونه • {d.size_mb} MB
                          </p>
                        </div>
                        <StatusBadge status={d.status} size="sm" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>هیچ دیتاستی موجود نیست</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
