class ApiService {
  private baseURL = 'http://localhost:3001/api';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle unauthorized - try development fallback
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const authResponse = await fetch(`${this.baseURL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' }),
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          const newToken = authData.token || authData.accessToken;
          if (newToken) {
            this.token = newToken;
            localStorage.setItem('auth_token', newToken);
            headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, { ...options, headers });
          }
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // System Health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Models Management
  async getModels(): Promise<any[]> {
    return this.request('/models');
  }

  async createModel(modelData: {
    name: string;
    type: 'dora' | 'qr-adaptor' | 'persian-bert';
    dataset_id: string;
    config: { epochs: number; batch_size: number; learning_rate: number };
  }): Promise<any> {
    return this.request('/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  }

  async startTraining(modelId: number, params?: {
    epochs?: number;
    batch_size?: number;
    learning_rate?: number;
  }): Promise<any> {
    return this.request(`/models/${modelId}/train`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  async pauseTraining(modelId: number): Promise<any> {
    return this.request(`/models/${modelId}/pause`, { method: 'POST' });
  }

  async resumeTraining(modelId: number): Promise<any> {
    return this.request(`/models/${modelId}/resume`, { method: 'POST' });
  }

  async deleteModel(modelId: number): Promise<any> {
    return this.request(`/models/${modelId}`, { method: 'DELETE' });
  }

  // Dataset Management
  async getDatasets(): Promise<any[]> {
    return this.request('/datasets');
  }

  async downloadDataset(datasetId: string): Promise<any> {
    return this.request(`/datasets/${datasetId}/download`, { method: 'POST' });
  }

  // System Monitoring - Windows-compatible CPU usage
  async getSystemMetrics(): Promise<{
    cpu: number;
    memory: { used: number; total: number; percentage: number };
    uptime: number;
    timestamp: string;
  }> {
    return this.request('/monitoring');
  }

  // Logs
  async getLogs(params?: {
    type?: 'system' | 'training';
    level?: 'info' | 'warning' | 'error' | 'debug';
    limit?: number;
  }): Promise<any[]> {
    const queryString = params 
      ? '?' + new URLSearchParams(params as any).toString() 
      : '';
    return this.request(`/logs${queryString}`);
  }

  // Settings
  async getSettings(): Promise<any> {
    return this.request('/settings');
  }

  async updateSettings(settings: {
    dataset_directory?: string;
    model_directory?: string;
    huggingface_token?: string;
    max_concurrent_training?: string;
    default_batch_size?: string;
    default_learning_rate?: string;
  }): Promise<any> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    return this.request('/analytics');
  }
}

export const apiService = new ApiService();