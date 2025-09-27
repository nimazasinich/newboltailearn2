import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [react()],
    base: '/newboltailearn2/',
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        '/api': { target: 'http://localhost:8080', changeOrigin: true },
        '/ws':  { target: 'ws://localhost:8080',  changeOrigin: true, ws: true },
        '/health': { target: 'http://localhost:8080', changeOrigin: true }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      emptyOutDir: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'framer-motion'],
            charts: ['recharts'],
            tensorflow: ['@tensorflow/tfjs'],
            utils: ['clsx'],
            api: ['zod']
          }
        }
      }
    }
  });