import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../persian_legal_ai.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Create database connection
        const db = new Database(DB_PATH);
        
        // Enable WAL mode for better concurrency
        db.pragma('journal_mode = WAL');
        db.pragma('synchronous = NORMAL');
        db.pragma('cache_size = 1000');
        db.pragma('temp_store = memory');
        
        // Read and execute schema
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
        db.exec(schema);
        
        console.log('Database initialized successfully');
        
        // Test database
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const modelCount = db.prepare('SELECT COUNT(*) as count FROM models').get();
        const datasetCount = db.prepare('SELECT COUNT(*) as count FROM datasets').get();
        
        console.log(`Database stats:`);
        console.log(`  Users: ${userCount.count}`);
        console.log(`  Models: ${modelCount.count}`);
        console.log(`  Datasets: ${datasetCount.count}`);
        
        db.close();
        return true;
    } catch (error) {
        console.error('Database initialization failed:', error);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase();
}

export { initializeDatabase };
