/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Interactive PWA Update Notification, Offline Banner, and iOS Install Modal.
 * Empowers users to immediately detect, verify, and apply service worker updates.
 */

import React, { useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  X,
  WifiOff,
  CheckCircle,
  Share,
  PlusSquare,
  ArrowRight,
  HardDriveDownload,
  AlertCircle,
} from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import { useModalDismiss } from '../hooks/useModalDismiss';

export const PWAUpdateNotification: React.FC = () => {
  const {
    isOnline,
    isOfflineReady,
    dismissOfflineReady,
    isUpdateAvailable,
    updateVersion,
    currentVersion,
    applyUpdate,
    dismissUpdate,
    showIOSGuide,
    setShowIOSGuide,
  } = usePWA();

  useModalDismiss(showIOSGuide, () => setShowIOSGuide(false));

  // Auto-dismiss offline ready notification after 7 seconds
  useEffect(() => {
    if (isOfflineReady) {
      const timer = setTimeout(() => {
        dismissOfflineReady();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isOfflineReady, dismissOfflineReady]);

  return (
    <>
      {/* 1. NEW UPDATE AVAILABLE BANNER */}
      {isUpdateAvailable && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 animate-bounce-subtle"
        >
          <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-emerald-500/80 shadow-2xl backdrop-blur-xl text-white flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">App Update Available</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                      v{updateVersion || 'Latest'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    A newer release has been downloaded and is ready to activate.
                  </p>
                </div>
              </div>

              <button
                onClick={dismissUpdate}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition shrink-0"
                aria-label="Dismiss update notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              Current: <span className="font-mono text-slate-300">v{currentVersion}</span> • Target:{' '}
              <span className="font-mono text-emerald-400 font-bold">v{updateVersion || 'newest'}</span>.
              Reloading will immediately update the local offline cache.
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={dismissUpdate}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Later
              </button>
              <button
                onClick={applyUpdate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Update & Reload Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FIRST-TIME OFFLINE READY TOAST */}
      {isOfflineReady && !isUpdateAvailable && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 max-w-sm animate-fadeIn"
        >
          <div className="p-3.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 shadow-xl backdrop-blur-md text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Cached for Offline Use</p>
                <p className="text-[11px] text-slate-300">
                  SUSE EIB Assistant is now 100% functional without internet connectivity.
                </p>
              </div>
            </div>
            <button
              onClick={dismissOfflineReady}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition shrink-0"
              aria-label="Dismiss offline ready toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. OFFLINE STATUS BANNER (When Disconnected) */}
      {!isOnline && (
        <aside
          role="status"
          aria-label="Offline Mode Status"
          className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>
            <strong>Offline Mode Active:</strong> HVPgg Wizard is running entirely from local device cache. All recipe configurations and ZIP export tools are fully operational.
          </span>
        </aside>
      )}

      {/* 4. IOS SAFARI INSTALLATION GUIDANCE MODAL */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <HardDriveDownload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Install on iPad / iPhone</h3>
                  <p className="text-[11px] text-slate-400">Run HVPgg Wizard as a native app</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                aria-label="Close iOS guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-200">Tap the Share Button</p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    Located in Safari's bottom toolbar on iPhone or top bar on iPad:{' '}
                    <Share className="w-3.5 h-3.5 text-blue-400 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-200">Select "Add to Home Screen"</p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    Scroll down the options list and tap{' '}
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-200">Tap "Add" in Top Right</p>
                  <p className="text-slate-400 text-[11px]">
                    The app icon will be pinned to your home screen for instant full-screen offline access.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
