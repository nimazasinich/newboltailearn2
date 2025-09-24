import { Router } from 'express';
import { AnalyticsController } from '../modules/controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../modules/security/rateLimiter';

export function createAnalyticsRoutes(controller: AnalyticsController): Router {
  const router = Router();

  // Apply common middleware
  router.use(requireAuth);
  router.use(apiRateLimiter);

  // Analytics routes
  router.get('/', controller.getBasicAnalytics.bind(controller));
  router.get('/advanced', requireRole('viewer'), controller.getAdvancedAnalytics.bind(controller));
  router.get('/performance', requireRole('viewer'), controller.getPerformanceMetrics.bind(controller));
  router.get('/usage', requireRole('admin'), controller.getUsageStats.bind(controller));

  return router;
}