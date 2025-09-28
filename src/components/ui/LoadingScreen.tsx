import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export function LoadingScreen({ 
  message = "در حال بارگذاری سیستم هوش مصنوعی حقوقی...", 
  subMessage = "لطفاً صبر کنید" 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8"
      >
        {/* Main Loading Animation */}
        <div className="relative">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto border-4 border-slate-700 border-t-emerald-500 rounded-full"
          />
          
          {/* Inner Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-20 border-4 border-slate-600 border-t-blue-500 rounded-full"
          />
          
          {/* Center Icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <Brain className="w-8 h-8 text-emerald-400" />
          </motion.div>
          
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`
              }}
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-white font-persian"
          >
            {message}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-slate-400 text-lg"
          >
            {subMessage}
          </motion.p>
        </div>

        {/* Progress Indicator */}
        <div className="w-64 mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full"
          />
        </div>

        {/* Status Icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex justify-center space-x-6 space-x-reverse"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            className="flex items-center space-x-2 space-x-reverse text-emerald-400"
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm">پردازش</span>
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="flex items-center space-x-2 space-x-reverse text-blue-400"
          >
            <Brain className="w-5 h-5" />
            <span className="text-sm">هوش مصنوعی</span>
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="flex items-center space-x-2 space-x-reverse text-purple-400"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">آماده</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoadingScreen;