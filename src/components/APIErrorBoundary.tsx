/**
 * API Error Boundary Component
 * Implements the mandatory component error boundaries
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { apiErrorHandler } from '../services/ApiErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class APIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error Boundary Caught Error:', errorDetails);
    
    // In production, you might want to send this to an error reporting service
    // this.sendToErrorReportingService(errorDetails);
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              ⚠️ Service temporarily unavailable
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              We're experiencing some technical difficulties. Please try again in a moment.
            </p>

            {this.state.error && (
              <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Error Details
                </summary>
                <div className="mt-2 text-gray-600">
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-xs overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withAPIErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <APIErrorBoundary fallback={fallback}>
        <Component {...props} />
      </APIErrorBoundary>
    );
  };
}

// Hook for handling API errors in functional components
export function useAPIErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
    
    // You can add additional error handling logic here
    // For example, showing a toast notification, logging to a service, etc.
  }, []);

  return { handleError };
}

export default APIErrorBoundary;