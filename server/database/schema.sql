-- Persian Legal AI Database Schema
-- Complete schema for all required tables

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
    config TEXT, -- JSON configuration
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
    config TEXT, -- JSON configuration
    metrics TEXT, -- JSON metrics
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
    metadata TEXT, -- JSON metadata
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
    metrics TEXT, -- JSON metrics
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
    metadata TEXT, -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level VARCHAR(10) CHECK (level IN ('info', 'warning', 'error', 'debug')),
    category VARCHAR(50),
    message TEXT NOT NULL,
    metadata TEXT, -- JSON metadata
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- Insert default admin user
INSERT OR IGNORE INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@persianlegalai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'admin');

-- Insert default datasets
INSERT OR IGNORE INTO datasets (name, huggingface_id, samples) VALUES 
('Iran Legal QA', 'iran-legal-qa', 1000),
('Legal Laws', 'legal-laws', 500),
('Persian Legal Documents', 'persian-legal-docs', 2000);
