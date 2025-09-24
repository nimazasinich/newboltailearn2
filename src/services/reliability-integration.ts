
// Reliability Systems Integration
// Auto-generated integration for all reliability components

import { reliabilityMonitor } from './ReliabilityMonitor';
import { fallbackSystemManager } from './FallbackSystemManager';
import { tfCompatibility } from './ai/TensorFlowCompatibilityLayer';

// Initialize reliability systems
export async function initializeReliabilitySystems() {
  try {
    console.log('🚀 Initializing reliability systems...');
    
    // Initialize TensorFlow.js compatibility layer
    await tfCompatibility.initializeTensorFlow();
    
    // Make systems globally available
    (window as any).reliabilityMonitor = reliabilityMonitor;
    (window as any).fallbackSystemManager = fallbackSystemManager;
    (window as any).tfCompatibility = tfCompatibility;
    
    // Set up event listeners for fallback notifications
    setupFallbackEventListeners();
    
    console.log('✅ Reliability systems initialized successfully');
    
    return {
      reliabilityMonitor,
      fallbackSystemManager,
      tfCompatibility
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize reliability systems:', error);
    throw error;
  }
}

// Set up event listeners for fallback system notifications
function setupFallbackEventListeners() {
  // TensorFlow fallback events
  window.addEventListener('tensorflow-fallback-activated', () => {
    console.log('🔄 TensorFlow fallback activated');
    reliabilityMonitor.updateComponentMetrics('ai-pipeline', {
      fallbackActive: true,
      fallbackActivatedAt: new Date()
    });
  });
  
  window.addEventListener('tensorflow-fallback-deactivated', () => {
    console.log('✅ TensorFlow fallback deactivated');
    reliabilityMonitor.updateComponentMetrics('ai-pipeline', {
      fallbackActive: false,
      fallbackDeactivatedAt: new Date()
    });
  });
  
  // Database fallback events
  window.addEventListener('database-fallback-activated', () => {
    console.log('🔄 Database fallback activated');
    reliabilityMonitor.updateComponentMetrics('database', {
      fallbackActive: true,
      fallbackActivatedAt: new Date()
    });
  });
  
  window.addEventListener('database-fallback-deactivated', () => {
    console.log('✅ Database fallback deactivated');
    reliabilityMonitor.updateComponentMetrics('database', {
      fallbackActive: false,
      fallbackDeactivatedAt: new Date()
    });
  });
  
  // Cache fallback events
  window.addEventListener('cache-fallback-activated', () => {
    console.log('🔄 Cache fallback activated');
    reliabilityMonitor.updateComponentMetrics('cache', {
      fallbackActive: true,
      fallbackActivatedAt: new Date()
    });
  });
  
  window.addEventListener('cache-fallback-deactivated', () => {
    console.log('✅ Cache fallback deactivated');
    reliabilityMonitor.updateComponentMetrics('cache', {
      fallbackActive: false,
      fallbackDeactivatedAt: new Date()
    });
  });
  
  // WebSocket fallback events
  window.addEventListener('websocket-fallback-activated', () => {
    console.log('🔄 WebSocket fallback activated');
    reliabilityMonitor.updateComponentMetrics('websocket', {
      fallbackActive: true,
      fallbackActivatedAt: new Date()
    });
  });
  
  window.addEventListener('websocket-fallback-deactivated', () => {
    console.log('✅ WebSocket fallback deactivated');
    reliabilityMonitor.updateComponentMetrics('websocket', {
      fallbackActive: false,
      fallbackDeactivatedAt: new Date()
    });
  });
  
  // API fallback events
  window.addEventListener('api-fallback-activated', () => {
    console.log('🔄 API fallback activated');
    reliabilityMonitor.updateComponentMetrics('api-server', {
      fallbackActive: true,
      fallbackActivatedAt: new Date()
    });
  });
  
  window.addEventListener('api-fallback-deactivated', () => {
    console.log('✅ API fallback deactivated');
    reliabilityMonitor.updateComponentMetrics('api-server', {
      fallbackActive: false,
      fallbackDeactivatedAt: new Date()
    });
  });
}

// Export reliability systems for external use
export { reliabilityMonitor, fallbackSystemManager, tfCompatibility };

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  initializeReliabilitySystems().catch(console.error);
}
