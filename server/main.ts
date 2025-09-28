import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

// Import services
import { AuthService } from './services/authService';
import { ModelPersistence } from './services/ModelPersistence';
import { PersianLegalProcessor } from './services/PersianLegalProcessor';
import { Logger } from './services/Logger';
import { HealthMonitor } from './services/HealthMonitor';
import { ErrorHandler, setupGlobalErrorHandlers } from './middleware/errorHandler';
import { RealTrainingEngine } from './training/RealTrainingEngine';

// Import routes
import authRoutes from './routes/auth.routes';
import modelRoutes from './routes/models.routes';
import errorRoutes from './routes/error.routes';
import datasetsRoutes from './routes/datasets.routes';
import analyticsRoutes from './routes/analytics.routes';
import monitoringRoutes from './routes/monitoring.routes';

// Load environment variables
dotenv.config();

class PersianLegalAIServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private db: Database.Database;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private healthMonitor: HealthMonitor;
  private authService: AuthService;
  private modelPersistence: ModelPersistence;
  private documentProcessor: PersianLegalProcessor;
  private trainingEngine: RealTrainingEngine;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
      }
    });

    this.initializeDatabase();
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
    this.setupErrorHandling();
    this.setupGlobalHandlers();
  }

  private initializeDatabase(): void {
    try {
      this.db = new Database('./persian_legal_ai.db');
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000');
      this.db.pragma('temp_store = MEMORY');
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    }
  }

  private initializeServices(): void {
    try {
      // Initialize logger
      this.logger = new Logger({
        level: (process.env.LOG_LEVEL as any) || 'info',
        enableConsole: process.env.NODE_ENV !== 'production',
        enableFile: true,
        enableDatabase: true,
        database: this.db
      });

      // Initialize error handler
      this.errorHandler = new ErrorHandler(this.db);

      // Initialize health monitor
      this.healthMonitor = new HealthMonitor(this.db, this.logger);

      // Initialize authentication service
      this.authService = new AuthService(this.db);

      // Initialize model persistence
      this.modelPersistence = new ModelPersistence(this.db);

      // Initialize document processor
      this.documentProcessor = new PersianLegalProcessor();

      // Initialize training engine
      this.trainingEngine = new RealTrainingEngine(this.modelPersistence);

      this.logger.info('All services initialized successfully', 'startup');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      process.exit(1);
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Slow down repeated requests
    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // allow 50 requests per 15 minutes, then...
      delayMs: 500 // begin adding 500ms of delay per request above 50
    });
    this.app.use('/api/', speedLimiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      (req as any).requestId = requestId;

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.healthMonitor.recordRequest(duration, res.statusCode >= 400);
        this.logger.logRequest(req, res, duration);
      });

      next();
    });

    // Serve static files
    this.app.use(express.static(path.join(__dirname, '../../dist')));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const healthStatus = await this.healthMonitor.getHealthStatus();
        res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus);
      } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
      }
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/models', modelRoutes);
    this.app.use('/api/errors', errorRoutes);
    this.app.use('/api/datasets', datasetsRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/monitoring', monitoringRoutes);

    // Document processing endpoint
    this.app.post('/api/documents/process', async (req, res) => {
      try {
        // This would handle file uploads and process them
        res.json({ message: 'Document processing endpoint - implementation needed' });
      } catch (error) {
        const appError = this.errorHandler.handleFileSystemError(error as Error, 'process_document');
        res.status(appError.statusCode || 500).json({ error: appError.message });
      }
    });

    // Training endpoint
    this.app.post('/api/training/start', async (req, res) => {
      try {
        const { samples, options } = req.body;
        
        if (!samples || !Array.isArray(samples)) {
          return res.status(400).json({ error: 'Training samples are required' });
        }

        // Start training in background
        this.trainingEngine.trainOnSamples(samples, {
          ...options,
          onProgress: (progress) => {
            this.io.emit('training_progress', progress);
          },
          onComplete: (modelId) => {
            this.io.emit('training_complete', { modelId });
          },
          onError: (error) => {
            this.io.emit('training_error', { error });
          }
        });

        res.json({ message: 'Training started successfully' });
      } catch (error) {
        const appError = this.errorHandler.handleTrainingError(error as Error, 'start_training');
        res.status(appError.statusCode || 500).json({ error: appError.message });
      }
    });

    // SPA fallback
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      this.logger.info(`Client connected: ${socket.id}`, 'socketio');

      socket.on('disconnect', () => {
        this.logger.info(`Client disconnected: ${socket.id}`, 'socketio');
      });

      // Handle authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          if (!token) {
            socket.emit('auth_error', { message: 'Token required' });
            return;
          }

          // Verify token and join user to their room
          // Implementation would verify JWT token here
          socket.emit('authenticated', { success: true });
        } catch (error) {
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(this.errorHandler.handleError);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  private setupGlobalHandlers(): void {
    setupGlobalErrorHandlers(this.errorHandler);
  }

  public async start(port: number = 8080): Promise<void> {
    try {
      this.server.listen(port, () => {
        this.logger.info(`🚀 Persian Legal AI Server started on port ${port}`, 'startup');
        this.logger.info(`📊 Health check available at http://localhost:${port}/health`, 'startup');
        this.logger.info(`🔗 API endpoints available at http://localhost:${port}/api`, 'startup');
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      this.logger.error('Failed to start server', 'startup', { error: error.message });
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    this.logger.info('Shutting down server...', 'shutdown');
    
    try {
      // Close server
      this.server.close(() => {
        this.logger.info('Server closed', 'shutdown');
      });

      // Close database
      this.db.close();
      this.logger.info('Database closed', 'shutdown');

      // Clean up old data
      this.healthMonitor.cleanOldData(7);
      this.logger.cleanOldLogs(30);

      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown', 'shutdown', { error: error.message });
      process.exit(1);
    }
  }

  // Getters for services (for testing and external access)
  public getServices() {
    return {
      logger: this.logger,
      errorHandler: this.errorHandler,
      healthMonitor: this.healthMonitor,
      authService: this.authService,
      modelPersistence: this.modelPersistence,
      documentProcessor: this.documentProcessor,
      trainingEngine: this.trainingEngine
    };
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new PersianLegalAIServer();
  const port = parseInt(process.env.PORT || '8080');
  server.start(port);
}

export default PersianLegalAIServer;