import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/public': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/chatbot': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/chatbot/, '')
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
