/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Step 1: Hardware & Deployment Scale (User-Friendly Business Decisions)
 * Foreground: Machine count, resource footprint, support tier, and processor type.
 * Technical translations (RKE2 vs K3s, Leap vs SLE Micro, embedded-etcd quorum)
 * are presented as subtitles, badges, and contextual tooltips.
 */

import React, { useState } from 'react';
import {
  Server,
  Layers,
  Cpu,
  Shield,
  ShieldCheck,
  Check,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Lock,
  Unlock,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  EIBConfigState,
  EnvironmentMode,
  HardwareArch,
  KubernetesEngine,
  EDGE_VERSION_PRESETS,
} from '../types/eib';
import { BASE_IMAGE_FILENAMES } from '../config/eibDefaults';

interface TabDeploymentScaleProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
  onOpenAdvancedStack?: () => void;
}

export const TabDeploymentScale: React.FC<TabDeploymentScaleProps> = ({
  config,
  onChange,
  onOpenAdvancedStack,
}) => {
  const [showRegCode, setShowRegCode] = useState(false);
  const isSingleNode = !config.nodes.node2.enabled && !config.nodes.node3.enabled;
  const isK3s = config.versions.k8sEngine === 'k3s';
  const isFree = config.environmentMode === 'free';
  const preset = EDGE_VERSION_PRESETS[config.versions.edgeGeneration];

  // Handler: Machine Count & Quorum (1 Node Solo vs 3 Nodes HA Quorum)
  const handleScaleChange = (scale: 'single' | 'ha') => {
    onChange((prev) => {
      const isHA = scale === 'ha';
      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          node1: { ...prev.nodes.node1, enabled: true },
          node2: { ...prev.nodes.node2, enabled: isHA },
          node3: { ...prev.nodes.node3, enabled: isHA },
        },
      };
    });
  };

  // Handler: Hardware Resource Profile (Lightweight / Low Resource vs Standard Enterprise)
  const handleResourceTierChange = (tier: 'lightweight' | 'standard') => {
    const engine: KubernetesEngine = tier === 'lightweight' ? 'k3s' : 'rke2';
    onChange((prev) => {
      const currentPreset = EDGE_VERSION_PRESETS[prev.versions.edgeGeneration];
      return {
        ...prev,
        versions: {
          ...prev.versions,
          k8sEngine: engine,
          k8sVersion:
            engine === 'rke2'
              ? currentPreset.defaultRke2Version
              : currentPreset.defaultK3sVersion,
        },
      };
    });
  };

  // Handler: Support & Licensing Model (Community Open Source vs Commercial Enterprise)
  const handleSupportTierChange = (mode: EnvironmentMode) => {
    onChange((prev) => {
      const isFreeMode = mode === 'free';
      const arch = prev.targetArch;
      const currentPreset = EDGE_VERSION_PRESETS[prev.versions.edgeGeneration];

      const newIsoUrl = isFreeMode
        ? arch === 'x86_64'
          ? currentPreset.freeIsoUrlX86
          : currentPreset.freeIsoUrlArm
        : arch === 'x86_64'
        ? currentPreset.commercialIsoUrlX86
        : currentPreset.commercialIsoUrlArm;

      const newSha256 = isFreeMode
        ? arch === 'x86_64'
          ? currentPreset.freeIsoSha256X86
          : currentPreset.freeIsoSha256Arm
        : arch === 'x86_64'
        ? currentPreset.commercialIsoSha256X86
        : currentPreset.commercialIsoSha256Arm;

      return {
        ...prev,
        environmentMode: mode,
        baseIsoUrl: newIsoUrl,
        baseIsoSha256: newSha256,
        versions: {
          ...prev.versions,
          baseOsName: isFreeMode ? currentPreset.freeOsName : currentPreset.commercialOsName,
          baseOsVersion: isFreeMode ? currentPreset.freeOsVersion : currentPreset.commercialOsVersion,
        },
      };
    });
  };

  // Handler: Architecture
  const handleArchChange = (arch: HardwareArch) => {
    onChange((prev) => {
      const isFreeMode = prev.environmentMode === 'free';
      const currentPreset = EDGE_VERSION_PRESETS[prev.versions.edgeGeneration];

      const newIsoUrl = isFreeMode
        ? arch === 'x86_64'
          ? currentPreset.freeIsoUrlX86
          : currentPreset.freeIsoUrlArm
        : arch === 'x86_64'
        ? currentPreset.commercialIsoUrlX86
        : currentPreset.commercialIsoUrlArm;

      const newSha256 = isFreeMode
        ? arch === 'x86_64'
          ? currentPreset.freeIsoSha256X86
          : currentPreset.freeIsoSha256Arm
        : arch === 'x86_64'
        ? currentPreset.commercialIsoSha256X86
        : currentPreset.commercialIsoSha256Arm;

      return {
        ...prev,
        targetArch: arch,
        baseIsoUrl: newIsoUrl,
        baseIsoSha256: newSha256,
      };
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>01. Hardware Scale & Deployment Profile</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Answer a few straightforward questions about your physical hardware, scale, and operational requirements. HVPgg automatically selects the optimal, production-hardened underlying stack.
        </p>
      </div>

      {/* 1. CLUSTER SCALE & RESILIENCE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Hardware Resilience & Machine Count <span className="text-emerald-400">*</span>
          </label>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Raft consensus requires either 1 solo node or 3 quorum nodes</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solo Machine Card */}
          <button
            type="button"
            onClick={() => handleScaleChange('single')}
            className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
              isSingleNode
                ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  Single Machine (Solo Appliance)
                </span>
                {isSingleNode && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Selected
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white">Compact Solo Deployment</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Ideal for small businesses or branch offices using a single physical server or compact edge PC. Low hardware investment with all business applications running unified on one machine.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="text-slate-400">Technical Foundation:</span>
              <span className="text-emerald-400 font-mono font-medium">1-Node Embedded etcd</span>
            </div>
          </button>

          {/* 3-Machine HA Quorum Card */}
          <button
            type="button"
            onClick={() => handleScaleChange('ha')}
            className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
              !isSingleNode
                ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  3 Machines (High-Availability Quorum)
                </span>
                {!isSingleNode && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Selected
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white">High-Availability Resilient Cluster</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Tolerates complete failure of any 1 physical machine without business interruption. Continuous automated quorum failover, distributed storage replication, and zero-downtime maintenance.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="text-slate-400">Technical Foundation:</span>
              <span className="text-emerald-400 font-mono font-medium">3-Node HA Raft Quorum</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. HARDWARE RESOURCE TIER & PERFORMANCE PROFILE */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Hardware Resource Footprint <span className="text-emerald-400">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lightweight Tier */}
          <button
            type="button"
            onClick={() => handleResourceTierChange('lightweight')}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
              isK3s
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0 border border-slate-700 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">Lightweight / Resource-Efficient</div>
                {isK3s && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Optimized for modest CPU & RAM specifications, low-power industrial IPCs, or compact mini-PCs with minimal overhead.
              </p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <span className="text-slate-500">Engine:</span>
                <span className="text-cyan-400">Lightweight K3s</span>
              </div>
            </div>
          </button>

          {/* Standard Enterprise Tier */}
          <button
            type="button"
            onClick={() => handleResourceTierChange('standard')}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
              !isK3s
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700 mt-0.5">
              <Server className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">Standard Server / High Performance</div>
                {!isK3s && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Designed for standard dedicated edge servers, providing high transaction throughput, hardened security baselines, and FIPS compliance.
              </p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <span className="text-slate-500">Engine:</span>
                <span className="text-emerald-400">Enterprise RKE2</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. SUPPORT & SUBSCRIPTION MODEL */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Support Model & Subscription Tier <span className="text-emerald-400">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Community Open Source */}
          <button
            type="button"
            onClick={() => handleSupportTierChange('free')}
            className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
              isFree
                ? 'bg-slate-800/90 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                  Community Edition (100% Free)
                </span>
                {isFree && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h3 className="text-base font-bold text-white">Open Source & Community Updates</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Zero license fees, zero registration keys, and zero telemetry. Upstream packages and updates stream directly from public openSUSE mirrors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Operating System:</span>
              <span className="text-emerald-400 font-mono font-medium">openSUSE Leap Immutable</span>
            </div>
          </button>

          {/* Commercial Enterprise */}
          <button
            type="button"
            onClick={() => handleSupportTierChange('commercial')}
            className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
              !isFree
                ? 'bg-slate-800/90 border-amber-500 shadow-lg ring-2 ring-amber-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  Enterprise Production
                </span>
                {!isFree && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <h3 className="text-base font-bold text-white">Commercial SUSE Enterprise Support</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                For organizations with critical workloads requiring official enterprise SLAs, certified regulatory compliance, and SUSE Customer Center support channels.
              </p>

              {/* Explicit Supportability Notice (Always Visible) */}
              <div className="mt-3 p-2 rounded-lg bg-amber-950/50 border border-amber-600/40 text-[11px] text-amber-200/90 flex items-start gap-1.5 leading-normal">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Supportability Notice:</strong> Even when using valid SCC credentials, actual supportability of the resulting build artifacts and deployed systems must be verified directly with SUSE.
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Operating System:</span>
              <span className="text-amber-400 font-mono font-medium">SLE Micro (Commercial)</span>
            </div>
          </button>
        </div>

        {/* Commercial Credentials (Conditional) */}
        {!isFree && (
          <div className="p-4 rounded-xl border border-amber-600/40 bg-amber-950/20 space-y-3 mt-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                SUSE Customer Center (SCC) Registration Credentials
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegCode(!showRegCode)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                  >
                    {showRegCode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  value={config.scc.email}
                  placeholder="ops@company.com"
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      scc: { ...prev.scc, email: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PROCESSOR ARCHITECTURE */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Hardware Processor Architecture <span className="text-emerald-400">*</span>
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
              <div className="text-sm font-bold text-white">Standard 64-bit Server (Intel / AMD x86_64)</div>
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
      </div>

      {/* Optional Advanced Stack Overrides Link */}
      {onOpenAdvancedStack && (
        <div className="pt-2 pb-4 text-center">
          <button
            type="button"
            onClick={onOpenAdvancedStack}
            className="text-xs text-slate-400 hover:text-emerald-400 transition underline underline-offset-4"
          >
            Looking for specific component versions? Open Advanced Stack Overrides
          </button>
        </div>
      )}
    </div>
  );
};
