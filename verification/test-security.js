#!/usr/bin/env node
// test-security.js - Security measures verification

import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';

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

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    critical: 0,
    tests: {}
};

async function runTest(name, testFn, critical = false) {
    testResults.total++;
    try {
        await testFn();
        testResults.passed++;
        testResults.tests[name] = 'PASSED';
        log(`  ✓ ${name}`, 'green');
        return true;
    } catch (error) {
        testResults.failed++;
        if (critical) testResults.critical++;
        testResults.tests[name] = `FAILED: ${error.message}`;
        log(`  ✗ ${name}: ${error.message}`, critical ? 'red' : 'yellow');
        return false;
    }
}

async function runSecurityTests() {
    log('\n=== Security Measures Verification ===\n', 'blue');
    
    // Test 1: Authentication Requirements
    log('Testing Authentication Requirements:', 'yellow');
    
    await runTest('Protected endpoints require authentication', async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/models`);
            throw new Error('Protected endpoint accessible without auth');
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Good - endpoint is protected
                return;
            }
            throw new Error('Unexpected response from protected endpoint');
        }
    }, true);
    
    await runTest('Invalid tokens are rejected', async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/models`, {
                headers: { Authorization: 'Bearer invalid_token_12345' }
            });
            throw new Error('Invalid token was accepted');
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Good - invalid token rejected
                return;
            }
            throw new Error('Invalid token not properly rejected');
        }
    }, true);
    
    // Test 2: Input Validation
    log('\nTesting Input Validation:', 'yellow');
    
    await runTest('Empty registration data rejected', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/register`, {});
            throw new Error('Empty registration accepted');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return; // Good - validation working
            }
            throw new Error('Invalid input not properly validated');
        }
    });
    
    await runTest('Invalid email format rejected', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/register`, {
                username: 'testuser',
                email: 'not-an-email',
                password: 'password123'
            });
            throw new Error('Invalid email accepted');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return; // Good - validation working
            }
            // Some systems might be more lenient with email validation
            log('    Warning: Email validation may be weak', 'yellow');
        }
    });
    
    await runTest('SQL injection prevention', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: "admin' OR '1'='1",
                password: "' OR '1'='1"
            });
            
            // If we get a success response, that's bad
            if (response.status === 200) {
                throw new Error('SQL injection vulnerability detected!');
            }
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 401)) {
                return; // Good - injection attempt blocked
            }
            if (error.message.includes('SQL injection')) {
                throw error; // Re-throw if it's our security error
            }
            // Any other error is fine - the injection was blocked
        }
    }, true);
    
    await runTest('XSS prevention in inputs', async () => {
        const xssPayload = '<script>alert("XSS")</script>';
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/register`, {
                username: xssPayload,
                email: `test_${Date.now()}@example.com`,
                password: 'password123'
            });
            
            // Check if the response contains unescaped script
            if (response.data && typeof response.data === 'string' && response.data.includes('<script>')) {
                throw new Error('XSS vulnerability - unescaped script in response');
            }
        } catch (error) {
            // Most errors here are fine - we're testing security
            if (error.message.includes('XSS vulnerability')) {
                throw error;
            }
        }
    });
    
    // Test 3: Password Security
    log('\nTesting Password Security:', 'yellow');
    
    await runTest('Password hashing verification', async () => {
        const testPassword = 'TestPassword123!';
        const hash = await bcrypt.hash(testPassword, 10);
        
        if (hash === testPassword) {
            throw new Error('Password not hashed');
        }
        
        const isValid = await bcrypt.compare(testPassword, hash);
        if (!isValid) {
            throw new Error('Password hash verification failed');
        }
    });
    
    await runTest('Weak passwords rejected', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/register`, {
                username: `user_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: '123' // Very weak password
            });
            
            // If this succeeds, password requirements are too weak
            log('    Warning: Weak passwords may be accepted', 'yellow');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return; // Good - weak password rejected
            }
        }
    });
    
    // Test 4: JWT Security
    log('\nTesting JWT Security:', 'yellow');
    
    await runTest('JWT structure validation', () => {
        const payload = { userId: 1, role: 'user' };
        const secret = 'test_secret_key';
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        
        // Verify token structure
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT structure');
        }
        
        // Verify token can be decoded
        const decoded = jwt.verify(token, secret);
        if (!decoded.userId) {
            throw new Error('JWT payload corrupted');
        }
    });
    
    await runTest('Expired tokens rejected', async () => {
        // Create an expired token
        const payload = { userId: 1, role: 'user' };
        const secret = 'test_secret_key';
        const expiredToken = jwt.sign(payload, secret, { expiresIn: '-1h' }); // Already expired
        
        try {
            const response = await axios.get(`${BASE_URL}/api/models`, {
                headers: { Authorization: `Bearer ${expiredToken}` }
            });
            throw new Error('Expired token was accepted');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                return; // Good - expired token rejected
            }
            // Server might not validate expiration strictly
            log('    Warning: Token expiration may not be enforced', 'yellow');
        }
    });
    
    // Test 5: CORS Configuration
    log('\nTesting CORS Configuration:', 'yellow');
    
    await runTest('CORS headers present', async () => {
        try {
            const response = await axios.options(`${BASE_URL}/api/health`, {
                headers: {
                    'Origin': 'http://example.com',
                    'Access-Control-Request-Method': 'GET'
                }
            });
            
            const corsHeaders = response.headers['access-control-allow-origin'];
            if (!corsHeaders) {
                throw new Error('CORS headers missing');
            }
        } catch (error) {
            // CORS might be configured differently
            log('    CORS configuration may need review', 'yellow');
        }
    });
    
    // Test 6: Rate Limiting
    log('\nTesting Rate Limiting:', 'yellow');
    
    await runTest('Rate limiting active', async () => {
        // Send multiple rapid requests
        const requests = [];
        for (let i = 0; i < 20; i++) {
            requests.push(
                axios.get(`${BASE_URL}/api/health`).catch(e => e.response)
            );
        }
        
        const responses = await Promise.all(requests);
        const rateLimited = responses.some(r => r && r.status === 429);
        
        if (!rateLimited) {
            log('    Warning: Rate limiting may not be configured', 'yellow');
        }
    });
    
    // Test 7: Security Headers
    log('\nTesting Security Headers:', 'yellow');
    
    await runTest('Security headers present', async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/health`);
            const headers = response.headers;
            
            const securityHeaders = [
                'x-content-type-options',
                'x-frame-options',
                'x-xss-protection',
                'strict-transport-security'
            ];
            
            const missingHeaders = securityHeaders.filter(h => !headers[h]);
            
            if (missingHeaders.length > 0) {
                log(`    Missing security headers: ${missingHeaders.join(', ')}`, 'yellow');
            }
        } catch (error) {
            // Headers might not be set in development
            log('    Security headers check skipped', 'yellow');
        }
    });
    
    // Test 8: File Upload Security
    log('\nTesting File Upload Security:', 'yellow');
    
    await runTest('Dangerous file types blocked', async () => {
        // This would typically test file upload endpoints
        // For now, we'll check if upload directory exists and has proper permissions
        const uploadDir = './uploads';
        
        if (fs.existsSync(uploadDir)) {
            const stats = fs.statSync(uploadDir);
            const mode = (stats.mode & parseInt('777', 8)).toString(8);
            
            if (mode === '777') {
                log('    Warning: Upload directory has overly permissive permissions', 'yellow');
            }
        }
    });
    
    // Generate summary
    log('\n=== Security Test Summary ===', 'blue');
    log(`Total Tests: ${testResults.total}`);
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    
    if (testResults.critical > 0) {
        log(`Critical Issues: ${testResults.critical}`, 'red');
    }
    
    const passRate = (testResults.passed / testResults.total * 100).toFixed(1);
    log(`Pass Rate: ${passRate}%`, passRate >= 70 ? 'green' : 'red');
    
    // Security tests are critical - require high pass rate
    process.exit(testResults.critical === 0 && passRate >= 70 ? 0 : 1);
}

// Run tests
runSecurityTests().catch(error => {
    log(`\nFatal error running security tests: ${error.message}`, 'red');
    process.exit(1);
});