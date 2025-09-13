import { beforeAll, afterAll, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test database instance
export let testDb: Database.Database;

beforeAll(async () => {
  // Ensure test environment variables are set
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only-minimum-32-characters-long';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret-key-for-testing-only-minimum-32-characters-long';
  process.env.HF_TOKEN_B64 = process.env.HF_TOKEN_B64 || Buffer.from('hf_test_token_for_testing').toString('base64');
  process.env.DATABASE_URL = process.env.DATABASE_URL || ':memory:';
  process.env.USE_WORKERS = 'true';
  process.env.SKIP_CSRF = 'true';
  process.env.USE_FAKE_DATA = 'true';
  process.env.DEMO_MODE = 'true';
  
  // Create in-memory test database
  testDb = new Database(':memory:');
  
  // Create test tables using the same schema as production
  testDb.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'trainer', 'viewer')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
    );

    -- Models table
    CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('persian-bert', 'dora', 'qr-adaptor')),
        status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'training', 'paused', 'completed', 'failed')),
        accuracy REAL DEFAULT 0.0,
        loss REAL DEFAULT 0.0,
        epochs INTEGER DEFAULT 0,
        current_epoch INTEGER DEFAULT 0,
        dataset_id VARCHAR(100),
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Training sessions table
    CREATE TABLE IF NOT EXISTS training_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER NOT NULL,
        user_id INTEGER,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed')),
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        total_epochs INTEGER NOT NULL,
        current_epoch INTEGER DEFAULT 0,
        config TEXT,
        metrics TEXT,
        FOREIGN KEY (model_id) REFERENCES models(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Training logs table
    CREATE TABLE IF NOT EXISTS training_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        session_id VARCHAR(100),
        level VARCHAR(10) CHECK (level IN ('info', 'warning', 'error', 'debug')),
        category VARCHAR(50),
        message TEXT NOT NULL,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (model_id) REFERENCES models(id)
    );

    -- Checkpoints table
    CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER NOT NULL,
        session_id VARCHAR(100),
        epoch INTEGER NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        metrics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (model_id) REFERENCES models(id)
    );

    -- Datasets table
    CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        huggingface_id VARCHAR(100),
        samples INTEGER DEFAULT 0,
        downloaded_at DATETIME,
        file_path VARCHAR(255),
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- System logs table (CRITICAL for worker monitor tests)
    CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level VARCHAR(10) CHECK (level IN ('info', 'warning', 'error', 'debug')),
        category VARCHAR(50),
        message TEXT NOT NULL,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- System settings table
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
    CREATE INDEX IF NOT EXISTS idx_models_type ON models(type);
    CREATE INDEX IF NOT EXISTS idx_training_sessions_model_id ON training_sessions(model_id);
    CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_training_logs_model_id ON training_logs(model_id);
    CREATE INDEX IF NOT EXISTS idx_training_logs_timestamp ON training_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_checkpoints_model_id ON checkpoints(model_id);
    CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
  `);
});

beforeEach(async () => {
  // Clear test data before each test
  testDb.exec(`
    DELETE FROM training_logs;
    DELETE FROM system_logs;
    DELETE FROM training_sessions;
    DELETE FROM checkpoints;
    DELETE FROM models;
    DELETE FROM datasets;
    DELETE FROM users;
    DELETE FROM system_settings;
  `);
  
  // Create admin user for tests (simple password for testing)
  const bcrypt = await import('bcryptjs');
  const adminPasswordHash = await bcrypt.hash('admin', 12);
  
  testDb.exec(`
    INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@test.com', '${adminPasswordHash}', 'admin');
    
    INSERT INTO datasets (name, huggingface_id, samples) VALUES
    ('Test Dataset 1', 'test/dataset1', 1000),
    ('Test Dataset 2', 'test/dataset2', 2000);
    
    INSERT INTO models (name, type, status, accuracy, loss, epochs) VALUES
    ('Test Model 1', 'persian-bert', 'completed', 0.85, 0.15, 10),
    ('Test Model 2', 'dora', 'training', 0.0, 0.0, 0);
    
    INSERT INTO system_settings (key, value, description) VALUES
    ('test_setting', 'test_value', 'Test setting for unit tests');
  `);
});

afterAll(async () => {
  // Close test database
  if (testDb) {
    testDb.close();
  }
});

// Helper function to create test user
export async function createTestUser(role: string = 'viewer') {
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash('testpassword', 12);
  
  // Use unique username and email for each test
  const timestamp = Date.now();
  const username = `testuser_${timestamp}`;
  const email = `test_${timestamp}@example.com`;
  
  const result = testDb.prepare(`
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run(username, email, passwordHash, role);
  
  return {
    id: result.lastInsertRowid as number,
    username,
    email,
    role,
    password: 'testpassword'
  };
}

// Helper function to generate test JWT token
export function generateTestToken(user: { id: number; username: string; role: string; email: string }) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}