import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { SystemMetricsSchema, TrainingSessionSchema, DatasetSchema } from '../../src/services/api';

// Mock fetch and localStorage globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => ''),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = mockLocalStorage as any;

describe('API Zod Schemas', () => {
  describe('SystemMetricsSchema', () => {
    it('should validate correct system metrics data', () => {
      const validData = {
        cpu: 45.5,
        memory: {
          used: 8000000000,
          total: 16000000000,
          percentage: 50.0
        },
        disk: {
          used: 500000000000,
          total: 1000000000000,
          percentage: 50.0
        },
        network: {
          download: 1000000,
          upload: 500000
        },
        uptime: 86400,
        temperature: 65.5,
        timestamp: '2024-09-14T21:00:00Z'
      };

      const result = SystemMetricsSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid system metrics data', () => {
      const invalidData = {
        cpu: 'invalid', // should be number
        memory: {
          used: 8000000000,
          total: 16000000000,
          percentage: 50.0
        },
        // missing disk, network, uptime, timestamp
      };

      expect(() => SystemMetricsSchema.parse(invalidData)).toThrow();
    });

    it('should allow optional temperature field', () => {
      const validDataWithoutTemp = {
        cpu: 45.5,
        memory: {
          used: 8000000000,
          total: 16000000000,
          percentage: 50.0
        },
        disk: {
          used: 500000000000,
          total: 1000000000000,
          percentage: 50.0
        },
        network: {
          download: 1000000,
          upload: 500000
        },
        uptime: 86400,
        timestamp: '2024-09-14T21:00:00Z'
      };

      const result = SystemMetricsSchema.parse(validDataWithoutTemp);
      expect(result.temperature).toBeUndefined();
    });
  });

  describe('TrainingSessionSchema', () => {
    it('should validate correct training session data', () => {
      const validData = {
        id: 1,
        name: 'Test Model',
        type: 'persian-bert',
        status: 'training',
        accuracy: 0.85,
        loss: 0.25,
        epochs: 50,
        current_epoch: 25,
        progress: 50.0,
        dataset_id: 'dataset-1',
        estimated_time: 3600,
        learning_rate: 0.001,
        batch_size: 32,
        created_at: '2024-09-01T10:00:00Z',
        updated_at: '2024-09-14T21:00:00Z',
        metrics_history: [
          {
            epoch: 1,
            accuracy: 0.45,
            loss: 0.85,
            timestamp: '2024-09-01T10:30:00Z'
          },
          {
            epoch: 25,
            accuracy: 0.85,
            loss: 0.25,
            timestamp: '2024-09-14T21:00:00Z'
          }
        ]
      };

      const result = TrainingSessionSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept both string and number IDs', () => {
      const dataWithStringId = {
        id: 'model-123',
        name: 'Test Model',
        type: 'dora',
        status: 'completed',
        accuracy: 0.92,
        loss: 0.15,
        epochs: 100,
        current_epoch: 100,
        progress: 100.0,
        dataset_id: 456,
        estimated_time: 0,
        learning_rate: 0.0005,
        batch_size: 16,
        created_at: '2024-08-01T10:00:00Z',
        updated_at: '2024-08-15T16:30:00Z',
        metrics_history: []
      };

      const result = TrainingSessionSchema.parse(dataWithStringId);
      expect(result.id).toBe('model-123');
      expect(result.dataset_id).toBe(456);
    });
  });

  describe('DatasetSchema', () => {
    it('should validate correct dataset data', () => {
      const validData = {
        id: 'dataset-1',
        name: 'Persian Legal Documents',
        source: 'huggingface:persian-legal',
        samples: 15420,
        size_mb: 12.3,
        status: 'ready',
        type: 'legal-text',
        created_at: '2024-01-15T10:30:00Z',
        last_used: '2024-09-14T20:00:00Z'
      };

      const result = DatasetSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should allow optional last_used field', () => {
      const validDataWithoutLastUsed = {
        id: 123,
        name: 'Test Dataset',
        source: 'local',
        samples: 1000,
        size_mb: 5.0,
        status: 'processing',
        type: 'text',
        created_at: '2024-09-14T21:00:00Z'
      };

      const result = DatasetSchema.parse(validDataWithoutLastUsed);
      expect(result.last_used).toBeUndefined();
    });
  });
});

describe('API Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('');
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { API } = await import('../../src/services/api');
    
    await expect(API.health()).rejects.toThrow('Network error');
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockResolvedValue({ error: 'Server error' })
    });

    const { API } = await import('../../src/services/api');
    
    await expect(API.health()).rejects.toThrow('HTTP 500: Internal Server Error');
  });

  it('should handle invalid JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    });

    const { API } = await import('../../src/services/api');
    
    await expect(API.health()).rejects.toThrow('Invalid JSON');
  });
});