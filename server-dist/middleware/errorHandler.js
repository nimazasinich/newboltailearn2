export class ErrorHandler {
    db;
    constructor(database) {
        this.db = database;
        this.initializeErrorLogging();
    }
    initializeErrorLogging() {
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
    createError(message, statusCode = 500, code, details) {
        const error = new Error(message);
        error.statusCode = statusCode;
        error.isOperational = true;
        error.code = code;
        error.details = details;
        return error;
    }
    /**
     * Log error to database
     */
    async logError(error, category = 'general', userId, requestId) {
        try {
            const errorLog = {
                level: 'error',
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details ? JSON.stringify(error.details) : undefined,
                userId,
                requestId,
                timestamp: new Date().toISOString(),
                category
            };
            this.db.prepare(`
        INSERT INTO error_logs (level, message, stack, code, details, user_id, request_id, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(errorLog.level, errorLog.message, errorLog.stack, errorLog.code, errorLog.details, errorLog.userId, errorLog.requestId, errorLog.category);
        }
        catch (logError) {
            console.error('Failed to log error to database:', logError);
        }
    }
    /**
     * Express error handling middleware
     */
    handleError = async (error, req, res, next) => {
        try {
            // Log error
            await this.logError(error, 'express_middleware', req.user?.id, req.requestId);
            // Determine status code
            const statusCode = error.statusCode || 500;
            const isOperational = error.isOperational || false;
            // Prepare error response
            const errorResponse = {
                error: {
                    message: error.message,
                    code: error.code,
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId
                }
            };
            // Add details in development
            if (process.env.NODE_ENV === 'development') {
                errorResponse.error.stack = error.stack;
                errorResponse.error.details = error.details;
            }
            // Send error response
            res.status(statusCode).json(errorResponse);
            // Log to console in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Error:', error);
            }
        }
        catch (handlerError) {
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
    handleUnhandledRejection = (reason, promise) => {
        console.error('Unhandled Promise Rejection:', reason);
        const error = new Error('Unhandled Promise Rejection');
        error.statusCode = 500;
        error.isOperational = false;
        error.details = { reason, promise };
        this.logError(error, 'unhandled_rejection');
    };
    /**
     * Handle uncaught exceptions
     */
    handleUncaughtException = (error) => {
        console.error('Uncaught Exception:', error);
        const appError = error;
        appError.statusCode = 500;
        appError.isOperational = false;
        this.logError(appError, 'uncaught_exception');
        // Exit process after logging
        process.exit(1);
    };
    /**
     * Handle database errors
     */
    handleDatabaseError = (error, operation) => {
        console.error(`Database error in ${operation}:`, error);
        let message = 'Database operation failed';
        let statusCode = 500;
        let code = 'DATABASE_ERROR';
        if (error.code === 'SQLITE_CONSTRAINT') {
            message = 'Data constraint violation';
            statusCode = 400;
            code = 'CONSTRAINT_VIOLATION';
        }
        else if (error.code === 'SQLITE_BUSY') {
            message = 'Database is busy, please try again';
            statusCode = 503;
            code = 'DATABASE_BUSY';
        }
        else if (error.code === 'SQLITE_LOCKED') {
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
    handleFileSystemError = (error, operation, filePath) => {
        console.error(`File system error in ${operation}:`, error);
        let message = 'File operation failed';
        let statusCode = 500;
        let code = 'FILE_SYSTEM_ERROR';
        if (error.code === 'ENOENT') {
            message = 'File or directory not found';
            statusCode = 404;
            code = 'FILE_NOT_FOUND';
        }
        else if (error.code === 'EACCES') {
            message = 'Permission denied';
            statusCode = 403;
            code = 'PERMISSION_DENIED';
        }
        else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
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
    handleTrainingError = (error, operation, modelId) => {
        console.error(`Training error in ${operation}:`, error);
        let message = 'Training operation failed';
        let statusCode = 500;
        let code = 'TRAINING_ERROR';
        if (error.message.includes('insufficient data')) {
            message = 'Insufficient training data';
            statusCode = 400;
            code = 'INSUFFICIENT_DATA';
        }
        else if (error.message.includes('memory')) {
            message = 'Insufficient memory for training';
            statusCode = 507;
            code = 'INSUFFICIENT_MEMORY';
        }
        else if (error.message.includes('timeout')) {
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
    handleAuthError = (error, operation) => {
        console.error(`Authentication error in ${operation}:`, error);
        let message = 'Authentication failed';
        let statusCode = 401;
        let code = 'AUTH_ERROR';
        if (error.message.includes('token')) {
            message = 'Invalid or expired token';
            statusCode = 403;
            code = 'INVALID_TOKEN';
        }
        else if (error.message.includes('password')) {
            message = 'Invalid password';
            statusCode = 401;
            code = 'INVALID_PASSWORD';
        }
        else if (error.message.includes('permission')) {
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
    handleValidationError = (error, field) => {
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
    getErrorLogs(limit = 100, offset = 0, level, category, userId) {
        try {
            let query = 'SELECT * FROM error_logs WHERE 1=1';
            const params = [];
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
            return this.db.prepare(query).all(...params);
        }
        catch (error) {
            console.error('Error getting error logs:', error);
            return [];
        }
    }
    /**
     * Clean old error logs
     */
    cleanOldLogs(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const result = this.db.prepare(`
        DELETE FROM error_logs 
        WHERE timestamp < ?
      `).run(cutoffDate.toISOString());
            return result.changes;
        }
        catch (error) {
            console.error('Error cleaning old logs:', error);
            return 0;
        }
    }
    /**
     * Get error statistics
     */
    getErrorStats(days = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            // Total errors
            const totalErrors = this.db.prepare(`
        SELECT COUNT(*) as count FROM error_logs 
        WHERE timestamp >= ?
      `).get(cutoffDate.toISOString());
            // Errors by level
            const errorsByLevel = this.db.prepare(`
        SELECT level, COUNT(*) as count FROM error_logs 
        WHERE timestamp >= ?
        GROUP BY level
      `).all(cutoffDate.toISOString());
            // Errors by category
            const errorsByCategory = this.db.prepare(`
        SELECT category, COUNT(*) as count FROM error_logs 
        WHERE timestamp >= ?
        GROUP BY category
      `).all(cutoffDate.toISOString());
            // Recent errors
            const recentErrors = this.db.prepare(`
        SELECT * FROM error_logs 
        WHERE timestamp >= ?
        ORDER BY timestamp DESC 
        LIMIT 10
      `).all(cutoffDate.toISOString());
            return {
                totalErrors: totalErrors.count,
                errorsByLevel: errorsByLevel.reduce((acc, item) => {
                    acc[item.level] = item.count;
                    return acc;
                }, {}),
                errorsByCategory: errorsByCategory.reduce((acc, item) => {
                    acc[item.category] = item.count;
                    return acc;
                }, {}),
                recentErrors
            };
        }
        catch (error) {
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
export const setupGlobalErrorHandlers = (errorHandler) => {
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
//# sourceMappingURL=errorHandler.js.map