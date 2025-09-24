// Minimal static check: extract Sidebar "to" targets and Route paths from App.tsx
import fs from 'fs';
const side = fs.readFileSync('src/components/layout/Sidebar.tsx','utf-8');
const app  = fs.readFileSync('src/App.tsx','utf-8');
const to = Array.from(side.matchAll(/to=\{item\.href\}/g)).map(m=>'item.href');
const hrefs = Array.from(side.matchAll(/href:\s*'([^']+)'/g)).map(m=>m[1]);
const allLinks = [...to, ...hrefs];
const routes = Array.from(app.matchAll(/path="([^"]+)"/g)).map(m=>m[1]);
const missing = hrefs.filter(x => !routes.includes(x));
console.log('Sidebar links:', hrefs);
console.log('App routes  :', routes);
if (missing.length) { console.error('Missing routes for:', missing); process.exit(1); }
console.log('OK: All sidebar links resolve to App routes.');
