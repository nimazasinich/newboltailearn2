import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const idx = 'docs/index.html';
const fb  = 'docs/404.html';
const nj  = 'docs/.nojekyll';

if (!existsSync(idx)) {
  console.error(`[ERROR] ${idx} not found. Build first (npm run build).`);
  process.exit(1);
}

// If 404.html missing or contains redirect, mirror index.html; else keep as-is
const indexHtml = readFileSync(idx, 'utf8');
let needsMirror = false;
if (!existsSync(fb)) needsMirror = true;
else {
  const fbHtml = readFileSync(fb, 'utf8');
  const looksLikeRedirect = /<meta\s+http-equiv=["']refresh["']|location\.(replace|href)|<script>.*location/i.test(fbHtml);
  if (looksLikeRedirect) needsMirror = true;
}
if (needsMirror) {
  writeFileSync(fb, indexHtml);
  console.log(`[ok] Ensured SPA fallback: ${fb} ← ${idx}`);
} else {
  console.log('[ok] 404.html exists and is not redirect-based');
}

// Ensure .nojekyll exists
if (!existsSync(nj)) {
  writeFileSync(nj, '');
  console.log('[ok] Created docs/.nojekyll');
} else {
  console.log('[ok] docs/.nojekyll already present');
}
