import { apiFetch } from './api-new';

export type Dataset = {
  id: string;
  name: string;
  size: number;
  createdAt: string;
};

export const datasets = {
  list: () => apiFetch<Dataset[]>('/api/datasets'),
  
  upload: async (f: File) => {
    const form = new FormData();
    form.append('file', f);
    const r = await fetch('/api/datasets/upload', {
      method: 'POST',
      body: form,
      credentials: 'include'
    });
    if (!r.ok) throw new Error('Upload failed');
    return r.json();
  }
};