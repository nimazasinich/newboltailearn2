import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';

// Load environment configuration
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';

const result = config({ path: envFile });
if (result.error) {
  console.warn(`⚠️  Warning: Could not load ${envFile}:`, result.error.message);
  // Try to load default .env as fallback
  config();
}

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base, // ✅ critical for GitHub Pages asset URLs
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': { target: process.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:3001', changeOrigin: true },
      '/ws':  { target: process.env.VITE_WS_BASE || 'ws://localhost:3001', ws: true, changeOrigin: true }
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});