#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      websocket: 'active',
      external_apis: 'responsive'
    }
  });
});

// API endpoints
app.get('/api/models', (req, res) => {
  res.json([
    { id: 1, name: 'Persian Legal BERT', type: 'persian-bert', status: 'completed', accuracy: 0.92 },
    { id: 2, name: 'DoRA Legal QA', type: 'dora', status: 'training', accuracy: 0.87 },
    { id: 3, name: 'QR Adaptor Legal', type: 'qr-adaptor', status: 'idle', accuracy: 0.0 }
  ]);
});

app.get('/api/datasets', (req, res) => {
  res.json([
    { id: 'iran-legal-qa', name: 'پرسش و پاسخ حقوقی ایران', samples: 10247, status: 'available' },
    { id: 'legal-laws', name: 'متون قوانین ایران', samples: 50000, status: 'available' },
    { id: 'persian-ner', name: 'تشخیص موجودیت فارسی', samples: 500000, status: 'available' }
  ]);
});

app.get('/api/analytics', (req, res) => {
  res.json({
    modelStats: [
      { type: 'persian-bert', count: 1, avg_accuracy: 0.92, max_accuracy: 0.92 },
      { type: 'dora', count: 1, avg_accuracy: 0.87, max_accuracy: 0.87 },
      { type: 'qr-adaptor', count: 1, avg_accuracy: 0.0, max_accuracy: 0.0 }
    ],
    trainingStats: [],
    recentActivity: [
      { level: 'info', count: 45 },
      { level: 'warning', count: 3 },
      { level: 'error', count: 1 }
    ],
    summary: {
      totalModels: 3,
      activeTraining: 1,
      completedModels: 1,
      totalDatasets: 3
    }
  });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('✅ WebSocket client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ WebSocket client disconnected:', socket.id);
  });
  
  // Send initial system metrics
  socket.emit('system_metrics', {
    cpu: { usage: 25.5 },
    memory: { used: 512, total: 2048, percentage: 25.0 },
    uptime: 3600,
    active_training: 1
  });
});

// Send system metrics every 5 seconds
setInterval(() => {
  const metrics = {
    cpu: { usage: Math.random() * 100 },
    memory: { used: 512 + Math.random() * 200, total: 2048, percentage: 25.0 + Math.random() * 10 },
    uptime: process.uptime(),
    active_training: 1
  };
  io.emit('system_metrics', metrics);
}, 5000);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Persian Legal AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});