/**
 * Reliability Dashboard Component
 * Real-time monitoring of system reliability and fallback status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Server,
  Database,
  Cpu,
  Wifi,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'failed' | 'unknown';
  lastCheck: Date;
  uptime: number;
  errorCount: number;
  fallbackActive: boolean;
  metrics: Record<string, any>;
}

interface FallbackStatus {
  name: string;
  active: boolean;
  activationTime: Date | null;
  failureCount: number;
  successCount: number;
  lastSwitch: Date | null;
  metrics: {
    uptime: number;
    errorRate: number;
    responseTime: number;
  };
}

interface ReliabilityReport {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  components: ComponentStatus[];
  recommendations: string[];
  timestamp: Date;
}

const ReliabilityDashboard: React.FC = () => {
  const [reliabilityReport, setReliabilityReport] = useState<ReliabilityReport | null>(null);
  const [fallbackStatuses, setFallbackStatuses] = useState<FallbackStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadReliabilityData();
    const interval = setInterval(loadReliabilityData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadReliabilityData = async () => {
    setIsRefreshing(true);
    try {
      // Load reliability report
      const reliabilityMonitor = (window as any).reliabilityMonitor;
      if (reliabilityMonitor) {
        const report = reliabilityMonitor.getReliabilityStatus();
        setReliabilityReport(report);
      }

      // Load fallback statuses
      const fallbackManager = (window as any).fallbackSystemManager;
      if (fallbackManager) {
        const statuses = fallbackManager.getAllFallbackStatuses();
        setFallbackStatuses(statuses);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load reliability data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComponentIcon = (componentName: string) => {
    switch (componentName) {
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'cache':
        return <Zap className="h-4 w-4" />;
      case 'ai-pipeline':
        return <Cpu className="h-4 w-4" />;
      case 'websocket':
        return <Wifi className="h-4 w-4" />;
      case 'api-server':
        return <Server className="h-4 w-4" />;
      case 'file-system':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${(uptime * 100).toFixed(1)}%`;
  };

  const formatResponseTime = (responseTime: number) => {
    if (responseTime < 1000) {
      return `${responseTime}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(2)}s`;
    }
  };

  const formatErrorRate = (errorRate: number) => {
    return `${(errorRate * 100).toFixed(1)}%`;
  };

  if (!reliabilityReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading reliability data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Reliability</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={loadReliabilityData} 
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {getStatusIcon(reliabilityReport.overallStatus)}
            <Badge className={getStatusColor(reliabilityReport.overallStatus)}>
              {reliabilityReport.overallStatus.toUpperCase()}
            </Badge>
            <div className="text-sm text-gray-600">
              {reliabilityReport.components.length} components monitored
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reliabilityReport.components.map((component) => (
          <Card key={component.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getComponentIcon(component.name)}
                {component.name.replace('-', ' ').toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                {getStatusIcon(component.status)}
                <Badge className={getStatusColor(component.status)}>
                  {component.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span>{formatUptime(component.uptime)}</span>
                </div>
                <Progress value={component.uptime * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Errors</div>
                  <div className="font-medium">{component.errorCount}</div>
                </div>
                <div>
                  <div className="text-gray-600">Fallback</div>
                  <div className="font-medium">
                    {component.fallbackActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {component.metrics.responseTime && (
                <div className="text-sm">
                  <div className="text-gray-600">Response Time</div>
                  <div className="font-medium">
                    {formatResponseTime(component.metrics.responseTime)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fallback Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fallback Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fallbackStatuses.map((fallback) => (
              <div key={fallback.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    fallback.active ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <div className="font-medium">
                      {fallback.name.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {fallback.active ? 'Fallback Active' : 'Primary System'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Uptime</div>
                    <div className="font-medium">{formatUptime(fallback.metrics.uptime)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Error Rate</div>
                    <div className="font-medium">{formatErrorRate(fallback.metrics.errorRate)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Response</div>
                    <div className="font-medium">{formatResponseTime(fallback.metrics.responseTime)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {reliabilityReport.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reliabilityReport.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reliabilityReport.components.filter(c => c.status === 'healthy').length}
              </div>
              <div className="text-sm text-gray-600">Healthy Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {reliabilityReport.components.filter(c => c.status === 'degraded').length}
              </div>
              <div className="text-sm text-gray-600">Degraded Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {reliabilityReport.components.filter(c => c.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed Components</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReliabilityDashboard;
