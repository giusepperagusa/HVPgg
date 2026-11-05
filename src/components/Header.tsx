/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Header component with SUSE Edge branding, theme toggle, and PWA install button.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Sun,
  Moon,
  Eye,
  Laptop,
  BookOpen,
  Info,
  Wifi,
  WifiOff,
  CheckCircle2,
  Share2,
  RefreshCw,
  Sparkles,
  FolderGit2,
} from 'lucide-react';
import { EnvironmentMode } from '../types/eib';
import { ThemeMode } from '../hooks/useTheme';
import { usePWA } from '../context/PWAContext';

interface HeaderProps {
  environmentMode: EnvironmentMode;
  themeMode: ThemeMode;
  activeProfileName?: string;
  onOpenProfiles?: () => void;
  onThemeChange: (mode: ThemeMode) => void;
  onOpenDocs: () => void;
  onOpenAbout: () => void;
  onQuickExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  environmentMode,
  themeMode,
  activeProfileName,
  onOpenProfiles,
  onThemeChange,
  onOpenDocs,
  onOpenAbout,
  onQuickExport,
}) => {
  const {
    isOnline,
    isInstalled,
    isInstallable,
    isIOS,
    installApp,
    setShowIOSGuide,
    isUpdateAvailable,
    updateVersion,
    checkForUpdate,
    isCheckingUpdate,
    updateCheckMessage,
    currentVersion,
  } = usePWA();
  const [showStatusToast, setShowStatusToast] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/60 border border-emerald-500/40 shadow-inner shrink-0">
            <svg
              className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M192 32 L336 115 L336 281 L192 364 L48 281 L48 115 Z"
                stroke="currentColor"
                strokeWidth="28"
                strokeLinejoin="round"
              />
              <circle cx="192" cy="198" r="44" fill="currentColor" />
              <circle cx="192" cy="32" r="24" fill="#30BA78" />
              <circle cx="336" cy="281" r="24" fill="#30BA78" />
              <circle cx="48" cy="281" r="24" fill="#30BA78" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-white truncate">
                Edge Image Builder <span className="text-emerald-400 font-mono">PEA</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Community
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block truncate">
              Provisioning Assistant for SUSE EIB (v1.3.1)
            </p>
          </div>
        </div>

        {/* Status badges & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Profile Switcher / Manager Button */}
          {onOpenProfiles && (
            <button
              onClick={onOpenProfiles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition group"
              title={`Active Profile: ${activeProfileName || 'Default'}. Click to manage, save, export, or import profiles.`}
              aria-label="Open Configuration Profiles Manager"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-slate-400">Profile:</span>
              <span className="max-w-[110px] truncate font-bold text-white group-hover:text-emerald-300">
                {activeProfileName || 'Default'}
              </span>
            </button>
          )}

          {/* Mode Pill Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              environmentMode === 'commercial'
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                environmentMode === 'commercial' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {environmentMode === 'commercial' ? 'Commercial (SLE Micro)' : 'Free (openSUSE Leap Micro)'}
          </div>

          {/* Connectivity Pill */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-800/80 border-slate-700 text-slate-300"
            title={isOnline ? 'Online (Client-Side Safe)' : 'Offline Mode (PWA Cached)'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">Offline PWA</span>
              </>
            )}
          </div>

          {/* Standalone Local App Badge */}
          {isInstalled && (
            <div
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
              title="Running as installed local PWA application"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Installed App</span>
            </div>
          )}

          {/* Check for Updates Button */}
          <button
            onClick={async () => {
              const res = await checkForUpdate(true);
              setShowStatusToast(true);
              setTimeout(() => setShowStatusToast(false), 4500);
            }}
            disabled={isCheckingUpdate}
            className={`relative p-2 rounded-lg transition ${
              isUpdateAvailable
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title={
              isUpdateAvailable
                ? `Update v${updateVersion || 'new'} ready! Click to apply`
                : `Check for Online Updates (Running v${currentVersion})`
            }
            aria-label="Check for Online Updates"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin text-emerald-400' : ''}`} />
            {isUpdateAvailable && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={() => void installApp()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition active:scale-95"
              aria-label="Install EIB Assistant as Progressive Web App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 transition"
              aria-label="Install instructions for iOS Safari"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Add to Home</span>
            </button>
          )}

          {/* Theme selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700">
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-md transition ${
                themeMode === 'dark' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-md transition ${
                themeMode === 'light' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Light Mode"
              aria-label="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('contrast')}
              className={`p-1.5 rounded-md transition ${
                themeMode === 'contrast' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="High Visibility / Contrast Mode"
              aria-label="High Visibility / Contrast Mode"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('system')}
              className={`p-1.5 rounded-md transition ${
                themeMode === 'system' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="System Auto"
              aria-label="System Auto Theme"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Docs Modal Button */}
          <button
            onClick={onOpenDocs}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Documentation & Air-Gap Architecture"
            aria-label="Open Documentation Modal"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* About / AGPL-3.0 Modal Button */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="About EIB-PEA & AGPL-3.0 License"
            aria-label="Open About and License Modal"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Update Check Feedback Toast */}
      {showStatusToast && (
        <div className="absolute top-full right-4 sm:right-8 mt-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white max-w-sm flex items-center gap-2.5 animate-fadeIn z-50">
          <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{updateCheckMessage || `Checked for updates: Running v${currentVersion}`}</span>
        </div>
      )}
    </header>
  );
};
