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

type ModelStatus = 'idle' | 'training' | 'paused' | 'completed' | 'failed' | 'error';
type ModelType = 'persian-bert' | 'dora' | 'qr-adaptor';

export interface ModelConfig extends Record<string, unknown> {}

export interface ModelInfo {
  id: number;
  name: string;
  type: ModelType;
  status: ModelStatus;
  accuracy: number;
  loss: number;
  epochs: number;
  current_epoch: number;
  dataset_id?: string | null;
  config: ModelConfig | null;
  created_at: string;
  updated_at: string;
  description?: string | null;
  category?: string | null;
  created_by?: number | null;
}

export interface ModelListResponse {
  models: ModelInfo[];
  pagination: Pagination;
}

export interface DatasetInfo {
  id: string;
  name: string;
  source: string | null;
  status: 'available' | 'downloading' | 'processing' | 'error';
  type?: string | null;
  description?: string | null;
  huggingface_id?: string | null;
  samples: number;
  size_mb: number;
  local_path?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_used?: string | null;
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
const modelConfigSchema: z.ZodType<ModelConfig> = z.record(z.string(), z.unknown());

const rawModelSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    status: z.string(),
    accuracy: z.number().nullable().optional(),
    loss: z.number().nullable().optional(),
    epochs: z.number().nullable().optional(),
    current_epoch: z.number().nullable().optional(),
    dataset_id: z.union([z.string(), z.number()]).nullable().optional(),
    config: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    description: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    created_by: z.number().nullable().optional(),
  })
  .passthrough();

const rawModelListEnvelopeSchema = z
  .object({
    models: z.array(rawModelSchema),
    pagination: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
        pages: z.number().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough();

const rawDatasetSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    source: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    huggingface_id: z.string().nullable().optional(),
    samples: z.number().nullable().optional(),
    size_mb: z.number().nullable().optional(),
    local_path: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
    last_used: z.string().nullable().optional(),
  })
  .passthrough();

const rawDatasetListEnvelopeSchema = z
  .object({
    datasets: z.array(rawDatasetSchema),
  })
  .passthrough();

type RawModel = z.infer<typeof rawModelSchema>;
type RawDataset = z.infer<typeof rawDatasetSchema>;

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

function normalizeModelType(type: unknown): ModelType {
  if (typeof type === 'string') {
    const normalized = type.toLowerCase();
    if (normalized === 'persian-bert' || normalized === 'dora' || normalized === 'qr-adaptor') {
      return normalized;
    }
  }

  return 'persian-bert';
}

function normalizeModelStatus(status: unknown): ModelStatus {
  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    const statusMap: Record<string, ModelStatus> = {
      idle: 'idle',
      training: 'training',
      running: 'training',
      paused: 'paused',
      completed: 'completed',
      finished: 'completed',
      failed: 'failed',
      error: 'error',
    };

    if (statusMap[normalized]) {
      return statusMap[normalized];
    }
  }

  return 'idle';
}

function buildPagination(page: number, limit: number, total: number, pagesOverride?: number): Pagination {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : total || 1;
  const computedPages = safeLimit > 0 ? Math.max(1, Math.ceil(total / safeLimit)) : 1;

  return {
    page,
    limit: safeLimit,
    total,
    pages: pagesOverride && pagesOverride > 0 ? pagesOverride : computedPages,
  };
}

function mapModel(raw: RawModel): ModelInfo {
  const datasetId = raw.dataset_id;
  const config = parseOptionalJson(raw.config, modelConfigSchema) ?? null;

  return {
    id: raw.id,
    name: raw.name,
    type: normalizeModelType(raw.type),
    status: normalizeModelStatus(raw.status),
    accuracy: toOptionalNumber(raw.accuracy) ?? 0,
    loss: toOptionalNumber(raw.loss) ?? 0,
    epochs: toOptionalNumber(raw.epochs) ?? 0,
    current_epoch: toOptionalNumber(raw.current_epoch) ?? 0,
    dataset_id:
      datasetId === undefined
        ? undefined
        : datasetId === null
        ? null
        : String(datasetId),
    config,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    description: raw.description ?? null,
    category: raw.category ?? null,
    created_by: raw.created_by ?? null,
  };
}

function normalizeDatasetStatus(status: unknown): DatasetInfo['status'] {
  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    const statusMap: Record<string, DatasetInfo['status']> = {
      available: 'available',
      downloading: 'downloading',
      processing: 'processing',
      queued: 'processing',
      error: 'error',
      failed: 'error',
    };

    if (statusMap[normalized]) {
      return statusMap[normalized];
    }
  }

  return 'available';
}

function mapDataset(raw: RawDataset): DatasetInfo {
  return {
    id: String(raw.id),
    name: raw.name,
    source: raw.source ?? null,
    status: normalizeDatasetStatus(raw.status),
    type: raw.type ?? null,
    description: raw.description ?? null,
    huggingface_id: raw.huggingface_id ?? null,
    samples: toOptionalNumber(raw.samples) ?? 0,
    size_mb: toOptionalNumber(raw.size_mb) ?? 0,
    local_path: raw.local_path ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
    last_used: raw.last_used ?? null,
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
  async getModels(page = 1, limit = 10): Promise<ModelListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiRequest(
        joinApiPath(API_BASE, `${API_ENDPOINTS.MODELS}?${params.toString()}`)
      );
      const payload = await response.json();

      const envelope = rawModelListEnvelopeSchema.safeParse(payload);
      if (envelope.success) {
        const models = envelope.data.models.map(mapModel);
        const paginationInput = envelope.data.pagination ?? {};
        const total = paginationInput.total ?? models.length;
        const pages = paginationInput.pages;
        const normalized = buildPagination(page, limit, total, pages);

        return {
          models,
          pagination: normalized,
        };
      }

      const arrayResult = z.array(rawModelSchema).safeParse(payload);
      if (arrayResult.success) {
        const models = arrayResult.data.map(mapModel);
        return {
          models,
          pagination: buildPagination(page, limit, models.length),
        };
      }

      console.warn('Unexpected models payload shape', payload);
      return {
        models: [],
        pagination: buildPagination(page, limit, 0),
      };
    } catch (error) {
      console.error('Get models failed:', error);
      return {
        models: [],
        pagination: buildPagination(page, limit, 0),
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
      const payload = await response.json();
      const parsed = rawModelSchema.parse(payload);
      return mapModel(parsed);
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
        config: {} as ModelConfig,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
        category: null,
        created_by: null,
      };
    }
  },

  /**
   * Create new model
   */
  async createModel(model: { name: string; type: ModelType; datasetId?: string; config?: ModelConfig }): Promise<ModelInfo> {
    try {
      const payload: Record<string, unknown> = {
        name: model.name,
        type: model.type,
        config: model.config ?? {},
      };

      if (model.datasetId) {
        payload.dataset_id = model.datasetId;
      }

      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODELS),
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      const parsed = rawModelSchema.parse(data);
      return mapModel(parsed);
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
        dataset_id: model.datasetId ?? null,
        config: (model.config ?? {}) as ModelConfig,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
        category: null,
        created_by: null,
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
    parameters?: Record<string, unknown>;
  } = {}): Promise<{
    success: boolean;
    message: string;
    optimizationId: string;
    type: string;
    parameters: Record<string, unknown>;
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
  async getDatasets(): Promise<{ datasets: DatasetInfo[] }> {
    try {
      const response = await apiRequest(joinApiPath(API_BASE, '/datasets'));
      const payload = await response.json();

      const envelope = rawDatasetListEnvelopeSchema.safeParse(payload);
      if (envelope.success) {
        return { datasets: envelope.data.datasets.map(mapDataset) };
      }

      const arrayResult = z.array(rawDatasetSchema).safeParse(payload);
      if (arrayResult.success) {
        return { datasets: arrayResult.data.map(mapDataset) };
      }

      console.warn('Unexpected datasets payload shape', payload);
      return { datasets: [] };
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
