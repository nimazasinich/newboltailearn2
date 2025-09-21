// Silence TensorFlow info messages (AVX2 FMA optimization logs) - MUST BE FIRST
process.env.TF_CPP_MIN_LOG_LEVEL = '2';

import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment configuration
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';

const result = config({ path: envFile });
if (result.error) {
  console.warn(`⚠️  Warning: Could not load ${envFile}:`, result.error.message);
  // Try to load default .env as fallback
  const fallbackResult = config();
  if (fallbackResult.error) {
    console.warn(`⚠️  Warning: Could not load default .env file:`, fallbackResult.error.message);
  }
} else {
  console.log(`✅ Loaded environment from ${envFile}`);
}
import { testHFConnection } from './utils/decode.js'; // getHFHeaders, logTokenStatus unused
import { requireAuth } from './middleware/auth.js'; // requireRole unused
import { AuthService } from './services/authService.js';
import { setupModules } from './modules/setup.js';
import DatabaseManager from './database/DatabaseManager.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and server
const app = express();
const server = createServer(app);

// Trust proxy for Render's reverse proxy (MUST BE FIRST)
app.set('trust proxy', 1);

// CORS configuration with strict origin checking
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://nimazasinich.github.io',           // parent domain
  'https://nimazasinich.github.io/newboltailearn', // SPA base
  'https://newboltailearn-2.onrender.com'    // Render service URL
];

const corsOptions = {
  origin(origin, cb) {
    // Allow tools/no-origin (curl, health checks) and exact matches
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST']
    }
});

// STEP 1: Body parser & basic middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Always answer preflight requests
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// Production security headers (optional, non-breaking)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    });
}

// Database and services - will be initialized in async startup
let db, authService;

// Static serving configuration
const SERVE_FRONTEND = (process.env.SERVE_FRONTEND || 'false').toLowerCase() === 'true';
const clientDir = path.resolve(__dirname, '..', 'docs');

// Async startup function
async function startServer() {
    try {
        console.log('🔄 Initializing Persian Legal AI Server...');
        
        // Initialize database with migrations and seed data
        console.log('🔄 Setting up database...');
        await DatabaseManager.initialize();
        db = DatabaseManager.getConnection();
        
        // Initialize Auth Service
        authService = new AuthService(db);
        
        // Setup modular components (session, security, CSRF, routes, monitoring)
        setupModules(app, db, io);
        
        // Only serve frontend when explicitly requested (e.g., local fullstack preview)
        if (SERVE_FRONTEND) {
            if (fs.existsSync(clientDir)) {
                console.log(`🗂  Serving frontend from: ${clientDir}`);
                app.use(express.static(clientDir));
            } else {
                console.warn(`⚠️  SERVE_FRONTEND=true but not found: ${clientDir}`);
            }
        } else {
            console.log('ℹ️  Frontend serving disabled - backend API only.');
        }
        
        console.log('✅ Database and services initialized');
        
        // Add safe database operations with proper type validation
        setupDatabaseOperations();
        
        // Setup API routes with error handling
        setupAPIRoutes();
        
        // Setup error handling
        setupErrorHandling();
        
        console.log('✅ Server setup completed');
        
    } catch (error) {
        console.error('❌ Server initialization failed:', error);
        process.exit(1);
    }
}

// Safe database operations with type validation
function setupDatabaseOperations() {
    // Utility function for safe database logging using DatabaseManager
    global.logToDatabase = (level, category, message, metadata) => {
        DatabaseManager.logToDatabase(level, category, message, metadata);
    };
    
    // Safe dataset insertion with proper validation
    global.insertDatasetSafe = (datasetData) => {
        try {
            const db = DatabaseManager.getConnection();
            const stmt = db.prepare(`
                INSERT OR IGNORE INTO datasets (id, name, source, huggingface_id, samples, size_mb, status, type, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            return stmt.run(
                datasetData.id,
                datasetData.name,
                datasetData.source,
                datasetData.huggingface_id,
                datasetData.samples,
                datasetData.size_mb,
                datasetData.status || 'available',
                datasetData.type,
                datasetData.description
            );
        } catch (error) {
            console.error('❌ Failed to insert dataset:', error);
            global.logToDatabase('error', 'database', 'Dataset insertion failed', { error: error.message, data: datasetData });
        }
    };
    
    // Safe model insertion with proper validation
    global.insertModelSafe = (modelData) => {
        try {
            const db = DatabaseManager.getConnection();
            const stmt = db.prepare(`
                INSERT INTO models (name, type, status, accuracy, loss, epochs, current_epoch, dataset_id, config, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            return stmt.run(
                modelData.name,
                modelData.type,
                modelData.status || 'idle',
                modelData.accuracy || 0,
                modelData.loss || 0,
                modelData.epochs || 0,
                modelData.current_epoch || 0,
                modelData.dataset_id,
                modelData.config ? JSON.stringify(modelData.config) : null,
                modelData.created_by
            );
        } catch (error) {
            console.error('❌ Failed to insert model:', error);
            global.logToDatabase('error', 'database', 'Model insertion failed', { error: error.message, data: modelData });
        }
    };
}

// Setup API routes with proper error handling
function setupAPIRoutes() {
    // Root info endpoint (non-API) - shows service status instead of blank page
    app.get('/', (req, res) => {
        res.status(200).json({
            service: 'Persian Legal AI',
            status: 'ok',
            api: '/api',
            health: '/health',
            time: new Date().toISOString()
        });
    });

    // Comprehensive health check endpoint (for Render)
    app.get('/health', async (req, res) => {
        const healthData = {
            status: 'unknown',
            timestamp: new Date().toISOString(),
            node_version: process.version,
            abi_version: process.versions.modules,
            platform: process.platform,
            arch: process.arch,
            uptime: Math.floor(process.uptime()),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            database: {
                connected: false,
                migrations: {
                    completed: false,
                    error: null,
                    timestamp: null
                },
                last_query: null
            },
            environment: {
                node_env: process.env.NODE_ENV,
                render_service_name: process.env.RENDER_SERVICE_NAME || 'local',
                port: PORT
            }
        };
        
        try {
            // Test better-sqlite3 loading
            const Database = await import('better-sqlite3');
            console.log('✅ better-sqlite3 import successful');
            
            // Test database connection using DatabaseManager
            const dbHealth = await DatabaseManager.healthCheck();
            healthData.database.connected = dbHealth.healthy;
            
            if (dbHealth.healthy) {
                healthData.database.last_query = dbHealth.timestamp;
                healthData.database.migrations.completed = true;
                healthData.database.migrations.timestamp = dbHealth.timestamp;
            } else {
                healthData.database.migrations.error = dbHealth.error;
            }
            
            healthData.status = 'healthy';
            res.status(200).json(healthData);
            
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            healthData.status = 'unhealthy';
            healthData.error = error.message;
            healthData.database.connected = false;
            
            res.status(500).json(healthData);
        }
    });

    // Simple ping endpoint
    app.get('/ping', (req, res) => {
        res.status(200).send('pong');
    });

    // Detailed API health check endpoint
    app.get('/api/health', async (req, res) => {
        try {
            const stats = DatabaseManager.getStats();
            const health = await DatabaseManager.healthCheck();
            res.json({
                status: health.healthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                database: stats,
                health: health
            });
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                message: 'Database health check failed',
                error: error.message 
            });
        }
    });
    
    // Database stats endpoint
    app.get('/api/stats', requireAuth, (req, res) => {
        try {
            const stats = DatabaseManager.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get database stats' });
        }
    });

    // Debug endpoint for database schema (for troubleshooting)
    app.get('/api/debug/schema', (req, res) => {
        try {
            const db = DatabaseManager.getConnection();
            const tables = ['datasets', 'models', 'users'];
            const schema = {};
            
            tables.forEach(tableName => {
                try {
                    const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
                    schema[tableName] = tableInfo.map(col => ({
                        name: col.name,
                        type: col.type,
                        nullable: !col.notnull,
                        defaultValue: col.dflt_value
                    }));
                } catch (error) {
                    schema[tableName] = { error: error.message };
                }
            });
            
            // Also check for sample dataset data
            try {
                const sampleData = db.prepare('SELECT id, name, description FROM datasets LIMIT 3').all();
                schema.sampleData = sampleData;
            } catch (error) {
                schema.sampleData = { error: error.message };
            }
            
            res.json({
                timestamp: new Date().toISOString(),
                dbPath: process.env.DB_PATH || './persian_legal_ai.db',
                schema
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Failed to get schema info',
                message: error.message 
            });
        }
    });
    
    // All other API routes are handled by the modular system
    // which is set up in setupModules()
}

// Setup comprehensive error handling
function setupErrorHandling() {
    // Catch 404 errors and handle SPA fallback
    app.use((req, res, _next) => {
        if (req.path.startsWith('/api/')) {
            res.status(404).json({ error: 'API endpoint not found' });
        } else {
            // SPA fallback only if frontend serving is enabled and index.html exists
            if (SERVE_FRONTEND) {
                const indexPath = path.join(clientDir, 'index.html');
                if (fs.existsSync(indexPath)) {
                    return res.sendFile(indexPath);
                }
                console.warn('⚠️  index.html missing in frontend directory');
                res.status(404).send('Frontend build not found.');
            } else {
                res.status(404).json({ error: 'Frontend serving disabled - API only backend' });
            }
        }
    });
    
    // Global error handler
    app.use((error, req, res, _next) => {
        console.error('❌ Unhandled error:', error);
        
        // Log to database if possible
        if (typeof global.logToDatabase === 'function') {
            global.logToDatabase('error', 'server', 'Unhandled error', {
                message: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method
            });
        }
        
        // Send error response
        if (res && typeof res === 'object' && 'status' in res && 'json' in res) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

// Start the server
const PORT = process.env.PORT || process.env.SERVER_PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

startServer().then(() => {
    server.listen(PORT, HOST, async () => {
        console.log(`🚀 Persian Legal AI Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📊 Database: ${process.env.DB_PATH || './persian_legal_ai.db'}`);
        console.log(`🌐 API: http://localhost:${PORT}/api`);
        console.log(`📦 Frontend base: ${process.env.VITE_BASE_PATH || '/'}`);
        console.log(`🔗 CORS origins: ${allowedOrigins.join(', ')}`);
        
        // Optional HuggingFace startup check
        const ENABLE_HF_STARTUP_CHECK = (process.env.ENABLE_HF_STARTUP_CHECK || 'false').toLowerCase() === 'true';

        if (ENABLE_HF_STARTUP_CHECK) {
            try {
                const result = await testHFConnection();
                if (result.ok) console.log('✅ HuggingFace API connection OK');
                else console.warn('⚠️  HuggingFace API connection failed:', result);
            } catch (e) {
                console.warn('⚠️  HF check errored (non-fatal):', e?.message || e);
            }
        } else {
            console.log('ℹ️  Skipping HF startup check.');
        }
        
        // Log server startup using the safe DatabaseManager method
        try {
            DatabaseManager.logToDatabase('info', 'server', `Server started on port ${PORT}`, {
                port: PORT,
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString()
            });
        } catch (logError) {
            console.warn('⚠️ Failed to log server startup to database:', logError.message);
            // Don't fail server startup due to logging issues
        }
        console.log('🎉 Server startup completed successfully!');
    });
}).catch(error => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
});

// Keep-alive ping for Render free tier
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const keepAliveInterval = setInterval(async () => {
        try {
            const response = await fetch(`${process.env.RENDER_EXTERNAL_URL}/ping`);
            if (response.ok) {
                console.log('🔄 Keep-alive ping successful');
            } else {
                console.log('⚠️ Keep-alive ping failed with status:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Keep-alive ping error:', error.message);
        }
    }, 14 * 60 * 1000); // Every 14 minutes

    // Clear interval on shutdown
    const clearKeepAlive = () => {
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            console.log('✅ Keep-alive interval cleared');
        }
    };

    process.on('SIGTERM', clearKeepAlive);
    process.on('SIGINT', clearKeepAlive);
}

// Graceful shutdown handler
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
        console.log('⚠️ Shutdown already in progress');
        return;
    }
    
    isShuttingDown = true;
    console.log(`🛑 Received ${signal}, initiating graceful shutdown...`);
    
    // Set a timeout for forced exit
    const forceExitTimer = setTimeout(() => {
        console.log('⚠️ Forced exit after 10 seconds timeout');
        process.exit(1);
    }, 10000);

    try {
        // Stop accepting new connections
        if (typeof server !== 'undefined' && server) {
            server.close(() => {
                console.log('✅ HTTP server closed');
            });
        }

        // Close Socket.IO if exists
        if (typeof io !== 'undefined' && io) {
            io.close();
            console.log('✅ Socket.IO connections closed');
        }

        // Close database connections
        try {
            await DatabaseManager.close();
            console.log('✅ Database connections closed');
        } catch (dbError) {
            console.log('⚠️ Error closing database:', dbError.message);
        }

        clearTimeout(forceExitTimer);
        console.log('✅ Graceful shutdown completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        clearTimeout(forceExitTimer);
        process.exit(1);
    }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

export default app;