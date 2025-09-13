import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { getRealTrainingEngine } from '../../training/RealTrainingEngineImpl.js';
import { config, isDemoMode } from '../security/config.js';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit?: number;
  earlyStopping?: boolean;
  patience?: number;
}

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
  timestamp: string;
}

export class TrainingService {
  private db: Database.Database;
  private io: Server;
  private trainingEngine: ReturnType<typeof getRealTrainingEngine>;
  private activeTrainingSessions = new Map<number, boolean>();

  constructor(db: Database.Database, io: Server) {
    this.db = db;
    this.io = io;
    this.trainingEngine = getRealTrainingEngine(db);
  }

  /**
   * Start real training for a model
   */
  async startTraining(
    modelId: number,
    datasetId: string,
    config: TrainingConfig,
    userId: number
  ): Promise<{ success: boolean; sessionId?: number; error?: string }> {
    try {
      // Check if model exists
      const model = this.db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
      if (!model) {
        return { success: false, error: 'Model not found' };
      }

      // Check if already training
      if (this.activeTrainingSessions.has(modelId)) {
        return { success: false, error: 'Model is already training' };
      }

      // In demo mode, simulate training
      if (isDemoMode()) {
        return this.simulateTraining(modelId, config, userId);
      }

      // Create training session
      const sessionResult = this.db.prepare(`
        INSERT INTO training_sessions (model_id, dataset_id, parameters, start_time, status, user_id)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'running', ?)
      `).run(modelId, datasetId, JSON.stringify(config), userId);

      const sessionId = sessionResult.lastInsertRowid as number;

      // Update model status
      this.db.prepare(`
        UPDATE models 
        SET status = 'training', current_epoch = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(modelId);

      // Mark as active
      this.activeTrainingSessions.set(modelId, true);

      // Start real training in background
      this.runTraining(modelId, datasetId, config, sessionId).catch(error => {
        console.error('Training failed:', error);
        this.handleTrainingError(modelId, sessionId, error.message);
      });

      return { success: true, sessionId };
    } catch (error) {
      console.error('Failed to start training:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Run the actual training process
   */
  private async runTraining(
    modelId: number,
    datasetId: string,
    config: TrainingConfig,
    sessionId: number
  ): Promise<void> {
    try {
      // Initialize model
      await this.trainingEngine.initializeModel(3); // 3 classes for legal text

      // Progress callback
      const progressCallback = (progress: TrainingProgress) => {
        // Update database
        this.db.prepare(`
          UPDATE models 
          SET current_epoch = ?, loss = ?, accuracy = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(progress.epoch, progress.loss, progress.accuracy, modelId);

        // Log progress
        this.db.prepare(`
          INSERT INTO training_logs (model_id, level, message, epoch, loss, accuracy, timestamp)
          VALUES (?, 'info', ?, ?, ?, ?, ?)
        `).run(
          modelId,
          `Epoch ${progress.epoch} completed`,
          progress.epoch,
          progress.loss,
          progress.accuracy,
          progress.timestamp
        );

        // Emit progress via Socket.IO
        this.io.emit('training_progress', {
          modelId,
          sessionId,
          progress
        });

        console.log(`Model ${modelId} - Epoch ${progress.epoch}: loss=${progress.loss.toFixed(4)}, accuracy=${progress.accuracy.toFixed(4)}`);
      };

      // Start training
      await this.trainingEngine.train(modelId, datasetId, config, progressCallback);

      // Training completed successfully
      this.handleTrainingComplete(modelId, sessionId);

    } catch (error) {
      this.handleTrainingError(modelId, sessionId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Handle training completion
   */
  private handleTrainingComplete(modelId: number, sessionId: number): void {
    // Update model status
    this.db.prepare(`
      UPDATE models 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(modelId);

    // Update session status
    this.db.prepare(`
      UPDATE training_sessions 
      SET status = 'completed', end_time = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(sessionId);

    // Log completion
    this.db.prepare(`
      INSERT INTO training_logs (model_id, level, message, timestamp)
      VALUES (?, 'info', 'Training completed successfully', CURRENT_TIMESTAMP)
    `).run(modelId);

    // Emit completion event
    this.io.emit('training_completed', {
      modelId,
      sessionId,
      message: 'Training completed successfully'
    });

    // Remove from active sessions
    this.activeTrainingSessions.delete(modelId);

    console.log(`Training completed for model ${modelId}`);
  }

  /**
   * Handle training error
   */
  private handleTrainingError(modelId: number, sessionId: number, error: string): void {
    // Update model status
    this.db.prepare(`
      UPDATE models 
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(modelId);

    // Update session status
    this.db.prepare(`
      UPDATE training_sessions 
      SET status = 'failed', end_time = CURRENT_TIMESTAMP, error_message = ?
      WHERE id = ?
    `).run(error, sessionId);

    // Log error
    this.db.prepare(`
      INSERT INTO training_logs (model_id, level, message, timestamp)
      VALUES (?, 'error', ?, CURRENT_TIMESTAMP)
    `).run(modelId, `Training failed: ${error}`);

    // Emit error event
    this.io.emit('training_failed', {
      modelId,
      sessionId,
      error
    });

    // Remove from active sessions
    this.activeTrainingSessions.delete(modelId);

    console.error(`Training failed for model ${modelId}: ${error}`);
  }

  /**
   * Simulate training in demo mode
   */
  private simulateTraining(
    modelId: number,
    config: TrainingConfig,
    userId: number
  ): { success: boolean; sessionId?: number; error?: string } {
    const sessionId = Date.now();

    // Simulate training progress
    let epoch = 0;
    const interval = setInterval(() => {
      epoch++;
      const loss = Math.max(0.1, 2.0 - (epoch / config.epochs) * 1.8);
      const accuracy = Math.min(0.95, (epoch / config.epochs) * 0.9);

      const progress: TrainingProgress = {
        epoch,
        loss,
        accuracy,
        validationLoss: loss * 1.1,
        validationAccuracy: accuracy * 0.95,
        timestamp: new Date().toISOString()
      };

      // Update database
      this.db.prepare(`
        UPDATE models 
        SET current_epoch = ?, loss = ?, accuracy = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(progress.epoch, progress.loss, progress.accuracy, modelId);

      // Emit progress
      this.io.emit('training_progress', {
        modelId,
        sessionId,
        progress
      });

      if (epoch >= config.epochs) {
        clearInterval(interval);
        this.handleTrainingComplete(modelId, sessionId);
      }
    }, 2000); // 2 seconds per epoch

    return { success: true, sessionId };
  }

  /**
   * Stop training
   */
  async stopTraining(modelId: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.activeTrainingSessions.has(modelId)) {
        return { success: false, error: 'No active training session found' };
      }

      // Stop the training engine
      this.trainingEngine.stopTraining();

      // Update model status
      this.db.prepare(`
        UPDATE models 
        SET status = 'stopped', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(modelId);

      // Log stop
      this.db.prepare(`
        INSERT INTO training_logs (model_id, level, message, timestamp)
        VALUES (?, 'info', 'Training stopped by user', CURRENT_TIMESTAMP)
      `).run(modelId);

      // Remove from active sessions
      this.activeTrainingSessions.delete(modelId);

      // Emit stop event
      this.io.emit('training_stopped', { modelId });

      return { success: true };
    } catch (error) {
      console.error('Failed to stop training:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get training status
   */
  getTrainingStatus(modelId: number): { isTraining: boolean; status?: string } {
    const isTraining = this.activeTrainingSessions.has(modelId);
    if (!isTraining) {
      const model = this.db.prepare('SELECT status FROM models WHERE id = ?').get(modelId) as any;
      return { isTraining: false, status: model?.status || 'idle' };
    }
    return { isTraining: true, status: 'training' };
  }

  /**
   * Get active training sessions
   */
  getActiveSessions(): number[] {
    return Array.from(this.activeTrainingSessions.keys());
  }
}