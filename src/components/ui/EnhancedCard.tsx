import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'glow';
  hover?: boolean;
  glowColor?: 'blue' | 'emerald' | 'purple' | 'cyan';
  delay?: number;
  onClick?: () => void;
}

const variants = {
  default: 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600/30',
  glass: 'glass-dark',
  gradient: 'bg-gradient-multi',
  glow: 'bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-600/30'
};

const glowVariants = {
  blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
  emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
  purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
  cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
};

export function EnhancedCard({ 
  children, 
  className, 
  variant = 'default', 
  hover = true, 
  glowColor = 'blue',
  delay = 0,
  onClick 
}: EnhancedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 transition-all duration-300 cursor-pointer',
        'border backdrop-blur-xl',
        variants[variant],
        hover && glowVariants[glowColor],
        className
      )}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(16, 185, 129, 0.1) 50%, 
            rgba(168, 85, 247, 0.1) 100%)`
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
            'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
        }}
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, 
            rgba(59, 130, 246, 0.3), 
            rgba(16, 185, 129, 0.3), 
            rgba(168, 85, 247, 0.3))`,
          padding: '1px'
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-full rounded-3xl bg-slate-900/90" />
      </motion.div>
    </motion.div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'emerald' | 'purple' | 'cyan' | 'orange';
  delay?: number;
  onClick?: () => void;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'blue',
  delay = 0,
  onClick 
}: MetricCardProps) {
  const colorVariants = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
      text: 'text-blue-400'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
      text: 'text-emerald-400'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
      text: 'text-purple-400'
    },
    cyan: {
      gradient: 'from-cyan-500 to-cyan-600',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
      text: 'text-cyan-400'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]',
      text: 'text-orange-400'
    }
  };

  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -12, 
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 transition-all duration-300 cursor-pointer',
        'bg-gradient-to-br from-slate-800/90 to-slate-900/90',
        'border border-slate-600/30 backdrop-blur-xl',
        'hover:border-slate-500/50',
        colorVariants[color].glow
      )}
    >
      {/* Animated Background */}
      <motion.div
        className={cn('absolute inset-0 opacity-20')}
        style={{
          background: `linear-gradient(135deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(16, 185, 129, 0.1) 50%, 
            rgba(168, 85, 247, 0.1) 100%)`
        }}
        animate={{
          background: [
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
            'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)'
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
        }}
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={cn('p-3 rounded-2xl bg-gradient-to-r', colorVariants[color].gradient)}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
          
          {trend && (
            <motion.div
              className={cn('text-sm font-semibold px-3 py-1 rounded-full bg-slate-700/50', trendColors[trend.direction])}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {trend.direction === 'up' && '↗ '}
              {trend.direction === 'down' && '↘ '}
              {trend.value}
            </motion.div>
          )}
        </div>
        
        <motion.div
          className="text-4xl font-bold text-white mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.div>
        
        <div className="text-slate-300 text-sm font-medium">
          {title}
        </div>
      </div>
    </motion.div>
  );
}

interface ProgressCardProps {
  title: string;
  value: number;
  max?: number;
  color?: 'blue' | 'emerald' | 'purple' | 'cyan';
  animated?: boolean;
  delay?: number;
}

export function ProgressCard({ 
  title, 
  value, 
  max = 100, 
  color = 'blue',
  animated = true,
  delay = 0 
}: ProgressCardProps) {
  const percentage = (value / max) * 100;
  
  const colorVariants = {
    blue: 'from-blue-500 to-blue-400',
    emerald: 'from-emerald-500 to-emerald-400',
    purple: 'from-purple-500 to-purple-400',
    cyan: 'from-cyan-500 to-cyan-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/30 backdrop-blur-xl"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-300 text-sm font-medium">{title}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      
      <div className="relative w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full bg-gradient-to-r rounded-full', colorVariants[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0.3, 
            delay: delay + 0.2,
            ease: "easeOut"
          }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}