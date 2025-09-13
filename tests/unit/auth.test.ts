import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { AuthController } from '../../server/modules/controllers/auth.controller';
import { AuthService } from '../../server/services/authService';
import bcrypt from 'bcryptjs';
import { testDb } from '../setup';

describe('AuthController', () => {
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Use the test database from setup
    authController = new AuthController(testDb);

    // Setup mock request and response
    mockReq = {
      body: {},
      user: undefined,
      headers: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      // Use the admin user created in setup
      mockReq.body = {
        username: 'admin',
        password: 'admin'
      };

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            username: 'admin',
            email: 'admin@test.com',
            role: 'admin'
          })
        })
      );
    });

    it('should reject invalid credentials', async () => {
      mockReq.body = {
        username: 'nonexistent',
        password: 'wrongpass'
      };

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle login errors gracefully', async () => {
      // Test with invalid credentials to trigger error handling
      mockReq.body = {
        username: 'invaliduser',
        password: 'invalidpass'
      };

      await authController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      mockReq.body = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'NewPass123!',
        role: 'viewer'
      };

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({
            username: 'newuser',
            email: 'new@example.com',
            role: 'viewer'
          })
        })
      );

      // Verify user was created in database
      const user = testDb.prepare('SELECT * FROM users WHERE username = ?').get('newuser');
      expect(user).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      // Try to register with existing admin username
      mockReq.body = {
        username: 'admin',
        email: 'different@example.com',
        password: 'NewPass123!'
      };

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    it('should reject duplicate email', async () => {
      // Try to register with existing admin email
      mockReq.body = {
        username: 'differentuser',
        email: 'admin@test.com',
        password: 'NewPass123!'
      };

      await authController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email already registered' });
    });
  });

  describe('getProfile', () => {
    it('should get user profile when authenticated', async () => {
      // Use the admin user from setup
      const adminUser = testDb.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;

      mockReq.user = {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      };

      await authController.getProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'admin',
          email: 'admin@test.com',
          role: 'admin'
        })
      );
    });

    it('should reject unauthenticated requests', async () => {
      mockReq.user = undefined;

      await authController.getProfile(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });
  });

  describe('changePassword', () => {
    it('should change password with correct current password', async () => {
      // Use the admin user from setup
      const adminUser = testDb.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;

      mockReq.user = {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      };

      mockReq.body = {
        currentPassword: 'admin',
        newPassword: 'NewSecurePass123!'
      };

      await authController.changePassword(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully'
      });

      // Verify password was changed
      const user = testDb.prepare('SELECT password_hash FROM users WHERE id = ?')
        .get(adminUser.id) as { password_hash: string };
      
      const isNewPasswordValid = await bcrypt.compare('NewSecurePass123!', user.password_hash);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      // Use the admin user from setup
      const adminUser = testDb.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;

      mockReq.user = {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      };

      mockReq.body = {
        currentPassword: 'wrongpass',
        newPassword: 'NewPass123!'
      };

      await authController.changePassword(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });
  });
});