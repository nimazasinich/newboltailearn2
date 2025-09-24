import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap,
  Star,
  Crown,
  Gem
} from 'lucide-react';

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
  }>;
}

export function PremiumHeader({ title, subtitle, description, stats }: PremiumHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-32 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-400/20 to-red-400/20 blur-xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/20 to-teal-400/20 blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Content */}
          <div className="text-center mb-12">
            {/* Icon & Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-60"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-persian)' }}
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                {title}
              </span>
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-xl md:text-2xl font-semibold text-blue-100">
                  {subtitle}
                </span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            )}

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed"
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Stats Grid */}
          {stats && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      {stat.icon && (
                        <div className="text-white/80">
                          {stat.icon}
                        </div>
                      )}
                      {stat.trend && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          stat.trend === 'up' ? 'bg-green-500/20 text-green-300' :
                          stat.trend === 'down' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          <TrendingUp className={`w-3 h-3 ${
                            stat.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                          {stat.trend === 'up' ? '+' : stat.trend === 'down' ? '-' : '~'}
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-blue-100/70 text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Decorative Elements */}
          <div className="absolute top-8 left-8 opacity-20">
            <Gem className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute top-16 right-12 opacity-20">
            <Star className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute bottom-12 left-16 opacity-20">
            <Zap className="w-7 h-7 text-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-8 right-8 opacity-20">
            <Shield className="w-8 h-8 text-green-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-gray-50 dark:text-gray-900"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
