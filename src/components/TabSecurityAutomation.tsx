/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Step 3: Connectivity & OS Updates (Security, Proxy & Pipeline Automation)
 * Foreground: Corporate Proxy, Fresh Base OS Compilation (Kiwi),
 * and entry point to Advanced Technical Stack Overrides.
 */

import React from 'react';
import {
  Globe,
  Layers,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { EIBConfigState } from '../types/eib';

interface TabSecurityAutomationProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenAdvancedStack: () => void;
}

export const TabSecurityAutomation: React.FC<TabSecurityAutomationProps> = ({
  config,
  onChange,
  onNext,
  onPrev,
  onOpenAdvancedStack,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>03. Connectivity & OS Updates</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure external internet connectivity, security proxy settings, and automated upstream OS patching. Technical stack details are pre-determined with sensible defaults.
        </p>
      </div>

      {/* 1. CORPORATE WEB PROXY */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Corporate Web Proxy Connection</h3>
              <p className="text-xs text-slate-400">
                Enable if your company network requires an outbound HTTP/HTTPS proxy to access the internet
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.proxy.enabled}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  proxy: { ...prev.proxy, enabled: e.target.checked },
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {config.proxy.enabled && (
          <div className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  HTTP Proxy URL
                </label>
                <input
                  type="text"
                  value={config.proxy.httpProxy}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      proxy: { ...prev.proxy, httpProxy: e.target.value },
                    }))
                  }
                  placeholder="http://proxy.company.com:8080"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  HTTPS Proxy URL
                </label>
                <input
                  type="text"
                  value={config.proxy.httpsProxy}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      proxy: { ...prev.proxy, httpsProxy: e.target.value },
                    }))
                  }
                  placeholder="http://proxy.company.com:8080"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Proxy Bypass Domains / IPs (comma-separated)
              </label>
              <input
                type="text"
                value={config.proxy.noProxy}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    proxy: { ...prev.proxy, noProxy: e.target.value },
                  }))
                }
                placeholder="localhost,127.0.0.1,192.168.0.0/16,.local"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. BASE OS FRESHNESS (KIWI PRE-PATCH) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                Compile with Upstream Security Updates
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/50">
                Automated Kiwi Builder
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              When enabled, the generated build pipeline first runs containerized SUSE Kiwi to fetch the latest security patches from upstream package mirrors before EIB packages the final ISO image.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.kiwiPrepatch}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  kiwiPrepatch: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {config.kiwiPrepatch && (
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200">
            <strong>Active Upstream Patching:</strong> Generates <code className="font-mono text-cyan-300">kiwi-config/config.xml</code> inside your bundle. The build script will compile a fresh patched base ISO into <code className="font-mono text-cyan-300">base-images/</code> before building.
          </div>
        )}
      </div>

      {/* 3. ADVANCED TECHNICAL STACK CALLOUT */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-850 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Technical Stack Details & Component Versions
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Active Selection: <span className="text-emerald-400 font-mono font-semibold">{config.versions.k8sEngine.toUpperCase()}</span> ({config.versions.k8sVersion}) on <span className="text-emerald-300 font-medium">{config.versions.baseOsName}</span> ({config.versions.baseOsVersion}) • EIB v{config.versions.eibVersion} (SUSE Edge {config.versions.edgeGeneration} preset).
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdvancedStack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition group shrink-0"
          >
            <span>Customize Technical Stack</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          * Component versions are automatically aligned with tested upstream releases. Only open overrides if you need to pin specific legacy releases or custom registries.
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition active:scale-95"
        >
          <span>Next: HVPgg Value Stack Roadmap</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};
