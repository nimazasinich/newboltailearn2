/**
 * Database Connection Pool Manager
 * Optimizes database connections and query performance
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

class DatabaseConnectionPool {
    constructor(config = {}) {
        this.config = {
            maxConnections: config.maxConnections || 10,
            minConnections: config.minConnections || 2,
            connectionTimeout: config.connectionTimeout || 30000,
            idleTimeout: config.idleTimeout || 300000, // 5 minutes
            databasePath: config.databasePath || './data/database.sqlite',
            enableWAL: config.enableWAL !== false,
            enableForeignKeys: config.enableForeignKeys !== false,
            ...config
        };

        this.connections = [];
        this.availableConnections = [];
        this.busyConnections = new Set();
        this.connectionStats = {
            total: 0,
            available: 0,
            busy: 0,
            created: 0,
            destroyed: 0
        };

        this.queryCache = new Map();
        this.preparedStatements = new Map();
        this.performanceMetrics = {
            totalQueries: 0,
            averageQueryTime: 0,
            slowQueries: [],
            cacheHits: 0,
            cacheMisses: 0
        };

        this.initialize();
    }

    async initialize() {
        try {
            // Ensure database directory exists
            const dbDir = path.dirname(this.config.databasePath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Create initial connections
            await this.createInitialConnections();
            
            // Setup database optimizations
            await this.optimizeDatabase();
            
            // Start cleanup interval
            this.startCleanupInterval();
            
            console.log(`✅ Database connection pool initialized with ${this.connections.length} connections`);
        } catch (error) {
            console.error('❌ Failed to initialize database connection pool:', error);
            throw error;
        }
    }

    async createInitialConnections() {
        for (let i = 0; i < this.config.minConnections; i++) {
            await this.createConnection();
        }
    }

    async createConnection() {
        try {
            const db = new Database(this.config.databasePath, {
                verbose: process.env.NODE_ENV === 'development' ? console.log : null
            });

            // Enable optimizations
            if (this.config.enableWAL) {
                db.pragma('journal_mode = WAL');
            }
            
            if (this.config.enableForeignKeys) {
                db.pragma('foreign_keys = ON');
            }

            // Performance optimizations
            db.pragma('synchronous = NORMAL');
            db.pragma('cache_size = 10000');
            db.pragma('temp_store = MEMORY');
            db.pragma('mmap_size = 268435456'); // 256MB

            const connection = {
                id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                db,
                createdAt: Date.now(),
                lastUsed: Date.now(),
                queryCount: 0,
                isBusy: false
            };

            this.connections.push(connection);
            this.availableConnections.push(connection);
            this.connectionStats.total++;
            this.connectionStats.available++;
            this.connectionStats.created++;

            return connection;
        } catch (error) {
            console.error('❌ Failed to create database connection:', error);
            throw error;
        }
    }

    async getConnection() {
        // Try to get an available connection
        if (this.availableConnections.length > 0) {
            const connection = this.availableConnections.pop();
            connection.isBusy = true;
            connection.lastUsed = Date.now();
            this.busyConnections.add(connection);
            this.connectionStats.available--;
            this.connectionStats.busy++;
            return connection;
        }

        // Create new connection if under limit
        if (this.connections.length < this.config.maxConnections) {
            const connection = await this.createConnection();
            connection.isBusy = true;
            this.busyConnections.add(connection);
            this.connectionStats.available--;
            this.connectionStats.busy++;
            return connection;
        }

        // Wait for available connection
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout: No available connections'));
            }, this.config.connectionTimeout);

            const checkForConnection = () => {
                if (this.availableConnections.length > 0) {
                    clearTimeout(timeout);
                    const connection = this.availableConnections.pop();
                    connection.isBusy = true;
                    connection.lastUsed = Date.now();
                    this.busyConnections.add(connection);
                    this.connectionStats.available--;
                    this.connectionStats.busy++;
                    resolve(connection);
                } else {
                    setTimeout(checkForConnection, 100);
                }
            };

            checkForConnection();
        });
    }

    releaseConnection(connection) {
        if (!connection || !this.busyConnections.has(connection)) {
            return;
        }

        connection.isBusy = false;
        connection.lastUsed = Date.now();
        this.busyConnections.delete(connection);
        this.availableConnections.push(connection);
        this.connectionStats.available++;
        this.connectionStats.busy--;
    }

    async executeQuery(sql, params = [], options = {}) {
        const startTime = Date.now();
        const connection = await this.getConnection();
        
        try {
            // Check query cache
            const cacheKey = `${sql}_${JSON.stringify(params)}`;
            if (options.useCache && this.queryCache.has(cacheKey)) {
                this.performanceMetrics.cacheHits++;
                return this.queryCache.get(cacheKey);
            }

            // Get or create prepared statement
            let stmt = this.preparedStatements.get(sql);
            if (!stmt) {
                stmt = connection.db.prepare(sql);
                this.preparedStatements.set(sql, stmt);
            }

            // Execute query
            let result;
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                if (params.length > 0) {
                    result = stmt.all(params);
                } else {
                    result = stmt.all();
                }
            } else {
                if (params.length > 0) {
                    result = stmt.run(params);
                } else {
                    result = stmt.run();
                }
            }

            // Cache result if requested
            if (options.useCache && options.cacheTTL) {
                this.queryCache.set(cacheKey, result);
                setTimeout(() => {
                    this.queryCache.delete(cacheKey);
                }, options.cacheTTL);
            }

            // Update metrics
            const queryTime = Date.now() - startTime;
            this.performanceMetrics.totalQueries++;
            this.performanceMetrics.averageQueryTime = 
                (this.performanceMetrics.averageQueryTime * (this.performanceMetrics.totalQueries - 1) + queryTime) / 
                this.performanceMetrics.totalQueries;

            if (queryTime > 1000) { // Log slow queries
                this.performanceMetrics.slowQueries.push({
                    sql,
                    params,
                    queryTime,
                    timestamp: new Date().toISOString()
                });
            }

            connection.queryCount++;
            this.performanceMetrics.cacheMisses++;

            return result;
        } catch (error) {
            console.error('❌ Query execution failed:', error);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw error;
        } finally {
            this.releaseConnection(connection);
        }
    }

    async optimizeDatabase() {
        const connection = await this.getConnection();
        try {
            // Create indexes for better performance
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)',
                'CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)',
                'CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date_created)',
                'CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status)',
                'CREATE INDEX IF NOT EXISTS idx_models_status ON models(status)',
                'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
                'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)'
            ];

            for (const indexSQL of indexes) {
                try {
                    connection.db.exec(indexSQL);
                } catch (error) {
                    console.warn('⚠️ Failed to create index:', error.message);
                }
            }

            // Analyze database for query optimization
            connection.db.exec('ANALYZE');

            console.log('✅ Database optimization completed');
        } finally {
            this.releaseConnection(connection);
        }
    }

    startCleanupInterval() {
        setInterval(() => {
            this.cleanupIdleConnections();
            this.cleanupQueryCache();
        }, 60000); // Run every minute
    }

    cleanupIdleConnections() {
        const now = Date.now();
        const connectionsToRemove = [];

        for (const connection of this.connections) {
            if (!connection.isBusy && 
                (now - connection.lastUsed) > this.config.idleTimeout &&
                this.connections.length > this.config.minConnections) {
                connectionsToRemove.push(connection);
            }
        }

        for (const connection of connectionsToRemove) {
            this.destroyConnection(connection);
        }
    }

    cleanupQueryCache() {
        // Keep only recent slow queries (last 100)
        if (this.performanceMetrics.slowQueries.length > 100) {
            this.performanceMetrics.slowQueries = 
                this.performanceMetrics.slowQueries.slice(-100);
        }
    }

    destroyConnection(connection) {
        try {
            connection.db.close();
            const index = this.connections.indexOf(connection);
            if (index > -1) {
                this.connections.splice(index, 1);
            }
            
            const availableIndex = this.availableConnections.indexOf(connection);
            if (availableIndex > -1) {
                this.availableConnections.splice(availableIndex, 1);
            }
            
            this.busyConnections.delete(connection);
            this.connectionStats.total--;
            this.connectionStats.available--;
            this.connectionStats.destroyed++;
            
            console.log(`🗑️ Destroyed idle connection: ${connection.id}`);
        } catch (error) {
            console.error('❌ Failed to destroy connection:', error);
        }
    }

    getStats() {
        return {
            connections: {
                total: this.connectionStats.total,
                available: this.connectionStats.available,
                busy: this.connectionStats.busy,
                created: this.connectionStats.created,
                destroyed: this.connectionStats.destroyed
            },
            performance: {
                ...this.performanceMetrics,
                cacheHitRate: this.performanceMetrics.cacheHits / 
                    (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100
            },
            config: this.config
        };
    }

    async close() {
        console.log('🔄 Closing database connection pool...');
        
        // Close all connections
        for (const connection of this.connections) {
            try {
                connection.db.close();
            } catch (error) {
                console.error('❌ Error closing connection:', error);
            }
        }

        this.connections = [];
        this.availableConnections = [];
        this.busyConnections.clear();
        this.queryCache.clear();
        this.preparedStatements.clear();
        
        console.log('✅ Database connection pool closed');
    }
}

export default DatabaseConnectionPool;
