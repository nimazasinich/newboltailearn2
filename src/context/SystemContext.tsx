import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API } from '../services/api';
import { WSConnectionStatus } from '../lib/ws-events';

interface HealthCheck {
  timestamp: number;
  status: 'online' | 'offline';
  responseTime?: number;
  error?: string;
}

interface SystemContextType {
  status: 'online' | 'offline';
  connectionStatus: WSConnectionStatus;
  healthHistory: HealthCheck[];
  lastHealthCheck: HealthCheck | null;
  setStatus: (status: 'online' | 'offline') => void;
  setConnectionStatus: (status: WSConnectionStatus) => void;
  addHealthCheck: (check: HealthCheck) => void;
  clearHealthHistory: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

interface SystemProviderProps {
  children: ReactNode;
}

function SystemProvider({ children }: SystemProviderProps) {
  const [status, setStatus] = useState<'online' | 'offline'>('online');
  const [connectionStatus, setConnectionStatus] = useState<WSConnectionStatus>('disconnected');
  const [healthHistory, setHealthHistory] = useState<HealthCheck[]>([]);
  const [lastHealthCheck, setLastHealthCheck] = useState<HealthCheck | null>(null);

  const addHealthCheck = (check: HealthCheck) => {
    setLastHealthCheck(check);
    setHealthHistory(prev => {
      const newHistory = [check, ...prev].slice(0, 10); // Keep last 10 checks
      return newHistory;
    });
  };

  const clearHealthHistory = () => {
    setHealthHistory([]);
    setLastHealthCheck(null);
  };

  // Health check interval
  useEffect(() => {
    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        await API.health();
        const responseTime = Date.now() - startTime;
        const check: HealthCheck = {
          timestamp: Date.now(),
          status: 'online',
          responseTime
        };
        setStatus('online');
        addHealthCheck(check);
      } catch (error) {
        const check: HealthCheck = {
          timestamp: Date.now(),
          status: 'offline',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        setStatus('offline');
        addHealthCheck(check);
      }
    };

    // Initial check
    checkHealth();

    // Set up interval
    const healthInterval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  const value: SystemContextType = {
    status,
    connectionStatus,
    healthHistory,
    lastHealthCheck,
    setStatus,
    setConnectionStatus,
    addHealthCheck,
    clearHealthHistory
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}

// System status hook for components
export function useSystemStatus() {
  const { status, connectionStatus, lastHealthCheck, healthHistory } = useSystem();
  
  const getStatusColor = () => {
    if (status === 'offline' || connectionStatus === 'error') return 'red';
    if (connectionStatus === 'connecting') return 'yellow';
    return 'green';
  };

  const getStatusText = () => {
    if (status === 'offline') return 'آفلاین';
    if (connectionStatus === 'connecting') return 'در حال اتصال';
    if (connectionStatus === 'error') return 'خطا در اتصال';
    return 'آنلاین';
  };

  const getAverageResponseTime = () => {
    const onlineChecks = healthHistory.filter(check => check.status === 'online' && check.responseTime);
    if (onlineChecks.length === 0) return null;
    
    const totalTime = onlineChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0);
    return Math.round(totalTime / onlineChecks.length);
  };

  return {
    status,
    connectionStatus,
    lastHealthCheck,
    healthHistory,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
    averageResponseTime: getAverageResponseTime(),
    isHealthy: status === 'online' && connectionStatus === 'connected'
  };
}

// Named export for stable API
export { SystemProvider };

// Default export for Fast Refresh compatibility
export default SystemProvider;
