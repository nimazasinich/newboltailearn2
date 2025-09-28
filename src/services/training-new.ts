import { apiFetch } from './api-new';

export type TrainingJob = {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  progress: number;
};

export const training = {
  start: (m: string, d: string) =>
    apiFetch<TrainingJob>('/api/training/start', { method: 'POST', body: { modelId: m, datasetId: d } }),
  
  status: (id: string) =>
    apiFetch<TrainingJob>(`/api/training/${id}/status`),
  
  models: () =>
    apiFetch<{ id: string; name: string }[]>('/api/models')
};