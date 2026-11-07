/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Tab 2: SUSE Edge Generation Matrix & Tested Component Version Presets.
 */

import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import {
  EIBConfigState,
  EdgeGeneration,
  EDGE_VERSION_PRESETS,
} from '../types/eib';

interface TabVersionsProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TabVersions: React.FC<TabVersionsProps> = ({
  config,
  onChange,
  onNext,
  onPrev,
}) => {
  const currentGen = config.versions.edgeGeneration;

  const handleApplyGeneration = (gen: EdgeGeneration) => {
    const preset = EDGE_VERSION_PRESETS[gen];
    const isFree = config.environmentMode === 'free';
    const isX86 = config.targetArch === 'x86_64';

    const isoUrl = isFree
      ? isX86
        ? preset.freeIsoUrlX86
        : preset.freeIsoUrlArm
      : isX86
      ? preset.commercialIsoUrlX86
      : preset.commercialIsoUrlArm;

    const isoSha = isFree
      ? isX86
        ? preset.freeIsoSha256X86
        : preset.freeIsoSha256Arm
      : isX86
      ? preset.commercialIsoSha256X86
      : preset.commercialIsoSha256Arm;

    onChange((prev) => ({
      ...prev,
      baseIsoUrl: isoUrl,
      baseIsoSha256: isoSha,
      versions: {
        ...prev.versions,
        edgeGeneration: gen,
        eibVersion: preset.eibVersion,
        baseOsName: isFree ? preset.freeOsName : preset.commercialOsName,
        baseOsVersion: isFree ? preset.freeOsVersion : preset.commercialOsVersion,
        k8sVersion:
          prev.versions.k8sEngine === 'rke2'
            ? preset.defaultRke2Version
            : preset.defaultK3sVersion,
      },
      helmCharts: [...preset.recommendedCharts],
      containerImages: [...preset.recommendedImages],
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>02. SUSE Edge Release Matrix & Tested Stacks</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          SUSE Edge integrates validated, upstream-certified combinations of MicroOS, Kubernetes, and container tooling. Choose a baseline generation, then customize individual components as needed.
        </p>
      </div>

      {/* Generation Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['3.6', '3.5'] as EdgeGeneration[]).map((gen) => {
          const p = EDGE_VERSION_PRESETS[gen];
          const isSelected = currentGen === gen;

          return (
            <button
              key={gen}
              type="button"
              onClick={() => handleApplyGeneration(gen)}
              className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      p.status === 'current'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {p.status === 'current' ? 'Recommended / Active' : 'Stable Maintenance'}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Active Selection
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{p.label}</h3>
                <p className="text-xs text-slate-400 mt-1">Released {p.releaseDate}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Base OS Equivalence:</span>
                    <span className="font-mono text-slate-200">
                      {p.freeOsName} {p.freeOsVersion} ⇄ {p.commercialOsName} {p.commercialOsVersion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">EIB Tooling Engine:</span>
                    <span className="font-mono text-emerald-400">v{p.eibVersion}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Tested RKE2 / K3s:</span>
                    <span className="font-mono text-cyan-400">{p.defaultRke2Version}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Pre-validated CNI:</span>
                    <span className="text-slate-300">{p.testedCni.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-medium text-emerald-400">
                <span>{isSelected ? 'Current Configuration Applied' : 'Click to Apply Baseline'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Granular Overrides Panel */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Granular Component Version Overrides</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Derived from SUSE Edge {config.versions.edgeGeneration} Documentation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Base OS Target Version
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Currently using {config.versions.baseOsName}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Edge Image Builder (EIB) Version
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used in container tag reference
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kubernetes Target Version
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Engine: {config.versions.k8sEngine.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Equivalence Mapping:</strong> openSUSE Leap (Immutable Mode) provides upstream equivalence with SUSE Linux Enterprise Micro. Transactional-update and btrfs immutability baselines match across both platforms.
          </span>
        </div>
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
          <span>Next: Kubernetes & Workloads</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};
