import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/LandingPage';

// Lazy load components with proper error handling
const createLazyComponent = (importFn: () => Promise<any>, exportName?: string) =>
  lazy(async () => {
    try {
      const module = await importFn();
      return { default: module.default || module[exportName || 'default'] };
    } catch (error) {
      console.error('Failed to load component:', error);
      throw error;
    }
  });

const Overview = createLazyComponent(() => import('./components/Overview'));
const DashboardAdvanced = createLazyComponent(() => import('./components/Dashboard'), 'Dashboard');
const AnalyticsPage = createLazyComponent(() => import('./components/AnalyticsPage'));
const DataPage = createLazyComponent(() => import('./components/DataPage'));
const ModelsPage = createLazyComponent(() => import('./components/ModelsPage'));
const MonitoringPage = createLazyComponent(() => import('./components/MonitoringPage'));
const LogsPage = createLazyComponent(() => import('./components/LogsPage'));
const SettingsPage = createLazyComponent(() => import('./components/SettingsPage'));
const TeamPage = createLazyComponent(() => import('./components/TeamPage'));
const TrainingManagement = createLazyComponent(() => import('./components/TrainingManagement'));
const ProjectDownloader = createLazyComponent(() => import('./components/ProjectDownloader'));

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <style>{`
        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/dashboard-advanced" element={<DashboardAdvanced />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/training" element={<TrainingManagement />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/download" element={<ProjectDownloader />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/dashboard-advanced" replace />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </Suspense>
  );
}
