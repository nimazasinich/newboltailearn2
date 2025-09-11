import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite Database
const dbPath = path.join(process.cwd(), 'persian_legal_ai.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('dora', 'qr-adaptor', 'persian-bert')),
    status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'training', 'completed', 'failed', 'paused')),
    accuracy REAL DEFAULT 0,
    loss REAL DEFAULT 0,
    epochs INTEGER DEFAULT 0,
    current_epoch INTEGER DEFAULT 0,
    dataset_id TEXT,
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    huggingface_id TEXT,
    samples INTEGER DEFAULT 0,
    size_mb REAL DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'downloading', 'processing', 'error')),
    local_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')),
    message TEXT NOT NULL,
    epoch INTEGER,
    loss REAL,
    accuracy REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')),
    category TEXT,
    message TEXT NOT NULL,
    metadata TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'trainer', 'viewer', 'user')),
    permissions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default datasets
const defaultDatasets = [
  {
    id: 'iran-legal-qa',
    name: 'پرسش و پاسخ حقوقی ایران',
    source: 'huggingface',
    huggingface_id: 'PerSets/iran-legal-persian-qa',
    samples: 10247,
    size_mb: 15.2
  },
  {
    id: 'legal-laws',
    name: 'متون قوانین ایران',
    source: 'huggingface',
    huggingface_id: 'QomSSLab/legal_laws_lite_chunk_v1',
    samples: 50000,
    size_mb: 125.8
  },
  {
    id: 'persian-ner',
    name: 'تشخیص موجودیت فارسی',
    source: 'huggingface',
    huggingface_id: 'mansoorhamidzadeh/Persian-NER-Dataset-500k',
    samples: 500000,
    size_mb: 890.5
  }
];

const insertDataset = db.prepare(`
  INSERT OR IGNORE INTO datasets (id, name, source, huggingface_id, samples, size_mb)
  VALUES (?, ?, ?, ?, ?, ?)
`);

defaultDatasets.forEach(dataset => {
  insertDataset.run(dataset.id, dataset.name, dataset.source, dataset.huggingface_id, dataset.samples, dataset.size_mb);
});

// Insert default settings
const defaultSettings = [
  { key: 'dataset_directory', value: './datasets', description: 'Directory for storing datasets' },
  { key: 'model_directory', value: './models', description: 'Directory for storing trained models' },
  { key: 'huggingface_token', value: '', description: 'HuggingFace API token' },
  { key: 'max_concurrent_training', value: '2', description: 'Maximum concurrent training sessions' },
  { key: 'default_batch_size', value: '32', description: 'Default batch size for training' },
  { key: 'default_learning_rate', value: '0.001', description: 'Default learning rate' }
];

const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO system_settings (key, value, description)
  VALUES (?, ?, ?)
`);

defaultSettings.forEach(setting => {
  insertSetting.run(setting.key, setting.value, setting.description);
});

// Utility functions
const logToDatabase = (level: string, category: string, message: string, metadata?: any) => {
  const stmt = db.prepare(`
    INSERT INTO system_logs (level, category, message, metadata)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(level, category, message, metadata ? JSON.stringify(metadata) : null);
};

const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  return {
    cpu: Math.random() * 100, // Placeholder - would use actual CPU monitoring
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };
};

// API Routes

// Models endpoints
app.get('/api/models', (req, res) => {
  try {
    const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all();
    res.json(models);
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to fetch models', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/models', (req, res) => {
  try {
    const { name, type, dataset_id, config } = req.body;
    
    if (!name || !type || !dataset_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO models (name, type, dataset_id, config)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, type, dataset_id, JSON.stringify(config || {}));
    
    logToDatabase('info', 'models', `Created new model: ${name}`, { id: result.lastInsertRowid, type });
    
    res.json({ 
      id: result.lastInsertRowid, 
      message: 'Model created successfully',
      model: { id: result.lastInsertRowid, name, type, dataset_id, status: 'idle' }
    });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to create model', { error: error.message });
    res.status(500).json({ error: 'Failed to create model' });
  }
});

app.put('/api/models/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).filter(key => 
      ['name', 'status', 'accuracy', 'loss', 'current_epoch', 'config'].includes(key)
    );
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => 
      field === 'config' ? JSON.stringify(updates[field]) : updates[field]
    );
    
    const stmt = db.prepare(`
      UPDATE models 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...values, id);
    
    logToDatabase('info', 'models', `Updated model ${id}`, updates);
    res.json({ message: 'Model updated successfully' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to update model', { error: error.message });
    res.status(500).json({ error: 'Failed to update model' });
  }
});

app.delete('/api/models/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete related training logs
    db.prepare('DELETE FROM training_logs WHERE model_id = ?').run(id);
    
    // Delete model
    const result = db.prepare('DELETE FROM models WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    logToDatabase('info', 'models', `Deleted model ${id}`);
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to delete model', { error: error.message });
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

// Training endpoints
app.post('/api/models/:id/train', (req, res) => {
  try {
    const { id } = req.params;
    const { epochs = 10, batch_size = 32, learning_rate = 0.001 } = req.body;
    
    // Update model status
    db.prepare('UPDATE models SET status = ?, current_epoch = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('training', id);
    
    // Log training start
    db.prepare(`
      INSERT INTO training_logs (model_id, level, message, epoch)
      VALUES (?, 'info', 'Training started', 0)
    `).run(id);
    
    logToDatabase('info', 'training', `Started training model ${id}`, { epochs, batch_size, learning_rate });
    
    // Simulate training progress
    simulateTraining(parseInt(id), epochs);
    
    res.json({ message: 'Training started successfully' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to start training', { error: error.message });
    res.status(500).json({ error: 'Failed to start training' });
  }
});

app.post('/api/models/:id/pause', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('paused', id);
    
    logToDatabase('info', 'training', `Paused training model ${id}`);
    res.json({ message: 'Training paused successfully' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to pause training', { error: error.message });
    res.status(500).json({ error: 'Failed to pause training' });
  }
});

app.post('/api/models/:id/resume', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('training', id);
    
    logToDatabase('info', 'training', `Resumed training model ${id}`);
    res.json({ message: 'Training resumed successfully' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to resume training', { error: error.message });
    res.status(500).json({ error: 'Failed to resume training' });
  }
});

// Datasets endpoints
app.get('/api/datasets', (req, res) => {
  try {
    const datasets = db.prepare('SELECT * FROM datasets ORDER BY created_at DESC').all();
    res.json(datasets);
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to fetch datasets', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

app.post('/api/datasets/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(id);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    // Update status to downloading
    db.prepare('UPDATE datasets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('downloading', id);
    
    // Simulate download process
    setTimeout(() => {
      db.prepare('UPDATE datasets SET status = ?, local_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('available', `./datasets/${id}`, id);
      
      logToDatabase('info', 'datasets', `Downloaded dataset ${dataset.name}`);
      
      // Emit update via WebSocket
      io.emit('dataset_updated', { id, status: 'available' });
    }, 3000);
    
    res.json({ message: 'Dataset download started' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to download dataset', { error: error.message });
    res.status(500).json({ error: 'Failed to download dataset' });
  }
});

// Logs endpoints
app.get('/api/logs', (req, res) => {
  try {
    const { type = 'system', level, limit = 100 } = req.query;
    
    let query = '';
    let params = [];
    
    if (type === 'training') {
      query = 'SELECT tl.*, m.name as model_name FROM training_logs tl LEFT JOIN models m ON tl.model_id = m.id';
      if (level) {
        query += ' WHERE tl.level = ?';
        params.push(level);
      }
      query += ' ORDER BY tl.timestamp DESC LIMIT ?';
    } else {
      query = 'SELECT * FROM system_logs';
      if (level) {
        query += ' WHERE level = ?';
        params.push(level);
      }
      query += ' ORDER BY timestamp DESC LIMIT ?';
    }
    
    params.push(parseInt(limit as string));
    
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to fetch logs', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Monitoring endpoints
app.get('/api/monitoring', (req, res) => {
  try {
    const metrics = getSystemMetrics();
    
    // Get training status
    const trainingModels = db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get();
    const totalModels = db.prepare('SELECT COUNT(*) as count FROM models').get();
    
    res.json({
      ...metrics,
      training: {
        active: trainingModels.count,
        total: totalModels.count
      }
    });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to fetch monitoring data', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM system_settings ORDER BY key').all();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at
      };
      return acc;
    }, {});
    
    res.json(settingsObj);
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to fetch settings', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const updates = req.body;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO system_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    Object.entries(updates).forEach(([key, value]) => {
      stmt.run(key, value);
    });
    
    logToDatabase('info', 'settings', 'Updated system settings', updates);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to update settings', { error: error.message });
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  try {
    const modelStats = db.prepare(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(accuracy) as avg_accuracy,
        MAX(accuracy) as max_accuracy
      FROM models 
      GROUP BY type
    `).all();
    
    const trainingStats = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as models_created
      FROM models 
      WHERE created_at >= date('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all();
    
    const recentActivity = db.prepare(`
      SELECT level, COUNT(*) as count
      FROM system_logs 
      WHERE timestamp >= datetime('now', '-24 hours')
      GROUP BY level
    `).all();
    
    res.json({
      modelStats,
      trainingStats,
      recentActivity,
      summary: {
        totalModels: db.prepare('SELECT COUNT(*) as count FROM models').get().count,
        activeTraining: db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get().count,
        completedModels: db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'completed'").get().count,
        totalDatasets: db.prepare('SELECT COUNT(*) as count FROM datasets').get().count
      }
    });
  } catch (error) {
    logToDatabase('error', 'api', 'Failed to fetch analytics', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Training simulation function
function simulateTraining(modelId: number, totalEpochs: number) {
  let currentEpoch = 0;
  let currentLoss = 2.5;
  let currentAccuracy = 0.1;
  
  const trainingInterval = setInterval(() => {
    currentEpoch++;
    currentLoss = Math.max(0.1, currentLoss * (0.95 + Math.random() * 0.1));
    currentAccuracy = Math.min(0.95, currentAccuracy + (Math.random() * 0.05));
    
    // Update model
    db.prepare(`
      UPDATE models 
      SET current_epoch = ?, loss = ?, accuracy = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(currentEpoch, currentLoss, currentAccuracy, modelId);
    
    // Log progress
    db.prepare(`
      INSERT INTO training_logs (model_id, level, message, epoch, loss, accuracy)
      VALUES (?, 'info', ?, ?, ?, ?)
    `).run(modelId, `Epoch ${currentEpoch}/${totalEpochs} completed`, currentEpoch, currentLoss, currentAccuracy);
    
    // Emit progress via WebSocket
    io.emit('training_progress', {
      modelId,
      epoch: currentEpoch,
      totalEpochs,
      loss: currentLoss,
      accuracy: currentAccuracy
    });
    
    if (currentEpoch >= totalEpochs) {
      // Training completed
      db.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('completed', modelId);
      
      db.prepare(`
        INSERT INTO training_logs (model_id, level, message, epoch)
        VALUES (?, 'info', 'Training completed successfully', ?)
      `).run(modelId, currentEpoch);
      
      io.emit('training_completed', { modelId });
      clearInterval(trainingInterval);
    }
  }, 2000); // Update every 2 seconds
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Send initial system metrics
  socket.emit('system_metrics', getSystemMetrics());
});

// Send system metrics every 5 seconds
setInterval(() => {
  io.emit('system_metrics', getSystemMetrics());
}, 5000);

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  logToDatabase('error', 'server', error.message, { stack: error.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Persian Legal AI Server running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  logToDatabase('info', 'server', `Server started on port ${PORT}`);
});

export default app;