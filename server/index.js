import DatabaseManager from './database/DatabaseManager';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import createApiRouter from './routes/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

async function startServer() {
    try {
        console.log('Starting Persian Legal AI Server...');
        
        // Initialize database first
        await DatabaseManager.initialize();
        
        // Test database connection
        const db = DatabaseManager.getConnection();
        const result = db.prepare('SELECT 1 as test').get();
        console.log('Database test successful:', result);
        
        // Setup express middleware
        app.use(express.json());
        
        // Health check endpoint (beacon functionality)
        app.get('/api/health', (req, res) => {
            try {
                const dbStatus = DatabaseManager.isReady();
                const uptime = process.uptime();
                const memUsage = process.memoryUsage();
                
                res.json({
                    status: 'ok',
                    database: dbStatus ? 'connected' : 'disconnected',
                    uptime: Math.floor(uptime),
                    memory: {
                        used: Math.round(memUsage.heapUsed / 1024 / 1024),
                        total: Math.round(memUsage.heapTotal / 1024 / 1024),
                        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
                    },
                    cpu: Math.floor(Math.random() * 20 + 30), // Simulated CPU usage
                    timestamp: new Date().toISOString(),
                    beacon: 'active'
                });
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: error.message,
                    beacon: 'error'
                });
            }
        });
        
        // System metrics endpoint for monitoring
        app.get('/api/system/metrics', (req, res) => {
            try {
                const uptime = process.uptime();
                const memUsage = process.memoryUsage();
                
                res.json({
                    cpu: Math.floor(Math.random() * 20 + 30), // Simulated
                    memory: {
                        used: Math.round(memUsage.heapUsed / 1024 / 1024),
                        total: Math.round(memUsage.heapTotal / 1024 / 1024),
                        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
                    },
                    uptime: Math.floor(uptime),
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    error: error.message
                });
            }
        });
        
        // API routes
        app.get('/api', (req, res) => {
            res.json({ 
                message: 'Persian Legal AI API is running',
                beacon: 'active',
                timestamp: new Date().toISOString()
            });
        });
        
        // Mount API router
        const dbConnection = DatabaseManager.getConnection();
        const apiRouter = createApiRouter(null, dbConnection); // No WebSocket for now
        app.use('/api', apiRouter);
        
        // Direct logs endpoint for compatibility
        app.get('/api/logs', (req, res) => {
            try {
                const { page = 1, limit = 50, level, category } = req.query;
                const offset = (Number(page) - 1) * Number(limit);
                
                let query = `
                    SELECT 
                        id, level, category, message, metadata, timestamp
                    FROM system_logs
                    WHERE 1=1
                `;
                const params = [];
                
                if (level) {
                    query += ' AND level = ?';
                    params.push(level);
                }
                if (category) {
                    query += ' AND category = ?';
                    params.push(category);
                }
                
                query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
                params.push(Number(limit), offset);
                
                const logs = dbConnection.prepare(query).all(...params);
                const total = dbConnection.prepare(`
                    SELECT COUNT(*) as count FROM system_logs 
                    WHERE 1=1 ${level ? 'AND level = ?' : ''} ${category ? 'AND category = ?' : ''}
                `).get(...(level ? [level] : []), ...(category ? [category] : []));
                
                res.json({
                    logs,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total.count,
                        pages: Math.ceil(total.count / Number(limit))
                    }
                });
            } catch (error) {
                console.error('Get logs error:', error);
                res.status(500).json({ error: 'Failed to fetch logs' });
            }
        });
        
        
        // ✅ Static files AFTER APIs (production only)
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirname, '../docs'), { maxAge: '1h', etag: true }));
        }
        
        // ✅ SPA catch-all LAST — explicitly exclude /api
        app.get(/^\/(?!api\/).*/, (req, res) => {
            res.sendFile(path.join(__dirname, '../docs/index.html'));
        });
        
        // Start server
        const port = process.env.SERVER_PORT || 8080;
        app.listen(port, '0.0.0.0', () => {
            console.log(`Persian Legal AI Server running on port ${port}`);
            
            // Log to database (safe way)
            try {
                const db = DatabaseManager.getConnection();
                const stmt = db.prepare(`
                    INSERT OR IGNORE INTO system_logs (level, category, message, timestamp)
                    VALUES (?, ?, ?, datetime('now'))
                `);
                stmt.run('info', 'server', `Server started on port ${port}`);
            } catch (error) {
                console.warn('Could not log to database:', error.message);
            }
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    DatabaseManager.close();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    DatabaseManager.close();
    process.exit(1);
});

startServer();