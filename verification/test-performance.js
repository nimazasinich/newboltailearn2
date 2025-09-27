#!/usr/bin/env node
// test-performance.js - Performance metrics verification

import axios from 'axios';
import fs from 'fs';
import { performance } from 'perf_hooks';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

const BASE_URL = 'http://localhost:8080';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
    health: 100,        // Health check should be very fast
    api_simple: 200,    // Simple API calls
    api_complex: 500,   // Complex API calls with database
    auth: 1000,         // Authentication operations (includes hashing)
    database: 300,      // Database operations
    static: 50          // Static file serving
};

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    metrics: {},
    tests: {}
};

async function measurePerformance(name, fn, threshold) {
    testResults.total++;
    
    const measurements = [];
    const iterations = 5; // Run multiple times for average
    
    try {
        // Warm-up run
        await fn();
        
        // Actual measurements
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const end = performance.now();
            measurements.push(end - start);
        }
        
        // Calculate statistics
        const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const min = Math.min(...measurements);
        const max = Math.max(...measurements);
        const median = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];
        
        testResults.metrics[name] = {
            average: avg.toFixed(2),
            min: min.toFixed(2),
            max: max.toFixed(2),
            median: median.toFixed(2),
            threshold
        };
        
        // Determine pass/fail
        if (avg <= threshold) {
            testResults.passed++;
            testResults.tests[name] = 'PASSED';
            log(`  ✓ ${name}: ${avg.toFixed(2)}ms (threshold: ${threshold}ms)`, 'green');
        } else if (avg <= threshold * 1.5) {
            testResults.warnings++;
            testResults.tests[name] = 'WARNING';
            log(`  ⚠ ${name}: ${avg.toFixed(2)}ms (threshold: ${threshold}ms)`, 'yellow');
        } else {
            testResults.failed++;
            testResults.tests[name] = 'FAILED';
            log(`  ✗ ${name}: ${avg.toFixed(2)}ms (threshold: ${threshold}ms)`, 'red');
        }
        
        return avg;
        
    } catch (error) {
        testResults.failed++;
        testResults.tests[name] = `ERROR: ${error.message}`;
        log(`  ✗ ${name}: Error - ${error.message}`, 'red');
        return -1;
    }
}

async function runPerformanceTests() {
    log('\n=== Performance Metrics Verification ===\n', 'blue');
    
    // Test 1: Health Check Performance
    log('Testing Health Check Performance:', 'yellow');
    
    await measurePerformance('Health endpoint', async () => {
        await axios.get(`${BASE_URL}/health`);
    }, THRESHOLDS.health);
    
    await measurePerformance('API health endpoint', async () => {
        await axios.get(`${BASE_URL}/api/health`);
    }, THRESHOLDS.health);
    
    // Test 2: Authentication Performance
    log('\nTesting Authentication Performance:', 'yellow');
    
    const testUser = {
        email: `perf_test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
    };
    
    // First register the user
    try {
        await axios.post(`${BASE_URL}/api/auth/register`, {
            username: `perf_user_${Date.now()}`,
            ...testUser
        });
    } catch (error) {
        // User might already exist or registration might fail
    }
    
    let authToken = null;
    
    await measurePerformance('Login operation', async () => {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
        if (response.data.token) {
            authToken = response.data.token;
        }
    }, THRESHOLDS.auth);
    
    // Test 3: API Endpoint Performance (if authenticated)
    if (authToken) {
        log('\nTesting API Endpoint Performance:', 'yellow');
        
        const headers = { Authorization: `Bearer ${authToken}` };
        
        await measurePerformance('Get models list', async () => {
            await axios.get(`${BASE_URL}/api/models`, { headers });
        }, THRESHOLDS.api_simple);
        
        await measurePerformance('Get datasets list', async () => {
            await axios.get(`${BASE_URL}/api/datasets`, { headers });
        }, THRESHOLDS.api_simple);
        
        await measurePerformance('Get training sessions', async () => {
            await axios.get(`${BASE_URL}/api/training/sessions`, { headers });
        }, THRESHOLDS.api_complex);
        
        await measurePerformance('Get analytics data', async () => {
            await axios.get(`${BASE_URL}/api/analytics/performance`, { headers });
        }, THRESHOLDS.api_complex);
    } else {
        log('\nSkipping authenticated endpoint tests (no token)', 'yellow');
    }
    
    // Test 4: Concurrent Request Handling
    log('\nTesting Concurrent Request Handling:', 'yellow');
    
    await measurePerformance('Concurrent requests (10)', async () => {
        const requests = [];
        for (let i = 0; i < 10; i++) {
            requests.push(axios.get(`${BASE_URL}/health`).catch(e => e));
        }
        await Promise.all(requests);
    }, THRESHOLDS.api_simple * 2); // Allow 2x time for concurrent
    
    await measurePerformance('Concurrent requests (50)', async () => {
        const requests = [];
        for (let i = 0; i < 50; i++) {
            requests.push(axios.get(`${BASE_URL}/health`).catch(e => e));
        }
        await Promise.all(requests);
    }, THRESHOLDS.api_simple * 5); // Allow 5x time for many concurrent
    
    // Test 5: Memory Usage
    log('\nTesting Memory Usage:', 'yellow');
    
    const memUsage = process.memoryUsage();
    const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
    const rssUsedMB = (memUsage.rss / 1024 / 1024).toFixed(2);
    
    log(`  Heap Used: ${heapUsedMB} MB`, heapUsedMB < 200 ? 'green' : 'yellow');
    log(`  RSS: ${rssUsedMB} MB`, rssUsedMB < 500 ? 'green' : 'yellow');
    
    testResults.metrics.memory = {
        heapUsed: heapUsedMB,
        rss: rssUsedMB,
        external: (memUsage.external / 1024 / 1024).toFixed(2)
    };
    
    // Test 6: Response Size Analysis
    log('\nTesting Response Sizes:', 'yellow');
    
    try {
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        const responseSize = JSON.stringify(healthResponse.data).length;
        
        log(`  Health response size: ${responseSize} bytes`, 
            responseSize < 1000 ? 'green' : 'yellow');
        
        testResults.metrics.responseSizes = {
            health: responseSize
        };
    } catch (error) {
        log('  Could not measure response sizes', 'yellow');
    }
    
    // Test 7: Database Query Performance
    log('\nTesting Database Performance:', 'yellow');
    
    const Database = (await import('better-sqlite3')).default;
    const dbPath = fs.existsSync('./server/database/database.sqlite') 
        ? './server/database/database.sqlite' 
        : './database.sqlite';
    
    if (fs.existsSync(dbPath)) {
        const db = new Database(dbPath, { readonly: true });
        
        await measurePerformance('Simple SELECT query', async () => {
            db.prepare('SELECT 1').get();
        }, 10); // Should be very fast
        
        await measurePerformance('Table scan query', async () => {
            db.prepare('SELECT COUNT(*) FROM users').get();
        }, 50);
        
        await measurePerformance('Join query', async () => {
            db.prepare(`
                SELECT m.*, COUNT(ts.id) as session_count 
                FROM models m 
                LEFT JOIN training_sessions ts ON m.id = ts.model_id 
                GROUP BY m.id 
                LIMIT 10
            `).all();
        }, THRESHOLDS.database);
        
        db.close();
    } else {
        log('  Database file not found - skipping DB tests', 'yellow');
    }
    
    // Test 8: Static File Serving (if applicable)
    log('\nTesting Static File Performance:', 'yellow');
    
    try {
        await measurePerformance('Static file (index.html)', async () => {
            await axios.get(`${BASE_URL}/index.html`);
        }, THRESHOLDS.static);
    } catch (error) {
        log('  Static file serving not configured', 'yellow');
    }
    
    // Generate Performance Report
    log('\n=== Performance Analysis ===', 'blue');
    
    // Calculate overall performance score
    const totalTests = testResults.total;
    const performanceScore = ((testResults.passed / totalTests) * 100).toFixed(1);
    
    log(`\nPerformance Score: ${performanceScore}%`, 
        performanceScore >= 80 ? 'green' : performanceScore >= 60 ? 'yellow' : 'red');
    
    // Show detailed metrics
    log('\nDetailed Metrics:', 'blue');
    for (const [name, metrics] of Object.entries(testResults.metrics)) {
        if (metrics.average) {
            log(`  ${name}:`);
            log(`    Average: ${metrics.average}ms`);
            log(`    Min: ${metrics.min}ms, Max: ${metrics.max}ms`);
        }
    }
    
    // Performance recommendations
    log('\nPerformance Recommendations:', 'blue');
    
    const slowEndpoints = Object.entries(testResults.metrics)
        .filter(([_, m]) => m.average && parseFloat(m.average) > m.threshold)
        .map(([name, _]) => name);
    
    if (slowEndpoints.length > 0) {
        log('  Consider optimizing these slow endpoints:', 'yellow');
        slowEndpoints.forEach(endpoint => {
            log(`    - ${endpoint}`, 'yellow');
        });
    } else {
        log('  All endpoints meet performance thresholds ✓', 'green');
    }
    
    if (parseFloat(heapUsedMB) > 200) {
        log('  Consider investigating memory usage', 'yellow');
    }
    
    // Generate summary
    log('\n=== Performance Test Summary ===', 'blue');
    log(`Total Tests: ${testResults.total}`);
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Warnings: ${testResults.warnings}`, 'yellow');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    
    // Performance tests are not critical, but should mostly pass
    process.exit(performanceScore >= 60 ? 0 : 1);
}

// Run tests
runPerformanceTests().catch(error => {
    log(`\nFatal error running performance tests: ${error.message}`, 'red');
    process.exit(1);
});