import './services/reliability-integration';
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { EnhancedAppLayout } from './components/layout/EnhancedAppLayout'
import { EnhancedLandingPage } from './components/EnhancedLandingPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { APIErrorBoundary } from './components/APIErrorBoundary'
import { ToastProvider } from './components/ui/Toast'
import { SystemProvider } from './context/SystemContext'
import { NotificationProvider } from './components/NotificationSystem'
import { AuthProvider } from './contexts/AuthContext'
import { fontLoader } from './services/FontLoader'
import { initializeStaticMode, IS_GITHUB_PAGES } from './lib/static-mode'
import { StaticModeWrapper, StaticModeErrorBoundary } from './components/StaticModeWrapper'

const lazyCompat = <T extends Record<string, any>>(imp: () => Promise<T>, key: string) =>
  lazy(async () => { const m = await imp(); return { default: m.default ?? m[key] } })

const Overview           = lazyCompat(() => import('./components/Overview'), 'Overview')
const DashboardAdvanced  = lazyCompat(() => import('./components/EnhancedDashboard'), 'default')
const UltimateDashboard  = lazyCompat(() => import('./components/UltimatePersianDashboard'), 'default')
const AnalyticsPage      = lazyCompat(() => import('./components/AnalyticsPage'), 'AnalyticsPage')
const DataPage           = lazyCompat(() => import('./components/DataPage'), 'DataPage')
const ModelsPage         = lazyCompat(() => import('./components/ModelsPage'), 'ModelsPage')
const MonitoringPage     = lazyCompat(() => import('./components/MonitoringPage'), 'MonitoringPage')
const LogsPage           = lazyCompat(() => import('./components/LogsPage'), 'LogsPage')
const SettingsPage       = lazyCompat(() => import('./components/SettingsPage'), 'SettingsPage')
const TeamPage           = lazyCompat(() => import('./components/TeamPage'), 'TeamPage')
const TrainingManagement = lazyCompat(() => import('./components/TrainingManagement'), 'TrainingManagement')
const ProjectDownloader  = lazyCompat(() => import('./components/ProjectDownloader'), 'ProjectDownloader')
const DatasetGallery     = lazyCompat(() => import('./components/DatasetGallery'), 'DatasetGallery')

import { LoadingScreen } from './components/ui/LoadingScreen';

function AppLoading() {
  return <LoadingScreen />
}

export default function App() {
  // EMERGENCY FIX: Initialize static mode for GitHub Pages
  React.useEffect(() => {
    if (IS_GITHUB_PAGES) {
      console.log('🚨 EMERGENCY: Initializing static mode for GitHub Pages');
      initializeStaticMode();
    }
  }, []);

  // Initialize font loading
  React.useEffect(() => {
    fontLoader.preloadCriticalFonts().catch((error) => {
      console.warn('Font preloading failed:', error);
    });
  }, []);

  return (
    <StaticModeWrapper>
      <StaticModeErrorBoundary>
        <ErrorBoundary>
          <APIErrorBoundary>
            <AuthProvider>
              <SystemProvider>
                <NotificationProvider>
                  <ToastProvider>
                    <Suspense fallback={<AppLoading />}>
                      <Routes>
                      <Route path="/" element={<EnhancedLandingPage />} />
                      <Route element={<EnhancedAppLayout />}>
                        <Route path="/overview" element={<Overview />} />
                        <Route path="/dashboard" element={<DashboardAdvanced />} />
                        <Route path="/dashboard-advanced" element={<DashboardAdvanced />} />
                        <Route path="/dashboard-ultimate" element={<UltimateDashboard />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/data" element={<DataPage />} />
                        <Route path="/data-gallery" element={<DatasetGallery />} />
                        <Route path="/logs" element={<LogsPage />} />
                        <Route path="/models" element={<ModelsPage />} />
                        <Route path="/models/:category" element={<ModelsPage />} />
                        <Route path="/monitoring" element={<MonitoringPage />} />
                        <Route path="/training" element={<TrainingManagement />} />
                        <Route path="/team" element={<TeamPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/download" element={<ProjectDownloader />} />
                        <Route path="/legal-docs" element={<DataPage />} />
                        <Route path="/export" element={<ProjectDownloader />} />
                        <Route path="/import" element={<DataPage />} />
                      </Route>
                      <Route path="*" element={<Navigate to="/overview" replace />} />
                      </Routes>
                    </Suspense>
                  </ToastProvider>
                </NotificationProvider>
              </SystemProvider>
            </AuthProvider>
          </APIErrorBoundary>
        </ErrorBoundary>
      </StaticModeErrorBoundary>
    </StaticModeWrapper>
  )
}