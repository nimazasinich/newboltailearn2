import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials, RegisterData, UserRole } from '../types/user';
import { db } from '../services/database';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedUserId) {
          const user = await db.users.get(savedUserId);
          if (user && user.isActive) {
            setAuthState({
              user,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return;
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Find user by email
      const user = await db.users.where('email').equals(credentials.email).first();
      
      if (!user) {
        throw new Error('کاربر یافت نشد');
      }

      if (!user.isActive) {
        throw new Error('حساب کاربری غیرفعال است');
      }

      // In a real app, you would verify the password hash
      // For demo purposes, we'll accept any password for existing users
      
      // Update last login
      await db.users.update(user.id, { lastLoginAt: new Date() });
      
      // Update statistics
      await db.users.update(user.id, {
        'statistics.lastActivityDate': new Date()
      });

      localStorage.setItem('currentUserId', user.id);
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      await db.log('info', 'auth', `User logged in: ${user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در ورود';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      await db.log('warn', 'auth', `Login failed: ${credentials.email}`);
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if user already exists
      const existingUser = await db.users.where('email').equals(userData.email).first();
      if (existingUser) {
        throw new Error('کاربری با این ایمیل قبلاً ثبت نام کرده است');
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'viewer',
        permissions: getDefaultPermissions(userData.role || 'viewer'),
        preferences: {
          language: 'fa',
          theme: 'dark',
          notifications: {
            trainingComplete: true,
            systemAlerts: true,
            weeklyReports: false
          },
          dashboard: {
            defaultView: 'overview',
            chartsPerPage: 6,
            autoRefresh: true,
            refreshInterval: 30
          }
        },
        statistics: {
          totalTrainingSessions: 0,
          completedSessions: 0,
          totalDocumentsProcessed: 0,
          averageSessionDuration: 0,
          bestModelAccuracy: 0,
          totalTrainingTime: 0,
          lastActivityDate: new Date()
        },
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      };

      await db.users.add(newUser);
      localStorage.setItem('currentUserId', newUser.id);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      await db.log('info', 'auth', `New user registered: ${newUser.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در ثبت نام';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      await db.log('warn', 'auth', `Registration failed: ${userData.email}`);
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (authState.user) {
        await db.log('info', 'auth', `User logged out: ${authState.user.email}`);
      }
    } catch (error) {
      console.error('Logout logging error:', error);
    }

    localStorage.removeItem('currentUserId');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  }, [authState.user]);

  const updateUser = useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) {
      throw new Error('کاربر وارد نشده است');
    }

    try {
      await db.users.update(authState.user.id, updates);
      const updatedUser = await db.users.get(authState.user.id);
      
      if (updatedUser) {
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));
      }

      await db.log('info', 'auth', `User updated: ${authState.user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در به‌روزرسانی کاربر';
      await db.log('error', 'auth', `User update failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }, [authState.user]);

  const updateUserStatistics = useCallback(async (statisticsUpdate: Partial<User['statistics']>): Promise<void> => {
    if (!authState.user) return;

    try {
      const currentStats = authState.user.statistics;
      const newStats = { ...currentStats, ...statisticsUpdate };
      await updateUser({ statistics: newStats });
    } catch (error) {
      console.error('Statistics update error:', error);
    }
  }, [authState.user, updateUser]);

  const hasPermission = useCallback((permission: string): boolean => {
    return authState.user?.permissions.includes(permission as any) || false;
  }, [authState.user]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return authState.user?.role === role || false;
  }, [authState.user]);

  const clearError = useCallback((): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    updateUserStatistics,
    hasPermission,
    hasRole,
    clearError
  };
}

function getDefaultPermissions(role: UserRole) {
  switch (role) {
    case 'admin':
      return ['train_models', 'manage_documents', 'view_analytics', 'manage_users', 'system_config', 'export_data', 'delete_sessions', 'access_api'];
    case 'trainer':
      return ['train_models', 'manage_documents', 'view_analytics', 'export_data'];
    case 'analyst':
      return ['view_analytics', 'manage_documents', 'export_data'];
    case 'viewer':
      return ['view_analytics'];
    default:
      return ['view_analytics'];
  }
}