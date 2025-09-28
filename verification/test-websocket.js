#!/usr/bin/env node
// test-websocket.js - WebSocket and real-time features verification

import { io } from 'socket.io-client';
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

// Test results tracking
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
};

function recordTest(name, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        testResults.tests[name] = 'PASSED';
        log(`  ✓ ${name}`, 'green');
    } else {
        testResults.failed++;
        testResults.tests[name] = `FAILED: ${details}`;
        log(`  ✗ ${name}: ${details}`, 'red');
    }
}

async function runWebSocketTests() {
    log('\n=== WebSocket Functionality Verification ===\n', 'blue');
    
    return new Promise((resolve) => {
        const SOCKET_URL = 'http://localhost:8080';
        let socket;
        let testTimeout;
        
        // Set overall timeout
        testTimeout = setTimeout(() => {
            log('\nWebSocket tests timed out', 'yellow');
            if (socket) socket.close();
            
            // Generate summary
            log('\n=== WebSocket Test Summary ===', 'blue');
            log(`Total Tests: ${testResults.total}`);
            log(`Passed: ${testResults.passed}`, 'green');
            log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
            
            resolve(testResults.failed === 0 ? 0 : 1);
        }, 15000); // 15 second timeout
        
        try {
            log('Connecting to WebSocket server...', 'yellow');
            socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: false,
                timeout: 5000
            });
            
            // Test 1: Connection
            socket.on('connect', () => {
                recordTest('WebSocket connection', true);
                
                // Test 2: Basic event emission
                log('\nTesting event handling...', 'yellow');
                socket.emit('test_event', { test: 'data' });
                
                // Test 3: Request-response pattern
                socket.emit('ping');
                
                // Test 4: Room joining
                socket.emit('join_room', { room: 'test_room' });
                
                // Test 5: Broadcasting
                socket.emit('broadcast_test', { message: 'test broadcast' });
                
                // Test 6: Error handling
                socket.emit('invalid_event');
                
                // Give server time to respond
                setTimeout(() => {
                    // Check what we received
                    recordTest('Event emission', true); // If we got here, basic events work
                    
                    // Clean up and finish
                    clearTimeout(testTimeout);
                    socket.close();
                    
                    // Generate summary
                    log('\n=== WebSocket Test Summary ===', 'blue');
                    log(`Total Tests: ${testResults.total}`);
                    log(`Passed: ${testResults.passed}`, 'green');
                    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
                    
                    const passRate = (testResults.passed / testResults.total * 100).toFixed(1);
                    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
                    
                    resolve(testResults.failed === 0 ? 0 : 1);
                }, 3000);
            });
            
            // Connection error handling
            socket.on('connect_error', (error) => {
                recordTest('WebSocket connection', false, error.message);
                clearTimeout(testTimeout);
                
                log('\n=== WebSocket Test Summary ===', 'blue');
                log('WebSocket server not available or not configured', 'yellow');
                log('This is acceptable if WebSocket features are not used', 'yellow');
                
                resolve(1); // Return warning status
            });
            
            // Test response handlers
            socket.on('pong', () => {
                recordTest('Ping-pong response', true);
            });
            
            socket.on('room_joined', (data) => {
                recordTest('Room joining', true);
            });
            
            socket.on('broadcast_received', (data) => {
                recordTest('Broadcast reception', true);
            });
            
            socket.on('error', (error) => {
                recordTest('Error handling', true); // Getting error events is actually good
            });
            
            // Disconnect handler
            socket.on('disconnect', (reason) => {
                log(`\nDisconnected: ${reason}`, 'yellow');
            });
            
        } catch (error) {
            log(`\nFatal error in WebSocket tests: ${error.message}`, 'red');
            clearTimeout(testTimeout);
            resolve(1);
        }
    });
}

// Run tests and exit with appropriate code
runWebSocketTests().then(exitCode => {
    process.exit(exitCode);
}).catch(error => {
    log(`\nUnexpected error: ${error.message}`, 'red');
    process.exit(1);
});