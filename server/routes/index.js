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
    // Health check endpoint with database connectivity
    router.get('/health', async (req, res) => {
        try {
            // Check database connectivity and get table counts
            const tables = {};
            
            const queries = [
                'SELECT COUNT(*) as count FROM models',
                'SELECT COUNT(*) as count FROM datasets', 
                'SELECT COUNT(*) as count FROM metrics_history',
                'SELECT COUNT(*) as count FROM users'
            ];
            
            const tableNames = ['models', 'datasets', 'metrics_history', 'users'];
            
            for (let i = 0; i < queries.length; i++) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        db.get(queries[i], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });
                    tables[tableNames[i]] = result.count;
                } catch (err) {
                    console.error(`Error checking table ${tableNames[i]}:`, err);
                    tables[tableNames[i]] = -1;
                }
            }
            
            res.json({ 
                ok: true,
                database: true,
                tables,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({ 
                ok: false,
                database: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });
    return router;
}
