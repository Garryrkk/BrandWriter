import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      // Main backend API (runs on port 8000)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Email outreach backend API (runs on port 5000)
      '/email-api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Route stats to /api/stats and everything else straight through
        rewrite: (path) => {
          if (path.startsWith('/email-api/stats')) return '/api/stats'
          return path.replace(/^\/email-api/, '')
        },
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
