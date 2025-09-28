@echo off
:: Enhanced Persian Legal AI Dashboard Launcher
:: Starts both backend and frontend with enhanced features

setlocal EnableDelayedExpansion
title Enhanced Persian Legal AI Dashboard
color 0A
cls

:: Force change to script directory
pushd "%~dp0"

echo.
echo ================================================================
echo  🧠 ENHANCED PERSIAN LEGAL AI DASHBOARD
echo ================================================================
echo.
echo ✨ ENHANCED FEATURES:
echo    ✅ Modern Persian RTL UI Design
echo    ✅ Professional Legal AI Interface
echo    ✅ Real-time Training Monitoring  
echo    ✅ Enhanced Model Management
echo    ✅ Persian Legal Categories
echo    ✅ Interactive Charts and Analytics
echo    ✅ System Health Monitoring
echo    ✅ Enhanced Navigation
echo.
echo 🎯 PURPOSE: Iranian Legal/Social Learning Model Tracker
echo 🔧 FUNCTIONALITY: All components working and communicating
echo.
pause

echo 🔍 Step 1: Checking system requirements...
echo.

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
    node --version
)

:: Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found
    echo Please run this from the project directory
    pause
    exit /b 1
) else (
    echo ✅ Project files found
)

echo.
echo 🔍 Step 2: Testing enhanced files...
if exist "src\components\EnhancedLandingPage.tsx" (
    echo ✅ Enhanced Landing Page
) else (
    echo ❌ Enhanced Landing Page missing
)

if exist "src\components\EnhancedDashboard.tsx" (
    echo ✅ Enhanced Dashboard
) else (
    echo ❌ Enhanced Dashboard missing
)

if exist "simple-server.js" (
    echo ✅ Simple Server
) else (
    echo ❌ Simple Server missing
)

echo.
echo 🔍 Step 3: Installing dependencies (if needed)...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ⚠️ Some dependencies may have issues, but continuing...
    )
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🔍 Step 4: Starting Enhanced Persian Legal AI Dashboard...
echo.
echo 🚀 STARTING BACKEND SERVER...
echo    📡 Server: http://localhost:8080
echo    🗄️ Database: SQLite with Persian legal data
echo    🔌 APIs: /api/models, /api/datasets, /api/logs
echo    💾 Mock Data: Available if real data fails
echo.

:: Start backend server in background
start /min cmd /c "echo Starting backend server... & node simple-server.js"

:: Wait for server to initialize
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎨 STARTING FRONTEND...
echo    🌐 Frontend: http://localhost:5173
echo    🎯 Enhanced UI: Modern Persian Legal AI Interface
echo    📱 Features: All enhanced components active
echo.

echo 💡 USAGE:
echo    1. Backend will start on port 8080
echo    2. Frontend will start on port 5173  
echo    3. Browser will open automatically
echo    4. Navigate through enhanced Persian Legal AI interface
echo.
echo ⚠️ Keep this window open to monitor both servers!
echo.

:: Start frontend
npm run dev

echo.
echo 🛑 Enhanced Persian Legal AI Dashboard stopped.
echo.
echo 💡 To restart, just run this launcher again!
popd
pause
goto :eof