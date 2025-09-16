const API_BASE = import.meta.env.VITE_API_URL || '/api';
const WS_BASE = import.meta.env.VITE_WS_URL || '/ws';

export const apiConfig = {
  baseUrl: API_BASE,
  wsUrl: WS_BASE.startsWith('ws') ? WS_BASE : 
    `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}${WS_BASE}`
};

export async function api<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
    ...init,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

export function getWebSocketUrl(): string {
  return apiConfig.wsUrl;
}