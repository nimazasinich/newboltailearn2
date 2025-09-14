import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { API } from '../services/api';
import { websocketService } from '../services/websocket';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Brain,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TrainingSession {
  id: number;
  name: string;
  status: 'training' | 'paused' | 'completed' | 'failed' | 'pending';
  progress: number;
  accuracy: number;
  startTime: string;
  estimatedCompletion?: string;
  modelType: string;
  dataset: string;
}

export default function TrainingManagement() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load training sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const models = await API.getModels();
        
        if (models) {
          setSessions(models.map((model: any, index: number) => ({
            id: model.id || index,
            name: model.name || `مدل ${index + 1}`,
            status: model.status || 'pending',
            progress: model.progress || 0,
            accuracy: model.accuracy || 0,
            startTime: model.startTime || new Date().toISOString(),
            estimatedCompletion: model.estimatedCompletion,
            modelType: model.type || 'LSTM',
            dataset: model.dataset || 'قوانین مدنی'
          })));
        }
      } catch (err) {
        console.error('Failed to load training sessions:', err);
        setError('خطا در بارگذاری جلسات آموزش');
        // Fallback data
        setSessions([
          {
            id: 1,
            name: 'مدل طبقه‌بندی اسناد حقوقی',
            status: 'training',
            progress: 65,
            accuracy: 0.87,
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
            modelType: 'BERT',
            dataset: 'قوانین مدنی'
          },
          {
            id: 2,
            name: 'مدل استخراج کلیدواژه',
            status: 'paused',
            progress: 30,
            accuracy: 0.73,
            startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            modelType: 'LSTM',
            dataset: 'قوانین جزایی'
          },
          {
            id: 3,
            name: 'مدل خلاصه‌سازی متن',
            status: 'completed',
            progress: 100,
            accuracy: 0.91,
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            modelType: 'T5',
            dataset: 'قوانین تجاری'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    websocketService.connect();

    const handleTrainingProgress = (data: any) => {
      setSessions(prev => prev.map(session => 
        session.id === data.modelId 
          ? { ...session, progress: data.progress, accuracy: data.accuracy }
          : session
      ));
    };

    const handleTrainingComplete = (data: any) => {
      setSessions(prev => prev.map(session => 
        session.id === data.modelId 
          ? { ...session, status: 'completed', progress: 100 }
          : session
      ));
    };

    const handleTrainingError = (data: any) => {
      setSessions(prev => prev.map(session => 
        session.id === data.modelId 
          ? { ...session, status: 'failed' }
          : session
      ));
    };

    websocketService.on('training_progress', handleTrainingProgress);
    websocketService.on('training_complete', handleTrainingComplete);
    websocketService.on('training_error', handleTrainingError);

    return () => {
      websocketService.off('training_progress', handleTrainingProgress);
      websocketService.off('training_complete', handleTrainingComplete);
      websocketService.off('training_error', handleTrainingError);
    };
  }, []);

  const handleStartTraining = async (sessionId: number) => {
    try {
      await API.startTraining(sessionId);
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status: 'training' } : session
      ));
    } catch (err) {
      console.error('Failed to start training:', err);
    }
  };

  const handlePauseTraining = async (sessionId: number) => {
    try {
      await API.pauseTraining(sessionId);
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status: 'paused' } : session
      ));
    } catch (err) {
      console.error('Failed to pause training:', err);
    }
  };

  const handleResumeTraining = async (sessionId: number) => {
    try {
      await API.resumeTraining(sessionId);
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status: 'training' } : session
      ));
    } catch (err) {
      console.error('Failed to resume training:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'training':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">در حال آموزش</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">متوقف شده</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">تکمیل شده</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">ناموفق</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">در انتظار</Badge>;
      default:
        return <Badge>نامشخص</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعت و ${minutes} دقیقه`;
    }
    return `${minutes} دقیقه`;
  };

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            مدیریت آموزش مدل‌ها
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            نظارت و کنترل جلسات آموزش مدل‌های یادگیری ماشین
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Brain className="h-4 w-4 ml-2" />
          ایجاد مدل جدید
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            در حال نمایش داده‌های نمونه
          </p>
        </div>
      )}

      {/* Training Sessions */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(session.status)}
                    <CardTitle className="text-xl">{session.name}</CardTitle>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">نوع مدل:</span> {session.modelType}
                    </div>
                    <div>
                      <span className="font-medium">مجموعه داده:</span> {session.dataset}
                    </div>
                    <div>
                      <span className="font-medium">مدت زمان:</span> {formatDuration(session.startTime)}
                    </div>
                    <div>
                      <span className="font-medium">دقت فعلی:</span> {(session.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mr-4">
                  {session.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartTraining(session.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {session.status === 'training' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePauseTraining(session.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {session.status === 'paused' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleResumeTraining(session.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>پیشرفت آموزش</span>
                    <span>{session.progress}%</span>
                  </div>
                  <Progress value={session.progress} className="h-2" />
                </div>
                
                {session.status === 'training' && session.estimatedCompletion && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 inline ml-1" />
                    زمان تخمینی تکمیل: {new Date(session.estimatedCompletion).toLocaleTimeString('fa-IR')}
                  </div>
                )}
                
                {session.status === 'completed' && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      آموزش با موفقیت تکمیل شد
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      دقت نهایی: {(session.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
                
                {session.status === 'failed' && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    خطا در آموزش مدل
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              هیچ جلسه آموزشی یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              برای شروع، یک مدل جدید ایجاد کنید
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Brain className="h-4 w-4 ml-2" />
              ایجاد اولین مدل
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}