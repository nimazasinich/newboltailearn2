import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { API } from '../../services/api';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await API.health();
        setSystemStatus('online');
      } catch {
        setSystemStatus('offline');
      }
    };
    
    checkHealth();
    const healthInterval = setInterval(checkHealth, 30000);
    
    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900" dir="rtl">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 lg:mr-80">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                سامانه هوش مصنوعی حقوقی ایران
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                systemStatus === 'online' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {systemStatus === 'online' ? 'آنلاین' : 'آفلاین'}
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}