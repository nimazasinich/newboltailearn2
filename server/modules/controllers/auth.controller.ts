import { Request, Response } from 'express';
import { AuthService } from '../../services/authService.js';
import { generateToken } from '../../middleware/auth.js';
import Database from 'better-sqlite3';

export class AuthController {
  private authService: AuthService;

  constructor(db: Database.Database) {
    this.authService = new AuthService(db);
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      const user = await this.authService.validateUser(username, password);
      
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, role } = req.body;
      
      const existingUser = await this.authService.findUserByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }

      const existingEmail = await this.authService.findUserByEmail(email);
      if (existingEmail) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const user = await this.authService.createUser({
        username,
        email,
        password,
        role: role || 'viewer'
      });

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Implementation for token refresh
      res.status(501).json({ error: 'Not implemented yet' });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In JWT-based auth, logout is typically handled client-side
      // But we can blacklist the token if needed
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await this.authService.findUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get current user' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await this.authService.findUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { email } = req.body;
      
      if (email) {
        const existingEmail = await this.authService.findUserByEmail(email);
        if (existingEmail && existingEmail.id !== userId) {
          res.status(409).json({ error: 'Email already in use' });
          return;
        }
      }

      await this.authService.updateUser(userId, { email });
      
      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      
      const user = await this.authService.findUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isValid = await this.authService.validatePassword(user.username, currentPassword);
      if (!isValid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      await this.authService.updatePassword(userId, newPassword);
      
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}