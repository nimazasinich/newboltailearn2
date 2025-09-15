import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GHPAGES === 'true' ? '/newboltailearn/' : '/',
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/ws':  { target: 'ws://localhost:3001', ws: true, changeOrigin: true }
    }
  },
  build: { outDir: 'dist', sourcemap: true }
})