const API_BASE = import.meta.env.VITE_API_URL || '/api';
const WS_BASE = import.meta.env.VITE_WS_URL || '/ws';

export const apiConfig = {
  baseUrl: API_BASE,
  wsUrl: WS_BASE.startsWith('ws') ? WS_BASE : 
    `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${WS_BASE}`
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(endpoint: string, init?: globalThis.RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
    ...init,
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

export function getWebSocketUrl(): string {
  return apiConfig.wsUrl;
}

// API endpoints
export const monitoring = {
  getMetrics: () => api<any>('/monitoring/metrics'),
  getLogs: () => api<any[]>('/monitoring/logs'),
  getStatus: () => api<any>('/monitoring/status')
};

export const models = {
  list: () => api<any[]>('/models'),
  get: (id: string) => api<any>(`/models/${id}`),
  create: (data: any) => api<any>('/models', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => api<any>(`/models/${id}`, { method: 'DELETE' })
};