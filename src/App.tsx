import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AppRoutes } from './components/router';
import { initializeDatabase } from './services/database';

// Router factory to support both BrowserRouter and HashRouter
function createRouter(useHash: boolean = false) {
  const RouterComponent = useHash ? HashRouter : BrowserRouter;
  
  return function AppRouter() {
    return (
      <RouterComponent>
        <AppRoutes />
      </RouterComponent>
    );
  };
}

function App() {
  // Initialize database on app start
  React.useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  // Use HashRouter if VITE_USE_HASH is set to 'true'
  const useHashRouter = import.meta.env.VITE_USE_HASH === 'true';
  const Router = createRouter(useHashRouter);

  return <Router />;
}

export default App;
