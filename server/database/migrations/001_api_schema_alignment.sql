-- Migration 001: Align database schema with API Zod schemas
-- This migration ensures the database structure matches the API expectations

-- Add missing columns to models table to match TrainingSession schema
ALTER TABLE models ADD COLUMN progress REAL DEFAULT 0.0;
ALTER TABLE models ADD COLUMN estimated_time INTEGER DEFAULT 0;
ALTER TABLE models ADD COLUMN learning_rate REAL DEFAULT 0.001;
ALTER TABLE models ADD COLUMN batch_size INTEGER DEFAULT 32;

-- Create metrics_history table to store training progress over time
CREATE TABLE IF NOT EXISTS metrics_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    epoch INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    loss REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Add missing columns to datasets table to match Dataset schema
ALTER TABLE datasets ADD COLUMN source VARCHAR(255) DEFAULT '';
ALTER TABLE datasets ADD COLUMN size_mb REAL DEFAULT 0.0;
ALTER TABLE datasets ADD COLUMN status VARCHAR(50) DEFAULT 'ready';
ALTER TABLE datasets ADD COLUMN type VARCHAR(50) DEFAULT 'text';
ALTER TABLE datasets ADD COLUMN last_used DATETIME;

-- Update existing datasets to have proper values
UPDATE datasets SET 
    source = COALESCE(huggingface_id, 'local'),
    size_mb = samples * 0.001, -- Rough estimate: 1KB per sample
    type = 'legal-text',
    status = 'ready'
WHERE source = '' OR source IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_metrics_history_model_id ON metrics_history(model_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_epoch ON metrics_history(epoch);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);
CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(type);

-- Update models table to ensure proper status values
UPDATE models SET status = 'idle' WHERE status NOT IN ('idle', 'training', 'paused', 'completed', 'failed');

-- Insert sample metrics history for existing models
INSERT OR IGNORE INTO metrics_history (model_id, epoch, accuracy, loss)
SELECT 
    id as model_id,
    epochs as epoch,
    accuracy,
    loss
FROM models 
WHERE epochs > 0 AND accuracy > 0;