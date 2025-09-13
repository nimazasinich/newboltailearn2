#!/usr/bin/env node

/**
 * Security Test Runner for Persian Legal AI
 * Runs comprehensive security tests and validation
 */

import { spawn } from 'child_process';
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

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runSecurityTests() {
  log('\n🔒 Running Comprehensive Security Tests', 'magenta');
  log('=' .repeat(60), 'magenta');

  const tests = [
    {
      name: 'Environment Validation Tests',
      command: 'npm',
      args: ['run', 'test:unit', '--', 'tests/integration/environment-validation.test.ts'],
      description: 'Validates environment variable configuration and security requirements'
    },
    {
      name: 'CSRF Integration Tests',
      command: 'npm',
      args: ['run', 'test:unit', '--', 'tests/integration/csrf-integration.test.ts'],
      description: 'Tests CSRF protection implementation and token management'
    },
    {
      name: 'Security Integration Tests',
      command: 'npm',
      args: ['run', 'test:unit', '--', 'tests/integration/security.test.ts'],
      description: 'Tests overall security implementation and middleware'
    },
    {
      name: 'Authentication Tests',
      command: 'npm',
      args: ['run', 'test:unit', '--', 'tests/unit/auth.test.ts'],
      description: 'Tests authentication flow and JWT token handling'
    },
    {
      name: 'Security Unit Tests',
      command: 'npm',
      args: ['run', 'test:unit', '--', 'tests/unit/security.test.ts'],
      description: 'Tests security utilities and validation functions'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    log(`\n🧪 Running ${test.name}...`, 'blue');
    log(`   ${test.description}`, 'cyan');
    
    try {
      await runCommand(test.command, test.args);
      log(`✅ ${test.name} passed`, 'green');
      passedTests++;
    } catch (error) {
      log(`❌ ${test.name} failed: ${error.message}`, 'red');
    }
  }

  // Run E2E tests if Playwright is available
  log(`\n🎭 Running E2E Security Tests...`, 'blue');
  try {
    await runCommand('npm', ['run', 'test:integration', '--', 'tests/e2e/security-flow.spec.ts']);
    log(`✅ E2E Security Tests passed`, 'green');
    passedTests++;
    totalTests++;
  } catch (error) {
    log(`❌ E2E Security Tests failed: ${error.message}`, 'red');
    totalTests++;
  }

  // Run security check script
  log(`\n🔍 Running Security Check Script...`, 'blue');
  try {
    await runCommand('npm', ['run', 'security:check']);
    log(`✅ Security Check Script passed`, 'green');
    passedTests++;
    totalTests++;
  } catch (error) {
    log(`❌ Security Check Script failed: ${error.message}`, 'red');
    totalTests++;
  }

  // Run dependency audit
  log(`\n📦 Running Dependency Security Audit...`, 'blue');
  try {
    await runCommand('npm', ['audit', '--audit-level=moderate']);
    log(`✅ Dependency Security Audit passed`, 'green');
    passedTests++;
    totalTests++;
  } catch (error) {
    log(`❌ Dependency Security Audit failed: ${error.message}`, 'red');
    totalTests++;
  }

  // Generate test report
  log('\n📊 Security Test Report', 'magenta');
  log('=' .repeat(60), 'magenta');
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 All security tests passed!', 'green');
    log('✅ The application is ready for production deployment', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some security tests failed. Please review and fix before deployment.', 'yellow');
    process.exit(1);
  }
}

// Run security tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests().catch((error) => {
    log(`\n❌ Security test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runSecurityTests };