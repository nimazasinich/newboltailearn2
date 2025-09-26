import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types/user';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'خطا در بررسی وضعیت احراز هویت'
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Mock authentication - replace with real API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data;
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
        
        return true;
      } else {
        const errorData = await response.json();
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorData.message || 'خطا در ورود'
        }));
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'خطا در اتصال به سرور'
      }));
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
        return true;
      } else {
        const errorData = await response.json();
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorData.message || 'خطا در ثبت‌نام'
        }));
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'خطا در اتصال به سرور'
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    refreshToken,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}