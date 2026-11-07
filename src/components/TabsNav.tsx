/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Accessible multi-step wizard navigation tabs.
 */

import React from 'react';
import {
  Sliders,
  Layers,
  Network,
  HardDrive,
  PackageCheck,
  CheckCircle2,
  Server,
} from 'lucide-react';

export type WizardTab = 'deployment' | 'identity' | 'security' | 'roadmap' | 'export';

interface TabsNavProps {
  currentTab: WizardTab;
  onSelectTab: (tab: WizardTab) => void;
  completedTabs: Record<WizardTab, boolean>;
}

interface StepItem {
  id: WizardTab;
  stepNumber: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepItem[] = [
  {
    id: 'deployment',
    stepNumber: '01',
    title: 'Hardware Scale',
    subtitle: 'Machines, Resources & Tier',
    icon: Server,
  },
  {
    id: 'identity',
    stepNumber: '02',
    title: 'Appliance Identity',
    subtitle: 'Network, IPs & Storage',
    icon: Network,
  },
  {
    id: 'security',
    stepNumber: '03',
    title: 'Security & Updates',
    subtitle: 'Proxy & Patch Pipeline',
    icon: Sliders,
  },
  {
    id: 'roadmap',
    stepNumber: '04',
    title: 'Value Stack',
    subtitle: '6-Layer Architecture',
    icon: Layers,
  },
  {
    id: 'export',
    stepNumber: '05',
    title: 'Build Appliance',
    subtitle: 'Review, Verify & ZIP',
    icon: PackageCheck,
  },
];

export const TabsNav: React.FC<TabsNavProps> = ({
  currentTab,
  onSelectTab,
  completedTabs,
}) => {
  return (
    <nav
      aria-label="Provisioning Wizard Steps"
      className="bg-slate-900/60 border-b border-slate-800 p-2 sm:p-3 overflow-x-auto"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-[700px] lg:min-w-0">
        {STEPS.map((step, idx) => {
          const isActive = currentTab === step.id;
          const isDone = completedTabs[step.id];
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => onSelectTab(step.id)}
              className={`flex-1 relative flex items-center gap-3 p-3 rounded-xl transition text-left group border ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step indicator */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-colors shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : isDone
                    ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {isDone && !isActive ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span>{step.stepNumber}</span>
                )}
              </div>

              {/* Step Text */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`text-xs font-bold tracking-wide truncate ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {step.subtitle}
                </p>
              </div>

              {/* Active Bottom Indicator Accent */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-t" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
