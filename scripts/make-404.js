import { copyFileSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

mkdirSync('docs', { recursive: true });

if (existsSync('docs/index.html')) {
  // Read the index.html content
  const indexContent = readFileSync('docs/index.html', 'utf8');
  
  // Use the same BASE constant as vite.config.ts
  const BASE = process.env.VITE_BASE_PATH || '/newboltailearn2/';
  const metaRefresh = `    <meta http-equiv="refresh" content="0; url=${BASE}">`;
  const updatedContent = indexContent.replace(
    '<meta charset="UTF-8" />',
    `<meta charset="UTF-8" />\n${metaRefresh}`
  );
  
  // Write the updated content to 404.html
  writeFileSync('docs/404.html', updatedContent);
  writeFileSync('docs/.nojekyll', '');
  console.log('✅ SPA fallback created: docs/404.html');
  console.log('✅ Jekyll disabled: docs/.nojekyll');
} else {
  console.error('❌ Build first - docs/index.html not found');
  process.exit(1);
}