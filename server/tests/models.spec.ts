import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';

// Create a test server
const createTestServer = () => {
  const app = express();
  app.use(express.json());
  
  // Create in-memory test database
  const db = new Database(':memory:');
  
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

    CREATE TABLE IF NOT EXISTS training_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_id INTEGER NOT NULL,
      dataset_id TEXT NOT NULL,
      parameters TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      status TEXT DEFAULT 'running' CHECK(status IN ('running', 'completed', 'failed', 'paused')),
      final_accuracy REAL,
      final_loss REAL,
      total_epochs INTEGER,
      training_duration_seconds INTEGER,
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(model_id) REFERENCES models(id),
      FOREIGN KEY(dataset_id) REFERENCES datasets(id)
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

    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source TEXT NOT NULL,
      huggingface_id TEXT,
      samples INTEGER DEFAULT 0,
      size_mb REAL DEFAULT 0,
      status TEXT DEFAULT 'available',
      local_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert test data
  db.prepare(`
    INSERT INTO datasets (id, name, source, samples, size_mb)
    VALUES ('test-dataset', 'Test Dataset', 'huggingface', 1000, 5.2)
  `).run();

  // Models endpoints
  app.get('/api/models', (req, res) => {
    try {
      const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all();
      res.json(models);
    } catch (error) {
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
      
      res.json({ 
        id: result.lastInsertRowid, 
        message: 'Model created successfully',
        model: { id: result.lastInsertRowid, name, type, dataset_id, status: 'idle' }
      });
    } catch (error) {
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
      
      res.json({ message: 'Model updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update model' });
    }
  });

  app.post('/api/models/:id/train', (req, res) => {
    try {
      const { id } = req.params;
      const { epochs = 10, batch_size = 32, learning_rate = 0.001, dataset_ids = [] } = req.body;
      
      const model = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as any;
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      if (model.status === 'training') {
        return res.status(400).json({ error: 'Model is already training' });
      }
      
      const trainingConfig = {
        epochs,
        batch_size,
        learning_rate,
        dataset_ids: dataset_ids.length > 0 ? dataset_ids : ['test-dataset']
      };
      
      const sessionResult = db.prepare(`
        INSERT INTO training_sessions (model_id, dataset_id, parameters, start_time, status)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'running')
      `).run(id, model.dataset_id, JSON.stringify(trainingConfig));
      
      const sessionId = sessionResult.lastInsertRowid;
      
      // Update model status
      db.prepare('UPDATE models SET status = ?, current_epoch = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('training', id);
      
      // Log training start
      db.prepare(`
        INSERT INTO training_logs (model_id, level, message, epoch)
        VALUES (?, 'info', 'Training started', 0)
      `).run(id);
      
      res.json({ message: 'Training started successfully', sessionId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start training' });
    }
  });

  app.post('/api/models/:id/pause', (req, res) => {
    try {
      const { id } = req.params;
      
      db.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('paused', id);
      
      db.prepare(`
        INSERT INTO training_logs (model_id, level, message, epoch)
        VALUES (?, 'info', 'Training paused by user', 0)
      `).run(id);
      
      res.json({ message: 'Training paused successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to pause training' });
    }
  });

  app.post('/api/models/:id/resume', (req, res) => {
    try {
      const { id } = req.params;
      const model = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as any;
      
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      if (model.status !== 'paused') {
        return res.status(400).json({ error: 'Model is not paused' });
      }
      
      db.prepare('UPDATE models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('training', id);
      
      db.prepare(`
        INSERT INTO training_logs (model_id, level, message, epoch)
        VALUES (?, 'info', 'Training resumed by user', ?)
      `).run(id, model.current_epoch || 0);
      
      res.json({ message: 'Training resumed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resume training' });
    }
  });

  return { app, db };
};

describe('Models API', () => {
  let app: express.Application;
  let db: Database.Database;

  beforeAll(() => {
    const testServer = createTestServer();
    app = testServer.app;
    db = testServer.db;
  });

  afterAll(() => {
    db.close();
  });

  it('should return empty models list initially', async () => {
    const response = await request(app)
      .get('/api/models')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });

  it('should create a new model', async () => {
    const modelData = {
      name: 'Test Persian BERT',
      type: 'persian-bert',
      dataset_id: 'test-dataset',
      config: { learning_rate: 0.001, batch_size: 32 }
    };

    const response = await request(app)
      .post('/api/models')
      .send(modelData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('model');
    expect(response.body.model.name).toBe('Test Persian BERT');
    expect(response.body.model.type).toBe('persian-bert');
    expect(response.body.model.status).toBe('idle');
  });

  it('should return created models', async () => {
    const response = await request(app)
      .get('/api/models')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    
    const model = response.body[0];
    expect(model.name).toBe('Test Persian BERT');
    expect(model.type).toBe('persian-bert');
    expect(model.status).toBe('idle');
  });

  it('should update model status', async () => {
    const models = db.prepare('SELECT * FROM models').all() as any[];
    const modelId = models[0].id;

    const response = await request(app)
      .put(`/api/models/${modelId}`)
      .send({ status: 'training', accuracy: 0.85 })
      .expect(200);

    expect(response.body.message).toBe('Model updated successfully');

    // Verify update
    const updatedModel = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
    expect(updatedModel.status).toBe('training');
    expect(updatedModel.accuracy).toBe(0.85);
  });

  it('should start training for a model', async () => {
    const models = db.prepare('SELECT * FROM models').all() as any[];
    const modelId = models[0].id;

    // First, set model status to idle
    db.prepare('UPDATE models SET status = ? WHERE id = ?').run('idle', modelId);

    const trainingConfig = {
      epochs: 5,
      batch_size: 16,
      learning_rate: 0.0005
    };

    const response = await request(app)
      .post(`/api/models/${modelId}/train`)
      .send(trainingConfig)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Training started successfully');
    expect(response.body).toHaveProperty('sessionId');

    // Verify training session was created
    const sessions = db.prepare('SELECT * FROM training_sessions WHERE model_id = ?').all(modelId);
    expect(sessions.length).toBe(1);
    expect((sessions[0] as any).status).toBe('running');

    // Verify model status was updated
    const model = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
    expect(model.status).toBe('training');
    expect(model.current_epoch).toBe(0);

    // Verify training log was created
    const logs = db.prepare('SELECT * FROM training_logs WHERE model_id = ?').all(modelId);
    expect(logs.length).toBe(1);
    expect((logs[0] as any).message).toBe('Training started');
  });

  it('should pause training', async () => {
    const models = db.prepare('SELECT * FROM models').all() as any[];
    const modelId = models[0].id;

    const response = await request(app)
      .post(`/api/models/${modelId}/pause`)
      .expect(200);

    expect(response.body.message).toBe('Training paused successfully');

    // Verify model status was updated
    const model = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
    expect(model.status).toBe('paused');

    // Verify pause log was created (check for the specific message)
    const pauseLogs = db.prepare('SELECT * FROM training_logs WHERE model_id = ? AND message = ?').all(modelId, 'Training paused by user');
    expect(pauseLogs.length).toBeGreaterThan(0);
  });

  it('should resume training', async () => {
    const models = db.prepare('SELECT * FROM models').all() as any[];
    const modelId = models[0].id;

    const response = await request(app)
      .post(`/api/models/${modelId}/resume`)
      .expect(200);

    expect(response.body.message).toBe('Training resumed successfully');

    // Verify model status was updated
    const model = db.prepare('SELECT * FROM models WHERE id = ?').get(modelId) as any;
    expect(model.status).toBe('training');

    // Verify resume log was created (check for the specific message)
    const resumeLogs = db.prepare('SELECT * FROM training_logs WHERE model_id = ? AND message = ?').all(modelId, 'Training resumed by user');
    expect(resumeLogs.length).toBeGreaterThan(0);
  });

  it('should handle training already in progress', async () => {
    const models = db.prepare('SELECT * FROM models').all() as any[];
    const modelId = models[0].id;

    const response = await request(app)
      .post(`/api/models/${modelId}/train`)
      .send({ epochs: 3 })
      .expect(400);

    expect(response.body.error).toBe('Model is already training');
  });

  it('should handle resume on non-paused model', async () => {
    const models = db.prepare('SELECT * FROM models').all() as any[];
    const modelId = models[0].id;

    const response = await request(app)
      .post(`/api/models/${modelId}/resume`)
      .expect(400);

    expect(response.body.error).toBe('Model is not paused');
  });

  it('should validate required fields for model creation', async () => {
    const response = await request(app)
      .post('/api/models')
      .send({ name: 'Incomplete Model' })
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });
});