import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics();

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const activeConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

export const trainingSessionsActive = new Gauge({
  name: 'training_sessions_active',
  help: 'Number of active training sessions'
});

export const trainingSessionsTotal = new Counter({
  name: 'training_sessions_total',
  help: 'Total number of training sessions started',
  labelNames: ['model_type', 'status']
});

export const databaseOperations = new Counter({
  name: 'database_operations_total',
  help: 'Total number of database operations',
  labelNames: ['operation', 'table']
});

export const systemMemoryUsage = new Gauge({
  name: 'system_memory_usage_bytes',
  help: 'System memory usage in bytes',
  labelNames: ['type']
});

export const systemCpuUsage = new Gauge({
  name: 'system_cpu_usage_percent',
  help: 'System CPU usage percentage'
});

// Metrics handler for /metrics endpoint
export const handler = async (req: any, res: any) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
};

// Update system metrics
export function updateSystemMetrics() {
  const memUsage = process.memoryUsage();
  
  systemMemoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
  systemMemoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
  systemMemoryUsage.set({ type: 'external' }, memUsage.external);
  systemMemoryUsage.set({ type: 'rss' }, memUsage.rss);
  
  // Simple CPU usage calculation
  const startUsage = process.cpuUsage();
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
    systemCpuUsage.set(cpuPercent);
  }, 100);
}

// Update metrics every 5 seconds
setInterval(updateSystemMetrics, 5000);