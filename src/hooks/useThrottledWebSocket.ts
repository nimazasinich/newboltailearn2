import { useEffect, useRef, useCallback, useState } from 'react';

// NodeJS types for setTimeout
declare global {
  namespace NodeJS {
    interface Timeout {
      ref(): NodeJS.Timeout;
      unref(): NodeJS.Timeout;
    }
  }
}

const isNode = typeof process !== 'undefined' && process.platform;
import { useWebSocket } from './useWebSocket';
import { WSEventType, WSEventHandler } from '../lib/ws-events';

interface ThrottledWebSocketOptions {
  throttleMs?: number;
  batchSize?: number;
  maxBatchSize?: number;
}

export function useThrottledWebSocket<T = any>(
  eventType: WSEventType,
  handler: WSEventHandler<T>,
  options: ThrottledWebSocketOptions = {}
) {
  const { throttleMs = 250, batchSize = 10, maxBatchSize = 50 } = options;
  const { subscribe } = useWebSocket();
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const batchRef = useRef<T[]>([]);
  const lastProcessedRef = useRef<number>(0);

  const processBatch = useCallback(() => {
    if (batchRef.current.length === 0) return;

    const batch = [...batchRef.current];
    batchRef.current = [];
    
    // Process the batch
    if (batch.length === 1) {
      handler(batch[0]);
    } else {
      // For multiple items, you might want to process them differently
      handler(batch as any);
    }
    
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + batch.length);
  }, [handler]);

  const throttledHandler = useCallback((data: T) => {
    const now = Date.now();
    
    // Add to batch
    batchRef.current.push(data);
    
    // Limit batch size
    if (batchRef.current.length > maxBatchSize) {
      batchRef.current = batchRef.current.slice(-maxBatchSize);
    }
    
    // Clear existing throttle
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    // Set new throttle
    throttleRef.current = setTimeout(() => {
      processBatch();
      throttleRef.current = null;
    }, throttleMs);
    
    // Process immediately if batch is full
    if (batchRef.current.length >= batchSize) {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
        throttleRef.current = null;
      }
      processBatch();
    }
  }, [throttleMs, batchSize, maxBatchSize, processBatch]);

  useEffect(() => {
    const unsubscribe = subscribe(eventType, throttledHandler);
    
    return () => {
      unsubscribe();
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      // Process any remaining items
      if (batchRef.current.length > 0) {
        processBatch();
      }
    };
  }, [subscribe, eventType, throttledHandler, processBatch]);

  return {
    isConnected,
    lastUpdate,
    updateCount,
    pendingUpdates: batchRef.current.length
  };
}

// Specialized hooks for common use cases
export function useThrottledLogs(handler: WSEventHandler<any[]>) {
  return useThrottledWebSocket('log_update', handler, {
    throttleMs: 500,
    batchSize: 5,
    maxBatchSize: 20
  });
}

export function useThrottledMetrics(handler: WSEventHandler<any>) {
  return useThrottledWebSocket('system_metrics', handler, {
    throttleMs: 1000,
    batchSize: 1,
    maxBatchSize: 1
  });
}

export function useThrottledTrainingProgress(handler: WSEventHandler<any>) {
  return useThrottledWebSocket('training_progress', handler, {
    throttleMs: 250,
    batchSize: 3,
    maxBatchSize: 10
  });
}
