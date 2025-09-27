const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧹 Cleaning previous installations...');

// Clean npm cache and node_modules
try {
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
  
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleanup completed');
  
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
  
} catch (error) {
  console.error('❌ Error during installation:', error.message);
  process.exit(1);
}