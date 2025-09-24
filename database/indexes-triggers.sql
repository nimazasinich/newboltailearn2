-- Performance Indexes and Data Integrity Triggers
-- Persian Legal AI Database Optimization

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Document indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_date_issued ON documents(date_issued);
CREATE INDEX IF NOT EXISTS idx_documents_court_type ON documents(court_type);
CREATE INDEX IF NOT EXISTS idx_documents_case_number ON documents(case_number);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_word_count ON documents(word_count);
CREATE INDEX IF NOT EXISTS idx_documents_confidence ON documents(confidence_score);
CREATE INDEX IF NOT EXISTS idx_documents_language ON documents(language);

-- Model indexes
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_models_type ON models(type);
CREATE INDEX IF NOT EXISTS idx_models_accuracy ON models(accuracy);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);

-- Training session indexes
CREATE INDEX IF NOT EXISTS idx_training_model ON training_sessions(model_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_started_at ON training_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_training_progress ON training_sessions(progress);

-- Processing queue indexes
CREATE INDEX IF NOT EXISTS idx_queue_status ON processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON processing_queue(priority);
CREATE INDEX IF NOT EXISTS idx_queue_started_at ON processing_queue(started_at);
CREATE INDEX IF NOT EXISTS idx_queue_document ON processing_queue(document_id);

-- Prediction indexes
CREATE INDEX IF NOT EXISTS idx_predictions_document ON predictions(document_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(predicted_category);
CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON predictions(confidence_score);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at);

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON system_metrics(timestamp);

-- =============================================
-- DATA INTEGRITY TRIGGERS
-- =============================================

-- Update document count in categories
CREATE TRIGGER IF NOT EXISTS update_category_count_insert
AFTER INSERT ON documents
WHEN NEW.status = 'processed'
BEGIN
    UPDATE categories 
    SET document_count = document_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.category_id;
END;

CREATE TRIGGER IF NOT EXISTS update_category_count_delete
AFTER DELETE ON documents
WHEN OLD.status = 'processed'
BEGIN
    UPDATE categories 
    SET document_count = document_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.category_id;
END;

CREATE TRIGGER IF NOT EXISTS update_category_count_update
AFTER UPDATE ON documents
WHEN OLD.status != NEW.status AND NEW.status = 'processed'
BEGIN
    UPDATE categories 
    SET document_count = document_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.category_id;
END;

CREATE TRIGGER IF NOT EXISTS update_category_count_update_old
AFTER UPDATE ON documents
WHEN OLD.status != NEW.status AND OLD.status = 'processed'
BEGIN
    UPDATE categories 
    SET document_count = document_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.category_id;
END;

-- Update timestamps automatically
CREATE TRIGGER IF NOT EXISTS update_documents_timestamp
AFTER UPDATE ON documents
BEGIN
    UPDATE documents 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_models_timestamp
AFTER UPDATE ON models
BEGIN
    UPDATE models 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_categories_timestamp
AFTER UPDATE ON categories
BEGIN
    UPDATE categories 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- =============================================
-- DATA VALIDATION TRIGGERS
-- =============================================

-- Ensure positive values
CREATE TRIGGER IF NOT EXISTS validate_positive_values
BEFORE INSERT ON documents
WHEN NEW.word_count < 0 OR NEW.page_count < 0 OR NEW.file_size < 0
BEGIN
    SELECT RAISE(ABORT, 'Negative values not allowed for word_count, page_count, or file_size');
END;

-- Ensure confidence score is valid
CREATE TRIGGER IF NOT EXISTS validate_confidence_score
BEFORE INSERT ON predictions
WHEN NEW.confidence_score < 0 OR NEW.confidence_score > 1
BEGIN
    SELECT RAISE(ABORT, 'Confidence score must be between 0 and 1');
END;

-- Ensure progress is valid
CREATE TRIGGER IF NOT EXISTS validate_progress
BEFORE INSERT ON training_sessions
WHEN NEW.progress < 0 OR NEW.progress > 100
BEGIN
    SELECT RAISE(ABORT, 'Progress must be between 0 and 100');
END;

-- =============================================
-- AUDIT TRIGGERS
-- =============================================

-- Audit document changes
CREATE TRIGGER IF NOT EXISTS audit_documents_insert
AFTER INSERT ON documents
BEGIN
    INSERT INTO audit_log (id, table_name, record_id, action, new_values, created_at)
    VALUES (
        'audit_' || NEW.id || '_' || strftime('%s', 'now'),
        'documents',
        NEW.id,
        'INSERT',
        json_object(
            'title', NEW.title,
            'category_id', NEW.category_id,
            'status', NEW.status,
            'created_by', NEW.created_by
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS audit_documents_update
AFTER UPDATE ON documents
BEGIN
    INSERT INTO audit_log (id, table_name, record_id, action, old_values, new_values, created_at)
    VALUES (
        'audit_' || NEW.id || '_' || strftime('%s', 'now'),
        'documents',
        NEW.id,
        'UPDATE',
        json_object(
            'title', OLD.title,
            'status', OLD.status,
            'updated_at', OLD.updated_at
        ),
        json_object(
            'title', NEW.title,
            'status', NEW.status,
            'updated_at', NEW.updated_at
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS audit_documents_delete
AFTER DELETE ON documents
BEGIN
    INSERT INTO audit_log (id, table_name, record_id, action, old_values, created_at)
    VALUES (
        'audit_' || OLD.id || '_' || strftime('%s', 'now'),
        'documents',
        OLD.id,
        'DELETE',
        json_object(
            'title', OLD.title,
            'category_id', OLD.category_id,
            'status', OLD.status
        ),
        CURRENT_TIMESTAMP
    );
END;
