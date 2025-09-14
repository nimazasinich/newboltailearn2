import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components with proper error handling
const createLazyComponent = (importFunc: () => Promise<any>, componentName: string) =>
  lazy(async () => {
    try {
      const module = await importFunc();
      return { default: module.default || module[componentName] };
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      throw error;
    }
  });

// Component imports matching existing backend routes
const Overview = createLazyComponent(() => import('./components/Overview'), 'Overview');
const DashboardAdvanced = createLazyComponent(() => import('./components/Dashboard'), 'Dashboard');
const AnalyticsPage = createLazyComponent(() => import('./components/AnalyticsPage'), 'AnalyticsPage');
const DataPage = createLazyComponent(() => import('./components/DataPage'), 'DataPage');
const ModelsPage = createLazyComponent(() => import('./components/ModelsPage'), 'ModelsPage');
const MonitoringPage = createLazyComponent(() => import('./components/MonitoringPage'), 'MonitoringPage');
const LogsPage = createLazyComponent(() => import('./components/LogsPage'), 'LogsPage');
const SettingsPage = createLazyComponent(() => import('./components/SettingsPage'), 'SettingsPage');
const TeamPage = createLazyComponent(() => import('./components/TeamPage'), 'TeamPage');
const TrainingManagement = createLazyComponent(() => import('./components/TrainingManagement'), 'TrainingManagement');

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/dashboard-advanced" element={<DashboardAdvanced />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/training" element={<TrainingManagement />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
