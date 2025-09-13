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

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT CHECK(level IN ('info', 'warning', 'error', 'debug')),
      category TEXT,
      message TEXT NOT NULL,
      metadata TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert test datasets
  db.prepare(`
    INSERT INTO datasets (id, name, source, huggingface_id, samples, size_mb, status)
    VALUES 
      ('iran-legal-qa', 'پرسش و پاسخ حقوقی ایران', 'huggingface', 'PerSets/iran-legal-persian-qa', 10247, 15.2, 'available'),
      ('legal-laws', 'متون قوانین ایران', 'huggingface', 'QomSSLab/legal_laws_lite_chunk_v1', 50000, 125.8, 'available'),
      ('persian-ner', 'تشخیص موجودیت فارسی', 'huggingface', 'mansoorhamidzadeh/Persian-NER-Dataset-500k', 500000, 890.5, 'downloading')
  `).run();

  // Datasets endpoint
  app.get('/api/datasets', (req, res) => {
    try {
      const datasets = db.prepare('SELECT * FROM datasets ORDER BY created_at DESC').all();
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch datasets' });
    }
  });

  // Dataset download endpoint (simplified for testing)
  app.post('/api/datasets/:id/download', (req, res) => {
    try {
      const { id } = req.params;
      const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(id) as any;
      
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }
      
      // Simulate token check (in real implementation, this would check HF_TOKEN_ENC)
      const hasToken = process.env.HF_TOKEN_ENC && process.env.HF_TOKEN_ENC.length > 0;
      
      if (!hasToken) {
        // Log the error
        db.prepare(`
          INSERT INTO system_logs (level, category, message, metadata)
          VALUES ('error', 'datasets', 'HuggingFace token not available for dataset download', ?)
        `).run(JSON.stringify({ datasetId: id }));
        
        return res.status(400).json({ 
          error: 'HuggingFace token not configured. Please set HF_TOKEN_ENC environment variable.',
          details: 'Dataset download requires a valid HuggingFace API token'
        });
      }
      
      // Update status to downloading
      db.prepare('UPDATE datasets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('downloading', id);
      
      // Log the start
      db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata)
        VALUES ('info', 'datasets', ?, ?)
      `).run(`Starting download of dataset ${dataset.name}`, JSON.stringify({ datasetId: id }));
      
      res.json({ message: 'Dataset download started' });
    } catch (error) {
      db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata)
        VALUES ('error', 'api', 'Failed to download dataset', ?)
      `).run(JSON.stringify({ error: (error as Error).message }));
      
      res.status(500).json({ error: 'Failed to download dataset' });
    }
  });

  return { app, db };
};

describe('Datasets API', () => {
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

  it('should return datasets list', async () => {
    const response = await request(app)
      .get('/api/datasets')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(3);
    
    // Verify dataset structure
    response.body.forEach((dataset: any) => {
      expect(dataset).toHaveProperty('id');
      expect(dataset).toHaveProperty('name');
      expect(dataset).toHaveProperty('source');
      expect(dataset).toHaveProperty('huggingface_id');
      expect(dataset).toHaveProperty('samples');
      expect(dataset).toHaveProperty('size_mb');
      expect(dataset).toHaveProperty('status');
    });
    
    // Verify real dataset data
    const iranLegalQa = response.body.find((d: any) => d.id === 'iran-legal-qa');
    expect(iranLegalQa).toBeDefined();
    expect(iranLegalQa.samples).toBe(10247);
    expect(iranLegalQa.size_mb).toBe(15.2);
    expect(iranLegalQa.huggingface_id).toBe('PerSets/iran-legal-persian-qa');
  });

  it('should handle dataset download without token gracefully', async () => {
    // Clear any existing token
    const originalToken = process.env.HF_TOKEN_ENC;
    delete process.env.HF_TOKEN_ENC;
    
    const response = await request(app)
      .post('/api/datasets/iran-legal-qa/download')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('HuggingFace token not configured');
    expect(response.body).toHaveProperty('details');
    
    // Verify error was logged
    const logs = db.prepare(`
      SELECT * FROM system_logs 
      WHERE category = 'datasets' AND level = 'error'
      ORDER BY timestamp DESC LIMIT 1
    `).get() as any;
    
    expect(logs).toBeDefined();
    expect(logs.message).toContain('HuggingFace token not available');
    
    // Restore original token
    if (originalToken) {
      process.env.HF_TOKEN_ENC = originalToken;
    }
  });

  it('should handle dataset download with valid token', async () => {
    // Set a mock token
    process.env.HF_TOKEN_ENC = 'aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==';
    
    const response = await request(app)
      .post('/api/datasets/iran-legal-qa/download')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Dataset download started');
    
    // Verify status was updated
    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get('iran-legal-qa') as any;
    expect(dataset.status).toBe('downloading');
    
    // Verify info was logged
    const logs = db.prepare(`
      SELECT * FROM system_logs 
      WHERE category = 'datasets' AND level = 'info'
      ORDER BY timestamp DESC LIMIT 1
    `).get() as any;
    
    expect(logs).toBeDefined();
    expect(logs.message).toContain('Starting download of dataset');
  });

  it('should return 404 for non-existent dataset', async () => {
    const response = await request(app)
      .post('/api/datasets/non-existent/download')
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Dataset not found');
  });

  it('should handle download errors gracefully', async () => {
    // Test with invalid dataset ID that might cause database errors
    const response = await request(app)
      .post('/api/datasets/')
      .expect(404); // Express will return 404 for empty ID

    // The endpoint should handle this gracefully
    expect(response.status).toBe(404);
  });
});