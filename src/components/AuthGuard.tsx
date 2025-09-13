import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../state/store';
import { Loading } from './Loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

/**
 * AuthGuard component that protects routes requiring authentication
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, user, isLoading, token } = useAuthStore();
  const location = useLocation();

  // Check if user has required role
  const hasRequiredRole = !requiredRole || (user && checkRole(user.role, requiredRole));

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Redirect if user doesn't have required role
  if (!hasRequiredRole) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Check if user role meets required role level
 */
function checkRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    'viewer': 1,
    'trainer': 2,
    'admin': 3
  };

  const userRoleLevel = roleHierarchy[userRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Hook to check authentication status
 */
export function useAuth() {
  const { isAuthenticated, user, token, isLoading, error } = useAuthStore();

  const hasRole = (role: string) => {
    if (!user) return false;
    return checkRole(user.role, role);
  };

  const isAdmin = () => hasRole('admin');
  const isTrainer = () => hasRole('trainer');
  const isViewer = () => hasRole('viewer');

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    hasRole,
    isAdmin,
    isTrainer,
    isViewer
  };
}