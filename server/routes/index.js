import { Router } from 'express';
import { createAuthRoutes } from './auth.routes';
import { createModelsRoutes } from './models.routes';
import { createDatasetsRoutes } from './datasets.routes';
import { createAnalyticsRoutes } from './analytics.routes';
import { createMonitoringRoutes } from './monitoring.routes';
import { AuthController } from '../modules/controllers/auth.controller';
import { ModelsController } from '../modules/controllers/models.controller';
import { DatasetsController } from '../modules/controllers/datasets.controller';
import { AnalyticsController } from '../modules/controllers/analytics.controller';
import { MonitoringController } from '../modules/controllers/monitoring.controller';
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
                'SELECT COUNT(*) as count FROM users',
                'SELECT COUNT(*) as count FROM training_sessions'
            ];
            
            const tableNames = ['models', 'datasets', 'users', 'training_sessions'];
            
            for (let i = 0; i < queries.length; i++) {
                try {
                    const result = db.prepare(queries[i]).get();
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
    
    // Training stats endpoint
    router.get('/training/stats', (req, res) => {
        try {
            const stats = {
                totalModels: db.prepare('SELECT COUNT(*) as count FROM models').get()?.count || 0,
                activeTraining: db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get()?.count || 0,
                completedTraining: db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'completed'").get()?.count || 0,
                averageAccuracy: db.prepare('SELECT AVG(accuracy) as avg FROM models WHERE accuracy > 0').get()?.avg || 0,
                totalTrainingHours: db.prepare(`
                    SELECT COALESCE(SUM(
                        CASE 
                            WHEN end_time IS NOT NULL THEN 
                                (julianday(end_time) - julianday(start_time)) * 24
                            ELSE 
                                (julianday('now') - julianday(start_time)) * 24
                        END
                    ), 0) as hours 
                    FROM training_sessions
                `).get()?.hours || 0
            };
            res.json(stats);
        } catch (error) {
            console.error('Get training stats error:', error);
            res.status(500).json({ error: 'Failed to get training stats' });
        }
    });
    
    // Training sessions endpoints
    router.get('/training/sessions', (req, res) => {
        try {
            const sessions = db.prepare(`
                SELECT 
                    ts.*, m.name as model_name, m.type as model_type
                FROM training_sessions ts
                LEFT JOIN models m ON ts.model_id = m.id
                ORDER BY ts.start_time DESC
            `).all();
            res.json(sessions);
        } catch (error) {
            console.error('Get training sessions error:', error);
            res.status(500).json({ error: 'Failed to get training sessions' });
        }
    });
    
    return router;
}
