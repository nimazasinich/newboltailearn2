// WebSocket Event Types and Contracts
export type WSEventType =
  | 'system_metrics'
  | 'training_progress'
  | 'training_complete'
  | 'training_error'
  | 'log_update'
  | 'model_update'
  | 'dataset_update'
  | 'health_check'
  | 'notification';

export interface WSEvent<T = any> {
  type: WSEventType;
  data: T;
  timestamp?: number;
  id?: string;
}

// Specific event data types
export interface SystemMetricsData {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  training: {
    active: number;
    total: number;
    completed: number;
  };
}

export interface TrainingProgressData {
  sessionId: string;
  modelId: string;
  epoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
  progress: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
}

export interface LogUpdateData {
  level: 'info' | 'warning' | 'error' | 'debug';
  category: string;
  message: string;
  timestamp: string;
  metadata?: any;
}

export interface ModelUpdateData {
  id: string | number;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'failed';
  accuracy: number;
  loss: number;
  epochs: number;
  current_epoch: number;
}

export interface NotificationData {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  category: 'system' | 'training' | 'model' | 'dataset' | 'user';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Event handler types
export type WSEventHandler<T = any> = (data: T) => void;
export type WSEventSubscription = () => void;

// Connection status
export type WSConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket configuration
export interface WSConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}
