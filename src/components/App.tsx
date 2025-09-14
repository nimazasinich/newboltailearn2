import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import { AppLayout } from './layout/AppLayout'
import { LandingPage } from './LandingPage'

const lazyCompat = <T extends Record<string, any>>(imp: () => Promise<T>, key: string) =>
  lazy(async () => {
    const m = await imp()
    return { default: m.default ?? m[key] }
  })

const Overview           = lazyCompat(() => import('./Overview'), 'Overview')
const DashboardAdvanced  = lazyCompat(() => import('./Dashboard'), 'Dashboard')
const AnalyticsPage      = lazyCompat(() => import('./AnalyticsPage'), 'AnalyticsPage')
const DataPage           = lazyCompat(() => import('./DataPage'), 'DataPage')
const ModelsPage         = lazyCompat(() => import('./ModelsPage'), 'ModelsPage')
const MonitoringPage     = lazyCompat(() => import('./MonitoringPage'), 'MonitoringPage')
const LogsPage           = lazyCompat(() => import('./LogsPage'), 'LogsPage')
const SettingsPage       = lazyCompat(() => import('./SettingsPage'), 'SettingsPage')
const TeamPage           = lazyCompat(() => import('./TeamPage'), 'TeamPage')
const TrainingManagement = lazyCompat(() => import('./TrainingManagement'), 'TrainingManagement')
const ProjectDownloader  = lazyCompat(() => import('./ProjectDownloader'), 'ProjectDownloader')

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">404</div>
        <p className="text-gray-600 mb-6">Page not found</p>
        <a href="/overview" className="px-4 py-2 rounded bg-blue-600 text-white">Go to Overview</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
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
            <Route path="/app/:rest*" element={<Navigate to="/overview" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}