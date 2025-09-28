import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './theme/ThemeProvider';
import './styles/tokens.css';
import './styles/theme.css';
import './styles/effects.css';
import './styles/fonts.css';
import './index.css';

// EMERGENCY FIX: Add future flags to eliminate React Router deprecation warnings
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <HashRouter future={routerConfig.future}>
      <App />
    </HashRouter>
  </ThemeProvider>
);