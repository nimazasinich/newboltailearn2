import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Overview } from './dashboard/Overview';
import { TrainingManagement } from './dashboard/TrainingManagement';
import { AnalyticsPage } from './AnalyticsPage';
import { DataPage } from './DataPage';
import { ModelsPage } from './ModelsPage';
import { MonitoringPage } from './MonitoringPage';
import { LogsPage } from './LogsPage';
import { TeamPage } from './TeamPage';
import { LoginPage } from '../pages/LoginPage';
import { AuthGuard } from './AuthGuard';

export function AppRoutes() {
  return (
    <Routes>
      {/* Login page - no authentication required */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Protected routes - require authentication */}
      <Route path="/app" element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Overview />} />
        <Route path="training" element={
          <AuthGuard requiredRole="trainer">
            <TrainingManagement />
          </AuthGuard>
        } />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="analytics" element={
          <AuthGuard requiredRole="viewer">
            <AnalyticsPage />
          </AuthGuard>
        } />
        <Route path="models" element={<ModelsPage />} />
        <Route path="data" element={<DataPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="team" element={
          <AuthGuard requiredRole="admin">
            <TeamPage />
          </AuthGuard>
        } />
      </Route>
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}