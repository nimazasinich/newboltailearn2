#!/usr/bin/env node

// Simple server for Node.js 18 compatibility
// Persian Legal AI Dashboard - Simplified Server

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('dist'));

// Basic SQLite setup (simplified)
let db = null;

async function initializeDatabase() {
    try {
        const Database = await import('better-sqlite3');
        db = new Database.default('./database.sqlite');
        console.log('✅ Database connected');
    } catch (error) {
        console.warn('⚠️ Database not available, using mock data');
    }
}

// Initialize database
initializeDatabase();

// Initialize basic tables if database is available
if (db) {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS models (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'persian-legal',
                status TEXT DEFAULT 'idle',
                accuracy REAL DEFAULT 0,
                progress REAL DEFAULT 0,
                epochs INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS datasets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'legal-text',
                size INTEGER DEFAULT 0,
                quality_score REAL DEFAULT 0,
                status TEXT DEFAULT 'ready',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS training_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_id TEXT,
                level TEXT DEFAULT 'info',
                message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (model_id) REFERENCES models(id)
            )
        `);

        // Insert sample data if tables are empty
        const modelCount = db.prepare('SELECT COUNT(*) as count FROM models').get().count;
        if (modelCount === 0) {
            const insertModel = db.prepare(`
                INSERT INTO models (id, name, type, status, accuracy, progress, epochs)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            insertModel.run('model-001', 'مدل قوانین مدنی', 'civil-law', 'training', 0.87, 65, 15);
            insertModel.run('model-002', 'مدل قوانین جزایی', 'criminal-law', 'completed', 0.92, 100, 25);
            insertModel.run('model-003', 'مدل قوانین تجاری', 'commercial-law', 'idle', 0.0, 0, 0);
            insertModel.run('model-004', 'مدل قوانین اداری', 'administrative-law', 'paused', 0.73, 40, 8);

            console.log('✅ Sample models inserted');
        }

        const datasetCount = db.prepare('SELECT COUNT(*) as count FROM datasets').get().count;
        if (datasetCount === 0) {
            const insertDataset = db.prepare(`
                INSERT INTO datasets (id, name, type, size, quality_score, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            insertDataset.run('dataset-001', 'مجموعه قوانین مدنی', 'civil-law', 15400, 0.94, 'ready');
            insertDataset.run('dataset-002', 'مجموعه قوانین جزایی', 'criminal-law', 12800, 0.89, 'ready');
            insertDataset.run('dataset-003', 'مجموعه قوانین تجاری', 'commercial-law', 8900, 0.91, 'ready');
            insertDataset.run('dataset-004', 'مجموعه قوانین اداری', 'administrative-law', 11200, 0.88, 'processing');

            console.log('✅ Sample datasets inserted');
        }

    } catch (error) {
        console.error('Database setup error:', error);
    }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'mock',
        version: '1.0.0',
        persian_support: true
    });
});

// Models API
app.get('/api/models', (req, res) => {
    try {
        if (db) {
            const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all();
            res.json({
                success: true,
                data: models,
                total: models.length
            });
        } else {
            // Mock data
            res.json({
                success: true,
                data: [
                    {
                        id: 'model-001',
                        name: 'مدل قوانین مدنی',
                        type: 'civil-law',
                        status: 'training',
                        accuracy: 0.87,
                        progress: 65,
                        epochs: 15,
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'model-002',
                        name: 'مدل قوانین جزایی',
                        type: 'criminal-law',
                        status: 'completed',
                        accuracy: 0.92,
                        progress: 100,
                        epochs: 25,
                        created_at: new Date().toISOString()
                    }
                ],
                total: 2
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Model details
app.get('/api/models/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (db) {
            const model = db.prepare('SELECT * FROM models WHERE id = ?').get(id);
            if (!model) {
                return res.status(404).json({
                    success: false,
                    error: 'Model not found'
                });
            }
            res.json({
                success: true,
                data: model
            });
        } else {
            // Mock response
            res.json({
                success: true,
                data: {
                    id: id,
                    name: 'مدل نمونه',
                    type: 'legal-model',
                    status: 'idle',
                    accuracy: 0.85,
                    progress: 0,
                    epochs: 0,
                    created_at: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start model training
app.post('/api/models/:id/start', (req, res) => {
    try {
        const { id } = req.params;
        
        if (db) {
            const updateModel = db.prepare('UPDATE models SET status = ?, updated_at = ? WHERE id = ?');
            const result = updateModel.run('training', new Date().toISOString(), id);
            
            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Model not found'
                });
            }
        }
        
        res.json({
            success: true,
            message: 'Training started',
            model_id: id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Datasets API
app.get('/api/datasets', (req, res) => {
    try {
        if (db) {
            const datasets = db.prepare('SELECT * FROM datasets ORDER BY created_at DESC').all();
            res.json({
                success: true,
                data: datasets,
                total: datasets.length
            });
        } else {
            // Mock data
            res.json({
                success: true,
                data: [
                    {
                        id: 'dataset-001',
                        name: 'مجموعه قوانین مدنی',
                        type: 'civil-law',
                        size: 15400,
                        quality_score: 0.94,
                        status: 'ready',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'dataset-002',
                        name: 'مجموعه قوانین جزایی',
                        type: 'criminal-law',
                        size: 12800,
                        quality_score: 0.89,
                        status: 'ready',
                        created_at: new Date().toISOString()
                    }
                ],
                total: 2
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// System metrics
app.get('/api/monitoring/metrics', (req, res) => {
    try {
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();
        
        res.json({
            success: true,
            data: {
                cpu_usage: Math.floor(Math.random() * 30 + 20), // Simulated
                memory_usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
                disk_usage: Math.floor(Math.random() * 20 + 60), // Simulated
                uptime: Math.floor(uptime),
                active_connections: Math.floor(Math.random() * 10 + 5),
                gpu_usage: Math.floor(Math.random() * 40 + 30), // Simulated
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Training logs
app.get('/api/logs', (req, res) => {
    try {
        const { page = 1, limit = 50, level } = req.query;
        
        if (db) {
            let query = 'SELECT * FROM training_logs';
            const params = [];
            
            if (level) {
                query += ' WHERE level = ?';
                params.push(level);
            }
            
            query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
            params.push(Number(limit), (Number(page) - 1) * Number(limit));
            
            const logs = db.prepare(query).all(...params);
            const totalQuery = level ? 
                'SELECT COUNT(*) as total FROM training_logs WHERE level = ?' :
                'SELECT COUNT(*) as total FROM training_logs';
            const total = db.prepare(totalQuery).get(level || undefined)?.total || 0;
            
            res.json({
                success: true,
                data: logs,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } else {
            // Mock logs
            const mockLogs = [
                {
                    id: 1,
                    model_id: 'model-001',
                    level: 'info',
                    message: 'آموزش مدل آغاز شد',
                    timestamp: new Date().toISOString()
                },
                {
                    id: 2,
                    model_id: 'model-001',
                    level: 'success',
                    message: 'دقت مدل به 87% رسید',
                    timestamp: new Date().toISOString()
                },
                {
                    id: 3,
                    model_id: 'model-002',
                    level: 'info',
                    message: 'مدل با موفقیت آموزش دید',
                    timestamp: new Date().toISOString()
                }
            ];
            
            res.json({
                success: true,
                data: mockLogs,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: mockLogs.length,
                    totalPages: 1
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Analytics data
app.get('/api/analytics', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                total_models: 4,
                training_models: 1,
                completed_models: 1,
                total_datasets: 4,
                total_documents: 48300,
                average_accuracy: 0.855,
                training_hours: 127,
                performance_metrics: {
                    cpu_efficiency: 0.92,
                    memory_optimization: 0.88,
                    training_speed: 0.94
                },
                recent_activity: [
                    { action: 'model_started', model: 'مدل قوانین مدنی', time: '2 دقیقه پیش' },
                    { action: 'dataset_processed', dataset: 'مجموعه قوانین جزایی', time: '15 دقیقه پیش' },
                    { action: 'model_completed', model: 'مدل قوانین تجاری', time: '1 ساعت پیش' }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve React app
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            error: 'Frontend not built. Run npm run build first.'
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('================================================================');
    console.log('🚀 Persian Legal AI Dashboard - Simple Server');
    console.log('================================================================');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${db ? 'SQLite Connected' : 'Mock Data Mode'}`);
    console.log(`🌐 CORS: Enabled for local development`);
    console.log(`📊 API Endpoints: /api/health, /api/models, /api/datasets, /api/logs`);
    console.log(`🎯 Purpose: Iranian Legal/Social Learning Model Tracker`);
    console.log(`✅ Status: Ready for Persian legal AI training`);
    console.log('================================================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Persian Legal AI server...');
    if (db) {
        db.close();
        console.log('✅ Database connection closed');
    }
    process.exit(0);
});

console.log('Persian Legal AI Dashboard server module loaded successfully!');