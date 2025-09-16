import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isGh = env.GITHUB_PAGES === 'true' || process.env.GITHUB_PAGES === 'true';

  return defineConfig({
    plugins: [react()],
    // IMPORTANT: correct asset base for GitHub Pages
    base: isGh ? '/newboltailearn/' : '/',
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
        '/ws': { target: 'ws://localhost:3001', ws: true, changeOrigin: true }
      }
    },
    // build directly to docs/ to avoid copy steps going stale
    build: {
      outDir: 'docs',
      sourcemap: true,
      emptyOutDir: true
    }
  });
};