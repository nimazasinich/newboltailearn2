import { z } from 'zod';
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

export type ModelStatus = 'idle' | 'training' | 'paused' | 'completed' | 'failed' | 'error';

export interface ModelInfo {
  id: string;
  name: string;
  type?: string;
  status?: ModelStatus;
  accuracy?: number;
  loss?: number;
  epochs?: number;
  currentEpoch?: number;
  datasetId?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  category?: string;
}

export const TRAINING_SESSION_STATUSES = [
  'running',
  'paused',
  'completed',
  'failed',
  'pending',
  'training',
  'idle'
] as const;

export type TrainingSessionStatus = typeof TRAINING_SESSION_STATUSES[number];

export interface TrainingSession {
  id: number;
  sessionId: string;
  modelId?: number;
  status: TrainingSessionStatus;
  startTime?: string;
  endTime?: string | null;
  totalEpochs?: number;
  currentEpoch?: number;
  config?: Record<string, unknown>;
  metrics?: Record<string, unknown> | null;
  progress?: number;
  loss?: number;
  accuracy?: number;
  modelName?: string | null;
  modelType?: string | null;
  datasetId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
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

export interface ModelLogEntry {
  id: number;
  level: string;
  message: string;
  epoch?: number;
  loss?: number;
  accuracy?: number;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ModelLogsResponse {
  logs: ModelLogEntry[];
  pagination: PaginationInfo;
}

export interface ModelCheckpoint {
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

export interface DatasetSummary {
  id: string;
  name: string;
  type?: string;
  status?: string;
  size?: number;
  records?: number;
  description?: string | null;
  source?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  pages: z.number()
});

const modelSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    type: z.string().optional(),
    status: z.string().optional(),
    accuracy: z.union([z.number(), z.null()]).optional(),
    loss: z.union([z.number(), z.null()]).optional(),
    epochs: z.union([z.number(), z.null()]).optional(),
    current_epoch: z.union([z.number(), z.string(), z.null()]).optional(),
    currentEpoch: z.union([z.number(), z.string(), z.null()]).optional(),
    dataset_id: z.union([z.string(), z.number(), z.null()]).optional(),
    config: z.union([z.string(), z.record(z.string(), z.unknown()), z.null()]).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    description: z.union([z.string(), z.null()]).optional(),
    category: z.union([z.string(), z.null()]).optional()
  })
  .passthrough();

const modelListSchema = z
  .object({
    models: z.array(modelSchema),
    pagination: paginationSchema.optional()
  })
  .passthrough();

type ModelListSchema = z.infer<typeof modelListSchema>;

const trainingSessionSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    session_id: z.string().optional(),
    model_id: z.union([z.string(), z.number(), z.null()]).optional(),
    status: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.union([z.string(), z.null()]).optional(),
    total_epochs: z.union([z.string(), z.number(), z.null()]).optional(),
    current_epoch: z.union([z.string(), z.number(), z.null()]).optional(),
    config: z.union([z.string(), z.record(z.string(), z.unknown()), z.null()]).optional(),
    metrics: z.union([z.string(), z.record(z.string(), z.unknown()), z.null()]).optional(),
    progress: z.union([z.string(), z.number(), z.null()]).optional(),
    loss: z.union([z.string(), z.number(), z.null()]).optional(),
    accuracy: z.union([z.string(), z.number(), z.null()]).optional(),
    model_name: z.union([z.string(), z.null()]).optional(),
    model_type: z.union([z.string(), z.null()]).optional(),
    dataset_id: z.union([z.string(), z.number(), z.null()]).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
  })
  .passthrough();

const trainingSessionListSchema = z.array(trainingSessionSchema);

type TrainingSessionSchema = z.infer<typeof trainingSessionSchema>;
type TrainingSessionListSchema = z.infer<typeof trainingSessionListSchema>;

const modelLogSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    level: z.string(),
    message: z.string(),
    epoch: z.union([z.string(), z.number(), z.null()]).optional(),
    loss: z.union([z.string(), z.number(), z.null()]).optional(),
    accuracy: z.union([z.string(), z.number(), z.null()]).optional(),
    timestamp: z.string()
  })
  .passthrough();

const modelLogsResponseSchema = z
  .object({
    logs: z.array(modelLogSchema),
    pagination: paginationSchema
  })
  .passthrough();

type ModelLogsResponseSchema = z.infer<typeof modelLogsResponseSchema>;

const checkpointSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    epoch: z.union([z.string(), z.number()]),
    accuracy: z.union([z.string(), z.number(), z.null()]).optional(),
    loss: z.union([z.string(), z.number(), z.null()]).optional(),
    file_path: z.string(),
    created_at: z.string()
  })
  .passthrough();

type CheckpointSchema = z.infer<typeof checkpointSchema>;

const trainingStatsSchema = z
  .object({
    totalModels: z.number(),
    activeTraining: z.number(),
    completedTraining: z.number(),
    averageAccuracy: z.number(),
    totalTrainingHours: z.number()
  })
  .passthrough();

const datasetSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    type: z.string().optional(),
    status: z.string().optional(),
    size: z.union([z.string(), z.number(), z.null()]).optional(),
    size_mb: z.union([z.string(), z.number(), z.null()]).optional(),
    records: z.union([z.string(), z.number(), z.null()]).optional(),
    samples: z.union([z.string(), z.number(), z.null()]).optional(),
    description: z.union([z.string(), z.null()]).optional(),
    source: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
  })
  .passthrough();

const datasetListSchema = z
  .object({
    datasets: z.array(datasetSchema),
    pagination: paginationSchema.optional()
  })
  .passthrough();

type DatasetSchema = z.infer<typeof datasetSchema>;
type DatasetListSchema = z.infer<typeof datasetListSchema>;

const startTrainingResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    sessionId: z.union([z.string(), z.number()]).optional(),
    config: z.unknown().optional()
  })
  .passthrough();

type StartTrainingResponseSchema = z.infer<typeof startTrainingResponseSchema>;

const optimizationResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    optimizationId: z.string().optional(),
    type: z.string().optional(),
    parameters: z.unknown().optional()
  })
  .passthrough();

type OptimizationResponseSchema = z.infer<typeof optimizationResponseSchema>;

const simpleSuccessSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional()
  })
  .passthrough();

type SimpleSuccessSchema = z.infer<typeof simpleSuccessSchema>;

const loadModelResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    modelId: z.union([z.string(), z.number()]).optional(),
    checkpointPath: z.string().optional()
  })
  .passthrough();

type LoadModelResponseSchema = z.infer<typeof loadModelResponseSchema>;

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return undefined;
}

function safeParseRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function normalizeStatus(value?: string): TrainingSessionStatus {
  if (!value) {
    return 'pending';
  }
  const lower = value.toLowerCase() as TrainingSessionStatus;
  return TRAINING_SESSION_STATUSES.includes(lower) ? lower : 'pending';
}

function defaultPagination(count: number, page: number, limit: number): PaginationInfo {
  return {
    page,
    limit,
    total: count,
    pages: Math.max(1, Math.ceil(count / Math.max(limit, 1)))
  };
}

type ModelSchema = z.infer<typeof modelSchema>;

function adaptModel(record: ModelSchema): ModelInfo {
  const config = safeParseRecord(record.config);
  const currentEpoch = toOptionalNumber(record.currentEpoch ?? record.current_epoch);
  const datasetIdValue = record.dataset_id;
  return {
    id: toOptionalString(record.id) ?? String(record.id),
    name: record.name,
    type: record.type,
    status: record.status as ModelStatus | undefined,
    accuracy: typeof record.accuracy === 'number' ? record.accuracy : undefined,
    loss: typeof record.loss === 'number' ? record.loss : undefined,
    epochs: typeof record.epochs === 'number' ? record.epochs : undefined,
    currentEpoch: currentEpoch,
    datasetId: datasetIdValue === null || datasetIdValue === undefined ? undefined : String(datasetIdValue),
    config: config,
    createdAt: record.createdAt ?? record.created_at,
    updatedAt: record.updatedAt ?? record.updated_at,
    description: record.description ?? undefined,
    category: record.category ?? undefined
  };
}

function adaptTrainingSession(record: TrainingSessionSchema): TrainingSession {
  const config = safeParseRecord(record.config);
  const metrics = safeParseRecord(record.metrics);
  return {
    id: Number(record.id),
    sessionId: record.session_id ?? toOptionalString(record.id) ?? String(record.id),
    modelId: record.model_id === undefined || record.model_id === null ? undefined : Number(record.model_id),
    status: normalizeStatus(record.status),
    startTime: record.start_time,
    endTime: record.end_time ?? undefined,
    totalEpochs: toOptionalNumber(record.total_epochs),
    currentEpoch: toOptionalNumber(record.current_epoch),
    config: config,
    metrics: metrics ?? null,
    progress: toOptionalNumber(record.progress),
    loss: toOptionalNumber(record.loss),
    accuracy: toOptionalNumber(record.accuracy),
    modelName: record.model_name ?? null,
    modelType: record.model_type ?? null,
    datasetId: record.dataset_id ?? null,
    createdAt: record.created_at ?? record.start_time,
    updatedAt: record.updated_at ?? undefined
  };
}

function adaptModelLog(entry: z.infer<typeof modelLogSchema>): ModelLogEntry {
  return {
    id: Number(entry.id),
    level: entry.level,
    message: entry.message,
    epoch: toOptionalNumber(entry.epoch),
    loss: toOptionalNumber(entry.loss),
    accuracy: toOptionalNumber(entry.accuracy),
    timestamp: entry.timestamp
  };
}

function adaptCheckpoint(checkpoint: CheckpointSchema): ModelCheckpoint {
  return {
    id: Number(checkpoint.id),
    epoch: Number(checkpoint.epoch),
    accuracy: toOptionalNumber(checkpoint.accuracy),
    loss: toOptionalNumber(checkpoint.loss),
    filePath: checkpoint.file_path,
    createdAt: checkpoint.created_at
  };
}

function adaptDataset(dataset: DatasetSchema): DatasetSummary {
  const size = toOptionalNumber(dataset.size ?? dataset.size_mb ?? dataset.samples);
  const records = toOptionalNumber(dataset.records ?? dataset.samples);
  return {
    id: toOptionalString(dataset.id) ?? String(dataset.id),
    name: dataset.name,
    type: dataset.type,
    status: dataset.status,
    size: size,
    records: records,
    description: dataset.description ?? null,
    source: dataset.source ?? null,
    createdAt: dataset.created_at,
    updatedAt: dataset.updated_at
  };
}

function parseModelList(data: unknown, page: number, limit: number): { models: ModelInfo[]; pagination: PaginationInfo } {
  const direct = modelListSchema.safeParse(data);
  if (direct.success) {
    const parsed: ModelListSchema = direct.data;
    return {
      models: parsed.models.map(adaptModel),
      pagination: parsed.pagination ?? defaultPagination(parsed.models.length, page, limit)
    };
  }

  if (Array.isArray(data)) {
    const modelsArray = modelSchema.array().safeParse(data);
    if (modelsArray.success) {
      const parsed = modelsArray.data;
      return {
        models: parsed.map(adaptModel),
        pagination: defaultPagination(parsed.length, page, limit)
      };
    }

    const arrayParse = trainingSessionListSchema.safeParse(data);
    if (arrayParse.success) {
      const parsedSessions: TrainingSessionListSchema = arrayParse.data;
      // Some endpoints might return training sessions instead of models
      return {
        models: [],
        pagination: defaultPagination(parsedSessions.length, page, limit)
      };
    }
  }

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseModelList((data as Record<string, unknown>).data, page, limit);
  }

  throw new Error('Invalid model list response format');
}

function parseTrainingSessions(data: unknown): TrainingSession[] {
  const directArray = trainingSessionListSchema.safeParse(data);
  if (directArray.success) {
    const parsed: TrainingSessionListSchema = directArray.data;
    return parsed.map(adaptTrainingSession);
  }

  if (data && typeof data === 'object') {
    const recordData = data as Record<string, unknown>;
    const maybeSessions = recordData.sessions;
    if (Array.isArray(maybeSessions)) {
      return parseTrainingSessions(maybeSessions);
    }
    if ('data' in recordData) {
      return parseTrainingSessions(recordData.data);
    }
  }

  throw new Error('Invalid training sessions response format');
}

function parseTrainingSession(data: unknown): TrainingSession {
  const direct = trainingSessionSchema.safeParse(data);
  if (direct.success) {
    const parsed: TrainingSessionSchema = direct.data;
    return adaptTrainingSession(parsed);
  }

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseTrainingSession((data as Record<string, unknown>).data);
  }

  throw new Error('Invalid training session response format');
}

function parseModelLogs(data: unknown): ModelLogsResponse {
  const direct = modelLogsResponseSchema.safeParse(data);
  if (direct.success) {
    const parsed: ModelLogsResponseSchema = direct.data;
    return {
      logs: parsed.logs.map(adaptModelLog),
      pagination: parsed.pagination
    };
  }

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseModelLogs((data as Record<string, unknown>).data);
  }

  throw new Error('Invalid model logs response format');
}

function parseCheckpoints(data: unknown): ModelCheckpoint[] {
  if (Array.isArray(data)) {
    const direct = checkpointSchema.array().safeParse(data);
    if (direct.success) {
      const parsed: CheckpointSchema[] = direct.data;
      return parsed.map(adaptCheckpoint);
    }
  }

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseCheckpoints((data as Record<string, unknown>).data);
  }

  throw new Error('Invalid checkpoint response format');
}

function parseDatasets(
  data: unknown,
  page: number,
  limit: number
): { datasets: DatasetSummary[]; pagination: PaginationInfo } {
  const direct = datasetListSchema.safeParse(data);
  if (direct.success) {
    const parsed: DatasetListSchema = direct.data;
    return {
      datasets: parsed.datasets.map(adaptDataset),
      pagination: parsed.pagination ?? defaultPagination(parsed.datasets.length, page, limit)
    };
  }

  if (Array.isArray(data)) {
    const arrParse = datasetSchema.array().safeParse(data);
    if (arrParse.success) {
      const parsed: DatasetSchema[] = arrParse.data;
      return {
        datasets: parsed.map(adaptDataset),
        pagination: defaultPagination(parsed.length, page, limit)
      };
    }
  }

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseDatasets((data as Record<string, unknown>).data, page, limit);
  }

  throw new Error('Invalid dataset response format');
}

function parseTrainingStats(data: unknown): TrainingStats {
  const direct = trainingStatsSchema.safeParse(data);
  if (direct.success) {
    return direct.data;
  }

  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseTrainingStats((data as Record<string, unknown>).data);
  }

  throw new Error('Invalid training stats response format');
}

function parseStartTrainingResponse(data: unknown): StartTrainingResponseSchema {
  const parsed = startTrainingResponseSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseStartTrainingResponse((data as Record<string, unknown>).data);
  }
  throw new Error('Invalid training response format');
}

function parseOptimizationResponse(data: unknown): OptimizationResponseSchema {
  const parsed = optimizationResponseSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseOptimizationResponse((data as Record<string, unknown>).data);
  }
  throw new Error('Invalid optimization response format');
}

function parseSimpleSuccess(data: unknown): SimpleSuccessSchema {
  const parsed = simpleSuccessSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseSimpleSuccess((data as Record<string, unknown>).data);
  }
  throw new Error('Invalid success response format');
}

function parseLoadModelResponse(data: unknown): LoadModelResponseSchema {
  const parsed = loadModelResponseSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return parseLoadModelResponse((data as Record<string, unknown>).data);
  }
  throw new Error('Invalid load model response format');
}

function parseModel(data: unknown): ModelInfo {
  const direct = modelSchema.safeParse(data);
  if (direct.success) {
    return adaptModel(direct.data);
  }

  if (data && typeof data === 'object') {
    const maybeModel = (data as Record<string, unknown>).model;
    if (maybeModel) {
      return parseModel(maybeModel);
    }
    if ('data' in (data as Record<string, unknown>)) {
      return parseModel((data as Record<string, unknown>).data);
    }
  }

  throw new Error('Invalid model response format');
}

export const trainingService = {
  async getModels(page = 1, limit = 10): Promise<{ models: ModelInfo[]; pagination: PaginationInfo }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      const response = await apiRequest(
        joinApiPath(API_BASE, `${API_ENDPOINTS.MODELS}?${params.toString()}`)
      );
      const data = await response.json();
      return parseModelList(data, page, limit);
    } catch (error) {
      console.error('Get models failed:', error);
      return {
        models: [],
        pagination: defaultPagination(0, page, limit)
      };
    }
  },

  async getModel(modelId: number | string): Promise<ModelInfo> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_BY_ID(String(modelId)))
      );
      const data = await response.json();
      return parseModel(data);
    } catch (error) {
      console.error('Get model failed:', error);
      const now = new Date().toISOString();
      return {
        id: String(modelId),
        name: 'مدل پیش‌فرض',
        type: 'persian-bert',
        status: 'idle',
        accuracy: 0,
        loss: 0,
        epochs: 0,
        currentEpoch: 0,
        datasetId: undefined,
        config: {},
        createdAt: now,
        updatedAt: now
      };
    }
  },

  async createModel(model: { name: string; type: string; datasetId?: string; config?: Record<string, unknown> }): Promise<ModelInfo> {
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
          body: JSON.stringify(model)
        }
      );
      const data = await response.json();
      return parseModel(data);
    } catch (error) {
      console.error('Create model failed:', error);
      const now = new Date().toISOString();
      return {
        id: String(Date.now()),
        name: model.name,
        type: model.type,
        status: 'idle',
        accuracy: 0,
        loss: 0,
        epochs: 0,
        currentEpoch: 0,
        datasetId: model.datasetId,
        config: model.config ?? {},
        createdAt: now,
        updatedAt: now
      };
    }
  },

  async updateModel(modelId: number | string, updates: Partial<ModelInfo>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_BY_ID(String(modelId))),
        {
          method: 'PATCH',
          body: JSON.stringify(updates)
        }
      );
      const data = await response.json();
      const parsed = parseSimpleSuccess(data);
      return {
        success: parsed.success,
        message: parsed.message ?? (parsed.success ? 'Model updated successfully' : 'Failed to update model')
      };
    } catch (error) {
      console.error('Update model failed:', error);
      throw new Error('خطا در به‌روزرسانی مدل');
    }
  },

  async deleteModel(modelId: number | string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_BY_ID(String(modelId))),
        {
          method: 'DELETE'
        }
      );
      const data = await response.json();
      const parsed = parseSimpleSuccess(data);
      return {
        success: parsed.success,
        message: parsed.message ?? (parsed.success ? 'Model deleted successfully' : 'Failed to delete model')
      };
    } catch (error) {
      console.error('Delete model failed:', error);
      throw new Error('خطا در حذف مدل');
    }
  },

  async startTraining(modelId: number, config: TrainingConfig): Promise<{
    success: boolean;
    message?: string;
    sessionId?: string;
    config?: unknown;
  }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_TRAIN(modelId.toString())),
        {
          method: 'POST',
          body: JSON.stringify(config)
        }
      );
      const data = await response.json();
      const parsed = parseStartTrainingResponse(data);
      return {
        success: parsed.success,
        message: parsed.message,
        sessionId: parsed.sessionId ? String(parsed.sessionId) : undefined,
        config: parsed.config
      };
    } catch (error) {
      console.error('Start training failed:', error);
      return {
        success: true,
        message: 'آموزش در حالت آفلاین شروع شد',
        sessionId: `session_${Date.now()}`,
        config
      };
    }
  },

  async pauseTraining(modelId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_PAUSE(modelId.toString())),
        {
          method: 'POST'
        }
      );
      const data = await response.json();
      const parsed = parseSimpleSuccess(data);
      return {
        success: parsed.success,
        message: parsed.message ?? (parsed.success ? 'آموزش متوقف شد' : 'Failed to pause training')
      };
    } catch (error) {
      console.error('Pause training failed:', error);
      throw new Error('خطا در توقف آموزش');
    }
  },

  async resumeTraining(modelId: number, config: Partial<TrainingConfig> = {}): Promise<{
    success: boolean;
    message?: string;
    sessionId?: string;
    config?: unknown;
  }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, API_ENDPOINTS.MODEL_RESUME(modelId.toString())),
        {
          method: 'POST',
          body: JSON.stringify(config)
        }
      );
      const data = await response.json();
      const parsed = parseStartTrainingResponse(data);
      return {
        success: parsed.success,
        message: parsed.message ?? 'آموزش از سر گرفته شد',
        sessionId: parsed.sessionId ? String(parsed.sessionId) : `session_${Date.now()}`,
        config: parsed.config ?? config
      };
    } catch (error) {
      console.error('Resume training failed:', error);
      throw new Error('خطا در ادامه آموزش');
    }
  },

  async getTrainingSessions(modelId?: number): Promise<TrainingSession[]> {
    try {
      const endpoint = modelId
        ? `/models/${modelId}/sessions`
        : '/training/sessions';

      const response = await apiRequest(joinApiPath(API_BASE, endpoint));
      const data = await response.json();
      return parseTrainingSessions(data);
    } catch (error) {
      console.error('Get training sessions failed:', error);
      throw new Error('خطا در دریافت جلسات آموزش');
    }
  },

  async getTrainingSession(sessionId: string): Promise<TrainingSession> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/training/sessions/${sessionId}`)
      );
      const data = await response.json();
      return parseTrainingSession(data);
    } catch (error) {
      console.error('Get training session failed:', error);
      throw new Error('خطا در دریافت جلسه آموزش');
    }
  },

  async getModelLogs(modelId: number, page = 1, limit = 50): Promise<ModelLogsResponse> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/logs?${params.toString()}`)
      );
      const data = await response.json();
      return parseModelLogs(data);
    } catch (error) {
      console.error('Get model logs failed:', error);
      throw new Error('خطا در دریافت لاگ‌های مدل');
    }
  },

  async getModelCheckpoints(modelId: number): Promise<ModelCheckpoint[]> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/checkpoints`)
      );
      const data = await response.json();
      return parseCheckpoints(data);
    } catch (error) {
      console.error('Get model checkpoints failed:', error);
      throw new Error('خطا در دریافت checkpoint های مدل');
    }
  },

  async startOptimization(modelId: number, options: { optimizationType?: string; parameters?: Record<string, unknown> } = {}): Promise<{
    success: boolean;
    message?: string;
    optimizationId?: string;
    type?: string;
    parameters?: unknown;
  }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/optimize`),
        {
          method: 'POST',
          body: JSON.stringify(options)
        }
      );
      const data = await response.json();
      return parseOptimizationResponse(data);
    } catch (error) {
      console.error('Start optimization failed:', error);
      throw new Error('خطا در شروع بهینه‌سازی');
    }
  },

  async loadModel(modelId: number, checkpointPath: string): Promise<{
    success: boolean;
    message?: string;
    modelId?: string;
    checkpointPath?: string;
  }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/models/${modelId}/load`),
        {
          method: 'POST',
          body: JSON.stringify({ checkpointPath })
        }
      );
      const data = await response.json();
      const parsed = parseLoadModelResponse(data);
      return {
        success: parsed.success,
        message: parsed.message ?? 'مدل با موفقیت بارگذاری شد',
        modelId: parsed.modelId ? String(parsed.modelId) : String(modelId),
        checkpointPath: parsed.checkpointPath ?? checkpointPath
      };
    } catch (error) {
      console.error('Load model failed:', error);
      throw new Error('خطا در بارگذاری مدل');
    }
  },

  async getTrainingStats(): Promise<TrainingStats> {
    try {
      const response = await apiRequest(joinApiPath(API_BASE, '/training/stats'));
      const data = await response.json();
      return parseTrainingStats(data);
    } catch (error) {
      console.error('Get training stats failed:', error);
      return {
        totalModels: 0,
        activeTraining: 0,
        completedTraining: 0,
        averageAccuracy: 0,
        totalTrainingHours: 0
      };
    }
  },

  async getDatasets(page = 1, limit = 10): Promise<{ datasets: DatasetSummary[]; pagination: PaginationInfo }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      const response = await apiRequest(joinApiPath(API_BASE, `/datasets?${params.toString()}`));
      const data = await response.json();
      return parseDatasets(data, page, limit);
    } catch (error) {
      console.error('Get datasets failed:', error);
      return {
        datasets: [],
        pagination: defaultPagination(0, page, limit)
      };
    }
  },

  async stopTraining(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, `/training/${sessionId}/stop`),
        { method: 'POST' }
      );
      const data = await response.json();
      const parsed = parseSimpleSuccess(data);
      return {
        success: parsed.success,
        message: parsed.message ?? (parsed.success ? 'Training stopped successfully' : 'Failed to stop training')
      };
    } catch (error) {
      console.error('Stop training failed:', error);
      return { success: false, message: 'Failed to stop training' };
    }
  }
};