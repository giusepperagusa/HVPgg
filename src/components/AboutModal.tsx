/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * About & Legal Modal with AGPL-3.0 License text and official references.
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { generateLicenseText } from '../utils/eibGenerator';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'license' | 'references'>('about');
  const [copiedLicense, setCopiedLicense] = useState(false);

  if (!isOpen) return null;

  const licenseText = generateLicenseText();

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(licenseText);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">About SUSE Edge EIB-PEA</h3>
              <p className="text-xs text-slate-400">
                Provisioning & Execution Assistant for SUSE Edge Image Builder
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'about'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture & Specs
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'references'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Official Documentation Links
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'license'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AGPL-3.0 License
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeTab === 'about' && (
            <div className="space-y-4 leading-relaxed text-xs">
              <p>
                The <strong>SUSE Edge Image Builder Provisioning/Execution Assistant (EIB-PEA)</strong> is a stateless, client-side Progressive Web Application designed for security architects, DevOps engineers, and edge platform administrators.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Stateless & Supply-Chain Hardened
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    No external server or database telemetry. All configuration state, cryptographic hashes, and ZIP compilation happen inside your browser memory.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Multi-Arch Cross-Emulation
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Build ARM64 (aarch64) images directly on x86_64 hosts via integrated QEMU user-static binfmt registration in the generated <code className="font-mono">build.sh</code> runner.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Upstream Kiwi Pre-Patching
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Derive freshly updated base ISOs with containerized SUSE Kiwi before applying EIB customizations.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Multi-Node NMState Topology
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Hardware MAC address binding and declarative NMState networking for up to 3-node HA Kubernetes appliance clusters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'references' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                All architectural choices and configuration formats in this assistant are grounded in official, verified documentation:
              </p>

              <div className="space-y-2">
                {[
                  {
                    title: 'SUSE Edge Official Documentation',
                    url: 'https://documentation.suse.com/edge/',
                    desc: 'Comprehensive guides for SUSE Edge architecture, Kubernetes stacks, and Edge Image Builder.',
                  },
                  {
                    title: 'SUSE Edge Image Builder (EIB) GitHub Repository',
                    url: 'https://github.com/suse-edge/edge-image-builder',
                    desc: 'Official upstream container and definition schema specifications.',
                  },
                  {
                    title: 'NMState Declarative Network State Manager',
                    url: 'https://nmstate.io/',
                    desc: 'Declarative host networking schema used for node network interface and route configuration.',
                  },
                  {
                    title: 'openSUSE Leap Micro Portal',
                    url: 'https://en.opensuse.org/Portal:LeapMicro',
                    desc: 'Lightweight immutable host OS for edge containers and microservices.',
                  },
                  {
                    title: 'SUSE Linux Enterprise Micro',
                    url: 'https://www.suse.com/products/micro/',
                    desc: 'Enterprise immutable host OS with certified security and subscription channels.',
                  },
                  {
                    title: 'SUSE KIWI Image System',
                    url: 'https://osinside.github.io/kiwi/',
                    desc: 'Complete appliance building system for Linux OS images and containers.',
                  },
                ].map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-emerald-500/50 transition group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                        <span>{ref.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ref.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  GNU Affero General Public License v3.0 (AGPL-3.0-only)
                </span>
                <button
                  type="button"
                  onClick={handleCopyLicense}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {copiedLicense ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy License</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
                <pre className="whitespace-pre-wrap">{licenseText}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
