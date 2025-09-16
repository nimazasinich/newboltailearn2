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
import { getHFHeaders, testHFConnection, logTokenStatus } from './utils/decode.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { AuthService } from './services/authService.js';
import { setupModules } from './modules/setup.js';
import { initializeDatabase, getDatabaseManager } from './database/index.js';

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
let db, authService, dbManager;

// Static serving configuration
const SERVE_FRONTEND = (process.env.SERVE_FRONTEND || 'false').toLowerCase() === 'true';
const clientDir = path.resolve(__dirname, '..', 'docs');

// Async startup function
async function startServer() {
    try {
        console.log('🔄 Initializing Persian Legal AI Server...');
        
        // Initialize database with migrations and seed data
        console.log('🔄 Setting up database...');
        dbManager = await initializeDatabase();
        db = dbManager.getConnection();
        
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
    // Utility function for safe database logging
    global.logToDatabase = (level, category, message, metadata) => {
        try {
            if (!db) return;
            
            const stmt = db.prepare(`
                INSERT INTO system_logs (level, category, message, metadata)
                VALUES (?, ?, ?, ?)
            `);
            
            stmt.run(
                String(level),
                String(category), 
                String(message),
                metadata ? JSON.stringify(metadata) : null
            );
        } catch (error) {
            console.error('❌ Failed to log to database:', error);
        }
    };
    
    // Safe dataset insertion with proper validation
    global.insertDatasetSafe = (datasetData) => {
        try {
            return dbManager.insertDataset(datasetData);
        } catch (error) {
            console.error('❌ Failed to insert dataset:', error);
            logToDatabase('error', 'database', 'Dataset insertion failed', { error: error.message, data: datasetData });
        }
    };
    
    // Safe model insertion with proper validation
    global.insertModelSafe = (modelData) => {
        try {
            return dbManager.insertModel(modelData);
        } catch (error) {
            console.error('❌ Failed to insert model:', error);
            logToDatabase('error', 'database', 'Model insertion failed', { error: error.message, data: modelData });
        }
    };
}

// Setup API routes with proper error handling
function setupAPIRoutes() {
    // Simple health check endpoint (for Render)
    app.get('/health', (req, res) => {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
            },
            database: typeof dbManager !== 'undefined' && dbManager ? 'connected' : 'disconnected',
            port: PORT
        };
        
        res.status(200).json(healthData);
    });

    // Simple ping endpoint
    app.get('/ping', (req, res) => {
        res.status(200).send('pong');
    });

    // Detailed API health check endpoint
    app.get('/api/health', (req, res) => {
        try {
            const stats = dbManager.getStats();
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: stats
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
            const stats = dbManager.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get database stats' });
        }
    });

    // Debug endpoint for database schema (for troubleshooting)
    app.get('/api/debug/schema', (req, res) => {
        try {
            const db = dbManager.getConnection();
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
    app.use((req, res, next) => {
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
    app.use((error, req, res, next) => {
        console.error('❌ Unhandled error:', error);
        
        // Log to database if possible
        if (typeof logToDatabase === 'function') {
            logToDatabase('error', 'server', 'Unhandled error', {
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
const PORT = process.env.PORT || 10000;
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
        
        logToDatabase('info', 'server', `Server started on port ${PORT}`);
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
        if (typeof dbManager !== 'undefined' && dbManager) {
            try {
                await dbManager.close();
                console.log('✅ Database connections closed');
            } catch (dbError) {
                console.log('⚠️ Error closing database:', dbError.message);
            }
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