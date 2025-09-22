import DatabaseManager from './database/DatabaseManager.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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
        app.use(express.static(path.join(__dirname, '../docs')));
        
        // Health check endpoint (beacon functionality)
        app.get('/health', (req, res) => {
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
        
        // Serve frontend for all other routes (SPA fallback)
        app.get('*', (req, res) => {
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