import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// In production we serve from https://<user>.github.io/Plyx/, so the base
// path must match the repo name. In dev we keep it at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Plyx/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons.svg', 'robots.txt', 'sitemap.xml'],
      manifest: false, // we ship our own public/manifest.webmanifest
      workbox: {
        // Precache the app shell + every lazy-loaded tool chunk + fonts + CSS
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // Avoid precaching huge chunks to keep install fast
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // SPA navigation fallback — serve index.html for any unknown route
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//, /\.webmanifest$/],
        runtimeCaching: [
          // Google Fonts — stylesheets change rarely, files never
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'plyx-gfonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'plyx-gfonts-files',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Currency exchange rates — offline fallback to last good response
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'plyx-currency',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 3, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
}))
