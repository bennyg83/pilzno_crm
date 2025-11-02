import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determine base path based on build type
  // For GitHub Pages, use /pilzno_crm/ as base path
  // For local development and Docker, use root /
  const base = mode === 'pages' || process.env.GITHUB_PAGES === 'true'
    ? '/pilzno_crm/'
    : '/'

  return {
    plugins: [react()],
    base: base,
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://pilzno-synagogue-backend:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      assetsDir: 'assets'
    }
  }
}) 