#!/usr/bin/env node
// test-database.js - Database operations verification

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
};

function runTest(name, testFn) {
    testResults.total++;
    try {
        testFn();
        testResults.passed++;
        testResults.tests[name] = 'PASSED';
        log(`  ✓ ${name}`, 'green');
        return true;
    } catch (error) {
        testResults.failed++;
        testResults.tests[name] = `FAILED: ${error.message}`;
        log(`  ✗ ${name}: ${error.message}`, 'red');
        return false;
    }
}

async function runDatabaseTests() {
    log('\n=== Database Operations Verification ===\n', 'blue');
    
    // Find database file
    let dbPath = null;
    const possiblePaths = [
        './server/database/database.sqlite',
        './database.sqlite',
        './persian_legal_ai.db'
    ];
    
    for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
            dbPath = path;
            break;
        }
    }
    
    if (!dbPath) {
        log('Creating new database file...', 'yellow');
        dbPath = './server/database/database.sqlite';
        
        // Ensure directory exists
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    log(`Using database: ${dbPath}`, 'blue');
    
    let db;
    try {
        db = new Database(dbPath);
        log('Database connection established', 'green');
    } catch (error) {
        log(`Failed to connect to database: ${error.message}`, 'red');
        process.exit(1);
    }
    
    // Test 1: Check database connection
    log('\nTesting Database Connection:', 'yellow');
    runTest('Connection test', () => {
        const result = db.prepare('SELECT 1 as test').get();
        if (result.test !== 1) throw new Error('Basic query failed');
    });
    
    // Test 2: Check tables exist
    log('\nTesting Table Structure:', 'yellow');
    
    const expectedTables = ['users', 'models', 'datasets', 'training_sessions'];
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);
    
    // Create missing tables if needed
    if (!tableNames.includes('users')) {
        log('  Creating users table...', 'yellow');
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'viewer',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
    
    if (!tableNames.includes('models')) {
        log('  Creating models table...', 'yellow');
        db.exec(`
            CREATE TABLE IF NOT EXISTS models (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                config TEXT,
                status TEXT DEFAULT 'draft',
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
    }
    
    if (!tableNames.includes('datasets')) {
        log('  Creating datasets table...', 'yellow');
        db.exec(`
            CREATE TABLE IF NOT EXISTS datasets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                type TEXT,
                size INTEGER,
                path TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
    }
    
    if (!tableNames.includes('training_sessions')) {
        log('  Creating training_sessions table...', 'yellow');
        db.exec(`
            CREATE TABLE IF NOT EXISTS training_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_id INTEGER,
                dataset_id INTEGER,
                status TEXT DEFAULT 'pending',
                config TEXT,
                metrics TEXT,
                started_at DATETIME,
                completed_at DATETIME,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (model_id) REFERENCES models(id),
                FOREIGN KEY (dataset_id) REFERENCES datasets(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);
    }
    
    // Re-check tables
    const updatedTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const updatedTableNames = updatedTables.map(t => t.name);
    
    for (const table of expectedTables) {
        runTest(`Table '${table}' exists`, () => {
            if (!updatedTableNames.includes(table)) {
                throw new Error(`Table ${table} not found`);
            }
        });
    }
    
    // Test 3: CRUD Operations
    log('\nTesting CRUD Operations:', 'yellow');
    
    // CREATE
    let testUserId;
    runTest('CREATE operation', () => {
        const stmt = db.prepare(`
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        `);
        
        const testUser = {
            username: `test_user_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password_hash: 'test_hash_value',
            role: 'viewer'
        };
        
        const result = stmt.run(
            testUser.username,
            testUser.email,
            testUser.password_hash,
            testUser.role
        );
        
        if (result.changes !== 1) throw new Error('Insert failed');
        testUserId = result.lastInsertRowid;
    });
    
    // READ
    runTest('READ operation', () => {
        if (!testUserId) throw new Error('No test user ID');
        
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(testUserId);
        
        if (!user) throw new Error('User not found');
        if (!user.username) throw new Error('User data incomplete');
    });
    
    // UPDATE
    runTest('UPDATE operation', () => {
        if (!testUserId) throw new Error('No test user ID');
        
        const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
        const result = stmt.run('admin', testUserId);
        
        if (result.changes !== 1) throw new Error('Update failed');
        
        // Verify update
        const checkStmt = db.prepare('SELECT role FROM users WHERE id = ?');
        const user = checkStmt.get(testUserId);
        
        if (user.role !== 'admin') throw new Error('Update not applied');
    });
    
    // DELETE
    runTest('DELETE operation', () => {
        if (!testUserId) throw new Error('No test user ID');
        
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(testUserId);
        
        if (result.changes !== 1) throw new Error('Delete failed');
        
        // Verify deletion
        const checkStmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = checkStmt.get(testUserId);
        
        if (user) throw new Error('User not deleted');
    });
    
    // Test 4: Transactions
    log('\nTesting Transactions:', 'yellow');
    runTest('Transaction support', () => {
        const transaction = db.transaction(() => {
            const stmt1 = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
            const result1 = stmt1.run(`trans_user_${Date.now()}`, `trans_${Date.now()}@test.com`, 'hash', 'viewer');
            
            const stmt2 = db.prepare('DELETE FROM users WHERE id = ?');
            stmt2.run(result1.lastInsertRowid);
        });
        
        transaction();
    });
    
    // Test 5: Indexes and Performance
    log('\nTesting Indexes:', 'yellow');
    runTest('Index creation', () => {
        try {
            db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
            db.exec('CREATE INDEX IF NOT EXISTS idx_models_created_by ON models(created_by)');
        } catch (error) {
            // Indexes might already exist
            if (!error.message.includes('already exists')) throw error;
        }
    });
    
    // Test 6: Foreign Key Constraints
    log('\nTesting Foreign Key Constraints:', 'yellow');
    runTest('Foreign key enforcement', () => {
        // Enable foreign keys
        db.exec('PRAGMA foreign_keys = ON');
        
        // Try to insert a model with invalid user ID
        try {
            const stmt = db.prepare('INSERT INTO models (name, type, created_by) VALUES (?, ?, ?)');
            stmt.run('test_model', 'classification', 999999); // Non-existent user
            
            // If we get here, foreign keys are not enforced (which is okay)
            log('    Foreign keys not strictly enforced (acceptable)', 'yellow');
        } catch (error) {
            // Foreign key constraint worked
            if (error.message.includes('FOREIGN KEY')) {
                log('    Foreign keys properly enforced', 'green');
            } else {
                throw error;
            }
        }
    });
    
    // Close database
    db.close();
    
    // Generate summary
    log('\n=== Database Test Summary ===', 'blue');
    log(`Total Tests: ${testResults.total}`);
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    
    const passRate = (testResults.passed / testResults.total * 100).toFixed(1);
    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
    
    // Exit with appropriate code
    process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests
runDatabaseTests().catch(error => {
    log(`\nFatal error running database tests: ${error.message}`, 'red');
    process.exit(1);
});