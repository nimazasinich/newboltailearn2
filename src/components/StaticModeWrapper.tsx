/**
 * EMERGENCY STATIC MODE WRAPPER
 * Provides static mode context and error suppression for GitHub Pages
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { IS_GITHUB_PAGES, STATIC_MODE_CONFIG, MockAPI } from '../lib/static-mode';

interface StaticModeContextType {
  isStaticMode: boolean;
  mockAPI: MockAPI;
  config: typeof STATIC_MODE_CONFIG;
}

const StaticModeContext = createContext<StaticModeContextType | undefined>(undefined);

interface StaticModeWrapperProps {
  children: ReactNode;
}

export function StaticModeWrapper({ children }: StaticModeWrapperProps) {
  const isStaticMode = IS_GITHUB_PAGES;
  const mockAPI = MockAPI.getInstance();

  const value: StaticModeContextType = {
    isStaticMode,
    mockAPI,
    config: STATIC_MODE_CONFIG
  };

  // Suppress console errors in static mode
  React.useEffect(() => {
    if (isStaticMode) {
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('api/health') || 
            message.includes('WebSocket') || 
            message.includes('localhost:8080') ||
            message.includes('fetch')) {
          // Suppress these specific errors in static mode
          console.warn('🔧 Suppressed error in static mode:', message);
          return;
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, [isStaticMode]);

  return (
    <StaticModeContext.Provider value={value}>
      {children}
    </StaticModeContext.Provider>
  );
}

export function useStaticMode(): StaticModeContextType {
  const context = useContext(StaticModeContext);
  if (!context) {
    throw new Error('useStaticMode must be used within a StaticModeWrapper');
  }
  return context;
}

// Error boundary specifically for static mode
export class StaticModeErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (IS_GITHUB_PAGES) {
      console.warn('🔧 Static mode error caught and suppressed:', error.message);
      // In static mode, we suppress most errors
      this.setState({ hasError: false });
    } else {
      console.error('Component Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && !IS_GITHUB_PAGES) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              خطا در بارگذاری کامپوننت
            </h2>
            <p className="text-gray-600 mb-4">
              مشکلی در بارگذاری این بخش رخ داده است.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}