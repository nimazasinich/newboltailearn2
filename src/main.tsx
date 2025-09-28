import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

// Initialize TensorFlow.js with WebGL backend
import './services/ai/tf-init';

// Import all CSS files in the correct order
import './styles/fonts.css';
import './index.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/theme.css';

const basename = (import.meta as any).env.BASE_URL || '/newboltailearn2/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter 
      basename={basename}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);