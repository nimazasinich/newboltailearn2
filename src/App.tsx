import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { initializeDatabase } from './services/database';

function App() {
  // Initialize database on app start
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
