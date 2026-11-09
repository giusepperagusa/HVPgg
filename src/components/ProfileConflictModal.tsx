/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Collision Detection & Side-by-Side Diff Comparison Modal for Imported Profiles.
 * Empowers users to inspect differences and choose to overwrite, rename, or cancel.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Edit3,
  X,
  FileDiff,
  RefreshCw,
} from 'lucide-react';
import { EIBProfile, ProfileConflictResolution } from '../types/profile';
import { compareProfiles } from '../utils/profileSerializer';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface ProfileConflictModalProps {
  isOpen: boolean;
  existingProfile: EIBProfile;
  importedProfile: EIBProfile;
  onResolve: (resolution: ProfileConflictResolution) => void;
  onCancel: () => void;
}

export const ProfileConflictModal: React.FC<ProfileConflictModalProps> = ({
  isOpen,
  existingProfile,
  importedProfile,
  onResolve,
  onCancel,
}) => {
  useModalDismiss(isOpen, onCancel);

  const [renameValue, setRenameValue] = useState(
    `${importedProfile.name} (Imported ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
  );
  const [activeView, setActiveView] = useState<'diff' | 'all'>('diff');

  if (!isOpen) return null;

  const diffFields = compareProfiles(existingProfile, importedProfile);
  const changedFields = diffFields.filter((f) => f.isDifferent);
  const displayedFields = activeView === 'diff' ? changedFields : diffFields;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-slate-900 border border-amber-500/50 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-950/30 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Profile Name Collision Detected</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/40">
                  Conflict
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A saved profile named <strong className="text-white">"{existingProfile.name}"</strong> already exists in local storage.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Instructions */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-300 space-y-1">
            <p className="font-semibold text-white">
              Please inspect the side-by-side comparison below and choose how to proceed:
            </p>
            <p className="text-slate-400 text-[11px]">
              You can overwrite the local profile, keep both by renaming the imported profile, or cancel the import.
            </p>
          </div>

          {/* Diff filter toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FileDiff className="w-4 h-4 text-emerald-400" />
              <span>
                Found <strong className="text-white">{changedFields.length}</strong> difference{changedFields.length !== 1 ? 's' : ''} between profiles
              </span>
            </div>
            <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveView('diff')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  activeView === 'diff' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Changed Only ({changedFields.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveView('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  activeView === 'all' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Fields ({diffFields.length})
              </button>
            </div>
          </div>

          {/* Side-by-side comparison table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-850 px-4 py-2 font-bold text-slate-300 border-b border-slate-800 text-[11px]">
              <div className="col-span-4">Configuration Field</div>
              <div className="col-span-4 text-slate-400">Existing Local Profile</div>
              <div className="col-span-4 text-emerald-400">Imported Profile</div>
            </div>

            <div className="divide-y divide-slate-850/60 max-h-60 overflow-y-auto">
              {displayedFields.map((field) => (
                <div
                  key={field.path}
                  className={`grid grid-cols-12 px-4 py-2.5 items-center ${
                    field.isDifferent ? 'bg-amber-950/15' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="col-span-4 font-semibold text-slate-200 flex items-center gap-1.5">
                    {field.isDifferent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                    <span>{field.label}</span>
                  </div>
                  <div className="col-span-4 font-mono text-[11px] text-slate-400 truncate pr-2" title={field.existingValue}>
                    {field.existingValue}
                  </div>
                  <div className={`col-span-4 font-mono text-[11px] truncate pr-2 ${
                    field.isDifferent ? 'text-emerald-300 font-bold' : 'text-slate-300'
                  }`} title={field.importedValue}>
                    {field.importedValue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rename field box */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>To Keep Both Profiles, Specify a Unique Name for the Imported One:</span>
            </label>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="Enter imported profile name..."
            />
          </div>
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel & Discard Import
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onResolve({ action: 'rename', newName: renameValue })}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Keep Both (Rename)</span>
            </button>

            <button
              onClick={() => onResolve({ action: 'overwrite' })}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-lg shadow-amber-600/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Overwrite Existing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
