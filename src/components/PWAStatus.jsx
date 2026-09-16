import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw, X, Share } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // iOS prompt state
  const [showIosTip, setShowIosTip] = useState(false);

  // Service worker update registration
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SmileGuard PWA Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('SmileGuard PWA SW registration error:', error);
    },
  });

  // Handle Online / Offline Events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA BeforeInstallPrompt Event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowInstallBanner(false);
    }

    // Detect iOS safari non-standalone
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos && !isStandalone) {
      setShowIosTip(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('smileguard_pwa_install_dismissed', 'true');
  };

  const handleDismissIosTip = () => {
    setShowIosTip(false);
    localStorage.setItem('smileguard_ios_install_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none">

      
      {/* 1. Offline Alert Toast */}
      {!isOnline && (
        <div className="pointer-events-auto bg-amber-900/95 text-amber-100 border border-amber-700/80 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-800/80 text-amber-300 shrink-0">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">You are currently offline</p>
              <p className="text-[11px] text-amber-200/90 font-medium">Some features (e.g. AI diagnostics) may be unavailable.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reconnected Online Toast */}
      {isOnline && showOnlineToast && (
        <div className="pointer-events-auto bg-emerald-950/95 text-emerald-100 border border-emerald-700/80 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900/80 text-emerald-300 shrink-0">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">You are back online</p>
              <p className="text-[11px] text-emerald-200/90 font-medium">Connection restored to SmileGuard AI services.</p>
            </div>
          </div>
          <button
            onClick={() => setShowOnlineToast(false)}
            className="p-1 text-emerald-400 hover:text-white rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Service Worker New Version Update Banner */}
      {needRefresh && (
        <div className="pointer-events-auto bg-slate-900/95 text-white border border-teal-500/50 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">App Update Available</p>
                <p className="text-[11px] text-slate-300">New version of SmileGuard AI is available.</p>
              </div>
            </div>
            <button
              onClick={() => setNeedRefresh(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => updateServiceWorker(true)}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Update Now
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* 4. Native Install Prompt Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="pointer-events-auto bg-slate-900/95 text-white border border-blue-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <img
                src="/assets/SmileGuard_AI_Logo.svg"
                alt="SmileGuard AI Logo"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-white">Install SmileGuard AI</p>
                <p className="text-[11px] text-slate-300 leading-tight">Get faster access from your home screen.</p>
              </div>
            </div>
            <button
              onClick={handleDismissInstall}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Dismiss install banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
            <button
              onClick={handleDismissInstall}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 5. iOS Safari Install Instructions */}
      {showIosTip && (
        <div className="pointer-events-auto bg-slate-900/95 text-white border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                <Share className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Install on iOS</p>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Tap <span className="font-semibold text-white">Share</span> <Share className="inline h-3 w-3 text-blue-400" /> then <span className="font-semibold text-white">"Add to Home Screen"</span>.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissIosTip}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close iOS install tip"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
