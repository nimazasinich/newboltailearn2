#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Persian Legal AI - Unified Server...\n');

// Check if dist directory exists (frontend build)
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 Building frontend...');
  
  // Build frontend first
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: path.resolve(__dirname),
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Frontend build completed');
      startUnifiedServer();
    } else {
      console.error('❌ Frontend build failed');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Frontend build found');
  startUnifiedServer();
}

function startUnifiedServer() {
  console.log('🌐 Starting unified server (frontend + backend)...');
  
  // Start the unified server
  const serverProcess = spawn('node', ['server/index.js'], {
    cwd: path.resolve(__dirname),
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  const cleanup = () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  console.log('\n📊 System will be available at:');
  console.log('   🌐 Frontend: http://localhost:3001');
  console.log('   🔌 API:      http://localhost:3001/api');
  console.log('   📡 WebSocket: ws://localhost:3001');
  console.log('\n💡 Press Ctrl+C to stop the server\n');
}