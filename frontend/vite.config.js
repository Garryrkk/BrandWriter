import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Main backend API (runs on port 8000)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Health check for main backend
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Insta-App backend API (runs on port 8001)
      '/insta-api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/insta-api/, ''),
      },
    },
  },
})
