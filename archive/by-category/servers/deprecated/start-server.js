#!/usr/bin/env node

// Custom server startup script to handle deprecation warnings
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '8080';

// Suppress specific deprecation warnings from third-party packages
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, name, code, ...args) {
  // Suppress util._extend deprecation warnings
  if (code === 'DEP0060' || (typeof warning === 'string' && warning.includes('util._extend'))) {
    return;
  }
  // Allow other warnings to pass through
  return originalEmitWarning.call(this, warning, name, code, ...args);
};

// Start the server
import('./server/index.js').catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});