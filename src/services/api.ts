import { z } from 'zod'
import { API_BASE } from '../lib/config'

type RequestInit = globalThis.RequestInit

// safe join: join('/api', '/health') => '/api/health'; join('/api', 'health') => '/api/health'
function join(base: string, path: string) {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

let csrf = ''

// Zod schemas for API responses
export const SystemMetricsSchema = z.object({
  cpu: z.number(),
  memory: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
  process_memory: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number(),
  }).optional(),
  uptime: z.number(),
  system_uptime: z.number().optional(),
  platform: z.string().optional(),
  arch: z.string().optional(),
  training: z.object({
    active: z.number(),
    total: z.number(),
    completed: z.number(),
  }).optional(),
  timestamp: z.string(),
})

export const TrainingSessionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  accuracy: z.number(),
  loss: z.number(),
  epochs: z.number(),
  current_epoch: z.number(),
  progress: z.number(),
  dataset_id: z.union([z.string(), z.number()]),
  estimated_time: z.number(),
  learning_rate: z.number(),
  batch_size: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  metrics_history: z.array(z.object({
    epoch: z.number(),
    accuracy: z.number(),
    loss: z.number(),
    timestamp: z.string(),
  })),
})

export const DatasetSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  source: z.string(),
  samples: z.number(),
  size_mb: z.number(),
  size: z.number().optional(), // Alias from controller
  records: z.number().optional(), // Alias from controller
  status: z.string(),
  type: z.string().optional(),
  created_at: z.string(),
  last_used: z.string().optional(),
  description: z.string().optional(),
})

export const HealthSchema = z.object({
  status: z.string(),
  database: z.string().optional(),
  uptime: z.number().optional(),
  memory: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number(),
  }).optional(),
  cpu: z.number().optional(),
  timestamp: z.string().optional(),
  beacon: z.string().optional(),
})

export type SystemMetrics = z.infer<typeof SystemMetricsSchema>
export type TrainingSession = z.infer<typeof TrainingSessionSchema>
export type Dataset = z.infer<typeof DatasetSchema>
export type Health = z.infer<typeof HealthSchema>

async function getCsrf() {
  try {
    const r = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' })
    if (r.ok) {
      const j = await r.json()
      csrf = j?.token || ''
    }
  } catch (error) {
    // Ignore CSRF errors
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token') || ''
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(init.headers as any),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (init.method && init.method !== 'GET') headers['X-CSRF-Token'] = csrf

  const url = path.startsWith('/api') || path.startsWith('http')
    ? path
    : join(API_BASE, path);
  
  let res = await fetch(url, { ...init, headers, credentials: 'include' })
  if (res.status === 403) {
    await getCsrf()
    headers['X-CSRF-Token'] = csrf
    res = await fetch(url, { ...init, headers, credentials: 'include' })
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on ${url}: ${text || res.statusText}`);
  }
  return res.json()
}

async function requestWithSchema<T>(
  path: string, 
  schema: z.ZodSchema<T>, 
  init: RequestInit = {}
): Promise<T> {
  try {
    const data = await request(path, init)
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`API Schema validation error for ${path}:`, error.issues)
      throw new Error(`Invalid API response format for ${path}`)
    }
    throw error
  }
}

export const API = {
  // Health check
  health: (): Promise<Health> => requestWithSchema('/health', HealthSchema),
  
  // System monitoring
  monitoring: (): Promise<SystemMetrics> => requestWithSchema('/monitoring', SystemMetricsSchema),
  systemStats: (): Promise<SystemMetrics> => requestWithSchema('/monitoring', SystemMetricsSchema),
  
  // Models and training
  models: (): Promise<TrainingSession[]> => requestWithSchema('/models', z.object({
    models: z.array(TrainingSessionSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    })
  })).then(data => data.models),
  getModels: (): Promise<TrainingSession[]> => requestWithSchema('/models', z.object({
    models: z.array(TrainingSessionSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    })
  })).then(data => data.models),
  getModel: (id: string | number): Promise<TrainingSession> => requestWithSchema(`/models/${id}`, TrainingSessionSchema),
  createModel: (data: any) => request('/models', { method: 'POST', body: JSON.stringify(data) }),
  startTraining: (id: string | number, body?: any) => request(`/models/${id}/start`, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  pauseTraining: (id: string | number) => request(`/models/${id}/pause`, { method: 'POST' }),
  stopTraining: (id: string | number) => request(`/models/${id}/stop`, { method: 'POST' }),
  resumeTraining: (id: string | number) => request(`/models/${id}/resume`, { method: 'POST' }),
  
  // Datasets
  datasets: (): Promise<Dataset[]> => requestWithSchema('/datasets', z.object({
    datasets: z.array(DatasetSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    })
  })).then(data => data.datasets),
  getDatasets: (): Promise<Dataset[]> => requestWithSchema('/datasets', z.object({
    datasets: z.array(DatasetSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    })
  })).then(data => data.datasets.map((d: any) => ({
    ...d,
    sizeMB: typeof d.size === 'number' ? d.size : (typeof d.size_mb === 'number' ? d.size_mb : undefined),
  }))),
  getDataset: (id: string | number): Promise<Dataset> => requestWithSchema(`/datasets/${id}`, DatasetSchema),
  downloadDataset: (id: string | number) => request(`/datasets/${id}/download`, { method: 'POST' }),
  
  // Logs (fallback to raw request since schema varies)
  logs: (params?: { page?: number; limit?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/logs${query}`)
  },
  getLogs: (params?: { page?: number; limit?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : ''
    return request(`/logs${query}`)
  },
  
  // Additional API methods
  getAnalytics: () => request('/analytics'),
  getSystemMetrics: (): Promise<SystemMetrics> => requestWithSchema('/monitoring', SystemMetricsSchema),
  getSettings: () => request('/settings'),
  updateSettings: (settings: any) => request('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  
  // Model training methods
  trainModel: (id: string, config?: any) => request(`/models/${id}/train`, { method: 'POST', body: config ? JSON.stringify(config) : undefined }),
  deleteModel: (id: string) => request(`/models/${id}`, { method: 'DELETE' }),
}

export async function bootstrapClient() {
  await getCsrf()
}

// Export API as apiClient for backward compatibility
export const apiClient = API;