/**
 * EMERGENCY STATIC MODE CONFIGURATION
 * This file implements the critical fixes for GitHub Pages deployment
 * 
 * CRITICAL: This converts the app from server-based to static-only mode
 */

// Detect if we're running on GitHub Pages
export const IS_GITHUB_PAGES = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('github.com'));

// Static mode configuration
export const STATIC_MODE_CONFIG = {
  mode: IS_GITHUB_PAGES ? 'static' : 'development',
  api: {
    baseURL: IS_GITHUB_PAGES ? '/api/mock' : 'http://localhost:8080/api',
    timeout: 5000
  },
  websocket: {
    enabled: !IS_GITHUB_PAGES,
    url: IS_GITHUB_PAGES ? '' : 'ws://localhost:8080/'
  },
  healthChecks: {
    enabled: !IS_GITHUB_PAGES,
    interval: 30000
  }
};

// Mock data for static mode
export const MOCK_DATA = {
  health: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'static',
    version: '1.0.0',
    uptime: '100%'
  },
  models: [
    {
      id: 1,
      name: 'Persian Legal BERT',
      status: 'active',
      accuracy: 0.95,
      lastTrained: '2024-01-15T10:30:00Z',
      category: 'classification',
      size: '440MB'
    },
    {
      id: 2,
      name: 'Legal Document Classifier',
      status: 'training',
      accuracy: 0.87,
      lastTrained: '2024-01-14T15:45:00Z',
      category: 'classification',
      size: '320MB'
    },
    {
      id: 3,
      name: 'Contract Analysis Model',
      status: 'active',
      accuracy: 0.92,
      lastTrained: '2024-01-13T09:20:00Z',
      category: 'analysis',
      size: '280MB'
    }
  ],
  datasets: [
    {
      id: 1,
      name: 'Persian Legal Documents',
      size: '2.1GB',
      samples: 50000,
      type: 'training',
      lastUpdated: '2024-01-15T08:00:00Z',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Contract Templates',
      size: '500MB',
      samples: 12000,
      type: 'validation',
      lastUpdated: '2024-01-14T12:30:00Z',
      status: 'ready'
    },
    {
      id: 3,
      name: 'Legal Precedents',
      size: '1.8GB',
      samples: 35000,
      type: 'training',
      lastUpdated: '2024-01-13T16:45:00Z',
      status: 'processing'
    }
  ],
  analytics: {
    totalModels: 3,
    totalDatasets: 3,
    cpuUsage: 45,
    memoryUsage: 60,
    diskUsage: 75,
    systemStatus: 'operational',
    lastUpdate: new Date().toISOString()
  },
  logs: [
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'info',
      message: 'Model training completed successfully',
      source: 'training-service'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: 'info',
      message: 'Dataset validation passed',
      source: 'data-service'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 900000).toISOString(),
      level: 'warning',
      message: 'High memory usage detected',
      source: 'monitoring-service'
    }
  ]
};

// Mock API implementation
export class MockAPI {
  private static instance: MockAPI;
  
  public static getInstance(): MockAPI {
    if (!MockAPI.instance) {
      MockAPI.instance = new MockAPI();
    }
    return MockAPI.instance;
  }

  async get(endpoint: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    switch (endpoint) {
      case '/api/health':
        return MOCK_DATA.health;
      case '/api/models':
        return MOCK_DATA.models;
      case '/api/datasets':
        return MOCK_DATA.datasets;
      case '/api/analytics':
        return MOCK_DATA.analytics;
      case '/api/logs':
        return MOCK_DATA.logs;
      default:
        return { error: 'Endpoint not found', endpoint };
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    switch (endpoint) {
      case '/api/models/train':
        return { success: true, message: 'Training started in static mode' };
      case '/api/datasets/upload':
        return { success: true, message: 'Upload simulated in static mode' };
      default:
        return { success: true, message: 'Operation simulated in static mode' };
    }
  }
}

// Static mode initialization
export function initializeStaticMode(): void {
  if (!IS_GITHUB_PAGES) return;
  
  console.log('🔧 EMERGENCY: Initializing static mode for GitHub Pages');
  
  // Set global static mode flag
  (window as any).STATIC_MODE = true;
  
  // Override console.error for health check failures
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('api/health') || 
        message.includes('WebSocket') || 
        message.includes('localhost:8080')) {
      // Suppress these specific errors in static mode
      console.warn('🔧 Suppressed error in static mode:', message);
      return;
    }
    originalError.apply(console, args);
  };
  
  // Initialize mock API
  (window as any).mockAPI = MockAPI.getInstance();
  
  // Disable WebSocket completely
  (window as any).WebSocket = class MockWebSocket {
    constructor() {
      console.log('🔧 WebSocket disabled in static mode');
    }
    close() {}
    send() {}
    get readyState() { return 3; } // CLOSED
  };
  
  // Disable fetch for localhost
  const originalFetch = window.fetch;
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('localhost:8080')) {
      console.warn('🔧 Blocked localhost request in static mode:', url);
      return Promise.reject(new Error('Static mode: localhost requests blocked'));
    }
    return originalFetch(input, init);
  };
  
  console.log('✅ Static mode initialization complete');
}

// Auto-initialize static mode
if (typeof window !== 'undefined') {
  initializeStaticMode();
}