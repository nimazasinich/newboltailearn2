-- Migration 001: Initial Schema Creation
-- Persian Legal AI Database Initial Setup

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,
    parent_id TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    document_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    content TEXT NOT NULL,
    content_summary TEXT,
    category_id TEXT NOT NULL,
    subcategory TEXT,
    court_type TEXT,
    court_level TEXT CHECK (court_level IN ('first', 'appeal', 'supreme', 'special')),
    case_number TEXT,
    case_year INTEGER,
    date_issued DATE,
    date_created DATE,
    judge_name TEXT,
    judge_title TEXT,
    plaintiff TEXT,
    defendant TEXT,
    legal_basis TEXT,
    legal_basis_en TEXT,
    decision_summary TEXT,
    decision_summary_en TEXT,
    keywords TEXT,
    keywords_en TEXT,
    language TEXT DEFAULT 'persian' CHECK (language IN ('persian', 'arabic', 'english')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'archived')),
    processing_status TEXT DEFAULT 'pending',
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    file_hash TEXT,
    word_count INTEGER,
    page_count INTEGER,
    confidence_score REAL DEFAULT 0,
    validation_status TEXT DEFAULT 'pending',
    validated_by TEXT,
    validated_at DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (validated_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    type TEXT DEFAULT 'persian-legal-classifier',
    version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'training', 'trained', 'failed', 'deployed', 'archived')),
    architecture TEXT DEFAULT 'DoRA-BERT',
    base_model TEXT DEFAULT 'persian-bert',
    accuracy REAL DEFAULT 0 CHECK (accuracy >= 0 AND accuracy <= 1),
    precision_score REAL DEFAULT 0 CHECK (precision_score >= 0 AND precision_score <= 1),
    recall_score REAL DEFAULT 0 CHECK (recall_score >= 0 AND recall_score <= 1),
    f1_score REAL DEFAULT 0 CHECK (f1_score >= 0 AND f1_score <= 1),
    training_progress REAL DEFAULT 0 CHECK (training_progress >= 0 AND training_progress <= 100),
    epochs INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    trained_documents INTEGER DEFAULT 0,
    validation_documents INTEGER DEFAULT 0,
    test_documents INTEGER DEFAULT 0,
    model_path TEXT,
    config_json TEXT,
    hyperparameters TEXT,
    training_metrics TEXT,
    performance_metrics TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    session_name TEXT NOT NULL,
    session_description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'training', 'completed', 'failed', 'cancelled')),
    progress REAL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_epoch INTEGER DEFAULT 0,
    total_epochs INTEGER DEFAULT 0,
    documents_processed INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    batch_size INTEGER DEFAULT 32,
    learning_rate REAL DEFAULT 0.001,
    accuracy REAL DEFAULT 0,
    loss REAL DEFAULT 0,
    validation_accuracy REAL DEFAULT 0,
    validation_loss REAL DEFAULT 0,
    config_json TEXT,
    training_log TEXT,
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    estimated_completion DATETIME,
    created_by TEXT,
    FOREIGN KEY (model_id) REFERENCES models (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Create processing_queue table
CREATE TABLE IF NOT EXISTS processing_queue (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    processing_type TEXT DEFAULT 'classification' CHECK (processing_type IN ('classification', 'extraction', 'validation', 'translation')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress REAL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    processing_log TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    estimated_completion DATETIME,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    predicted_category TEXT NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    all_predictions TEXT,
    processing_time_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES models (id) ON DELETE CASCADE
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values TEXT,
    new_values TEXT,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
