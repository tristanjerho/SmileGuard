import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        host: true,
        port: 5173,
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'assets/SmileGuard_AI_Logo.svg', 'SmileGuard_AI_Logo.svg'],
            manifest: {
                name: 'SmileGuard AI',
                short_name: 'SmileGuard',
                description: 'AI-Assisted Smart Dental Clinic Management and Clinical Decision Support System',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait',
                theme_color: '#0F1420',
                background_color: '#0F1420',
                icons: [
                    {
                        src: '/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/],
                runtimeCaching: [
                    {
                        // Exclude all Firebase Auth, Firestore, and Storage requests from caching
                        urlPattern: /^https:\/\/(firestore|identitytoolkit|firebasestorage)\.googleapis\.com\/.*/i,
                        handler: 'NetworkOnly'
                    },
                    {
                        // Exclude Render API endpoints from SW caching
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkOnly'
                    },
                    {
                        // Cache Google Fonts
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Cache static assets shell
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-assets-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    }
                ]
            }
        })
    ],
});

