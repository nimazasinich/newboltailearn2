import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Progress({
  className,
  value = 0,
  max = 100,
  size = 'default',
  variant = 'default',
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    default: 'h-2',
    sm: 'h-1',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  };

  return (
    <div
      className={cn(
        'w-full bg-slate-200 rounded-full overflow-hidden',
        sizes[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out',
          variants[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}