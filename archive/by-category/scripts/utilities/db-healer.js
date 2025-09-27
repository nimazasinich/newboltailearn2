// db-healer.js - Database healing with schema validation
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function healDatabase() {
    console.log('🔧 Starting database healing...');
    
    const dbPath = process.env.DB_PATH || './persian_legal_ai.db';
    const dbShmPath = dbPath + '-shm';
    const dbWalPath = dbPath + '-wal';
    
    try {
        // Check if database files exist
        if (fs.existsSync(dbPath)) {
            console.log('✅ Database file exists');
            
            // Check for WAL files that might indicate incomplete transactions
            if (fs.existsSync(dbWalPath)) {
                console.log('⚠️  WAL file detected, checking for incomplete transactions...');
                try {
                    // Try to open and close the database to complete any pending transactions
                    const Database = await import('better-sqlite3');
                    const db = new Database.default(dbPath);
                    db.pragma('wal_checkpoint(FULL)');
                    db.close();
                    console.log('✅ WAL checkpoint completed');
                } catch (error) {
                    console.log('⚠️  WAL checkpoint failed, will reinitialize database');
                    fs.unlinkSync(dbPath);
                    if (fs.existsSync(dbShmPath)) fs.unlinkSync(dbShmPath);
                    if (fs.existsSync(dbWalPath)) fs.unlinkSync(dbWalPath);
                }
            }
        } else {
            console.log('🔧 Database missing, initializing...');
        }
        
        // Initialize database if needed
        if (!fs.existsSync(dbPath)) {
            console.log('🔧 Running database initialization...');
            execSync('npm run db:init', { stdio: 'inherit' });
        }
        
        // Validate database schema
        return await validateDatabaseSchema(dbPath);
        
    } catch (error) {
        console.log('🔧 Database initialization failed, creating fresh database...');
        try {
            // Clean up any corrupted files
            if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
            if (fs.existsSync(dbShmPath)) fs.unlinkSync(dbShmPath);
            if (fs.existsSync(dbWalPath)) fs.unlinkSync(dbWalPath);
            
            execSync('npm run db:init', { stdio: 'inherit' });
            return await validateDatabaseSchema(dbPath);
        } catch (retryError) {
            console.error('❌ Database healing failed:', retryError.message);
            return {
                success: false,
                error: retryError.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

async function validateDatabaseSchema(dbPath) {
    try {
        const Database = await import('better-sqlite3');
        const db = new Database.default(dbPath);
        
        // Get all tables
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log(`✅ Database has ${tables.length} tables:`, tables.map(t => t.name));
        
        // Validate expected tables exist
        const expectedTables = ['users', 'datasets', 'models', 'training_sessions'];
        const missingTables = expectedTables.filter(table => 
            !tables.some(t => t.name === table)
        );
        
        if (missingTables.length > 0) {
            console.log('⚠️  Missing tables detected:', missingTables);
            console.log('🔧 Reinitializing database schema...');
            db.close();
            execSync('npm run db:init', { stdio: 'inherit' });
            return await validateDatabaseSchema(dbPath);
        }
        
        // Test basic operations
        try {
            const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
            const datasetCount = db.prepare('SELECT COUNT(*) as count FROM datasets').get();
            console.log(`📊 Database validation: ${userCount.count} users, ${datasetCount.count} datasets`);
        } catch (error) {
            console.log('⚠️  Database query test failed, reinitializing...');
            db.close();
            execSync('npm run db:init', { stdio: 'inherit' });
            return await validateDatabaseSchema(dbPath);
        }
        
        db.close();
        
        return {
            success: true,
            tablesCount: tables.length,
            expectedTables: expectedTables,
            missingTables: [],
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Database schema validation failed:', error.message);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Export for use in other modules
export { healDatabase, validateDatabaseSchema };

// Main function for direct execution
async function main() {
    const result = await healDatabase();
    console.log('Database healing result:', result);
    process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => {
        console.error("DB Healer Error:", err);
        process.exit(1);
    });
}