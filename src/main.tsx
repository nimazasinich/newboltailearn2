import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';

const basename = (import.meta as any).env.BASE_URL || '/newboltailearn/';

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