import { Router } from 'express';
import { MonitoringController } from '../modules/controllers/monitoring.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { apiRateLimiter } from '../modules/security/rateLimiter.js';

export function createMonitoringRoutes(controller: MonitoringController): Router {
  const router = Router();

  // Apply common middleware
  router.use(requireAuth);
  router.use(apiRateLimiter);

  // Monitoring routes
  router.get('/', controller.getSystemMetrics.bind(controller));
  router.get('/logs', requireRole('admin'), controller.getSystemLogs.bind(controller));
  router.get('/health', controller.getHealthStatus.bind(controller));
  router.get('/performance', requireRole('admin'), controller.getPerformanceMetrics.bind(controller));

  return router;
}