import { API_BASE, joinApiPath, apiRequest, API_ENDPOINTS } from '../lib/api-config';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit?: number;
  earlyStopping?: boolean;
  patience?: number;
  modelType?: string;
  datasetId?: string;
}

export interface TrainingSession {
  id: number;
  modelId: number;
  sessionId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'pending';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  loss: number;
  accuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
  learningRate: number;
  batchSize: number;
  startTime: string;
  endTime?: string;
  estimatedCompletion?: string;
  errorMessage?: string;
  config: TrainingConfig;
  metrics?: any;
}

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
  timestamp: string;
  progress: number;
}

export interface ModelInfo {
  id: number;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'error';
  accuracy?: number;
  loss?: number;
  epochs?: number;
  current_epoch?: number;
  dataset_id?: string;
  config?: any;
  created_at: string;
  updated_at: string;
  description?: string;
  category?: string;
}

export const trainingService = {
  /**
   * Get all models
   */
  async getModels(page = 1, limit = 10): Promise<{ models: ModelInfo[]; pagination: any }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiRequest(
        joinApiPath(API_BASE, `${API_ENDPOINTS.MODELS}?${params.toString()}`)
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get models failed:', error);
      // Return fallback data for offline mode
      return {
        models: [],
        pagination: { page, limit, total: 0, pages: 0 }
      };
    }
  },

  /**
   * Get specific model
   */
  async getModel(modelId: number): Promise<ModelInfo> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_BY_ID(modelId.toString()))
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get model failed:', error);
      // Return fallback model data
      return {
        id: modelId,
        name: 'مدل پیش‌فرض',
        type: 'persian-bert',
        status: 'idle',
        accuracy: 0,
        loss: 0,
        epochs: 0,
        currentEpoch: 0,
        datasetId: '',
        config: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * Create new model
   */
  async createModel(model: { name: string; type: string; datasetId?: string; config?: any }): Promise<ModelInfo> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODELS),
        {
          method: 'POST',
          body: JSON.stringify(model),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create model failed:', error);
      // Return a mock created model for offline mode
      return {
        id: Date.now(),
        name: model.name,
        type: model.type,
        status: 'idle',
        accuracy: 0,
        loss: 0,
        epochs: 0,
        currentEpoch: 0,
        datasetId: model.datasetId || '',
        config: model.config || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * Update model
   */
  async updateModel(modelId: number, updates: Partial<ModelInfo>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        joinApiPath(API_BASE, `/models/${modelId}`),
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
      return response;
    } catch (error) {
      console.error('Update model failed:', error);
      throw new Error('خطا در به‌روزرسانی مدل');
    }
  },

  /**
   * Delete model
   */
  async deleteModel(modelId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        joinApiPath(API_BASE, `/models/${modelId}`),
        {
          method: 'DELETE',
        }
      );
      return response;
    } catch (error) {
      console.error('Delete model failed:', error);
      throw new Error('خطا در حذف مدل');
    }
  },

  /**
   * Start training
   */
  async startTraining(modelId: number, config: TrainingConfig): Promise<{
    success: boolean;
    message: string;
    sessionId: string;
    config: TrainingConfig;
  }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_TRAIN(modelId.toString())),
        {
          method: 'POST',
          body: JSON.stringify(config),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Start training failed:', error);
      // Return mock training session for offline mode
      return {
        success: true,
        message: 'آموزش در حالت آفلاین شروع شد',
        sessionId: `session_${Date.now()}`,
        config
      };
    }
  },

  /**
   * Pause training
   */
  async pauseTraining(modelId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        joinApiPath(API_BASE, `/models/${modelId}/pause`),
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      console.error('Pause training failed:', error);
      throw new Error('خطا در توقف آموزش');
    }
  },

  /**
   * Resume training
   */
  async resumeTraining(modelId: number, config?: Partial<TrainingConfig>): Promise<{
    success: boolean;
    message: string;
    sessionId: string;
    config: TrainingConfig;
  }> {
    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        sessionId: string;
        config: TrainingConfig;
      }>(
        joinApiPath(API_BASE, `/models/${modelId}/resume`),
        {
          method: 'POST',
          body: JSON.stringify(config || {}),
        }
      );
      return response;
    } catch (error) {
      console.error('Resume training failed:', error);
      throw new Error('خطا در ادامه آموزش');
    }
  },

  /**
   * Get training sessions
   */
  async getTrainingSessions(modelId?: number): Promise<TrainingSession[]> {
    try {
      const endpoint = modelId 
        ? `/models/${modelId}/sessions`
        : '/training/sessions';

      const response = await apiRequest<TrainingSession[]>(
        joinApiPath(API_BASE, endpoint)
      );
      return response;
    } catch (error) {
      console.error('Get training sessions failed:', error);
      throw new Error('خطا در دریافت جلسات آموزش');
    }
  },

  /**
   * Get training session by ID
   */
  async getTrainingSession(sessionId: string): Promise<TrainingSession> {
    try {
      const response = await apiRequest<TrainingSession>(
        joinApiPath(API_BASE, `/training/sessions/${sessionId}`)
      );
      return response;
    } catch (error) {
      console.error('Get training session failed:', error);
      throw new Error('خطا در دریافت جلسه آموزش');
    }
  },

  /**
   * Get model logs
   */
  async getModelLogs(modelId: number, page = 1, limit = 50): Promise<{
    logs: Array<{
      id: number;
      level: string;
      message: string;
      epoch?: number;
      loss?: number;
      accuracy?: number;
      timestamp: string;
    }>;
    pagination: any;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiRequest<{
        logs: Array<{
          id: number;
          level: string;
          message: string;
          epoch?: number;
          loss?: number;
          accuracy?: number;
          timestamp: string;
        }>;
        pagination: any;
      }>(
        joinApiPath(API_BASE, `/models/${modelId}/logs?${params.toString()}`)
      );
      return response;
    } catch (error) {
      console.error('Get model logs failed:', error);
      throw new Error('خطا در دریافت لاگ‌های مدل');
    }
  },

  /**
   * Get model checkpoints
   */
  async getModelCheckpoints(modelId: number): Promise<Array<{
    id: number;
    epoch: number;
    accuracy: number;
    loss: number;
    filePath: string;
    createdAt: string;
  }>> {
    try {
      const response = await apiRequest<Array<{
        id: number;
        epoch: number;
        accuracy: number;
        loss: number;
        filePath: string;
        createdAt: string;
      }>>(
        joinApiPath(API_BASE, `/models/${modelId}/checkpoints`)
      );
      return response;
    } catch (error) {
      console.error('Get model checkpoints failed:', error);
      throw new Error('خطا در دریافت checkpoint های مدل');
    }
  },

  /**
   * Start hyperparameter optimization
   */
  async startOptimization(modelId: number, options: {
    optimizationType?: string;
    parameters?: any;
  } = {}): Promise<{
    success: boolean;
    message: string;
    optimizationId: string;
    type: string;
    parameters: any;
  }> {
    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        optimizationId: string;
        type: string;
        parameters: any;
      }>(
        joinApiPath(API_BASE, `/models/${modelId}/optimize`),
        {
          method: 'POST',
          body: JSON.stringify(options),
        }
      );
      return response;
    } catch (error) {
      console.error('Start optimization failed:', error);
      throw new Error('خطا در شروع بهینه‌سازی');
    }
  },

  /**
   * Load model from checkpoint
   */
  async loadModel(modelId: number, checkpointPath: string): Promise<{
    success: boolean;
    message: string;
    modelId: number;
    checkpointPath: string;
  }> {
    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        modelId: number;
        checkpointPath: string;
      }>(
        joinApiPath(API_BASE, `/models/${modelId}/load`),
        {
          method: 'POST',
          body: JSON.stringify({ checkpointPath }),
        }
      );
      return response;
    } catch (error) {
      console.error('Load model failed:', error);
      throw new Error('خطا در بارگذاری مدل');
    }
  },

  /**
   * Get training statistics
   */
  async getTrainingStats(): Promise<{
    totalModels: number;
    activeTraining: number;
    completedTraining: number;
    averageAccuracy: number;
    totalTrainingHours: number;
  }> {
    try {
      const response = await apiRequest<{
        totalModels: number;
        activeTraining: number;
        completedTraining: number;
        averageAccuracy: number;
        totalTrainingHours: number;
      }>(
        joinApiPath(API_BASE, '/training/stats')
      );
      return response;
    } catch (error) {
      console.error('Get training stats failed:', error);
      // Return fallback data
      return {
        totalModels: 0,
        activeTraining: 0,
        completedTraining: 0,
        averageAccuracy: 0,
        totalTrainingHours: 0
      };
    }
  },

  /**
   * Get datasets
   */
  async getDatasets(): Promise<{ datasets: any[] }> {
    try {
      const response = await apiRequest(joinApiPath(API_BASE, '/datasets'));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get datasets failed:', error);
      return { datasets: [] };
    }
  },

  /**
   * Stop training
   */
  async stopTraining(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/training/${sessionId}/stop`),
        { method: 'POST' }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Stop training failed:', error);
      return { success: false, message: 'Failed to stop training' };
    }
  }
};
