import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const BASE = process.env.VITE_BASE_PATH || '/newboltailearn2/';

export default defineConfig({
  base: BASE,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tensorflow/tfjs-backend-wasm': path.resolve(__dirname, 'src/shims/tfjs-backend-wasm-empty.ts'),
    },
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep fonts in their own directory structure
          if (assetInfo.name && assetInfo.name.endsWith('.woff2')) {
            return 'fonts/vazirmatn/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  publicDir: 'public'
});