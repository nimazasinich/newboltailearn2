import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts';
import { cn } from '../../utils/cn';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  actions?: React.ReactNode;
}

export function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  className,
  delay = 0,
  actions 
}: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 transition-all duration-300',
        'bg-gradient-to-br from-slate-800/95 to-slate-900/95',
        'border border-white/10 backdrop-blur-xl',
        'hover:border-white/20 hover:shadow-2xl',
        className
      )}
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, 
            rgba(59, 130, 246, 0.05) 0%, 
            rgba(16, 185, 129, 0.05) 50%, 
            rgba(168, 85, 247, 0.05) 100%)`
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(168, 85, 247, 0.05) 100%)',
            'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(16, 185, 129, 0.05) 100%)',
            'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            {subtitle && (
              <p className="text-slate-400 text-sm">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface PerformanceChartProps {
  data: Array<{
    epoch: number;
    accuracy: number;
    loss: number;
    time: string;
  }>;
  delay?: number;
}

export function PerformanceChart({ data, delay = 0 }: PerformanceChartProps) {
  return (
    <ChartContainer
      title="عملکرد آموزش"
      subtitle="دقت و خطا در طول زمان"
      delay={delay}
      actions={
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
        >
          <span className="text-slate-400 text-sm">تمام صفحه</span>
        </motion.button>
      }
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="epoch" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                color: '#f9fafb',
                backdropFilter: 'blur(16px)'
              }}
              labelStyle={{ color: '#d1d5db' }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#accuracyGradient)"
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#lossGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

interface CategoryDistributionProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    models: number;
    documents: number;
  }>;
  delay?: number;
}

export function CategoryDistribution({ data, delay = 0 }: CategoryDistributionProps) {
  return (
    <ChartContainer
      title="توزیع دسته‌بندی قوانین"
      subtitle="تعداد مدل‌ها و اسناد در هر دسته"
      delay={delay}
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              dataKey="value"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                color: '#f9fafb',
                backdropFilter: 'blur(16px)'
              }}
              formatter={(value: any, name: any, props: any) => [
                `${value} مدل`,
                props.payload.name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 + index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30"
          >
            <div 
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{item.name}</div>
              <div className="text-slate-400 text-xs">
                {item.models} مدل • {item.documents.toLocaleString('fa-IR')} سند
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ChartContainer>
  );
}

interface SystemMetricsProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    icon: React.ReactNode;
  }>;
  delay?: number;
}

export function SystemMetrics({ data, delay = 0 }: SystemMetricsProps) {
  return (
    <ChartContainer
      title="وضعیت سیستم"
      subtitle="استفاده از منابع در زمان واقعی"
      delay={delay}
    >
      <div className="grid grid-cols-2 gap-6">
        {data.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.1 + index * 0.1 }}
            className="relative group/item"
          >
            {/* Mini Glow */}
            <div 
              className="absolute inset-0 rounded-xl blur-lg group-hover/item:blur-xl transition-all duration-300 opacity-60"
              style={{ backgroundColor: `${metric.color}20` }}
            />
            
            <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-slate-300">
                    {metric.icon}
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{metric.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{metric.value}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1.5, delay: delay + 0.3 + index * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full shadow-lg relative"
                  style={{ 
                    background: `linear-gradient(90deg, ${metric.color}, ${metric.color}CC)`
                  }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ChartContainer>
  );
}

interface RadialProgressProps {
  title: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function RadialProgress({ 
  title, 
  value, 
  max = 100, 
  color = '#10b981',
  icon,
  delay = 0 
}: RadialProgressProps) {
  const percentage = (value / max) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/30 backdrop-blur-xl"
    >
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
              transition={{ duration: 2, delay: delay + 0.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {icon && (
                <div className="text-2xl mb-1">{icon}</div>
              )}
              <div className="text-2xl font-bold text-white">{value}%</div>
              <div className="text-xs text-slate-400">{title}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface RealTimeChartProps {
  data: Array<{
    time: string;
    value: number;
  }>;
  color?: string;
  delay?: number;
}

export function RealTimeChart({ data, color = '#3b82f6', delay = 0 }: RealTimeChartProps) {
  return (
    <ChartContainer
      title="داده‌های زمان واقعی"
      subtitle="آخرین بروزرسانی: اکنون"
      delay={delay}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                color: '#f9fafb',
                backdropFilter: 'blur(16px)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}