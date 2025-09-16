#!/usr/bin/env node

/**
 * Deployment monitoring script for better-sqlite3 ABI compatibility
 * Monitors deployment health and triggers rollback procedures if needed
 */

import https from 'https';
import http from 'http';

const RENDER_URL = process.env.RENDER_URL || 'https://newboltailearn-2.onrender.com';
const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL; // Optional: Slack notifications
const MAX_FAILURES = 3;
const CHECK_INTERVAL = 60000; // 1 minute
const REQUIRED_SUCCESSES = 5;

console.log('🔍 Starting deployment monitoring...');
console.log(`🌐 Target URL: ${RENDER_URL}`);

let failureCount = 0;
let consecutiveSuccesses = 0;

async function checkHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${RENDER_URL}/health`);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            health: health,
            isHealthy: res.statusCode === 200 && health.status === 'healthy'
          });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function sendNotification(message, isError = false) {
  if (!WEBHOOK_URL) return;
  
  const payload = {
    text: `${isError ? '🚨' : '✅'} Deployment Monitor: ${message}`,
    username: 'Render Monitor',
    icon_emoji: isError ? ':rotating_light:' : ':white_check_mark:'
  };
  
  try {
    const url = new URL(WEBHOOK_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const data = JSON.stringify(payload);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = client.request(options);
    req.write(data);
    req.end();
    
  } catch (error) {
    console.error('⚠️ Failed to send notification:', error.message);
  }
}

async function validateABICompatibility(healthData) {
  const { node_version, abi_version, database } = healthData;
  
  const issues = [];
  
  // Check Node version
  if (!node_version || !node_version.startsWith('v20.')) {
    issues.push(`Unexpected Node version: ${node_version} (expected v20.x)`);
  }
  
  // Check ABI version
  if (abi_version !== '115') {
    issues.push(`Unexpected ABI version: ${abi_version} (expected 115)`);
  }
  
  // Check database connectivity
  if (!database || !database.connected) {
    issues.push('Database not connected');
  }
  
  // Check for better-sqlite3 specific errors
  if (healthData.error && healthData.error.includes('better-sqlite3')) {
    issues.push(`better-sqlite3 error: ${healthData.error}`);
  }
  
  return {
    isCompatible: issues.length === 0,
    issues
  };
}

async function monitorDeployment() {
  console.log(`🔍 Starting monitoring (check every ${CHECK_INTERVAL/1000}s)`);
  console.log(`📊 Failure threshold: ${MAX_FAILURES}, Success requirement: ${REQUIRED_SUCCESSES}`);
  
  const monitor = setInterval(async () => {
    try {
      const result = await checkHealth();
      
      if (result.isHealthy) {
        // Validate ABI compatibility
        const compatibility = await validateABICompatibility(result.health);
        
        if (compatibility.isCompatible) {
          failureCount = 0;
          consecutiveSuccesses++;
          console.log(`✅ Health check passed (${consecutiveSuccesses}/${REQUIRED_SUCCESSES})`);
          console.log(`   Node: ${result.health.node_version}, ABI: ${result.health.abi_version}`);
          
          if (consecutiveSuccesses >= REQUIRED_SUCCESSES) {
            console.log('🎉 Deployment stable - monitoring complete');
            await sendNotification(`Deployment stable after ${REQUIRED_SUCCESSES} consecutive health checks`);
            clearInterval(monitor);
            process.exit(0);
          }
        } else {
          consecutiveSuccesses = 0;
          failureCount++;
          const issuesText = compatibility.issues.join(', ');
          console.error(`❌ ABI compatibility issues (${failureCount}/${MAX_FAILURES}): ${issuesText}`);
          
          if (failureCount >= MAX_FAILURES) {
            console.error('🚨 DEPLOYMENT FAILURE - ABI COMPATIBILITY ISSUES');
            await sendNotification(`ABI compatibility failure: ${issuesText}`, true);
            clearInterval(monitor);
            process.exit(1);
          }
        }
      } else {
        consecutiveSuccesses = 0;
        failureCount++;
        console.error(`❌ Health check failed (${failureCount}/${MAX_FAILURES}):`, {
          statusCode: result.statusCode,
          status: result.health?.status,
          error: result.health?.error
        });
        
        if (failureCount >= MAX_FAILURES) {
          console.error('🚨 DEPLOYMENT FAILURE - HEALTH CHECK FAILURES');
          await sendNotification(`Health check failures: ${result.health?.error || 'Unknown error'}`, true);
          clearInterval(monitor);
          process.exit(1);
        }
      }
    } catch (error) {
      consecutiveSuccesses = 0;
      failureCount++;
      console.error(`❌ Health check error (${failureCount}/${MAX_FAILURES}):`, error.message);
      
      if (failureCount >= MAX_FAILURES) {
        console.error('🚨 DEPLOYMENT FAILURE - CONNECTION ERRORS');
        await sendNotification(`Connection errors: ${error.message}`, true);
        clearInterval(monitor);
        process.exit(1);
      }
    }
  }, CHECK_INTERVAL);
  
  // Initial check
  console.log('🚀 Running initial health check...');
  try {
    const result = await checkHealth();
    console.log('📊 Initial health check result:', {
      statusCode: result.statusCode,
      status: result.health?.status,
      nodeVersion: result.health?.node_version,
      abiVersion: result.health?.abi_version,
      databaseConnected: result.health?.database?.connected
    });
  } catch (error) {
    console.warn('⚠️ Initial health check failed:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Monitoring interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Monitoring terminated');
  process.exit(0);
});

// Start monitoring
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorDeployment().catch(error => {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  });
}

export { checkHealth, monitorDeployment, validateABICompatibility };