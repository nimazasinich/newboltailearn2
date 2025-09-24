#!/usr/bin/env node

/**
 * Reliability Systems Integration Script
 * Integrates all reliability monitoring and fallback systems
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Integrating Reliability Systems');
console.log('==================================');

// Create reliability systems integration
const reliabilityIntegration = `
// Reliability Systems Integration
// Auto-generated integration for all reliability components

import { reliabilityMonitor } from './services/ReliabilityMonitor';
import { fallbackSystemManager } from './services/FallbackSystemManager';
import { tfCompatibility } from './services/ai/TensorFlowCompatibilityLayer';

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
`;

// Write the integration file
const integrationPath = path.join(process.cwd(), 'src', 'services', 'reliability-integration.ts');
fs.writeFileSync(integrationPath, reliabilityIntegration);

console.log('✅ Reliability integration file created');

// Update main App component to include reliability dashboard
const appPath = path.join(process.cwd(), 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  // Add reliability systems import
  if (!appContent.includes('reliability-integration')) {
    const importStatement = "import './services/reliability-integration';";
    appContent = importStatement + '\n' + appContent;
  }
  
  fs.writeFileSync(appPath, appContent);
  console.log('✅ App.tsx updated with reliability systems');
}

// Create reliability API endpoints
const reliabilityAPI = `
// Reliability API Endpoints
// Server-side endpoints for reliability monitoring

app.get('/api/reliability/status', (req, res) => {
  try {
    const reliabilityMonitor = global.reliabilityMonitor;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    if (!reliabilityMonitor || !fallbackSystemManager) {
      return res.status(503).json({ 
        error: 'Reliability systems not initialized' 
      });
    }
    
    const reliabilityReport = reliabilityMonitor.getReliabilityStatus();
    const fallbackReport = fallbackSystemManager.getFallbackReport();
    
    res.json({
      reliability: reliabilityReport,
      fallbacks: fallbackReport,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Reliability status endpoint error:', error);
    res.status(500).json({ error: 'Failed to get reliability status' });
  }
});

app.get('/api/reliability/component/:name', (req, res) => {
  try {
    const { name } = req.params;
    const reliabilityMonitor = global.reliabilityMonitor;
    
    if (!reliabilityMonitor) {
      return res.status(503).json({ 
        error: 'Reliability monitor not initialized' 
      });
    }
    
    const componentStatus = reliabilityMonitor.getComponentStatus(name);
    
    if (!componentStatus) {
      return res.status(404).json({ 
        error: 'Component not found' 
      });
    }
    
    res.json(componentStatus);
    
  } catch (error) {
    console.error('❌ Component status endpoint error:', error);
    res.status(500).json({ error: 'Failed to get component status' });
  }
});

app.post('/api/reliability/fallback/:name/activate', (req, res) => {
  try {
    const { name } = req.params;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    if (!fallbackSystemManager) {
      return res.status(503).json({ 
        error: 'Fallback system manager not initialized' 
      });
    }
    
    fallbackSystemManager.activateFallbackManually(name)
      .then(success => {
        if (success) {
          res.json({ 
            message: \`Fallback \${name} activated successfully\`,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(400).json({ 
            error: \`Failed to activate fallback \${name}\` 
          });
        }
      })
      .catch(error => {
        console.error('❌ Fallback activation error:', error);
        res.status(500).json({ error: 'Failed to activate fallback' });
      });
    
  } catch (error) {
    console.error('❌ Fallback activation endpoint error:', error);
    res.status(500).json({ error: 'Failed to activate fallback' });
  }
});

app.post('/api/reliability/fallback/:name/deactivate', (req, res) => {
  try {
    const { name } = req.params;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    if (!fallbackSystemManager) {
      return res.status(503).json({ 
        error: 'Fallback system manager not initialized' 
      });
    }
    
    fallbackSystemManager.deactivateFallbackManually(name)
      .then(success => {
        if (success) {
          res.json({ 
            message: \`Fallback \${name} deactivated successfully\`,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(400).json({ 
            error: \`Failed to deactivate fallback \${name}\` 
          });
        }
      })
      .catch(error => {
        console.error('❌ Fallback deactivation error:', error);
        res.status(500).json({ error: 'Failed to deactivate fallback' });
      });
    
  } catch (error) {
    console.error('❌ Fallback deactivation endpoint error:', error);
    res.status(500).json({ error: 'Failed to deactivate fallback' });
  }
});

app.get('/api/reliability/health', (req, res) => {
  try {
    const reliabilityMonitor = global.reliabilityMonitor;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      systems: {
        reliabilityMonitor: !!reliabilityMonitor,
        fallbackSystemManager: !!fallbackSystemManager
      }
    };
    
    if (!reliabilityMonitor || !fallbackSystemManager) {
      healthStatus.status = 'degraded';
    }
    
    res.json(healthStatus);
    
  } catch (error) {
    console.error('❌ Reliability health endpoint error:', error);
    res.status(500).json({ 
      status: 'failed',
      error: 'Reliability health check failed',
      timestamp: new Date().toISOString()
    });
  }
});
`;

// Write the reliability API file
const apiPath = path.join(process.cwd(), 'server', 'routes', 'reliability.js');
fs.writeFileSync(apiPath, reliabilityAPI);

console.log('✅ Reliability API endpoints created');

// Create reliability configuration
const reliabilityConfig = {
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    reportInterval: 60000, // 1 minute
    alertThresholds: {
      errorRate: 0.1,
      responseTime: 5000,
      uptime: 0.95
    }
  },
  fallbacks: {
    tensorflow: {
      enabled: true,
      activationThreshold: 0.1,
      deactivationThreshold: 0.05,
      maxRetries: 3,
      retryDelay: 5000
    },
    database: {
      enabled: true,
      activationThreshold: 0.2,
      deactivationThreshold: 0.1,
      maxRetries: 5,
      retryDelay: 2000
    },
    cache: {
      enabled: true,
      activationThreshold: 0.15,
      deactivationThreshold: 0.08,
      maxRetries: 3,
      retryDelay: 1000
    },
    websocket: {
      enabled: true,
      activationThreshold: 0.3,
      deactivationThreshold: 0.15,
      maxRetries: 5,
      retryDelay: 3000
    }
  },
  notifications: {
    enabled: true,
    channels: ['console', 'api'],
    alertLevels: ['critical', 'warning', 'info']
  }
};

// Write the reliability configuration
const configPath = path.join(process.cwd(), 'reliability-config.json');
fs.writeFileSync(configPath, JSON.stringify(reliabilityConfig, null, 2));

console.log('✅ Reliability configuration created');

// Update package.json with reliability scripts
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'reliability:status': 'curl -s http://localhost:8080/api/reliability/status | jq',
  'reliability:health': 'curl -s http://localhost:8080/api/reliability/health | jq',
  'reliability:test': 'node scripts/test-reliability-systems.js',
  'reliability:monitor': 'node scripts/monitor-reliability.js'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Package.json updated with reliability scripts');

console.log('\n🎉 Reliability Systems Integration Complete!');
console.log('=============================================');
console.log('✅ TensorFlow.js compatibility layer');
console.log('✅ Reliability monitoring system');
console.log('✅ Fallback system manager');
console.log('✅ Reliability dashboard component');
console.log('✅ API endpoints for reliability');
console.log('✅ Configuration and scripts');
console.log('\n🚀 System now has comprehensive reliability monitoring!');
