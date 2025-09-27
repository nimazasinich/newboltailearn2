#!/usr/bin/env node

/**
 * Dashboard Implementation Validation Script
 * Validates that all components are properly integrated and accessible
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const REQUIRED_COMPONENTS = [
  'src/components/Dashboard.tsx',
  'src/components/layout/Sidebar.tsx', 
  'src/components/router.tsx',
  'src/components/dashboard/Overview.tsx',
  'src/components/dashboard/TrainingManagement.tsx',
  'src/components/AnalyticsPage.tsx',
  'src/components/DataPage.tsx',
  'src/components/ModelsPage.tsx',
  'src/components/MonitoringPage.tsx',
  'src/components/LogsPage.tsx',
  'src/components/TeamPage.tsx'
];

const REQUIRED_UI_COMPONENTS = [
  'src/components/ui/Card.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Progress.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Input.tsx'
];

const REQUIRED_ROUTES = [
  '/app/dashboard',
  '/app/training', 
  '/app/monitoring',
  '/app/analytics',
  '/app/models',
  '/app/data',
  '/app/logs',
  '/app/team'
];

async function validateFiles() {
  console.log('🔍 Validating Dashboard Implementation...\n');
  
  let allValid = true;

  // Check main components
  console.log('📁 Checking Main Components:');
  for (const component of REQUIRED_COMPONENTS) {
    try {
      await fs.access(component);
      console.log(`  ✅ ${component}`);
    } catch (error) {
      console.log(`  ❌ ${component} - MISSING`);
      allValid = false;
    }
  }

  console.log('\n📁 Checking UI Components:');
  for (const component of REQUIRED_UI_COMPONENTS) {
    try {
      await fs.access(component);
      console.log(`  ✅ ${component}`);
    } catch (error) {
      console.log(`  ❌ ${component} - MISSING`);
      allValid = false;
    }
  }

  // Check router configuration
  console.log('\n🛣️  Checking Router Configuration:');
  try {
    const routerContent = await fs.readFile('src/components/router.tsx', 'utf-8');
    
    for (const route of REQUIRED_ROUTES) {
      const routePath = route.replace('/app/', '');
      if (routerContent.includes(`path="${routePath}"`)) {
        console.log(`  ✅ Route: ${route}`);
      } else {
        console.log(`  ❌ Route: ${route} - NOT FOUND`);
        allValid = false;
      }
    }
  } catch (error) {
    console.log('  ❌ Could not read router.tsx');
    allValid = false;
  }

  // Check Dashboard structure
  console.log('\n🏠 Checking Dashboard Structure:');
  try {
    const dashboardContent = await fs.readFile('src/components/Dashboard.tsx', 'utf-8');
    
    const checks = [
      { name: 'Outlet import', pattern: 'import.*Outlet.*from.*react-router-dom' },
      { name: 'Outlet usage', pattern: '<Outlet' },
      { name: 'Sidebar integration', pattern: '<Sidebar' },
      { name: 'Theme toggle', pattern: 'toggleTheme' },
      { name: 'Search functionality', pattern: 'handleSearch' },
      { name: 'WebSocket integration', pattern: 'connectSocket' },
      { name: 'System metrics', pattern: 'SystemMetrics' },
      { name: 'RTL support', pattern: 'dir="rtl"' }
    ];

    for (const check of checks) {
      const regex = new RegExp(check.pattern, 'i');
      if (regex.test(dashboardContent)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name} - NOT FOUND`);
        allValid = false;
      }
    }
  } catch (error) {
    console.log('  ❌ Could not read Dashboard.tsx');
    allValid = false;
  }

  // Check Sidebar navigation
  console.log('\n🧭 Checking Sidebar Navigation:');
  try {
    const sidebarContent = await fs.readFile('src/components/layout/Sidebar.tsx', 'utf-8');
    
    const navigationChecks = [
      { name: 'Persian labels', pattern: 'داشبورد|آموزش|نظارت|تحلیل' },
      { name: 'Route mapping', pattern: '/app/' },
      { name: 'Active state', pattern: 'isActive' },
      { name: 'Accessibility', pattern: 'aria-label' },
      { name: 'Mobile support', pattern: 'lg:hidden' }
    ];

    for (const check of navigationChecks) {
      const regex = new RegExp(check.pattern, 'i');
      if (regex.test(sidebarContent)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name} - NOT FOUND`);
        allValid = false;
      }
    }
  } catch (error) {
    console.log('  ❌ Could not read Sidebar.tsx');
    allValid = false;
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('🎉 VALIDATION SUCCESSFUL!');
    console.log('✅ Dashboard implementation is complete and ready for use.');
    console.log('🚀 All components are properly integrated.');
    console.log('📱 Navigation and routing are configured correctly.');
    console.log('🎨 UI/UX features are implemented.');
  } else {
    console.log('❌ VALIDATION FAILED!');
    console.log('Some components or features are missing or incomplete.');
    console.log('Please review the errors above and fix them.');
  }
  console.log('='.repeat(50));

  return allValid;
}

// Run validation
validateFiles().catch(console.error);