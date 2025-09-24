import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { PageSkeleton } from './PageSkeleton';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

interface LoadableSectionProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  skeletonLines?: number;
  className?: string;
  emptyMessage?: string;
  showEmpty?: boolean;
}

export function LoadableSection({
  loading,
  error,
  onRetry,
  children,
  skeletonLines = 6,
  className = '',
  emptyMessage = 'داده‌ای برای نمایش وجود ندارد',
  showEmpty = false
}: LoadableSectionProps) {
  if (loading) {
    return (
      <div className={className}>
        <PageSkeleton lines={skeletonLines} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                تلاش مجدد
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showEmpty) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <div className={className}>{children}</div>;
}

// Specialized loading components
export function LoadingSpinner({ size = 'default', className = '' }: { size?: 'sm' | 'default' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
    </div>
  );
}

export function ErrorMessage({ 
  message, 
  onRetry, 
  className = '' 
}: { 
  message: string; 
  onRetry?: () => void; 
  className?: string; 
}) {
  return (
    <div className={`text-center ${className}`}>
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-600 mb-3">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          تلاش مجدد
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ 
  message, 
  icon: Icon, 
  action, 
  className = '' 
}: { 
  message: string; 
  icon?: React.ComponentType<{ className?: string }>; 
  action?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`text-center py-8 ${className}`}>
      {Icon && <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      <p className="text-gray-500 mb-4">{message}</p>
      {action}
    </div>
  );
}
