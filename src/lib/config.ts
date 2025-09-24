// Normalize API base: in dev we proxy '/api' via Vite; in prod we can use relative '/api'.
const RAW = (import.meta as any)?.env?.VITE_API_BASE ?? '/api';

// remove trailing slash and ensure leading slash
function norm(base: string) {
  const t = (base || '').trim();
  const noTrail = t.endsWith('/') ? t.slice(0, -1) : t;
  return noTrail.startsWith('/') ? noTrail : `/${noTrail}`;
}

export const API_BASE = norm(RAW);
export const WS_BASE = (import.meta as any)?.env?.VITE_WS_BASE ?? '';
export const WS_PATH = import.meta.env.VITE_WS_PATH || (typeof window !== 'undefined' ? `ws://${window.location.hostname}:8080/socket.io/` : 'ws://localhost:8080/socket.io/')

// Legacy exports for compatibility
export const API_URL = API_BASE
export const WS_URL = WS_PATH