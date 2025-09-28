import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/newboltailearn2/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tensorflow/tfjs-backend-wasm': path.resolve(__dirname, 'src/shims/tfjs-backend-wasm-empty.ts'),
    },
  },
});