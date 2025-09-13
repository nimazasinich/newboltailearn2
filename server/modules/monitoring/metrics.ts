import { Request, Response, NextFunction } from 'express';
import { Application } from 'express';
import { config } from '../security/config.js';

interface Metrics {
  // HTTP metrics
  httpRequestsTotal: number;
  httpRequestDuration: number[];
  httpRequestsByMethod: Record<string, number>;
  httpRequestsByStatus: Record<string, number>;
  httpRequestsByPath: Record<string, number>;
  
  // System metrics
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  
  // Application metrics
  activeConnections: number;
  activeSessions: number;
  trainingSessionsTotal: number;
  trainingSessionsActive: number;
  datasetsTotal: number;
  modelsTotal: number;
  
  // Error metrics
  errorsTotal: number;
  errorsByType: Record<string, number>;
}

class MetricsCollector {
  private metrics: Metrics;
  private startTime: number;
  private cpuUsageStart: NodeJS.CpuUsage;

  constructor() {
    this.startTime = Date.now();
    this.cpuUsageStart = process.cpuUsage();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): Metrics {
    return {
      httpRequestsTotal: 0,
      httpRequestDuration: [],
      httpRequestsByMethod: {},
      httpRequestsByStatus: {},
      httpRequestsByPath: {},
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: 0,
      activeConnections: 0,
      activeSessions: 0,
      trainingSessionsTotal: 0,
      trainingSessionsActive: 0,
      datasetsTotal: 0,
      modelsTotal: 0,
      errorsTotal: 0,
      errorsByType: {}
    };
  }

  /**
   * Middleware to collect HTTP metrics
   */
  collectHttpMetrics() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      // Increment total requests
      this.metrics.httpRequestsTotal++;
      
      // Track by method
      this.metrics.httpRequestsByMethod[req.method] = 
        (this.metrics.httpRequestsByMethod[req.method] || 0) + 1;
      
      // Track by path (normalize to avoid cardinality explosion)
      const normalizedPath = this.normalizePath(req.path);
      this.metrics.httpRequestsByPath[normalizedPath] = 
        (this.metrics.httpRequestsByPath[normalizedPath] || 0) + 1;
      
      // Capture response status
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        const duration = Date.now() - startTime;
        this.metrics.httpRequestDuration.push(duration);
        
        // Keep only last 1000 durations for histogram
        if (this.metrics.httpRequestDuration.length > 1000) {
          this.metrics.httpRequestDuration.shift();
        }
        
        // Track by status
        const statusBucket = `${Math.floor(res.statusCode / 100)}xx`;
        this.metrics.httpRequestsByStatus[statusBucket] = 
          (this.metrics.httpRequestsByStatus[statusBucket] || 0) + 1;
        
        return originalEnd.apply(res, args);
      };
      
      next();
    };
  }

  /**
   * Normalize path to avoid cardinality explosion
   */
  private normalizePath(path: string): string {
    // Replace IDs with placeholders
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/:uuid')
      .replace(/\/[a-f0-9]{24}/gi, '/:objectid');
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage(this.cpuUsageStart);
    this.metrics.uptime = (Date.now() - this.startTime) / 1000;
  }

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
  }>) {
    Object.assign(this.metrics, data);
  }

  /**
   * Record error
   */
  recordError(type: string) {
    this.metrics.errorsTotal++;
    this.metrics.errorsByType[type] = (this.metrics.errorsByType[type] || 0) + 1;
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    this.updateSystemMetrics();
    
    const lines: string[] = [];
    
    // HTTP metrics
    lines.push('# HELP http_requests_total Total number of HTTP requests');
    lines.push('# TYPE http_requests_total counter');
    lines.push(`http_requests_total ${this.metrics.httpRequestsTotal}`);
    
    // HTTP requests by method
    lines.push('# HELP http_requests_by_method_total HTTP requests by method');
    lines.push('# TYPE http_requests_by_method_total counter');
    for (const [method, count] of Object.entries(this.metrics.httpRequestsByMethod)) {
      lines.push(`http_requests_by_method_total{method="${method}"} ${count}`);
    }
    
    // HTTP requests by status
    lines.push('# HELP http_requests_by_status_total HTTP requests by status');
    lines.push('# TYPE http_requests_by_status_total counter');
    for (const [status, count] of Object.entries(this.metrics.httpRequestsByStatus)) {
      lines.push(`http_requests_by_status_total{status="${status}"} ${count}`);
    }
    
    // HTTP request duration histogram
    if (this.metrics.httpRequestDuration.length > 0) {
      const sorted = [...this.metrics.httpRequestDuration].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      
      lines.push('# HELP http_request_duration_ms HTTP request duration in milliseconds');
      lines.push('# TYPE http_request_duration_ms summary');
      lines.push(`http_request_duration_ms{quantile="0.5"} ${p50}`);
      lines.push(`http_request_duration_ms{quantile="0.95"} ${p95}`);
      lines.push(`http_request_duration_ms{quantile="0.99"} ${p99}`);
    }
    
    // Memory metrics
    lines.push('# HELP nodejs_memory_usage_bytes Node.js memory usage');
    lines.push('# TYPE nodejs_memory_usage_bytes gauge');
    lines.push(`nodejs_memory_usage_bytes{type="rss"} ${this.metrics.memoryUsage.rss}`);
    lines.push(`nodejs_memory_usage_bytes{type="heapTotal"} ${this.metrics.memoryUsage.heapTotal}`);
    lines.push(`nodejs_memory_usage_bytes{type="heapUsed"} ${this.metrics.memoryUsage.heapUsed}`);
    lines.push(`nodejs_memory_usage_bytes{type="external"} ${this.metrics.memoryUsage.external}`);
    
    // CPU metrics
    lines.push('# HELP nodejs_cpu_usage_microseconds Node.js CPU usage');
    lines.push('# TYPE nodejs_cpu_usage_microseconds counter');
    lines.push(`nodejs_cpu_usage_microseconds{type="user"} ${this.metrics.cpuUsage.user}`);
    lines.push(`nodejs_cpu_usage_microseconds{type="system"} ${this.metrics.cpuUsage.system}`);
    
    // Uptime
    lines.push('# HELP nodejs_uptime_seconds Node.js process uptime');
    lines.push('# TYPE nodejs_uptime_seconds gauge');
    lines.push(`nodejs_uptime_seconds ${this.metrics.uptime}`);
    
    // Application metrics
    lines.push('# HELP app_active_connections Active WebSocket connections');
    lines.push('# TYPE app_active_connections gauge');
    lines.push(`app_active_connections ${this.metrics.activeConnections}`);
    
    lines.push('# HELP app_active_sessions Active user sessions');
    lines.push('# TYPE app_active_sessions gauge');
    lines.push(`app_active_sessions ${this.metrics.activeSessions}`);
    
    lines.push('# HELP app_training_sessions_total Total training sessions');
    lines.push('# TYPE app_training_sessions_total counter');
    lines.push(`app_training_sessions_total ${this.metrics.trainingSessionsTotal}`);
    
    lines.push('# HELP app_training_sessions_active Active training sessions');
    lines.push('# TYPE app_training_sessions_active gauge');
    lines.push(`app_training_sessions_active ${this.metrics.trainingSessionsActive}`);
    
    lines.push('# HELP app_datasets_total Total datasets');
    lines.push('# TYPE app_datasets_total gauge');
    lines.push(`app_datasets_total ${this.metrics.datasetsTotal}`);
    
    lines.push('# HELP app_models_total Total models');
    lines.push('# TYPE app_models_total gauge');
    lines.push(`app_models_total ${this.metrics.modelsTotal}`);
    
    // Error metrics
    lines.push('# HELP app_errors_total Total errors');
    lines.push('# TYPE app_errors_total counter');
    lines.push(`app_errors_total ${this.metrics.errorsTotal}`);
    
    for (const [type, count] of Object.entries(this.metrics.errorsByType)) {
      lines.push(`app_errors_total{type="${type}"} ${count}`);
    }
    
    return lines.join('\n');
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

/**
 * Setup metrics endpoint
 */
export function setupMetrics(app: Application): void {
  if (!config.ENABLE_METRICS) {
    return;
  }
  
  // Add metrics collection middleware
  app.use(metricsCollector.collectHttpMetrics());
  
  // Metrics endpoint
  app.get('/metrics', (req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.send(metricsCollector.getPrometheusMetrics());
  });
}

/**
 * Export metrics collector for use in other modules
 */
export { metricsCollector };