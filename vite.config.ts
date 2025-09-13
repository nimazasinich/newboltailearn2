// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
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
})