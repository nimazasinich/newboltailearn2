import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

mkdirSync('docs', { recursive: true });

if (existsSync('docs/index.html')) {
  copyFileSync('docs/index.html', 'docs/404.html');
  writeFileSync('docs/.nojekyll', '');
  console.log('✅ SPA fallback created: docs/404.html');
  console.log('✅ Jekyll disabled: docs/.nojekyll');
} else {
  console.error('❌ Build first - docs/index.html not found');
  process.exit(1);
}