/**
 * TensorFlow.js Compatibility Layer
 * Advanced fallback system with backend detection and optimization
 * Based on enterprise best practices for cross-platform compatibility
 */

import * as tf from '@tensorflow/tfjs';

export interface CompatibilityReport {
  webgl: number;
  wasm: boolean;
  simd: boolean;
  memory: number;
  device: 'mobile' | 'desktop';
  browser: string;
  optimalBackend: string;
}

export interface BackendConfig {
  name: string;
  priority: number;
  mobileOptimized: boolean;
  fallbackTo: string[];
}

export class TensorFlowCompatibilityLayer {
  private optimalBackend: string | null = null;
  private compatibilityReport: CompatibilityReport | null = null;
  private backendConfigs: BackendConfig[] = [
    {
      name: 'webgl',
      priority: 1,
      mobileOptimized: false,
      fallbackTo: ['wasm', 'cpu']
    },
    {
      name: 'wasm',
      priority: 2,
      mobileOptimized: true,
      fallbackTo: ['webgl', 'cpu']
    },
    {
      name: 'cpu',
      priority: 3,
      mobileOptimized: true,
      fallbackTo: []
    }
  ];

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.detectFeatures();
      await this.configureEnvironment();
      await this.verifyFunctionality();
      console.log('✅ TensorFlow.js Compatibility Layer initialized successfully');
    } catch (error) {
      console.error('❌ TensorFlow.js Compatibility Layer initialization failed:', error);
      throw error;
    }
  }

  /**
   * Detect device and browser capabilities
   */
  private async detectFeatures(): Promise<void> {
    const isMobile = this.isMobileDevice();
    const browser = this.detectBrowser();
    
    this.compatibilityReport = {
      webgl: Number(await tf.ENV.getAsync('WEBGL_VERSION')) || 0,
      wasm: typeof WebAssembly === 'object',
      simd: Boolean(await tf.ENV.getAsync('WASM_HAS_SIMD_SUPPORT')) || false,
      memory: Number(await tf.ENV.getAsync('WEBGL_MAX_TEXTURE_SIZE')) || 0,
      device: isMobile ? 'mobile' : 'desktop',
      browser,
      optimalBackend: 'unknown'
    };

    console.log('🔍 Device capabilities detected:', this.compatibilityReport);
  }

  /**
   * Configure TensorFlow.js environment based on device capabilities
   */
  private async configureEnvironment(): Promise<void> {
    if (!this.compatibilityReport) return;

    const { device, webgl, wasm } = this.compatibilityReport;

    if (device === 'mobile') {
      // Mobile optimizations
      tf.ENV.set('WEBGL_PACK', false);
      tf.ENV.set('WEBGL_DOWNLOAD_FLOAT_ENABLED', true);
      tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', true);
      tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
      
      console.log('📱 Mobile optimizations applied');
    } else {
      // Desktop optimizations
      tf.ENV.set('WEBGL_PACK', true);
      tf.ENV.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
      
      console.log('🖥️ Desktop optimizations applied');
    }

    // Backend-specific configurations
    if (webgl >= 2) {
      tf.ENV.set('WEBGL_VERSION', 2);
    } else if (webgl === 1) {
      tf.ENV.set('WEBGL_VERSION', 1);
    }

    if (wasm) {
      tf.ENV.set('WASM_HAS_SIMD_SUPPORT', this.compatibilityReport.simd);
    }
  }

  /**
   * Verify functionality with the current backend
   */
  private async verifyFunctionality(): Promise<void> {
    try {
      // Create a simple test model
      const testModel = this.createTestModel();
      const testInput = tf.randomNormal([1, 10]);
      
      // Test prediction
      const output = testModel.predict(testInput) as tf.Tensor;
      const result = await output.data();
      
      // Verify result is valid
      if (result.length > 0 && !result.some(val => isNaN(val) || !isFinite(val))) {
        const currentBackend = tf.getBackend();
        this.optimalBackend = currentBackend;
        if (this.compatibilityReport) {
          this.compatibilityReport.optimalBackend = currentBackend;
        }
        console.log(`✅ Backend ${currentBackend} verified successfully`);
      } else {
        throw new Error('Invalid prediction result');
      }
      
      // Cleanup
      testInput.dispose();
      output.dispose();
      testModel.dispose();
      
    } catch (error) {
      console.warn(`⚠️ Backend ${tf.getBackend()} verification failed:`, error);
      await this.attemptFallback();
    }
  }

  /**
   * Attempt fallback to alternative backends
   */
  private async attemptFallback(): Promise<void> {
    const currentBackend = tf.getBackend();
    const currentConfig = this.backendConfigs.find(config => config.name === currentBackend);
    
    if (!currentConfig) {
      throw new Error('No fallback configuration found');
    }

    for (const fallbackBackend of currentConfig.fallbackTo) {
      try {
        console.log(`🔄 Attempting fallback to ${fallbackBackend}...`);
        
        await tf.setBackend(fallbackBackend);
        await tf.ready();
        
        // Reconfigure environment for new backend
        await this.configureEnvironment();
        
        // Verify functionality with new backend
        await this.verifyFunctionality();
        
        console.log(`✅ Successfully fell back to ${fallbackBackend}`);
        return;
        
      } catch (fallbackError) {
        console.warn(`❌ Fallback to ${fallbackBackend} failed:`, fallbackError);
        continue;
      }
    }
    
    throw new Error('No functional backend available after fallback attempts');
  }

  /**
   * Initialize TensorFlow.js with optimal backend selection
   */
  async initializeTensorFlow(): Promise<void> {
    const backends = this.getOptimalBackendOrder();
    
    for (const backend of backends) {
      try {
        console.log(`🚀 Initializing TensorFlow.js with ${backend} backend...`);
        
        await tf.setBackend(backend);
        await tf.ready();
        
        // Configure environment for this backend
        await this.configureEnvironment();
        
        // Verify functionality
        await this.verifyFunctionality();
        
        console.log(`✅ Successfully initialized with ${backend} backend`);
        return;
        
      } catch (error) {
        console.warn(`⚠️ Backend ${backend} initialization failed:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }
    
    throw new Error('No compatible TensorFlow.js backend found');
  }

  /**
   * Get optimal backend order based on device capabilities
   */
  private getOptimalBackendOrder(): string[] {
    if (!this.compatibilityReport) {
      return ['webgl', 'wasm', 'cpu'];
    }

    const { device, webgl, wasm } = this.compatibilityReport;
    
    if (device === 'mobile') {
      // Mobile: prioritize CPU and WASM for battery life
      if (wasm) {
        return ['wasm', 'cpu', 'webgl'];
      } else {
        return ['cpu', 'webgl'];
      }
    } else {
      // Desktop: prioritize WebGL for performance
      if (webgl >= 2) {
        return ['webgl', 'wasm', 'cpu'];
      } else if (webgl === 1) {
        return ['webgl', 'wasm', 'cpu'];
      } else if (wasm) {
        return ['wasm', 'cpu'];
      } else {
        return ['cpu'];
      }
    }
  }

  /**
   * Create a simple test model for verification
   */
  private createTestModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 5, activation: 'relu', inputShape: [10] }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Detect if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect browser type
   */
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  /**
   * Get current backend information
   */
  getBackendInfo(): { current: string; optimal: string; report: CompatibilityReport | null } {
    return {
      current: tf.getBackend(),
      optimal: this.optimalBackend || 'unknown',
      report: this.compatibilityReport
    };
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.compatibilityReport) return recommendations;
    
    const { device, webgl, wasm, memory } = this.compatibilityReport;
    
    if (device === 'mobile') {
      recommendations.push('Mobile device detected - using battery-optimized settings');
    }
    
    if (webgl === 0) {
      recommendations.push('WebGL not available - using CPU/WASM backend');
    } else if (webgl === 1) {
      recommendations.push('WebGL 1.0 detected - limited performance expected');
    }
    
    if (!wasm) {
      recommendations.push('WebAssembly not available - limited backend options');
    }
    
    if (memory < 2048) {
      recommendations.push('Limited GPU memory - consider reducing model complexity');
    }
    
    return recommendations;
  }

  /**
   * Monitor backend performance
   */
  async monitorPerformance(): Promise<{ backend: string; performance: number }> {
    const startTime = performance.now();
    
    try {
      // Create and run a simple operation
      const a = tf.randomNormal([100, 100]);
      const b = tf.randomNormal([100, 100]);
      const c = tf.matMul(a, b);
      await c.data();
      
      const endTime = performance.now();
      const performanceScore = 1000 / (endTime - startTime); // Operations per second
      
      // Cleanup
      a.dispose();
      b.dispose();
      c.dispose();
      
      return {
        backend: tf.getBackend(),
        performance: Math.round(performanceScore)
      };
      
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error);
      return {
        backend: tf.getBackend(),
        performance: 0
      };
    }
  }

  /**
   * Switch to a specific backend
   */
  async switchBackend(backendName: string): Promise<boolean> {
    try {
      console.log(`🔄 Switching to ${backendName} backend...`);
      
      await tf.setBackend(backendName);
      await tf.ready();
      
      // Reconfigure environment
      await this.configureEnvironment();
      
      // Verify functionality
      await this.verifyFunctionality();
      
      console.log(`✅ Successfully switched to ${backendName} backend`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to switch to ${backendName} backend:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const tfCompatibility = new TensorFlowCompatibilityLayer();
