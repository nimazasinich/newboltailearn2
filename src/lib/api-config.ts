// Real API base configuration
// In production without VITE_API_BASE, we'll disable API calls to prevent 404s
const IS_GITHUB_PAGES = typeof location !== 'undefined' && location.hostname.endsWith('github.io');
const RAW_BASE = import.meta.env?.VITE_API_BASE ?? (import.meta.env.PROD && !IS_GITHUB_PAGES ? null : '/api');

// RequestInit type for fetch
type RequestInit = globalThis.RequestInit;

function normalizeApiBase(base: string | null): string | null {
  if (!base) return null;
  const trimmed = base.trim();
  const withoutTrailingSlash = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
}

export const API_BASE = normalizeApiBase(RAW_BASE);

// Check if API is available
export const isApiAvailable = (): boolean => {
  return API_BASE !== null && !IS_GITHUB_PAGES;
};

// Export GitHub Pages detection for components
export { IS_GITHUB_PAGES };

// Safe URL joining
export function joinApiPath(basePath: string, endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${basePath}${cleanEndpoint}`;
}

// Request wrapper with proper error handling
export async function apiRequest(endpoint: string, options?: RequestInit): Promise<Response> {
  // Check if API is available
  if (!isApiAvailable()) {
    throw new Error('API not available in production mode');
  }

  const url = endpoint.startsWith('/api') || endpoint.startsWith('http') 
    ? endpoint 
    : joinApiPath(API_BASE!, endpoint);
  
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${url}`);
    }

    return response;
  } catch (error) {
    console.error(`Critical API Failure at ${endpoint}:`, error);
    // Re-throw to be handled by error boundaries
    throw error;
  }
}

// Typed API responses
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Helper for handling API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.data || data;
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Models
  MODELS: '/models',
  MODEL_BY_ID: (id: string) => `/models/${id}`,
  MODEL_TRAIN: (id: string) => `/models/${id}/train`,
  MODEL_PAUSE: (id: string) => `/models/${id}/pause`,
  MODEL_RESUME: (id: string) => `/models/${id}/resume`,
  MODEL_DELETE: (id: string) => `/models/${id}`,
  MODEL_EXPORT: (id: string) => `/models/${id}/export`,
  MODEL_CHECKPOINTS: (id: string) => `/models/${id}/checkpoints`,
  
  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_ADVANCED: '/analytics/advanced',
  ANALYTICS_PERFORMANCE: '/analytics/performance',
  ANALYTICS_USAGE: '/analytics/usage',
  
  // Datasets
  DATASETS: '/datasets',
  DATASET_BY_ID: (id: string) => `/datasets/${id}`,
  DATASET_DOWNLOAD: (id: string) => `/datasets/${id}/download`,
  
  // Monitoring
  MONITORING: '/monitoring',
  MONITORING_LOGS: '/monitoring/logs',
  MONITORING_HEALTH: '/monitoring/health',
  MONITORING_PERFORMANCE: '/monitoring/performance',
  
  // Logs
  LOGS: '/logs',
  
  // Settings
  SETTINGS: '/settings',
  
  // Team
  TEAM: '/team',
  
  // Health
  HEALTH: '/health',
  
  // System metrics
  SYSTEM_METRICS: '/system/metrics',
} as const;
