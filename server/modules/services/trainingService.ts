import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { getRealTrainingEngine } from '../../training/RealTrainingEngineImpl';
import { config, isDemoMode } from '../security/config';
import { WorkerManager } from '../workers/trainingWorker';
import { 
  TrainingRequest, 
  TrainingProgress as WorkerTrainingProgress, 
  TrainingResult,
  EvaluationRequest,
  EvaluationResult,
  PreprocessingRequest,
  PreprocessingResult,
  OptimizationRequest,
  OptimizationResult
} from '../workers/types';

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
  private workerManager: WorkerManager | null = null;
  private activeTrainingSessions = new Map<number, boolean>();
  private performanceMetrics = {
    mainThreadResponseTime: 0,
    workerMemoryUsage: 0,
    messagePassingLatency: 0,
    trainingThroughput: 0
  };

  constructor(db: Database.Database, io: Server) {
    this.db = db;
    this.io = io;
    this.trainingEngine = getRealTrainingEngine();
    
    // Initialize worker manager if workers are enabled
    if (config.USE_WORKERS) {
      this.workerManager = new WorkerManager(4);
      console.log('✅ Worker threads enabled for training operations');
    } else {
      console.log('⚠️  Worker threads disabled - training will run in main thread');
    }
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
    const startTime = Date.now();
    
    try {
      // Use worker threads if enabled, otherwise fallback to main thread
      if (this.workerManager && (config as any).USE_WORKERS) {
        await this.runTrainingWithWorkers(modelId, datasetId, config, sessionId);
      } else {
        await this.runTrainingInMainThread(modelId, datasetId, config, sessionId);
      }
      
      // Update performance metrics
      this.performanceMetrics.mainThreadResponseTime = Date.now() - startTime;
      
    } catch (error) {
      this.handleTrainingError(modelId, sessionId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Run training using worker threads
   */
  private async runTrainingWithWorkers(
    modelId: number,
    datasetId: string,
    config: TrainingConfig,
    sessionId: number
  ): Promise<void> {
    if (!this.workerManager) {
      throw new Error('Worker manager not initialized');
    }

    const trainingRequest: TrainingRequest = {
      modelId,
      datasetId,
      config: {
        ...config,
        modelType: 'persian-bert' // Default model type
      },
      sessionId,
      userId: 1 // Default user ID
    };

    // Set up progress monitoring
    const progressInterval = setInterval(() => {
      this.monitorWorkerPerformance();
    }, 1000);

    try {
      // Execute training in worker thread
      const result: TrainingResult = await this.workerManager.trainModel(trainingRequest);
      
      // Update database with final results
      this.db.prepare(`
        UPDATE models 
        SET accuracy = ?, loss = ?, epochs = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(result.finalAccuracy, result.finalLoss, result.totalEpochs, modelId);

      // Update training session
      this.db.prepare(`
        UPDATE training_sessions 
        SET final_accuracy = ?, final_loss = ?, total_epochs = ?, 
            training_duration_seconds = ?, result = ?
        WHERE id = ?
      `).run(
        result.finalAccuracy,
        result.finalLoss,
        result.totalEpochs,
        Math.floor(result.trainingDuration / 1000),
        JSON.stringify(result.metrics),
        sessionId
      );

      // Training completed successfully
      this.handleTrainingComplete(modelId, sessionId);
      
    } finally {
      clearInterval(progressInterval);
    }
  }

  /**
   * Run training in main thread (fallback)
   */
  private async runTrainingInMainThread(
    modelId: number,
    datasetId: string,
    config: TrainingConfig,
    sessionId: number
  ): Promise<void> {
    // Initialize model
    await this.trainingEngine.initializeModel({ numClasses: 3, modelType: 'persian-bert' }); // 3 classes for legal text

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
    await this.trainingEngine.train(modelId.toString(), datasetId, config, progressCallback as any);

    // Training completed successfully
    this.handleTrainingComplete(modelId, sessionId);
  }

  /**
   * Monitor worker performance metrics
   */
  private monitorWorkerPerformance(): void {
    if (!this.workerManager) return;

    const metrics = this.workerManager.getWorkerMetrics();
    
    if (metrics.length > 0) {
      const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
      const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;
      
      this.performanceMetrics.workerMemoryUsage = avgMemoryUsage;
      this.performanceMetrics.trainingThroughput = metrics.reduce((sum, m) => sum + m.completedTasks, 0);
      
      // Emit performance metrics via Socket.IO
      this.io.emit('worker_metrics', {
        memoryUsage: avgMemoryUsage,
        cpuUsage: avgCpuUsage,
        activeWorkers: metrics.filter(m => m.activeTasks > 0).length,
        totalWorkers: metrics.length,
        timestamp: new Date().toISOString()
      });
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

      const progress: any = {
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

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      workersEnabled: !!this.workerManager,
      activeSessions: this.activeTrainingSessions.size
    };
  }

  /**
   * Evaluate model using worker threads
   */
  async evaluateModel(request: EvaluationRequest): Promise<EvaluationResult> {
    if (!this.workerManager) {
      throw new Error('Worker manager not initialized');
    }
    
    return this.workerManager.evaluateModel(request);
  }

  /**
   * Preprocess data using worker threads
   */
  async preprocessData(request: PreprocessingRequest): Promise<PreprocessingResult> {
    if (!this.workerManager) {
      throw new Error('Worker manager not initialized');
    }
    
    return this.workerManager.preprocessData(request);
  }

  /**
   * Optimize hyperparameters using worker threads
   */
  async optimizeHyperparameters(request: OptimizationRequest): Promise<OptimizationResult> {
    if (!this.workerManager) {
      throw new Error('Worker manager not initialized');
    }
    
    return this.workerManager.optimizeHyperparameters(request);
  }

  /**
   * Get worker metrics
   */
  getWorkerMetrics() {
    if (!this.workerManager) {
      return [];
    }
    
    return this.workerManager.getWorkerMetrics();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.workerManager) {
      await this.workerManager.terminate();
    }
  }
}