/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Advanced Technical Stack & Component Version Overrides Modal.
 * Relegates detailed technical parameters (Edge presets, exact component versions,
 * EIB tags, ISO endpoints and SHA-256 hashes) to an explicitly invoked dialog.
 */

import React from 'react';
import {
  X,
  SlidersHorizontal,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  KeyRound,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import {
  EIBConfigState,
  EdgeGeneration,
  EDGE_VERSION_PRESETS,
} from '../types/eib';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface AdvancedStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
}

export const AdvancedStackModal: React.FC<AdvancedStackModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  const [copiedHash, setCopiedHash] = React.useState(false);

  useModalDismiss(isOpen, onClose);

  if (!isOpen) return null;

  const currentGen = config.versions.edgeGeneration;
  const preset = EDGE_VERSION_PRESETS[currentGen];

  const handleApplyGeneration = (gen: EdgeGeneration) => {
    const p = EDGE_VERSION_PRESETS[gen];
    const isFree = config.environmentMode === 'free';
    const isX86 = config.targetArch === 'x86_64';

    const isoUrl = isFree
      ? isX86
        ? p.freeIsoUrlX86
        : p.freeIsoUrlArm
      : isX86
      ? p.commercialIsoUrlX86
      : p.commercialIsoUrlArm;

    const isoSha = isFree
      ? isX86
        ? p.freeIsoSha256X86
        : p.freeIsoSha256Arm
      : isX86
      ? p.commercialIsoSha256X86
      : p.commercialIsoSha256Arm;

    onChange((prev) => ({
      ...prev,
      baseIsoUrl: isoUrl,
      baseIsoSha256: isoSha,
      versions: {
        ...prev.versions,
        edgeGeneration: gen,
        eibVersion: p.eibVersion,
        baseOsName: isFree ? p.freeOsName : p.commercialOsName,
        baseOsVersion: isFree ? p.freeOsVersion : p.commercialOsVersion,
        k8sVersion:
          prev.versions.k8sEngine === 'rke2'
            ? p.defaultRke2Version
            : p.defaultK3sVersion,
      },
      helmCharts: [...p.recommendedCharts],
      containerImages: [...p.recommendedImages],
    }));
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-stack-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-850 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 id="advanced-stack-modal-title" className="text-base font-bold text-white">
                Advanced Technical Stack & Version Overrides
              </h3>
              <p className="text-xs text-slate-400">
                Granular control over upstream SUSE Edge presets, Kubernetes releases, and ISO endpoints.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close advanced technical stack modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-700/40 text-emerald-200/90 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Dynamically Managed Defaults:</strong> HVPgg automatically manages tested component versions based on your practical hardware choices. You only need to edit these fields if your deployment requires a specific legacy release or pinned build tag.
            </span>
          </div>

          {/* 1. SUSE Edge Baseline Generation */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Upstream SUSE Edge Reference Baseline
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(['3.6', '3.5'] as EdgeGeneration[]).map((gen) => {
                const p = EDGE_VERSION_PRESETS[gen];
                const isSelected = currentGen === gen;

                return (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => handleApplyGeneration(gen)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'current'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {p.status === 'current' ? 'Recommended / Active' : 'Stable Maintenance'}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-white">{p.label}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Released {p.releaseDate}</p>

                      <div className="mt-3 space-y-1.5 text-[11px] border-t border-slate-800/80 pt-2 text-slate-400">
                        <div className="flex justify-between">
                          <span>EIB Engine:</span>
                          <span className="font-mono text-emerald-400">v{p.eibVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Default RKE2:</span>
                          <span className="font-mono text-cyan-400">{p.defaultRke2Version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Default K3s:</span>
                          <span className="font-mono text-cyan-400">{p.defaultK3sVersion}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-medium text-emerald-400">
                      <span>{isSelected ? 'Baseline Applied' : 'Click to Apply'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Granular Overrides */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-850/40 space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Component Version Tags
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Base OS Version Tag
                </label>
                <input
                  type="text"
                  value={config.versions.baseOsVersion}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      versions: { ...prev.versions, baseOsVersion: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Currently {config.versions.baseOsName}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  EIB Container Version
                </label>
                <input
                  type="text"
                  value={config.versions.eibVersion}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      versions: { ...prev.versions, eibVersion: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">EIB container image tag</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Kubernetes Release Tag
                </label>
                <input
                  type="text"
                  value={config.versions.k8sVersion}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      versions: { ...prev.versions, k8sVersion: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Engine: {config.versions.k8sEngine.toUpperCase()}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Network CNI Plugin
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['cilium', 'calico', 'canal', 'flannel'].map((cni) => (
                  <button
                    key={cni}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        versions: { ...prev.versions, cniPlugin: cni },
                      }))
                    }
                    className={`py-1.5 px-3 rounded-lg border text-center font-mono capitalize transition ${
                      config.versions.cniPlugin === cni
                        ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cni}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Base ISO Endpoint & Expected Hash */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-850/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                Base OS ISO Endpoint & Cryptographic Hash
              </h4>
              <button
                type="button"
                onClick={handleResetIsoDefaults}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset to Preset</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <span>Expected SHA-256 Checksum</span>
                  <span className="text-emerald-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Length: {config.baseIsoSha256.length} characters (64 required for valid SHA-256).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-md"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
