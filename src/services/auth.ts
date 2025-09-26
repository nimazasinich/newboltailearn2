import { API_BASE, joinApiPath, apiRequest } from '../lib/api-config';
import { User, LoginCredentials } from '../types/user';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/login'),
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: 'خطا در ورود به سیستم'
      };
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/register'),
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: 'خطا در ثبت‌نام'
      };
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/logout'),
        {
          method: 'POST',
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout failed:', error);
      return {
        success: true,
        message: 'خروج موفقیت‌آمیز'
      };
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          error: 'توکن یافت نشد'
        };
      }

      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/refresh'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: 'خطا در تازه‌سازی توکن'
      };
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/me'),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.user || data;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'توکن یافت نشد'
        };
      }

      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/profile'),
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update profile failed:', error);
      return {
        success: false,
        message: 'خطا در به‌روزرسانی پروفایل'
      };
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'توکن یافت نشد'
        };
      }

      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/change-password'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Change password failed:', error);
      return {
        success: false,
        message: 'خطا در تغییر رمز عبور'
      };
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/forgot-password'),
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Password reset request failed:', error);
      return {
        success: false,
        message: 'خطا در درخواست بازنشانی رمز عبور'
      };
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/reset-password'),
        {
          method: 'POST',
          body: JSON.stringify({
            token,
            newPassword
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        message: 'خطا در بازنشانی رمز عبور'
      };
    }
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest(
        joinApiPath(API_BASE, '/auth/verify-email'),
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Email verification failed:', error);
      return {
        success: false,
        message: 'خطا در تأیید ایمیل'
      };
    }
  }
};