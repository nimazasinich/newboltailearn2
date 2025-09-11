import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../components/LandingPage';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { NotFoundPage } from '../pages/NotFoundPage';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TrainingPage = lazy(() => import('../pages/TrainingPage').then(m => ({ default: m.TrainingPage })));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const DownloadPage = lazy(() => import('../pages/DownloadPage').then(m => ({ default: m.DownloadPage })));

const routes = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'training',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <TrainingPage />
          </Suspense>
        ),
      },
      {
        path: 'documents',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <DocumentsPage />
          </Suspense>
        ),
      },
      {
        path: 'download',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <DownloadPage />
          </Suspense>
        ),
      },
    ],
  },
  // Redirect old hash routes to new structure
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/training',
    element: <Navigate to="/app/training" replace />,
  },
  {
    path: '/documents',
    element: <Navigate to="/app/documents" replace />,
  },
  {
    path: '/download',
    element: <Navigate to="/app/download" replace />,
  },
  // 404 page
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Try BrowserRouter first, fallback to HashRouter for static hosting
export const router = (() => {
  try {
    return createBrowserRouter(routes);
  } catch {
    // Fallback to hash router for static hosting environments
    return createHashRouter(routes);
  }
})();