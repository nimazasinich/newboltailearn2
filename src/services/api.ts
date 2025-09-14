class ApiService {
  private baseURL = 'http://localhost:3001/api';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.token = null;
          localStorage.removeItem('auth_token');
          // Handle unauthorized access
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Models API
  async getModels() {
    return this.request('/models');
  }

  async createModel(data: any) {
    return this.request('/models', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startTraining(modelId: number) {
    return this.request(`/models/${modelId}/train`, {
      method: 'POST',
    });
  }

  async pauseTraining(modelId: number) {
    return this.request(`/models/${modelId}/pause`, {
      method: 'POST',
    });
  }

  async resumeTraining(modelId: number) {
    return this.request(`/models/${modelId}/resume`, {
      method: 'POST',
    });
  }

  // Datasets API
  async getDatasets() {
    return this.request('/datasets');
  }

  async downloadDataset(datasetId: string) {
    return this.request(`/datasets/${datasetId}/download`, {
      method: 'POST',
    });
  }

  // Monitoring API
  async getSystemMetrics() {
    return this.request('/monitoring');
  }

  // Logs API
  async getLogs(params?: { type?: string; level?: string; limit?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/logs${queryString}`);
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Analytics API
  async getAnalytics() {
    return this.request('/analytics');
  }
}

export const apiService = new ApiService();