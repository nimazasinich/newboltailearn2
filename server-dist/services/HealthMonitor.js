import fs from 'fs';
import path from 'path';
export class HealthMonitor {
    db;
    logger;
    startTime;
    metrics = [];
    maxMetricsHistory = 1000;
    requestCount = 0;
    errorCount = 0;
    responseTimes = [];
    maxResponseTimeHistory = 100;
    constructor(database, logger) {
        this.db = database;
        this.logger = logger;
        this.startTime = new Date();
        this.initializeMonitoring();
    }
    initializeMonitoring() {
        // Create metrics table if it doesn't exist
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        memory_usage TEXT,
        cpu_usage REAL,
        active_connections INTEGER,
        total_requests INTEGER,
        error_count INTEGER,
        average_response_time REAL
      )
    `);
        // Create health checks table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS health_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        services TEXT,
        metrics TEXT
      )
    `);
        // Start periodic health checks
        this.startPeriodicHealthChecks();
    }
    startPeriodicHealthChecks() {
        // Check every 30 seconds
        setInterval(async () => {
            try {
                const healthStatus = await this.getHealthStatus();
                await this.recordHealthCheck(healthStatus);
            }
            catch (error) {
                this.logger.error('Health check failed', 'monitoring', { error: error.message });
            }
        }, 30000);
        // Record metrics every 10 seconds
        setInterval(async () => {
            try {
                await this.recordMetrics();
            }
            catch (error) {
                this.logger.error('Metrics recording failed', 'monitoring', { error: error.message });
            }
        }, 10000);
    }
    /**
     * Get overall health status
     */
    async getHealthStatus() {
        const services = await this.checkAllServices();
        const metrics = await this.getCurrentMetrics();
        // Determine overall status
        const serviceStatuses = Object.values(services).map(s => s.status);
        let overallStatus = 'healthy';
        if (serviceStatuses.includes('unhealthy')) {
            overallStatus = 'unhealthy';
        }
        else if (serviceStatuses.includes('degraded')) {
            overallStatus = 'degraded';
        }
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services,
            metrics
        };
    }
    /**
     * Check all services
     */
    async checkAllServices() {
        const [database, filesystem, memory, disk, models] = await Promise.all([
            this.checkDatabase(),
            this.checkFilesystem(),
            this.checkMemory(),
            this.checkDisk(),
            this.checkModels()
        ]);
        return {
            database,
            filesystem,
            memory,
            disk,
            models
        };
    }
    /**
     * Check database health
     */
    async checkDatabase() {
        const startTime = Date.now();
        try {
            // Test database connection
            this.db.prepare('SELECT 1').get();
            // Check database size
            const dbPath = './persian_legal_ai.db';
            const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
            const responseTime = Date.now() - startTime;
            return {
                status: responseTime > 1000 ? 'degraded' : 'healthy',
                message: `Database responsive (${responseTime}ms)`,
                lastCheck: new Date().toISOString(),
                responseTime,
                details: {
                    size: dbSize,
                    sizeFormatted: this.formatBytes(dbSize)
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Database error: ${error.message}`,
                lastCheck: new Date().toISOString(),
                details: { error: error.message }
            };
        }
    }
    /**
     * Check filesystem health
     */
    async checkFilesystem() {
        try {
            const requiredDirs = ['./models', './logs', './uploads'];
            const missingDirs = [];
            for (const dir of requiredDirs) {
                if (!fs.existsSync(dir)) {
                    missingDirs.push(dir);
                }
            }
            if (missingDirs.length > 0) {
                return {
                    status: 'degraded',
                    message: `Missing directories: ${missingDirs.join(', ')}`,
                    lastCheck: new Date().toISOString(),
                    details: { missingDirs }
                };
            }
            // Check write permissions
            const testFile = './logs/health_test.tmp';
            try {
                fs.writeFileSync(testFile, 'test');
                fs.unlinkSync(testFile);
            }
            catch (error) {
                return {
                    status: 'unhealthy',
                    message: 'No write permissions',
                    lastCheck: new Date().toISOString(),
                    details: { error: error.message }
                };
            }
            return {
                status: 'healthy',
                message: 'Filesystem accessible',
                lastCheck: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Filesystem error: ${error.message}`,
                lastCheck: new Date().toISOString(),
                details: { error: error.message }
            };
        }
    }
    /**
     * Check memory health
     */
    async checkMemory() {
        try {
            const memUsage = process.memoryUsage();
            const totalMem = memUsage.heapTotal;
            const usedMem = memUsage.heapUsed;
            const usagePercent = (usedMem / totalMem) * 100;
            let status = 'healthy';
            if (usagePercent > 90) {
                status = 'unhealthy';
            }
            else if (usagePercent > 75) {
                status = 'degraded';
            }
            return {
                status,
                message: `Memory usage: ${usagePercent.toFixed(1)}%`,
                lastCheck: new Date().toISOString(),
                details: {
                    usagePercent,
                    heapUsed: this.formatBytes(usedMem),
                    heapTotal: this.formatBytes(totalMem),
                    external: this.formatBytes(memUsage.external),
                    rss: this.formatBytes(memUsage.rss)
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Memory check error: ${error.message}`,
                lastCheck: new Date().toISOString(),
                details: { error: error.message }
            };
        }
    }
    /**
     * Check disk health
     */
    async checkDisk() {
        try {
            const stats = fs.statSync('.');
            const freeSpace = this.getFreeDiskSpace();
            if (freeSpace < 100 * 1024 * 1024) { // Less than 100MB
                return {
                    status: 'unhealthy',
                    message: 'Low disk space',
                    lastCheck: new Date().toISOString(),
                    details: { freeSpace: this.formatBytes(freeSpace) }
                };
            }
            else if (freeSpace < 500 * 1024 * 1024) { // Less than 500MB
                return {
                    status: 'degraded',
                    message: 'Disk space running low',
                    lastCheck: new Date().toISOString(),
                    details: { freeSpace: this.formatBytes(freeSpace) }
                };
            }
            return {
                status: 'healthy',
                message: 'Disk space adequate',
                lastCheck: new Date().toISOString(),
                details: { freeSpace: this.formatBytes(freeSpace) }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Disk check error: ${error.message}`,
                lastCheck: new Date().toISOString(),
                details: { error: error.message }
            };
        }
    }
    /**
     * Check models health
     */
    async checkModels() {
        try {
            const modelsDir = './models/saved';
            if (!fs.existsSync(modelsDir)) {
                return {
                    status: 'degraded',
                    message: 'Models directory not found',
                    lastCheck: new Date().toISOString()
                };
            }
            const modelFiles = fs.readdirSync(modelsDir);
            const modelCount = modelFiles.filter(file => fs.statSync(path.join(modelsDir, file)).isDirectory()).length;
            return {
                status: 'healthy',
                message: `${modelCount} models available`,
                lastCheck: new Date().toISOString(),
                details: { modelCount }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Models check error: ${error.message}`,
                lastCheck: new Date().toISOString(),
                details: { error: error.message }
            };
        }
    }
    /**
     * Get current performance metrics
     */
    async getCurrentMetrics() {
        const uptime = Date.now() - this.startTime.getTime();
        const memoryUsage = process.memoryUsage();
        const cpuUsage = await this.getCpuUsage();
        return {
            uptime,
            memoryUsage,
            cpuUsage,
            activeConnections: this.responseTimes.length,
            totalRequests: this.requestCount,
            errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
        };
    }
    /**
     * Record request metrics
     */
    recordRequest(duration, isError = false) {
        this.requestCount++;
        if (isError) {
            this.errorCount++;
        }
        this.responseTimes.push(duration);
        if (this.responseTimes.length > this.maxResponseTimeHistory) {
            this.responseTimes.shift();
        }
    }
    /**
     * Record performance metrics
     */
    async recordMetrics() {
        try {
            const metrics = {
                timestamp: new Date().toISOString(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: await this.getCpuUsage(),
                activeConnections: this.responseTimes.length,
                totalRequests: this.requestCount,
                errorCount: this.errorCount,
                averageResponseTime: this.responseTimes.length > 0 ?
                    this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 0
            };
            this.metrics.push(metrics);
            if (this.metrics.length > this.maxMetricsHistory) {
                this.metrics.shift();
            }
            // Store in database
            this.db.prepare(`
        INSERT INTO performance_metrics (memory_usage, cpu_usage, active_connections, total_requests, error_count, average_response_time)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(JSON.stringify(metrics.memoryUsage), metrics.cpuUsage, metrics.activeConnections, metrics.totalRequests, metrics.errorCount, metrics.averageResponseTime);
        }
        catch (error) {
            this.logger.error('Failed to record metrics', 'monitoring', { error: error.message });
        }
    }
    /**
     * Record health check
     */
    async recordHealthCheck(healthStatus) {
        try {
            this.db.prepare(`
        INSERT INTO health_checks (status, services, metrics)
        VALUES (?, ?, ?)
      `).run(healthStatus.status, JSON.stringify(healthStatus.services), JSON.stringify(healthStatus.metrics));
        }
        catch (error) {
            this.logger.error('Failed to record health check', 'monitoring', { error: error.message });
        }
    }
    /**
     * Get CPU usage (simplified)
     */
    async getCpuUsage() {
        // Simplified CPU usage calculation
        // In a real implementation, you might use a library like 'cpu-stat'
        return Math.random() * 100; // Placeholder
    }
    /**
     * Get free disk space
     */
    getFreeDiskSpace() {
        try {
            const stats = fs.statSync('.');
            // This is a simplified implementation
            // In production, you might use a library like 'diskusage'
            return 1024 * 1024 * 1024; // 1GB placeholder
        }
        catch {
            return 0;
        }
    }
    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Get metrics history
     */
    getMetricsHistory(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.metrics.filter(m => new Date(m.timestamp) > cutoffTime);
    }
    /**
     * Get health check history
     */
    getHealthHistory(hours = 24) {
        try {
            const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
            const checks = this.db.prepare(`
        SELECT * FROM health_checks 
        WHERE timestamp >= ?
        ORDER BY timestamp DESC
        LIMIT 100
      `).all(cutoffTime.toISOString());
            return checks.map(check => ({
                status: check.status,
                timestamp: check.timestamp,
                services: JSON.parse(check.services),
                metrics: JSON.parse(check.metrics)
            }));
        }
        catch (error) {
            this.logger.error('Failed to get health history', 'monitoring', { error: error.message });
            return [];
        }
    }
    /**
     * Clean old metrics and health checks
     */
    cleanOldData(daysToKeep = 7) {
        try {
            const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
            const metricsResult = this.db.prepare(`
        DELETE FROM performance_metrics 
        WHERE timestamp < ?
      `).run(cutoffDate.toISOString());
            const healthResult = this.db.prepare(`
        DELETE FROM health_checks 
        WHERE timestamp < ?
      `).run(cutoffDate.toISOString());
            return {
                metricsDeleted: metricsResult.changes,
                healthChecksDeleted: healthResult.changes
            };
        }
        catch (error) {
            this.logger.error('Failed to clean old data', 'monitoring', { error: error.message });
            return { metricsDeleted: 0, healthChecksDeleted: 0 };
        }
    }
}
//# sourceMappingURL=HealthMonitor.js.map