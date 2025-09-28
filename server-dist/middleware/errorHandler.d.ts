import { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
    details?: any;
}
export interface ErrorLog {
    id?: number;
    level: 'error' | 'warning' | 'info' | 'debug';
    message: string;
    stack?: string;
    code?: string;
    details?: string;
    userId?: number;
    requestId?: string;
    timestamp: string;
    category: string;
}
export declare class ErrorHandler {
    private db;
    constructor(database: Database.Database);
    private initializeErrorLogging;
    /**
     * Create a custom application error
     */
    createError(message: string, statusCode?: number, code?: string, details?: any): AppError;
    /**
     * Log error to database
     */
    logError(error: Error | AppError, category?: string, userId?: number, requestId?: string): Promise<void>;
    /**
     * Express error handling middleware
     */
    handleError: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection: (reason: any, promise: Promise<any>) => void;
    /**
     * Handle uncaught exceptions
     */
    handleUncaughtException: (error: Error) => void;
    /**
     * Handle database errors
     */
    handleDatabaseError: (error: any, operation: string) => AppError;
    /**
     * Handle file system errors
     */
    handleFileSystemError: (error: any, operation: string, filePath?: string) => AppError;
    /**
     * Handle training errors
     */
    handleTrainingError: (error: any, operation: string, modelId?: string) => AppError;
    /**
     * Handle authentication errors
     */
    handleAuthError: (error: any, operation: string) => AppError;
    /**
     * Handle validation errors
     */
    handleValidationError: (error: any, field?: string) => AppError;
    /**
     * Get error logs from database
     */
    getErrorLogs(limit?: number, offset?: number, level?: string, category?: string, userId?: number): ErrorLog[];
    /**
     * Clean old error logs
     */
    cleanOldLogs(daysToKeep?: number): number;
    /**
     * Get error statistics
     */
    getErrorStats(days?: number): {
        totalErrors: number;
        errorsByLevel: Record<string, number>;
        errorsByCategory: Record<string, number>;
        recentErrors: ErrorLog[];
    };
}
export declare const setupGlobalErrorHandlers: (errorHandler: ErrorHandler) => void;
//# sourceMappingURL=errorHandler.d.ts.map