/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * About & Legal Modal with AGPL-3.0 License text, official references,
 * package dependency license catalog, and full changelog viewer.
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Package,
  History,
  Search,
  Sparkles,
  RefreshCw,
  Wifi,
  WifiOff,
  HardDrive,
  Download,
  Trash2,
} from 'lucide-react';
import { generateLicenseText, generateChangelogMarkdown } from '../utils/eibGenerator';
import { usePWA } from '../context/PWAContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PackageInfo {
  name: string;
  version: string;
  license: string;
  category: 'runtime' | 'dev' | 'cdn';
  purpose: string;
  homepage?: string;
  sri?: string;
}

const PACKAGES_CATALOG: PackageInfo[] = [
  // Runtime Dependencies
  {
    name: 'react',
    version: '19.0.1',
    license: 'MIT',
    category: 'runtime',
    purpose: 'Core declarative UI rendering framework & hooks architecture',
    homepage: 'https://react.dev',
  },
  {
    name: 'react-dom',
    version: '19.0.1',
    license: 'MIT',
    category: 'runtime',
    purpose: 'DOM rendering engine for React client tree',
    homepage: 'https://react.dev',
  },
  {
    name: 'jszip',
    version: '3.10.1',
    license: 'MIT / GPLv3 dual',
    category: 'runtime',
    purpose: 'In-browser compression and compilation of structured ZIP workspace bundles',
    homepage: 'https://stuk.github.io/jszip/',
  },
  {
    name: 'js-yaml',
    version: '4.1.0',
    license: 'MIT',
    category: 'runtime',
    purpose: 'YAML parser & serializer for EIB definition.yaml and NMState network profiles',
    homepage: 'https://github.com/nodeca/js-yaml',
  },
  {
    name: 'lucide-react',
    version: '0.546.0',
    license: 'ISC',
    category: 'runtime',
    purpose: 'Lightweight SVG system iconography and accessibility graphics',
    homepage: 'https://lucide.dev',
  },
  {
    name: 'motion',
    version: '12.23.24',
    license: 'MIT',
    category: 'runtime',
    purpose: 'Hardware-accelerated fluid transitions and accessible UI animations',
    homepage: 'https://motion.dev',
  },
  {
    name: '@google/genai',
    version: '2.4.0',
    license: 'Apache-2.0',
    category: 'runtime',
    purpose: 'Official Google GenAI SDK interface',
    homepage: 'https://github.com/googleapis/genai-js',
  },
  {
    name: 'express',
    version: '4.21.2',
    license: 'MIT',
    category: 'runtime',
    purpose: 'Server-side Node.js micro-framework (for full-stack dev/preview hosting)',
    homepage: 'https://expressjs.com',
  },
  {
    name: 'dotenv',
    version: '17.2.3',
    license: 'BSD-2-Clause',
    category: 'runtime',
    purpose: 'Zero-dependency environment variables loader',
    homepage: 'https://github.com/motdotla/dotenv',
  },

  // CDN Libraries with Subresource Integrity (SRI)
  {
    name: 'JSZip (CDN)',
    version: '3.10.1',
    license: 'MIT / GPLv3 dual',
    category: 'cdn',
    purpose: 'Pinned standalone CDN fallback loaded in index.html head with strict SRI hash',
    homepage: 'https://cdnjs.com/libraries/jszip',
    sri: 'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG',
  },
  {
    name: 'js-yaml (CDN)',
    version: '4.1.0',
    license: 'MIT',
    category: 'cdn',
    purpose: 'Pinned standalone CDN fallback loaded in index.html head with strict SRI hash',
    homepage: 'https://cdnjs.com/libraries/js-yaml',
    sri: 'sha384-+pxiN6T7yvpryuJmE1gM9PX7yQit15auDb+ZwwvJOd/4be2Cie5/IuVXgQb/S9du',
  },

  // Build & Developer Dependencies
  {
    name: 'vite',
    version: '8.3.0',
    license: 'MIT',
    category: 'dev',
    purpose: 'Next-generation ES module frontend bundler and development server',
    homepage: 'https://vite.dev',
  },
  {
    name: 'tailwindcss & @tailwindcss/vite',
    version: '4.3.3',
    license: 'MIT',
    category: 'dev',
    purpose: 'Modern utility-first CSS engine with dark & high-contrast accessibility support',
    homepage: 'https://tailwindcss.com',
  },
  {
    name: 'vite-plugin-pwa',
    version: '1.2.0',
    license: 'MIT',
    category: 'dev',
    purpose: 'Progressive Web App generator, service worker precaching, and manifest loader',
    homepage: 'https://vite-pwa-org.netlify.app',
  },
  {
    name: 'typescript',
    version: '7.0.2',
    license: 'Apache-2.0',
    category: 'dev',
    purpose: 'Static type checking and interface contracts across all EIB modules',
    homepage: 'https://www.typescriptlang.org',
  },
  {
    name: 'tsx',
    version: '4.21.0',
    license: 'MIT',
    category: 'dev',
    purpose: 'TypeScript execution engine for node:test unit test runner',
    homepage: 'https://tsx.is',
  },
  {
    name: 'esbuild',
    version: '0.28.0',
    license: 'MIT',
    category: 'dev',
    purpose: 'Ultra-fast Go-based JavaScript/TypeScript bundler & minifier',
    homepage: 'https://esbuild.github.io',
  },
  {
    name: 'autoprefixer',
    version: '10.4.21',
    license: 'MIT',
    category: 'dev',
    purpose: 'PostCSS plugin to parse CSS and add vendor prefixes automatically',
    homepage: 'https://github.com/postcss/autoprefixer',
  },
];

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'about' | 'dependencies' | 'changelog' | 'references' | 'license'
  >('about');
  const [copiedLicense, setCopiedLicense] = useState(false);
  const [packageSearch, setPackageSearch] = useState('');
  const [packageFilter, setPackageFilter] = useState<'all' | 'runtime' | 'dev' | 'cdn'>('all');
  const [clearingCache, setClearingCache] = useState(false);

  const {
    isOnline,
    isInstalled,
    isInstallable,
    isIOS,
    installApp,
    setShowIOSGuide,
    isUpdateAvailable,
    updateVersion,
    currentVersion,
    applyUpdate,
    checkForUpdate,
    isCheckingUpdate,
    updateCheckMessage,
    lastUpdateCheck,
  } = usePWA();

  if (!isOpen) return null;

  const licenseText = generateLicenseText();
  const changelogText = generateChangelogMarkdown();

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(licenseText);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  const handleClearCacheAndReload = async () => {
    if (!window.confirm('This will unregister the service worker, clear offline CacheStorage, and reload the application from the server. Proceed?')) {
      return;
    }
    setClearingCache(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      window.location.reload();
    } catch (err) {
      console.error('Failed clearing caches:', err);
      window.location.reload();
    }
  };

  const filteredPackages = PACKAGES_CATALOG.filter((pkg) => {
    const matchesCategory = packageFilter === 'all' || pkg.category === packageFilter;
    const matchesSearch =
      pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.license.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.purpose.toLowerCase().includes(packageSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">About Edge Image Builder Assistant</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  v1.3.3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Independent Community Provisioning & Execution Assistant for SUSE Edge Image Builder
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 overflow-x-auto shrink-0 min-h-[44px]">
          {[
            { id: 'about', label: 'Architecture & Specs' },
            { id: 'dependencies', label: 'Dependencies & Licenses' },
            { id: 'changelog', label: 'Full Changelog' },
            { id: 'references', label: 'Official Docs & Links' },
            { id: 'license', label: 'AGPL-3.0 License' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap shrink-0 transition ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 leading-relaxed text-xs">
              {/* Important Disclaimer Notice */}
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200/90 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Important Notice & Legal Disclaimer</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  This project is an independent community development tool and is <strong>neither affiliated with nor officially endorsed by SUSE</strong>. No explicit or implied support path is provided. While compatible with SUSE Customer Center (SCC) credentials, the <strong>actual supportability of resulting build artifacts and installed systems must be verified directly with SUSE</strong>.
                </p>
              </div>

              <p>
                The <strong>Edge Image Builder Provisioning & Execution Assistant (EIB-PEA)</strong> is an independent, stateless, client-side Progressive Web Application designed for security architects, DevOps engineers, and edge platform administrators preparing configuration recipes for SUSE Edge Image Builder (EIB).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Stateless & Supply-Chain Hardened
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    No external server or database telemetry. All configuration state, cryptographic hashes, and ZIP compilation happen inside your browser memory.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Universal Subpath Publishing
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Configured with relative asset baselines (<code className="font-mono text-emerald-300">./</code>) allowing zero-config hosting in any subdirectory on any generic web server.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Multi-Arch Cross-Emulation
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Build ARM64 (aarch64) images directly on x86_64 hosts via integrated QEMU user-static binfmt registration in the generated <code className="font-mono">build.sh</code> runner.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Upstream Kiwi Pre-Patching
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Derive freshly updated base ISOs with containerized SUSE Kiwi before applying EIB customizations.
                  </p>
                </div>
              </div>

              {/* PWA Offline & Online Update System Card */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-700/80 space-y-3 mt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">PWA Offline & Online Update System</h4>
                      <p className="text-[11px] text-slate-400">
                        Zero-cloud architecture with local caching and automated version detection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Version: {currentVersion}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                        isOnline
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                          : 'bg-amber-950/60 text-amber-300 border-amber-700/40'
                      }`}
                    >
                      {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                      {isOnline ? 'Online' : 'Offline Mode'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Installation</span>
                    <span className="text-slate-200 font-medium">
                      {isInstalled ? 'Installed as Local App' : isInstallable ? 'Installable (PWA Ready)' : 'Standard Web Browser'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Cache State</span>
                    <span className="text-emerald-400 font-medium">
                      Precached in Service Worker
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Last Update Check</span>
                    <span className="text-slate-300 font-mono">
                      {lastUpdateCheck ? lastUpdateCheck.toLocaleTimeString() : 'On startup'}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                {updateCheckMessage && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 shrink-0 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{updateCheckMessage}</span>
                  </div>
                )}

                {/* Update Available Action Prompt */}
                {isUpdateAvailable && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-3">
                    <div className="text-xs text-emerald-200">
                      <strong>New Release Ready:</strong> Version {updateVersion || 'newer'} has been downloaded and is waiting in cache.
                    </div>
                    <button
                      onClick={applyUpdate}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Apply & Reload
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void checkForUpdate(true)}
                      disabled={isCheckingUpdate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                      <span>{isCheckingUpdate ? 'Checking Server...' : 'Check for Updates Now'}</span>
                    </button>

                    {!isInstalled && isInstallable && (
                      <button
                        onClick={() => void installApp()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Install Local App</span>
                      </button>
                    )}

                    {!isInstalled && isIOS && (
                      <button
                        onClick={() => setShowIOSGuide(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 transition"
                      >
                        <span>iOS Install Guide</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleClearCacheAndReload}
                    disabled={clearingCache}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                    title="Force unregisters service worker and clears local CacheStorage"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{clearingCache ? 'Resetting...' : 'Clear Cache & Reset'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPENDENCIES & LICENSES */}
          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search package or license..."
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  {(['all', 'runtime', 'cdn', 'dev'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPackageFilter(cat)}
                      className={`px-2.5 py-1 rounded-md capitalize transition font-medium ${
                        packageFilter === cat
                          ? 'bg-slate-800 text-emerald-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'cdn' ? 'CDN / SRI' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Table */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-850 text-slate-400 font-semibold sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Package / Tool</th>
                        <th className="py-2.5 px-3">Version</th>
                        <th className="py-2.5 px-3">License</th>
                        <th className="py-2.5 px-3">Purpose & Security</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg.name} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-white flex items-center gap-1.5">
                            <span>{pkg.name}</span>
                            {pkg.homepage && (
                              <a
                                href={pkg.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-emerald-400"
                                title="Visit documentation"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400">
                            {pkg.version}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                              {pkg.license}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 leading-normal">
                            <p>{pkg.purpose}</p>
                            {pkg.sri && (
                              <code className="text-[10px] font-mono text-cyan-300/80 block mt-0.5 break-all">
                                SRI: {pkg.sri}
                              </code>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Total analyzed packages: {filteredPackages.length} • All packages are vetted for enterprise distribution and GPL/MIT compatibility under AGPL-3.0.
              </p>
            </div>
          )}

          {/* TAB 3: FULL CHANGELOG */}
          {activeTab === 'changelog' && (
            <div className="space-y-6">
              {/* Release 1.3.3 */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.3.3</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                      Latest Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-06</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    openSUSE Leap 16.1 Immutable Mode Integration
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>openSUSE Leap 16.1 Immutable Base OS:</strong> Shifted Free Mode baseline from Leap Micro to openSUSE Leap in immutable mode (available since 16.1) with transactional-update and btrfs snapshot architectures.
                    </li>
                    <li>
                      <strong>SUSE Kiwi Pre-Patching Update:</strong> Updated Kiwi appliance description (<code className="font-mono text-cyan-300">kiwi-config/config.xml</code>) to include transactional-update packages (<code className="font-mono text-cyan-300">patterns-base-transactional</code>, <code className="font-mono text-cyan-300">transactional-update</code>, <code className="font-mono text-cyan-300">btrfsprogs</code>, <code className="font-mono text-cyan-300">snapper</code>) and public Leap 16.1 OSS / Update repositories.
                    </li>
                    <li>
                      <strong>Injected Repository Configurations:</strong> Bundled repo file updated to <code className="font-mono text-cyan-300">rpms/opensuse-leap.repo</code> tracking official openSUSE Leap 16.1 package and update trees.
                    </li>
                    <li>
                      <strong>Standardized Base Image Name:</strong> Unified Free Mode base image ISO filename to <code className="font-mono text-cyan-300">leap-base.iso</code>.
                    </li>
                    <li>
                      <strong>Preserved Downstream EIB Layering:</strong> Retained all EIB Kubernetes engine customizations (RKE2/K3s, CNI plugins, Helm charts, embedded artifact registry, storage target, and 1/3-node NMState network configurations) completely unchanged on top of the immutable base.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.3.2 */}
              <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.3.2</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Previous Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-06</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Quorum Architecture & UI Hardening
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>Embedded-etcd Quorum Enforcement:</strong> Restricted selectable cluster topologies exclusively to either 1 Node (Single-Node Appliance / Solo Control-Plane + Worker) or 3 Nodes (HA Quorum Cluster with 3 unified Control-Plane + Worker nodes), strictly disallowing invalid 2-node configurations that lack Raft quorum fault tolerance.
                    </li>
                    <li>
                      <strong>Unified Server Roles:</strong> All active nodes are configured with unified control-plane + worker roles running embedded etcd, ensuring seamless single-node and 3-node HA deployment without requiring external control-plane nodes.
                    </li>
                    <li>
                      <strong>Brand Neutrality Decoupling:</strong> Removed the green "Community" badge and shield from the page header to prevent false impressions of tiered commercial editions.
                    </li>
                    <li>
                      <strong>About Modal Flexbox Stability:</strong> Added strict <code className="font-mono text-cyan-300">shrink-0</code> and <code className="font-mono text-cyan-300">min-h-0</code> constraints to the About dialog header, tabs bar, and body container, preventing tabs from shrinking or collapsing when viewing extensive changelog and license entries.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.3.1 */}
              <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.3.1</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Previous Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-05</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Brand Identity & Trademark Disclaimers
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>Trademark Decoupling:</strong> Removed bare/unqualified SUSE naming from project titles, page headers, bundle archives, and output ISO filenames to avoid trademark confusion.
                    </li>
                    <li>
                      <strong>Clear Attribution & Technical Context:</strong> Maintained technical accuracy when referencing official tools and components (e.g., "for SUSE EIB", "openSUSE Leap Micro", "SLE Micro", "SUSE Customer Center").
                    </li>
                    <li>
                      <strong>Prominent Non-Affiliation Disclaimers:</strong> Added explicit advisory notices across README.md, UI modals, and environment forms clarifying that this tool is not affiliated with or endorsed by SUSE and provides no warranty or support path.
                    </li>
                    <li>
                      <strong>Commercial Supportability Warning:</strong> Added advisories reminding operators that even when utilizing valid SCC credentials, the supportability of resulting appliances and deployed systems must be confirmed directly with SUSE.
                    </li>
                    <li>
                      <strong>Archive & Release Artifact Renaming:</strong> Standardized tarball and zip bundle exports to <code className="font-mono text-cyan-300">eib-pea-dist-v*.tar.gz</code>, <code className="font-mono text-cyan-300">eib-recipe-*.zip</code>, and output image to <code className="font-mono text-cyan-300">edge-image-*.iso</code>.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.3.0 */}
              <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.3.0</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Previous Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-05</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Added & Enhanced
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>Multi-Profile Management:</strong> Save, name, annotate, switch, duplicate, and delete multiple cluster profiles directly in browser storage without losing in-flight form states.
                    </li>
                    <li>
                      <strong>Zero-Binary Serialization:</strong> Fast, lightweight profiles containing all wizard form fields while keeping heavy ISO binary blobs completely out of profile exports.
                    </li>
                    <li>
                      <strong>Human-Editable Commented YAML:</strong> Export profile definitions in clear, commented YAML with section headers and field explanations for easy manual editing.
                    </li>
                    <li>
                      <strong>Web Crypto AES-256-GCM Encryption:</strong> Optional client-side AES-256 encryption via standard Web Crypto API with PBKDF2 (100,000 iterations, SHA-256) to safeguard sensitive tokens and passwords.
                    </li>
                    <li>
                      <strong>Collision Detection & Side-by-Side Diff:</strong> Smart conflict detection upon importing profiles, complete with an interactive diff table and options to overwrite, keep both (rename), or cancel.
                    </li>
                    <li>
                      <strong>Future-Proof Backward Compatibility:</strong> Automatic normalization logic backfills safe production defaults for older profile versions.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.2.0 */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.2.0</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Offline & PWA Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-04</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Added & Enhanced
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>Total Offline Execution (Workbox Precaching):</strong> Complete service worker asset caching (<code className="font-mono text-emerald-300">sw.js</code>) enabling the app to run completely air-gapped without an active internet connection.
                    </li>
                    <li>
                      <strong>Automated Online Update Detection:</strong> Active update monitoring with background polling every 15 minutes, auto-check upon network reconnect, and focus/tab visibility change triggers.
                    </li>
                    <li>
                      <strong>Interactive Update Notification & Controlled Reload:</strong> High-visibility update banner notifying users when a new release is waiting, with single-click skip-waiting activation to prevent losing in-progress recipe inputs.
                    </li>
                    <li>
                      <strong>Manual "Check for Updates" Diagnostics:</strong> Real-time update checking button in Header and About dialog querying both <code className="font-mono text-cyan-300">version.json</code> and service worker byte-diffing.
                    </li>
                    <li>
                      <strong>In-App PWA Installation:</strong> Prominent "Install App" action and native iOS Safari "Add to Home Screen" step-by-step guidance modal.
                    </li>
                    <li>
                      <strong>Cache-Bypass SW Registration:</strong> Registered with <code className="font-mono text-emerald-300">updateViaCache: 'none'</code> to overcome aggressive browser HTTP caching of service worker scripts.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.1.1 */}
              <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.1.1</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Previous Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-04</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Fixed & Hardened
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>README Section 3 Directory Tree Display:</strong> Replaced backslash-escaped code fences with standard preformatted multiline markdown blocks, restoring clean tree rendering in both repository root and dynamic ZIP bundle exports.
                    </li>
                    <li>
                      <strong>GitHub Actions CI/CD Pipeline Hardening:</strong> Resolved dependency lockfile missing error by committing verified <code className="font-mono text-cyan-300">package-lock.json</code> and updating setup-node caching to resilient <code className="font-mono text-cyan-300">~/.npm</code> cache.
                    </li>
                    <li>
                      <strong>Runner Image & Peer Dep Standardization:</strong> Pinned runner to <code className="font-mono text-cyan-300">ubuntu-24.04</code> with Node.js 24 LTS, bumped esbuild to <code className="font-mono text-emerald-300">^0.28.0</code> for Vite 8 peer resolution, and added fallback logic for non-shrinkwrap environments.
                    </li>
                    <li>
                      <strong>AI Maintenance Guide:</strong> Added <code className="font-mono text-cyan-300">AI_MAINTENANCE_GUIDELINES.md</code> with full prompt history, architecture specifications, and verification procedures.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.1.0 */}
              <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.1.0</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Previous Release
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-04</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Added & Enhanced
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>
                      <strong>Subpath Generic Web Server Publishing:</strong> Configured relative base (<code className="font-mono text-emerald-300">./</code>) in Vite, relative manifest URLs, and relative asset references so the application runs at any nested subfolder on any web server.
                    </li>
                    <li>
                      <strong>Full Dependencies & Licenses Catalog:</strong> Real-time searchable matrix of all runtime, development, and CDN packages with exact versions and open-source licenses in the About dialog.
                    </li>
                    <li>
                      <strong>In-App Changelog Viewer:</strong> Native tab inside the About dialog allowing users to inspect release notes and feature timelines without leaving the app.
                    </li>
                    <li>
                      <strong>GitHub Actions CI/CD Pipeline:</strong> Automated workflow (<code className="font-mono text-cyan-300">.github/workflows/release.yml</code>) to run unit tests, compile TypeScript, assemble compressed release tarballs, and publish GitHub releases.
                    </li>
                    <li>
                      <strong>AI Development & Recreation Guide:</strong> Comprehensive <code className="font-mono text-cyan-300">AI_GUIDELINES.md</code> document preserving all domain rules, tested version matrices, and architecture contracts.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Release 1.0.0 */}
              <div className="p-4 rounded-xl bg-slate-850/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">v1.0.0</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Initial Baseline
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">2026-11-04</span>
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Initial Capabilities
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>5-tab interactive Provisioning & Execution Assistant wizard for SUSE Edge Image Builder.</li>
                    <li>Dual Environment Modes: Free Mode (openSUSE Leap Micro) vs Commercial Mode (SLE Micro).</li>
                    <li>Multi-Architecture ARM64 (aarch64) with automated QEMU user-static emulation runner in <code className="font-mono text-slate-300">build.sh</code>.</li>
                    <li>Upstream containerized SUSE Kiwi pre-patching image upgrade pipeline.</li>
                    <li>Multi-Node NMState declarative network profiles (up to 3 cluster nodes).</li>
                    <li>Enterprise Corporate Proxy layer injection with basic authentication support.</li>
                    <li>Streaming in-browser Web Crypto API SHA-256 local ISO validator.</li>
                    <li>AGPL-3.0 licensing compliance across all source files and docs.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REFERENCES */}
          {activeTab === 'references' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                All architectural choices and configuration formats in this assistant are grounded in official, verified documentation:
              </p>

              <div className="space-y-2">
                {[
                  {
                    title: 'SUSE Edge Official Documentation',
                    url: 'https://documentation.suse.com/edge/',
                    desc: 'Comprehensive guides for SUSE Edge architecture, Kubernetes stacks, and Edge Image Builder.',
                  },
                  {
                    title: 'SUSE Edge Image Builder (EIB) GitHub Repository',
                    url: 'https://github.com/suse-edge/edge-image-builder',
                    desc: 'Official upstream container and definition schema specifications.',
                  },
                  {
                    title: 'NMState Declarative Network State Manager',
                    url: 'https://nmstate.io/',
                    desc: 'Declarative host networking schema used for node network interface and route configuration.',
                  },
                  {
                    title: 'openSUSE Leap Portal',
                    url: 'https://en.opensuse.org/Portal:Leap',
                    desc: 'Versatile Linux distribution featuring immutable mode with transactional-update and btrfs.',
                  },
                  {
                    title: 'SUSE Linux Enterprise Micro',
                    url: 'https://www.suse.com/products/micro/',
                    desc: 'Enterprise immutable host OS with certified security and subscription channels.',
                  },
                  {
                    title: 'SUSE KIWI Image System',
                    url: 'https://osinside.github.io/kiwi/',
                    desc: 'Complete appliance building system for Linux OS images and containers.',
                  },
                ].map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-emerald-500/50 transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                        <span>{ref.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ref.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LICENSE */}
          {activeTab === 'license' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  GNU Affero General Public License v3.0 (AGPL-3.0-only)
                </span>
                <button
                  type="button"
                  onClick={handleCopyLicense}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {copiedLicense ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy License</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
                <pre className="whitespace-pre-wrap">{licenseText}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
