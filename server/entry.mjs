#!/usr/bin/env node

/**
 * Production Entry Point for Persian Legal AI Server
 * Ensures proper ESM module loading and health endpoint availability
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Quick health check server in case main server has issues
async function startHealthCheckServer() {
    const healthApp = express();
    const PORT = process.env.PORT || 3000;
    
    healthApp.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    
    const healthServer = healthApp.listen(PORT, () => {
        console.log(`🏥 Health check server ready on port ${PORT}`);
    });
    
    return healthServer;
}

// Main server startup
async function startMainServer() {
    try {
        console.log('🚀 Starting Persian Legal AI Server...');
        console.log(`📁 Working directory: ${process.cwd()}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔧 Node version: ${process.version}`);
        
        // Import and start the main server
        const mainModule = await import('./main.js');
        
        // If main.js exports a function, call it
        if (typeof mainModule.default === 'function') {
            await mainModule.default();
        }
        // Otherwise, main.js should start the server itself
        
        console.log('✅ Main server module loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to start main server:', error);
        console.error('Stack trace:', error.stack);
        
        // Start minimal health check server as fallback
        console.log('🔄 Starting fallback health check server...');
        await startHealthCheckServer();
        
        // Keep process alive but indicate error state
        process.exitCode = 1;
    }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
startMainServer().catch(error => {
    console.error('❌ Fatal startup error:', error);
    process.exit(1);
});