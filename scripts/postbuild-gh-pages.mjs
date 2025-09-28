import { cpSync, writeFileSync } from 'fs';
cpSync('dist/index.html', 'dist/404.html');
writeFileSync('dist/.nojekyll', '');