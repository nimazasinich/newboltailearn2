import { apiFetch } from './api-new';

export type LogItem = {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  ts: string;
};

export type SystemStat = {
  cpu: number;
  mem: number;
  gpu?: number;
  uptime: number;
};

export const monitoring = {
  logs: () => apiFetch<LogItem[]>('/api/logs'),
  
  status: () => apiFetch<SystemStat>('/api/system/status'),
  
  health: () => apiFetch<{ ok: boolean }>('/health')
};