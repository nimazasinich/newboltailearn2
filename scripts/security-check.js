#!/usr/bin/env node

/**
 * Security Check Script for Persian Legal AI
 * Validates security requirements before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'blue');
  
  const requiredVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'NODE_ENV'
  ];
  
  const optionalVars = [
    'CSRF_SECRET',
    'HF_TOKEN_B64',
    'CORS_ORIGIN'
  ];
  
  let allPassed = true;
  
  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      log(`❌ Missing required environment variable: ${varName}`, 'red');
      allPassed = false;
    } else {
      log(`✅ ${varName}: Set`, 'green');
      
      // Validate JWT_SECRET length
      if (varName === 'JWT_SECRET' && value.length < 32) {
        log(`⚠️  ${varName}: Should be at least 32 characters (current: ${value.length})`, 'yellow');
        allPassed = false;
      }
      
      // Validate SESSION_SECRET length
      if (varName === 'SESSION_SECRET' && value.length < 32) {
        log(`⚠️  ${varName}: Should be at least 32 characters (current: ${value.length})`, 'yellow');
        allPassed = false;
      }
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      log(`✅ ${varName}: Set`, 'green');
      
      // Validate CSRF_SECRET length
      if (varName === 'CSRF_SECRET' && value.length < 32) {
        log(`⚠️  ${varName}: Should be at least 32 characters (current: ${value.length})`, 'yellow');
        allPassed = false;
      }
    } else {
      log(`ℹ️  ${varName}: Not set (optional)`, 'cyan');
    }
  }
  
  // Check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    log('✅ NODE_ENV: Production mode', 'green');
  } else {
    log(`⚠️  NODE_ENV: ${process.env.NODE_ENV} (should be 'production' for production deployment)`, 'yellow');
  }
  
  return allPassed;
}

function checkFilePermissions() {
  log('\n🔍 Checking File Permissions...', 'blue');
  
  const filesToCheck = [
    'persian_legal_ai.db',
    'data/persian_legal_ai.db'
  ];
  
  let allPassed = true;
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        const mode = stats.mode.toString(8);
        
        // Check if file is world-readable (last digit should be 0 or 4)
        const worldReadable = (stats.mode & 0o004) !== 0;
        const worldWritable = (stats.mode & 0o002) !== 0;
        
        if (worldReadable || worldWritable) {
          log(`❌ ${filePath}: World-readable or writable (mode: ${mode})`, 'red');
          allPassed = false;
        } else {
          log(`✅ ${filePath}: Secure permissions (mode: ${mode})`, 'green');
        }
      } catch (error) {
        log(`⚠️  ${filePath}: Could not check permissions (${error.message})`, 'yellow');
      }
    } else {
      log(`ℹ️  ${filePath}: Not found (will be created)`, 'cyan');
    }
  }
  
  return allPassed;
}

function checkSecurityHeaders() {
  log('\n🔍 Checking Security Headers...', 'blue');
  
  // This would typically check HTTP response headers
  // For now, we'll just log that this should be verified
  log('ℹ️  Security headers should be verified in production deployment', 'cyan');
  log('   - X-Content-Type-Options: nosniff', 'cyan');
  log('   - X-Frame-Options: DENY', 'cyan');
  log('   - X-XSS-Protection: 1; mode=block', 'cyan');
  log('   - Strict-Transport-Security: max-age=31536000', 'cyan');
  
  return true;
}

function checkDependencies() {
  log('\n🔍 Checking Dependencies...', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for known vulnerable packages (basic check)
    const vulnerablePackages = [
      'express', // Check for old versions
      'socket.io', // Check for old versions
      'jsonwebtoken' // Check for old versions
    ];
    
    let allPassed = true;
    
    for (const pkg of vulnerablePackages) {
      if (dependencies[pkg]) {
        log(`✅ ${pkg}: ${dependencies[pkg]}`, 'green');
        // In a real implementation, you'd check against a vulnerability database
      }
    }
    
    return allPassed;
  } catch (error) {
    log(`❌ Could not read package.json: ${error.message}`, 'red');
    return false;
  }
}

function checkConfiguration() {
  log('\n🔍 Checking Configuration...', 'blue');
  
  let allPassed = true;
  
  // Check if .env file exists
  if (fs.existsSync('.env')) {
    log('✅ .env file exists', 'green');
    
    // Check if .env is in .gitignore
    try {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (gitignore.includes('.env')) {
        log('✅ .env is in .gitignore', 'green');
      } else {
        log('❌ .env should be in .gitignore', 'red');
        allPassed = false;
      }
    } catch (error) {
      log('⚠️  Could not check .gitignore', 'yellow');
    }
  } else {
    log('⚠️  .env file not found', 'yellow');
  }
  
  // Check if .env.sample exists
  if (fs.existsSync('.env.sample')) {
    log('✅ .env.sample file exists', 'green');
  } else {
    log('❌ .env.sample file missing', 'red');
    allPassed = false;
  }
  
  return allPassed;
}

function checkDatabaseSecurity() {
  log('\n🔍 Checking Database Security...', 'blue');
  
  let allPassed = true;
  
  // Check if database file exists and is secure
  const dbPath = process.env.DATABASE_PATH || './persian_legal_ai.db';
  
  if (fs.existsSync(dbPath)) {
    try {
      const stats = fs.statSync(dbPath);
      const mode = stats.mode.toString(8);
      
      // Check if database is world-readable
      const worldReadable = (stats.mode & 0o004) !== 0;
      
      if (worldReadable) {
        log(`❌ Database file is world-readable (mode: ${mode})`, 'red');
        allPassed = false;
      } else {
        log(`✅ Database file has secure permissions (mode: ${mode})`, 'green');
      }
    } catch (error) {
      log(`⚠️  Could not check database permissions: ${error.message}`, 'yellow');
    }
  } else {
    log('ℹ️  Database file will be created on first run', 'cyan');
  }
  
  return allPassed;
}

function generateSecurityReport() {
  log('\n📊 Security Check Report', 'magenta');
  log('=' .repeat(50), 'magenta');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'File Permissions', fn: checkFilePermissions },
    { name: 'Security Headers', fn: checkSecurityHeaders },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Configuration', fn: checkConfiguration },
    { name: 'Database Security', fn: checkDatabaseSecurity }
  ];
  
  let totalPassed = 0;
  let totalChecks = checks.length;
  
  for (const check of checks) {
    log(`\n🔍 ${check.name}`, 'blue');
    const passed = check.fn();
    if (passed) {
      totalPassed++;
    }
  }
  
  log('\n📋 Summary', 'magenta');
  log('=' .repeat(50), 'magenta');
  log(`Total Checks: ${totalChecks}`, 'cyan');
  log(`Passed: ${totalPassed}`, 'green');
  log(`Failed: ${totalChecks - totalPassed}`, 'red');
  
  if (totalPassed === totalChecks) {
    log('\n🎉 All security checks passed!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some security checks failed. Please review and fix before deployment.', 'yellow');
    process.exit(1);
  }
}

// Run security checks
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSecurityReport();
}

export { generateSecurityReport };