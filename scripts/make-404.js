import path from 'path';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

const outputDir = process.env.BUILD_OUTPUT_DIR || 'dist';
const indexPath = path.join(outputDir, 'index.html');
const fallbackPath = path.join(outputDir, '404.html');
const noJekyllPath = path.join(outputDir, '.nojekyll');

mkdirSync(outputDir, { recursive: true });

if (existsSync(indexPath)) {
  copyFileSync(indexPath, fallbackPath);
  writeFileSync(noJekyllPath, '');
  console.log(`✅ SPA fallback created: ${fallbackPath}`);
  console.log(`✅ Jekyll disabled: ${noJekyllPath}`);
} else {
  console.error(`❌ Build first - ${indexPath} not found`);
  process.exit(1);
}