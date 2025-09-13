import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onReconnect?: (attemptNumber: number) => void;
}

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  reconnectAttempt: number;
}

/**
 * Custom hook for managing WebSocket connections with automatic reconnection
 */
export const useSocketConnection = (options: SocketOptions = {}) => {
  const {
    url = 'http://localhost:3001',
    reconnectAttempts = 5,
    reconnectDelay = 1000,
    onConnect,
    onDisconnect,
    onError,
    onReconnect
  } = options;

  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempt: 0
  });

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  /**
   * Initialize socket connection
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const token = localStorage.getItem('auth_token');
    
    socketRef.current = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false, // We'll handle reconnection manually
    });

    // Connection established
    socketRef.current.on('connect', () => {
      console.log('🔗 Socket connected');
      setState({
        connected: true,
        connecting: false,
        error: null,
        reconnectAttempt: 0
      });
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    });

    // Connection lost
    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false
      }));
      onDisconnect?.();
      
      // Attempt reconnection if not manually disconnected
      if (reason !== 'io client disconnect') {
        attemptReconnect();
      }
    });

    // Reconnection successful
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setState(prev => ({
        ...prev,
        connected: true,
        connecting: false,
        error: null,
        reconnectAttempt: 0
      }));
      reconnectAttemptsRef.current = 0;
      onReconnect?.(attemptNumber);
    });

    // Connection error
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: new Error(error.message)
      }));
      onError?.(error);
      attemptReconnect();
    });

    // Authentication success
    socketRef.current.on('auth:success', (data) => {
      console.log('Socket authenticated:', data);
    });

    // Authentication failure
    socketRef.current.on('auth:failed', (error) => {
      console.error('Socket authentication failed:', error);
      disconnect();
    });

    // Standardized training events
    socketRef.current.on('training:progress', (data) => {
      console.log('📈 Training progress:', data);
    });

    socketRef.current.on('training:completed', (data) => {
      console.log('✅ Training completed:', data);
    });

    socketRef.current.on('training:failed', (data) => {
      console.error('❌ Training failed:', data);
    });

    socketRef.current.on('training:metrics', (data) => {
      console.log('📊 Training metrics:', data);
    });

    // Standardized dataset events
    socketRef.current.on('dataset:download:progress', (data) => {
      console.log('📥 Dataset download progress:', data);
    });

    socketRef.current.on('dataset:updated', (data) => {
      console.log('📁 Dataset updated:', data);
    });

    // System metrics
    socketRef.current.on('system_metrics', (data) => {
      console.log('🖥️ System metrics updated');
    });

    return socketRef.current;
  }, [url, onConnect, onDisconnect, onError]);

  /**
   * Disconnect socket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setState({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempt: 0
    });
    
    reconnectAttemptsRef.current = 0;
  }, []);

  /**
   * Attempt to reconnect with exponential backoff
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      setState(prev => ({
        ...prev,
        error: new Error('Failed to reconnect after maximum attempts')
      }));
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${reconnectAttempts})`);
    
    setState(prev => ({
      ...prev,
      reconnectAttempt: reconnectAttemptsRef.current
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      onReconnect?.(reconnectAttemptsRef.current);
      connect();
    }, delay);
  }, [reconnectAttempts, reconnectDelay, onReconnect, connect]);

  /**
   * Emit event to server
   */
  const emit = useCallback((event: string, data?: any) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, queuing event:', event);
      return false;
    }
    
    socketRef.current.emit(event, data);
    return true;
  }, []);

  /**
   * Listen for events from server
   */
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized');
      return;
    }
    
    socketRef.current.on(event, handler);
    
    // Return cleanup function
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  /**
   * Remove event listener
   */
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (!socketRef.current) {
      return;
    }
    
    if (handler) {
      socketRef.current.off(event, handler);
    } else {
      socketRef.current.off(event);
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, disconnect to save resources
        if (socketRef.current?.connected) {
          console.log('Page hidden, disconnecting socket');
          disconnect();
        }
      } else {
        // Page is visible, reconnect if needed
        if (!socketRef.current?.connected && !state.connecting) {
          console.log('Page visible, reconnecting socket');
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, disconnect, state.connecting]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network online, reconnecting socket');
      if (!socketRef.current?.connected) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
      setState(prev => ({
        ...prev,
        error: new Error('Network offline')
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connect]);

  return {
    socket: socketRef.current,
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    reconnectAttempt: state.reconnectAttempt,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};
