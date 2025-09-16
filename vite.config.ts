import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Use VITE_BASE_PATH if provided (e.g. '/newboltailearn/'), otherwise '/'
  const base = env.VITE_BASE_PATH && env.VITE_BASE_PATH.trim() !== '' ? env.VITE_BASE_PATH : '/';

  return defineConfig({
    plugins: [react()],
    base,
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
        '/ws':  { target: 'ws://localhost:3001',  changeOrigin: true, ws: true }
      }
    },
    build: {
      outDir: 'docs',
      sourcemap: true,
      emptyOutDir: true
    }
  });
};