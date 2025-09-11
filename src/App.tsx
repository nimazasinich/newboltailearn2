import React from 'react';
import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Overview } from './components/dashboard/Overview';
import { TrainingManagement } from './components/dashboard/TrainingManagement';
import { ProjectDownloader } from './components/ProjectDownloader';
import { Button } from './components/ui/Button';
import { Brain, Home, Settings, Download, FileText, BarChart3 } from 'lucide-react';
import { initializeDatabase } from './services/database';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'documents' | 'download'>('overview');
  const { user, login } = useAuth();

  // Initialize database on app start
  React.useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  const handleEnterSystem = async () => {
    // Auto-login as demo user for now
    try {
      await login({ email: 'admin@legal-ai.ir', password: 'demo' });
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setCurrentView('dashboard'); // Continue anyway for demo
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onEnterSystem={handleEnterSystem} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    سیستم آموزش هوش مصنوعی حقوقی
                  </h1>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Persian Legal AI Training System
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="default"
                onClick={() => setCurrentView('landing')}
              >
                <Home className="h-5 w-5 ml-2" />
                صفحه اصلی
              </Button>
              {user && (
                <div className="text-base text-gray-600 dark:text-gray-400 font-medium">
                  خوش آمدید، {user.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex space-x-10 space-x-reverse">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-5 px-2 border-b-3 font-semibold text-base flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              داشبورد
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`py-5 px-2 border-b-3 font-semibold text-base flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'training'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Brain className="h-5 w-5" />
              آموزش مدل‌ها
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-5 px-2 border-b-3 font-semibold text-base flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <FileText className="h-5 w-5" />
              مدیریت اسناد
            </button>
            <button
              onClick={() => setActiveTab('download')}
              className={`py-5 px-2 border-b-3 font-semibold text-base flex items-center gap-3 transition-all duration-200 ${
                activeTab === 'download'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Download className="h-5 w-5" />
              دانلود پروژه
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <ErrorBoundary>
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'training' && <TrainingManagement />}
        </ErrorBoundary>
        {activeTab === 'documents' && (
          <div className="text-center py-20">
            <FileText className="h-20 w-20 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              مدیریت اسناد
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              این بخش در حال توسعه است
            </p>
          </div>
        )}
        {activeTab === 'download' && <ProjectDownloader />}
      </main>
    </div>
  );
}

export default App;
