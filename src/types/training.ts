// Training System Types
export interface TrainingSession {
  id: string;
  name: string;
  modelType: 'dora' | 'qr-adaptor' | 'persian-bert';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'training';
  progress: TrainingProgress;
  metrics: TrainingMetrics;
  configuration: ModelConfiguration;
  checkpoints: ModelCheckpoint[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // Additional properties for UI compatibility
  accuracy?: number;
  gpu_usage?: number;
  memory_usage?: number;
  model_name?: string;
  dataset?: string;
  current_epoch?: number;
  total_epochs?: number;
  loss?: number;
  estimated_completion?: string;
  learning_rate?: number;
  batch_size?: number;
}

export interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  trainingLoss: number[];
  validationLoss: number[];
  validationAccuracy: number[];
  learningRate: number[];
  estimatedTimeRemaining: number;
  completionPercentage: number;
}

export interface TrainingMetrics {
  trainingSpeed: number; // steps per second
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  gpuUsage: number; // percentage
  batchSize: number;
  throughput: number; // samples per second
  convergenceRate: number;
  efficiency: number;
}

export interface ModelConfiguration {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'adamw' | 'sgd';
  scheduler: 'cosine' | 'linear' | 'exponential';
  warmupSteps: number;
  weightDecay: number;
  dropout: number;
  // DoRA specific
  doraConfig?: DoRAConfiguration;
  // QR-Adaptor specific
  qrConfig?: QRAdaptorConfig;
  // Persian BERT specific
  bertConfig?: PersianBertConfig;
}

export interface DoRAConfiguration {
  rank: number;
  alpha: number;
  targetModules: string[];
  magnitudeVector: boolean;
  directionMatrix: boolean;
  decompositionMethod: 'svd' | 'qr' | 'eigen';
  adaptiveRank: boolean;
  rankReduction: number;
}

export interface QRAdaptorConfig {
  quantizationBits: 4 | 8 | 16;
  compressionRatio: number;
  jointOptimization: boolean;
  precisionMode: 'nf4' | 'int8' | 'fp16';
  rankOptimization: boolean;
  dynamicRank: boolean;
}

export interface PersianBertConfig {
  modelSize: 'base' | 'large';
  vocabSize: number;
  maxSequenceLength: number;
  hiddenSize: number;
  numAttentionHeads: number;
  numLayers: number;
  persianTokenization: boolean;
  legalDomainPretraining: boolean;
}

export interface ModelCheckpoint {
  id: string;
  sessionId: string;
  epoch: number;
  step: number;
  loss: number;
  accuracy: number;
  modelState: any;
  timestamp: Date;
  size: number; // bytes
  description: string;
}

export interface QueuedTraining {
  id: string;
  name: string;
  modelType: 'dora' | 'qr-adaptor' | 'persian-bert';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // minutes
  estimated_duration?: number; // minutes (alternative naming)
  queuedAt: Date;
  configuration: ModelConfiguration;
  userId: string;
  // Additional properties for UI compatibility
  model_name?: string;
  dataset?: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  storageUsage: number;
  networkUsage: number;
  activeTrainingSessions: number;
  totalDocuments: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  uptime: number;
  lastUpdate: Date;
}