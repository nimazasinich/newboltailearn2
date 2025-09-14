/* ARCHIVED: INCOMPLETE_OR_LEGACY
   Reason: superseded by unified routing & data layer on port 5137 / API 3001
   Moved: 2025-09-14
*/

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Brain, Database, 
  Clock, Target, Zap, Award, BarChart3, PieChart as PieChartIcon,
  Download, Filter, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useMonitoring } from '../../hooks/useMonitoring';

interface ModelPerformanceMetrics {
  modelId: number;
  modelName: string;
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: number;
  inferenceTime: number;
  memoryUsage: number;
  convergenceRate: number;
  stability: number;
  lastUpdated: string;
}

interface TrainingAnalytics {
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  averageTrainingTime: number;
  bestAccuracy: number;
  totalTrainingHours: number;
  modelsByType: Record<string, number>;
  performanceTrend: Array<{
    date: string;
    accuracy: number;
    loss: number;
    trainingTime: number;
  }>;
}

interface SystemAnalytics {
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  diskUsage: number;
  networkThroughput: number;
  activeConnections: number;
  errorRate: number;
  uptime: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AdvancedAnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { 
    modelPerformance, 
    trainingAnalytics, 
    systemAnalytics, 
    loading, 
    error,
    refreshAnalytics,
    exportAnalytics
  } = useAnalytics();
  
  const { monitoringData } = useMonitoring();

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshAnalytics]);

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      await exportAnalytics(format, selectedTimeRange);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getPerformanceGrade = (score: number): { grade: string; color: string } => {
    if (score >= 0.9) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 0.8) return { grade: 'A', color: 'text-green-500' };
    if (score >= 0.7) return { grade: 'B', color: 'text-yellow-500' };
    if (score >= 0.6) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  const filteredModels = selectedModel === 'all' 
    ? modelPerformance 
    : modelPerformance.filter(m => m.modelType === selectedModel);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading analytics: {error}</div>
        <Button onClick={refreshAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive model performance and system insights</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Auto Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalytics}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex gap-1">
            <Button size="sm" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button size="sm" onClick={() => handleExport('json')}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Time Range:</label>
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Model Type:</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Models</option>
            <option value="persian-bert">Persian BERT</option>
            <option value="dora">DoRA</option>
            <option value="qr-adaptor">QR-Adaptor</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">View:</label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Models</p>
                <p className="text-2xl font-bold text-gray-900">{trainingAnalytics.totalSessions}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {trainingAnalytics.successfulSessions} successful
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(trainingAnalytics.bestAccuracy * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.3% from last week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trainingAnalytics.totalTrainingHours.toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-1" />
                Avg: {(trainingAnalytics.averageTrainingTime / 3600).toFixed(1)}h per model
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monitoringData?.metrics ? 
                    `${(100 - monitoringData.metrics.cpu).toFixed(0)}%` : 
                    'N/A'
                  }
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <Progress 
                value={monitoringData?.metrics ? 100 - monitoringData.metrics.cpu : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
          <TabsTrigger value="training">Training Analytics</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
        </TabsList>

        {/* Model Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Model Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredModels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="modelName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#0088FE" name="Accuracy" />
                    <Bar dataKey="f1Score" fill="#00C49F" name="F1 Score" />
                    <Bar dataKey="precision" fill="#FFBB28" name="Precision" />
                    <Bar dataKey="recall" fill="#FF8042" name="Recall" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Performance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(trainingAnalytics.modelsByType).map(([type, count]) => ({
                        name: type,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(trainingAnalytics.modelsByType).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Table */}
          {viewMode === 'detailed' && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Model</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Accuracy</th>
                        <th className="text-left p-2">F1 Score</th>
                        <th className="text-left p-2">Training Time</th>
                        <th className="text-left p-2">Grade</th>
                        <th className="text-left p-2">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModels.map((model) => {
                        const grade = getPerformanceGrade(model.accuracy);
                        return (
                          <tr key={model.modelId} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{model.modelName}</td>
                            <td className="p-2">
                              <Badge variant="outline">{model.modelType}</Badge>
                            </td>
                            <td className="p-2">{(model.accuracy * 100).toFixed(1)}%</td>
                            <td className="p-2">{(model.f1Score * 100).toFixed(1)}%</td>
                            <td className="p-2">{(model.trainingTime / 3600).toFixed(1)}h</td>
                            <td className="p-2">
                              <Badge className={grade.color}>{grade.grade}</Badge>
                            </td>
                            <td className="p-2 text-gray-600">
                              {new Date(model.lastUpdated).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Training Analytics Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Training Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trainingAnalytics.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="accuracy" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Accuracy"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="loss" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Loss"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Training Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Training Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={filteredModels}>
                    <CartesianGrid />
                    <XAxis dataKey="trainingTime" name="Training Time (hours)" />
                    <YAxis dataKey="accuracy" name="Accuracy" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="accuracy" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Metrics Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: 'CPU', value: monitoringData?.metrics.cpu || 0 },
                    { name: 'Memory', value: monitoringData?.metrics.memory.percentage || 0 },
                    { name: 'Process', value: monitoringData?.metrics.process_memory.percentage || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{monitoringData?.metrics.cpu || 0}%</span>
                  </div>
                  <Progress value={monitoringData?.metrics.cpu || 0} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{monitoringData?.metrics.memory.percentage || 0}%</span>
                  </div>
                  <Progress value={monitoringData?.metrics.memory.percentage || 0} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Process Memory</span>
                    <span>{monitoringData?.metrics.process_memory.percentage || 0}%</span>
                  </div>
                  <Progress value={monitoringData?.metrics.process_memory.percentage || 0} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Model Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Type Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={Object.entries(trainingAnalytics.modelsByType).map(([type, count]) => ({
                  type,
                  count,
                  avgAccuracy: filteredModels
                    .filter(m => m.modelType === type)
                    .reduce((acc, m) => acc + m.accuracy, 0) / count || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Model Count" />
                  <Bar yAxisId="right" dataKey="avgAccuracy" fill="#82ca9d" name="Avg Accuracy" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}