export type DatasetTag = 'nlp' | 'classification' | 'ner' | 'qa' | 'legal' | 'sentiment' | 'misc';

export interface DatasetItem {
  id: string | number;
  title: string;
  name: string; // Alias for title
  description: string;
  sizeMB?: number;
  size_mb?: number; // Backend field
  size?: number; // Alternative size field
  records?: number;
  samples?: number; // Alternative records field
  tags: DatasetTag[];
  license?: string;
  updatedAt?: string;
  created_at?: string; // Backend field
  last_used?: string; // Backend field
  status?: string; // Backend field
  type?: string; // Backend field
  source?: string; // Backend field

  // Served by backend:
  localFile?: string;     // file name under /datasets/files
  remoteUrl?: string;     // optional external source
}

// Enhanced dataset interface for API responses
export interface DatasetAPIResponse {
  datasets: DatasetItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Dataset upload interface
export interface DatasetUpload {
  name: string;
  description: string;
  file: File;
  tags: DatasetTag[];
  type: 'csv' | 'json' | 'txt' | 'pdf';
  source?: string;
}

// Dataset processing status
export interface DatasetProcessingStatus {
  id: string | number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  message?: string;
  error?: string;
  processedAt?: string;
}
