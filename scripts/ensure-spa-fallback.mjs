import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = `${__dirname}/..`;
const indexPath = `${rootDir}/docs/index.html`;
const fallbackPath = `${rootDir}/docs/404.html`;
const noJekyllPath = `${rootDir}/docs/.nojekyll`;

if (!existsSync(indexPath)) {
  console.error(`[ERROR] ${indexPath} not found. Run the build before enforcing SPA fallback.`);
  process.exit(1);
}

const indexHtml = readFileSync(indexPath, 'utf8');
let shouldMirror = false;

if (!existsSync(fallbackPath)) {
  shouldMirror = true;
} else {
  const fallbackHtml = readFileSync(fallbackPath, 'utf8');
  const redirectPattern = /<meta\s+http-equiv=["']refresh["']|location\.(replace|href)|<script>.*location/si;
  if (redirectPattern.test(fallbackHtml)) {
    shouldMirror = true;
  }
}

if (shouldMirror) {
  writeFileSync(fallbackPath, indexHtml);
  console.log(`[ok] Ensured SPA fallback: ${fallbackPath} mirrors ${indexPath}`);
} else {
  console.log('[ok] docs/404.html already provides SPA fallback');
}

if (!existsSync(noJekyllPath)) {
  writeFileSync(noJekyllPath, '');
  console.log('[ok] Created docs/.nojekyll');
} else {
  console.log('[ok] docs/.nojekyll already exists');
}
