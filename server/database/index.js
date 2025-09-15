import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseMigrator from './migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database initialization and management for Persian Legal AI
 */
export class DatabaseManager {
    constructor(dbPath = null) {
        this.dbPath = dbPath || process.env.DB_PATH || path.join(__dirname, '../../persian_legal_ai.db');
        this.db = null;
    }

    /**
     * Initialize database with automatic migration
     */
    async initialize() {
        try {
            console.log('🔄 Initializing Persian Legal AI database...');
            console.log(`📍 Database path: ${this.dbPath}`);

            // Run migrations first
            const migrator = new DatabaseMigrator(this.dbPath);
            const migrationSuccess = await migrator.migrate();
            
            if (!migrationSuccess) {
                throw new Error('Database migration failed');
            }

            // Connect to database
            this.db = new Database(this.dbPath);
            
            // Apply optimizations
            this.applyOptimizations();
            
            console.log('✅ Database initialized successfully');
            return this.db;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Apply SQLite performance optimizations
     */
    applyOptimizations() {
        if (!this.db) return;

        try {
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('cache_size = -64000'); // 64MB cache
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('temp_store = memory');
            this.db.pragma('mmap_size = 268435456'); // 256MB memory map
            
            console.log('✅ Database optimizations applied');
        } catch (error) {
            console.warn('⚠️ Some optimizations failed:', error.message);
        }
    }

    /**
     * Get database connection
     */
    getConnection() {
        return this.db;
    }

    /**
     * Validate data types before database operations
     */
    validateAndCast(data, schema) {
        const validated = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (schema[key]) {
                const expectedType = schema[key];
                
                try {
                    switch (expectedType) {
                        case 'INTEGER':
                            validated[key] = value === null ? null : Number(value);
                            if (validated[key] !== null && !Number.isInteger(validated[key])) {
                                throw new Error(`Expected integer for ${key}, got ${typeof value}: ${value}`);
                            }
                            break;
                            
                        case 'REAL':
                            validated[key] = value === null ? null : Number(value);
                            if (validated[key] !== null && isNaN(validated[key])) {
                                throw new Error(`Expected number for ${key}, got ${typeof value}: ${value}`);
                            }
                            break;
                            
                        case 'TEXT':
                            validated[key] = value === null ? null : String(value);
                            break;
                            
                        case 'BOOLEAN':
                            // SQLite stores booleans as 0/1
                            if (typeof value === 'boolean') {
                                validated[key] = value ? 1 : 0;
                            } else if (typeof value === 'number') {
                                validated[key] = value ? 1 : 0;
                            } else if (typeof value === 'string') {
                                validated[key] = (value.toLowerCase() === 'true' || value === '1') ? 1 : 0;
                            } else {
                                validated[key] = value ? 1 : 0;
                            }
                            break;
                            
                        case 'JSON':
                            // Store JSON as TEXT
                            if (typeof value === 'object' && value !== null) {
                                validated[key] = JSON.stringify(value);
                            } else if (typeof value === 'string') {
                                // Validate it's valid JSON
                                JSON.parse(value);
                                validated[key] = value;
                            } else {
                                validated[key] = value === null ? null : JSON.stringify(value);
                            }
                            break;
                            
                        default:
                            validated[key] = value;
                    }
                } catch (error) {
                    console.error(`❌ Data validation failed for ${key}:`, error.message);
                    console.error(`  Value: ${value} (${typeof value})`);
                    console.error(`  Expected type: ${expectedType}`);
                    throw error;
                }
            } else {
                validated[key] = value;
            }
        }
        
        return validated;
    }

    /**
     * Safe database operation with error handling and logging
     */
    safeOperation(operation, description, data = null) {
        try {
            if (data) {
                console.log(`🔄 ${description}`, {
                    data: Object.keys(data).reduce((acc, key) => {
                        acc[key] = `${typeof data[key]}: ${data[key]}`;
                        return acc;
                    }, {})
                });
            }
            
            const result = operation();
            console.log(`✅ ${description} completed`);
            return result;
        } catch (error) {
            console.error(`❌ ${description} failed:`, error.message);
            if (data) {
                console.error('  Data:', data);
            }
            throw error;
        }
    }

    /**
     * Insert dataset with proper type validation
     */
    insertDataset(datasetData) {
        const schema = {
            id: 'TEXT',
            name: 'TEXT',
            source: 'TEXT',
            huggingface_id: 'TEXT',
            samples: 'INTEGER',
            size_mb: 'REAL',
            status: 'TEXT',
            type: 'TEXT',
            description: 'TEXT'
        };

        const validated = this.validateAndCast(datasetData, schema);
        
        return this.safeOperation(() => {
            const stmt = this.db.prepare(`
                INSERT OR IGNORE INTO datasets (id, name, source, huggingface_id, samples, size_mb, status, type, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            return stmt.run(
                validated.id,
                validated.name,
                validated.source,
                validated.huggingface_id,
                validated.samples,
                validated.size_mb,
                validated.status || 'available',
                validated.type,
                validated.description
            );
        }, 'Insert dataset', validated);
    }

    /**
     * Insert model with proper type validation
     */
    insertModel(modelData) {
        const schema = {
            name: 'TEXT',
            type: 'TEXT',
            status: 'TEXT',
            accuracy: 'REAL',
            loss: 'REAL',
            epochs: 'INTEGER',
            current_epoch: 'INTEGER',
            dataset_id: 'TEXT',
            config: 'JSON',
            created_by: 'INTEGER'
        };

        const validated = this.validateAndCast(modelData, schema);
        
        return this.safeOperation(() => {
            const stmt = this.db.prepare(`
                INSERT INTO models (name, type, status, accuracy, loss, epochs, current_epoch, dataset_id, config, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            return stmt.run(
                validated.name,
                validated.type,
                validated.status || 'idle',
                validated.accuracy || 0,
                validated.loss || 0,
                validated.epochs || 0,
                validated.current_epoch || 0,
                validated.dataset_id,
                validated.config,
                validated.created_by
            );
        }, 'Insert model', validated);
    }

    /**
     * Insert setting with proper type validation
     */
    insertSetting(key, value, description = null) {
        const validated = {
            key: String(key),
            value: String(value),
            description: description ? String(description) : null
        };

        return this.safeOperation(() => {
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO settings (key, value, description, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `);
            
            return stmt.run(validated.key, validated.value, validated.description);
        }, 'Insert/update setting', validated);
    }

    /**
     * Get database statistics
     */
    getStats() {
        try {
            const stats = {};
            const tables = ['users', 'models', 'datasets', 'training_sessions', 'training_logs', 'settings'];
            
            for (const table of tables) {
                const result = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                stats[table] = result.count;
            }
            
            return stats;
        } catch (error) {
            console.error('❌ Failed to get database stats:', error);
            return {};
        }
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('✅ Database connection closed');
        }
    }
}

// Export singleton instance
let dbManager = null;

export async function initializeDatabase(dbPath = null) {
    if (!dbManager) {
        dbManager = new DatabaseManager(dbPath);
        await dbManager.initialize();
    }
    return dbManager;
}

export function getDatabaseManager() {
    if (!dbManager) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return dbManager;
}

export function getDatabase() {
    return getDatabaseManager().getConnection();
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase().then(() => {
        console.log('🎉 Database initialization completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    });
}