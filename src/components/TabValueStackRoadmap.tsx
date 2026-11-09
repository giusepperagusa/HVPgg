/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Step 4: HVPgg Value Stack Roadmap (6-Layer Architecture Overview)
 * Shows how raw hardware translates into turnkey business value:
 * 1. Base OS & Appliance Engine
 * 2. Cloud-Native Kubernetes Foundation (Storage, Networking, Lifecycle)
 * 3. Modern Authentication & Authorization (OpenID Connect / OIDC)
 * 4. Cloud Workspace & Collaboration Suite (Web Office, Shared Storage, Messaging)
 * 5. Complete Business ERP & Data Services (Database, Message Queue, ERP)
 * 6. Modern Device Management (PC and Mobile MDM Fleet)
 */

import React from 'react';
import {
  Layers,
  Server,
  Lock,
  Cloud,
  Briefcase,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { EIBConfigState } from '../types/eib';
import { HVP_VALUE_STACK_LAYERS } from '../config/eibDefaults';

interface TabValueStackRoadmapProps {
  config: EIBConfigState;
}

const LAYER_ICONS = [
  Server,        // Layer 1: OS & Appliance Engine
  Layers,        // Layer 2: K8s Foundation
  Lock,          // Layer 3: OIDC Identity
  Cloud,         // Layer 4: Cloud Workspace
  Briefcase,     // Layer 5: Business ERP
  Smartphone,    // Layer 6: Device MDM
];

export const TabValueStackRoadmap: React.FC<TabValueStackRoadmapProps> = ({
  config,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>04. HVPgg 6-Layer Architecture & Value Stack</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          HVPgg transforms physical server hardware into a complete on-premises private cloud and ERP platform for small businesses. The foundation is configured here, prepared to host each modular business service.
        </p>
      </div>

      {/* Vision Callout Banner */}
      <div className="p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>The HVPgg Vision: Zero-Maintenance Turnkey IT Infrastructure</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Designed specifically for small-to-very-small enterprises with minimal or outsourced IT personnel. Instead of assembling piecemeal technologies or paying recurring per-user SaaS subscriptions, HVPgg builds a self-contained, air-gapped on-premises appliance that comes up fully operational from bare metal.
        </p>
      </div>

      {/* 6-Layer Stack Visual Timeline */}
      <div className="space-y-4">
        {HVP_VALUE_STACK_LAYERS.map((layer, index) => {
          const Icon = LAYER_ICONS[index] || Layers;
          const isActiveFoundation = layer.status === 'active';

          return (
            <div
              key={layer.id}
              className={`p-5 rounded-2xl border transition ${
                isActiveFoundation
                  ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isActiveFoundation
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Layer {layer.layer}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {layer.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {layer.title}
                    </h3>
                  </div>
                </div>

                <div>
                  {isActiveFoundation ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Provisioned in This Recipe
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-750">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Extensible Application Layer
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {layer.description}
              </p>

              {/* Technical Implementation details */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Underlying Mechanism: </strong>
                  {layer.layer === 1
                    ? `${config.versions.baseOsName} (${config.versions.baseOsVersion}) with transactional-update`
                    : layer.layer === 2
                    ? `${config.versions.k8sEngine.toUpperCase()} (${config.versions.k8sVersion}) with ${config.versions.cniPlugin.toUpperCase()} & Longhorn storage`
                    : layer.technicalMechanism}
                </div>

                {/* Capabilities pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {layer.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
