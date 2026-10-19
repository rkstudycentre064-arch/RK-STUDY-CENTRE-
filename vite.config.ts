import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Ensure Vite client is resilient to WebSocket errors in iframe environment
try {
  const clientPath = path.resolve(__dirname, 'node_modules/vite/dist/client/client.mjs');
  if (fs.existsSync(clientPath)) {
    let content = fs.readFileSync(clientPath, 'utf8');
    let modified = false;
    if (content.includes('ws.send(JSON.stringify(data));')) {
      content = content.replace('ws.send(JSON.stringify(data));', 'ws?.send?.(JSON.stringify(data));');
      modified = true;
    }
    if (content.includes('error: (err) => console.error("[vite]", err),')) {
      content = content.replace(
        'error: (err) => console.error("[vite]", err),',
        'error: (err) => { if (err && (String(err).includes("send") || String(err).includes("WebSocket"))) return; console.error("[vite]", err); },'
      );
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(clientPath, content, 'utf8');
    }
  }
} catch {
  // Ignore
}

export default defineConfig(() => {
  return {
    plugins: [
      react({
        fastRefresh: false,
      }),
      tailwindcss(),
      VitePWA({
        disable: process.env.NODE_ENV !== 'production',
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'RK STUDY CENTRE',
          short_name: 'RK Study',
          description: 'बिहार बोर्ड एवं माध्यमिक शिक्षा मंच - कक्षा 9वीं से 12वीं के संपूर्ण नोट्स और टेस्ट',
          theme_color: '#1e3a8a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json,mjs}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'document',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'rk-document-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                networkTimeoutSeconds: 3,
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'rk-static-assets-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'study-materials-storage-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false,
    },
  };
});
