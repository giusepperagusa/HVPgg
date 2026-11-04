/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Tab 4: Target Storage Device & Multi-Node Cluster NMState Networking.
 */

import React, { useState } from 'react';
import {
  HardDrive,
  Network,
  Server,
  KeyRound,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  EIBConfigState,
  TargetDisk,
  NodeNetworkConfig,
} from '../types/eib';

interface TabNodesStorageProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TabNodesStorage: React.FC<TabNodesStorageProps> = ({
  config,
  onChange,
  onNext,
  onPrev,
}) => {
  const [activeNodeKey, setActiveNodeKey] = useState<'node1' | 'node2' | 'node3'>('node1');

  const handleUpdateNode = (
    key: 'node1' | 'node2' | 'node3',
    patch: Partial<NodeNetworkConfig>
  ) => {
    onChange((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [key]: {
          ...prev.nodes[key],
          ...patch,
        },
      },
    }));
  };

  const handleUpdateDns = (
    key: 'node1' | 'node2' | 'node3',
    dnsString: string
  ) => {
    const servers = dnsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    handleUpdateNode(key, { dnsServers: servers });
  };

  const activeNode = config.nodes[activeNodeKey];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>04. Target Storage & Multi-Node NMState Networking</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Specify installation disk target and configure static IP addresses, gateways, and hardware MAC-based NMState mapping for up to 3 cluster nodes.
        </p>
      </div>

      {/* Target Storage Device Configuration */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Target Installation Disk Device</h3>
            <p className="text-xs text-slate-400">
              The EIB installer will partition and format this physical block device automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: '/dev/nvme0n1', label: 'NVMe Drive', sub: '/dev/nvme0n1' },
            { id: '/dev/sda', label: 'SATA / SAS Drive', sub: '/dev/sda' },
            { id: '/dev/vda', label: 'VirtIO Virtual Disk', sub: '/dev/vda' },
            { id: 'custom', label: 'Custom Device Path', sub: 'Manual path' },
          ].map((disk) => (
            <button
              key={disk.id}
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  targetDisk: disk.id as TargetDisk,
                }))
              }
              className={`p-3.5 rounded-xl border text-left transition ${
                config.targetDisk === disk.id
                  ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="text-xs font-bold text-white">{disk.label}</div>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{disk.sub}</div>
            </button>
          ))}
        </div>

        {config.targetDisk === 'custom' && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Block Device Path
            </label>
            <input
              type="text"
              value={config.customTargetDisk}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  customTargetDisk: e.target.value,
                }))
              }
              placeholder="/dev/disk/by-id/nvme-..."
              className="w-full sm:w-96 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Multi-Node Networking Topology (Up to 3 Nodes) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Multi-Node Cluster Topology & NMState Profiles
              </h3>
              <p className="text-xs text-slate-400">
                NMState configurations will be generated in <code className="font-mono text-slate-300">network/*.yaml</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Node Tabs Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          {(['node1', 'node2', 'node3'] as const).map((key, idx) => {
            const node = config.nodes[key];
            const isActive = activeNodeKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveNodeKey(key)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-slate-700 text-white shadow-sm ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    node.enabled ? (node.role === 'master' ? 'bg-emerald-400' : 'bg-cyan-400') : 'bg-slate-600'
                  }`}
                />
                <span>Node {idx + 1}: {node.hostname}</span>
                {idx === 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    Master
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Node Detail Card */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {activeNodeKey === 'node1' ? 'Node 1 (Appliance Master / Control Plane)' : `Node ${activeNodeKey === 'node2' ? '2' : '3'} Configuration`}
              </span>
            </div>

            {activeNodeKey !== 'node1' && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={activeNode.enabled}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { enabled: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                />
                <span>Enable this node in cluster bundle</span>
              </label>
            )}
          </div>

          {activeNode.enabled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hostname <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={activeNode.hostname}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { hostname: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  MAC Address (NMState Interface Binding) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="52:54:00:12:34:56"
                  value={activeNode.macAddress}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { macAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Interface Device Name
                </label>
                <input
                  type="text"
                  required
                  value={activeNode.interfaceName}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { interfaceName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Static IPv4 Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="192.168.10.11"
                  value={activeNode.ipAddress}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { ipAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subnet CIDR Prefix (e.g. 24 for 255.255.255.0)
                </label>
                <input
                  type="number"
                  min="8"
                  max="32"
                  value={activeNode.cidr}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { cidr: parseInt(e.target.value) || 24 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Gateway IPv4 <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="192.168.10.1"
                  value={activeNode.gateway}
                  onChange={(e) => handleUpdateNode(activeNodeKey, { gateway: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  DNS Resolvers (comma-separated IP addresses)
                </label>
                <input
                  type="text"
                  value={activeNode.dnsServers.join(', ')}
                  onChange={(e) => handleUpdateDns(activeNodeKey, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="1.1.1.1, 8.8.8.8"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              This node is currently disabled. Toggle &quot;Enable this node in cluster bundle&quot; to include it in the appliance recipe.
            </div>
          )}
        </div>
      </div>

      {/* Access Credentials & Hardening */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Appliance OS Access Credentials</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Encrypted Root Password Hash (SHA-512 crypt)
            </label>
            <input
              type="text"
              value={config.rootPasswordHash}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  rootPasswordHash: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Pre-hashed via <code className="font-mono">openssl passwd -6</code> for secure unattended ignition.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Root SSH Authorized Public Key
            </label>
            <input
              type="text"
              value={config.sshAuthorizedKey}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  sshAuthorizedKey: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono"
              placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5..."
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Instantly allows passwordless SSH login to all provisioned nodes.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition active:scale-95"
        >
          <span>Next: Review & Export Bundle</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};
