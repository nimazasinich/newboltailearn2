import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { LandingPage } from './LandingPage';

// Dashboard components
import { Overview } from './dashboard/Overview';
import { TrainingManagement } from './dashboard/TrainingManagement';

// Page components (همه در components directory موجود هستند)
import { AnalyticsPage } from './AnalyticsPage';
import { DataPage } from './DataPage';
import { ModelsPage } from './ModelsPage';
import { MonitoringPage } from './MonitoringPage';
import { LogsPage } from './LogsPage';
import { SettingsPage } from './SettingsPage';
import { TeamPage } from './TeamPage';
import { ProjectDownloader } from './ProjectDownloader';

export function AppRoutes() {
  return (
    <Routes>
      {/* صفحه اصلی (Landing) */}
      <Route path="/" element={<LandingPage />} />
      
      {/* صفحات اصلی برنامه */}
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="training" element={<TrainingManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="data" element={<DataPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="download" element={<ProjectDownloader />} />
      </Route>
    </Routes>
  );
}