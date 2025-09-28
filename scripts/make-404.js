import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

mkdirSync('dist', { recursive: true });

if (existsSync('dist/index.html')) {
  copyFileSync('dist/index.html', 'dist/404.html');
  writeFileSync('dist/.nojekyll', '');
  console.log('✅ SPA fallback created: dist/404.html');
  console.log('✅ Jekyll disabled: dist/.nojekyll');
} else {
  console.error('❌ Build first - dist/index.html not found');
  process.exit(1);
}