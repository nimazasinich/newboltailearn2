#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests all major API endpoints to ensure they're working
 */

import http from 'http';

const API_BASE = 'http://localhost:8080';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const tests = [
    { name: 'Health Check', path: '/health' },
    { name: 'API Health', path: '/api/health' },
    { name: 'Documents', path: '/api/documents' },
    { name: 'Categories', path: '/api/categories' },
    { name: 'Analytics', path: '/api/analytics' },
    { name: 'Models', path: '/api/models' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await makeRequest(test.path);
      
      if (result.status === 200) {
        console.log(`✅ ${test.name}: OK (${result.status})`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   Response keys: ${Object.keys(result.data).join(', ')}`);
        }
        passed++;
      } else {
        console.log(`❌ ${test.name}: Failed (${result.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs.');
    process.exit(1);
  }
}

// Check if server is running
makeRequest('/health')
  .then(() => {
    console.log('🚀 Server is running, starting tests...\n');
    return runTests();
  })
  .catch((error) => {
    console.error('❌ Server is not running or not accessible.');
    console.error('Please start the server with: npm start');
    console.error('Error:', error.message);
    process.exit(1);
  });