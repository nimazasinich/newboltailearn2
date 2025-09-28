import { apiRequest, API_ENDPOINTS } from '../lib/api-config';

// Dataset interfaces
export interface Dataset {
  id: string;
  name: string;
  source: string;
  huggingface_id?: string;
  samples: number;
  size_mb: number;
  status: 'available' | 'downloading' | 'processing' | 'error';
  type?: string;
  local_path?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  last_used?: string;
}

export interface DatasetDownloadProgress {
  id: string;
  downloaded: number;
  total: number;
  percentage: number;
  status: 'downloading' | 'completed' | 'error';
}

// Dataset API functions
export async function getDatasets(): Promise<Dataset[]> {
  try {
    const response = await apiRequest(API_ENDPOINTS.DATASETS);
    const data = await response.json();
    
    // Handle different response formats from API
    if (data && typeof data === 'object') {
      // If response has datasets property (paginated response)
      if (Array.isArray(data.datasets)) {
        return data.datasets;
      }
      // If response is directly an array
      if (Array.isArray(data)) {
        return data;
      }
    }
    
    // Fallback to empty array if data is not in expected format
    return [];
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    return [];
  }
}

export async function getDataset(id: string): Promise<Dataset> {
  const response = await apiRequest(API_ENDPOINTS.DATASET_BY_ID(id));
  return response.json();
}

export async function createDataset(data: {
  name: string;
  source: string;
  huggingface_id?: string;
  description?: string;
  type?: string;
}): Promise<Dataset> {
  const response = await apiRequest(API_ENDPOINTS.DATASETS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateDataset(
  id: string,
  updates: Partial<Pick<Dataset, 'name' | 'description' | 'status'>>
): Promise<void> {
  await apiRequest(API_ENDPOINTS.DATASET_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteDataset(id: string): Promise<void> {
  await apiRequest(API_ENDPOINTS.DATASET_BY_ID(id), {
    method: 'DELETE',
  });
}

// Dataset operations
export async function downloadDataset(id: string): Promise<{ message: string }> {
  const response = await apiRequest(API_ENDPOINTS.DATASET_DOWNLOAD(id), {
    method: 'POST',
  });
  return response.json();
}

export async function processDataset(id: string, options?: {
  preprocessing?: string[];
  validation_split?: number;
  test_split?: number;
}): Promise<{ message: string; taskId: string }> {
  const response = await apiRequest(`${API_ENDPOINTS.DATASET_BY_ID(id)}/process`, {
    method: 'POST',
    body: JSON.stringify(options || {}),
  });
  return response.json();
}

// Dataset statistics
export async function getDatasetStats(): Promise<{
  total: number;
  available: number;
  downloading: number;
  processing: number;
  error: number;
  totalSamples: number;
  totalSizeMB: number;
}> {
  try {
    const datasets = await getDatasets();
    
    // Ensure datasets is an array before using filter and reduce
    const datasetsArray = Array.isArray(datasets) ? datasets : [];
    
    return {
      total: datasetsArray.length,
      available: datasetsArray.filter(d => d && d.status === 'available').length,
      downloading: datasetsArray.filter(d => d && d.status === 'downloading').length,
      processing: datasetsArray.filter(d => d && d.status === 'processing').length,
      error: datasetsArray.filter(d => d && d.status === 'error').length,
      totalSamples: datasetsArray.reduce((sum, d) => sum + (d?.samples || 0), 0),
      totalSizeMB: datasetsArray.reduce((sum, d) => sum + (d?.size_mb || 0), 0),
    };
  } catch (error) {
    console.error('Failed to get dataset stats:', error);
    return {
      total: 0,
      available: 0,
      downloading: 0,
      processing: 0,
      error: 0,
      totalSamples: 0,
      totalSizeMB: 0,
    };
  }
}

// Popular datasets for quick access
export const POPULAR_DATASETS = [
  {
    id: 'iran-legal-qa',
    name: 'پرسش و پاسخ حقوقی ایران',
    huggingface_id: 'PerSets/iran-legal-persian-qa',
    description: 'مجموعه داده پرسش و پاسخ حقوقی به زبان فارسی',
    samples: 10247,
    size_mb: 15.2,
  },
  {
    id: 'legal-laws',
    name: 'متون قوانین ایران',
    huggingface_id: 'QomSSLab/legal_laws_lite_chunk_v1',
    description: 'متون قوانین و مقررات جمهوری اسلامی ایران',
    samples: 50000,
    size_mb: 125.8,
  },
  {
    id: 'persian-ner',
    name: 'تشخیص موجودیت فارسی',
    huggingface_id: 'mansoorhamidzadeh/Persian-NER-Dataset-500k',
    description: 'مجموعه داده تشخیص موجودیت‌های نام‌دار فارسی',
    samples: 500000,
    size_mb: 890.5,
  },
] as const;

// Dataset Gallery Functions
export async function getDatasetCatalog(): Promise<any[]> {
  try {
    // Return popular datasets as catalog for now
    return POPULAR_DATASETS.map(dataset => ({
      id: dataset.id,
      title: dataset.name,
      description: dataset.description,
      samples: dataset.samples,
      size_mb: dataset.size_mb,
      huggingface_id: dataset.huggingface_id,
      tags: ['legal', 'persian'] // Default tags
    }));
  } catch (error) {
    console.error('Failed to fetch dataset catalog:', error);
    return [];
  }
}

export async function headDataset(id: string): Promise<boolean> {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.DATASETS}/${id}`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Failed to check dataset availability:', error);
    return false;
  }
}

export async function downloadDatasetById(id: string, onProgress?: (progress: number) => void): Promise<Blob> {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.DATASETS}/${id}/download`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];

    if (!reader) {
      throw new Error('Unable to read response');
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total > 0) {
        onProgress(Math.round((loaded / total) * 100));
      }
    }

    return new Blob(chunks as any[]);
  } catch (error) {
    console.error('Failed to download dataset:', error);
    throw error;
  }
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper functions
export function getDatasetTypeIcon(type?: string): string {
  switch (type) {
    case 'qa': return '❓';
    case 'text': return '📄';
    case 'ner': return '🏷️';
    case 'classification': return '📊';
    case 'translation': return '🌐';
    default: return '📁';
  }
}

export function getStatusColor(status: Dataset['status']): string {
  switch (status) {
    case 'available': return 'text-green-600';
    case 'downloading': return 'text-blue-600';
    case 'processing': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function formatDatasetSize(sizeMB: number): string {
  if (sizeMB < 1024) {
    return `${sizeMB.toFixed(1)} MB`;
  }
  return `${(sizeMB / 1024).toFixed(1)} GB`;
}