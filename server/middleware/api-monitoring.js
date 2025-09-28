/**
 * API Monitoring and Error Handling Middleware
 * Comprehensive monitoring, logging, and error handling for all API endpoints
 */

import fs from 'fs';
import path from 'path';

class APIMonitor {
    constructor(options = {}) {
        this.config = {
            logLevel: options.logLevel || 'info',
            logFile: options.logFile || './logs/api-monitor.log',
            maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10MB
            maxLogFiles: options.maxLogFiles || 5,
            enableMetrics: options.enableMetrics !== false,
            enableErrorTracking: options.enableErrorTracking !== false,
            enablePerformanceTracking: options.enablePerformanceTracking !== false,
            slowQueryThreshold: options.slowQueryThreshold || 1000, // 1 second
            ...options
        };

        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                byMethod: {},
                byEndpoint: {},
                byStatusCode: {}
            },
            performance: {
                averageResponseTime: 0,
                slowRequests: [],
                responseTimeDistribution: {
                    '0-100ms': 0,
                    '100-500ms': 0,
                    '500ms-1s': 0,
                    '1s-5s': 0,
                    '5s+': 0
                }
            },
            errors: {
                total: 0,
                byType: {},
                byEndpoint: {},
                recent: []
            },
            uptime: {
                startTime: Date.now(),
                lastRequest: null,
                healthChecks: 0
            }
        };

        this.initialize();
    }

    initialize() {
        // Ensure logs directory exists
        const logDir = path.dirname(this.config.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // Setup log rotation
        this.setupLogRotation();

        // Start metrics collection interval
        this.startMetricsCollection();

        console.log('✅ API Monitor initialized');
    }

    setupLogRotation() {
        setInterval(() => {
            this.rotateLogs();
        }, 24 * 60 * 60 * 1000); // Check every 24 hours
    }

    rotateLogs() {
        try {
            if (fs.existsSync(this.config.logFile)) {
                const stats = fs.statSync(this.config.logFile);
                if (stats.size > this.config.maxLogSize) {
                    // Rotate logs
                    for (let i = this.config.maxLogFiles - 1; i > 0; i--) {
                        const oldFile = `${this.config.logFile}.${i}`;
                        const newFile = `${this.config.logFile}.${i + 1}`;
                        if (fs.existsSync(oldFile)) {
                            fs.renameSync(oldFile, newFile);
                        }
                    }
                    
                    // Move current log to .1
                    fs.renameSync(this.config.logFile, `${this.config.logFile}.1`);
                    
                    console.log('📄 Log files rotated');
                }
            }
        } catch (error) {
            console.error('❌ Log rotation failed:', error);
        }
    }

    startMetricsCollection() {
        setInterval(() => {
            this.collectSystemMetrics();
        }, 60000); // Collect every minute
    }

    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.system = {
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
    }

    log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            meta,
            pid: process.pid
        };

        // Console output
        if (level === 'error') {
            console.error(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
        } else if (level === 'warn') {
            console.warn(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
        } else {
            console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
        }

        // File output
        try {
            fs.appendFileSync(this.config.logFile, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.error('❌ Failed to write to log file:', error);
        }
    }

    // Middleware function
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Add request ID to request object
            req.requestId = requestId;
            
            // Log request
            this.log('info', 'Request started', {
                requestId,
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                headers: this.sanitizeHeaders(req.headers)
            });

            // Update metrics
            this.metrics.requests.total++;
            this.metrics.requests.byMethod[req.method] = 
                (this.metrics.requests.byMethod[req.method] || 0) + 1;
            this.metrics.requests.byEndpoint[req.url] = 
                (this.metrics.requests.byEndpoint[req.url] || 0) + 1;
            this.metrics.uptime.lastRequest = Date.now();

            // Override res.end to capture response
            const originalEnd = res.end;
            res.end = (chunk, encoding) => {
                const responseTime = Date.now() - startTime;
                
                // Update response metrics
                this.metrics.requests.byStatusCode[res.statusCode] = 
                    (this.metrics.requests.byStatusCode[res.statusCode] || 0) + 1;
                
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    this.metrics.requests.successful++;
                } else {
                    this.metrics.requests.failed++;
                }

                // Update performance metrics
                this.updatePerformanceMetrics(responseTime, req.url);

                // Log response
                this.log('info', 'Request completed', {
                    requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    responseTime,
                    contentLength: res.get('Content-Length') || 0
                });

                // Log slow requests
                if (responseTime > this.config.slowQueryThreshold) {
                    this.log('warn', 'Slow request detected', {
                        requestId,
                        method: req.method,
                        url: req.url,
                        responseTime,
                        threshold: this.config.slowQueryThreshold
                    });

                    this.metrics.performance.slowRequests.push({
                        requestId,
                        method: req.method,
                        url: req.url,
                        responseTime,
                        timestamp: new Date().toISOString()
                    });

                    // Keep only recent slow requests
                    if (this.metrics.performance.slowRequests.length > 100) {
                        this.metrics.performance.slowRequests = 
                            this.metrics.performance.slowRequests.slice(-100);
                    }
                }

                // Call original end
                originalEnd.call(res, chunk, encoding);
            };

            // Error handling
            res.on('error', (error) => {
                this.handleError(error, req, res);
            });

            next();
        };
    }

    updatePerformanceMetrics(responseTime, endpoint) {
        // Update average response time
        const totalRequests = this.metrics.requests.total;
        this.metrics.performance.averageResponseTime = 
            (this.metrics.performance.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;

        // Update response time distribution
        if (responseTime < 100) {
            this.metrics.performance.responseTimeDistribution['0-100ms']++;
        } else if (responseTime < 500) {
            this.metrics.performance.responseTimeDistribution['100-500ms']++;
        } else if (responseTime < 1000) {
            this.metrics.performance.responseTimeDistribution['500ms-1s']++;
        } else if (responseTime < 5000) {
            this.metrics.performance.responseTimeDistribution['1s-5s']++;
        } else {
            this.metrics.performance.responseTimeDistribution['5s+']++;
        }
    }

    handleError(error, req, res) {
        const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Update error metrics
        this.metrics.errors.total++;
        this.metrics.errors.byType[error.name] = 
            (this.metrics.errors.byType[error.name] || 0) + 1;
        this.metrics.errors.byEndpoint[req.url] = 
            (this.metrics.errors.byEndpoint[req.url] || 0) + 1;

        // Add to recent errors
        this.metrics.errors.recent.push({
            errorId,
            name: error.name,
            message: error.message,
            stack: error.stack,
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString()
        });

        // Keep only recent errors
        if (this.metrics.errors.recent.length > 50) {
            this.metrics.errors.recent = this.metrics.errors.recent.slice(-50);
        }

        // Log error
        this.log('error', 'API Error occurred', {
            errorId,
            name: error.name,
            message: error.message,
            stack: error.stack,
            method: req.method,
            url: req.url,
            requestId: req.requestId
        });

        // Send error response if not already sent
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Internal Server Error',
                errorId,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Error handling middleware
    errorHandler() {
        return (error, req, res, next) => {
            this.handleError(error, req, res);
        };
    }

    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: {
                ...this.metrics.uptime,
                current: Date.now() - this.metrics.uptime.startTime
            }
        };
    }

    getHealthStatus() {
        const uptime = Date.now() - this.metrics.uptime.startTime;
        const errorRate = this.metrics.requests.total > 0 ? 
            (this.metrics.requests.failed / this.metrics.requests.total) * 100 : 0;
        
        const status = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime,
            requests: {
                total: this.metrics.requests.total,
                successful: this.metrics.requests.successful,
                failed: this.metrics.requests.failed,
                errorRate: errorRate.toFixed(2) + '%'
            },
            performance: {
                averageResponseTime: Math.round(this.metrics.performance.averageResponseTime),
                slowRequests: this.metrics.performance.slowRequests.length
            },
            errors: {
                total: this.metrics.errors.total,
                recent: this.metrics.errors.recent.length
            }
        };

        // Determine health status
        if (errorRate > 10) {
            status.status = 'degraded';
        } else if (errorRate > 25) {
            status.status = 'unhealthy';
        }

        return status;
    }

    resetMetrics() {
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                byMethod: {},
                byEndpoint: {},
                byStatusCode: {}
            },
            performance: {
                averageResponseTime: 0,
                slowRequests: [],
                responseTimeDistribution: {
                    '0-100ms': 0,
                    '100-500ms': 0,
                    '500ms-1s': 0,
                    '1s-5s': 0,
                    '5s+': 0
                }
            },
            errors: {
                total: 0,
                byType: {},
                byEndpoint: {},
                recent: []
            },
            uptime: {
                startTime: Date.now(),
                lastRequest: null,
                healthChecks: 0
            }
        };

        this.log('info', 'Metrics reset');
    }
}

export default APIMonitor;
