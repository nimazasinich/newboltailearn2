import React from 'react';
import { normalizeApiError } from '../../services/ApiErrorHandler';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="card elev-2" style={{ padding: '24px', textAlign: 'center', margin: '16px' }}>
      <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>خطا در بارگذاری</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
        {normalizeApiError(error)}
      </p>
      <button className="btn btn-primary" onClick={retry}>
        تلاش مجدد
      </button>
    </div>
  );
}