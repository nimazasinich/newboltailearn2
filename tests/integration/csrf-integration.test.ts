import request from 'supertest';
import { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { setupModules } from '../../server/modules/setup.js';
import jwt from 'jsonwebtoken';

// Mock database for testing
const mockDb = new Database(':memory:');

// Create test app
const app: Application = require('express')();
const server = createServer(app);
const io = new Server(server);

// Setup modules
setupModules(app, mockDb, io);

describe('CSRF Integration Tests', () => {
  let csrfToken: string;
  let authToken: string;

  beforeAll(() => {
    // Create test tables
    mockDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        accuracy REAL DEFAULT 0.0,
        loss REAL DEFAULT 0.0,
        epochs INTEGER DEFAULT 0,
        current_epoch INTEGER DEFAULT 0,
        dataset_id TEXT,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      );
    `);

    // Create test user
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('testpassword', 10);
    mockDb.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('testuser', 'test@example.com', hashedPassword, 'admin');

    // Generate test JWT token
    authToken = jwt.sign(
      { userId: 1, username: 'testuser', role: 'admin' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(() => {
    mockDb.close();
    server.close();
  });

  describe('CSRF Token Management', () => {
    test('should provide CSRF token endpoint', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);
      
      expect(response.body).toHaveProperty('csrfToken');
      expect(typeof response.body.csrfToken).toBe('string');
      expect(response.body.csrfToken.length).toBeGreaterThan(0);
      
      csrfToken = response.body.csrfToken;
    });

    test('should require CSRF token for POST requests', async () => {
      const response = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Model', type: 'test' })
        .expect(403);
      
      expect(response.body.error).toBe('CSRF token missing');
    });

    test('should accept valid CSRF token for POST requests', async () => {
      const response = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send({ name: 'Test Model', type: 'test' })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Model');
    });

    test('should reject invalid CSRF token', async () => {
      const response = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', 'invalid-token')
        .send({ name: 'Test Model 2', type: 'test' })
        .expect(403);
      
      expect(response.body.error).toBe('Invalid CSRF token');
    });

    test('should allow GET requests without CSRF token', async () => {
      const response = await request(app)
        .get('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('models');
      expect(Array.isArray(response.body.models)).toBe(true);
    });

    test('should allow PUT requests with valid CSRF token', async () => {
      // First create a model
      const createResponse = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send({ name: 'Test Model for Update', type: 'test' })
        .expect(201);
      
      const modelId = createResponse.body.id;
      
      // Then update it
      const updateResponse = await request(app)
        .put(`/api/models/${modelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send({ name: 'Updated Model', type: 'updated' })
        .expect(200);
      
      expect(updateResponse.body.name).toBe('Updated Model');
    });

    test('should allow DELETE requests with valid CSRF token', async () => {
      // First create a model
      const createResponse = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .send({ name: 'Test Model for Delete', type: 'test' })
        .expect(201);
      
      const modelId = createResponse.body.id;
      
      // Then delete it
      await request(app)
        .delete(`/api/models/${modelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-csrf-token', csrfToken)
        .expect(204);
    });
  });

  describe('CSRF Token Refresh', () => {
    test('should provide new CSRF token on each request', async () => {
      const response1 = await request(app)
        .get('/api/csrf-token')
        .expect(200);
      
      const response2 = await request(app)
        .get('/api/csrf-token')
        .expect(200);
      
      // Tokens should be different (unless they're very fast)
      expect(response1.body.csrfToken).not.toBe(response2.body.csrfToken);
    });
  });

  describe('CSRF Excluded Paths', () => {
    test('should allow dev identify endpoint without CSRF token', async () => {
      const response = await request(app)
        .post('/api/dev/identify')
        .send({ username: 'testuser', password: 'testpassword' })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
    });
  });
});