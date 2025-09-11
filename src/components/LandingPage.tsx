import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleStart = async () => {
    // Auto-login as demo user for now
    try {
      await login({ email: 'admin@legal-ai.ir', password: 'demo' });
    } catch (error) {
      console.error('Login failed:', error);
      // Continue anyway for demo
    }
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center px-6" dir="rtl">
      {/* Simple background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}
          className="w-full h-full"
        />
      </div>

      {/* Subtle floating elements */}
      <div className="absolute top-1/4 start-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 end-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            هوش مصنوعی حقوقی ایران
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
        >
          آموزش مدل‌های پیشرفته با قوانین جمهوری اسلامی ایران
        </motion.p>

        {/* Stats - simple */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">۵۶۰K+</div>
            <div className="text-gray-400 text-sm">داده حقوقی</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">۱۵+</div>
            <div className="text-gray-400 text-sm">مدل آموزش‌دیده</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-400">۹۴%</div>
            <div className="text-gray-400 text-sm">دقت مدل</div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button
            onClick={handleStart}
            className="group px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
          >
            <span className="flex items-center gap-3">
              شروع آموزش
              <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}