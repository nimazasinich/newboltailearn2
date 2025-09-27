#!/usr/bin/env node
// test-api-endpoints.js - Comprehensive API endpoint testing

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:8080';
const RESULTS_FILE = process.env.RESULTS_FILE || 'verification-results.json';

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Helper function to log with color
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to test an endpoint
async function testEndpoint(method, path, options = {}) {
    testResults.total++;
    
    try {
        const config = {
            method: method.toLowerCase(),
            url: `${BASE_URL}${path}`,
            validateStatus: () => true, // Don't throw on any status
            timeout: 5000,
            ...options
        };
        
        const response = await axios(config);
        
        // Determine if test passed based on expected status
        const expectedStatus = options.expectedStatus || 
            (path.includes('/auth/') && !options.headers ? 401 : 200);
        
        const passed = response.status === expectedStatus || 
            (expectedStatus === 200 && response.status >= 200 && response.status < 300);
        
        if (passed) {
            testResults.passed++;
            log(`  ✓ ${method} ${path} - Status: ${response.status}`, 'green');
        } else {
            testResults.failed++;
            log(`  ✗ ${method} ${path} - Status: ${response.status} (expected ${expectedStatus})`, 'red');
        }
        
        testResults.details.push({
            endpoint: `${method} ${path}`,
            status: response.status,
            expectedStatus,
            passed,
            responseTime: response.headers['x-response-time'] || 'N/A'
        });
        
        return { passed, response };
        
    } catch (error) {
        testResults.failed++;
        const errorMsg = error.response ? 
            `Status: ${error.response.status}` : 
            `Error: ${error.message}`;
        
        log(`  ✗ ${method} ${path} - ${errorMsg}`, 'red');
        
        testResults.details.push({
            endpoint: `${method} ${path}`,
            error: errorMsg,
            passed: false
        });
        
        return { passed: false, error };
    }
}

// Main test function
async function runAPITests() {
    log('\n=== API Endpoint Verification ===\n', 'blue');
    
    // Test health endpoints
    log('Testing Health Endpoints:', 'yellow');
    await testEndpoint('GET', '/health');
    await testEndpoint('GET', '/api/health');
    
    // Test authentication endpoints
    log('\nTesting Authentication Endpoints:', 'yellow');
    
    // Create test user
    const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
    };
    
    // Test registration
    const registerResult = await testEndpoint('POST', '/api/auth/register', {
        data: testUser,
        expectedStatus: 201
    });
    
    // Test login
    let authToken = null;
    if (registerResult.passed || true) { // Try login anyway
        const loginResult = await testEndpoint('POST', '/api/auth/login', {
            data: {
                email: testUser.email,
                password: testUser.password
            },
            expectedStatus: 200
        });
        
        if (loginResult.passed && loginResult.response?.data?.token) {
            authToken = loginResult.response.data.token;
            log('    Authentication token obtained', 'green');
        }
    }
    
    // Test protected endpoints with token
    if (authToken) {
        const authHeaders = { Authorization: `Bearer ${authToken}` };
        
        log('\nTesting Protected Endpoints:', 'yellow');
        
        // User profile
        await testEndpoint('GET', '/api/auth/profile', { headers: authHeaders });
        
        // Models endpoints
        await testEndpoint('GET', '/api/models', { headers: authHeaders });
        await testEndpoint('POST', '/api/models', { 
            headers: authHeaders,
            data: {
                name: `test_model_${Date.now()}`,
                type: 'classification',
                config: { layers: 2, units: 64 }
            },
            expectedStatus: 201
        });
        
        // Datasets endpoints
        await testEndpoint('GET', '/api/datasets', { headers: authHeaders });
        
        // Training endpoints
        await testEndpoint('GET', '/api/training/sessions', { headers: authHeaders });
        await testEndpoint('GET', '/api/training/stats', { headers: authHeaders });
        
        // Analytics endpoints
        await testEndpoint('GET', '/api/analytics/performance', { headers: authHeaders });
        await testEndpoint('GET', '/api/analytics/metrics', { headers: authHeaders });
        
        // System endpoints
        await testEndpoint('GET', '/api/system/metrics', { headers: authHeaders });
        await testEndpoint('GET', '/api/system/status', { headers: authHeaders });
    } else {
        log('\nSkipping protected endpoint tests (no auth token)', 'yellow');
    }
    
    // Test public endpoints
    log('\nTesting Public Endpoints:', 'yellow');
    await testEndpoint('GET', '/api/public/status');
    await testEndpoint('GET', '/api/public/version');
    
    // Test error handling
    log('\nTesting Error Handling:', 'yellow');
    await testEndpoint('GET', '/api/nonexistent', { expectedStatus: 404 });
    await testEndpoint('POST', '/api/auth/login', { 
        data: { email: 'invalid', password: '' },
        expectedStatus: 400
    });
    
    // Generate summary
    log('\n=== API Test Summary ===', 'blue');
    log(`Total Tests: ${testResults.total}`);
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    
    const passRate = (testResults.passed / testResults.total * 100).toFixed(1);
    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
    
    // Update results file if it exists
    try {
        if (fs.existsSync(RESULTS_FILE)) {
            const results = JSON.parse(fs.readFileSync(RESULTS_FILE));
            results.tests.api_detailed = testResults;
            fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
        }
    } catch (error) {
        // Ignore errors updating results file
    }
    
    // Exit with appropriate code
    process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests
runAPITests().catch(error => {
    log(`\nFatal error running API tests: ${error.message}`, 'red');
    process.exit(1);
});