import React from 'react';
import { motion } from 'framer-motion';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'flat' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function ModernCard({ 
  children, 
  className = '', 
  variant = 'flat',
  size = 'md',
  hover = true 
}: ModernCardProps) {
  const baseClasses = 'bg-white dark:bg-slate-900 rounded-2xl transition-all duration-200';
  
  const variantClasses = {
    flat: 'border-0',
    outlined: 'border border-slate-200 dark:border-slate-700',
    elevated: 'shadow-sm hover:shadow-md'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : '';

  return (
    <div className={`
      ${baseClasses} 
      ${variantClasses[variant]} 
      ${sizeClasses[size]} 
      ${hoverClasses} 
      ${className}
    `}>
      {children}
    </div>
  );
}
