import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { EvaluationRequest, EvaluationResult, PreprocessingRequest, PreprocessingResult, OptimizationRequest, OptimizationResult } from '../workers/types';
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
export declare class TrainingService {
    private db;
    private io;
    private trainingEngine;
    private workerManager;
    private activeTrainingSessions;
    private performanceMetrics;
    constructor(db: Database.Database, io: Server);
    /**
     * Start real training for a model
     */
    startTraining(modelId: number, datasetId: string, config: TrainingConfig, userId: number): Promise<{
        success: boolean;
        sessionId?: number;
        error?: string;
    }>;
    /**
     * Run the actual training process
     */
    private runTraining;
    /**
     * Run training using worker threads
     */
    private runTrainingWithWorkers;
    /**
     * Run training in main thread (fallback)
     */
    private runTrainingInMainThread;
    /**
     * Monitor worker performance metrics
     */
    private monitorWorkerPerformance;
    /**
     * Handle training completion
     */
    private handleTrainingComplete;
    /**
     * Handle training error
     */
    private handleTrainingError;
    /**
     * Simulate training in demo mode
     */
    private simulateTraining;
    /**
     * Stop training
     */
    stopTraining(modelId: number): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get training status
     */
    getTrainingStatus(modelId: number): {
        isTraining: boolean;
        status?: string;
    };
    /**
     * Get active training sessions
     */
    getActiveSessions(): number[];
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        workersEnabled: boolean;
        activeSessions: number;
        mainThreadResponseTime: number;
        workerMemoryUsage: number;
        messagePassingLatency: number;
        trainingThroughput: number;
    };
    /**
     * Evaluate model using worker threads
     */
    evaluateModel(request: EvaluationRequest): Promise<EvaluationResult>;
    /**
     * Preprocess data using worker threads
     */
    preprocessData(request: PreprocessingRequest): Promise<PreprocessingResult>;
    /**
     * Optimize hyperparameters using worker threads
     */
    optimizeHyperparameters(request: OptimizationRequest): Promise<OptimizationResult>;
    /**
     * Get worker metrics
     */
    getWorkerMetrics(): any[];
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=trainingService.d.ts.map