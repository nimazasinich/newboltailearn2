/**
 * TypeScript interfaces for worker thread message passing
 * Phase 4 - Worker Threads Implementation
 */

export interface WorkerMessage {
  id: string;
  type: WorkerMessageType;
  data: any;
  timestamp: string;
}

export type WorkerMessageType = 
  | 'TRAIN_MODEL'
  | 'EVALUATE_MODEL'
  | 'PREPROCESS_DATA'
  | 'OPTIMIZE_HYPERPARAMETERS'
  | 'PROGRESS_UPDATE'
  | 'ERROR'
  | 'COMPLETE'
  | 'TERMINATE';

export interface TrainingRequest {
  modelId: number;
  datasetId: string;
  config: TrainingConfig;
  sessionId: number;
  userId: number;
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit?: number;
  earlyStopping?: boolean;
  patience?: number;
  maxSequenceLength?: number;
  vocabSize?: number;
  modelType: 'dora' | 'qr-adaptor' | 'persian-bert';
}

export interface TrainingProgress {
  modelId: number;
  sessionId: number;
  epoch: number;
  totalEpochs: number;
  step: number;
  totalSteps: number;
  loss: number;
  accuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
  completionPercentage: number;
  estimatedTimeRemaining: number;
  timestamp: string;
}

export interface TrainingResult {
  modelId: number;
  sessionId: number;
  finalAccuracy: number;
  finalLoss: number;
  totalEpochs: number;
  trainingDuration: number;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  };
  timestamp: string;
}

export interface EvaluationRequest {
  modelId: number;
  testDatasetId: string;
  metrics: string[];
}

export interface EvaluationResult {
  modelId: number;
  testDatasetId: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  };
  timestamp: string;
}

export interface PreprocessingRequest {
  datasetId: string;
  options: {
    tokenization: boolean;
    normalization: boolean;
    vectorization: boolean;
    maxLength?: number;
  };
}

export interface PreprocessingResult {
  datasetId: string;
  outputPath: string;
  samples: number;
  features: number;
  preprocessingSteps: Array<{
    step: string;
    status: 'completed' | 'failed';
    timestamp: string;
  }>;
  timestamp: string;
}

export interface OptimizationRequest {
  modelId: number;
  searchSpace: {
    learningRate: { min: number; max: number; step: number };
    batchSize: number[];
    epochs: { min: number; max: number; step: number };
    dropout: { min: number; max: number; step: number };
  };
  maxTrials: number;
  objective: 'accuracy' | 'loss' | 'f1';
}

export interface OptimizationResult {
  modelId: number;
  trials: Array<{
    trial: number;
    params: Record<string, any>;
    score: number;
    metrics: {
      accuracy: number;
      loss: number;
      f1Score: number;
    };
  }>;
  bestParams: Record<string, any>;
  bestScore: number;
  timestamp: string;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  progress?: TrainingProgress;
  timestamp: string;
}

export interface WorkerMetrics {
  workerId: string;
  cpuUsage: number;
  memoryUsage: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  uptime: number;
  lastActivity: string;
}

export interface WorkerPoolConfig {
  maxWorkers: number;
  maxMemoryPerWorker: number; // MB
  maxTasksPerWorker: number;
  workerTimeout: number; // ms
  enableMetrics: boolean;
}

export interface WorkerPoolStatus {
  totalWorkers: number;
  activeWorkers: number;
  idleWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}