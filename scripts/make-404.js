import { copyFileSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

mkdirSync('docs', { recursive: true });

if (existsSync('docs/index.html')) {
  // Create proper 404.html with meta refresh for SPA fallback
  const indexContent = readFileSync('docs/index.html', 'utf8');
  const metaRefresh = '<meta http-equiv="refresh" content="0; url=/newboltailearn2/">';
  const updatedContent = indexContent.replace('<head>', `<head>\n    ${metaRefresh}`);
  
  writeFileSync('docs/404.html', updatedContent);
  writeFileSync('docs/.nojekyll', '');
  console.log('✅ SPA fallback created: docs/404.html with meta refresh');
  console.log('✅ Jekyll disabled: docs/.nojekyll');
} else {
  console.error('❌ Build first - docs/index.html not found');
  process.exit(1);
}