#!/usr/bin/env node
/**
 * Complete MCP Server Test
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing Complete MCP Server...\n');

// Test 1: Store in memory
console.log('1. Testing memory storage...');
const storeRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'store_memory',
    arguments: {
      key: 'user_preference',
      value: {
        language: 'persian',
        theme: 'modern',
        colors: { primary: '#667eea', secondary: '#764ba2' }
      },
      category: 'preferences'
    }
  }
};

// Test 2: Retrieve from memory
console.log('2. Testing memory retrieval...');
const retrieveRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'retrieve_memory',
    arguments: { key: 'user_preference' }
  }
};

// Test 3: Execute command
console.log('3. Testing command execution...');
const commandRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'create_component',
    arguments: {
      type: 'button',
      parameters: {
        text: 'دکمه تست فارسی',
        color: '#2ecc71',
        size: 'medium'
      }
    }
  }
};

// Test 4: List memory
console.log('4. Testing memory listing...');
const listRequest = {
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'list_memory',
    arguments: {}
  }
};

async function runTest(request, description) {
  return new Promise((resolve) => {
    const server = spawn('node', ['complete-mcp-server.mjs'], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let output = '';
    let error = '';
    
    server.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    server.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    setTimeout(() => {
      server.stdin.write(JSON.stringify(request) + '\n');
    }, 1000);
    
    setTimeout(() => {
      server.kill();
      
      if (output.includes('"success":true') || output.includes('"result"')) {
        console.log(`   ✅ ${description} - Success`);
        resolve(true);
      } else {
        console.log(`   ❌ ${description} - Failed`);
        console.log(`   Output: ${output}`);
        resolve(false);
      }
    }, 3000);
  });
}

async function runAllTests() {
  const results = [];
  
  results.push(await runTest(storeRequest, 'Memory Storage'));
  results.push(await runTest(retrieveRequest, 'Memory Retrieval'));
  results.push(await runTest(commandRequest, 'Command Execution'));
  results.push(await runTest(listRequest, 'Memory Listing'));
  
  const successCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Test Results: ${successCount}/${totalCount} passed`);
  
  if (successCount === totalCount) {
    console.log('🎉 All tests passed! MCP server is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Open Cursor');
    console.log('2. Press Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)');
    console.log('3. Type "Preferences: Open Settings (JSON)"');
    console.log('4. Add the configuration from complete-mcp-config.json');
    console.log('5. Restart Cursor');
    console.log('6. Test with: "Store my preference in memory"');
  } else {
    console.log('❌ Some tests failed. Check the output above.');
  }
}

runAllTests();
