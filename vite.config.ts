import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5137,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5137,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [
        '@tensorflow/tfjs-core',
        '@tensorflow/tfjs-data',
        '@tensorflow/tfjs-layers'
      ]
    }
  },
  optimizeDeps: {
    exclude: [
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-data', 
      '@tensorflow/tfjs-layers'
    ]
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});