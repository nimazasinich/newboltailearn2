import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'viewer' | 'trainer' | 'admin';
  fallback?: React.ReactNode;
}

/**
 * Authentication Guard Component
 * Protects routes that require authentication
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUserRole(data.role);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const roleHierarchy: Record<string, number> = {
      'viewer': 1,
      'trainer': 2,
      'admin': 3
    };

    const userRoleLevel = roleHierarchy[userRole || ''] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                دسترسی محدود
              </h2>
              
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                شما دسترسی لازم برای مشاهده این صفحه را ندارید.
              </p>
              
              <p className="mt-1 text-xs text-gray-500">
                نقش مورد نیاز: {requiredRole} | نقش شما: {userRole}
              </p>
              
              <button
                onClick={() => window.history.back()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                بازگشت
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized
  return <>{children}</>;
};

/**
 * Hook to get authentication status
 */
export const useAuth = () => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null as any,
    token: null as string | null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setAuth({
        isAuthenticated: true,
        user: JSON.parse(user),
        token,
        loading: false
      });
    } else {
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      });
    }
  }, []);

  const login = (token: string, user: any) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({
      isAuthenticated: true,
      user,
      token,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    });
  };

  return { ...auth, login, logout };
};