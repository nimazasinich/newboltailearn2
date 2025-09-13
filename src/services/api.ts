import io from 'socket.io-client';

const API_BASE_URL = '/api';

// Socket.IO connection - connects to current host (unified server)
export const socket = io({
  autoConnect: false
});

// CSRF token management
let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch('/api/csrf-token', { 
    credentials: 'include' 
  });
  if (!response.ok) {
    throw new Error(`CSRF token fetch failed: ${response.status}`);
  }
  const data = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function ensureCsrfToken(): Promise<void> {
  if (!csrfToken) {
    await fetchCsrfToken();
  }
}

// API client class
class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isMutatingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    if (isMutatingRequest) {
      await ensureCsrfToken();
    }

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(isMutatingRequest && csrfToken ? { 'x-csrf-token': csrfToken } : {})
      },
      credentials: 'include'
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle CSRF token expiration
    if (response.status === 403 && isMutatingRequest) {
      try {
        await fetchCsrfToken();
        config.headers = {
          ...config.headers,
          'x-csrf-token': csrfToken
        };
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      } catch (retryError) {
        console.error('CSRF token refresh failed:', retryError);
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Models API
  async getModels() {
    return this.request('/models');
  }

  async createModel(data: { name: string; type: string; dataset_id: string; config?: any }) {
    return this.request('/models', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateModel(id: string, data: any) {
    return this.request(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteModel(id: string) {
    return this.request(`/models/${id}`, {
      method: 'DELETE',
    });
  }

  async trainModel(id: string, config: { epochs?: number; batch_size?: number; learning_rate?: number }) {
    return this.request(`/models/${id}/train`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async pauseTraining(id: string) {
    return this.request(`/models/${id}/pause`, {
      method: 'POST',
    });
  }

  async resumeTraining(id: string) {
    return this.request(`/models/${id}/resume`, {
      method: 'POST',
    });
  }

  // Datasets API
  async getDatasets() {
    return this.request('/datasets');
  }

  async downloadDataset(id: string) {
    return this.request(`/datasets/${id}/download`, {
      method: 'POST',
    });
  }

  // Logs API
  async getLogs(params: { type?: string; level?: string; limit?: number } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/logs?${queryString}`);
  }

  // Monitoring API
  async getMonitoring() {
    return this.request('/monitoring');
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: Record<string, string>) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Analytics API
  async getAnalytics() {
    return this.request('/analytics');
  }

  async exportAnalytics(format: 'csv' | 'json' = 'csv', timeRange: string = '30d') {
    const response = await fetch(`${API_BASE_URL}/analytics/export?format=${format}&timeRange=${timeRange}`);
    
    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      return response.json();
    }
  }

  // Team API
  async getTeam() {
    return this.request('/team');
  }

  // Monitoring Export API
  async exportMonitoring(format: 'csv' | 'json' = 'csv', timeRange: string = '24h') {
    const response = await fetch(`${API_BASE_URL}/monitoring/export?format=${format}&timeRange=${timeRange}`);
    
    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monitoring_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      return response.json();
    }
  }
}

export const apiClient = new ApiClient();

// Socket event types
export interface TrainingProgress {
  modelId: number;
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  timestamp: string;
  training: {
    active: number;
    total: number;
  };
}

// Socket connection management
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Socket event listeners
export const onTrainingProgress = (callback: (data: TrainingProgress) => void) => {
  socket.on('training_progress', callback);
  return () => socket.off('training_progress', callback);
};

export const onTrainingCompleted = (callback: (data: { modelId: number }) => void) => {
  socket.on('training_completed', callback);
  return () => socket.off('training_completed', callback);
};

export const onSystemMetrics = (callback: (data: SystemMetrics) => void) => {
  socket.on('system_metrics', callback);
  return () => socket.off('system_metrics', callback);
};

export const onDatasetUpdated = (callback: (data: { id: string; status: string }) => void) => {
  socket.on('dataset_updated', callback);
  return () => socket.off('dataset_updated', callback);
};

export const onDatasetDownloadProgress = (callback: (data: { id: string; downloaded: number; total: number }) => void) => {
  socket.on('dataset_download_progress', callback);
  return () => socket.off('dataset_download_progress', callback);
};

export const onTrainingMetrics = (callback: (data: { modelId: number; [key: string]: any }) => void) => {
  socket.on('training_metrics', callback);
  return () => socket.off('training_metrics', callback);
};

export const onTrainingPaused = (callback: (data: { modelId: number }) => void) => {
  socket.on('training_paused', callback);
  return () => socket.off('training_paused', callback);
};

export const onTrainingResumed = (callback: (data: { modelId: number }) => void) => {
  socket.on('training_resumed', callback);
  return () => socket.off('training_resumed', callback);
};

export const onTrainingFailed = (callback: (data: { modelId: number; error: string }) => void) => {
  socket.on('training_failed', callback);
  return () => socket.off('training_failed', callback);
};