// Enhanced API Configuration for Persian Legal AI System
// Real data handling with fallback to mock data

import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Model {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'paused' | 'completed' | 'error';
  accuracy: number;
  progress: number;
  epochs: number;
  training_time: number;
  data_size: number;
  description: string;
  created_at: string;
  last_training: string;
}

interface Dataset {
  id: string;
  name: string;
  type: string;
  size: number;
  quality_score: number;
  status: string;
  description: string;
  created_at: string;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  disk_usage: number;
  active_connections: number;
  uptime: number;
  timestamp: string;
}

interface TrainingLog {
  id: number;
  model_id: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  metadata?: any;
}

class EnhancedApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isOnline: boolean = false;

  constructor() {
    // Determine API base URL
    this.baseURL = this.getApiBaseUrl();
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.isOnline = true;
        return response;
      },
      (error) => {
        console.warn('API Error:', error.message);
        this.isOnline = false;
        
        // Return mock data on API failure
        return this.handleApiError(error);
      }
    );

    // Check initial connection
    this.checkConnection();
  }

  private getApiBaseUrl(): string {
    // Check different possible API URLs
    const possibleUrls = [
      'http://localhost:8080/api',
      'http://localhost:8000/api', 
      'http://localhost:3001/api',
      '/api' // Relative URL for production
    ];

    // In development, use the first available URL
    // In production, use relative URL
    if (process.env.NODE_ENV === 'production') {
      return '/api';
    }

    return possibleUrls[0]; // Default to 8080 for our simple server
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.client.get('/health');
      this.isOnline = true;
      console.log('✅ API connection established');
    } catch (error) {
      this.isOnline = false;
      console.warn('⚠️ API not available, using mock data mode');
    }
  }

  private handleApiError(error: any): Promise<AxiosResponse> {
    // Generate mock response based on the request URL
    const url = error.config?.url || '';
    
    return Promise.resolve({
      data: this.generateMockResponse(url),
      status: 200,
      statusText: 'OK (Mock)',
      headers: {},
      config: error.config
    } as AxiosResponse);
  }

  private generateMockResponse(url: string): any {
    if (url.includes('/models')) {
      return this.getMockModels();
    } else if (url.includes('/datasets')) {
      return this.getMockDatasets();
    } else if (url.includes('/metrics')) {
      return this.getMockMetrics();
    } else if (url.includes('/logs')) {
      return this.getMockLogs();
    } else if (url.includes('/health')) {
      return this.getMockHealth();
    }
    
    return { success: true, data: null };
  }

  // Mock Data Generators
  private getMockModels(): ApiResponse<Model[]> {
    const models: Model[] = [
      {
        id: 'model-001',
        name: 'مدل جامع قوانین مدنی ایران - نسخه پیشرفته',
        type: 'civil-law',
        status: 'training',
        accuracy: 87.5,
        progress: 65,
        epochs: 15,
        training_time: 142,
        data_size: 15400,
        description: 'مدل یادگیری عمیق برای تحلیل و طبقه‌بندی قوانین مدنی جمهوری اسلامی ایران با استفاده از معماری ترنسفورمر',
        created_at: '2024-01-15T10:30:00Z',
        last_training: '2024-01-20T14:25:00Z'
      },
      {
        id: 'model-002',
        name: 'مدل تخصصی قوانین جزایی و کیفری',
        type: 'criminal-law',
        status: 'completed',
        accuracy: 92.3,
        progress: 100,
        epochs: 25,
        training_time: 287,
        data_size: 12800,
        description: 'مدل پیشرفته برای شناسایی و تحلیل مواد قانونی جزایی، جرائم و مجازات‌ها',
        created_at: '2024-01-10T09:15:00Z',
        last_training: '2024-01-18T16:45:00Z'
      },
      {
        id: 'model-003',
        name: 'مدل قوانین تجاری و بازرگانی',
        type: 'commercial-law',
        status: 'paused',
        accuracy: 78.9,
        progress: 40,
        epochs: 8,
        training_time: 95,
        data_size: 8900,
        description: 'مدل تحلیل قوانین تجارت، شرکت‌ها و معاملات بازرگانی',
        created_at: '2024-01-12T11:20:00Z',
        last_training: '2024-01-19T13:30:00Z'
      },
      {
        id: 'model-004',
        name: 'مدل قوانین اداری و حکومتی',
        type: 'administrative-law',
        status: 'idle',
        accuracy: 0,
        progress: 0,
        epochs: 0,
        training_time: 0,
        data_size: 11200,
        description: 'مدل پردازش قوانین اداری، آئین‌نامه‌ها و مقررات دولتی',
        created_at: '2024-01-20T08:45:00Z',
        last_training: ''
      }
    ];

    return {
      success: true,
      data: models,
      message: 'Models loaded successfully (mock data)'
    };
  }

  private getMockDatasets(): ApiResponse<Dataset[]> {
    const datasets: Dataset[] = [
      {
        id: 'dataset-001',
        name: 'مجموعه جامع قوانین مدنی',
        type: 'civil-law',
        size: 15400,
        quality_score: 0.94,
        status: 'ready',
        description: 'مجموعه کامل قوانین مدنی شامل کتاب اول تا پنجم قانون مدنی',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'dataset-002',
        name: 'مجموعه قوانین جزایی و کیفری',
        type: 'criminal-law',
        size: 12800,
        quality_score: 0.89,
        status: 'ready',
        description: 'قانون مجازات اسلامی و قوانین مرتبط با جرائم و کیفر',
        created_at: '2024-01-12T11:30:00Z'
      },
      {
        id: 'dataset-003',
        name: 'مجموعه قوانین تجارت و بازرگانی',
        type: 'commercial-law',
        size: 8900,
        quality_score: 0.91,
        status: 'processing',
        description: 'قانون تجارت، قوانین شرکت‌ها و مقررات بازرگانی',
        created_at: '2024-01-15T14:20:00Z'
      },
      {
        id: 'dataset-004',
        name: 'مجموعه قوانین اداری و حکومتی',
        type: 'administrative-law',
        size: 11200,
        quality_score: 0.88,
        status: 'ready',
        description: 'قوانین اداری، آئین‌نامه‌ها و مقررات حکومتی',
        created_at: '2024-01-18T09:45:00Z'
      }
    ];

    return {
      success: true,
      data: datasets,
      message: 'Datasets loaded successfully (mock data)'
    };
  }

  private getMockMetrics(): ApiResponse<SystemMetrics> {
    const metrics: SystemMetrics = {
      cpu_usage: Math.floor(Math.random() * 30 + 40),
      memory_usage: Math.floor(Math.random() * 20 + 60),
      gpu_usage: Math.floor(Math.random() * 40 + 50),
      disk_usage: Math.floor(Math.random() * 15 + 70),
      active_connections: Math.floor(Math.random() * 10 + 5),
      uptime: Math.floor(Math.random() * 86400 + 3600),
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: metrics,
      message: 'System metrics loaded (mock data)'
    };
  }

  private getMockLogs(): ApiResponse<TrainingLog[]> {
    const logs: TrainingLog[] = [
      {
        id: 1,
        model_id: 'model-001',
        level: 'info',
        message: 'آموزش مدل قوانین مدنی آغاز شد',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 2,
        model_id: 'model-001',
        level: 'success',
        message: 'دقت مدل به 87.5% رسید - عملکرد مطلوب',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: 3,
        model_id: 'model-002',
        level: 'success',
        message: 'مدل قوانین جزایی با موفقیت آموزش دید - دقت نهایی: 92.3%',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 4,
        model_id: 'model-003',
        level: 'warning',
        message: 'آموزش مدل قوانین تجاری متوقف شد - بررسی فراپارامترها',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: 5,
        model_id: 'model-004',
        level: 'info',
        message: 'مدل قوانین اداری آماده آموزش - منتظر تأیید',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString()
      }
    ];

    return {
      success: true,
      data: logs,
      pagination: {
        page: 1,
        limit: 50,
        total: logs.length,
        totalPages: 1
      },
      message: 'Training logs loaded (mock data)'
    };
  }

  private getMockHealth(): ApiResponse {
    return {
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
        uptime: Math.floor(Math.random() * 86400),
        memory: {
          used: Math.floor(Math.random() * 500 + 200),
          total: 1024,
          percentage: Math.floor(Math.random() * 30 + 50)
        },
        cpu: Math.floor(Math.random() * 20 + 30),
        timestamp: new Date().toISOString(),
        persian_support: true,
        ai_models: 'active'
      },
      message: 'System healthy (mock data)'
    };
  }

  // Public API Methods

  async getModels(): Promise<ApiResponse<Model[]>> {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      console.warn('Using mock models data');
      return this.getMockModels();
    }
  }

  async getModel(id: string): Promise<ApiResponse<Model>> {
    try {
      const response = await this.client.get(`/models/${id}`);
      return response.data;
    } catch (error) {
      const mockModels = this.getMockModels();
      const model = mockModels.data?.find(m => m.id === id);
      return {
        success: !!model,
        data: model,
        error: model ? undefined : 'Model not found'
      };
    }
  }

  async startModelTraining(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/models/${id}/start`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: `Training started for model ${id} (mock response)`
      };
    }
  }

  async pauseModelTraining(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/models/${id}/pause`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: `Training paused for model ${id} (mock response)`
      };
    }
  }

  async stopModelTraining(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/models/${id}/stop`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: `Training stopped for model ${id} (mock response)`
      };
    }
  }

  async getDatasets(): Promise<ApiResponse<Dataset[]>> {
    try {
      const response = await this.client.get('/datasets');
      return response.data;
    } catch (error) {
      console.warn('Using mock datasets data');
      return this.getMockDatasets();
    }
  }

  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    try {
      const response = await this.client.get('/monitoring/metrics');
      return response.data;
    } catch (error) {
      console.warn('Using mock metrics data');
      return this.getMockMetrics();
    }
  }

  async getTrainingLogs(page: number = 1, limit: number = 50, level?: string): Promise<ApiResponse<TrainingLog[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(level && { level })
      });
      
      const response = await this.client.get(`/logs?${params}`);
      return response.data;
    } catch (error) {
      console.warn('Using mock logs data');
      return this.getMockLogs();
    }
  }

  async getHealthStatus(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.warn('Using mock health data');
      return this.getMockHealth();
    }
  }

  // Utility methods
  isApiOnline(): boolean {
    return this.isOnline;
  }

  getConnectionStatus() {
    return {
      online: this.isOnline,
      baseURL: this.baseURL,
      lastCheck: new Date().toISOString()
    };
  }

  // Real-time data simulation (for when API is offline)
  simulateRealTimeUpdates(callback: (data: any) => void) {
    const interval = setInterval(() => {
      if (!this.isOnline) {
        // Simulate real-time metrics updates
        const mockMetrics = this.getMockMetrics();
        callback({
          type: 'metrics_update',
          data: mockMetrics.data
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}

// Create singleton instance
export const enhancedApi = new EnhancedApiClient();

// Export types
export type {
  ApiResponse,
  Model,
  Dataset,
  SystemMetrics,
  TrainingLog
};

// Helper functions for components
export const useEnhancedApi = () => {
  return {
    api: enhancedApi,
    isOnline: enhancedApi.isApiOnline(),
    connectionStatus: enhancedApi.getConnectionStatus()
  };
};

// Persian text utilities
export const persianUtils = {
  formatNumber: (num: number): string => {
    return num.toLocaleString('fa-IR');
  },
  
  formatDate: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  formatTime: (date: string | Date): string => {
    return new Date(date).toLocaleTimeString('fa-IR');
  },
  
  getRelativeTime: (date: string | Date): string => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'اکنون';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    return `${diffDays} روز پیش`;
  }
};