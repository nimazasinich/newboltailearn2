import React from 'react';
import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Overview } from './components/dashboard/Overview';
import { TrainingManagement } from './components/dashboard/TrainingManagement';
import { ProjectDownloader } from './components/ProjectDownloader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/Button';
import { Brain, Home, Settings, Download, FileText, BarChart3, Menu, X } from 'lucide-react';
import { initializeDatabase } from './services/database';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'documents' | 'download'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, login } = useAuth();

  // Initialize database on app start
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  // Handle hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      switch (hash) {
        case 'overview':
        case 'dashboard':
          setActiveTab('overview');
          break;
        case 'training':
          setActiveTab('training');
          break;
        case 'documents':
          setActiveTab('documents');
          break;
        case 'download':
          setActiveTab('download');
          break;
        default:
          if (hash && ['overview', 'training', 'documents', 'download'].includes(hash as any)) {
            setActiveTab(hash as any);
          }
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle initial hash
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    // Update URL hash for deep linking
    window.location.hash = tabId;
    // Close sidebar on mobile after navigation
    setSidebarOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tabId);
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onEnterSystem={handleEnterSystem} />;
  }

  return (
    <div className="layout">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}
        role="navigation" 
        aria-label="منوی اصلی"
      >
        <div className="sidebar__header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  سیستم حقوقی
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Legal AI System
                </p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(false)}
              aria-label="بستن منو"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                خوش آمدید، {user.name}
              </p>
            </div>
          )}
        </div>

        <nav className="sidebar__nav" role="tablist" aria-label="بخش‌های سیستم">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="panel-overview"
            id="tab-overview"
            data-hash="overview"
            className="sidebar__nav-item"
            onClick={() => handleTabChange('overview')}
            onKeyDown={(e) => handleKeyDown(e, 'overview')}
            tabIndex={activeTab === 'overview' ? 0 : -1}
          >
            <BarChart3 className="h-5 w-5" />
            داشبورد
          </button>
          
          <button
            role="tab"
            aria-selected={activeTab === 'training'}
            aria-controls="panel-training"
            id="tab-training"
            data-hash="training"
            className="sidebar__nav-item"
            onClick={() => handleTabChange('training')}
            onKeyDown={(e) => handleKeyDown(e, 'training')}
            tabIndex={activeTab === 'training' ? 0 : -1}
          >
            <Brain className="h-5 w-5" />
            آموزش مدل‌ها
          </button>
          
          <button
            role="tab"
            aria-selected={activeTab === 'documents'}
            aria-controls="panel-documents"
            id="tab-documents"
            data-hash="documents"
            className="sidebar__nav-item"
            onClick={() => handleTabChange('documents')}
            onKeyDown={(e) => handleKeyDown(e, 'documents')}
            tabIndex={activeTab === 'documents' ? 0 : -1}
          >
            <FileText className="h-5 w-5" />
            مدیریت اسناد
          </button>
          
          <button
            role="tab"
            aria-selected={activeTab === 'download'}
            aria-controls="panel-download"
            id="tab-download"
            data-hash="download"
            className="sidebar__nav-item"
            onClick={() => handleTabChange('download')}
            onKeyDown={(e) => handleKeyDown(e, 'download')}
            tabIndex={activeTab === 'download' ? 0 : -1}
          >
            <Download className="h-5 w-5" />
            دانلود پروژه
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <button
              type="button"
              className="sidebar__nav-item"
              onClick={() => setCurrentView('landing')}
            >
              <Home className="h-5 w-5" />
              صفحه اصلی
            </button>
          </div>
        </nav>
      </aside>

      {/* Header */}
      <header className="header">
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                سیستم آموزش هوش مصنوعی حقوقی
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Persian Legal AI Training System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="default"
              onClick={() => setCurrentView('landing')}
            >
              <Home className="h-5 w-5 ml-2" />
              <span className="hidden sm:inline">صفحه اصلی</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Tab Panels */}
        <section 
          role="tabpanel" 
          id="panel-overview" 
          aria-labelledby="tab-overview"
          className={activeTab === 'overview' ? '' : 'hidden'}
        >
          <ErrorBoundary>
            <Overview />
          </ErrorBoundary>
        </section>

        <section 
          role="tabpanel" 
          id="panel-training" 
          aria-labelledby="tab-training"
          className={activeTab === 'training' ? '' : 'hidden'}
        >
          <ErrorBoundary>
            <TrainingManagement />
          </ErrorBoundary>
        </section>

        <section 
          role="tabpanel" 
          id="panel-documents" 
          aria-labelledby="tab-documents"
          className={activeTab === 'documents' ? '' : 'hidden'}
        >
          <div className="text-center py-20">
            <FileText className="h-20 w-20 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              مدیریت اسناد
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              این بخش در حال توسعه است
            </p>
          </div>
        </section>

        <section 
          role="tabpanel" 
          id="panel-download" 
          aria-labelledby="tab-download"
          className={activeTab === 'download' ? '' : 'hidden'}
        >
          <ProjectDownloader />
        </section>
      </main>
    </div>
  );
}

export default App;
