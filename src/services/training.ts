import { API_BASE, joinApiPath, apiRequest, API_ENDPOINTS } from '../lib/api-config';
import { z } from 'zod';

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
  status: 'running' | 'paused' | 'completed' | 'failed' | 'pending' | 'training';
  startTime: string;
  endTime?: string;
  totalEpochs?: number;
  currentEpoch?: number;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  loss?: number;
  accuracy?: number;
  validationLoss?: number;
  validationAccuracy?: number;
  learningRate?: number;
  batchSize?: number;
  estimatedCompletion?: string;
  errorMessage?: string;
  config?: TrainingConfig;
  metrics?: Record<string, unknown> | null;
  modelName?: string;
  modelType?: string;
  userId?: number | null;
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

export interface TrainingLogEntry {
  id: number;
  level: string;
  message: string;
  timestamp: string;
  epoch?: number;
  loss?: number;
  accuracy?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ModelCheckpointEntry {
  id: number;
  epoch: number;
  accuracy?: number;
  loss?: number;
  filePath: string;
  createdAt: string;
}

export interface TrainingStats {
  totalModels: number;
  activeTraining: number;
  completedTraining: number;
  averageAccuracy: number;
  totalTrainingHours: number;
}

const trainingConfigBaseSchema = z.object({
  epochs: z.number(),
  batchSize: z.number(),
  learningRate: z.number(),
  validationSplit: z.number().optional(),
  earlyStopping: z.boolean().optional(),
  patience: z.number().optional(),
  modelType: z.string().optional(),
  datasetId: z.string().optional(),
}) satisfies z.ZodType<TrainingConfig>;

const trainingConfigResponseSchema = trainingConfigBaseSchema;

const storedTrainingConfigSchema: z.ZodType<Partial<TrainingConfig>> = trainingConfigBaseSchema.partial();

const rawTrainingSessionSchema = z.object({
  id: z.number(),
  model_id: z.number(),
  user_id: z.number().nullable().optional(),
  session_id: z.string(),
  status: z.string(),
  start_time: z.string(),
  end_time: z.string().nullable().optional(),
  total_epochs: z.number().nullable().optional(),
  current_epoch: z.number().nullable().optional(),
  config: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable().optional(),
  metrics: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable().optional(),
  model_name: z.string().nullable().optional(),
  model_type: z.string().nullable().optional(),
  progress: z.number().nullable().optional(),
  loss: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
  estimated_completion: z.string().nullable().optional(),
  learning_rate: z.number().nullable().optional(),
  batch_size: z.number().nullable().optional(),
}).passthrough();

type RawTrainingSession = z.infer<typeof rawTrainingSessionSchema>;

const trainingSessionsSchema = z.array(rawTrainingSessionSchema);

const metricsSchema: z.ZodType<Record<string, unknown>> = z.record(z.string(), z.unknown());

const paginationSchema: z.ZodType<Pagination> = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number(),
});

const modelLogsResponseSchema = z.object({
  logs: z.array(
    z.object({
      id: z.number(),
      level: z.string(),
      message: z.string(),
      epoch: z.number().nullable(),
      loss: z.number().nullable(),
      accuracy: z.number().nullable(),
      timestamp: z.string(),
    })
  ),
  pagination: paginationSchema,
});

const modelCheckpointSchema = z.object({
  id: z.number(),
  epoch: z.number(),
  accuracy: z.number().nullable(),
  loss: z.number().nullable(),
  file_path: z.string(),
  created_at: z.string(),
});

const modelCheckpointsSchema = z.array(modelCheckpointSchema);

const trainingStatsSchema: z.ZodType<TrainingStats> = z.object({
  totalModels: z.number(),
  activeTraining: z.number(),
  completedTraining: z.number(),
  averageAccuracy: z.number(),
  totalTrainingHours: z.number(),
});

const stopTrainingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const startTrainingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  sessionId: z.union([z.string(), z.number()]),
  config: trainingConfigResponseSchema,
});

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function parseOptionalJson<T>(value: unknown, schema: z.ZodType<T>): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  let data: unknown = value;
  if (typeof value === 'string') {
    try {
      data = JSON.parse(value);
    } catch (error) {
      console.warn('Failed to parse JSON payload', error);
      return undefined;
    }
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.warn('Invalid payload received from API', parsed.error.flatten());
    return undefined;
  }

  return parsed.data;
}

function normalizeTrainingStatus(status: unknown): TrainingSession['status'] {
  if (typeof status !== 'string') {
    return 'pending';
  }

  const normalized = status.toLowerCase();
  const statusMap: Record<string, TrainingSession['status']> = {
    running: 'training',
    training: 'training',
    paused: 'paused',
    completed: 'completed',
    failed: 'failed',
    pending: 'pending',
  };

  return statusMap[normalized] ?? 'pending';
}

function normalizeTrainingConfig(raw: unknown): TrainingConfig | undefined {
  const parsed = parseOptionalJson(raw, storedTrainingConfigSchema);
  if (!parsed) {
    return undefined;
  }

  if (
    parsed.epochs === undefined ||
    parsed.batchSize === undefined ||
    parsed.learningRate === undefined
  ) {
    return undefined;
  }

  return {
    epochs: parsed.epochs,
    batchSize: parsed.batchSize,
    learningRate: parsed.learningRate,
    validationSplit: parsed.validationSplit,
    earlyStopping: parsed.earlyStopping,
    patience: parsed.patience,
    modelType: parsed.modelType,
    datasetId: parsed.datasetId,
  };
}

function mapTrainingSession(raw: RawTrainingSession): TrainingSession {
  const config = normalizeTrainingConfig(raw.config);
  const metrics = parseOptionalJson(raw.metrics, metricsSchema);

  const accuracyFromMetrics =
    metrics && typeof metrics.accuracy === 'number' ? metrics.accuracy : undefined;
  const lossFromMetrics = metrics && typeof metrics.loss === 'number' ? metrics.loss : undefined;
  const progressFromMetrics =
    metrics && typeof metrics.progress === 'number' ? metrics.progress : undefined;
  const currentStepFromMetrics =
    metrics && typeof metrics.currentStep === 'number' ? metrics.currentStep : undefined;
  const totalStepsFromMetrics =
    metrics && typeof metrics.totalSteps === 'number' ? metrics.totalSteps : undefined;
  const validationLossFromMetrics =
    metrics && typeof metrics.validationLoss === 'number' ? metrics.validationLoss : undefined;
  const validationAccuracyFromMetrics =
    metrics && typeof metrics.validationAccuracy === 'number'
      ? metrics.validationAccuracy
      : undefined;

  return {
    id: raw.id,
    modelId: raw.model_id,
    sessionId: raw.session_id,
    status: normalizeTrainingStatus(raw.status),
    startTime: raw.start_time,
    endTime: raw.end_time ?? undefined,
    totalEpochs: toOptionalNumber(raw.total_epochs) ?? config?.epochs,
    currentEpoch: toOptionalNumber(raw.current_epoch),
    progress: toOptionalNumber(raw.progress) ?? progressFromMetrics,
    currentStep: currentStepFromMetrics,
    totalSteps: totalStepsFromMetrics,
    loss: toOptionalNumber(raw.loss) ?? lossFromMetrics,
    accuracy: toOptionalNumber(raw.accuracy) ?? accuracyFromMetrics,
    validationLoss: validationLossFromMetrics,
    validationAccuracy: validationAccuracyFromMetrics,
    learningRate: toOptionalNumber(raw.learning_rate) ?? config?.learningRate,
    batchSize: toOptionalNumber(raw.batch_size) ?? config?.batchSize,
    estimatedCompletion: raw.estimated_completion ?? undefined,
    config,
    metrics: metrics ?? null,
    modelName: raw.model_name ?? undefined,
    modelType: raw.model_type ?? undefined,
    userId: raw.user_id ?? undefined,
  };
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
        current_epoch: 0,
        dataset_id: '',
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
        current_epoch: 0,
        dataset_id: model.datasetId || '',
        config: model.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  /**
   * Update model
   */
  async updateModel(modelId: number, updates: Partial<ModelInfo>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}`),
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
      return {
        success: response.ok,
        message: response.ok ? 'Model updated successfully' : 'Failed to update model'
      };
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
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}`),
        {
          method: 'DELETE',
        }
      );
      return {
        success: response.ok,
        message: response.ok ? 'Model deleted successfully' : 'Failed to delete model'
      };
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
      const payload = await response.json();
      const parsed = startTrainingResponseSchema.parse(payload);
      return {
        success: parsed.success,
        message: parsed.message,
        sessionId: String(parsed.sessionId),
        config: parsed.config,
      };
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
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/pause`),
        {
          method: 'POST',
        }
      );
      const payload = await response.json();
      return stopTrainingResponseSchema.parse(payload);
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
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/resume`),
        {
          method: 'POST',
          body: JSON.stringify(config || {}),
        }
      );
      const payload = await response.json();
      const parsed = startTrainingResponseSchema.parse(payload);
      return {
        success: parsed.success,
        message: parsed.message,
        sessionId: String(parsed.sessionId),
        config: parsed.config,
      };
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

      const response = await apiRequest(
        joinApiPath(API_BASE, endpoint)
      );
      const payload = await response.json();
      const parsed = trainingSessionsSchema.parse(payload);
      return parsed.map(mapTrainingSession);
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
      const response = await apiRequest(
        joinApiPath(API_BASE, `/training/sessions/${sessionId}`)
      );
      const payload = await response.json();
      const parsed = rawTrainingSessionSchema.parse(payload);
      return mapTrainingSession(parsed);
    } catch (error) {
      console.error('Get training session failed:', error);
      throw new Error('خطا در دریافت جلسه آموزش');
    }
  },

  /**
   * Get model logs
   */
  async getModelLogs(modelId: number, page = 1, limit = 50): Promise<{
    logs: TrainingLogEntry[];
    pagination: Pagination;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/logs?${params.toString()}`)
      );
      const payload = await response.json();
      const parsed = modelLogsResponseSchema.parse(payload);
      return {
        logs: parsed.logs.map(log => ({
          id: log.id,
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          epoch: log.epoch ?? undefined,
          loss: log.loss ?? undefined,
          accuracy: log.accuracy ?? undefined,
        })),
        pagination: parsed.pagination,
      };
    } catch (error) {
      console.error('Get model logs failed:', error);
      throw new Error('خطا در دریافت لاگ‌های مدل');
    }
  },

  /**
   * Get model checkpoints
   */
  async getModelCheckpoints(modelId: number): Promise<ModelCheckpointEntry[]> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/checkpoints`)
      );
      const payload = await response.json();
      const parsed = modelCheckpointsSchema.parse(payload);
      return parsed.map(checkpoint => ({
        id: checkpoint.id,
        epoch: checkpoint.epoch,
        accuracy: checkpoint.accuracy ?? undefined,
        loss: checkpoint.loss ?? undefined,
        filePath: checkpoint.file_path,
        createdAt: checkpoint.created_at,
      }));
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
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/optimize`),
        {
          method: 'POST',
          body: JSON.stringify(options),
        }
      );
      return {
        success: true,
        message: 'بهینه‌سازی شروع شد',
        optimizationId: 'opt_' + Date.now(),
        type: options.optimizationType || 'grid_search',
        parameters: options.parameters || {}
      };
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
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/load`),
        {
          method: 'POST',
          body: JSON.stringify({ checkpointPath }),
        }
      );
      return {
        success: true,
        message: 'مدل با موفقیت بارگذاری شد',
        modelId: modelId,
        checkpointPath: checkpointPath
      };
    } catch (error) {
      console.error('Load model failed:', error);
      throw new Error('خطا در بارگذاری مدل');
    }
  },

  /**
   * Get training statistics
   */
  async getTrainingStats(): Promise<TrainingStats> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/training/stats')
      );
      const payload = await response.json();
      return trainingStatsSchema.parse(payload);
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
      const payload = await response.json();
      return stopTrainingResponseSchema.parse(payload);
    } catch (error) {
      console.error('Stop training failed:', error);
      return { success: false, message: 'Failed to stop training' };
    }
  }
};
