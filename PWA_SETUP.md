# SmileGuard AI - Progressive Web App (PWA) Setup & Architecture Guide

This document outlines the Progressive Web App (PWA) architecture, service worker caching policy, privacy guidelines, installation instructions, and deployment workflow for **SmileGuard AI**.

---

## 1. Overview & Key Principles

SmileGuard AI is an **AI-Assisted Smart Dental Clinic Management and Clinical Decision Support System**.
Converting the frontend into a Progressive Web App allows clinicians and patients to install SmileGuard AI directly onto their desktop (Windows/macOS) or mobile devices (Android/iOS) to experience a fast, native application interface.

### Important Architectural Boundaries:
- **Server-Side AI Inference**: AI model predictions (EfficientNetB0 CNN + Grad-CAM) **always** run on the Render FastAPI backend. The PWA does **not** attempt offline AI inference.
- **Privacy-First Caching**: Only static application shell resources (HTML, CSS, JavaScript, fonts, icons) are cached. **No clinical data, patient records, X-ray images, AI diagnostic results, or Firebase tokens are ever cached offline by the service worker.**

---

## 2. Changes Implemented

| Category | File | Description |
| :--- | :--- | :--- |
| **Dependencies** | `package.json` | Installed `vite-plugin-pwa` for automated PWA asset build and service worker generation. |
| **Config** | `vite.config.js` | Configured `VitePWA` with manifest metadata (`SmileGuard AI`, `standalone`, theme color `#0B132B`) and Workbox privacy-first `runtimeCaching` rules. |
| **Meta & Loading** | `index.html` | Added PWA viewport cover meta tags, mobile web app status bar tags, touch icons, and an instant HTML app-shell loading screen. |
| **PWA Icons** | `public/` | Generated `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`, `favicon.svg`, `favicon.ico`, and maskable icon assets. |
| **PWA Component** | `src/components/PWAStatus.jsx` | Created modular component for online/offline detection, install prompt banner, iOS installation tips, and smooth PWA update alerts. |
| **Root Layout** | `App.jsx` | Rendered `<PWAStatus />` globally within `<AuthProvider>`. |
| **AI Protection** | `AiDiagnostic.jsx` | Added offline check: displays *"AI analysis requires an internet connection."* if offline. |
| **Safe Area CSS** | `src/index.css` | Added `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe` utility classes for notch and home-bar support. |

---

## 3. Service Worker & Caching Policy

The service worker is powered by Workbox via `vite-plugin-pwa`.

### What IS Cached:
- Static JS bundles (`/assets/*.js`)
- Static CSS stylesheets (`/assets/*.css`)
- Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)
- Application logos and favicons (`pwa-192x192.png`, `pwa-512x512.png`, `favicon.svg`)
- Application shell (`/index.html`)

### What IS NOT Cached (Network Only):
- **Cloud Firestore APIs**: `https://firestore.googleapis.com/*`
- **Firebase Authentication APIs**: `https://identitytoolkit.googleapis.com/*`
- **Firebase Storage APIs**: `https://firebasestorage.googleapis.com/*`
- **Render AI Backend Endpoints**: `/api/predict`, `/api/health`, `/api/model-info`, `/api/review`
- **Patient Records & Dental X-rays**: Never stored in service worker caches.

---

## 4. Offline Experience

When internet connectivity is lost:
1. **Offline Toast Banner**: Displays a non-intrusive banner: *"You are currently offline. Some features may be unavailable."*
2. **App Shell Availability**: The UI, navigation, and cached static views remain functional.
3. **AI Diagnostic Safety**: If a user attempts to upload an X-ray or run AI analysis while offline, the app displays *"AI analysis requires an internet connection."* without throwing unhandled network crashes.
4. **Reconnection Notification**: When connectivity is restored, the app displays *"You are back online."* for 4 seconds.

---

## 5. PWA Installation Experience

### Desktop (Chrome / Edge / Windows / macOS):
- Browsers display the native install icon in the address bar or present the custom `Install SmileGuard AI` banner.
- Clicking **[Install]** installs SmileGuard AI into the operating system app menu/desktop.

### Android (Chrome / Edge):
- Displays the custom `Install SmileGuard AI` banner at the bottom of the screen.
- User clicks **[Install]** to add the application to the Android app drawer and home screen.
- Dismissal state is saved to `localStorage` so the prompt does not repeatedly bug the user.

### iPhone / iPad (Safari):
- Safari does not support the web `beforeinstallprompt` event.
- The app displays a contextual tip: *"To install SmileGuard AI: Tap Share → Add to Home Screen."*
- Easily dismissible by the user.

---

## 6. Service Worker Updates

When a new version of the frontend is deployed:
- The service worker detects the new build asset manifest.
- Displays a banner: *"New version of SmileGuard AI is available."*
- Buttons:
  - **[Update Now]**: Triggers `updateServiceWorker(true)`, activating the new service worker and refreshing the page cleanly.
  - **[Later]**: Postpones update so clinicians do not lose unsaved patient form entries.

---

## 7. How to Test & Validate

### 1. Build Verification:
```bash
npm run build
```
Verify that the `dist/` directory contains:
- `dist/manifest.webmanifest`
- `dist/sw.js`
- `dist/workbox-*.js`
- `dist/pwa-192x192.png`
- `dist/pwa-512x512.png`

### 2. Previewing Locally:
```bash
npm run preview
```
Open `http://localhost:4173` in Google Chrome:
1. Open Chrome DevTools (`F12`) -> **Application** tab.
2. Check **Manifest**: Verify Name (`SmileGuard AI`), Short name (`SmileGuard`), Icons, Theme Color, Start URL.
3. Check **Service Workers**: Verify `sw.js` is active and running.
4. Test **Offline Mode**: Check the "Offline" checkbox in DevTools Network tab. Verify the offline notification banner appears and AI diagnostic displays *"AI analysis requires an internet connection."*.

---

## 8. Vercel & Render Deployment

### Frontend (Vercel):
- Simply push the updated repository to GitHub/Vercel.
- Vercel will automatically build Vite and serve the generated PWA manifest and service worker with proper MIME types.

### Backend (Render):
- The FastAPI backend deployment remains unchanged on Render (`VITE_API_URL`).
- All AI prediction requests route directly from the PWA client to Render.
