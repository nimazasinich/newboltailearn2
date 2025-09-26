/**
 * Fallback System Manager
 * Centralized management of all fallback mechanisms across the system
 */

// Timer type for compatibility
type Timer = ReturnType<typeof setTimeout>;

export interface FallbackConfig {
  name: string;
  primaryComponent: string;
  fallbackComponent: string;
  activationThreshold: number;
  deactivationThreshold: number;
  maxRetries: number;
  retryDelay: number;
  enabled: boolean;
}

export interface FallbackStatus {
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

export class FallbackSystemManager {
  private fallbackConfigs: Map<string, FallbackConfig> = new Map();
  private fallbackStatuses: Map<string, FallbackStatus> = new Map();
  private monitoringInterval: Timer | null = null;

  constructor() {
    this.initializeFallbackConfigs();
    this.startMonitoring();
  }

  /**
   * Initialize fallback configurations for all system components
   */
  private initializeFallbackConfigs(): void {
    const configs: FallbackConfig[] = [
      {
        name: 'tensorflow-fallback',
        primaryComponent: 'tensorflow-native',
        fallbackComponent: 'tensorflow-mock',
        activationThreshold: 0.1, // 10% failure rate
        deactivationThreshold: 0.05, // 5% failure rate
        maxRetries: 3,
        retryDelay: 5000,
        enabled: true
      },
      {
        name: 'database-fallback',
        primaryComponent: 'database-primary',
        fallbackComponent: 'database-mock',
        activationThreshold: 0.2,
        deactivationThreshold: 0.1,
        maxRetries: 5,
        retryDelay: 2000,
        enabled: true
      },
      {
        name: 'cache-fallback',
        primaryComponent: 'redis-cache',
        fallbackComponent: 'memory-cache',
        activationThreshold: 0.15,
        deactivationThreshold: 0.08,
        maxRetries: 3,
        retryDelay: 1000,
        enabled: true
      },
      {
        name: 'websocket-fallback',
        primaryComponent: 'websocket-realtime',
        fallbackComponent: 'websocket-polling',
        activationThreshold: 0.3,
        deactivationThreshold: 0.15,
        maxRetries: 5,
        retryDelay: 3000,
        enabled: true
      },
      {
        name: 'api-fallback',
        primaryComponent: 'api-primary',
        fallbackComponent: 'api-cached',
        activationThreshold: 0.25,
        deactivationThreshold: 0.12,
        maxRetries: 3,
        retryDelay: 2000,
        enabled: true
      }
    ];

    configs.forEach(config => {
      this.fallbackConfigs.set(config.name, config);
      this.fallbackStatuses.set(config.name, {
        name: config.name,
        active: false,
        activationTime: null,
        failureCount: 0,
        successCount: 0,
        lastSwitch: null,
        metrics: {
          uptime: 1.0,
          errorRate: 0,
          responseTime: 0
        }
      });
    });

    console.log('🔄 Fallback configurations initialized');
  }

  /**
   * Start monitoring fallback systems
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.monitorFallbackSystems();
    }, 10000); // Check every 10 seconds

    console.log('🔍 Fallback system monitoring started');
  }

  /**
   * Monitor all fallback systems
   */
  private async monitorFallbackSystems(): Promise<void> {
    for (const [name, config] of this.fallbackConfigs) {
      if (!config.enabled) continue;

      const status = this.fallbackStatuses.get(name);
      if (!status) continue;

      try {
        await this.evaluateFallbackCondition(name, config, status);
      } catch (error) {
        console.error(`❌ Error monitoring fallback ${name}:`, error);
      }
    }
  }

  /**
   * Evaluate whether fallback should be activated or deactivated
   */
  private async evaluateFallbackCondition(
    name: string, 
    config: FallbackConfig, 
    status: FallbackStatus
  ): Promise<void> {
    const primaryHealth = await this.checkComponentHealth(config.primaryComponent);
    const fallbackHealth = await this.checkComponentHealth(config.fallbackComponent);

    // Calculate error rate
    const totalRequests = status.failureCount + status.successCount;
    const errorRate = totalRequests > 0 ? status.failureCount / totalRequests : 0;

    // Update metrics
    status.metrics.errorRate = errorRate;
    status.metrics.uptime = status.successCount / Math.max(1, totalRequests);

    if (!status.active) {
      // Check if fallback should be activated
      if (primaryHealth === 'failed' || errorRate > config.activationThreshold) {
        await this.activateFallback(name, config, status);
      }
    } else {
      // Check if fallback should be deactivated
      if (primaryHealth === 'healthy' && errorRate < config.deactivationThreshold) {
        await this.deactivateFallback(name, config, status);
      }
    }
  }

  /**
   * Activate fallback system
   */
  private async activateFallback(
    name: string, 
    config: FallbackConfig, 
    status: FallbackStatus
  ): Promise<void> {
    try {
      console.log(`🔄 Activating fallback: ${name}`);

      switch (name) {
        case 'tensorflow-fallback':
          await this.activateTensorFlowFallback();
          break;
        case 'database-fallback':
          await this.activateDatabaseFallback();
          break;
        case 'cache-fallback':
          await this.activateCacheFallback();
          break;
        case 'websocket-fallback':
          await this.activateWebSocketFallback();
          break;
        case 'api-fallback':
          await this.activateAPIFallback();
          break;
      }

      status.active = true;
      status.activationTime = new Date();
      status.lastSwitch = new Date();

      console.log(`✅ Fallback activated: ${name}`);

    } catch (error) {
      console.error(`❌ Failed to activate fallback ${name}:`, error);
      status.failureCount++;
    }
  }

  /**
   * Deactivate fallback system
   */
  private async deactivateFallback(
    name: string, 
    config: FallbackConfig, 
    status: FallbackStatus
  ): Promise<void> {
    try {
      console.log(`🔄 Deactivating fallback: ${name}`);

      switch (name) {
        case 'tensorflow-fallback':
          await this.deactivateTensorFlowFallback();
          break;
        case 'database-fallback':
          await this.deactivateDatabaseFallback();
          break;
        case 'cache-fallback':
          await this.deactivateCacheFallback();
          break;
        case 'websocket-fallback':
          await this.deactivateWebSocketFallback();
          break;
        case 'api-fallback':
          await this.deactivateAPIFallback();
          break;
      }

      status.active = false;
      status.activationTime = null;
      status.lastSwitch = new Date();

      console.log(`✅ Fallback deactivated: ${name}`);

    } catch (error) {
      console.error(`❌ Failed to deactivate fallback ${name}:`, error);
    }
  }

  /**
   * Activate TensorFlow.js fallback
   */
  private async activateTensorFlowFallback(): Promise<void> {
    // Switch to mock TensorFlow implementation
    (window as any).tensorflowFallbackActive = true;
    
    // Notify AI services to use fallback
    const event = new CustomEvent('tensorflow-fallback-activated');
    window.dispatchEvent(event);
  }

  /**
   * Deactivate TensorFlow.js fallback
   */
  private async deactivateTensorFlowFallback(): Promise<void> {
    (window as any).tensorflowFallbackActive = false;
    
    const event = new CustomEvent('tensorflow-fallback-deactivated');
    window.dispatchEvent(event);
  }

  /**
   * Activate database fallback
   */
  private async activateDatabaseFallback(): Promise<void> {
    // Switch to mock database
    (window as any).databaseFallbackActive = true;
    
    const event = new CustomEvent('database-fallback-activated');
    window.dispatchEvent(event);
  }

  /**
   * Deactivate database fallback
   */
  private async deactivateDatabaseFallback(): Promise<void> {
    (window as any).databaseFallbackActive = false;
    
    const event = new CustomEvent('database-fallback-deactivated');
    window.dispatchEvent(event);
  }

  /**
   * Activate cache fallback
   */
  private async activateCacheFallback(): Promise<void> {
    // Switch to in-memory cache
    (window as any).cacheFallbackActive = true;
    
    const event = new CustomEvent('cache-fallback-activated');
    window.dispatchEvent(event);
  }

  /**
   * Deactivate cache fallback
   */
  private async deactivateCacheFallback(): Promise<void> {
    (window as any).cacheFallbackActive = false;
    
    const event = new CustomEvent('cache-fallback-deactivated');
    window.dispatchEvent(event);
  }

  /**
   * Activate WebSocket fallback
   */
  private async activateWebSocketFallback(): Promise<void> {
    // Switch to polling mode
    (window as any).websocketFallbackActive = true;
    
    const event = new CustomEvent('websocket-fallback-activated');
    window.dispatchEvent(event);
  }

  /**
   * Deactivate WebSocket fallback
   */
  private async deactivateWebSocketFallback(): Promise<void> {
    (window as any).websocketFallbackActive = false;
    
    const event = new CustomEvent('websocket-fallback-deactivated');
    window.dispatchEvent(event);
  }

  /**
   * Activate API fallback
   */
  private async activateAPIFallback(): Promise<void> {
    // Switch to cached API responses
    (window as any).apiFallbackActive = true;
    
    const event = new CustomEvent('api-fallback-activated');
    window.dispatchEvent(event);
  }

  /**
   * Deactivate API fallback
   */
  private async deactivateAPIFallback(): Promise<void> {
    (window as any).apiFallbackActive = false;
    
    const event = new CustomEvent('api-fallback-deactivated');
    window.dispatchEvent(event);
  }

  /**
   * Check component health
   */
  private async checkComponentHealth(componentName: string): Promise<'healthy' | 'degraded' | 'failed'> {
    try {
      // This would integrate with the ReliabilityMonitor
      const reliabilityMonitor = (window as any).reliabilityMonitor;
      if (reliabilityMonitor) {
        const status = reliabilityMonitor.getComponentStatus(componentName);
        return status?.status || 'unknown';
      }

      // Fallback health check
      return 'healthy';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Record component success
   */
  recordSuccess(fallbackName: string): void {
    const status = this.fallbackStatuses.get(fallbackName);
    if (status) {
      status.successCount++;
    }
  }

  /**
   * Record component failure
   */
  recordFailure(fallbackName: string): void {
    const status = this.fallbackStatuses.get(fallbackName);
    if (status) {
      status.failureCount++;
    }
  }

  /**
   * Get fallback status
   */
  getFallbackStatus(fallbackName: string): FallbackStatus | null {
    return this.fallbackStatuses.get(fallbackName) || null;
  }

  /**
   * Get all fallback statuses
   */
  getAllFallbackStatuses(): FallbackStatus[] {
    return Array.from(this.fallbackStatuses.values());
  }

  /**
   * Manually activate fallback
   */
  async activateFallbackManually(fallbackName: string): Promise<boolean> {
    const config = this.fallbackConfigs.get(fallbackName);
    const status = this.fallbackStatuses.get(fallbackName);

    if (!config || !status) {
      return false;
    }

    await this.activateFallback(fallbackName, config, status);
    return true;
  }

  /**
   * Manually deactivate fallback
   */
  async deactivateFallbackManually(fallbackName: string): Promise<boolean> {
    const config = this.fallbackConfigs.get(fallbackName);
    const status = this.fallbackStatuses.get(fallbackName);

    if (!config || !status) {
      return false;
    }

    await this.deactivateFallback(fallbackName, config, status);
    return true;
  }

  /**
   * Get fallback system report
   */
  getFallbackReport(): {
    totalFallbacks: number;
    activeFallbacks: number;
    fallbackStatuses: FallbackStatus[];
    recommendations: string[];
  } {
    const statuses = Array.from(this.fallbackStatuses.values());
    const activeFallbacks = statuses.filter(s => s.active).length;
    
    const recommendations: string[] = [];
    
    statuses.forEach(status => {
      if (status.active) {
        recommendations.push(`Fallback active for ${status.name} - investigate primary component`);
      }
      
      if (status.metrics.errorRate > 0.2) {
        recommendations.push(`High error rate in ${status.name} - consider system maintenance`);
      }
      
      if (status.metrics.uptime < 0.8) {
        recommendations.push(`Low uptime for ${status.name} - review reliability measures`);
      }
    });

    return {
      totalFallbacks: statuses.length,
      activeFallbacks,
      fallbackStatuses: statuses,
      recommendations
    };
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛑 Fallback system monitoring stopped');
  }
}

// Export singleton instance
export const fallbackSystemManager = new FallbackSystemManager();
