import React, { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, createHashRouter } from 'react-router-dom';
import { routes } from './router';
import { initializeDatabase } from './services/database';

// Router factory function
export const createRouter = () => {
  const useHashRouter = import.meta.env.VITE_USE_HASH === 'true';
  
  if (useHashRouter) {
    return createHashRouter(routes);
  } else {
    return createBrowserRouter(routes);
  }
};

function App() {
  // Initialize database on app start
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  const router = createRouter();

  return <RouterProvider router={router} />;
}

export default App;
