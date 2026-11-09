/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Floating/Docked Wizard Navigation Bar with quick Prev/Next stage controls
 * and quick modal launchers to streamline screen estate.
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WizardTab } from './TabsNav';

interface BottomNavDockProps {
  currentTab: WizardTab;
  onSelectTab: (tab: WizardTab) => void;
  onOpenAdvancedStack?: () => void;
  onOpenDocs?: () => void;
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
  onOpenAdvancedStack,
  onOpenDocs,
  onOpenAbout,
  onQuickExport,
}) => {
  const currentIndex = TAB_ORDER.findIndex((t) => t.id === currentTab);
  const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

  return (
    <aside
      aria-label="Appliance Builder Step Navigation"
      className="sticky bottom-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl py-2.5 px-4 sm:px-6 lg:px-8 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Previous Step or Quick Overrides Link */}
        <div className="flex items-center gap-2">
          {prevTab ? (
            <button
              type="button"
              onClick={() => onSelectTab(prevTab.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition active:scale-95 shadow-sm"
              aria-label={`Go back to Step ${prevTab.stepNumber}: ${prevTab.label}`}
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Back:</span>
              <span className="text-white font-medium">{prevTab.label}</span>
            </button>
          ) : onOpenAdvancedStack ? (
            <button
              type="button"
              onClick={onOpenAdvancedStack}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition"
              title="Inspect or override exact engine versions and baseline presets"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Component Engine</span>
            </button>
          ) : null}
        </div>

        {/* Center: Stage Progress & Dialog Shortcut Links */}
        <div className="flex items-center gap-4">
          {/* Quick step counter badge */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="hidden md:inline text-slate-500">Stage:</span>
            <span className="text-emerald-400 font-bold">{TAB_ORDER[currentIndex]?.stepNumber}</span>
            <span className="text-slate-600">/</span>
            <span>05</span>
            <span className="hidden sm:inline font-sans text-slate-300 font-medium ml-1">
              • {TAB_ORDER[currentIndex]?.label}
            </span>
          </div>

          {/* Quick Utility Links moved to footer to de-clutter header */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
            {onOpenDocs && (
              <button
                type="button"
                onClick={onOpenDocs}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition px-2 py-1 rounded hover:bg-slate-800"
                title="View Hardware & Provisioning Guide"
              >
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Guide</span>
              </button>
            )}
            {onOpenAbout && (
              <button
                type="button"
                onClick={onOpenAbout}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition px-2 py-1 rounded hover:bg-slate-800"
                title="About HVPgg Lineage, Stack and AGPL-3.0 License"
              >
                <Info className="w-3 h-3 text-emerald-400" />
                <span>Lineage & About</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Next Step or Build Action */}
        <div className="flex items-center gap-2">
          {nextTab ? (
            <button
              type="button"
              onClick={() => onSelectTab(nextTab.id)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
              aria-label={`Advance to Step ${nextTab.stepNumber}: ${nextTab.label}`}
            >
              <span>Next: {nextTab.label}</span>
              <ChevronRight className="w-4 h-4 text-emerald-200" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onQuickExport}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
              aria-label="Download and Build Appliance ZIP Bundle"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
