/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Documentation & Air-Gap Deployment Guide Modal.
 */

import React from 'react';
import {
  X,
  BookOpen,
  Terminal,
  ShieldAlert,
  HardDrive,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                SUSE Edge Deployment & Hardening Guide
              </h3>
              <p className="text-xs text-slate-400">
                Air-gapped appliance architecture, proxy handling, and multi-node installation
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              1. What is SUSE Edge Image Builder (EIB)?
            </h4>
            <p>
              SUSE Edge Image Builder is a declarative, containerized utility that takes a vanilla OS ISO (openSUSE Leap Micro or SLE Micro) and embeds Kubernetes distributions (RKE2 / K3s), container images, Helm charts, combustion/ignition scripts, and NMState networking into a customized, self-installing ISO or raw disk image.
            </p>
            <p>
              Once built, the appliance ISO operates in completely air-gapped environments without requiring an active internet connection during cluster deployment.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              2. ARM64 Cross-Architecture Emulation Pipeline
            </h4>
            <p>
              When building ARM64 (aarch64) images on an x86_64 host system (such as standard CI/CD runners or developer laptops), the host kernel cannot directly execute ARM64 container binaries.
            </p>
            <p>
              The generated <code className="font-mono text-cyan-300">build.sh</code> handles this automatically by running:
            </p>
            <pre className="p-3 rounded-lg bg-slate-950 font-mono text-emerald-400 border border-slate-800">
              sudo podman run --rm --privileged multiarch/qemu-user-static --reset -p yes
            </pre>
            <p>
              This registers QEMU user-static handlers with the Linux kernel <code className="font-mono text-slate-300">binfmt_misc</code> system, enabling seamless cross-execution of ARM64 Zypper, Combustion, and Kiwi scripts without manual virtualization.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              3. Multi-Node NMState Declarations
            </h4>
            <p>
              For edge appliances with multiple nodes, network predictability is critical. Instead of relying on DHCP (which can vary across reboots), NMState allows you to bind IP addresses directly to physical network interfaces matching their hardware MAC address.
            </p>
            <p>
              The wizard creates individual files under <code className="font-mono text-slate-300">network/node1.yaml</code>, <code className="font-mono text-slate-300">network/node2.yaml</code>, etc., which EIB automatically parses and applies during installation.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              4. Execution Workflow
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-300">
              <li>
                Download the workspace bundle ZIP and transfer it to your Linux build host.
              </li>
              <li>
                Unzip the workspace: <code className="font-mono text-slate-200">unzip suse-eib-*.zip -d edge-build/ && cd edge-build</code>
              </li>
              <li>
                Execute the hardened runner: <code className="font-mono text-emerald-300">./build.sh</code>
              </li>
              <li>
                Write the output ISO to bootable USB installation media or mount it via virtual media:
                <pre className="mt-1 p-2 rounded bg-slate-950 font-mono text-slate-300 border border-slate-800">
                  sudo dd if=suse-edge-appliance.iso of=/dev/sdX bs=4M status=progress oflag=sync
                </pre>
              </li>
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
