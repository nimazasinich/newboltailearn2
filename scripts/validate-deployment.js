#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates all deployment configurations and requirements
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Persian Legal AI - Deployment Validation');
console.log('==========================================');

const validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

function validateFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${description}: ${filePath}`);
      validationResults.passed++;
      return true;
    } else {
      console.log(`❌ ${description}: ${filePath} - NOT FOUND`);
      validationResults.failed++;
      validationResults.errors.push(`Missing file: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description}: ${filePath} - ERROR: ${error.message}`);
    validationResults.failed++;
    validationResults.errors.push(`Error checking ${filePath}: ${error.message}`);
    return false;
  }
}

function validatePackageJson() {
  console.log('\n📦 Package.json Validation');
  console.log('---------------------------');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required scripts
  const requiredScripts = ['build', 'start', 'test', 'lint', 'typecheck'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ Script '${script}': ${packageJson.scripts[script]}`);
      validationResults.passed++;
    } else {
      console.log(`❌ Missing script: ${script}`);
      validationResults.failed++;
      validationResults.errors.push(`Missing script: ${script}`);
    }
  });
  
  // Check dependencies
  const requiredDeps = ['express', 'socket.io', 'better-sqlite3'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ Dependency '${dep}': ${packageJson.dependencies[dep]}`);
      validationResults.passed++;
    } else {
      console.log(`❌ Missing dependency: ${dep}`);
      validationResults.failed++;
      validationResults.errors.push(`Missing dependency: ${dep}`);
    }
  });
}

function validateEnvironmentConfig() {
  console.log('\n🔧 Environment Configuration');
  console.log('-----------------------------');
  
  // Check .env.example
  if (validateFile('.env.example', 'Environment template')) {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredVars = ['JWT_SECRET', 'DATABASE_PATH', 'PORT', 'NODE_ENV'];
    
    requiredVars.forEach(varName => {
      if (envExample.includes(varName)) {
        console.log(`✅ Environment variable: ${varName}`);
        validationResults.passed++;
      } else {
        console.log(`❌ Missing environment variable: ${varName}`);
        validationResults.failed++;
        validationResults.errors.push(`Missing env var: ${varName}`);
      }
    });
  }
}

function validateDockerConfig() {
  console.log('\n🐳 Docker Configuration');
  console.log('------------------------');
  
  if (validateFile('Dockerfile', 'Docker configuration')) {
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
    
    // Check for health check
    if (dockerfile.includes('HEALTHCHECK')) {
      console.log('✅ Docker health check configured');
      validationResults.passed++;
    } else {
      console.log('⚠️  Docker health check not configured');
      validationResults.warnings++;
    }
    
    // Check for proper port exposure
    if (dockerfile.includes('EXPOSE 8080')) {
      console.log('✅ Port 8080 exposed');
      validationResults.passed++;
    } else {
      console.log('❌ Port 8080 not exposed');
      validationResults.failed++;
      validationResults.errors.push('Port 8080 not exposed in Dockerfile');
    }
  }
}

function validateCIConfig() {
  console.log('\n🔄 CI/CD Configuration');
  console.log('-----------------------');
  
  validateFile('.github/workflows/ci.yml', 'GitHub Actions CI/CD pipeline');
  validateFile('render.yaml', 'Render.com deployment config');
  
  // Check if CI includes all required steps
  if (fs.existsSync('.github/workflows/ci.yml')) {
    const ciConfig = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
    const requiredSteps = ['lint', 'test', 'build', 'docker-build'];
    
    requiredSteps.forEach(step => {
      if (ciConfig.includes(step)) {
        console.log(`✅ CI step: ${step}`);
        validationResults.passed++;
      } else {
        console.log(`❌ Missing CI step: ${step}`);
        validationResults.failed++;
        validationResults.errors.push(`Missing CI step: ${step}`);
      }
    });
  }
}

function validateServerConfig() {
  console.log('\n🖥️  Server Configuration');
  console.log('-------------------------');
  
  validateFile('server/main.js', 'Main server file');
  validateFile('server/database/schema.sql', 'Database schema');
  
  // Check for health endpoints
  if (fs.existsSync('server/main.js')) {
    const serverCode = fs.readFileSync('server/main.js', 'utf8');
    
    if (serverCode.includes('/health')) {
      console.log('✅ Health check endpoint configured');
      validationResults.passed++;
    } else {
      console.log('❌ Health check endpoint missing');
      validationResults.failed++;
      validationResults.errors.push('Health check endpoint missing');
    }
    
    if (serverCode.includes('training-progress')) {
      console.log('✅ WebSocket training events configured');
      validationResults.passed++;
    } else {
      console.log('❌ WebSocket training events missing');
      validationResults.failed++;
      validationResults.errors.push('WebSocket training events missing');
    }
  }
}

function validateFrontendConfig() {
  console.log('\n🎨 Frontend Configuration');
  console.log('--------------------------');
  
  validateFile('vite.config.ts', 'Vite configuration');
  validateFile('tsconfig.json', 'TypeScript configuration');
  validateFile('tailwind.config.cjs', 'Tailwind CSS configuration');
  
  // Check for build output
  if (fs.existsSync('dist')) {
    console.log('✅ Build output directory exists');
    validationResults.passed++;
  } else {
    console.log('⚠️  Build output directory not found (run npm run build)');
    validationResults.warnings++;
  }
}

function validateTests() {
  console.log('\n🧪 Test Configuration');
  console.log('----------------------');
  
  validateFile('vitest.config.ts', 'Vitest configuration');
  validateFile('playwright.config.ts', 'Playwright configuration');
  validateFile('tests/setup.ts', 'Test setup file');
  
  // Check for test files
  const testDirs = ['tests/unit', 'tests/integration', 'tests/e2e'];
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const testFiles = fs.readdirSync(dir).filter(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
      if (testFiles.length > 0) {
        console.log(`✅ Test directory: ${dir} (${testFiles.length} files)`);
        validationResults.passed++;
      } else {
        console.log(`⚠️  Test directory: ${dir} (no test files)`);
        validationResults.warnings++;
      }
    } else {
      console.log(`❌ Test directory missing: ${dir}`);
      validationResults.failed++;
      validationResults.errors.push(`Missing test directory: ${dir}`);
    }
  });
}

function validateSecurity() {
  console.log('\n🔒 Security Configuration');
  console.log('--------------------------');
  
  // Check for security-related files
  const securityFiles = [
    '.eslintrc.js',
    '.prettierrc',
    'eslint.config.js'
  ];
  
  securityFiles.forEach(file => {
    validateFile(file, `Security config: ${file}`);
  });
  
  // Check for rate limiting in server
  if (fs.existsSync('server/main.js')) {
    const serverCode = fs.readFileSync('server/main.js', 'utf8');
    
    if (serverCode.includes('rate') && serverCode.includes('limit')) {
      console.log('✅ Rate limiting configured');
      validationResults.passed++;
    } else {
      console.log('⚠️  Rate limiting not configured');
      validationResults.warnings++;
    }
  }
}

function runBuildTest() {
  console.log('\n🔨 Build Test');
  console.log('--------------');
  
  try {
    console.log('Running npm run build...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build successful');
    validationResults.passed++;
  } catch (error) {
    console.log('❌ Build failed');
    console.log(error.message);
    validationResults.failed++;
    validationResults.errors.push('Build failed');
  }
}

function runLintTest() {
  console.log('\n🔍 Lint Test');
  console.log('-------------');
  
  try {
    console.log('Running npm run lint...');
    execSync('npm run lint', { stdio: 'pipe' });
    console.log('✅ Lint passed');
    validationResults.passed++;
  } catch (error) {
    console.log('❌ Lint failed');
    console.log(error.message);
    validationResults.failed++;
    validationResults.errors.push('Lint failed');
  }
}

function runTypeCheck() {
  console.log('\n📝 Type Check');
  console.log('---------------');
  
  try {
    console.log('Running npm run typecheck...');
    execSync('npm run typecheck', { stdio: 'pipe' });
    console.log('✅ Type check passed');
    validationResults.passed++;
  } catch (error) {
    console.log('❌ Type check failed');
    console.log(error.message);
    validationResults.failed++;
    validationResults.errors.push('Type check failed');
  }
}

function generateReport() {
  console.log('\n📊 Validation Report');
  console.log('====================');
  console.log(`✅ Passed: ${validationResults.passed}`);
  console.log(`❌ Failed: ${validationResults.failed}`);
  console.log(`⚠️  Warnings: ${validationResults.warnings}`);
  
  if (validationResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    validationResults.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  const successRate = (validationResults.passed / (validationResults.passed + validationResults.failed)) * 100;
  console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (validationResults.failed === 0) {
    console.log('\n🎉 All validations passed! System is ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some validations failed. Please fix the issues before deployment.');
    process.exit(1);
  }
}

// Run all validations
async function main() {
  try {
    validatePackageJson();
    validateEnvironmentConfig();
    validateDockerConfig();
    validateCIConfig();
    validateServerConfig();
    validateFrontendConfig();
    validateTests();
    validateSecurity();
    
    // Run build tests
    runBuildTest();
    runLintTest();
    runTypeCheck();
    
    generateReport();
  } catch (error) {
    console.error('❌ Validation script failed:', error.message);
    process.exit(1);
  }
}

main();
