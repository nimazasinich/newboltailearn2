import Database from 'better-sqlite3';
import { Logger } from './Logger';
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: ServiceHealth;
        filesystem: ServiceHealth;
        memory: ServiceHealth;
        disk: ServiceHealth;
        models: ServiceHealth;
    };
    metrics: {
        uptime: number;
        memoryUsage: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
            arrayBuffers: number;
        };
        cpuUsage: number;
        activeConnections: number;
        totalRequests: number;
        errorRate: number;
    };
}
export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    lastCheck: string;
    responseTime?: number;
    details?: any;
}
export interface PerformanceMetrics {
    timestamp: string;
    memoryUsage: any;
    cpuUsage: number;
    activeConnections: number;
    totalRequests: number;
    errorCount: number;
    averageResponseTime: number;
}
export declare class HealthMonitor {
    private db;
    private logger;
    private startTime;
    private metrics;
    private maxMetricsHistory;
    private requestCount;
    private errorCount;
    private responseTimes;
    private maxResponseTimeHistory;
    constructor(database: Database.Database, logger: Logger);
    private initializeMonitoring;
    private startPeriodicHealthChecks;
    /**
     * Get overall health status
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * Check all services
     */
    private checkAllServices;
    /**
     * Check database health
     */
    private checkDatabase;
    /**
     * Check filesystem health
     */
    private checkFilesystem;
    /**
     * Check memory health
     */
    private checkMemory;
    /**
     * Check disk health
     */
    private checkDisk;
    /**
     * Check models health
     */
    private checkModels;
    /**
     * Get current performance metrics
     */
    private getCurrentMetrics;
    /**
     * Record request metrics
     */
    recordRequest(duration: number, isError?: boolean): void;
    /**
     * Record performance metrics
     */
    private recordMetrics;
    /**
     * Record health check
     */
    private recordHealthCheck;
    /**
     * Get CPU usage (simplified)
     */
    private getCpuUsage;
    /**
     * Get free disk space
     */
    private getFreeDiskSpace;
    /**
     * Format bytes to human readable format
     */
    private formatBytes;
    /**
     * Get metrics history
     */
    getMetricsHistory(hours?: number): PerformanceMetrics[];
    /**
     * Get health check history
     */
    getHealthHistory(hours?: number): HealthStatus[];
    /**
     * Clean old metrics and health checks
     */
    cleanOldData(daysToKeep?: number): {
        metricsDeleted: number;
        healthChecksDeleted: number;
    };
}
//# sourceMappingURL=HealthMonitor.d.ts.map