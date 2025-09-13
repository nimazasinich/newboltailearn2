import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { testHFConnection, logTokenStatus } from './utils/decode.js';
import { AuthService } from './services/authService.js';
import { setupModules } from './modules/setup.js';
import { spaFallback } from './middleware/spaFallback.js';
import { handler as metricsHandler } from './modules/metrics/prom.js';
import createApiRouter from './routes/index.js';
// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
// ✅ Serve React build (production)
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));
// Initialize SQLite Database
const dbPath = path.join(process.cwd(), 'persian_legal_ai.db');
const db = new Database(dbPath);
// Initialize Auth Service
const authService = new AuthService(db);
// Setup modular components (security, routes, monitoring, etc.)
setupModules(app, db, io);
// Health check endpoint
app.get('/health', (_req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: db.open ? 'connected' : 'disconnected',
        version: process.env.npm_package_version || '1.0.0'
    };
    res.json(health);
});
// Metrics endpoint
app.get('/metrics', metricsHandler);
// API routes
app.use('/api', createApiRouter(io, db));
// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('dora', 'qr-adaptor', 'persian-bert')),
    status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'training', 'completed', 'failed', 'paused')),
    accuracy REAL DEFAULT 0,
    loss REAL DEFAULT 0,
    epochs INTEGER DEFAULT 0,
    current_epoch INTEGER DEFAULT 0,
    dataset_id TEXT,
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    huggingface_id TEXT,
    samples INTEGER DEFAULT 0,
    size_mb REAL DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'downloading', 'processing', 'error')),
    local_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')),
    message TEXT NOT NULL,
    epoch INTEGER,
    loss REAL,
    accuracy REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')),
    category TEXT,
    message TEXT NOT NULL,
    metadata TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'trainer', 'viewer', 'user')),
    permissions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Phase 4: AI Training Data Persistence Tables
  CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    dataset_id TEXT NOT NULL,
    parameters TEXT NOT NULL, -- JSON config
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    status TEXT DEFAULT 'running' CHECK(status IN ('running', 'completed', 'failed', 'paused')),
    final_accuracy REAL,
    final_loss REAL,
    total_epochs INTEGER,
    training_duration_seconds INTEGER,
    result TEXT, -- JSON with detailed results
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id),
    FOREIGN KEY(dataset_id) REFERENCES datasets(id)
  );

  CREATE TABLE IF NOT EXISTS checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    session_id INTEGER,
    epoch INTEGER NOT NULL,
    accuracy REAL,
    loss REAL,
    file_path TEXT NOT NULL,
    file_size_mb REAL,
    metadata TEXT, -- JSON with additional checkpoint info
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id),
    FOREIGN KEY(session_id) REFERENCES training_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    rank_type TEXT NOT NULL CHECK(rank_type IN ('overall', 'by_dataset', 'by_type', 'by_accuracy', 'by_f1', 'by_stability')),
    score REAL NOT NULL,
    rank_position INTEGER,
    category TEXT,
    dataset_id TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id),
    FOREIGN KEY(dataset_id) REFERENCES datasets(id)
  );

  CREATE TABLE IF NOT EXISTS model_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Legal QA', 'Laws', 'NER', 'Classification', 'Generation', 'Translation')),
    confidence REAL DEFAULT 1.0,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );

  CREATE TABLE IF NOT EXISTS model_exports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    export_type TEXT NOT NULL CHECK(export_type IN ('weights', 'config', 'full_model', 'checkpoint')),
    file_path TEXT NOT NULL,
    file_size_mb REAL,
    export_format TEXT DEFAULT 'json' CHECK(export_format IN ('json', 'h5', 'pb', 'onnx')),
    metadata TEXT, -- JSON with export details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );

  -- Phase 3: Model Optimization Tables
  CREATE TABLE IF NOT EXISTS optimization_sessions (
    id TEXT PRIMARY KEY,
    model_id INTEGER NOT NULL,
    optimization_type TEXT NOT NULL CHECK(optimization_type IN ('hyperparameter', 'architecture', 'training', 'inference')),
    parameters TEXT NOT NULL, -- JSON with optimization parameters
    constraints TEXT NOT NULL, -- JSON with optimization constraints
    search_space TEXT NOT NULL, -- JSON with search space definition
    status TEXT DEFAULT 'running' CHECK(status IN ('running', 'completed', 'failed', 'stopped', 'paused')),
    current_iteration INTEGER DEFAULT 0,
    total_iterations INTEGER DEFAULT 0,
    best_score REAL DEFAULT 0,
    best_config TEXT, -- JSON with best configuration found
    final_score REAL,
    final_config TEXT, -- JSON with final optimized configuration
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );

  CREATE TABLE IF NOT EXISTS optimization_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    optimization_id TEXT NOT NULL,
    iteration INTEGER NOT NULL,
    configuration TEXT NOT NULL, -- JSON with configuration tested
    score REAL NOT NULL,
    accuracy REAL,
    loss REAL,
    training_time INTEGER, -- in seconds
    memory_usage REAL, -- in MB
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(optimization_id) REFERENCES optimization_sessions(id)
  );
`);
// Insert default datasets
const defaultDatasets = [
    {
        id: 'iran-legal-qa',
        name: 'پرسش و پاسخ حقوقی ایران',
        source: 'huggingface',
        huggingface_id: 'PerSets/iran-legal-persian-qa',
        samples: 10247,
        size_mb: 15.2
    },
    {
        id: 'legal-laws',
        name: 'متون قوانین ایران',
        source: 'huggingface',
        huggingface_id: 'QomSSLab/legal_laws_lite_chunk_v1',
        samples: 50000,
        size_mb: 125.8
    },
    {
        id: 'persian-ner',
        name: 'تشخیص موجودیت فارسی',
        source: 'huggingface',
        huggingface_id: 'mansoorhamidzadeh/Persian-NER-Dataset-500k',
        samples: 500000,
        size_mb: 890.5
    }
];
const insertDataset = db.prepare(`
  INSERT OR IGNORE INTO datasets (id, name, source, huggingface_id, samples, size_mb)
  VALUES (?, ?, ?, ?, ?, ?)
`);
defaultDatasets.forEach(dataset => {
    insertDataset.run(dataset.id, dataset.name, dataset.source, dataset.huggingface_id, dataset.samples, dataset.size_mb);
});
// Insert default settings
const defaultSettings = [
    { key: 'dataset_directory', value: './datasets', description: 'Directory for storing datasets' },
    { key: 'model_directory', value: './models', description: 'Directory for storing trained models' },
    { key: 'huggingface_token_configured', value: 'true', description: 'HuggingFace API token is configured' },
    { key: 'max_concurrent_training', value: '2', description: 'Maximum concurrent training sessions' },
    { key: 'default_batch_size', value: '32', description: 'Default batch size for training' },
    { key: 'default_learning_rate', value: '0.001', description: 'Default learning rate' }
];
const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO system_settings (key, value, description)
  VALUES (?, ?, ?)
`);
defaultSettings.forEach(setting => {
    insertSetting.run(setting.key, setting.value, setting.description);
});
// Utility functions
const logToDatabase = (level, category, message, metadata) => {
    const stmt = db.prepare(`
    INSERT INTO system_logs (level, category, message, metadata)
    VALUES (?, ?, ?, ?)
  `);
    stmt.run(level, category, message, metadata ? JSON.stringify(metadata) : null);
};
// Create default admin user if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
    const bcrypt = await import('bcryptjs');
    const defaultPassword = await bcrypt.hash('admin123', 12);
    db.prepare(`
    INSERT INTO users (username, email, password_hash, role, created_at)
    VALUES ('admin', 'admin@persian-legal-ai.com', ?, 'admin', CURRENT_TIMESTAMP)
  `).run(defaultPassword);
    logToDatabase('info', 'setup', 'Default admin user created', {
        username: 'admin',
        email: 'admin@persian-legal-ai.com',
        password: 'admin123' // This should be changed in production
    });
}
const getSystemMetrics = async () => {
    const memUsage = process.memoryUsage();
    const os = await import('os');
    // Get CPU usage (simplified)
    const cpuUsage = await getCPUUsage();
    // Get system memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    return {
        cpu: cpuUsage,
        memory: {
            used: Math.round(usedMem / 1024 / 1024),
            total: Math.round(totalMem / 1024 / 1024),
            percentage: Math.round((usedMem / totalMem) * 100)
        },
        process_memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        uptime: Math.floor(process.uptime()),
        system_uptime: Math.floor(os.uptime()),
        platform: os.platform(),
        arch: os.arch(),
        timestamp: new Date().toISOString(),
        active_training: 0 // TODO: Implement active training sessions tracking
    };
};
// CPU usage calculation
async function getCPUUsage() {
    const os = await import('os');
    return new Promise((resolve) => {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        setTimeout(() => {
            const cpus2 = os.cpus();
            let totalIdle2 = 0;
            let totalTick2 = 0;
            cpus2.forEach(cpu => {
                for (const type in cpu.times) {
                    totalTick2 += cpu.times[type];
                }
                totalIdle2 += cpu.times.idle;
            });
            const idle2 = totalIdle2 / cpus2.length;
            const total2 = totalTick2 / cpus2.length;
            const idleDelta = idle2 - idle;
            const totalDelta = total2 - total;
            const usage = 100 - ~~(100 * idleDelta / totalDelta);
            resolve(Math.max(0, Math.min(100, usage)));
        }, 100);
    });
}
// SPA fallback - serve index.html for all non-API routes
app.use(spaFallback(distPath));
// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    // Send initial system metrics
    getSystemMetrics().then(metrics => {
        socket.emit('system_metrics', metrics);
    }).catch(error => {
        console.error('Failed to get initial system metrics:', error);
    });
});
// Send system metrics every 5 seconds
setInterval(async () => {
    try {
        const metrics = await getSystemMetrics();
        io.emit('system_metrics', metrics);
    }
    catch (error) {
        console.error('Failed to get system metrics:', error);
    }
}, 5000);
// Error handling middleware
app.use((error, _req, res, _next) => {
    console.error('Server error:', error);
    if (res && typeof res === 'object' && 'status' in res && 'json' in res) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
    console.log(`🚀 Persian Legal AI Server running on port ${PORT}`);
    console.log(`📊 Database: ${dbPath}`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    // Validate HuggingFace token configuration
    await logTokenStatus();
    // Test HuggingFace connection
    try {
        const isConnected = await testHFConnection();
        if (isConnected) {
            console.log('✅ HuggingFace API connection successful');
        }
        else {
            console.log('⚠️  HuggingFace API connection failed - check token configuration');
        }
    }
    catch (error) {
        console.log('⚠️  HuggingFace API connection test failed:', error.message);
    }
    console.log('✅ Server startup complete');
});
export default app;
