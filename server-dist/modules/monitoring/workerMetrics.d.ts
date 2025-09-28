/**
 * Worker Performance Monitoring System
 * Phase 4 - Worker Threads Implementation
 *
 * Monitors worker thread performance, memory usage, and responsiveness
 */
import { WorkerMetrics, WorkerPoolStatus } from '../workers/types';
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
export declare class WorkerPerformanceMonitor {
    private db;
    private metrics;
    private alerts;
    private alertThresholds;
    constructor(db: Database.Database);
    private initializeMetrics;
    private setupPerformanceMonitoring;
    /**
     * Monitor main thread responsiveness
     */
    private monitorMainThreadResponsiveness;
    /**
     * Monitor system resources
     */
    private monitorSystemResources;
    /**
     * Update worker metrics
     */
    updateWorkerMetrics(workerMetrics: WorkerMetrics[]): void;
    /**
     * Update worker pool status
     */
    updateWorkerPoolStatus(status: WorkerPoolStatus): void;
    /**
     * Check for performance alerts
     */
    private checkPerformanceAlerts;
    /**
     * Log performance metric to database
     */
    private logPerformanceMetric;
    /**
     * Log alert to database
     */
    private logAlert;
    /**
     * Clean up old metrics and alerts
     */
    private cleanupOldMetrics;
    /**
     * Get current performance metrics
     */
    getMetrics(): SystemPerformanceMetrics;
    /**
     * Get active alerts
     */
    getActiveAlerts(): PerformanceAlert[];
    /**
     * Get performance history
     */
    getPerformanceHistory(hours?: number): any[];
    /**
     * Get alert history
     */
    getAlertHistory(hours?: number): any[];
    /**
     * Resolve alert
     */
    resolveAlert(alertId: string): boolean;
    /**
     * Update alert thresholds
     */
    updateThresholds(thresholds: Partial<typeof this.alertThresholds>): void;
    /**
     * Get performance summary
     */
    getPerformanceSummary(): {
        status: 'healthy' | 'warning' | 'critical';
        metrics: SystemPerformanceMetrics;
        alerts: PerformanceAlert[];
        recommendations: string[];
    };
}
//# sourceMappingURL=workerMetrics.d.ts.map