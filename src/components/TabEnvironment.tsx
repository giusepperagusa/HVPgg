/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Tab 1: Environment Mode, Architecture, Kiwi Pre-patch, SCC Auth, Enterprise Proxy & Base ISO.
 */

import React, { useState } from 'react';
import {
  Cpu,
  Globe,
  KeyRound,
  Shield,
  Layers,
  HelpCircle,
  RotateCcw,
  Check,
  Copy,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  EIBConfigState,
  EnvironmentMode,
  HardwareArch,
  EDGE_VERSION_PRESETS,
} from '../types/eib';

interface TabEnvironmentProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
  onNext: () => void;
}

export const TabEnvironment: React.FC<TabEnvironmentProps> = ({
  config,
  onChange,
  onNext,
}) => {
  const [showRegCode, setShowRegCode] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const preset = EDGE_VERSION_PRESETS[config.versions.edgeGeneration];

  // Helper to update architecture and swap URLs/hashes
  const handleArchChange = (arch: HardwareArch) => {
    onChange((prev) => {
      const isFree = prev.environmentMode === 'free';
      const newIsoUrl = isFree
        ? arch === 'x86_64'
          ? preset.freeIsoUrlX86
          : preset.freeIsoUrlArm
        : arch === 'x86_64'
        ? preset.commercialIsoUrlX86
        : preset.commercialIsoUrlArm;

      const newSha256 = isFree
        ? arch === 'x86_64'
          ? preset.freeIsoSha256X86
          : preset.freeIsoSha256Arm
        : arch === 'x86_64'
        ? preset.commercialIsoSha256X86
        : preset.commercialIsoSha256Arm;

      return {
        ...prev,
        targetArch: arch,
        baseIsoUrl: newIsoUrl,
        baseIsoSha256: newSha256,
      };
    });
  };

  // Helper to switch environment mode
  const handleModeChange = (mode: EnvironmentMode) => {
    onChange((prev) => {
      const isFree = mode === 'free';
      const arch = prev.targetArch;
      const newIsoUrl = isFree
        ? arch === 'x86_64'
          ? preset.freeIsoUrlX86
          : preset.freeIsoUrlArm
        : arch === 'x86_64'
        ? preset.commercialIsoUrlX86
        : preset.commercialIsoUrlArm;

      const newSha256 = isFree
        ? arch === 'x86_64'
          ? preset.freeIsoSha256X86
          : preset.freeIsoSha256Arm
        : arch === 'x86_64'
        ? preset.commercialIsoSha256X86
        : preset.commercialIsoSha256Arm;

      return {
        ...prev,
        environmentMode: mode,
        baseIsoUrl: newIsoUrl,
        baseIsoSha256: newSha256,
        versions: {
          ...prev.versions,
          baseOsName: isFree ? preset.freeOsName : preset.commercialOsName,
          baseOsVersion: isFree ? preset.freeOsVersion : preset.commercialOsVersion,
        },
      };
    });
  };

  const handleResetIsoDefaults = () => {
    const isFree = config.environmentMode === 'free';
    const isX86 = config.targetArch === 'x86_64';
    const url = isFree
      ? isX86
        ? preset.freeIsoUrlX86
        : preset.freeIsoUrlArm
      : isX86
      ? preset.commercialIsoUrlX86
      : preset.commercialIsoUrlArm;
    const hash = isFree
      ? isX86
        ? preset.freeIsoSha256X86
        : preset.freeIsoSha256Arm
      : isX86
      ? preset.commercialIsoSha256X86
      : preset.commercialIsoSha256Arm;

    onChange((prev) => ({
      ...prev,
      baseIsoUrl: url,
      baseIsoSha256: hash,
    }));
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(config.baseIsoSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>01. Environment Mode, Architecture & Base OS Pipeline</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Select deployment subscription tier, processor architecture, containerized Kiwi pre-patching, and enterprise proxy parameters.
        </p>
      </div>

      {/* 1. Environment Mode Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Environment Subscription Tier <span className="text-emerald-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Mode Card */}
          <button
            type="button"
            onClick={() => handleModeChange('free')}
            className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
              config.environmentMode === 'free'
                ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                  Community & Edge Labs
                </span>
                {config.environmentMode === 'free' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <h3 className="text-base font-bold text-white">Free Mode (openSUSE Leap Micro)</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Uses official openSUSE mirrors and packages. No registration keys, no SCC subscriptions, and no telemetry required. Includes pre-configured <code className="text-emerald-300 font-mono">rpms/opensuse-leap-micro.repo</code> file inside the ZIP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold font-mono">baseImage:</span> leap-micro-base.iso
            </div>
          </button>

          {/* Commercial Mode Card */}
          <button
            type="button"
            onClick={() => handleModeChange('commercial')}
            className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
              config.environmentMode === 'commercial'
                ? 'bg-slate-800/90 border-amber-500 shadow-lg ring-2 ring-amber-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  Enterprise Production
                </span>
                {config.environmentMode === 'commercial' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <h3 className="text-base font-bold text-white">Commercial Mode (SLE Micro / SLM-ICEO)</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Hardened enterprise operating system with SUSE Customer Center (SCC) hooks, enterprise SLA, certified FIPS compliance, and authenticated download endpoints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-amber-400 font-semibold font-mono">baseImage:</span> sl-micro-base.iso
            </div>
          </button>
        </div>
      </div>

      {/* 2. Target Processor Architecture */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Target Processor Architecture <span className="text-emerald-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleArchChange('x86_64')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              config.targetArch === 'x86_64'
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">x86_64 (Intel / AMD 64-bit)</div>
              <p className="text-xs text-slate-400 mt-0.5">Standard edge servers, industrial IPCs, hypervisors</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleArchChange('aarch64')}
            className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
              config.targetArch === 'aarch64'
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>ARM64 (aarch64)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Cross-Emulation Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ampere, Raspberry Pi 4/5, NVIDIA Jetson, Edge IoT</p>
            </div>
          </button>
        </div>

        {config.targetArch === 'aarch64' && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-800/50 text-xs text-cyan-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Automated Cross-Architecture Emulation Active:</strong> The generated <code className="font-mono text-cyan-300">build.sh</code> will automatically inspect your host system with <code className="font-mono text-cyan-300">uname -m</code>. If executing on an x86_64 machine, it registers QEMU user-static binaries via <code className="font-mono text-cyan-300">multiarch/qemu-user-static</code> so containerized Zypper, Combustion, and Kiwi compile ARM64 binaries without crashing.
            </div>
          </div>
        )}
      </div>

      {/* 3. Upstream Image Upgrade Pipeline: Containerized SUSE Kiwi Integration */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                Rebuild & Update Base ISO via Containerized SUSE Kiwi Builder
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/50">
                Upstream Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              When enabled, <code className="font-mono text-slate-300">build.sh</code> will first spin up an official <code className="font-mono text-slate-300">kiwi-builder</code> container to compile a freshly patched, completely up-to-date base OS image directly into <code className="font-mono text-slate-300">base-images/</code> before EIB customizes it. A boilerplate <code className="font-mono text-slate-300">kiwi-config/config.xml</code> will be added to your exported ZIP bundle.
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
            <strong>Active Kiwi Mode:</strong> Kiwi will resolve packages from{' '}
            {config.environmentMode === 'free'
              ? 'public openSUSE Leap Micro update repositories'
              : 'SUSE Customer Center authenticated commercial channels'}{' '}
            and output the generated ISO for immediate consumption by EIB.
          </div>
        )}
      </div>

      {/* 4. Commercial Mode SCC Credentials (Conditional) */}
      {config.environmentMode === 'commercial' && (
        <div className="p-5 rounded-2xl border border-amber-600/40 bg-amber-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              SUSE Customer Center (SCC) Authentication Parameters
            </h3>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            These credentials authorize your <code className="font-mono">build.sh</code> execution runner to authenticate against SUSE commercial download mirrors and <code className="font-mono">registry.suse.com</code>.
          </p>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-[11px] text-amber-200/80 leading-relaxed">
            <strong className="text-amber-300 font-semibold block mb-0.5">Supportability Advisory:</strong>
            This tool is an independent community project and is not affiliated with or endorsed by SUSE. Even when using valid SCC credentials, the actual supportability of the resulting build artifacts and deployed systems must be verified directly with SUSE.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registration Code / License Key <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRegCode ? 'text' : 'password'}
                  value={config.scc.regCode}
                  placeholder="e.g. 0a1b2c3d4e5f6g7h"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      scc: { ...prev.scc, regCode: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegCode(!showRegCode)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  aria-label={showRegCode ? 'Hide registration code' : 'Show registration code'}
                >
                  {showRegCode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                SUSE Account Email
              </label>
              <input
                type="email"
                value={config.scc.email}
                placeholder="ops@enterprise.corp"
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    scc: { ...prev.scc, email: e.target.value },
                  }))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Enterprise Proxy Configuration */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise Corporate Proxy Layer</h3>
              <p className="text-xs text-slate-400">
                Deploy behind strict corporate firewalls with container pass-through (-e flags)
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
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
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                No Proxy Bypass List (comma-separated)
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Proxy Basic Auth Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={config.proxy.authEnabled}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      proxy: { ...prev.proxy, authEnabled: e.target.checked },
                    }))
                  }
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                />
                <span>Proxy Requires Basic Authentication (Username / Password)</span>
              </label>

              {config.proxy.authEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Proxy Username</label>
                    <input
                      type="text"
                      value={config.proxy.username || ''}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          proxy: { ...prev.proxy, username: e.target.value },
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Proxy Password</label>
                    <input
                      type="password"
                      value={config.proxy.password || ''}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          proxy: { ...prev.proxy, password: e.target.value },
                        }))
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. Base ISO Endpoint & Mandatory SHA-256 Checksum */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Base OS Image Endpoint & Cryptographic SHA-256 Hash
              </h3>
              <p className="text-xs text-slate-400">
                Supply-chain hardening: Validated via <code className="font-mono text-slate-300">sha256sum --check</code> before building.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetIsoDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Official Preset</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Base ISO Download URL (Fallback Fetch Endpoint)
            </label>
            <input
              type="text"
              value={config.baseIsoUrl}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  baseIsoUrl: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Expected SHA-256 Checksum</span>
                <span className="text-emerald-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={config.baseIsoSha256}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  baseIsoSha256: e.target.value.trim(),
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Length: {config.baseIsoSha256.length} characters (64 required for valid SHA-256).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition active:scale-95"
        >
          <span>Next: Edge Versions Matrix</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};
