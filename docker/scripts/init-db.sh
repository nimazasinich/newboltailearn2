#!/bin/bash
# init-db.sh - Initialize SQLite database

set -e

# Configuration
DATABASE_PATH=${DATABASE_PATH:-/data/database.sqlite}
DATABASE_DIR=$(dirname "$DATABASE_PATH")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create database directory if it doesn't exist
if [ ! -d "$DATABASE_DIR" ]; then
    log_info "Creating database directory: $DATABASE_DIR"
    mkdir -p "$DATABASE_DIR"
    chmod 755 "$DATABASE_DIR"
fi

# Check if database already exists
if [ -f "$DATABASE_PATH" ]; then
    log_warn "Database already exists at $DATABASE_PATH"
    
    # Check if database is valid
    if sqlite3 "$DATABASE_PATH" "SELECT 1;" &> /dev/null; then
        log_info "Database is valid and accessible"
        
        # Check for required tables
        TABLES=$(sqlite3 "$DATABASE_PATH" ".tables")
        log_info "Existing tables: $TABLES"
        
        exit 0
    else
        log_error "Database exists but is corrupted"
        
        # Backup corrupted database
        BACKUP_PATH="${DATABASE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "Backing up corrupted database to $BACKUP_PATH"
        mv "$DATABASE_PATH" "$BACKUP_PATH"
    fi
fi

# Initialize new database
log_info "Initializing new database at $DATABASE_PATH"

# Create database with proper settings
sqlite3 "$DATABASE_PATH" <<EOF
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Set journal mode for better concurrency
PRAGMA journal_mode = WAL;

-- Set synchronous mode for better performance
PRAGMA synchronous = NORMAL;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    tags TEXT,
    metadata TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    version TEXT,
    config TEXT,
    weights BLOB,
    metrics TEXT,
    status TEXT DEFAULT 'inactive',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    dataset_id INTEGER,
    config TEXT,
    metrics TEXT,
    status TEXT DEFAULT 'pending',
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id)
);

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    size INTEGER,
    path TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id INTEGER,
    session_id TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_model_id ON training_sessions(model_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT OR IGNORE INTO users (email, password, name, role)
VALUES ('admin@example.com', '\$2a\$10\$YKqVHLKHgKqDmVPd8kJqLuWqZlWfKJZdKpGKZKqZlWfKJZdKpGK', 'Admin User', 'admin');

-- Insert sample data for testing
INSERT OR IGNORE INTO documents (title, content, category, tags)
VALUES 
    ('Sample Legal Document 1', 'This is a sample legal document content.', 'contract', 'legal,sample'),
    ('Sample Legal Document 2', 'Another sample document for testing.', 'agreement', 'test,sample');

-- Verify database creation
SELECT 'Database initialized successfully' as status;
.tables
EOF

# Check if initialization was successful
if [ $? -eq 0 ]; then
    log_info "Database initialized successfully"
    
    # Set proper permissions
    chmod 644 "$DATABASE_PATH"
    
    # Show database info
    SIZE=$(du -h "$DATABASE_PATH" | cut -f1)
    log_info "Database size: $SIZE"
    
    # Show table count
    TABLE_COUNT=$(sqlite3 "$DATABASE_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null)
    log_info "Number of tables: $TABLE_COUNT"
    
    exit 0
else
    log_error "Failed to initialize database"
    exit 1
fi