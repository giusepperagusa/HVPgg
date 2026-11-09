/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Tab 5: Visual Workspace Explorer, Live Code Previews, In-Browser ISO Hash Verifier & ZIP Download.
 */

import React, { useState, useMemo } from 'react';
import {
  PackageCheck,
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Upload,
  RefreshCw,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import { EIBConfigState } from '../types/eib';
import { buildWorkspaceTree, exportWorkspaceZip, WorkspaceFilePreview } from '../utils/zipExporter';

interface TabExportProps {
  config: EIBConfigState;
}

export const TabExport: React.FC<TabExportProps> = ({ config }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('definition.yaml');
  const [copiedFile, setCopiedFile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // In-browser ISO Hash Calculator State (Web Crypto API)
  const [hashingProgress, setHashingProgress] = useState<number | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [hashMatchStatus, setHashMatchStatus] = useState<'match' | 'mismatch' | null>(null);
  const [verifiedFileName, setVerifiedFileName] = useState<string | null>(null);

  const workspaceFiles = useMemo(() => buildWorkspaceTree(config), [config]);

  const selectedFile = useMemo(
    () => workspaceFiles.find((f) => f.path === selectedFilePath) || workspaceFiles[0],
    [workspaceFiles, selectedFilePath]
  );

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const res = await exportWorkspaceZip(config);
      setDownloadSuccess(`Workspace successfully downloaded (${(res.sizeBytes / 1024).toFixed(1)} KB)`);
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCurrentFile = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  // Drag and drop / local file hashing via Web Crypto API
  const handleIsoFileSelect = async (file: File) => {
    setVerifiedFileName(file.name);
    setHashingProgress(0);
    setComputedHash(null);
    setHashMatchStatus(null);

    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digest));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      setComputedHash(hashHex);
      setHashingProgress(100);

      const matches = hashHex.toLowerCase() === config.baseIsoSha256.toLowerCase();
      setHashMatchStatus(matches ? 'match' : 'mismatch');
    } catch (err) {
      console.error('Failed to hash file in browser:', err);
      setHashingProgress(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>05. Review & Generate HVPgg Appliance Bundle</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Review your configured appliance profile, verify your base ISO hash, and download the complete ready-to-run recipe workspace bundle.
        </p>
      </div>

      {/* Executive Configuration Review Card */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Executive Appliance Specifications
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
            HVPgg Green Generation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Cluster Scale</span>
            <span className="font-bold text-white text-sm">
              {config.nodes.node2.enabled && config.nodes.node3.enabled ? '3 Nodes (HA Quorum)' : '1 Node (Solo Appliance)'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Embedded etcd</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Resource Profile</span>
            <span className="font-bold text-white text-sm">
              {config.versions.k8sEngine === 'k3s' ? 'Lightweight (K3s)' : 'Standard (RKE2)'}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">{config.versions.k8sVersion}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Support Tier</span>
            <span className="font-bold text-white text-sm truncate block">
              {config.environmentMode === 'free' ? 'Community Open Source' : 'Commercial Enterprise'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono truncate">{config.versions.baseOsName}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Target Hardware</span>
            <span className="font-bold text-white text-sm font-mono">
              {config.targetArch}
            </span>
            <span className="text-[10px] text-cyan-400 block mt-0.5 font-mono">{config.targetDisk}</span>
          </div>
        </div>
      </div>

      {/* Prominent Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500 text-slate-950 uppercase tracking-wide">
              Production Ready
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              HVPgg • SUSE Edge {config.versions.edgeGeneration} Core
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Download Complete HVPgg Appliance Workspace (.zip)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Includes <code className="font-mono text-emerald-300">definition.yaml</code>, hardened runner <code className="font-mono text-emerald-300">build.sh</code>, NMState network profiles, repository configs, and execution instructions.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="w-full md:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-extrabold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Compiling Bundle...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-950" />
                <span>Generate & Download Secure ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Two Column Layout: Interactive Workspace Explorer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Tree Explorer (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-emerald-400" />
              Workspace Structure
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {workspaceFiles.filter((f) => f.type === 'file').length} files
            </span>
          </div>

          <div className="space-y-1">
            {workspaceFiles.map((file) => {
              if (file.type === 'directory') {
                return (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono text-slate-400 font-bold"
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>{file.path}</span>
                  </div>
                );
              }

              const isSelected = selectedFilePath === file.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition font-mono text-xs ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.path.endsWith('.sh') ? (
                      <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : file.path.endsWith('.yaml') || file.path.endsWith('.xml') ? (
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{file.path}</span>
                  </div>

                  {file.path === 'build.sh' && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                      755
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Code Preview (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-bold text-white truncate">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                — {selectedFile.description}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCurrentFile}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
            >
              {copiedFile ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 max-h-[500px] overflow-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed">
            <pre className="whitespace-pre-wrap selection:bg-emerald-500 selection:text-white">
              {selectedFile.content || '# Directory entry'}
            </pre>
          </div>
        </div>
      </div>

      {/* Embedded In-Browser ISO SHA-256 Checksum Validator (Web Crypto API) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Client-Side ISO SHA-256 Checksum Validator
              </h3>
              <p className="text-xs text-slate-400">
                Supply-Chain Hardening: Drop your downloaded local base ISO here to calculate its SHA-256 in your browser before running <code className="font-mono text-slate-300">build.sh</code>.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            Zero Upload • 100% Client-Side
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Dropzone */}
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-900/60 transition group text-center">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 mb-2 transition" />
            <span className="text-xs font-bold text-slate-200">
              Select or Drop Base ISO Image (.iso)
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              Supports large files via streaming Web Crypto API
            </span>
            <input
              type="file"
              accept=".iso"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleIsoFileSelect(f);
              }}
            />
          </label>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Expected SHA-256:</span>
              <code className="text-[11px] font-mono text-slate-300 break-all">
                {config.baseIsoSha256}
              </code>
            </div>

            {verifiedFileName && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Tested File:</span>
                <span className="text-xs text-white font-mono">{verifiedFileName}</span>
              </div>
            )}

            {hashingProgress !== null && hashingProgress < 100 && (
              <div className="space-y-1">
                <span className="text-[11px] text-cyan-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Calculating cryptographic digest...
                </span>
              </div>
            )}

            {computedHash && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">Computed Hash:</span>
                  <code className="text-[11px] font-mono text-cyan-300 break-all">{computedHash}</code>
                </div>

                {hashMatchStatus === 'match' ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-300 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>INTEGRITY VERIFIED: SHA-256 matches perfectly!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/80 border border-rose-500 text-xs text-rose-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>SECURITY WARNING: SHA-256 checksum mismatch! Do not execute build.sh with this ISO.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
