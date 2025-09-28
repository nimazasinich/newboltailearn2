import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

const notFound = `<!doctype html><html><head><meta charset="utf-8"><script>
sessionStorage.redirect = location.href;
</script><meta http-equiv="refresh" content="0;url=/newboltailearn2/"></head></html>`;
writeFileSync(join(dist, '404.html'), notFound);
writeFileSync(join(dist, '.nojekyll'), '');
console.log('✅ Created 404.html and .nojekyll for GitHub Pages SPA routing');