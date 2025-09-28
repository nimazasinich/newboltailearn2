import { copyFileSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

mkdirSync('docs', { recursive: true });

if (existsSync('docs/index.html')) {
  // Read the index.html content
  const indexContent = readFileSync('docs/index.html', 'utf8');
  
  // Add meta refresh tag after the charset meta tag
  const metaRefresh = '    <meta http-equiv="refresh" content="0; url=/newboltailearn2/">';
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