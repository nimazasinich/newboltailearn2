import { Router } from 'express';
import { createAuthRoutes } from './auth.routes.js';
import { createModelsRoutes } from './models.routes.js';
import { createDatasetsRoutes } from './datasets.routes.js';
import { createAnalyticsRoutes } from './analytics.routes.js';
import { createMonitoringRoutes } from './monitoring.routes.js';
import { AuthController } from '../modules/controllers/auth.controller.js';
import { ModelsController } from '../modules/controllers/models.controller.js';
import { DatasetsController } from '../modules/controllers/datasets.controller.js';
import { AnalyticsController } from '../modules/controllers/analytics.controller.js';
import { MonitoringController } from '../modules/controllers/monitoring.controller.js';
/**
 * Main API Router
 * Mounts all API routes under /api prefix
 */
export default function createApiRouter(io, db) {
    const router = Router();
    // Initialize controllers
    const authController = new AuthController(db);
    const modelsController = new ModelsController(db, io);
    const datasetsController = new DatasetsController(db);
    const analyticsController = new AnalyticsController(db);
    const monitoringController = new MonitoringController(db);
    // Mount individual route modules
    router.use('/auth', createAuthRoutes(authController));
    router.use('/models', createModelsRoutes(modelsController, io));
    router.use('/datasets', createDatasetsRoutes(datasetsController, io));
    router.use('/analytics', createAnalyticsRoutes(analyticsController));
    router.use('/monitoring', createMonitoringRoutes(monitoringController));
    // Health check endpoint (moved from index.ts)
    router.get('/health', (_req, res) => {
        res.json({ status: 'healthy', message: 'API is up and running' });
    });
    return router;
}
