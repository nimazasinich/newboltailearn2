import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from './LoginModal';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800" dir="rtl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <div className="text-white font-persian text-lg">
            در حال بررسی احراز هویت...
          </div>
        </div>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If user is not authenticated, show login modal or fallback
  React.useEffect(() => {
    if (!isAuthenticated && requireAuth) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, requireAuth]);

  return (
    <>
      {fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800" dir="rtl">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                دسترسی محدود
              </h2>
              <p className="text-slate-300 mb-6">
                برای دسترسی به این بخش، لطفاً وارد حساب کاربری خود شوید
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ورود به سیستم
              </button>
            </div>
          </div>
        </div>
      )}
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}