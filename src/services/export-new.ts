import { apiFetch } from './api-new';

export type ExportJob = {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
};

export const exporter = {
  create: (p: {
    format: 'zip';
    includeModels: boolean;
    includeData: boolean;
    includeLogs: boolean;
    includeConfig: boolean;
  }) => apiFetch<ExportJob>('/api/export', { method: 'POST', body: p }),
  
  status: (id: string) => apiFetch<ExportJob>(`/api/export/${id}`),
  
  download: async (id: string) => {
    const r = await fetch(`/api/export/${id}/download`, { credentials: 'include' });
    if (!r.ok) throw new Error('Download failed');
    return r.blob();
  }
};