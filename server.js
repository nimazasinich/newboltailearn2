#!/usr/bin/env node

// Production server entry point for Render deployment
// This file starts the backend server using the existing server infrastructure

import { fileURLToPath } from 'url';
import path from 'path';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 Starting Persian Legal AI Server for Render deployment...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT || 3001}`);

// Import and start the main server
try {
  // Use dynamic import to load the main server
  const { default: app } = await import('./server/index.js');
  
  console.log('✅ Server application loaded successfully');
  
  // The server is already started in server/index.js
  // This file just ensures proper environment setup for Render
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});