/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Floating/Docked Wizard Navigation Bar with stage controls and merged legal/licensing metadata.
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { WizardTab } from './TabsNav';

interface BottomNavDockProps {
  currentTab: WizardTab;
  onSelectTab: (tab: WizardTab) => void;
  onOpenAbout?: () => void;
  onQuickExport?: () => void;
}

const TAB_ORDER: { id: WizardTab; label: string; stepNumber: string }[] = [
  { id: 'deployment', label: 'Hardware Scale', stepNumber: '01' },
  { id: 'identity', label: 'Appliance Identity', stepNumber: '02' },
  { id: 'security', label: 'Security & Updates', stepNumber: '03' },
  { id: 'roadmap', label: 'Value Stack', stepNumber: '04' },
  { id: 'export', label: 'Build Appliance', stepNumber: '05' },
];

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  currentTab,
  onSelectTab,
  onOpenAbout,
  onQuickExport,
}) => {
  const currentIndex = TAB_ORDER.findIndex((t) => t.id === currentTab);
  const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

  return (
    <footer
      aria-label="Appliance Builder Step Navigation & License"
      className="sticky bottom-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl py-2 px-4 sm:px-6 lg:px-8 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Previous Step (or empty placeholder to preserve flex balance) */}
        <div className="flex items-center min-w-[90px] sm:min-w-[150px]">
          {prevTab ? (
            <button
              type="button"
              onClick={() => onSelectTab(prevTab.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition active:scale-95 shadow-sm"
              aria-label={`Go back to Step ${prevTab.stepNumber}: ${prevTab.label}`}
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Back:</span>
              <span className="text-white font-medium">{prevTab.label}</span>
            </button>
          ) : null}
        </div>

        {/* Center: Stage Progress Counter & Integrated License/Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center min-w-0">
          {/* Quick step counter badge */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="hidden md:inline text-slate-500">Stage</span>
            <span className="text-emerald-400 font-bold">{TAB_ORDER[currentIndex]?.stepNumber}</span>
            <span className="text-slate-600">/</span>
            <span>05</span>
            <span className="hidden sm:inline font-sans text-slate-300 font-medium ml-1">
              • {TAB_ORDER[currentIndex]?.label}
            </span>
          </div>

          {/* Unified Project attribution & license (merged from legacy lower footer) */}
          <div className="text-[11px] text-slate-500 truncate hidden md:inline-flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span>HVPgg</span>
            <span>•</span>
            {onOpenAbout ? (
              <button
                type="button"
                onClick={onOpenAbout}
                className="text-emerald-400 hover:underline font-semibold"
                title="View Open Source License (AGPL-3.0) and Project Lineage"
              >
                AGPL-3.0
              </button>
            ) : (
              <span className="text-emerald-400 font-semibold">AGPL-3.0</span>
            )}
            <span>•</span>
            <span className="text-slate-500">Independent Open Source Appliance</span>
          </div>
        </div>

        {/* Right: Next Step or Download Action */}
        <div className="flex items-center justify-end min-w-[90px] sm:min-w-[150px]">
          {nextTab ? (
            <button
              type="button"
              onClick={() => onSelectTab(nextTab.id)}
              className="flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
              aria-label={`Advance to Step ${nextTab.stepNumber}: ${nextTab.label}`}
            >
              <span>Next: {nextTab.label}</span>
              <ChevronRight className="w-4 h-4 text-emerald-200" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onQuickExport}
              className="flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
              aria-label="Download and Build Appliance ZIP Bundle"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
