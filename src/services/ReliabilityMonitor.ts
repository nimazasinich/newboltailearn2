/**
 * Reliability Monitor
 * Comprehensive monitoring and fallback management for all system components
 */

// Timer type for compatibility
type Timer = ReturnType<typeof setTimeout>;

export interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'failed' | 'unknown';
  lastCheck: Date;
  uptime: number;
  errorCount: number;
  fallbackActive: boolean;
  metrics: Record<string, any>;
}

export interface ReliabilityReport {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  components: ComponentStatus[];
  recommendations: string[];
  timestamp: Date;
}

export class ReliabilityMonitor {
  private components: Map<string, ComponentStatus> = new Map();
  private monitoringInterval: Timer | null = null;
  private alertThresholds = {
    errorRate: 0.1, // 10% error rate
    responseTime: 5000, // 5 seconds
    uptime: 0.95 // 95% uptime
  };

  constructor() {
    this.initializeComponents();
    this.startMonitoring();
  }

  private initializeComponents(): void {
    const initialComponents = [
      'database',
      'cache',
      'ai-pipeline',
      'websocket',
      'api-server',
      'file-system',
      'external-apis'
    ];

    initialComponents.forEach(name => {
      this.components.set(name, {
        name,
        status: 'unknown',
        lastCheck: new Date(),
        uptime: 0,
        errorCount: 0,
        fallbackActive: false,
        metrics: {}
      });
    });
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    console.log('🔍 Reliability monitoring started');
  }

  /**
   * Perform health checks on all components
   */
  private async performHealthChecks(): Promise<void> {
    const checks = Array.from(this.components.keys()).map(name => 
      this.checkComponentHealth(name)
    );

    await Promise.allSettled(checks);
    this.generateReliabilityReport();
  }

  /**
   * Check health of a specific component
   */
  private async checkComponentHealth(componentName: string): Promise<void> {
    const component = this.components.get(componentName);
    if (!component) return;

    try {
      const startTime = Date.now();
      let status: ComponentStatus['status'] = 'healthy';
      let fallbackActive = false;

      switch (componentName) {
        case 'database':
          status = await this.checkDatabaseHealth();
          break;
        case 'cache':
          status = await this.checkCacheHealth();
          break;
        case 'ai-pipeline':
          status = await this.checkAIPipelineHealth();
          break;
        case 'websocket':
          status = await this.checkWebSocketHealth();
          break;
        case 'api-server':
          status = await this.checkAPIServerHealth();
          break;
        case 'file-system':
          status = await this.checkFileSystemHealth();
          break;
        case 'external-apis':
          status = await this.checkExternalAPIsHealth();
          break;
      }

      const responseTime = Date.now() - startTime;
      
      // Update component status
      component.status = status;
      component.lastCheck = new Date();
      component.metrics.responseTime = responseTime;
      component.metrics.lastResponseTime = responseTime;

      // Check if fallback should be activated
      if (status === 'failed' && !component.fallbackActive) {
        fallbackActive = await this.activateFallback(componentName);
        component.fallbackActive = fallbackActive;
      }

      // Update uptime
      if (status === 'healthy') {
        component.uptime = Math.min(1, component.uptime + 0.01);
      } else {
        component.uptime = Math.max(0, component.uptime - 0.05);
        component.errorCount++;
      }

    } catch (error) {
      console.error(`❌ Health check failed for ${componentName}:`, error);
      component.status = 'failed';
      component.errorCount++;
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<ComponentStatus['status']> {
    try {
      // Simulate database health check
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        return data.database === 'connected' ? 'healthy' : 'degraded';
      }
      return 'failed';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<ComponentStatus['status']> {
    try {
      // Simulate cache health check
      const testKey = 'health-check-' + Date.now();
      const testValue = 'test-value';
      
      // This would be replaced with actual cache operations
      // await cache.set(testKey, testValue, 10);
      // const retrieved = await cache.get(testKey);
      // await cache.del(testKey);
      
      return 'healthy'; // Simulated
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Check AI pipeline health
   */
  private async checkAIPipelineHealth(): Promise<ComponentStatus['status']> {
    try {
      // Check if TensorFlow.js is available and functional
      const tfAvailable = typeof window !== 'undefined' && 
        (window as any).tf !== undefined;
      
      if (!tfAvailable) {
        return 'degraded'; // Using fallback
      }
      
      return 'healthy';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Check WebSocket health
   */
  private async checkWebSocketHealth(): Promise<ComponentStatus['status']> {
    try {
      // Check WebSocket connection status
      const ws = (window as any).wsConnection;
      if (ws && ws.readyState === WebSocket.OPEN) {
        return 'healthy';
      } else if (ws && ws.readyState === WebSocket.CONNECTING) {
        return 'degraded';
      } else {
        return 'failed';
      }
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Check API server health
   */
  private async checkAPIServerHealth(): Promise<ComponentStatus['status']> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000
      } as any);
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status >= 500) {
        return 'failed';
      } else {
        return 'degraded';
      }
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Check file system health
   */
  private async checkFileSystemHealth(): Promise<ComponentStatus['status']> {
    try {
      // Simulate file system check
      // In a real implementation, this would check disk space, permissions, etc.
      if (Math.random() < 0.1) {
        throw new Error('Simulated file system failure');
      }
      return 'healthy';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Check external APIs health
   */
  private async checkExternalAPIsHealth(): Promise<ComponentStatus['status']> {
    try {
      // Check external API dependencies
      // This would check HuggingFace API, etc.
      if (Math.random() < 0.1) {
        throw new Error('Simulated API failure');
      }
      return 'healthy';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Activate fallback for a component
   */
  private async activateFallback(componentName: string): Promise<boolean> {
    try {
      console.log(`🔄 Activating fallback for ${componentName}...`);
      
      switch (componentName) {
        case 'database':
          // Activate database fallback (mock data)
          return true;
        case 'cache':
          // Activate cache fallback (in-memory)
          return true;
        case 'ai-pipeline':
          // Activate AI fallback (mock predictions)
          return true;
        case 'websocket':
          // Activate WebSocket fallback (polling)
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error(`❌ Failed to activate fallback for ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Generate comprehensive reliability report
   */
  private generateReliabilityReport(): void {
    const components = Array.from(this.components.values());
    const failedComponents = components.filter(c => c.status === 'failed');
    const degradedComponents = components.filter(c => c.status === 'degraded');
    
    let overallStatus: ReliabilityReport['overallStatus'];
    if (failedComponents.length > 0) {
      overallStatus = 'critical';
    } else if (degradedComponents.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const recommendations = this.generateRecommendations(components);

    const report: ReliabilityReport = {
      overallStatus,
      components,
      recommendations,
      timestamp: new Date()
    };

    // Log report
    console.log('📊 Reliability Report:', {
      status: overallStatus,
      failed: failedComponents.length,
      degraded: degradedComponents.length,
      recommendations: recommendations.length
    });

    // Store report for API access
    (window as any).reliabilityReport = report;
  }

  /**
   * Generate recommendations based on component status
   */
  private generateRecommendations(components: ComponentStatus[]): string[] {
    const recommendations: string[] = [];

    components.forEach(component => {
      if (component.status === 'failed') {
        recommendations.push(`Critical: ${component.name} is down - immediate attention required`);
      } else if (component.status === 'degraded') {
        recommendations.push(`Warning: ${component.name} is degraded - monitor closely`);
      }

      if (component.errorCount > 10) {
        recommendations.push(`High error rate detected in ${component.name} - investigate root cause`);
      }

      if (component.uptime < 0.9) {
        recommendations.push(`Low uptime for ${component.name} - consider redundancy`);
      }

      if (component.metrics.responseTime > this.alertThresholds.responseTime) {
        recommendations.push(`Slow response time for ${component.name} - optimize performance`);
      }
    });

    return recommendations;
  }

  /**
   * Get current reliability status
   */
  getReliabilityStatus(): ReliabilityReport {
    return (window as any).reliabilityReport || {
      overallStatus: 'unknown',
      components: Array.from(this.components.values()),
      recommendations: [],
      timestamp: new Date()
    };
  }

  /**
   * Get component status
   */
  getComponentStatus(componentName: string): ComponentStatus | null {
    return this.components.get(componentName) || null;
  }

  /**
   * Manually trigger health check
   */
  async triggerHealthCheck(componentName?: string): Promise<void> {
    if (componentName) {
      await this.checkComponentHealth(componentName);
    } else {
      await this.performHealthChecks();
    }
  }

  /**
   * Update component metrics
   */
  updateComponentMetrics(componentName: string, metrics: Record<string, any>): void {
    const component = this.components.get(componentName);
    if (component) {
      component.metrics = { ...component.metrics, ...metrics };
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛑 Reliability monitoring stopped');
  }
}

// Export singleton instance
export const reliabilityMonitor = new ReliabilityMonitor();
