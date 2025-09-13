// Real HuggingFace API Integration - NO MOCK DATA
export interface HuggingFaceDataset {
  id: string;
  name: string;
  description: string;
  api: string;
  samples: number;
  language: string;
  domain: string;
  status?: 'available' | 'downloading' | 'processing' | 'error';
  local_path?: string;
  size_mb?: number;
}

export const REAL_DATASETS: Record<string, HuggingFaceDataset> = {
  'iran-legal-qa': {
    id: 'PerSets/iran-legal-persian-qa',
    name: 'پرسش و پاسخ حقوقی ایران',
    description: 'مجموعه داده پرسش و پاسخ حقوقی به زبان فارسی',
    api: 'https://datasets-server.huggingface.co/rows?dataset=PerSets/iran-legal-persian-qa&config=default&split=train&offset=0&length=100',
    samples: 10247,
    language: 'persian',
    domain: 'legal',
    size_mb: 15.2
  },
  'legal-laws': {
    id: 'QomSSLab/legal_laws_lite_chunk_v1',
    name: 'متون قوانین ایران',
    description: 'مجموعه قوانین و مقررات جمهوری اسلامی ایران',
    api: 'https://datasets-server.huggingface.co/rows?dataset=QomSSLab/legal_laws_lite_chunk_v1&config=default&split=train&offset=0&length=100',
    samples: 50000,
    language: 'persian',
    domain: 'legal',
    size_mb: 125.8
  },
  'persian-ner': {
    id: 'mansoorhamidzadeh/Persian-NER-Dataset-500k',
    name: 'تشخیص موجودیت فارسی',
    description: 'مجموعه داده تشخیص موجودیت‌های نامدار فارسی',
    api: 'https://datasets-server.huggingface.co/rows?dataset=mansoorhamidzadeh/Persian-NER-Dataset-500k&config=default&split=train&offset=0&length=100',
    samples: 500000,
    language: 'persian',
    domain: 'ner',
    size_mb: 890.5
  },
  'persian-sentiment': {
    id: 'HooshvareLab/sentiment-fa',
    name: 'تحلیل احساسات فارسی',
    description: 'مجموعه داده تحلیل احساسات متون فارسی',
    api: 'https://datasets-server.huggingface.co/rows?dataset=HooshvareLab/sentiment-fa&config=default&split=train&offset=0&length=100',
    samples: 25000,
    language: 'persian',
    domain: 'sentiment',
    size_mb: 45.3
  },
  'persian-summarization': {
    id: 'HooshvareLab/pn-summary',
    name: 'خلاصه‌سازی متون فارسی',
    description: 'مجموعه داده خلاصه‌سازی اخبار فارسی',
    api: 'https://datasets-server.huggingface.co/rows?dataset=HooshvareLab/pn-summary&config=default&split=train&offset=0&length=100',
    samples: 93207,
    language: 'persian',
    domain: 'summarization',
    size_mb: 78.9
  }
};

export interface DatasetRow {
  row: {
    question?: string;
    answer?: string;
    text?: string;
    label?: string;
    tokens?: string[];
    ner_tags?: number[];
    summary?: string;
    [key: string]: any;
  };
}

export interface DatasetResponse {
  rows: DatasetRow[];
  num_rows_total: number;
  num_rows_per_page: number;
  partial: boolean;
}

export class HuggingFaceAPI {
  private static instance: HuggingFaceAPI;
  private cache: Map<string, DatasetResponse> = new Map();
  private readonly baseUrl = 'https://datasets-server.huggingface.co';

  static getInstance(): HuggingFaceAPI {
    if (!HuggingFaceAPI.instance) {
      HuggingFaceAPI.instance = new HuggingFaceAPI();
    }
    return HuggingFaceAPI.instance;
  }

  async fetchDataset(
    datasetKey: string, 
    offset: number = 0, 
    length: number = 100
  ): Promise<DatasetResponse> {
    const cacheKey = `${datasetKey}-${offset}-${length}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const dataset = REAL_DATASETS[datasetKey];
    if (!dataset) {
      throw new Error(`Dataset ${datasetKey} not found`);
    }

    try {
      const url = `${this.baseUrl}/rows?dataset=${dataset.id}&config=default&split=train&offset=${offset}&length=${length}`;
      
      console.log(`Fetching real data from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Persian-Legal-AI/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DatasetResponse = await response.json();
      
      // Validate response structure
      if (!data.rows || !Array.isArray(data.rows)) {
        throw new Error('Invalid dataset response structure');
      }

      // Cache the response
      this.cache.set(cacheKey, data);
      
      console.log(`Successfully fetched ${data.rows.length} rows from ${dataset.name}`);
      
      return data;
    } catch (error) {
      console.error(`Error fetching dataset ${datasetKey}:`, error);
      
      // Return fallback data structure instead of throwing
      return {
        rows: [],
        num_rows_total: 0,
        num_rows_per_page: length,
        partial: true
      };
    }
  }

  async fetchMultipleDatasets(
    datasetKeys: string[], 
    samplesPerDataset: number = 50
  ): Promise<Record<string, DatasetResponse>> {
    const results: Record<string, DatasetResponse> = {};
    
    const promises = datasetKeys.map(async (key) => {
      try {
        const data = await this.fetchDataset(key, 0, samplesPerDataset);
        results[key] = data;
      } catch (error) {
        console.error(`Failed to fetch dataset ${key}:`, error);
        results[key] = {
          rows: [],
          num_rows_total: 0,
          num_rows_per_page: samplesPerDataset,
          partial: true
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  async getDatasetInfo(datasetKey: string): Promise<HuggingFaceDataset | null> {
    return REAL_DATASETS[datasetKey] || null;
  }

  getAllDatasets(): HuggingFaceDataset[] {
    return Object.values(REAL_DATASETS);
  }

  async searchDatasets(query: string): Promise<HuggingFaceDataset[]> {
    const allDatasets = this.getAllDatasets();
    const lowerQuery = query.toLowerCase();
    
    return allDatasets.filter(dataset => 
      dataset.name.toLowerCase().includes(lowerQuery) ||
      dataset.description.toLowerCase().includes(lowerQuery) ||
      dataset.domain.toLowerCase().includes(lowerQuery)
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Process real Persian text data
  processRealPersianText(data: DatasetRow[]): {
    texts: string[];
    labels: string[];
    metadata: any[];
  } {
    const texts: string[] = [];
    const labels: string[] = [];
    const metadata: any[] = [];

    data.forEach((item, index) => {
      const row = item.row;
      
      // Extract text content based on dataset structure
      let text = '';
      let label = '';
      
      if (row.question && row.answer) {
        // Q&A dataset
        text = `${row.question} ${row.answer}`;
        label = 'qa';
      } else if (row.text) {
        // Text dataset
        text = row.text;
        label = row.label || 'text';
      } else if (row.tokens && Array.isArray(row.tokens)) {
        // NER dataset
        text = row.tokens.join(' ');
        label = 'ner';
      } else {
        // Fallback
        text = JSON.stringify(row).substring(0, 500);
        label = 'unknown';
      }

      if (text && text.length > 10) {
        texts.push(text);
        labels.push(label);
        metadata.push({
          index,
          originalRow: row,
          processedAt: new Date().toISOString()
        });
      }
    });

    return { texts, labels, metadata };
  }

  // Get dataset statistics
  async getDatasetStats(datasetKey: string): Promise<{
    totalSamples: number;
    avgTextLength: number;
    uniqueLabels: string[];
    sampleTexts: string[];
  }> {
    const data = await this.fetchDataset(datasetKey, 0, 1000);
    const processed = this.processRealPersianText(data.rows);
    
    const avgTextLength = processed.texts.reduce((sum, text) => sum + text.length, 0) / processed.texts.length;
    const uniqueLabels = [...new Set(processed.labels)];
    const sampleTexts = processed.texts.slice(0, 5);

    return {
      totalSamples: data.num_rows_total,
      avgTextLength: Math.round(avgTextLength),
      uniqueLabels,
      sampleTexts
    };
  }
}

// Export singleton instance
export const huggingFaceAPI = HuggingFaceAPI.getInstance();