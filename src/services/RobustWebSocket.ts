/**
 * Robust WebSocket Service with Exponential Backoff and Error Handling
 * Implements the mandatory WebSocket reliability patterns
 */

import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url?: string;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export interface WebSocketStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  retryCount: number;
  lastConnected: Date | null;
  lastError: Date | null;
}

export class RobustWebSocket {
  private socket: Socket | null = null;
  private config: Required<WebSocketConfig>;
  private retryCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private status: WebSocketStatus = {
    connected: false,
    connecting: false,
    error: null,
    retryCount: 0,
    lastConnected: null,
    lastError: null
  };
  private listeners = new Map<string, Set<Function>>();
  private isDestroyed = false;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || this.getDefaultUrl(),
      maxRetries: config.maxRetries || 5,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      connectionTimeout: config.connectionTimeout || 10000
    };
  }

  private getDefaultUrl(): string {
    if (typeof window === 'undefined') return '';
    
    // Use the backend server port 8080
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080`;
  }

  /**
   * Connect to WebSocket server with exponential backoff
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error('WebSocket service has been destroyed'));
        return;
      }

      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.status.connecting = true;
      this.status.error = null;

      console.log(`🔌 Attempting WebSocket connection to ${this.config.url} (attempt ${this.retryCount + 1})`);

      this.socket = io(this.config.url, {
        transports: ['websocket', 'polling'],
        timeout: this.config.connectionTimeout,
        reconnection: false, // We handle reconnection manually
        forceNew: true
      });

      // Connection timeout
      const timeout = setTimeout(() => {
        if (!this.socket?.connected) {
          this.handleConnectionError(new Error('Connection timeout'));
          reject(new Error('Connection timeout'));
        }
      }, this.config.connectionTimeout);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        this.handleConnectionSuccess();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        this.handleConnectionError(error);
        reject(error);
      });

      this.setupEventHandlers();
    });
  }

  /**
   * Handle successful connection
   */
  private handleConnectionSuccess(): void {
    console.log('✅ WebSocket connected successfully');
    this.retryCount = 0;
    this.status.connected = true;
    this.status.connecting = false;
    this.status.error = null;
    this.status.lastConnected = new Date();
    this.status.retryCount = this.retryCount;

    this.startHeartbeat();
    this.emit('connected', { socketId: this.socket?.id });
  }

  /**
   * Handle connection error with exponential backoff
   */
  private handleConnectionError(error: Error): void {
    console.error('❌ WebSocket connection error:', error.message);
    
    this.status.connected = false;
    this.status.connecting = false;
    this.status.error = error.message;
    this.status.lastError = new Date();
    this.status.retryCount = this.retryCount;

    this.retryCount++;
    this.emit('connection_error', { error: error.message, retryCount: this.retryCount });

    if (this.retryCount < this.config.maxRetries && !this.isDestroyed) {
      const delay = this.calculateBackoffDelay();
      console.log(`🔄 Retrying WebSocket connection in ${delay}ms (attempt ${this.retryCount + 1}/${this.config.maxRetries})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {
          // Error handling is done in handleConnectionError
        });
      }, delay);
    } else {
      console.error('❌ WebSocket max retries exceeded');
      this.emit('connection_failed', { error: error.message, retryCount: this.retryCount });
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(): number {
    const delay = Math.min(
      this.config.baseDelay * Math.pow(2, this.retryCount - 1),
      this.config.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.status.connected = false;
      this.status.error = reason;
      this.status.lastError = new Date();
      
      this.stopHeartbeat();
      this.emit('disconnected', { reason });

      // Attempt reconnection if not destroyed
      if (!this.isDestroyed && reason !== 'io client disconnect') {
        this.connect().catch(() => {
          // Error handling is done in handleConnectionError
        });
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', { attemptNumber });
    });

    // System metrics
    this.socket.on('system_metrics', (data) => {
      this.emit('system_metrics', data);
    });

    // Training events
    this.socket.on('training:progress', (data) => {
      this.emit('training_progress', data);
    });

    this.socket.on('training:completed', (data) => {
      this.emit('training_completed', data);
    });

    this.socket.on('training:failed', (data) => {
      this.emit('training_failed', data);
    });

    this.socket.on('training:paused', (data) => {
      this.emit('training_paused', data);
    });

    this.socket.on('training:resumed', (data) => {
      this.emit('training_resumed', data);
    });

    // Model events
    this.socket.on('model:updated', (data) => {
      this.emit('model_updated', data);
    });

    // Dataset events
    this.socket.on('dataset:updated', (data) => {
      this.emit('dataset_updated', data);
    });

    this.socket.on('dataset:download:progress', (data) => {
      this.emit('dataset_download_progress', data);
    });

    // Optimization events
    this.socket.on('optimization_progress', (data) => {
      this.emit('optimization_progress', data);
    });

    this.socket.on('optimization_completed', (data) => {
      this.emit('optimization_completed', data);
    });

    this.socket.on('optimization_failed', (data) => {
      this.emit('optimization_failed', data);
    });

    this.socket.on('optimization_stopped', (data) => {
      this.emit('optimization_stopped', data);
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    
    this.isDestroyed = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.status.connected = false;
    this.status.connecting = false;
    this.emit('disconnected', { reason: 'manual_disconnect' });
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  /**
   * Send message to server
   */
  send(event: string, data?: any): boolean {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    } else {
      console.warn('WebSocket not connected. Message not sent:', event, data);
      return false;
    }
  }

  /**
   * Join room
   */
  joinRoom(room: string): boolean {
    return this.send('join', { room });
  }

  /**
   * Leave room
   */
  leaveRoom(room: string): boolean {
    return this.send('leave', { room });
  }

  /**
   * Subscribe to model training updates
   */
  subscribeToModel(modelId: number): boolean {
    return this.joinRoom(`model_${modelId}`);
  }

  /**
   * Unsubscribe from model training updates
   */
  unsubscribeFromModel(modelId: number): boolean {
    return this.leaveRoom(`model_${modelId}`);
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  get socketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Get current status
   */
  get currentStatus(): WebSocketStatus {
    return { ...this.status };
  }

  /**
   * Get reconnection attempts
   */
  get reconnectionAttempts(): number {
    return this.retryCount;
  }

  /**
   * Check if service is destroyed
   */
  get destroyed(): boolean {
    return this.isDestroyed;
  }
}

// Export singleton instance
export const robustWebSocket = new RobustWebSocket();

// Auto-connect when in browser environment
if (typeof window !== 'undefined') {
  robustWebSocket.connect().catch((error) => {
    console.warn('Failed to auto-connect WebSocket:', error.message);
  });
}

export default robustWebSocket;