import { useState, useEffect, useCallback } from 'react';
import { TrainingSession, TrainingProgress, TrainingMetrics, ModelCheckpoint, ModelConfiguration } from '../types/training';
import { db } from '../services/database';
import { trainingSimulator } from '../services/simulation/TrainingSimulator';
import { useAuth } from './useAuth';

export function useTraining() {
  const { user, updateUserStatistics } = useAuth();
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [sessionProgress, setSessionProgress] = useState<Map<string, TrainingProgress>>(new Map());
  const [sessionMetrics, setSessionMetrics] = useState<Map<string, TrainingMetrics>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load training sessions
  const loadSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const sessions = await db.trainingSessions
        .where('userId')
        .equals(user.id)
        .orderBy('createdAt')
        .reverse()
        .toArray();
      
      setTrainingSessions(sessions);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری جلسات آموزش';
      setError(errorMessage);
      await db.log('error', 'training', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load sessions on mount and user change
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Create new training session
  const createSession = useCallback(async (
    name: string,
    modelType: TrainingSession['modelType'],
    configuration: ModelConfiguration
  ): Promise<TrainingSession> => {
    if (!user) throw new Error('کاربر وارد نشده است');

    try {
      const newSession: TrainingSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
        userId: user.id
      };

      await db.trainingSessions.add(newSession);
      setTrainingSessions(prev => [newSession, ...prev]);
      
      // Update user statistics
      await updateUserStatistics({
        totalTrainingSessions: (user.statistics.totalTrainingSessions || 0) + 1
      });

      await db.log('info', 'training', `Created new training session: ${name}`);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد جلسه آموزش';
      setError(errorMessage);
      await db.log('error', 'training', errorMessage);
      throw new Error(errorMessage);
    }
  }, [user, updateUserStatistics]);

  // Start training session
  const startTraining = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const session = await db.trainingSessions.get(sessionId);
      if (!session) throw new Error('جلسه آموزش یافت نشد');

      // Update session status
      await db.trainingSessions.update(sessionId, { 
        status: 'running', 
        updatedAt: new Date() 
      });

      // Update local state
      setTrainingSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: 'running' } : s
      ));
      
      const updatedSession = { ...session, status: 'running' as const };
      setActiveSession(updatedSession);

      // Start training simulation
      await trainingSimulator.startTraining(
        updatedSession,
        // Progress callback
        (id: string, progress: TrainingProgress, metrics: TrainingMetrics) => {
          setSessionProgress(prev => new Map(prev).set(id, progress));
          setSessionMetrics(prev => new Map(prev).set(id, metrics));
          
          // Update session in database periodically
          if (progress.currentStep % 10 === 0) {
            db.trainingSessions.update(id, { 
              progress, 
              metrics, 
              updatedAt: new Date() 
            });
          }
        },
        // Complete callback
        async (id: string) => {
          await db.trainingSessions.update(id, { 
            status: 'completed', 
            updatedAt: new Date() 
          });
          
          setTrainingSessions(prev => prev.map(s => 
            s.id === id ? { ...s, status: 'completed' } : s
          ));

          if (activeSession?.id === id) {
            setActiveSession(null);
          }

          // Update user statistics
          if (user) {
            const finalProgress = sessionProgress.get(id);
            const finalMetrics = sessionMetrics.get(id);
            const sessionDuration = Date.now() - new Date(session.createdAt).getTime();
            
            await updateUserStatistics({
              completedSessions: (user.statistics.completedSessions || 0) + 1,
              totalTrainingTime: (user.statistics.totalTrainingTime || 0) + (sessionDuration / 60000), // minutes
              bestModelAccuracy: Math.max(
                user.statistics.bestModelAccuracy || 0,
                finalProgress?.validationAccuracy[finalProgress.validationAccuracy.length - 1] || 0
              ),
              averageSessionDuration: sessionDuration / 60000, // This would need proper averaging in real implementation
              lastActivityDate: new Date()
            });
          }

          await db.log('info', 'training', `Training completed: ${session.name}`);
        },
        // Error callback
        async (id: string, errorMsg: string) => {
          await db.trainingSessions.update(id, { 
            status: 'failed', 
            updatedAt: new Date() 
          });
          
          setTrainingSessions(prev => prev.map(s => 
            s.id === id ? { ...s, status: 'failed' } : s
          ));

          if (activeSession?.id === id) {
            setActiveSession(null);
          }

          setError(`خطا در آموزش: ${errorMsg}`);
          await db.log('error', 'training', `Training failed: ${errorMsg}`);
        }
      );

      await db.log('info', 'training', `Started training: ${session.name}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در شروع آموزش';
      setError(errorMessage);
      await db.log('error', 'training', errorMessage);
      throw new Error(errorMessage);
    }
  }, [activeSession, sessionProgress, user, updateUserStatistics]);

  // Stop training session
  const stopTraining = useCallback(async (sessionId: string): Promise<void> => {
    try {
      trainingSimulator.stopTraining(sessionId);
      
      await db.trainingSessions.update(sessionId, { 
        status: 'paused', 
        updatedAt: new Date() 
      });

      setTrainingSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: 'paused' } : s
      ));

      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }

      await db.log('info', 'training', `Training stopped: ${sessionId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در توقف آموزش';
      setError(errorMessage);
      await db.log('error', 'training', errorMessage);
    }
  }, [activeSession]);

  // Delete training session
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      // Stop training if running
      if (activeSession?.id === sessionId) {
        trainingSimulator.stopTraining(sessionId);
        setActiveSession(null);
      }

      // Delete checkpoints
      const checkpoints = await db.modelCheckpoints.where('sessionId').equals(sessionId).toArray();
      await db.modelCheckpoints.where('sessionId').equals(sessionId).delete();

      // Delete session
      await db.trainingSessions.delete(sessionId);

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

      await db.log('info', 'training', `Deleted training session: ${sessionId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در حذف جلسه آموزش';
      setError(errorMessage);
      await db.log('error', 'training', errorMessage);
      throw new Error(errorMessage);
    }
  }, [activeSession]);

  // Create checkpoint
  const createCheckpoint = useCallback(async (sessionId: string, description?: string): Promise<ModelCheckpoint | null> => {
    try {
      const checkpoint = trainingSimulator.createCheckpoint(sessionId);
      if (!checkpoint) return null;

      if (description) {
        checkpoint.description = description;
      }

      await db.modelCheckpoints.add(checkpoint);
      
      // Update session with new checkpoint
      setTrainingSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, checkpoints: [...s.checkpoints, checkpoint] }
          : s
      ));

      await db.log('info', 'training', `Created checkpoint: ${checkpoint.id}`);
      return checkpoint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد checkpoint';
      setError(errorMessage);
      await db.log('error', 'training', errorMessage);
      return null;
    }
  }, []);

  // Get session checkpoints
  const getSessionCheckpoints = useCallback(async (sessionId: string): Promise<ModelCheckpoint[]> => {
    try {
      return await db.modelCheckpoints
        .where('sessionId')
        .equals(sessionId)
        .orderBy('timestamp')
        .reverse()
        .toArray();
    } catch (err) {
      console.error('Error getting checkpoints:', err);
      return [];
    }
  }, []);

  // Get training statistics
  const getTrainingStatistics = useCallback(async () => {
    if (!user) return null;

    try {
      const allSessions = await db.trainingSessions.where('userId').equals(user.id).toArray();
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      const runningSessions = allSessions.filter(s => s.status === 'running');
      
      const totalTrainingTime = completedSessions.reduce((acc, session) => {
        const duration = new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime();
        return acc + duration;
      }, 0);

      const bestAccuracy = completedSessions.reduce((best, session) => {
        const sessionBest = Math.max(...(session.progress.validationAccuracy || [0]));
        return Math.max(best, sessionBest);
      }, 0);

      return {
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        runningSessions: runningSessions.length,
        failedSessions: allSessions.filter(s => s.status === 'failed').length,
        totalTrainingTime: totalTrainingTime / (1000 * 60), // minutes
        bestAccuracy,
        averageAccuracy: completedSessions.length > 0 
          ? completedSessions.reduce((acc, session) => {
              const sessionAvg = session.progress.validationAccuracy.length > 0
                ? session.progress.validationAccuracy.reduce((a, b) => a + b) / session.progress.validationAccuracy.length
                : 0;
              return acc + sessionAvg;
            }, 0) / completedSessions.length
          : 0
      };
    } catch (err) {
      console.error('Error getting training statistics:', err);
      return null;
    }
  }, [user]);

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