import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.webp', 'icons/*.svg'],
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'Red Bean Hiring Assessment',
        short_name: 'RB Assessment',
        description: 'Red Bean Hospitality — Complete your hiring assessment online',
        theme_color: '#C41E3A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        id: '/',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Start Assessment',
            short_name: 'Assessment',
            description: 'Begin your candidate assessment',
            url: '/',
            icons: [{ src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
          {
            name: 'Admin Login',
            short_name: 'Admin',
            description: 'HR admin dashboard login',
            url: '/admin/login',
            icons: [{ src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
        ],
        screenshots: [
          {
            src: '/logo.webp',
            sizes: '512x512',
            type: 'image/webp',
            form_factor: 'narrow',
            label: 'Red Bean Assessment Portal',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webp,ico,woff,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Cache the assessment config (timer settings) for 1 hour
            urlPattern: /\/api\/assessment\/config/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assessment-config-v1',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache images/fonts from any origin
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-v1',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
