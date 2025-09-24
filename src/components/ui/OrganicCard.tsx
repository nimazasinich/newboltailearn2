import React from 'react';
import { motion } from 'framer-motion';

interface OrganicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'blob' | 'wave' | 'bubble' | 'leaf';
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
  hover?: boolean;
}

export function OrganicCard({ 
  children, 
  className = '', 
  variant = 'blob',
  size = 'md',
  gradient = 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
  hover = true 
}: OrganicCardProps) {
  
  const shapes = {
    blob: {
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
    },
    wave: {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
      borderRadius: '25px'
    },
    bubble: {
      clipPath: 'circle(50% at 50% 50%)',
      borderRadius: '50%'
    },
    leaf: {
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      borderRadius: '0 100% 0 100%'
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      className={`
        relative bg-gradient-to-br ${gradient}
        ${sizeClasses[size]}
        ${hover ? 'hover:scale-105 hover:shadow-lg' : ''}
        transition-all duration-300
        ${className}
      `}
      style={shapes[variant]}
      whileHover={hover ? { scale: 1.02, rotateZ: 1 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-2 right-2 w-4 h-4 bg-white/50 rounded-full blur-sm" />
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-md" />
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white/20 rounded-full blur-lg transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

