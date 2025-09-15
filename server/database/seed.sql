-- Persian Legal AI Database Seed Data
-- Default data for production deployment

-- Insert default admin user (password is 'admin123')
INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@persianlegalai.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'admin');

-- Insert default datasets with proper data types
INSERT OR REPLACE INTO datasets (id, name, source, huggingface_id, samples, size_mb, status, type, description, created_at, last_used) VALUES 
('iran-legal-qa', 'پرسش و پاسخ حقوقی ایران', 'huggingface', 'PerSets/iran-legal-persian-qa', 10247, 15.2, 'available', 'qa', 'مجموعه داده پرسش و پاسخ حقوقی به زبان فارسی', '2024-01-15 10:30:00', '2024-09-14 20:00:00'),
('legal-laws', 'متون قوانین ایران', 'huggingface', 'QomSSLab/legal_laws_lite_chunk_v1', 50000, 125.8, 'available', 'legal-text', 'متون قوانین و مقررات جمهوری اسلامی ایران', '2024-02-20 14:15:00', '2024-09-14 19:30:00'),
('persian-ner', 'تشخیص موجودیت فارسی', 'huggingface', 'mansoorhamidzadeh/Persian-NER-Dataset-500k', 500000, 890.5, 'available', 'ner', 'مجموعه داده تشخیص موجودیت نام‌شده برای زبان فارسی', '2024-03-10 09:00:00', '2024-09-14 18:45:00');

-- Insert default system settings
INSERT OR REPLACE INTO settings (key, value, description) VALUES 
('dataset_directory', './datasets', 'Directory for storing datasets'),
('model_directory', './models', 'Directory for storing trained models'),
('huggingface_token_configured', 'true', 'HuggingFace API token is configured'),
('max_concurrent_training', '2', 'Maximum concurrent training sessions'),
('default_batch_size', '32', 'Default batch size for training'),
('default_learning_rate', '0.001', 'Default learning rate'),
('default_epochs', '10', 'Default number of training epochs'),
('enable_gpu', 'false', 'Enable GPU acceleration if available'),
('log_level', 'info', 'Application logging level'),
('persian_support', 'true', 'Persian language support enabled');

-- Insert sample model configuration
INSERT OR IGNORE INTO models (name, type, status, dataset_id, config, created_by) VALUES 
('نمونه مدل BERT فارسی', 'persian-bert', 'idle', 'iran-legal-qa', '{"batch_size": 32, "learning_rate": 0.001, "epochs": 10}', 1);

-- Log initial setup
INSERT INTO system_logs (level, category, message, metadata) VALUES 
('info', 'database', 'Database initialized with seed data', '{"timestamp": "' || datetime('now') || '", "version": "1.0"}');