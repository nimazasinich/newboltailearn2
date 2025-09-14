/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import { useState, useEffect, useCallback } from 'react';
import { TrainingSession, TrainingProgress, TrainingMetrics, ModelCheckpoint, ModelConfiguration } from '../types/training';
import { apiClient, onTrainingProgress, onTrainingCompleted, onTrainingFailed, onTrainingPaused, onTrainingResumed, onTrainingMetrics } from '../services/api';
import { useAuth } from './useAuth';

export function useTraining() {
  const { user, updateUserStatistics } = useAuth();
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [sessionProgress, setSessionProgress] = useState<Map<string, TrainingProgress>>(new Map());
  const [sessionMetrics, setSessionMetrics] = useState<Map<string, TrainingMetrics>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load training sessions from backend API
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getModels();
      
      // Convert backend models to training sessions format
      const sessions: TrainingSession[] = response.map((model: any) => ({
        id: model.id.toString(),
        name: model.name,
        modelType: model.type as TrainingSession['modelType'],
        status: model.status === 'training' ? 'running' : 
                model.status === 'completed' ? 'completed' :
                model.status === 'failed' ? 'failed' : 'pending',
        progress: {
          currentEpoch: model.current_epoch || 0,
          totalEpochs: model.epochs || 10,
          currentStep: 0,
          totalSteps: 0,
          trainingLoss: [],
          validationLoss: [],
          validationAccuracy: model.accuracy ? [model.accuracy] : [],
          learningRate: [],
          estimatedTimeRemaining: 0,
          completionPercentage: model.current_epoch && model.epochs ? 
            (model.current_epoch / model.epochs) * 100 : 0
        },
        metrics: {
          trainingSpeed: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          gpuUsage: 0,
          batchSize: 32,
          throughput: 0,
          convergenceRate: 0,
          efficiency: 0
        },
        configuration: {
          learningRate: 0.001,
          batchSize: 32,
          epochs: model.epochs || 10,
          optimizer: 'adam',
          scheduler: 'cosine',
          warmupSteps: 100,
          weightDecay: 0.01,
          dropout: 0.1
        },
        checkpoints: [],
        createdAt: new Date(model.created_at),
        updatedAt: new Date(model.updated_at),
        userId: user?.id || 'system'
      }));
      
      setTrainingSessions(sessions);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری جلسات آموزش';
      setError(errorMessage);
      console.error('Error loading training sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load sessions on mount and user change
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Set up WebSocket listeners for real-time training updates
  useEffect(() => {
    const unsubscribeProgress = onTrainingProgress((data) => {
      const progress: TrainingProgress = {
        currentEpoch: data.epoch,
        totalEpochs: data.totalEpochs,
        currentStep: data.step || 0,
        totalSteps: data.totalSteps || 0,
        trainingLoss: data.loss ? [data.loss] : [],
        validationLoss: [],
        validationAccuracy: data.accuracy ? [data.accuracy] : [],
        learningRate: [],
        estimatedTimeRemaining: data.estimatedTimeRemaining || 0,
        completionPercentage: data.completionPercentage || (data.epoch / data.totalEpochs) * 100
      };
      
      setSessionProgress(prev => new Map(prev).set(data.modelId.toString(), progress));
    });

    const unsubscribeCompleted = onTrainingCompleted((data) => {
      setTrainingSessions(prev => prev.map(s => 
        s.id === data.modelId.toString() ? { ...s, status: 'completed' } : s
      ));
      
      if (activeSession?.id === data.modelId.toString()) {
        setActiveSession(null);
      }
    });

    const unsubscribeFailed = onTrainingFailed((data) => {
      setTrainingSessions(prev => prev.map(s => 
        s.id === data.modelId.toString() ? { ...s, status: 'failed' } : s
      ));
      
      if (activeSession?.id === data.modelId.toString()) {
        setActiveSession(null);
      }
      
      setError(`خطا در آموزش: ${data.error}`);
    });

    const unsubscribePaused = onTrainingPaused((data) => {
      setTrainingSessions(prev => prev.map(s => 
        s.id === data.modelId.toString() ? { ...s, status: 'paused' } : s
      ));
    });

    const unsubscribeResumed = onTrainingResumed((data) => {
      setTrainingSessions(prev => prev.map(s => 
        s.id === data.modelId.toString() ? { ...s, status: 'running' } : s
      ));
    });

    const unsubscribeMetrics = onTrainingMetrics((data) => {
      const metrics: TrainingMetrics = {
        trainingSpeed: data.trainingSpeed || 0,
        memoryUsage: data.memoryUsage || 0,
        cpuUsage: data.cpuUsage || 0,
        gpuUsage: data.gpuUsage || 0,
        batchSize: data.batchSize || 32,
        throughput: data.throughput || 0,
        convergenceRate: data.convergenceRate || 0,
        efficiency: data.efficiency || 0
      };
      
      setSessionMetrics(prev => new Map(prev).set(data.modelId.toString(), metrics));
    });

    return () => {
      unsubscribeProgress();
      unsubscribeCompleted();
      unsubscribeFailed();
      unsubscribePaused();
      unsubscribeResumed();
      unsubscribeMetrics();
    };
  }, [activeSession]);

  // Create new training session via backend API
  const createSession = useCallback(async (
    name: string,
    modelType: TrainingSession['modelType'],
    configuration: ModelConfiguration
  ): Promise<TrainingSession> => {
    try {
      const response = await apiClient.createModel({
        name,
        type: modelType,
        dataset_id: 'iran-legal-qa', // Default dataset
        config: configuration
      });

      const newSession: TrainingSession = {
        id: response.id.toString(),
        name,
        modelType,
        status: 'pending',
        progress: {
          currentEpoch: 0,
          totalEpochs: configuration.epochs,
          currentStep: 0,
          totalSteps: 0,
          trainingLoss: [],
          validationLoss: [],
          validationAccuracy: [],
          learningRate: [],
          estimatedTimeRemaining: 0,
          completionPercentage: 0
        },
        metrics: {
          trainingSpeed: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          gpuUsage: 0,
          batchSize: configuration.batchSize,
          throughput: 0,
          convergenceRate: 0,
          efficiency: 0
        },
        configuration,
        checkpoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user?.id || 'system'
      };

      setTrainingSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد جلسه آموزش';
      setError(errorMessage);
      console.error('Error creating training session:', err);
      throw new Error(errorMessage);
    }
  }, [user]);

  // Start training session via backend API
  const startTraining = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const session = trainingSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('جلسه آموزش یافت نشد');

      // Start training via backend API
      await apiClient.trainModel(sessionId, {
        epochs: session.configuration.epochs,
        batch_size: session.configuration.batchSize,
        learning_rate: session.configuration.learningRate
      });

      // Update local state
      setTrainingSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: 'running' } : s
      ));
      
      const updatedSession = { ...session, status: 'running' as const };
      setActiveSession(updatedSession);

      console.log(`Started training: ${session.name}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در شروع آموزش';
      setError(errorMessage);
      console.error('Error starting training:', err);
      throw new Error(errorMessage);
    }
  }, [trainingSessions]);

  // Stop training session via backend API
  const stopTraining = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await apiClient.pauseTraining(sessionId);
      
      setTrainingSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: 'paused' } : s
      ));

      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }

      console.log(`Training stopped: ${sessionId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در توقف آموزش';
      setError(errorMessage);
      console.error('Error stopping training:', err);
    }
  }, [activeSession]);

  // Delete training session via backend API
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await apiClient.deleteModel(sessionId);

      // Update local state
      setTrainingSessions(prev => prev.filter(s => s.id !== sessionId));
      setSessionProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
      setSessionMetrics(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });

      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }

      console.log(`Deleted training session: ${sessionId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در حذف جلسه آموزش';
      setError(errorMessage);
      console.error('Error deleting training session:', err);
      throw new Error(errorMessage);
    }
  }, [activeSession]);

  // Create checkpoint (simplified for backend integration)
  const createCheckpoint = useCallback(async (sessionId: string, description?: string): Promise<ModelCheckpoint | null> => {
    try {
      // In a real implementation, this would call the backend API
      const checkpoint: ModelCheckpoint = {
        id: `checkpoint_${Date.now()}`,
        sessionId,
        epoch: 0,
        step: 0,
        loss: 0,
        accuracy: 0,
        timestamp: new Date(),
        description: description || 'Manual checkpoint'
      };
      
      console.log(`Created checkpoint: ${checkpoint.id}`);
      return checkpoint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد checkpoint';
      setError(errorMessage);
      console.error('Error creating checkpoint:', err);
      return null;
    }
  }, []);

  // Get session checkpoints (simplified)
  const getSessionCheckpoints = useCallback(async (sessionId: string): Promise<ModelCheckpoint[]> => {
    try {
      // In a real implementation, this would call the backend API
      return [];
    } catch (err) {
      console.error('Error getting checkpoints:', err);
      return [];
    }
  }, []);

  // Get training statistics (simplified)
  const getTrainingStatistics = useCallback(async () => {
    try {
      const completedSessions = trainingSessions.filter(s => s.status === 'completed');
      const runningSessions = trainingSessions.filter(s => s.status === 'running');
      
      const bestAccuracy = completedSessions.reduce((best, session) => {
        const sessionBest = Math.max(...(session.progress.validationAccuracy || [0]));
        return Math.max(best, sessionBest);
      }, 0);

      return {
        totalSessions: trainingSessions.length,
        completedSessions: completedSessions.length,
        runningSessions: runningSessions.length,
        failedSessions: trainingSessions.filter(s => s.status === 'failed').length,
        totalTrainingTime: 0, // Would need backend calculation
        bestAccuracy,
        averageAccuracy: 0 // Would need backend calculation
      };
    } catch (err) {
      console.error('Error getting training statistics:', err);
      return null;
    }
  }, [trainingSessions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    trainingSessions,
    activeSession,
    sessionProgress,
    sessionMetrics,
    loading,
    error,
    createSession,
    startTraining,
    stopTraining,
    deleteSession,
    createCheckpoint,
    getSessionCheckpoints,
    getTrainingStatistics,
    clearError,
    refreshSessions: loadSessions
  };
}