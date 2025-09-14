/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

const API_BASE = '/api';

interface ApiOptions extends RequestInit {
  timeout?: number;
}

export async function api<T = any>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T> {
  const { timeout = 15000, ...init } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 
        'Content-Type': 'application/json',
        ...(init.headers || {})
      },
      signal: controller.signal,
      ...init
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// API Methods
export const getHealth = () => api('/health');
export const getMonitoring = () => api('/monitoring');
export const getModels = () => api('/models');
export const getDatasets = () => api('/datasets');
export const startTraining = (modelId: number) => 
  api(`/models/${modelId}/start`, { method: 'POST' });
export const pauseTraining = (modelId: number) => 
  api(`/models/${modelId}/pause`, { method: 'POST' });
export const stopTraining = (modelId: number) => 
  api(`/models/${modelId}/stop`, { method: 'POST' });