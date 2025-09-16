import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const docs = path.join(root, 'docs');

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fsp.copyFile(s, d);
  }
}

async function run() {
  if (!fs.existsSync(dist)) {
    console.error('dist not found. Run build first.');
    process.exit(1);
  }
  if (fs.existsSync(docs)) {
    await fsp.rm(docs, { recursive: true, force: true });
  }
  await copyDir(dist, docs);

  const indexHtml = path.join(dist, 'index.html');
  const fallback = path.join(docs, '404.html');
  if (fs.existsSync(indexHtml)) {
    await fsp.copyFile(indexHtml, fallback);
  } else {
    console.warn('index.html not found in dist. 404.html not created.');
  }
  console.log('Docs prepared for GitHub Pages.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});