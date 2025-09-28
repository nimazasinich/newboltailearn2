/**
 * Comprehensive API Error Handling Service
 * Implements the mandatory error handling patterns
 */

export interface ApiError {
  status: number;
  message: string;
  endpoint: string;
  timestamp: Date;
  retryable: boolean;
  originalError?: Error;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface FallbackData {
  models: any[];
  datasets: any[];
  analytics: {
    status: string;
    data: any;
  };
  health: {
    status: string;
    message: string;
  };
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private fallbackData: FallbackData;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;
  private retryDelay = 1000;

  private constructor() {
    this.fallbackData = this.createFallbackService();
  }

  public static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  /**
   * MANDATORY: Implement this exact error handling pattern
   */
  async handleAPICall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Critical API Failure at ${endpoint}:`, error);
      
      // MANDATORY: Implement fallback behavior
      return this.handleAPIFallback(endpoint) as T;
    }
  }

  /**
   * MANDATORY: Implement fallback behavior
   */
  private handleAPIFallback(endpoint: string): any {
    console.log(`🔄 Using fallback data for ${endpoint}`);
    
    if (endpoint.includes('/api/models')) {
      return this.fallbackData.models;
    }
    
    if (endpoint.includes('/api/datasets')) {
      return this.fallbackData.datasets;
    }
    
    if (endpoint.includes('/api/analytics')) {
      return this.fallbackData.analytics;
    }
    
    if (endpoint.includes('/api/health')) {
      return this.fallbackData.health;
    }
    
    // Default fallback
    return {
      status: 'offline',
      message: 'Service temporarily unavailable',
      data: null
    };
  }

  /**
   * Create fallback service implementation
   */
  private createFallbackService(): FallbackData {
    return {
      models: [
        {
          id: 1,
          name: 'Persian Legal BERT (Offline)',
          type: 'persian-bert',
          status: 'completed',
          accuracy: 0.92,
          loss: 0.15,
          epochs: 10,
          current_epoch: 10,
          dataset_id: 'iran-legal-qa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'DoRA Legal QA (Offline)',
          type: 'dora',
          status: 'training',
          accuracy: 0.87,
          loss: 0.22,
          epochs: 15,
          current_epoch: 8,
          dataset_id: 'legal-laws',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      datasets: [
        {
          id: 'iran-legal-qa',
          name: 'پرسش و پاسخ حقوقی ایران',
          source: 'huggingface',
          huggingface_id: 'PerSets/iran-legal-persian-qa',
          samples: 10247,
          size_mb: 15.2,
          status: 'available',
          type: 'qa',
          description: 'مجموعه پرسش و پاسخ حقوقی ایران'
        },
        {
          id: 'legal-laws',
          name: 'متون قوانین ایران',
          source: 'huggingface',
          huggingface_id: 'QomSSLab/legal_laws_lite_chunk_v1',
          samples: 50000,
          size_mb: 125.8,
          status: 'available',
          type: 'laws',
          description: 'مجموعه متون قوانین ایران'
        }
      ],
      analytics: {
        status: 'offline',
        data: {
          modelStats: [
            { type: 'persian-bert', count: 1, avg_accuracy: 0.92, max_accuracy: 0.92 },
            { type: 'dora', count: 1, avg_accuracy: 0.87, max_accuracy: 0.87 }
          ],
          trainingStats: [],
          recentActivity: [
            { level: 'info', count: 45 },
            { level: 'warning', count: 3 },
            { level: 'error', count: 1 }
          ],
          summary: {
            totalModels: 2,
            activeTraining: 1,
            completedModels: 1,
            totalDatasets: 2
          }
        }
      },
      health: {
        status: 'fallback',
        message: 'Using offline mode - backend unavailable'
      }
    };
  }

  /**
   * Enhanced API call with retry logic
   */
  async callWithRetry<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const attemptKey = endpoint;
    const currentAttempts = this.retryAttempts.get(attemptKey) || 0;

    if (currentAttempts >= this.maxRetries) {
      console.warn(`Max retries exceeded for ${endpoint}, using fallback`);
      return this.handleAPIFallback(endpoint) as T;
    }

    try {
      const result = await this.handleAPICall<T>(endpoint, options);
      this.retryAttempts.delete(attemptKey); // Reset on success
      return result;
    } catch (error) {
      this.retryAttempts.set(attemptKey, currentAttempts + 1);
      
      if (currentAttempts < this.maxRetries - 1) {
        const delay = this.retryDelay * Math.pow(2, currentAttempts);
        console.log(`Retrying ${endpoint} in ${delay}ms (attempt ${currentAttempts + 1}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry<T>(endpoint, options);
      } else {
        throw error;
      }
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    // Network errors are retryable
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }
    
    // 5xx server errors are retryable
    if (error.status >= 500) {
      return true;
    }
    
    // 429 (rate limit) is retryable
    if (error.status === 429) {
      return true;
    }
    
    return false;
  }

  /**
   * Log API error for debugging
   */
  private logApiError(endpoint: string, error: any): void {
    const errorInfo = {
      endpoint,
      timestamp: new Date().toISOString(),
      error: error.message || error,
      status: error.status,
      retryable: this.isRetryableError(error)
    };
    
    console.error('API Error Details:', errorInfo);
    
    // In production, you might want to send this to a logging service
    // this.sendToLoggingService(errorInfo);
  }

  /**
   * Get current retry attempts for an endpoint
   */
  getRetryAttempts(endpoint: string): number {
    return this.retryAttempts.get(endpoint) || 0;
  }

  /**
   * Reset retry attempts for an endpoint
   */
  resetRetryAttempts(endpoint: string): void {
    this.retryAttempts.delete(endpoint);
  }

  /**
   * Get fallback data
   */
  getFallbackData(): FallbackData {
    return this.fallbackData;
  }

  /**
   * Update fallback data
   */
  updateFallbackData(updates: Partial<FallbackData>): void {
    this.fallbackData = { ...this.fallbackData, ...updates };
  }
}

// Export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance();

// Export convenience function
export const handleAPICall = <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  return apiErrorHandler.handleAPICall<T>(endpoint, options);
};

export default apiErrorHandler;