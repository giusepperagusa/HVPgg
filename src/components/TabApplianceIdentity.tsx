/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Step 2: Network & Appliance Identity (User-Friendly Business Configuration)
 * Foreground: Appliance Domain, Machine Hostnames, Static IPs, and Target Disk.
 * Technical translations (NMState YAML, CIDR notation, block devices)
 * are provided as subtitles, badges, and helper notes.
 */

import React from 'react';
import {
  Network,
  HardDrive,
  Globe,
  Server,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { EIBConfigState, TargetDisk } from '../types/eib';

interface TabApplianceIdentityProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
}

export const TabApplianceIdentity: React.FC<TabApplianceIdentityProps> = ({
  config,
  onChange,
}) => {
  const isHA = config.nodes.node2.enabled && config.nodes.node3.enabled;

  const handleDiskSelect = (disk: TargetDisk) => {
    onChange((prev) => ({
      ...prev,
      targetDisk: disk,
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>02. Network & Appliance Identity</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Specify local network addresses, domain name, and the physical installation drive. HVPgg generates declarative host networking without requiring manual console configuration.
        </p>
      </div>

      {/* 1. APPLIANCE DOMAIN & VIP */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Appliance Network Domain</h3>
            <p className="text-xs text-slate-400">
              Internal local domain for services, web workspace, and application dashboards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Local Network Domain Name
            </label>
            <input
              type="text"
              defaultValue="office.local"
              placeholder="e.g. company.local or office.internal"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used for automatic local DNS search resolution
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cluster Access Virtual IP (VIP) {isHA && <span className="text-emerald-400">*</span>}
            </label>
            <input
              type="text"
              value={config.apiServerVip}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  apiServerVip: e.target.value.trim(),
                }))
              }
              placeholder="e.g. 192.168.10.10"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Shared high-availability floating IP address across all nodes
            </p>
          </div>
        </div>
      </div>

      {/* 2. NODE IP & HOSTNAME ASSIGNMENTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Machine Hostnames & Static IP Addresses</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHA
                ? 'Configuring 3 unified High-Availability nodes (Leader + 2 Quorum Members)'
                : 'Configuring Single Compact Appliance node'}
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Declarative NMState Profiles
          </span>
        </div>

        {/* Node 1 */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                Node 1 {isHA ? '(Leader Seed Node)' : '(Solo Appliance)'}
              </h4>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Primary Node</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Machine Hostname
              </label>
              <input
                type="text"
                value={config.nodes.node1.hostname}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    nodes: {
                      ...prev.nodes,
                      node1: { ...prev.nodes.node1, hostname: e.target.value },
                    },
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Static IP Address
              </label>
              <input
                type="text"
                value={config.nodes.node1.ipAddress}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    nodes: {
                      ...prev.nodes,
                      node1: { ...prev.nodes.node1, ipAddress: e.target.value },
                    },
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Gateway IP
              </label>
              <input
                type="text"
                value={config.nodes.node1.gateway}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    nodes: {
                      ...prev.nodes,
                      node1: { ...prev.nodes.node1, gateway: e.target.value },
                    },
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Subnet Mask (CIDR)
              </label>
              <input
                type="number"
                value={config.nodes.node1.cidr}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    nodes: {
                      ...prev.nodes,
                      node1: { ...prev.nodes.node1, cidr: parseInt(e.target.value) || 24 },
                    },
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Node 2 & 3 (Only when HA is enabled) */}
        {isHA && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {/* Node 2 */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Node 2 (HA Quorum Member)
                  </h4>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Hostname</label>
                  <input
                    type="text"
                    value={config.nodes.node2.hostname}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        nodes: {
                          ...prev.nodes,
                          node2: { ...prev.nodes.node2, hostname: e.target.value },
                        },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Static IP</label>
                  <input
                    type="text"
                    value={config.nodes.node2.ipAddress}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        nodes: {
                          ...prev.nodes,
                          node2: { ...prev.nodes.node2, ipAddress: e.target.value },
                        },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Node 3 */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Node 3 (HA Quorum Member)
                  </h4>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Hostname</label>
                  <input
                    type="text"
                    value={config.nodes.node3.hostname}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        nodes: {
                          ...prev.nodes,
                          node3: { ...prev.nodes.node3, hostname: e.target.value },
                        },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Static IP</label>
                  <input
                    type="text"
                    value={config.nodes.node3.ipAddress}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        nodes: {
                          ...prev.nodes,
                          node3: { ...prev.nodes.node3, ipAddress: e.target.value },
                        },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. PRIMARY STORAGE INSTALLATION DISK */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Target Installation Drive <span className="text-emerald-400">*</span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            The target storage disk partitioned automatically during automated unattended installation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* NVMe */}
          <button
            type="button"
            onClick={() => handleDiskSelect('/dev/nvme0n1')}
            className={`p-4 rounded-xl border text-left transition ${
              config.targetDisk === '/dev/nvme0n1'
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-emerald-400 font-bold">/dev/nvme0n1</span>
              {config.targetDisk === '/dev/nvme0n1' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">Fast NVMe SSD</div>
            <p className="text-[11px] text-slate-400 mt-1">Recommended for fast databases & cloud storage</p>
          </button>

          {/* SATA / SAS */}
          <button
            type="button"
            onClick={() => handleDiskSelect('/dev/sda')}
            className={`p-4 rounded-xl border text-left transition ${
              config.targetDisk === '/dev/sda'
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-slate-300 font-bold">/dev/sda</span>
              {config.targetDisk === '/dev/sda' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">SATA / SAS Drive</div>
            <p className="text-[11px] text-slate-400 mt-1">Standard 2.5" SSD or 3.5" enterprise disk</p>
          </button>

          {/* VirtIO */}
          <button
            type="button"
            onClick={() => handleDiskSelect('/dev/vda')}
            className={`p-4 rounded-xl border text-left transition ${
              config.targetDisk === '/dev/vda'
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-slate-300 font-bold">/dev/vda</span>
              {config.targetDisk === '/dev/vda' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">Virtual Machine Disk</div>
            <p className="text-[11px] text-slate-400 mt-1">KVM, Proxmox, QEMU, or OpenStack VirtIO</p>
          </button>

          {/* Custom */}
          <button
            type="button"
            onClick={() => handleDiskSelect('custom')}
            className={`p-4 rounded-xl border text-left transition ${
              config.targetDisk === 'custom'
                ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-slate-300 font-bold">Custom</span>
              {config.targetDisk === 'custom' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </div>
            <div className="text-xs font-bold text-white">Custom Block Device</div>
            <p className="text-[11px] text-slate-400 mt-1">Hardware RAID or custom storage path</p>
          </button>
        </div>

        {config.targetDisk === 'custom' && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 animate-fadeIn text-xs">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Custom Block Device Path
            </label>
            <input
              type="text"
              value={config.customTargetDisk}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  customTargetDisk: e.target.value.trim(),
                }))
              }
              placeholder="/dev/cciss/c0d0"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

    </div>
  );
};
