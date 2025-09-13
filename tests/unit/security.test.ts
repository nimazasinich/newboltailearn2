import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateQuery, sanitizeOutput, schemas } from '../../server/modules/security/validators';
import { csrfProtection, generateCSRFToken } from '../../server/modules/security/csrf';

describe('Security Validators', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      session: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    mockNext = vi.fn();
  });

  describe('validate middleware', () => {
    it('should pass valid data', async () => {
      const middleware = validate(schemas.login);
      mockReq.body = {
        username: 'validuser',
        password: 'ValidPass123!'
      };

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject invalid data', async () => {
      const middleware = validate(schemas.login);
      mockReq.body = {
        username: 'a', // Too short
        password: '123' // Too short
      };

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
    });

    it('should validate registration data', async () => {
      const middleware = validate(schemas.register);
      mockReq.body = {
        username: 'newuser',
        email: 'valid@example.com',
        password: 'SecurePass123!',
        role: 'viewer'
      };

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject weak passwords', async () => {
      const middleware = validate(schemas.register);
      mockReq.body = {
        username: 'newuser',
        email: 'valid@example.com',
        password: 'weakpass', // No uppercase, number, or special char
        role: 'viewer'
      };

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateQuery middleware', () => {
    it('should validate pagination parameters', async () => {
      const middleware = validateQuery(schemas.pagination);
      mockReq.query = {
        page: '2',
        limit: '20',
        sort: 'created_at',
        order: 'desc'
      };

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.query.page).toBe(2);
      expect(mockReq.query.limit).toBe(20);
    });

    it('should reject invalid query parameters', async () => {
      const middleware = validateQuery(schemas.pagination);
      mockReq.query = {
        page: 'invalid',
        limit: 'not-a-number'
      };

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('sanitizeOutput', () => {
    it('should sanitize HTML in strings', () => {
      const input = '<script>alert("xss")</script>Hello';
      const output = sanitizeOutput(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('Hello');
    });

    it('should sanitize nested objects', () => {
      const input = {
        name: 'Test',
        description: '<img src=x onerror=alert(1)>',
        nested: {
          value: '<script>evil</script>'
        }
      };

      const output = sanitizeOutput(input);
      expect(output.description).not.toContain('onerror');
      expect(output.nested.value).not.toContain('<script>');
    });

    it('should sanitize arrays', () => {
      const input = [
        '<script>alert(1)</script>',
        'safe string',
        { value: '<img src=x>' }
      ];

      const output = sanitizeOutput(input);
      expect(output[0]).not.toContain('<script>');
      expect(output[1]).toBe('safe string');
      expect(output[2].value).not.toContain('src=x');
    });
  });
});

describe('CSRF Protection', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      body: {},
      query: {},
      headers: {},
      session: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      cookie: vi.fn()
    };

    mockNext = vi.fn();
  });

  describe('csrfProtection middleware', () => {
    it('should skip CSRF for GET requests', () => {
      mockReq.method = 'GET';
      
      csrfProtection(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject POST without CSRF token', () => {
      mockReq.method = 'POST';
      
      csrfProtection(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'CSRF token missing'
        })
      );
    });

    it('should accept valid CSRF token in body', () => {
      mockReq.method = 'POST';
      
      // Generate token first
      const token = generateCSRFToken(mockReq as Request);
      mockReq.body._csrf = token;
      
      csrfProtection(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should accept CSRF token in header', () => {
      mockReq.method = 'POST';
      
      // Generate token first
      const token = generateCSRFToken(mockReq as Request);
      mockReq.headers['x-csrf-token'] = token;
      
      csrfProtection(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid CSRF token', () => {
      mockReq.method = 'POST';
      mockReq.session = { csrfSecret: 'secret' };
      mockReq.body._csrf = 'invalid-token';
      
      csrfProtection(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid CSRF token'
        })
      );
    });
  });
});