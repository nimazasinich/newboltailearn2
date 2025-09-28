import { Request, Response, NextFunction } from 'express';
import { Application } from 'express';
declare class MetricsCollector {
    private metrics;
    private startTime;
    private cpuUsageStart;
    constructor();
    private initializeMetrics;
    /**
     * Middleware to collect HTTP metrics
     */
    collectHttpMetrics(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Normalize path to avoid cardinality explosion
     */
    private normalizePath;
    /**
     * Update system metrics
     */
    updateSystemMetrics(): void;
    /**
     * Update application metrics
     */
    updateApplicationMetrics(data: Partial<{
        activeConnections: number;
        activeSessions: number;
        trainingSessionsTotal: number;
        trainingSessionsActive: number;
        datasetsTotal: number;
        modelsTotal: number;
    }>): void;
    /**
     * Record error
     */
    recordError(type: string): void;
    /**
     * Get metrics in Prometheus format
     */
    getPrometheusMetrics(): string;
}
declare const metricsCollector: MetricsCollector;
/**
 * Setup metrics endpoint
 */
export declare function setupMetrics(app: Application): void;
/**
 * Export metrics collector for use in other modules
 */
export { metricsCollector };
//# sourceMappingURL=metrics.d.ts.map