import React from 'react';
import { Brain, TrendingUp, Shield, Target } from 'lucide-react';

interface ZenHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
}

export function ZenHeader({ title, subtitle, description, stats }: ZenHeaderProps) {
  return (
    <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-blue-500 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="relative z-10 px-8 py-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Simple Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-8">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Clean Title */}
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-slate-100 mb-4 tracking-wide">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 font-light">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-slate-500 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
              {description}
            </p>
          )}

          {/* Simple Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
