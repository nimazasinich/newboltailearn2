export type DatasetTag = 'nlp' | 'classification' | 'ner' | 'qa' | 'legal' | 'sentiment' | 'misc';

export interface DatasetItem {
  id: string;
  title: string;
  description: string;
  sizeMB?: number;
  records?: number;
  tags: DatasetTag[];
  license?: string;
  updatedAt?: string;

  // Served by backend:
  localFile?: string;     // file name under /datasets/files
  remoteUrl?: string;     // optional external source
}
