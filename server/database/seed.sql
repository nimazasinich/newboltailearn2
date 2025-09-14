-- Seed data for Persian Legal AI system
-- This script populates the database with realistic demo data

-- Clear existing data (except users)
DELETE FROM metrics_history;
DELETE FROM checkpoints;
DELETE FROM training_logs;
DELETE FROM training_sessions;
DELETE FROM models;
DELETE FROM datasets WHERE id > 3; -- Keep the original 3 datasets

-- Insert realistic datasets
INSERT OR REPLACE INTO datasets (id, name, source, samples, size_mb, status, type, created_at, last_used) VALUES 
(1, 'قوانین مدنی ایران', 'huggingface:iran-civil-law', 15420, 12.3, 'ready', 'civil-law', '2024-01-15 10:30:00', '2024-09-14 20:00:00'),
(2, 'قوانین جزایی', 'huggingface:iran-criminal-law', 8750, 8.9, 'ready', 'criminal-law', '2024-02-20 14:15:00', '2024-09-14 19:30:00'),
(3, 'آیین دادرسی مدنی', 'huggingface:civil-procedure', 6200, 5.8, 'ready', 'procedure', '2024-03-10 09:45:00', '2024-09-13 16:20:00'),
(4, 'قوانین تجاری', 'local:commercial-law', 4300, 4.1, 'ready', 'commercial-law', '2024-04-05 11:20:00', '2024-09-12 14:10:00'),
(5, 'قوانین کار', 'huggingface:labor-law', 3850, 3.7, 'ready', 'labor-law', '2024-05-12 16:30:00', '2024-09-11 10:45:00');

-- Insert realistic training models
INSERT OR REPLACE INTO models (id, name, type, status, accuracy, loss, epochs, current_epoch, progress, dataset_id, estimated_time, learning_rate, batch_size, created_at, updated_at) VALUES 
(1, 'مدل پایه قوانین مدنی', 'persian-bert', 'completed', 0.924, 0.156, 50, 50, 100.0, '1', 0, 0.0001, 16, '2024-08-01 10:00:00', '2024-08-15 16:30:00'),
(2, 'مدل تشخیص جرایم', 'dora', 'training', 0.847, 0.298, 30, 18, 60.0, '2', 2400, 0.0005, 32, '2024-09-01 09:15:00', '2024-09-14 21:00:00'),
(3, 'مدل آیین دادرسی', 'qr-adaptor', 'paused', 0.789, 0.412, 25, 12, 48.0, '3', 1800, 0.0003, 24, '2024-08-20 14:20:00', '2024-09-10 11:45:00'),
(4, 'مدل قوانین تجاری', 'persian-bert', 'completed', 0.891, 0.203, 40, 40, 100.0, '4', 0, 0.0002, 16, '2024-07-10 08:30:00', '2024-07-25 19:20:00'),
(5, 'مدل حقوق کار', 'dora', 'idle', 0.0, 0.0, 0, 0, 0.0, '5', 3600, 0.0004, 32, '2024-09-12 13:45:00', '2024-09-12 13:45:00'),
(6, 'مدل ترکیبی حقوقی', 'persian-bert', 'failed', 0.234, 1.245, 15, 15, 100.0, '1', 0, 0.001, 8, '2024-08-05 12:00:00', '2024-08-07 10:30:00');

-- Insert realistic metrics history (training progress over time)
-- Model 1: Completed training with good progression
INSERT INTO metrics_history (model_id, epoch, accuracy, loss, timestamp) VALUES 
(1, 1, 0.234, 2.145, '2024-08-01 10:30:00'),
(1, 5, 0.456, 1.876, '2024-08-02 08:15:00'),
(1, 10, 0.623, 1.234, '2024-08-03 14:20:00'),
(1, 15, 0.734, 0.987, '2024-08-05 09:45:00'),
(1, 20, 0.812, 0.654, '2024-08-07 16:30:00'),
(1, 25, 0.856, 0.456, '2024-08-09 11:15:00'),
(1, 30, 0.887, 0.345, '2024-08-11 13:40:00'),
(1, 35, 0.905, 0.267, '2024-08-13 10:20:00'),
(1, 40, 0.918, 0.198, '2024-08-14 15:10:00'),
(1, 45, 0.921, 0.167, '2024-08-15 12:45:00'),
(1, 50, 0.924, 0.156, '2024-08-15 16:30:00');

-- Model 2: Currently training with recent progress
INSERT INTO metrics_history (model_id, epoch, accuracy, loss, timestamp) VALUES 
(2, 1, 0.187, 2.456, '2024-09-01 09:30:00'),
(2, 3, 0.312, 2.123, '2024-09-02 11:15:00'),
(2, 6, 0.445, 1.789, '2024-09-04 14:20:00'),
(2, 9, 0.567, 1.456, '2024-09-06 16:45:00'),
(2, 12, 0.678, 1.123, '2024-09-08 13:30:00'),
(2, 15, 0.756, 0.876, '2024-09-10 10:15:00'),
(2, 18, 0.847, 0.298, '2024-09-14 21:00:00');

-- Model 3: Paused training
INSERT INTO metrics_history (model_id, epoch, accuracy, loss, timestamp) VALUES 
(3, 1, 0.156, 2.789, '2024-08-20 14:40:00'),
(3, 3, 0.234, 2.456, '2024-08-21 09:20:00'),
(3, 6, 0.345, 2.123, '2024-08-23 11:35:00'),
(3, 9, 0.456, 1.789, '2024-08-25 15:15:00'),
(3, 12, 0.789, 0.412, '2024-09-10 11:45:00');

-- Model 4: Another completed model
INSERT INTO metrics_history (model_id, epoch, accuracy, loss, timestamp) VALUES 
(4, 1, 0.267, 2.234, '2024-07-10 09:00:00'),
(4, 5, 0.398, 1.876, '2024-07-12 12:30:00'),
(4, 10, 0.534, 1.456, '2024-07-14 16:45:00'),
(4, 15, 0.645, 1.123, '2024-07-16 14:20:00'),
(4, 20, 0.734, 0.876, '2024-07-18 11:15:00'),
(4, 25, 0.812, 0.654, '2024-07-20 09:30:00'),
(4, 30, 0.856, 0.456, '2024-07-22 13:45:00'),
(4, 35, 0.878, 0.298, '2024-07-24 10:20:00'),
(4, 40, 0.891, 0.203, '2024-07-25 19:20:00');

-- Model 6: Failed training
INSERT INTO metrics_history (model_id, epoch, accuracy, loss, timestamp) VALUES 
(6, 1, 0.123, 3.456, '2024-08-05 12:30:00'),
(6, 3, 0.145, 3.234, '2024-08-05 18:45:00'),
(6, 6, 0.167, 3.123, '2024-08-06 14:20:00'),
(6, 9, 0.189, 2.987, '2024-08-06 20:15:00'),
(6, 12, 0.212, 2.456, '2024-08-07 08:30:00'),
(6, 15, 0.234, 1.245, '2024-08-07 10:30:00');

-- Insert some training sessions
INSERT INTO training_sessions (model_id, user_id, session_id, status, start_time, end_time, total_epochs, current_epoch, config, metrics) VALUES 
(2, 1, 'session_2024_09_01_001', 'running', '2024-09-01 09:15:00', NULL, 30, 18, '{"learning_rate": 0.0005, "batch_size": 32}', '{"current_loss": 0.298, "current_accuracy": 0.847}'),
(3, 1, 'session_2024_08_20_001', 'paused', '2024-08-20 14:20:00', NULL, 25, 12, '{"learning_rate": 0.0003, "batch_size": 24}', '{"current_loss": 0.412, "current_accuracy": 0.789}');

-- Insert some system logs
INSERT INTO system_logs (level, category, message, timestamp) VALUES 
('info', 'system', 'System started successfully', '2024-09-14 20:00:00'),
('info', 'training', 'Model 2 training resumed', '2024-09-14 20:30:00'),
('warning', 'system', 'High CPU usage detected (85%)', '2024-09-14 20:45:00'),
('info', 'dataset', 'Dataset 1 accessed for training', '2024-09-14 21:00:00'),
('error', 'training', 'Model 6 training failed due to memory error', '2024-08-07 10:30:00');

-- Insert some training logs
INSERT INTO training_logs (model_id, session_id, level, category, message, timestamp) VALUES 
(2, 'session_2024_09_01_001', 'info', 'training', 'Epoch 18/30 completed with accuracy: 0.847', '2024-09-14 21:00:00'),
(2, 'session_2024_09_01_001', 'info', 'training', 'Learning rate adjusted to 0.0005', '2024-09-14 20:30:00'),
(3, 'session_2024_08_20_001', 'warning', 'training', 'Training paused by user', '2024-09-10 11:45:00'),
(6, NULL, 'error', 'training', 'Out of memory error during epoch 15', '2024-08-07 10:30:00');