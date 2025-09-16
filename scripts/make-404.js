import { copyFileSync, existsSync, mkdirSync } from 'fs';
mkdirSync('docs', { recursive: true });
if (existsSync('docs/index.html')) {
  copyFileSync('docs/index.html', 'docs/404.html');
  console.log('➡️  docs/404.html created for SPA fallback');
} else {
  console.error('❌ docs/index.html not found; build first.');
  process.exit(1);
}