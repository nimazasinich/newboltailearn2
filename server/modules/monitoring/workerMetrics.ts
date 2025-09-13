/**
 * Worker Performance Monitoring System
 * Phase 4 - Worker Threads Implementation
 * 
 * Monitors worker thread performance, memory usage, and responsiveness
 */

import { WorkerMetrics, WorkerPoolStatus } from '../workers/types.js';
import Database from 'better-sqlite3';

export interface PerformanceAlert {
  id: string;
  type: 'memory' | 'cpu' | 'latency' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
}

export interface SystemPerformanceMetrics {
  mainThreadResponseTime: number;
  workerMemoryUsage: number;
  messagePassingLatency: number;
  trainingThroughput: number;
  errorRate: number;
  activeWorkers: number;
  totalWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  timestamp: string;
}

export class WorkerPerformanceMonitor {
  private db: Database.Database;
  private metrics: SystemPerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private alertThresholds = {
    memoryUsage: 512, // MB
    cpuUsage: 80, // percentage
    responseTime: 100, // ms
    errorRate: 5, // percentage
    messageLatency: 50 // ms
  };

  constructor(db: Database.Database) {
    this.db = db;
    this.metrics = this.initializeMetrics();
    this.setupPerformanceMonitoring();
  }

  private initializeMetrics(): SystemPerformanceMetrics {
    return {
      mainThreadResponseTime: 0,
      workerMemoryUsage: 0,
      messagePassingLatency: 0,
      trainingThroughput: 0,
      errorRate: 0,
      activeWorkers: 0,
      totalWorkers: 0,
      queuedTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      timestamp: new Date().toISOString()
    };
  }

  private setupPerformanceMonitoring(): void {
    // Monitor main thread responsiveness
    setInterval(() => {
      this.monitorMainThreadResponsiveness();
    }, 1000);

    // Monitor system resources
    setInterval(() => {
      this.monitorSystemResources();
    }, 5000);

    // Check for performance alerts
    setInterval(() => {
      this.checkPerformanceAlerts();
    }, 10000);

    // Clean up old metrics
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // 5 minutes
  }

  /**
   * Monitor main thread responsiveness
   */
  private monitorMainThreadResponsiveness(): void {
    const startTime = process.hrtime.bigint();
    
    // Perform a quick operation to measure response time
    setImmediate(() => {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      this.metrics.mainThreadResponseTime = responseTime;
      this.metrics.timestamp = new Date().toISOString();
      
      // Log to database
      this.logPerformanceMetric('main_thread_response_time', responseTime);
    });
  }

  /**
   * Monitor system resources
   */
  private monitorSystemResources(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.workerMemoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
    
    // Log to database
    this.logPerformanceMetric('memory_usage', this.metrics.workerMemoryUsage);
    this.logPerformanceMetric('heap_total', memUsage.heapTotal / 1024 / 1024);
    this.logPerformanceMetric('external', memUsage.external / 1024 / 1024);
  }

  /**
   * Update worker metrics
   */
  updateWorkerMetrics(workerMetrics: WorkerMetrics[]): void {
    if (workerMetrics.length === 0) return;

    const totalMemory = workerMetrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const totalCpu = workerMetrics.reduce((sum, m) => sum + m.cpuUsage, 0);
    const totalCompleted = workerMetrics.reduce((sum, m) => sum + m.completedTasks, 0);
    const totalFailed = workerMetrics.reduce((sum, m) => sum + m.failedTasks, 0);
    const activeWorkers = workerMetrics.filter(m => m.activeTasks > 0).length;

    this.metrics.workerMemoryUsage = totalMemory / workerMetrics.length;
    this.metrics.trainingThroughput = totalCompleted;
    this.metrics.errorRate = totalCompleted > 0 ? (totalFailed / totalCompleted) * 100 : 0;
    this.metrics.activeWorkers = activeWorkers;
    this.metrics.totalWorkers = workerMetrics.length;
    this.metrics.timestamp = new Date().toISOString();

    // Log to database
    this.logPerformanceMetric('worker_memory_usage', this.metrics.workerMemoryUsage);
    this.logPerformanceMetric('worker_cpu_usage', totalCpu / workerMetrics.length);
    this.logPerformanceMetric('training_throughput', this.metrics.trainingThroughput);
    this.logPerformanceMetric('error_rate', this.metrics.errorRate);
    
    // Check for performance alerts after updating metrics
    this.checkPerformanceAlerts();
  }

  /**
   * Update worker pool status
   */
  updateWorkerPoolStatus(status: WorkerPoolStatus): void {
    this.metrics.activeWorkers = status.activeWorkers;
    this.metrics.totalWorkers = status.totalWorkers;
    this.metrics.queuedTasks = status.queuedTasks;
    this.metrics.completedTasks = status.completedTasks;
    this.metrics.failedTasks = status.failedTasks;
    this.metrics.messagePassingLatency = status.averageResponseTime;
    this.metrics.timestamp = new Date().toISOString();

    // Log to database
    this.logPerformanceMetric('queued_tasks', status.queuedTasks);
    this.logPerformanceMetric('message_latency', status.averageResponseTime);
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(): void {
    const alerts: PerformanceAlert[] = [];

    // Check memory usage
    if (this.metrics.workerMemoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push({
        id: `memory_${Date.now()}`,
        type: 'memory',
        severity: this.metrics.workerMemoryUsage > this.alertThresholds.memoryUsage * 1.5 ? 'critical' : 'high',
        message: `Worker memory usage exceeded threshold: ${this.metrics.workerMemoryUsage.toFixed(2)}MB > ${this.alertThresholds.memoryUsage}MB`,
        threshold: this.alertThresholds.memoryUsage,
        currentValue: this.metrics.workerMemoryUsage,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Check response time
    if (this.metrics.mainThreadResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        id: `response_${Date.now()}`,
        type: 'latency',
        severity: this.metrics.mainThreadResponseTime > this.alertThresholds.responseTime * 2 ? 'critical' : 'high',
        message: `Main thread response time exceeded threshold: ${this.metrics.mainThreadResponseTime.toFixed(2)}ms > ${this.alertThresholds.responseTime}ms`,
        threshold: this.alertThresholds.responseTime,
        currentValue: this.metrics.mainThreadResponseTime,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Check error rate
    if (this.metrics.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        id: `error_rate_${Date.now()}`,
        type: 'error_rate',
        severity: this.metrics.errorRate > this.alertThresholds.errorRate * 2 ? 'critical' : 'high',
        message: `Error rate exceeded threshold: ${this.metrics.errorRate.toFixed(2)}% > ${this.alertThresholds.errorRate}%`,
        threshold: this.alertThresholds.errorRate,
        currentValue: this.metrics.errorRate,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Add new alerts
    this.alerts.push(...alerts);

    // Log alerts to database
    alerts.forEach(alert => {
      this.logAlert(alert);
    });
  }

  /**
   * Log performance metric to database
   */
  private logPerformanceMetric(metric: string, value: number): void {
    try {
      // Check if database connection is still open
      if (!this.db || this.db.open === false) {
        return; // Silently skip if database is closed
      }
      
      this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES ('info', 'performance', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        `Performance metric: ${metric}`,
        JSON.stringify({ metric, value, timestamp: new Date().toISOString() })
      );
    } catch (error) {
      // Only log error if it's not a connection closed error
      if (!error.message.includes('database connection is not open')) {
        console.error('Failed to log performance metric:', error);
      }
    }
  }

  /**
   * Log alert to database
   */
  private logAlert(alert: PerformanceAlert): void {
    try {
      this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES (?, 'alert', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        alert.severity === 'critical' ? 'error' : 'warning',
        `Performance alert: ${alert.message}`,
        JSON.stringify(alert)
      );
    } catch (error) {
      console.error('Failed to log alert:', error);
    }
  }

  /**
   * Clean up old metrics and alerts
   */
  private cleanupOldMetrics(): void {
    try {
      // Remove alerts older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      this.alerts = this.alerts.filter(alert => alert.timestamp > oneHourAgo);

      // Remove old performance logs from database (older than 24 hours)
      this.db.prepare(`
        DELETE FROM system_logs 
        WHERE category = 'performance' 
        AND timestamp < datetime('now', '-24 hours')
      `).run();

      console.log('Cleaned up old performance metrics');
    } catch (error) {
      console.error('Failed to cleanup old metrics:', error);
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): SystemPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(hours: number = 24): any[] {
    try {
      return this.db.prepare(`
        SELECT * FROM system_logs 
        WHERE category = 'performance' 
        AND timestamp >= datetime('now', '-${hours} hours')
        ORDER BY timestamp DESC
        LIMIT 1000
      `).all();
    } catch (error) {
      console.error('Failed to get performance history:', error);
      return [];
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(hours: number = 24): any[] {
    try {
      return this.db.prepare(`
        SELECT * FROM system_logs 
        WHERE category = 'alert' 
        AND timestamp >= datetime('now', '-${hours} hours')
        ORDER BY timestamp DESC
        LIMIT 100
      `).all();
    } catch (error) {
      console.error('Failed to get alert history:', error);
      return [];
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    
    // Log threshold update
    this.logPerformanceMetric('thresholds_updated', 1);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemPerformanceMetrics;
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (highAlerts.length > 0) {
      status = 'warning';
    }

    const recommendations: string[] = [];
    
    if (this.metrics.workerMemoryUsage > this.alertThresholds.memoryUsage * 0.8) {
      recommendations.push('Consider reducing worker pool size or increasing memory limits');
    }
    
    if (this.metrics.mainThreadResponseTime > this.alertThresholds.responseTime * 0.8) {
      recommendations.push('Main thread is under stress - consider optimizing operations');
    }
    
    if (this.metrics.errorRate > this.alertThresholds.errorRate * 0.8) {
      recommendations.push('Error rate is high - investigate worker stability');
    }

    return {
      status,
      metrics: this.metrics,
      alerts: activeAlerts,
      recommendations
    };
  }
}