import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testDb, createTestUser, generateTestToken } from '../setup';

describe('Training Sessions Stress Tests', () => {
  let trainerToken: string;

  beforeAll(async () => {
    const trainer = await createTestUser('trainer');
    trainerToken = generateTestToken(trainer);
  });

  describe('Concurrent Training Sessions', () => {
    it('should handle multiple training sessions without conflicts', async () => {
      // Create multiple test models
      const modelIds = [];
      for (let i = 0; i < 5; i++) {
        const result = testDb.prepare(`
          INSERT INTO models (name, type, dataset_id, status)
          VALUES (?, 'persian-bert', 'test-dataset-1', 'idle')
        `).run(`Test Model ${i}`);
        modelIds.push(result.lastInsertRowid);
      }

      // Simulate concurrent training starts
      const trainingPromises = modelIds.map(async (modelId) => {
        try {
          // Update model status to training
          testDb.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run('training', modelId);
          
          // Create training session
          const sessionResult = testDb.prepare(`
            INSERT INTO training_sessions (model_id, dataset_id, parameters, start_time, status)
            VALUES (?, 'test-dataset-1', ?, CURRENT_TIMESTAMP, 'running')
          `).run(modelId, JSON.stringify({ epochs: 10, batch_size: 32 }));
          
          return { modelId, sessionId: sessionResult.lastInsertRowid, success: true };
        } catch (error) {
          return { modelId, success: false, error: (error as Error).message };
        }
      });

      const results = await Promise.all(trainingPromises);
      const successCount = results.filter(r => r.success).length;
      
      expect(successCount).toBe(modelIds.length); // All should succeed
      
      // Verify all models are in training status
      const trainingModels = testDb.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get() as { count: number };
      expect(trainingModels.count).toBeGreaterThanOrEqual(modelIds.length);
    }, 30000);

    it('should handle training session updates under load', async () => {
      // Create a training session
      const modelResult = testDb.prepare(`
        INSERT INTO models (name, type, dataset_id, status)
        VALUES ('Load Test Model', 'persian-bert', 'test-dataset-1', 'training')
      `).run();
      const modelId = modelResult.lastInsertRowid;

      const sessionResult = testDb.prepare(`
        INSERT INTO training_sessions (model_id, dataset_id, parameters, start_time, status)
        VALUES (?, 'test-dataset-1', ?, CURRENT_TIMESTAMP, 'running')
      `).run(modelId, JSON.stringify({ epochs: 10, batch_size: 32 }));
      const sessionId = sessionResult.lastInsertRowid;

      // Simulate rapid training updates
      const updatePromises = [];
      for (let epoch = 1; epoch <= 10; epoch++) {
        updatePromises.push(
          (async () => {
            try {
              // Update model progress
              testDb.prepare(`
                UPDATE models 
                SET current_epoch = ?, accuracy = ?, loss = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `).run(epoch, 0.1 + (epoch * 0.08), 1.0 - (epoch * 0.08), modelId);
              
              // Log training progress
              testDb.prepare(`
                INSERT INTO training_logs (model_id, level, message, epoch, loss, accuracy)
                VALUES (?, 'info', ?, ?, ?, ?)
              `).run(modelId, `Epoch ${epoch}/10 completed`, epoch, 1.0 - (epoch * 0.08), 0.1 + (epoch * 0.08));
              
              return { epoch, success: true };
            } catch (error) {
              return { epoch, success: false, error: (error as Error).message };
            }
          })()
        );
      }

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(r => r.success).length;
      
      expect(successCount).toBe(10); // All updates should succeed
      
      // Verify final model state
      const finalModel = testDb.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
      expect(finalModel.current_epoch).toBe(10);
      expect(finalModel.accuracy).toBeCloseTo(0.9, 1);
    }, 30000);
  });

  describe('Training Session Recovery', () => {
    it('should handle training session interruptions gracefully', async () => {
      // Create a training session
      const modelResult = testDb.prepare(`
        INSERT INTO models (name, type, dataset_id, status)
        VALUES ('Recovery Test Model', 'persian-bert', 'test-dataset-1', 'training')
      `).run();
      const modelId = modelResult.lastInsertRowid;

      const sessionResult = testDb.prepare(`
        INSERT INTO training_sessions (model_id, dataset_id, parameters, start_time, status)
        VALUES (?, 'test-dataset-1', ?, CURRENT_TIMESTAMP, 'running')
      `).run(modelId, JSON.stringify({ epochs: 10, batch_size: 32 }));
      const sessionId = sessionResult.lastInsertRowid;

      // Simulate training interruption
      testDb.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('paused', modelId);
      
      testDb.prepare(`
        UPDATE training_sessions 
        SET status = 'paused', end_time = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(sessionId);

      // Verify recovery state
      const pausedModel = testDb.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
      const pausedSession = testDb.prepare('SELECT * FROM training_sessions WHERE id = ?').get(sessionId) as any;
      
      expect(pausedModel.status).toBe('paused');
      expect(pausedSession.status).toBe('paused');
      expect(pausedSession.end_time).toBeDefined();

      // Simulate resuming training
      testDb.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('training', modelId);
      
      const newSessionResult = testDb.prepare(`
        INSERT INTO training_sessions (model_id, dataset_id, parameters, start_time, status)
        VALUES (?, 'test-dataset-1', ?, CURRENT_TIMESTAMP, 'running')
      `).run(modelId, JSON.stringify({ epochs: 10, batch_size: 32, resume_from_epoch: 5 }));

      const resumedModel = testDb.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
      expect(resumedModel.status).toBe('training');
    }, 30000);

    it('should handle database connection issues during training', async () => {
      // Create a training session
      const modelResult = testDb.prepare(`
        INSERT INTO models (name, type, dataset_id, status)
        VALUES ('Connection Test Model', 'persian-bert', 'test-dataset-1', 'training')
      `).run();
      const modelId = modelResult.lastInsertRowid;

      // Simulate database operations with potential failures
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(
          (async () => {
            try {
              // Simulate training update with potential failure
              if (Math.random() < 0.1) { // 10% failure rate
                throw new Error('Simulated database error');
              }
              
              testDb.prepare(`
                UPDATE models 
                SET current_epoch = ?, accuracy = ?, loss = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `).run(i, 0.1 + (i * 0.04), 1.0 - (i * 0.04), modelId);
              
              return { operation: i, success: true };
            } catch (error) {
              return { operation: i, success: false, error: (error as Error).message };
            }
          })()
        );
      }

      const results = await Promise.all(operations);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      // Should handle some failures gracefully
      expect(successCount).toBeGreaterThan(15); // Most should succeed
      expect(failureCount).toBeLessThan(5); // Some failures are expected
    }, 30000);
  });

  describe('Memory and Performance', () => {
    it('should maintain performance during long training sessions', async () => {
      const startTime = Date.now();
      const initialMemory = process.memoryUsage();
      
      // Simulate long training session
      const modelResult = testDb.prepare(`
        INSERT INTO models (name, type, dataset_id, status)
        VALUES ('Performance Test Model', 'persian-bert', 'test-dataset-1', 'training')
      `).run();
      const modelId = modelResult.lastInsertRowid;

      // Simulate 100 epochs of training
      for (let epoch = 1; epoch <= 100; epoch++) {
        // Update model
        testDb.prepare(`
          UPDATE models 
          SET current_epoch = ?, accuracy = ?, loss = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(epoch, 0.1 + (epoch * 0.008), 1.0 - (epoch * 0.008), modelId);
        
        // Log progress
        testDb.prepare(`
          INSERT INTO training_logs (model_id, level, message, epoch, loss, accuracy)
          VALUES (?, 'info', ?, ?, ?, ?)
        `).run(modelId, `Epoch ${epoch}/100 completed`, epoch, 1.0 - (epoch * 0.008), 0.1 + (epoch * 0.008));
        
        // Check memory every 20 epochs
        if (epoch % 20 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
          const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
          
          // Memory increase should be reasonable
          expect(memoryIncreaseMB).toBeLessThan(50);
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
      
      // Verify final state
      const finalModel = testDb.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
      expect(finalModel.current_epoch).toBe(100);
      expect(finalModel.accuracy).toBeCloseTo(0.9, 1);
    }, 15000);
  });
});