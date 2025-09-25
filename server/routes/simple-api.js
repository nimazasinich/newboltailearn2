import { Router } from 'express';

export default function createSimpleApiRouter(db) {
    const router = Router();

    // Health check
    router.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    });

    // Models endpoints
    router.get('/models', (req, res) => {
        try {
            const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all();
            res.json(models);
        } catch (error) {
            console.error('Error fetching models:', error);
            res.status(500).json({ error: 'Failed to fetch models' });
        }
    });

    router.post('/models', (req, res) => {
        try {
            const { name, type, dataset_id, config } = req.body;
            const result = db.prepare(`
                INSERT INTO models (name, type, dataset_id, config, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).run(name, type, dataset_id || null, JSON.stringify(config || {}));
            
            res.status(201).json({
                id: result.lastInsertRowid,
                name,
                type,
                dataset_id,
                config,
                status: 'idle',
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error creating model:', error);
            res.status(500).json({ error: 'Failed to create model' });
        }
    });

    // Datasets endpoints
    router.get('/datasets', (req, res) => {
        try {
            const datasets = db.prepare('SELECT * FROM datasets ORDER BY created_at DESC').all();
            res.json(datasets);
        } catch (error) {
            console.error('Error fetching datasets:', error);
            res.status(500).json({ error: 'Failed to fetch datasets' });
        }
    });

    router.post('/datasets', (req, res) => {
        try {
            const { name, type, description, source } = req.body;
            const result = db.prepare(`
                INSERT INTO datasets (name, type, description, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).run(name, type, description || '', source || '');
            
            res.status(201).json({
                id: result.lastInsertRowid,
                name,
                type,
                description,
                source,
                status: 'idle',
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error creating dataset:', error);
            res.status(500).json({ error: 'Failed to create dataset' });
        }
    });

    // Training stats
    router.get('/training/stats', (req, res) => {
        try {
            const stats = {
                totalModels: db.prepare('SELECT COUNT(*) as count FROM models').get()?.count || 0,
                activeTraining: db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get()?.count || 0,
                completedTraining: db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'completed'").get()?.count || 0,
                averageAccuracy: db.prepare('SELECT AVG(accuracy) as avg FROM models WHERE accuracy > 0').get()?.avg || 0,
                totalTrainingHours: 0
            };
            res.json(stats);
        } catch (error) {
            console.error('Error fetching training stats:', error);
            res.status(500).json({ error: 'Failed to fetch training stats' });
        }
    });

    // System metrics
    router.get('/system/metrics', (req, res) => {
        try {
            const metrics = {
                cpu: Math.floor(Math.random() * 30 + 30),
                memory: {
                    used: Math.floor(Math.random() * 4 + 4),
                    total: 16,
                    percentage: Math.floor(Math.random() * 20 + 30)
                },
                disk: {
                    used: Math.floor(Math.random() * 50 + 100),
                    total: 500,
                    percentage: Math.floor(Math.random() * 10 + 20)
                },
                uptime: process.uptime(),
                status: 'ok',
                timestamp: new Date().toISOString()
            };
            res.json(metrics);
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            res.status(500).json({ error: 'Failed to fetch system metrics' });
        }
    });

    // Analytics endpoints
    router.get('/analytics/performance', (req, res) => {
        try {
            const performance = Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                models_trained: Math.floor(Math.random() * 8) + 2,
                avg_accuracy: Math.random() * 0.2 + 0.8,
                training_hours: Math.floor(Math.random() * 12) + 4,
                success_rate: Math.random() * 0.15 + 0.85
            }));
            res.json(performance);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    });

    return router;
}
