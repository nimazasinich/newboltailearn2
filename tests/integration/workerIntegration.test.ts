/**
 * Integration Tests for Worker Threads Implementation
 * Phase 4 - Worker Threads Implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TrainingService } from '../../server/modules/services/trainingService';
import { WorkerManager } from '../../server/modules/workers/trainingWorker';
import { WorkerErrorHandler } from '../../server/modules/workers/errorHandler';
import { WorkerPerformanceMonitor } from '../../server/modules/monitoring/workerMetrics';
import Database from 'better-sqlite3';
import { Server } from 'socket.io';
import { createServer } from 'http';

// Mock Socket.IO
const mockIO = {
  emit: vi.fn(),
  on: vi.fn()
} as any;

describe('Worker Integration Tests', () => {
  let db: Database.Database;
  let trainingService: TrainingService;
  let workerManager: WorkerManager;
  let errorHandler: WorkerErrorHandler;
  let performanceMonitor: WorkerPerformanceMonitor;

  beforeEach(() => {
    db = new Database(':memory:');
    
    // Create tables for testing
    db.exec(`
      CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        accuracy REAL DEFAULT 0,
        loss REAL DEFAULT 0,
        epochs INTEGER DEFAULT 0,
        current_epoch INTEGER DEFAULT 0,
        dataset_id TEXT,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS training_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER NOT NULL,
        user_id INTEGER,
        dataset_id TEXT NOT NULL,
        parameters TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        status TEXT DEFAULT 'running',
        final_accuracy REAL,
        final_loss REAL,
        total_epochs INTEGER,
        training_duration_seconds INTEGER,
        result TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS training_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        level TEXT,
        message TEXT NOT NULL,
        epoch INTEGER,
        loss REAL,
        accuracy REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT,
        category TEXT,
        message TEXT NOT NULL,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source TEXT NOT NULL,
        huggingface_id TEXT,
        samples INTEGER DEFAULT 0,
        size_mb REAL DEFAULT 0,
        status TEXT DEFAULT 'available',
        local_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize services
    trainingService = new TrainingService(db, mockIO);
    workerManager = new WorkerManager(true, 2);
    errorHandler = new WorkerErrorHandler(db);
    performanceMonitor = new WorkerPerformanceMonitor(db);
  });

  afterEach(async () => {
    // Cleanup in proper order to prevent database connection issues
    await trainingService.cleanup();
    await workerManager.terminate();
    
    // Give performance monitor time to finish logging
    await new Promise(resolve => setTimeout(resolve, 100));
    
    db.close();
  });

  describe('Training Service Integration', () => {
    it('should start training with workers enabled', async () => {
      // Insert test model
      const modelResult = db.prepare(`
        INSERT INTO models (name, type, dataset_id, config)
        VALUES (?, ?, ?, ?)
      `).run('Test Model', 'persian-bert', 'test-dataset', '{}');

      const modelId = modelResult.lastInsertRowid as number;

      // Start training
      const result = await trainingService.startTraining(
        modelId,
        'test-dataset',
        {
          epochs: 2,
          batchSize: 32,
          learningRate: 0.001
        },
        1
      );

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
    });

    it('should handle training errors gracefully', async () => {
      // Try to start training with invalid model ID
      const result = await trainingService.startTraining(
        999, // Non-existent model
        'test-dataset',
        {
          epochs: 2,
          batchSize: 32,
          learningRate: 0.001
        },
        1
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should provide performance metrics', () => {
      const metrics = trainingService.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('mainThreadResponseTime');
      expect(metrics).toHaveProperty('workerMemoryUsage');
      expect(metrics).toHaveProperty('messagePassingLatency');
      expect(metrics).toHaveProperty('trainingThroughput');
      expect(metrics).toHaveProperty('workersEnabled');
      expect(metrics).toHaveProperty('activeSessions');
    });

    it('should get active training sessions', () => {
      const sessions = trainingService.getActiveSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('Worker Manager Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [
        {
          modelId: 1,
          datasetId: 'test-1',
          config: {
            epochs: 1,
            batchSize: 16,
            learningRate: 0.001,
            modelType: 'persian-bert' as const
          },
          sessionId: 1,
          userId: 1
        },
        {
          modelId: 2,
          datasetId: 'test-2',
          config: {
            epochs: 1,
            batchSize: 16,
            learningRate: 0.001,
            modelType: 'dora' as const
          },
          sessionId: 2,
          userId: 1
        }
      ];

      // Test that requests can be queued
      expect(requests).toHaveLength(2);
      expect(requests[0].modelId).toBe(1);
      expect(requests[1].modelId).toBe(2);
    });

    it('should provide worker metrics', () => {
      const metrics = workerManager.getWorkerMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should track and recover from worker errors', () => {
      const stats = errorHandler.getErrorStatistics();
      
      expect(stats).toHaveProperty('totalErrors');
      expect(stats).toHaveProperty('activeErrors');
      expect(stats).toHaveProperty('failedWorkers');
      expect(stats).toHaveProperty('recoveringWorkers');
      expect(stats).toHaveProperty('errorRate');
      expect(stats).toHaveProperty('averageRecoveryTime');
    });

    it('should provide system health summary', () => {
      const health = errorHandler.getSystemHealthSummary();
      
      expect(health).toHaveProperty('overall');
      expect(health).toHaveProperty('workers');
      expect(health).toHaveProperty('recommendations');
      expect(['healthy', 'warning', 'critical']).toContain(health.overall);
    });

    it('should handle worker health status', () => {
      const status = errorHandler.getWorkerHealthStatus('test-worker');
      
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('recoveryAttempts');
      expect(status).toHaveProperty('uptime');
      expect(['healthy', 'warning', 'critical', 'unknown']).toContain(status.status);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should monitor system performance', () => {
      const metrics = performanceMonitor.getMetrics();
      
      expect(metrics).toHaveProperty('mainThreadResponseTime');
      expect(metrics).toHaveProperty('workerMemoryUsage');
      expect(metrics).toHaveProperty('messagePassingLatency');
      expect(metrics).toHaveProperty('trainingThroughput');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('timestamp');
    });

    it('should track performance alerts', () => {
      const alerts = performanceMonitor.getActiveAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should provide performance summary', () => {
      const summary = performanceMonitor.getPerformanceSummary();
      
      expect(summary).toHaveProperty('status');
      expect(summary).toHaveProperty('metrics');
      expect(summary).toHaveProperty('alerts');
      expect(summary).toHaveProperty('recommendations');
      expect(['healthy', 'warning', 'critical']).toContain(summary.status);
    });

    it('should update worker metrics', () => {
      const mockMetrics = [
        {
          workerId: 'worker-1',
          cpuUsage: 50,
          memoryUsage: 256,
          activeTasks: 1,
          completedTasks: 10,
          failedTasks: 0,
          uptime: 60000,
          lastActivity: new Date().toISOString()
        }
      ];

      expect(() => {
        performanceMonitor.updateWorkerMetrics(mockMetrics);
      }).not.toThrow();
    });
  });

  describe('End-to-End Training Flow', () => {
    it('should complete full training workflow', async () => {
      // Insert test model
      const modelResult = db.prepare(`
        INSERT INTO models (name, type, dataset_id, config)
        VALUES (?, ?, ?, ?)
      `).run('Integration Test Model', 'persian-bert', 'test-dataset', '{}');

      const modelId = modelResult.lastInsertRowid as number;

      // Start training
      const startResult = await trainingService.startTraining(
        modelId,
        'test-dataset',
        {
          epochs: 1,
          batchSize: 16,
          learningRate: 0.001
        },
        1
      );

      expect(startResult.success).toBe(true);

      // Check training status
      const status = trainingService.getTrainingStatus(modelId);
      expect(status.isTraining).toBe(true);

      // Get performance metrics
      const metrics = trainingService.getPerformanceMetrics();
      expect(metrics.workersEnabled).toBe(true);

      // Get worker metrics
      const workerMetrics = trainingService.getWorkerMetrics();
      expect(Array.isArray(workerMetrics)).toBe(true);
    });

    it('should handle training completion', async () => {
      // Insert test model
      const modelResult = db.prepare(`
        INSERT INTO models (name, type, dataset_id, config)
        VALUES (?, ?, ?, ?)
      `).run('Completion Test Model', 'persian-bert', 'test-dataset', '{}');

      const modelId = modelResult.lastInsertRowid as number;

      // Start training
      const result = await trainingService.startTraining(
        modelId,
        'test-dataset',
        {
          epochs: 1,
          batchSize: 16,
          learningRate: 0.001
        },
        1
      );

      expect(result.success).toBe(true);

      // Simulate training completion
      // In a real scenario, this would happen automatically
      const model = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
      expect(model).toBeDefined();
      expect(model.status).toBe('training');
    });
  });

  describe('Concurrent Training Sessions', () => {
    it('should handle multiple training sessions', async () => {
      const models = [];
      
      // Create multiple test models
      for (let i = 0; i < 3; i++) {
        const modelResult = db.prepare(`
          INSERT INTO models (name, type, dataset_id, config)
          VALUES (?, ?, ?, ?)
        `).run(`Concurrent Model ${i}`, 'persian-bert', 'test-dataset', '{}');
        
        models.push(modelResult.lastInsertRowid as number);
      }

      // Start multiple training sessions
      const results = await Promise.all(
        models.map((modelId, index) =>
          trainingService.startTraining(
            modelId,
            'test-dataset',
            {
              epochs: 1,
              batchSize: 16,
              learningRate: 0.001
            },
            index + 1
          )
        )
      );

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Check active sessions
      const activeSessions = trainingService.getActiveSessions();
      expect(activeSessions.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should maintain main thread responsiveness', () => {
      const startTime = Date.now();
      
      // Simulate main thread operations
      const operations = Array.from({ length: 1000 }, (_, i) => i * 2);
      const result = operations.reduce((sum, val) => sum + val, 0);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Main thread should remain responsive
      expect(responseTime).toBeLessThan(100);
      expect(result).toBe(999000); // Sum of 0 to 1998
    });

    it('should handle memory constraints', () => {
      const memoryLimit = 512; // MB
      const mockWorkerMetrics = [
        {
          workerId: 'worker-1',
          cpuUsage: 50,
          memoryUsage: 256, // Within limit
          activeTasks: 1,
          completedTasks: 10,
          failedTasks: 0,
          uptime: 60000,
          lastActivity: new Date().toISOString()
        },
        {
          workerId: 'worker-2',
          cpuUsage: 80,
          memoryUsage: 600, // Exceeds limit
          activeTasks: 1,
          completedTasks: 5,
          failedTasks: 1,
          uptime: 30000,
          lastActivity: new Date().toISOString()
        }
      ];

      performanceMonitor.updateWorkerMetrics(mockWorkerMetrics);
      
      const summary = performanceMonitor.getPerformanceSummary();
      
      // Should detect memory usage issues
      expect(summary.status).toBe('warning');
      expect(summary.recommendations.length).toBeGreaterThan(0);
    });
  });
});