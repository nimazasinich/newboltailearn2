import request from 'supertest';
import { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { setupModules } from '../../server/modules/setup.js';

// Mock database for testing
const mockDb = new Database(':memory:');

// Create test app
const app: Application = require('express')();
const server = createServer(app);
const io = new Server(server);

// Setup modules
setupModules(app, mockDb, io);

describe('Security Integration Tests - Simple', () => {
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
    `);
  });

  afterAll(() => {
    mockDb.close();
    server.close();
  });

  describe('JWT Authentication', () => {
    test('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/models')
        .expect(401);
      
      expect(response.body.error).toBe('Authorization header is required');
    });

    test('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/models')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('CSRF Protection', () => {
    test('should provide CSRF token endpoint', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);
      
      expect(response.body).toHaveProperty('csrfToken');
      expect(typeof response.body.csrfToken).toBe('string');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);
      
      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('CORS Configuration', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/csrf-token')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting when exceeded', async () => {
      // Make many requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(request(app).get('/api/models'));
      }
      
      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});