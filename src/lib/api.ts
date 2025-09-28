const API_BASE = import.meta.env.VITE_API_BASE;
const IS_GITHUB_PAGES = !API_BASE && location.hostname.includes('github.io');

export const apiConfig = {
  baseUrl: API_BASE || '/api',
  wsUrl: getWebSocketUrl()
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T>(endpoint: string): Promise<T | null> {
  if (IS_GITHUB_PAGES) {
    console.info(`🔄 Running in limited mode - backend unavailable (${endpoint})`);
    return null;
  }
  
  const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

export function getWebSocketUrl(): string {
  if (IS_GITHUB_PAGES) return ''; // No WebSocket on GitHub Pages
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws`;
}

// API endpoints
export const monitoring = {
  getMetrics: () => apiCall<any>('/monitoring/metrics'),
  getLogs: () => apiCall<any[]>('/monitoring/logs'),
  getStatus: () => apiCall<any>('/monitoring/status')
};

export const models = {
  list: () => apiCall<any[]>('/models'),
  get: (id: string) => apiCall<any>(`/models/${id}`),
  create: (data: any) => apiCall<any>('/models'),
  delete: (id: string) => apiCall<any>(`/models/${id}`)
};