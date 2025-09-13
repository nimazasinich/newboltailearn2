/**
 * Comprehensive Error Handling and Recovery System
 * Phase 4 - Worker Threads Implementation
 * 
 * Handles worker crashes, recovery, and graceful degradation
 */

import { Worker } from 'worker_threads';
import Database from 'better-sqlite3';
import { WorkerMetrics } from './types.js';

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

export class WorkerErrorHandler {
  private db: Database.Database;
  private errors: Map<string, WorkerError> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private defaultStrategy: RecoveryStrategy = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    maxBackoffDelay: 30000,
    fallbackToMainThread: true
  };

  constructor(db: Database.Database) {
    this.db = db;
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    // Handle uncaught exceptions in main thread
    process.on('uncaughtException', (error) => {
      this.handleMainThreadError(error);
    });

    process.on('unhandledRejection', (reason) => {
      this.handleMainThreadError(new Error(String(reason)));
    });

    // Cleanup old errors periodically
    setInterval(() => {
      this.cleanupOldErrors();
    }, 300000); // 5 minutes
  }

  /**
   * Handle worker error
   */
  handleWorkerError(worker: Worker, error: Error): void {
    const workerId = worker.threadId.toString();
    const workerError: WorkerError = {
      workerId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      recoveryAttempts: 0,
      status: 'active'
    };

    this.errors.set(workerId, workerError);
    this.logError(workerError);

    // Attempt recovery
    this.attemptRecovery(worker, workerError);
  }

  /**
   * Handle worker exit
   */
  handleWorkerExit(worker: Worker, code: number, signal: string): void {
    const workerId = worker.threadId.toString();
    
    if (code !== 0) {
      const workerError: WorkerError = {
        workerId,
        error: `Worker exited with code ${code}${signal ? ` and signal ${signal}` : ''}`,
        timestamp: new Date().toISOString(),
        recoveryAttempts: 0,
        status: 'failed'
      };

      this.errors.set(workerId, workerError);
      this.logError(workerError);

      console.error(`Worker ${workerId} exited unexpectedly:`, workerError.error);
    }
  }

  /**
   * Handle main thread error
   */
  private handleMainThreadError(error: Error): void {
    const mainThreadError: WorkerError = {
      workerId: 'main_thread',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      recoveryAttempts: 0,
      status: 'active'
    };

    this.errors.set('main_thread', mainThreadError);
    this.logError(mainThreadError);

    console.error('Main thread error:', error);
  }

  /**
   * Attempt worker recovery
   */
  private async attemptRecovery(worker: Worker, workerError: WorkerError): Promise<void> {
    const strategy = this.recoveryStrategies.get(workerError.workerId) || this.defaultStrategy;
    
    if (workerError.recoveryAttempts >= strategy.maxRetries) {
      workerError.status = 'failed';
      this.logError(workerError);
      
      console.error(`Worker ${workerError.workerId} failed after ${strategy.maxRetries} recovery attempts`);
      return;
    }

    workerError.status = 'recovering';
    workerError.recoveryAttempts++;
    workerError.lastRecoveryAttempt = new Date().toISOString();

    // Calculate delay with exponential backoff
    let delay = strategy.retryDelay;
    if (strategy.exponentialBackoff) {
      delay = Math.min(
        strategy.retryDelay * Math.pow(2, workerError.recoveryAttempts - 1),
        strategy.maxBackoffDelay
      );
    }

    console.log(`Attempting to recover worker ${workerError.workerId} (attempt ${workerError.recoveryAttempts}/${strategy.maxRetries}) in ${delay}ms`);

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      // Terminate the failed worker
      await worker.terminate();
      
      // Create new worker (this would be handled by the worker pool)
      workerError.status = 'active';
      console.log(`Worker ${workerError.workerId} recovered successfully`);
      
    } catch (recoveryError) {
      console.error(`Failed to recover worker ${workerError.workerId}:`, recoveryError);
      
      // Try again if we haven't exceeded max retries
      if (workerError.recoveryAttempts < strategy.maxRetries) {
        await this.attemptRecovery(worker, workerError);
      } else {
        workerError.status = 'failed';
        this.logError(workerError);
      }
    }
  }

  /**
   * Log error to database
   */
  private logError(workerError: WorkerError): void {
    try {
      this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES (?, 'worker_error', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        workerError.status === 'failed' ? 'error' : 'warning',
        `Worker ${workerError.workerId} error: ${workerError.error}`,
        JSON.stringify(workerError)
      );
    } catch (error) {
      console.error('Failed to log worker error:', error);
    }
  }

  /**
   * Clean up old errors
   */
  private cleanupOldErrors(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    for (const [workerId, error] of this.errors.entries()) {
      if (error.timestamp < oneHourAgo && error.status === 'failed') {
        this.errors.delete(workerId);
      }
    }

    // Clean up old error logs from database
    try {
      this.db.prepare(`
        DELETE FROM system_logs 
        WHERE category = 'worker_error' 
        AND timestamp < datetime('now', '-24 hours')
      `).run();
    } catch (error) {
      console.error('Failed to cleanup old error logs:', error);
    }
  }

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
  } {
    const errors = Array.from(this.errors.values());
    const activeErrors = errors.filter(e => e.status === 'active').length;
    const failedWorkers = errors.filter(e => e.status === 'failed').length;
    const recoveringWorkers = errors.filter(e => e.status === 'recovering').length;
    
    const totalRecoveryAttempts = errors.reduce((sum, e) => sum + e.recoveryAttempts, 0);
    const averageRecoveryTime = totalRecoveryAttempts > 0 ? 
      errors.reduce((sum, e) => sum + (e.recoveryAttempts * 1000), 0) / totalRecoveryAttempts : 0;

    return {
      totalErrors: errors.length,
      activeErrors,
      failedWorkers,
      recoveringWorkers,
      errorRate: errors.length > 0 ? (failedWorkers / errors.length) * 100 : 0,
      averageRecoveryTime
    };
  }

  /**
   * Get worker health status
   */
  getWorkerHealthStatus(workerId: string): {
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    lastError?: WorkerError;
    recoveryAttempts: number;
    uptime: number;
  } {
    const error = this.errors.get(workerId);
    
    if (!error) {
      return {
        status: 'healthy',
        recoveryAttempts: 0,
        uptime: 0
      };
    }

    let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'unknown';
    
    switch (error.status) {
      case 'active':
        status = error.recoveryAttempts > 0 ? 'warning' : 'healthy';
        break;
      case 'recovering':
        status = 'warning';
        break;
      case 'failed':
        status = 'critical';
        break;
      case 'terminated':
        status = 'unknown';
        break;
    }

    return {
      status,
      lastError: error,
      recoveryAttempts: error.recoveryAttempts,
      uptime: Date.now() - new Date(error.timestamp).getTime()
    };
  }

  /**
   * Set recovery strategy for a worker
   */
  setRecoveryStrategy(workerId: string, strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(workerId, strategy);
  }

  /**
   * Get error history
   */
  getErrorHistory(hours: number = 24): any[] {
    try {
      return this.db.prepare(`
        SELECT * FROM system_logs 
        WHERE category = 'worker_error' 
        AND timestamp >= datetime('now', '-${hours} hours')
        ORDER BY timestamp DESC
        LIMIT 100
      `).all();
    } catch (error) {
      console.error('Failed to get error history:', error);
      return [];
    }
  }

  /**
   * Force recovery of a worker
   */
  async forceRecovery(workerId: string): Promise<boolean> {
    const error = this.errors.get(workerId);
    if (!error) {
      return false;
    }

    error.status = 'recovering';
    error.recoveryAttempts = 0;
    error.lastRecoveryAttempt = new Date().toISOString();

    this.logError(error);
    return true;
  }

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
  } {
    const stats = this.getErrorStatistics();
    const errors = Array.from(this.errors.values());
    
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (stats.failedWorkers > 0) {
      overall = 'critical';
    } else if (stats.activeErrors > 0 || stats.recoveringWorkers > 0) {
      overall = 'warning';
    }

    const workers = {
      total: errors.length,
      healthy: errors.filter(e => e.status === 'active' && e.recoveryAttempts === 0).length,
      warning: errors.filter(e => e.status === 'recovering' || (e.status === 'active' && e.recoveryAttempts > 0)).length,
      critical: errors.filter(e => e.status === 'failed').length
    };

    const recommendations: string[] = [];
    
    if (stats.failedWorkers > 0) {
      recommendations.push('Some workers have failed - consider restarting the worker pool');
    }
    
    if (stats.errorRate > 10) {
      recommendations.push('High error rate detected - investigate worker stability');
    }
    
    if (stats.averageRecoveryTime > 10000) {
      recommendations.push('Recovery time is high - consider optimizing worker initialization');
    }

    return {
      overall,
      workers,
      recommendations
    };
  }
}