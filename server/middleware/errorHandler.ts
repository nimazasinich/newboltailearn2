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

export class ErrorHandler {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initializeErrorLogging();
  }

  private initializeErrorLogging(): void {
    // Create error logs table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT CHECK (level IN ('error', 'warning', 'info', 'debug')),
        message TEXT NOT NULL,
        stack TEXT,
        code TEXT,
        details TEXT,
        user_id INTEGER,
        request_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        category TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }

  /**
   * Create a custom application error
   */
  createError(message: string, statusCode: number = 500, code?: string, details?: any): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Log error to database
   */
  async logError(
    error: Error | AppError,
    category: string = 'general',
    userId?: number,
    requestId?: string
  ): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        level: 'error',
        message: error.message,
        stack: error.stack,
        code: (error as AppError).code,
        details: (error as AppError).details ? JSON.stringify((error as AppError).details) : undefined,
        userId,
        requestId,
        timestamp: new Date().toISOString(),
        category
      };

      this.db.prepare(`
        INSERT INTO error_logs (level, message, stack, code, details, user_id, request_id, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        errorLog.level,
        errorLog.message,
        errorLog.stack,
        errorLog.code,
        errorLog.details,
        errorLog.userId,
        errorLog.requestId,
        errorLog.category
      );
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
  }

  /**
   * Express error handling middleware
   */
  handleError = async (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Log error
      await this.logError(
        error,
        'express_middleware',
        (req as any).user?.id,
        (req as any).requestId
      );

      // Determine status code
      const statusCode = (error as AppError).statusCode || 500;
      const isOperational = (error as AppError).isOperational || false;

      // Prepare error response
      const errorResponse: any = {
        error: {
          message: error.message,
          code: (error as AppError).code,
          timestamp: new Date().toISOString(),
          requestId: (req as any).requestId
        }
      };

      // Add details in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = error.stack;
        errorResponse.error.details = (error as AppError).details;
      }

      // Send error response
      res.status(statusCode).json(errorResponse);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
      }

    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
    console.error('Unhandled Promise Rejection:', reason);
    
    const error: AppError = new Error('Unhandled Promise Rejection');
    error.statusCode = 500;
    error.isOperational = false;
    error.details = { reason, promise };
    
    this.logError(error, 'unhandled_rejection');
  };

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtException = (error: Error): void => {
    console.error('Uncaught Exception:', error);
    
    const appError: AppError = error;
    appError.statusCode = 500;
    appError.isOperational = false;
    
    this.logError(appError, 'uncaught_exception');
    
    // Exit process after logging
    process.exit(1);
  };

  /**
   * Handle database errors
   */
  handleDatabaseError = (error: any, operation: string): AppError => {
    console.error(`Database error in ${operation}:`, error);
    
    let message = 'Database operation failed';
    let statusCode = 500;
    let code = 'DATABASE_ERROR';

    if (error.code === 'SQLITE_CONSTRAINT') {
      message = 'Data constraint violation';
      statusCode = 400;
      code = 'CONSTRAINT_VIOLATION';
    } else if (error.code === 'SQLITE_BUSY') {
      message = 'Database is busy, please try again';
      statusCode = 503;
      code = 'DATABASE_BUSY';
    } else if (error.code === 'SQLITE_LOCKED') {
      message = 'Database is locked';
      statusCode = 503;
      code = 'DATABASE_LOCKED';
    }

    const appError = this.createError(message, statusCode, code, { operation, originalError: error.message });
    this.logError(appError, 'database_error');
    
    return appError;
  };

  /**
   * Handle file system errors
   */
  handleFileSystemError = (error: any, operation: string, filePath?: string): AppError => {
    console.error(`File system error in ${operation}:`, error);
    
    let message = 'File operation failed';
    let statusCode = 500;
    let code = 'FILE_SYSTEM_ERROR';

    if (error.code === 'ENOENT') {
      message = 'File or directory not found';
      statusCode = 404;
      code = 'FILE_NOT_FOUND';
    } else if (error.code === 'EACCES') {
      message = 'Permission denied';
      statusCode = 403;
      code = 'PERMISSION_DENIED';
    } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
      message = 'Too many open files';
      statusCode = 503;
      code = 'TOO_MANY_FILES';
    }

    const appError = this.createError(message, statusCode, code, { 
      operation, 
      filePath, 
      originalError: error.message 
    });
    this.logError(appError, 'file_system_error');
    
    return appError;
  };

  /**
   * Handle training errors
   */
  handleTrainingError = (error: any, operation: string, modelId?: string): AppError => {
    console.error(`Training error in ${operation}:`, error);
    
    let message = 'Training operation failed';
    let statusCode = 500;
    let code = 'TRAINING_ERROR';

    if (error.message.includes('insufficient data')) {
      message = 'Insufficient training data';
      statusCode = 400;
      code = 'INSUFFICIENT_DATA';
    } else if (error.message.includes('memory')) {
      message = 'Insufficient memory for training';
      statusCode = 507;
      code = 'INSUFFICIENT_MEMORY';
    } else if (error.message.includes('timeout')) {
      message = 'Training operation timed out';
      statusCode = 408;
      code = 'TRAINING_TIMEOUT';
    }

    const appError = this.createError(message, statusCode, code, { 
      operation, 
      modelId, 
      originalError: error.message 
    });
    this.logError(appError, 'training_error');
    
    return appError;
  };

  /**
   * Handle authentication errors
   */
  handleAuthError = (error: any, operation: string): AppError => {
    console.error(`Authentication error in ${operation}:`, error);
    
    let message = 'Authentication failed';
    let statusCode = 401;
    let code = 'AUTH_ERROR';

    if (error.message.includes('token')) {
      message = 'Invalid or expired token';
      statusCode = 403;
      code = 'INVALID_TOKEN';
    } else if (error.message.includes('password')) {
      message = 'Invalid password';
      statusCode = 401;
      code = 'INVALID_PASSWORD';
    } else if (error.message.includes('permission')) {
      message = 'Insufficient permissions';
      statusCode = 403;
      code = 'INSUFFICIENT_PERMISSIONS';
    }

    const appError = this.createError(message, statusCode, code, { 
      operation, 
      originalError: error.message 
    });
    this.logError(appError, 'authentication_error');
    
    return appError;
  };

  /**
   * Handle validation errors
   */
  handleValidationError = (error: any, field?: string): AppError => {
    console.error('Validation error:', error);
    
    const message = field ? `Validation failed for field: ${field}` : 'Validation failed';
    const appError = this.createError(message, 400, 'VALIDATION_ERROR', { 
      field, 
      originalError: error.message 
    });
    this.logError(appError, 'validation_error');
    
    return appError;
  };

  /**
   * Get error logs from database
   */
  getErrorLogs(
    limit: number = 100,
    offset: number = 0,
    level?: string,
    category?: string,
    userId?: number
  ): ErrorLog[] {
    try {
      let query = 'SELECT * FROM error_logs WHERE 1=1';
      const params: any[] = [];

      if (level) {
        query += ' AND level = ?';
        params.push(level);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return this.db.prepare(query).all(...params) as ErrorLog[];
    } catch (error) {
      console.error('Error getting error logs:', error);
      return [];
    }
  }

  /**
   * Clean old error logs
   */
  cleanOldLogs(daysToKeep: number = 30): number {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = this.db.prepare(`
        DELETE FROM error_logs 
        WHERE timestamp < ?
      `).run(cutoffDate.toISOString());
      
      return result.changes;
    } catch (error) {
      console.error('Error cleaning old logs:', error);
      return 0;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(days: number = 7): {
    totalErrors: number;
    errorsByLevel: Record<string, number>;
    errorsByCategory: Record<string, number>;
    recentErrors: ErrorLog[];
  } {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Total errors
      const totalErrors = this.db.prepare(`
        SELECT COUNT(*) as count FROM error_logs 
        WHERE timestamp >= ?
      `).get(cutoffDate.toISOString()) as { count: number };

      // Errors by level
      const errorsByLevel = this.db.prepare(`
        SELECT level, COUNT(*) as count FROM error_logs 
        WHERE timestamp >= ?
        GROUP BY level
      `).all(cutoffDate.toISOString()) as { level: string; count: number }[];

      // Errors by category
      const errorsByCategory = this.db.prepare(`
        SELECT category, COUNT(*) as count FROM error_logs 
        WHERE timestamp >= ?
        GROUP BY category
      `).all(cutoffDate.toISOString()) as { category: string; count: number }[];

      // Recent errors
      const recentErrors = this.db.prepare(`
        SELECT * FROM error_logs 
        WHERE timestamp >= ?
        ORDER BY timestamp DESC 
        LIMIT 10
      `).all(cutoffDate.toISOString()) as ErrorLog[];

      return {
        totalErrors: totalErrors.count,
        errorsByLevel: errorsByLevel.reduce((acc, item) => {
          acc[item.level] = item.count;
          return acc;
        }, {} as Record<string, number>),
        errorsByCategory: errorsByCategory.reduce((acc, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {} as Record<string, number>),
        recentErrors
      };
    } catch (error) {
      console.error('Error getting error stats:', error);
      return {
        totalErrors: 0,
        errorsByLevel: {},
        errorsByCategory: {},
        recentErrors: []
      };
    }
  }
}

// Global error handlers
export const setupGlobalErrorHandlers = (errorHandler: ErrorHandler): void => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', errorHandler.handleUnhandledRejection);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', errorHandler.handleUncaughtException);
  
  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  // Handle SIGINT
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};