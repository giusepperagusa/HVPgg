/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * PWA Context & Service Worker Lifecycle Management
 * Handles offline execution, service worker precaching, in-app installation,
 * and automated online update detection with controlled skip-waiting reload.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

export const APP_CURRENT_VERSION = '1.3.0';

export interface PWAContextType {
  // Connectivity
  isOnline: boolean;

  // Installation
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  installApp: () => Promise<boolean>;
  showIOSGuide: boolean;
  setShowIOSGuide: (show: boolean) => void;

  // Offline Readiness
  isOfflineReady: boolean;
  dismissOfflineReady: () => void;

  // Update Lifecycle
  isUpdateAvailable: boolean;
  updateVersion: string | null;
  currentVersion: string;
  applyUpdate: () => void;
  dismissUpdate: () => void;
  checkForUpdate: (isManual?: boolean) => Promise<{ hasUpdate: boolean; message: string }>;
  isCheckingUpdate: boolean;
  updateCheckMessage: string | null;
  lastUpdateCheck: Date | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Connectivity state
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Install states
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  // Update & Offline states
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateCheckMessage, setUpdateCheckMessage] = useState<string | null>(null);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null);

  // References to active registration and waiting worker
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const isRefreshingRef = useRef<boolean>(false);

  // Detect standalone mode and iOS
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Monitor online / offline network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-check for updates when reconnecting to network
      void checkForUpdate(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to compare semver versions
  const isNewerVersion = (remoteVer: string, currentVer: string): boolean => {
    if (!remoteVer || remoteVer === currentVer) return false;
    const parse = (v: string) => v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    const r = parse(remoteVer);
    const c = parse(currentVer);
    for (let i = 0; i < Math.max(r.length, c.length); i++) {
      const remotePart = r[i] || 0;
      const currentPart = c[i] || 0;
      if (remotePart > currentPart) return true;
      if (remotePart < currentPart) return false;
    }
    return false;
  };

  // Register Service Worker and set up lifecycle hooks
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Reload page only once when new service worker takes over control
    const handleControllerChange = () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Register service worker with relative path for subpath compatibility
    // In dev mode, vite-plugin-pwa serves dev-sw.js with type: 'module'
    // In production, workbox compiles ./sw.js with updateViaCache: 'none'
    const swUrl = import.meta.env.DEV ? './dev-sw.js?dev-sw' : './sw.js';
    const swOptions: RegistrationOptions = import.meta.env.DEV
      ? { scope: './', type: 'module' }
      : { scope: './', updateViaCache: 'none' };

    navigator.serviceWorker
      .register(swUrl, swOptions)
      .then((registration) => {
        swRegistrationRef.current = registration;

        // 1. If there's already a waiting service worker
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setIsUpdateAvailable(true);
        }

        // 2. Listen for updatefound (new SW being downloaded/installed)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // An old controller exists -> this is an UPDATE!
                waitingWorkerRef.current = newWorker;
                setIsUpdateAvailable(true);
                setUpdateCheckMessage('A new version of SUSE EIB Assistant is downloaded and ready to activate!');
              } else {
                // First-time precache completed -> offline ready!
                setIsOfflineReady(true);
              }
            }
          });
        });

        // Initial check after 3 seconds of idle time
        const timer = setTimeout(() => {
          void checkForUpdate(false);
        }, 3000);

        return () => clearTimeout(timer);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Periodic update check every 15 minutes when online and page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible') {
        void checkForUpdate(false);
      }
    }, 15 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void checkForUpdate(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Core Check for Updates function (manual or automated)
  const checkForUpdate = useCallback(
    async (isManual = false): Promise<{ hasUpdate: boolean; message: string }> => {
      if (!navigator.onLine) {
        const msg = `Offline Mode: You are running version ${APP_CURRENT_VERSION} from local cache. Internet connection is required to check for updates.`;
        if (isManual) setUpdateCheckMessage(msg);
        return { hasUpdate: false, message: msg };
      }

      if (isManual) {
        setIsCheckingUpdate(true);
        setUpdateCheckMessage('Checking online server for newer releases...');
      }

      setLastUpdateCheck(new Date());

      try {
        // Step 1: Check remote version.json with cache bust
        let remoteVersion: string | null = null;
        try {
          const versionRes = await fetch(`./version.json?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
          });
          if (versionRes.ok) {
            const data = await versionRes.json();
            if (data && typeof data.version === 'string') {
              remoteVersion = data.version;
            }
          }
        } catch {
          // Version manifest fetch failed or air-gapped
        }

        // Step 2: Trigger service worker byte-check
        if (swRegistrationRef.current) {
          await swRegistrationRef.current.update();
        }

        // Step 3: Check if a worker is already waiting
        if (swRegistrationRef.current?.waiting) {
          waitingWorkerRef.current = swRegistrationRef.current.waiting;
          setIsUpdateAvailable(true);
          if (remoteVersion) setUpdateVersion(remoteVersion);
          const msg = `Update Available: Version ${remoteVersion || 'newer'} is downloaded and ready to apply!`;
          setUpdateCheckMessage(msg);
          setIsCheckingUpdate(false);
          return { hasUpdate: true, message: msg };
        }

        // Step 4: Compare versions if remoteVersion was found
        if (remoteVersion && isNewerVersion(remoteVersion, APP_CURRENT_VERSION)) {
          setUpdateVersion(remoteVersion);
          setIsUpdateAvailable(true);
          const msg = `Update Available: Version ${remoteVersion} was detected on the server! Click Update Now to reload.`;
          setUpdateCheckMessage(msg);
          setIsCheckingUpdate(false);
          return { hasUpdate: true, message: msg };
        }

        // Everything up to date!
        const msg = `Up to date: You are running the latest version (${APP_CURRENT_VERSION}). All assets are cached offline.`;
        if (isManual) setUpdateCheckMessage(msg);
        setIsCheckingUpdate(false);
        return { hasUpdate: false, message: msg };
      } catch (err) {
        const msg = `Could not verify updates: ${err instanceof Error ? err.message : 'Unknown network issue'}`;
        if (isManual) setUpdateCheckMessage(msg);
        setIsCheckingUpdate(false);
        return { hasUpdate: false, message: msg };
      }
    },
    []
  );

  // Apply Update: instruct waiting service worker to skip waiting and claim clients
  const applyUpdate = useCallback(() => {
    // Send message to waiting worker if present
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
    } else if (swRegistrationRef.current?.waiting) {
      swRegistrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: hard reload if no waiting worker reference
      window.location.reload();
    }
  }, []);

  // Dismiss notification
  const dismissUpdate = useCallback(() => {
    setIsUpdateAvailable(false);
  }, []);

  const dismissOfflineReady = useCallback(() => {
    setIsOfflineReady(false);
  }, []);

  // Trigger PWA Installation prompt
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[PWA] Installation prompt error:', err);
      return false;
    }
  }, [deferredPrompt, isIOS]);

  return (
    <PWAContext.Provider
      value={{
        isOnline,
        isInstalled,
        isInstallable: !!deferredPrompt,
        isIOS,
        installApp,
        showIOSGuide,
        setShowIOSGuide,
        isOfflineReady,
        dismissOfflineReady,
        isUpdateAvailable,
        updateVersion,
        currentVersion: APP_CURRENT_VERSION,
        applyUpdate,
        dismissUpdate,
        checkForUpdate,
        isCheckingUpdate,
        updateCheckMessage,
        lastUpdateCheck,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
