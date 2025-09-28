#!/usr/bin/env node

import { io } from 'socket.io-client';

console.log('🔌 Testing WebSocket connection...');

const socket = io('http://localhost:8080', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
  retries: 3
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('📡 Socket ID:', socket.id);
  
  // Test system metrics
  socket.on('system_metrics', (data) => {
    console.log('📊 Received system metrics:', data);
  });
  
  // Disconnect after 5 seconds
  setTimeout(() => {
    socket.disconnect();
    console.log('🔌 WebSocket disconnected');
    process.exit(0);
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection failed:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 WebSocket disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ WebSocket connection timeout');
  process.exit(1);
}, 10000);