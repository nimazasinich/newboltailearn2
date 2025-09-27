#!/usr/bin/env node
/**
 * Test script to verify MCP server installation
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('🧪 Testing MCP Server Installation...\n');

// Test 1: Check if Node.js version is compatible
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 22) {
  console.log(`   ✅ Node.js ${nodeVersion} (Compatible)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (Requires v22+)`);
  process.exit(1);
}

// Test 2: Check if MCP server file exists
console.log('\n2. Checking MCP server file...');
const serverFile = './smart-persian-mcp-bundle.mjs';
if (fs.existsSync(serverFile)) {
  console.log(`   ✅ Server file found: ${serverFile}`);
} else {
  console.log(`   ❌ Server file not found: ${serverFile}`);
  process.exit(1);
}

// Test 3: Test server startup
console.log('\n3. Testing server startup...');
const server = spawn('node', [serverFile], { stdio: ['pipe', 'pipe', 'pipe'] });

let serverOutput = '';
let serverError = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

server.stderr.on('data', (data) => {
  serverError += data.toString();
});

// Send a test request
setTimeout(() => {
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(testRequest) + '\n');
}, 1000);

// Check response
setTimeout(() => {
  if (serverOutput.includes('"tools"') && serverOutput.includes('smart_create')) {
    console.log('   ✅ Server responds to tool list request');
  } else {
    console.log('   ❌ Server not responding correctly');
    console.log('   Output:', serverOutput);
    console.log('   Error:', serverError);
  }
  
  server.kill();
  
  // Test 4: Check configuration file
  console.log('\n4. Checking configuration file...');
  const configFile = './complete-mcp-config.json';
  if (fs.existsSync(configFile)) {
    console.log(`   ✅ Configuration file found: ${configFile}`);
    
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (config.mcpServers && config.mcpServers['smart-persian-mcp']) {
        console.log('   ✅ Configuration is valid');
      } else {
        console.log('   ❌ Configuration is invalid');
      }
    } catch (error) {
      console.log('   ❌ Configuration file is not valid JSON');
    }
  } else {
    console.log(`   ❌ Configuration file not found: ${configFile}`);
  }
  
  // Test 5: Check directories
  console.log('\n5. Checking output directories...');
  const dirs = ['./cursor-memory', './cursor-outputs'];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`   ✅ Directory exists: ${dir}`);
    } else {
      console.log(`   ⚠️  Directory will be created: ${dir}`);
    }
  });
  
  console.log('\n🎉 Installation test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Open Cursor');
  console.log('2. Press Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)');
  console.log('3. Type "Preferences: Open Settings (JSON)"');
  console.log('4. Add the MCP configuration from complete-mcp-config.json');
  console.log('5. Restart Cursor');
  console.log('6. Test with: "Help me create a blue button"');
  
}, 3000);
