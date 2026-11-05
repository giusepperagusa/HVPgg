/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Profile Manager Modal:
 * Allows saving, managing, switching, exporting, and importing configuration profiles.
 * Supports human-editable commented YAML, AES-256-GCM encryption with user passphrase,
 * collision detection, and multi-profile backups.
 */

import React, { useState, useRef } from 'react';
import {
  FolderGit2,
  Plus,
  Save,
  Download,
  Upload,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  AlertTriangle,
  Layers,
  Clock,
  Shield,
  FileText,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { EIBProfile, ProfileConflictResolution } from '../types/profile';
import { parseProfileFile } from '../utils/profileSerializer';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: EIBProfile[];
  activeProfile: EIBProfile | null;
  activeProfileId: string | null;
  onSaveCurrentAsNew: (name: string, description: string) => EIBProfile;
  onUpdateActiveProfile: () => void;
  onUpdateProfileMetadata: (id: string, name: string, description: string) => void;
  onLoadProfile: (id: string) => boolean;
  onDeleteProfile: (id: string) => void;
  onDuplicateProfile: (id: string) => EIBProfile | null;
  findExistingProfileConflict: (candidate: EIBProfile) => EIBProfile | null;
  onCommitImportedProfile: (imported: EIBProfile, resolution?: ProfileConflictResolution) => EIBProfile;
  onExportProfile: (id: string, options: { encrypted: boolean; passphrase?: string }) => Promise<void>;
  onExportAllBundle: (options: { encrypted: boolean; passphrase?: string }) => Promise<void>;
  onConflictDetected: (existing: EIBProfile, candidate: EIBProfile, resolveCallback: (resolution: ProfileConflictResolution) => void) => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  activeProfileId,
  onSaveCurrentAsNew,
  onUpdateActiveProfile,
  onUpdateProfileMetadata,
  onLoadProfile,
  onDeleteProfile,
  onDuplicateProfile,
  findExistingProfileConflict,
  onCommitImportedProfile,
  onExportProfile,
  onExportAllBundle,
  onConflictDetected,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Save New Profile form state
  const [showSaveNewForm, setShowSaveNewForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');

  // Inline editing state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Export Dialog state
  const [exportTarget, setExportTarget] = useState<{ id: string | null; name: string; isBundle: boolean } | null>(null);
  const [exportEncrypted, setExportEncrypted] = useState(false);
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [exportPassphraseConfirm, setExportPassphraseConfirm] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [exportError, setExportError] = useState('');

  // Import Passphrase Dialog state
  const [pendingEncryptedContent, setPendingEncryptedContent] = useState<string | null>(null);
  const [importPassphrase, setImportPassphrase] = useState('');
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [importError, setImportError] = useState('');

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query));
  });

  // Handle saving new profile
  const handleSaveNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      showStatus('error', 'Profile name cannot be empty.');
      return;
    }
    const created = onSaveCurrentAsNew(newProfileName, newProfileDesc);
    showStatus('success', `Saved current form state as "${created.name}".`);
    setNewProfileName('');
    setNewProfileDesc('');
    setShowSaveNewForm(false);
  };

  // Handle saving active changes
  const handleUpdateActive = () => {
    onUpdateActiveProfile();
    showStatus('success', `Updated "${activeProfile?.name}" with current form values.`);
  };

  // Handle inline edit submit
  const handleStartEdit = (p: EIBProfile) => {
    setEditingProfileId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateProfileMetadata(id, editName, editDesc);
    setEditingProfileId(null);
    showStatus('success', 'Profile metadata updated.');
  };

  // Handle Export Click
  const handleStartExport = (id: string | null, name: string, isBundle: boolean) => {
    setExportTarget({ id, name, isBundle });
    setExportEncrypted(false);
    setExportPassphrase('');
    setExportPassphraseConfirm('');
    setExportError('');
  };

  const handleExecuteExport = async () => {
    if (!exportTarget) return;

    if (exportEncrypted) {
      if (!exportPassphrase || exportPassphrase.length < 6) {
        setExportError('Encryption passphrase must be at least 6 characters.');
        return;
      }
      if (exportPassphrase !== exportPassphraseConfirm) {
        setExportError('Passphrase confirmation does not match.');
        return;
      }
    }

    try {
      if (exportTarget.isBundle) {
        await onExportAllBundle({
          encrypted: exportEncrypted,
          passphrase: exportEncrypted ? exportPassphrase : undefined,
        });
        showStatus('success', `Exported bundle with ${profiles.length} profiles.`);
      } else if (exportTarget.id) {
        await onExportProfile(exportTarget.id, {
          encrypted: exportEncrypted,
          passphrase: exportEncrypted ? exportPassphrase : undefined,
        });
        showStatus('success', `Exported "${exportTarget.name}".`);
      }
      setExportTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setExportError(msg);
    }
  };

  // Handle File Input for Import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await processImportText(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read file';
      showStatus('error', `Import error: ${msg}`);
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Process imported text
  const processImportText = async (text: string, passphrase?: string) => {
    try {
      const result = await parseProfileFile(text, passphrase);

      if (result.isEncrypted && result.needsPassphrase) {
        // Needs passphrase! Show passphrase prompt
        setPendingEncryptedContent(text);
        setImportPassphrase('');
        setImportError('');
        return;
      }

      if (!result.success && result.error) {
        showStatus('error', result.error);
        return;
      }

      // Successfully decrypted or plain
      const importedProfiles = result.profiles || (result.profile ? [result.profile] : []);
      if (!importedProfiles || importedProfiles.length === 0) {
        showStatus('error', 'No valid profiles found in the imported file.');
        return;
      }

      // Process each profile sequentially with collision detection
      let importedCount = 0;
      for (const p of importedProfiles) {
        const existing = findExistingProfileConflict(p);
        if (existing) {
          // Collision! Trigger conflict modal
          await new Promise<void>((resolve) => {
            onConflictDetected(existing, p, (resolution) => {
              if (resolution.action !== 'cancel') {
                onCommitImportedProfile(p, resolution);
                importedCount++;
              }
              resolve();
            });
          });
        } else {
          // No collision, directly commit
          onCommitImportedProfile(p);
          importedCount++;
        }
      }

      if (importedCount > 0) {
        showStatus('success', `Successfully imported ${importedCount} profile${importedCount > 1 ? 's' : ''}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid profile file format';
      setImportError(msg);
      showStatus('error', `Import failed: ${msg}`);
    }
  };

  // Handle Import Passphrase Submit
  const handleDecryptImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEncryptedContent) return;

    try {
      setImportError('');
      await processImportText(pendingEncryptedContent, importPassphrase);
      setPendingEncryptedContent(null);
      setImportPassphrase('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Decryption failed';
      setImportError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">EIB Configuration Profiles</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {profiles.length} Saved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Save, switch, export, and import complete cluster configurations without binary ISO blobs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close Profile Manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="px-6 py-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Active Profile Info & Quick Save */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Active Profile:</span>
            <span className="font-bold text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeProfile ? activeProfile.name : 'None'}
            </span>
            <button
              onClick={handleUpdateActive}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition font-medium"
              title="Save current form values into the currently active profile"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Update Active</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml,.enc,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
              title="Import profile (.yaml or .enc.yaml)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import</span>
            </button>

            <button
              onClick={() => handleStartExport(null, 'All Profiles Bundle', true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
              title="Export all profiles as a single bundle"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export All</span>
            </button>

            <button
              onClick={() => setShowSaveNewForm(!showSaveNewForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save As New</span>
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/70 border-rose-800/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Collapsible Save As New Form */}
        {showSaveNewForm && (
          <form
            onSubmit={handleSaveNewSubmit}
            className="p-5 bg-slate-850/90 border-b border-slate-750 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Save Current Wizard Choices as a New Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveNewForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Profile Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g., Factory-Edge-Cluster-A"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Descriptive Notes / Comment
                </label>
                <input
                  type="text"
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                  placeholder="e.g., Leap Micro 6.0 with RKE2 v1.31 and Metallb LB"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSaveNewForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved profiles..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Showing {filteredProfiles.length} of {profiles.length}
          </span>
        </div>

        {/* Profiles List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FolderGit2 className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm">No profiles found matching your search.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isActive = p.id === activeProfileId;
              const isEditing = editingProfileId === p.id;
              const isCommercial = p.config.environmentMode === 'commercial';
              const enabledNodesCount =
                1 + (p.config.nodes.node2.enabled ? 1 : 0) + (p.config.nodes.node3.enabled ? 1 : 0);

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition ${
                    isActive
                      ? 'bg-slate-850/90 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-850/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Profile Metadata */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2 max-w-lg">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                          />
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description..."
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => handleSaveEdit(p.id)}
                              className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => setEditingProfileId(null)}
                              className="px-2.5 py-0.5 rounded text-[11px] text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                            {p.description || <span className="italic text-slate-500">No descriptive notes provided.</span>}
                          </p>
                        </div>
                      )}

                      {/* Technical Specs Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold border ${
                            isCommercial
                              ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                          }`}
                        >
                          {isCommercial ? 'SLE Micro (Commercial)' : 'openSUSE Leap Micro'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-750 font-mono">
                          K8s: {p.config.versions.k8sVersion}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-750">
                          {enabledNodesCount} Node{enabledNodesCount !== 1 ? 's' : ''}
                        </span>
                        {p.config.kiwiPrepatch && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-semibold">
                            Kiwi Pre-patch
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-500 text-[10px] ml-auto">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1.5 sm:self-center shrink-0">
                      {!isActive ? (
                        <button
                          onClick={() => {
                            onLoadProfile(p.id);
                            showStatus('success', `Loaded "${p.name}" into wizard.`);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                          title="Load this profile into the active wizard forms"
                        >
                          Load
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-400 px-3 py-1.5 bg-emerald-950/40 rounded-lg border border-emerald-800/40">
                          Loaded
                        </span>
                      )}

                      <button
                        onClick={() => handleStartExport(p.id, p.name, false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Export profile (.yaml or .enc.yaml)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Edit profile name & notes"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          const dup = onDuplicateProfile(p.id);
                          if (dup) showStatus('success', `Created copy "${dup.name}".`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Duplicate profile"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (profiles.length <= 1) {
                            showStatus('error', 'Cannot delete the only existing profile.');
                            return;
                          }
                          if (window.confirm(`Are you sure you want to delete profile "${p.name}"?`)) {
                            onDeleteProfile(p.id);
                            showStatus('success', `Deleted profile "${p.name}".`);
                          }
                        }}
                        disabled={profiles.length <= 1}
                        className={`p-1.5 rounded-lg transition ${
                          profiles.length <= 1
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={profiles.length <= 1 ? 'Cannot delete last profile' : 'Delete profile'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Encrypted or Commented YAML with Zero Binaries</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-750 text-white transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Export Sub-Modal */}
      {exportTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Export {exportTarget.isBundle ? 'All Profiles Bundle' : `"${exportTarget.name}"`}
                </h3>
              </div>
              <button
                onClick={() => setExportTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format choice toggle */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">Choose Export Security & Format:</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExportEncrypted(false)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                    !exportEncrypted
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Commented YAML</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Human-readable and manually editable in any text editor.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportEncrypted(true)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                    exportEncrypted
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>AES-256-GCM Encrypted</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Encrypted with a user passphrase (protects cluster secrets).
                  </span>
                </button>
              </div>

              {/* Warning for Plaintext */}
              {!exportEncrypted ? (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Plaintext Security Notice:</span>
                    <p className="text-[11px] text-amber-400/90 mt-0.5">
                      The exported file will contain cluster tokens, passwords, and SCC registration keys in unencrypted plaintext. If distributing across public channels, use AES encryption or store in a secure secrets vault.
                    </p>
                  </div>
                </div>
              ) : (
                /* Passphrase fields for AES-256 */
                <div className="p-4 rounded-xl bg-slate-850 border border-cyan-800/40 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span>Specify Passphrase for AES-256-GCM Encryption:</span>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showExportPassword ? 'text' : 'password'}
                        value={exportPassphrase}
                        onChange={(e) => setExportPassphrase(e.target.value)}
                        placeholder="Enter encryption passphrase (min 6 chars)..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExportPassword(!showExportPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showExportPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <input
                      type={showExportPassword ? 'text' : 'password'}
                      value={exportPassphraseConfirm}
                      onChange={(e) => setExportPassphraseConfirm(e.target.value)}
                      placeholder="Confirm encryption passphrase..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Encrypted via Web Crypto API PBKDF2 (100,000 iterations SHA-256) + AES-GCM. Make sure you remember this passphrase to restore the profile.
                  </p>
                </div>
              )}

              {exportError && (
                <div className="p-2.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs">
                  {exportError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setExportTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {exportEncrypted ? 'Encrypted YAML' : 'Commented YAML'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decrypt Import Passphrase Prompt Sub-Modal */}
      {pendingEncryptedContent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleDecryptImportSubmit}
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl p-6 space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Encrypted Profile Detected</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingEncryptedContent(null);
                  setImportPassphrase('');
                  setImportError('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This file was exported with AES-256-GCM encryption. Please enter the passphrase specified when it was exported:
            </p>

            <div className="relative">
              <input
                type={showImportPassword ? 'text' : 'password'}
                required
                autoFocus
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                placeholder="Enter decryption passphrase..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowImportPassword(!showImportPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showImportPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs">
                {importError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPendingEncryptedContent(null);
                  setImportPassphrase('');
                  setImportError('');
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Decrypt & Import</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
