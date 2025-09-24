import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { apiRateLimiter } from '../modules/security/rateLimiter';
export function createMonitoringRoutes(controller) {
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
