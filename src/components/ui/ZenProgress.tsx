import React from 'react';

interface ZenProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  organic?: boolean;
  className?: string;
}

export function ZenProgress({ 
  value, 
  max = 100, 
  variant = 'default',
  size = 'md',
  showValue = false,
  animated = true,
  organic = false,
  className = '' 
}: ZenProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantClasses = {
    default: 'from-slate-400 to-slate-600',
    success: 'from-emerald-400 via-emerald-500 to-emerald-600',
    warning: 'from-amber-400 via-amber-500 to-orange-500',
    error: 'from-rose-400 via-rose-500 to-red-600',
    info: 'from-sky-400 via-blue-500 to-indigo-600',
    gradient: 'from-violet-400 via-purple-500 to-indigo-600'
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4'
  };

  const backgroundClasses = {
    sm: 'h-1.5',
    md: 'h-3', 
    lg: 'h-4'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        w-full bg-slate-100 dark:bg-slate-800 
        ${backgroundClasses[size]} 
        ${organic ? 'rounded-full' : 'rounded-lg'}
        overflow-hidden
        ${animated ? 'transition-all duration-300' : ''}
      `}>
        <div
          className={`
            ${sizeClasses[size]} 
            bg-gradient-to-r ${variantClasses[variant]}
            ${organic ? 'rounded-full' : 'rounded-lg'}
            ${animated ? 'transition-all duration-700 ease-out' : ''}
            relative overflow-hidden
          `}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>
      {showValue && (
        <div className="absolute right-0 top-0 transform translate-y-full mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          {value}{max === 100 ? '%' : ` / ${max}`}
        </div>
      )}
    </div>
  );
}

