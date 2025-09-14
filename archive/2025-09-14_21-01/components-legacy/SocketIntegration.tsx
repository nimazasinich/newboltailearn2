/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import React, { useEffect } from 'react';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { useAppStore } from '../state/store';
import { useAuthStore } from '../state/store';

/**
 * SocketIntegration component that handles WebSocket events
 * and updates the global state accordingly
 */
export const SocketIntegration: React.FC = () => {
  const { socket, connected, error, reconnectAttempt } = useSocketConnection();
  const { setSocketConnected, setSocketReconnectAttempt, setActiveTraining, addNotification } = useAppStore();
  const { token } = useAuthStore();

  // Update socket connection status in global state
  useEffect(() => {
    setSocketConnected(connected);
    setSocketReconnectAttempt(reconnectAttempt);
  }, [connected, reconnectAttempt, setSocketConnected, setSocketReconnectAttempt]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    // Training progress events
    const handleTrainingProgress = (data: any) => {
      setActiveTraining({
        modelId: data.modelId,
        progress: data.completionPercentage || 0,
        epoch: data.epoch,
        loss: data.loss,
        accuracy: data.accuracy
      });

      // Add notification for significant progress
      if (data.epoch && data.epoch % 5 === 0) {
        addNotification({
          type: 'info',
          message: `مدل ${data.modelId}: دوره ${data.epoch} تکمیل شد (دقت: ${(data.accuracy * 100).toFixed(1)}%)`
        });
      }
    };

    // Training completion events
    const handleTrainingCompleted = (data: any) => {
      setActiveTraining(null);
      addNotification({
        type: 'success',
        message: `آموزش مدل ${data.modelId} با موفقیت تکمیل شد`
      });
    };

    // Training failure events
    const handleTrainingFailed = (data: any) => {
      setActiveTraining(null);
      addNotification({
        type: 'error',
        message: `آموزش مدل ${data.modelId} با خطا مواجه شد: ${data.error}`
      });
    };

    // System metrics events
    const handleSystemMetrics = (data: any) => {
      // Update system metrics in global state if needed
      console.log('System metrics received:', data);
    };

    // Dataset download events
    const handleDatasetProgress = (data: any) => {
      addNotification({
        type: 'info',
        message: `دانلود مجموعه داده ${data.id}: ${data.downloaded}/${data.total}`
      });
    };

    // Authentication events
    const handleAuthSuccess = (data: any) => {
      console.log('Socket authenticated:', data);
    };

    const handleAuthFailed = (error: any) => {
      addNotification({
        type: 'error',
        message: 'خطا در احراز هویت WebSocket'
      });
    };

    // Register event listeners
    socket.on('training_progress', handleTrainingProgress);
    socket.on('training_completed', handleTrainingCompleted);
    socket.on('training_failed', handleTrainingFailed);
    socket.on('system_metrics', handleSystemMetrics);
    socket.on('dataset_download_progress', handleDatasetProgress);
    socket.on('auth:success', handleAuthSuccess);
    socket.on('auth:failed', handleAuthFailed);

    // Cleanup function
    return () => {
      socket.off('training_progress', handleTrainingProgress);
      socket.off('training_completed', handleTrainingCompleted);
      socket.off('training_failed', handleTrainingFailed);
      socket.off('system_metrics', handleSystemMetrics);
      socket.off('dataset_download_progress', handleDatasetProgress);
      socket.off('auth:success', handleAuthSuccess);
      socket.off('auth:failed', handleAuthFailed);
    };
  }, [socket, setActiveTraining, addNotification]);

  // Reconnect socket when token changes
  useEffect(() => {
    if (token && socket && !connected) {
      socket.connect();
    }
  }, [token, socket, connected]);

  // This component doesn't render anything
  return null;
};

/**
 * Hook to get socket connection status and utilities
 */
export function useSocketIntegration() {
  const { socket, connected, error, reconnectAttempt, emit, on, off } = useSocketConnection();
  const { activeTraining } = useAppStore();

  const emitTrainingCommand = (command: string, data: any) => {
    return emit(`training:${command}`, data);
  };

  const emitDatasetCommand = (command: string, data: any) => {
    return emit(`dataset:${command}`, data);
  };

  return {
    socket,
    connected,
    error,
    reconnectAttempt,
    activeTraining,
    emit,
    on,
    off,
    emitTrainingCommand,
    emitDatasetCommand
  };
}