import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Loading } from './components/Loading';
import { AppRoutes } from './components/router';
import { ErrorBoundary } from './components/ErrorBoundary';

function MainApp() {
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  if (showLoading) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </Router>
  );
}
