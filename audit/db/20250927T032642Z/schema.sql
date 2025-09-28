CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'trainer', 'viewer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active INTEGER DEFAULT 1  -- SQLite uses INTEGER for boolean (0/1)
)

CREATE TABLE sqlite_sequence(name,seq)

CREATE TABLE models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('persian-bert', 'dora', 'qr-adaptor')),
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'training', 'paused', 'completed', 'failed')),
    accuracy REAL DEFAULT 0.0,
    loss REAL DEFAULT 0.0,
    epochs INTEGER DEFAULT 0,
    current_epoch INTEGER DEFAULT 0,
    dataset_id TEXT,  -- Changed to TEXT to match string IDs
    config TEXT,      -- JSON configuration stored as TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
)

CREATE TABLE training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    user_id INTEGER,
    session_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed')),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    total_epochs INTEGER NOT NULL,
    current_epoch INTEGER DEFAULT 0,
    config TEXT,  -- JSON configuration stored as TEXT
    metrics TEXT, -- JSON metrics stored as TEXT
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)

CREATE TABLE training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    session_id TEXT,
    level TEXT CHECK (level IN ('info', 'warning', 'error', 'debug')),
    category TEXT,
    message TEXT NOT NULL,
    metadata TEXT,  -- JSON metadata stored as TEXT
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id)
)

CREATE TABLE checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    session_id TEXT,
    epoch INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    metrics TEXT,  -- JSON metrics stored as TEXT
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id)
)

CREATE TABLE system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT CHECK (level IN ('info', 'warning', 'error', 'debug')),
    category TEXT,
    message TEXT NOT NULL,
    metadata TEXT,  -- JSON metadata stored as TEXT
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT,  -- JSON data stored as TEXT
    user_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)

CREATE TABLE schema_migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL UNIQUE,
                    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    checksum TEXT
                )

CREATE TABLE "datasets" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    huggingface_id TEXT,
    samples INTEGER DEFAULT 0,
    size_mb REAL DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'downloading', 'processing', 'error')),
    local_path TEXT,
    type TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME
)