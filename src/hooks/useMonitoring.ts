import { useState, useEffect, useCallback } from 'react';
import { apiClient, onSystemMetrics, connectSocket, disconnectSocket } from '../services/api';

export interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  process_memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  system_uptime: number;
  platform: string;
  arch: string;
  timestamp: string;
  active_training: number;
  training: {
    active: number;
    total: number;
    completed: number;
    failed: number;
    success_rate: string;
  };
  datasets: {
    available: number;
    downloading: number;
    total: number;
  };
  activity: Record<string, number>;
}

export interface MonitoringData {
  metrics: SystemMetrics;
  logs: any[];
  alerts: any[];
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export function useMonitoring() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial monitoring data
  const loadMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      const [metrics, logs] = await Promise.all([
        apiClient.getMonitoring(),
        apiClient.getLogs({ type: 'system', limit: 50 })
      ]);

      setMonitoringData({
        metrics,
        logs,
        alerts: [], // Would be populated from backend
        performance: {
          responseTime: 0, // Would be calculated from metrics
          throughput: 0,
          errorRate: 0
        }
      });
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری داده‌های نظارت';
      setError(errorMessage);
      console.error('Error loading monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up WebSocket connection and real-time updates
  useEffect(() => {
    // Connect to WebSocket
    connectSocket();
    setIsConnected(true);

    // Set up real-time metrics listener
    const unsubscribeMetrics = onSystemMetrics((data: SystemMetrics) => {
      setMonitoringData(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          metrics: data
        };
      });
    });

    // Load initial data
    loadMonitoringData();

    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(loadMonitoringData, 30000);

    return () => {
      unsubscribeMetrics();
      clearInterval(refreshInterval);
      disconnectSocket();
      setIsConnected(false);
    };
  }, [loadMonitoringData]);

  // Get system health status
  const getSystemHealth = useCallback((): 'healthy' | 'warning' | 'critical' => {
    if (!monitoringData?.metrics) return 'healthy';

    const { cpu, memory, process_memory } = monitoringData.metrics;

    // Critical conditions
    if (cpu > 90 || memory.percentage > 95 || process_memory.percentage > 95) {
      return 'critical';
    }

    // Warning conditions
    if (cpu > 70 || memory.percentage > 80 || process_memory.percentage > 80) {
      return 'warning';
    }

    return 'healthy';
  }, [monitoringData]);

  // Get training status summary
  const getTrainingStatus = useCallback(() => {
    if (!monitoringData?.metrics) {
      return {
        active: 0,
        total: 0,
        completed: 0,
        failed: 0,
        successRate: 0
      };
    }

    const { training } = monitoringData.metrics;
    return {
      active: training.active,
      total: training.total,
      completed: training.completed,
      failed: training.failed,
      successRate: parseFloat(training.success_rate) || 0
    };
  }, [monitoringData]);

  // Get dataset status summary
  const getDatasetStatus = useCallback(() => {
    if (!monitoringData?.metrics) {
      return {
        available: 0,
        downloading: 0,
        total: 0
      };
    }

    return monitoringData.metrics.datasets;
  }, [monitoringData]);

  // Get recent activity summary
  const getRecentActivity = useCallback(() => {
    if (!monitoringData?.metrics) {
      return {
        info: 0,
        warning: 0,
        error: 0,
        debug: 0
      };
    }

    return monitoringData.metrics.activity;
  }, [monitoringData]);

  // Export monitoring data
  const exportMonitoringData = useCallback(async (format: 'csv' | 'json' = 'csv', timeRange: string = '24h') => {
    try {
      await apiClient.exportMonitoring(format, timeRange);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در صادرات داده‌های نظارت';
      setError(errorMessage);
      console.error('Error exporting monitoring data:', err);
    }
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (!monitoringData?.metrics) {
      return {
        cpuUsage: 0,
        memoryUsage: 0,
        activeTraining: 0,
        uptime: 0
      };
    }

    const { cpu, memory, active_training, uptime } = monitoringData.metrics;
    
    return {
      cpuUsage: cpu,
      memoryUsage: memory.percentage,
      activeTraining: active_training,
      uptime: Math.floor(uptime / 3600) // Convert to hours
    };
  }, [monitoringData]);

  // Get system alerts (simplified)
  const getSystemAlerts = useCallback(() => {
    const alerts = [];
    const health = getSystemHealth();
    
    if (health === 'critical') {
      alerts.push({
        id: 'system_critical',
        type: 'error',
        message: 'سیستم در وضعیت بحرانی قرار دارد',
        timestamp: new Date().toISOString()
      });
    } else if (health === 'warning') {
      alerts.push({
        id: 'system_warning',
        type: 'warning',
        message: 'سیستم در وضعیت هشدار قرار دارد',
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }, [getSystemHealth]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh data manually
  const refresh = useCallback(() => {
    loadMonitoringData();
  }, [loadMonitoringData]);

  return {
    monitoringData,
    loading,
    error,
    isConnected,
    getSystemHealth,
    getTrainingStatus,
    getDatasetStatus,
    getRecentActivity,
    getPerformanceMetrics,
    getSystemAlerts,
    exportMonitoringData,
    clearError,
    refresh
  };
}