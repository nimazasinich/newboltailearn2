import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * DatabaseManager Singleton - Prevents SQLite race conditions in container environments
 * This singleton ensures only one SQLite connection is used across the entire application
 */
class DatabaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.isInitializing = false;
        this.initPromise = null;
        this.dbPath = null;
    }

    /**
     * Initialize the database connection with container-safe configuration
     * @param {string} dbPath - Optional database path override
     * @returns {Promise<Database>} - The initialized database connection
     */
    async initialize(dbPath = null) {
        // Prevent multiple initialization attempts
        if (this.isInitialized) {
            return this.db;
        }

        if (this.isInitializing) {
            return this.initPromise;
        }

        this.isInitializing = true;
        this.initPromise = this._performInitialization(dbPath);

        try {
            await this.initPromise;
            this.isInitialized = true;
            return this.db;
        } catch (error) {
            this.isInitializing = false;
            this.initPromise = null;
            throw error;
        }
    }

    /**
     * Internal initialization logic
     * @private
     */
    async _performInitialization(dbPath) {
        try {
            console.log('🔄 Initializing DatabaseManager singleton...');
            
            // Determine database path with container-safe handling
            this.dbPath = this._determineDatabasePath(dbPath);
            console.log(`📍 Database path: ${this.dbPath}`);

            // Test better-sqlite3 loading first
            await this._testSqliteModule();

            // Create database connection with container-optimized settings
            await this._createConnection();

            // Apply SQLite optimizations for container environment
            this._applyContainerOptimizations();

            // Test database operations
            await this._testDatabaseOperations();

            console.log('✅ DatabaseManager singleton initialized successfully');
            
        } catch (error) {
            console.error('❌ DatabaseManager initialization failed:', error);
            await this._handleInitializationFailure(error);
        }
    }

    /**
     * Determine the optimal database path for container environment
     * @private
     */
    _determineDatabasePath(dbPath) {
        if (dbPath) return dbPath;
        
        // Check environment variable first
        const envPath = process.env.DATABASE_PATH || process.env.DB_PATH;
        if (envPath) return envPath;
        
        // Container-safe database directory
        const isProduction = process.env.NODE_ENV === 'production';
        const dbDir = isProduction 
            ? '/app/data'  // Container persistent directory
            : path.join(__dirname, '../../data');
        
        // Ensure directory exists with proper permissions
        try {
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
                console.log(`✅ Created database directory: ${dbDir}`);
            }
            
            // Test write permissions
            fs.accessSync(dbDir, fs.constants.W_OK);
            console.log(`✅ Database directory writable: ${dbDir}`);
            
            return path.join(dbDir, 'database.sqlite');
            
        } catch (error) {
            console.warn(`⚠️ Database directory setup failed: ${error.message}`);
            
            // Fallback to current directory
            const fallbackPath = path.join(process.cwd(), 'database.sqlite');
            console.log(`🔄 Using fallback database path: ${fallbackPath}`);
            return fallbackPath;
        }
    }

    /**
     * Test better-sqlite3 module loading
     * @private
     */
    async _testSqliteModule() {
        try {
            const testDb = new Database(':memory:');
            testDb.close();
            console.log('✅ better-sqlite3 module test successful');
        } catch (moduleError) {
            console.error('❌ better-sqlite3 module test failed:', moduleError.message);
            throw new Error(`better-sqlite3 ABI mismatch: ${moduleError.message}`);
        }
    }

    /**
     * Create the main database connection
     * @private
     */
    async _createConnection() {
        try {
            this.db = new Database(this.dbPath, {
                verbose: process.env.NODE_ENV === 'development' ? console.log : null,
                fileMustExist: false,
                timeout: 30000  // 30 second timeout for container environments
            });
            
            console.log(`✅ Database connection established: ${this.dbPath}`);
            
        } catch (fileError) {
            console.error(`❌ File database failed: ${fileError.message}`);
            
            // Fallback to in-memory database for development
            if (process.env.NODE_ENV !== 'production') {
                console.log('🔄 Falling back to in-memory database');
                this.db = new Database(':memory:', {
                    verbose: process.env.NODE_ENV === 'development' ? console.log : null,
                    timeout: 30000
                });
                console.log('✅ In-memory database initialized as fallback');
            } else {
                throw fileError;
            }
        }
    }

    /**
     * Apply SQLite optimizations for container environments
     * @private
     */
    _applyContainerOptimizations() {
        if (!this.db) return;

        try {
            // WAL mode for better concurrency and crash safety
            this.db.pragma('journal_mode = WAL');
            
            // Optimize for container environment
            this.db.pragma('synchronous = NORMAL');  // Balance between safety and performance
            this.db.pragma('cache_size = -64000');   // 64MB cache
            this.db.pragma('foreign_keys = ON');     // Enable foreign key constraints
            this.db.pragma('temp_store = memory');   // Store temp tables in memory
            this.db.pragma('mmap_size = 268435456'); // 256MB memory map
            this.db.pragma('busy_timeout = 30000');  // 30 second busy timeout
            
            // Additional container-specific optimizations
            this.db.pragma('wal_autocheckpoint = 1000');  // Checkpoint every 1000 pages
            this.db.pragma('journal_size_limit = 67108864'); // 64MB journal limit
            
            console.log('✅ Container-optimized SQLite settings applied');
        } catch (error) {
            console.warn('⚠️ Some SQLite optimizations failed:', error.message);
        }
    }

    /**
     * Test basic database operations
     * @private
     */
    async _testDatabaseOperations() {
        try {
            // Create a test table and insert data
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS _db_health_check (
                    id INTEGER PRIMARY KEY,
                    timestamp TEXT,
                    node_version TEXT,
                    abi_version TEXT
                )
            `);
            
            const testStmt = this.db.prepare(`
                INSERT OR REPLACE INTO _db_health_check (id, timestamp, node_version, abi_version) 
                VALUES (1, ?, ?, ?)
            `);
            
            testStmt.run(
                new Date().toISOString(),
                process.version,
                process.versions.modules
            );
            
            // Test read operation
            const result = this.db.prepare('SELECT * FROM _db_health_check WHERE id = 1').get();
            if (!result) {
                throw new Error('Database read test failed');
            }
            
            console.log('✅ Database operations test successful');
            
        } catch (error) {
            console.error('❌ Database operations test failed:', error);
            throw error;
        }
    }

    /**
     * Handle initialization failure with fallback strategies
     * @private
     */
    async _handleInitializationFailure(error) {
        console.log('🚨 Attempting emergency database initialization...');
        
        try {
            // Last resort: in-memory database
            this.db = new Database(':memory:', { timeout: 30000 });
            
            // Create minimal required tables
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS _db_health_check (
                    id INTEGER PRIMARY KEY,
                    timestamp TEXT,
                    node_version TEXT,
                    abi_version TEXT
                );
                
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    category TEXT NOT NULL,
                    message TEXT NOT NULL,
                    metadata TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            console.log('✅ Emergency in-memory database created');
            
        } catch (emergencyError) {
            console.error('❌ Emergency database creation failed:', emergencyError);
            throw error; // Throw original error
        }
    }

    /**
     * Get the database connection (singleton instance)
     * @returns {Database} The SQLite database connection
     * @throws {Error} If database is not initialized
     */
    getConnection() {
        if (!this.isInitialized || !this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Safe database logging with prepared statements
     * @param {string} level - Log level (info, warn, error)
     * @param {string} category - Log category
     * @param {string} message - Log message
     * @param {object} metadata - Optional metadata object
     */
    logToDatabase(level, category, message, metadata = null) {
        try {
            if (!this.isInitialized || !this.db) {
                console.warn('⚠️ Database not initialized, skipping database log');
                return;
            }

            // Ensure system_logs table exists
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    category TEXT NOT NULL,
                    message TEXT NOT NULL,
                    metadata TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            const stmt = this.db.prepare(`
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
            // Don't throw - logging failures shouldn't crash the app
        }
    }

    /**
     * Get database statistics
     * @returns {object} Database statistics
     */
    getStats() {
        try {
            if (!this.isInitialized || !this.db) {
                return { error: 'Database not initialized' };
            }

            const stats = {
                connected: true,
                dbPath: this.dbPath,
                isMemoryDb: this.dbPath === ':memory:',
                timestamp: new Date().toISOString()
            };

            // Get table counts
            const tables = ['users', 'models', 'datasets', 'training_sessions', 'training_logs', 'system_logs', 'settings'];
            
            for (const table of tables) {
                try {
                    const result = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                    stats[table] = result.count;
                } catch (error) {
                    stats[table] = { error: error.message };
                }
            }
            
            return stats;
        } catch (error) {
            console.error('❌ Failed to get database stats:', error);
            return { error: error.message };
        }
    }

    /**
     * Test database health
     * @returns {object} Health check results
     */
    async healthCheck() {
        try {
            if (!this.isInitialized || !this.db) {
                return { healthy: false, error: 'Database not initialized' };
            }

            // Test basic query
            const result = this.db.prepare('SELECT datetime("now") as current_time').get();
            
            // Test write operation
            const writeTest = this.db.prepare(`
                INSERT OR REPLACE INTO _db_health_check (id, timestamp, node_version, abi_version) 
                VALUES (2, ?, ?, ?)
            `);
            writeTest.run(new Date().toISOString(), process.version, process.versions.modules);

            return {
                healthy: true,
                timestamp: result.current_time,
                dbPath: this.dbPath,
                isMemoryDb: this.dbPath === ':memory:',
                nodeVersion: process.version,
                abiVersion: process.versions.modules
            };
            
        } catch (error) {
            console.error('❌ Database health check failed:', error);
            return {
                healthy: false,
                error: error.message,
                dbPath: this.dbPath
            };
        }
    }

    /**
     * Gracefully close the database connection
     */
    async close() {
        try {
            if (this.db) {
                // Log shutdown
                this.logToDatabase('info', 'database', 'DatabaseManager shutting down');
                
                // Close the connection
                this.db.close();
                this.db = null;
                this.isInitialized = false;
                this.isInitializing = false;
                this.initPromise = null;
                
                console.log('✅ DatabaseManager connection closed gracefully');
            }
        } catch (error) {
            console.error('❌ Error closing database connection:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
const databaseManager = new DatabaseManager();

export default databaseManager;
export { DatabaseManager };