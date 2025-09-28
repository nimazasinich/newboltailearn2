/**
 * Comprehensive Error Handling and Recovery System
 * Phase 4 - Worker Threads Implementation
 *
 * Handles worker crashes, recovery, and graceful degradation
 */
import { Worker } from 'worker_threads';
import Database from 'better-sqlite3';
export interface WorkerError {
    workerId: string;
    error: string;
    stack?: string;
    timestamp: string;
    recoveryAttempts: number;
    lastRecoveryAttempt?: string;
    status: 'active' | 'recovering' | 'failed' | 'terminated';
}
export interface RecoveryStrategy {
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
    maxBackoffDelay: number;
    fallbackToMainThread: boolean;
}
export declare class WorkerErrorHandler {
    private db;
    private errors;
    private recoveryStrategies;
    private errorHandlers?;
    private defaultStrategy;
    constructor(db: Database.Database);
    cleanup(): void;
    private setupErrorHandling;
    /**
     * Handle worker error
     */
    handleWorkerError(worker: Worker, error: Error): void;
    /**
     * Handle worker exit
     */
    handleWorkerExit(worker: Worker, code: number, signal: string): void;
    /**
     * Handle main thread error
     */
    private handleMainThreadError;
    /**
     * Attempt worker recovery
     */
    private attemptRecovery;
    /**
     * Log error to database
     */
    private logError;
    /**
     * Clean up old errors
     */
    private cleanupOldErrors;
    /**
     * Get worker error statistics
     */
    getErrorStatistics(): {
        totalErrors: number;
        activeErrors: number;
        failedWorkers: number;
        recoveringWorkers: number;
        errorRate: number;
        averageRecoveryTime: number;
    };
    /**
     * Get worker health status
     */
    getWorkerHealthStatus(workerId: string): {
        status: 'healthy' | 'warning' | 'critical' | 'unknown';
        lastError?: WorkerError;
        recoveryAttempts: number;
        uptime: number;
    };
    /**
     * Set recovery strategy for a worker
     */
    setRecoveryStrategy(workerId: string, strategy: RecoveryStrategy): void;
    /**
     * Get error history
     */
    getErrorHistory(hours?: number): any[];
    /**
     * Force recovery of a worker
     */
    forceRecovery(workerId: string): Promise<boolean>;
    /**
     * Get system health summary
     */
    getSystemHealthSummary(): {
        overall: 'healthy' | 'warning' | 'critical';
        workers: {
            total: number;
            healthy: number;
            warning: number;
            critical: number;
        };
        recommendations: string[];
    };
}
//# sourceMappingURL=errorHandler.d.ts.map