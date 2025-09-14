import { useState, useEffect } from 'react';

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        setWsStatus('connecting');
        const wsUrl = location.origin.replace(/^http/, 'ws') + '/ws';
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          setWsStatus('connected');
        };

        ws.onclose = () => {
          setIsConnected(false);
          setWsStatus('disconnected');
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          setWsStatus('disconnected');
        };
      } catch (error) {
        setIsConnected(false);
        setWsStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return { isConnected, wsStatus };
}