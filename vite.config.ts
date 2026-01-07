import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'img/*.png'],
      manifest: {
        name: 'GitHunt',
        short_name: 'GitHunt',
        description: 'Most starred projects on GitHub',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'img/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'img/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.github\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: mode === 'chrome' ? 'build' : 'dist',
    rollupOptions: {
      output: {
        // Disable code splitting for Chrome extension
        ...(mode === 'chrome' && {
          inlineDynamicImports: true
        })
      }
    }
  }
}))
