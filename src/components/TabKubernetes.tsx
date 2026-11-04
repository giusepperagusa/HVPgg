/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Tab 3: Kubernetes Stack, Cluster Token, Helm Charts & OCI Pre-caching.
 */

import React, { useState } from 'react';
import {
  Network,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  Package,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react';
import {
  EIBConfigState,
  KubernetesEngine,
  HelmChartItem,
  ContainerImageItem,
} from '../types/eib';

interface TabKubernetesProps {
  config: EIBConfigState;
  onChange: (updater: (prev: EIBConfigState) => EIBConfigState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TabKubernetes: React.FC<TabKubernetesProps> = ({
  config,
  onChange,
  onNext,
  onPrev,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);

  // New chart form state
  const [newChart, setNewChart] = useState<Omit<HelmChartItem, 'id'>>({
    name: '',
    repository: '',
    chart: '',
    version: '',
    targetNamespace: 'default',
    createNamespace: true,
  });
  const [showAddChart, setShowAddChart] = useState(false);

  // New image form state
  const [newImage, setNewImage] = useState<Omit<ContainerImageItem, 'id'>>({
    image: '',
    tag: 'latest',
    category: 'custom',
  });
  const [showAddImage, setShowAddImage] = useState(false);

  const handleGenerateToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = 'suse-edge-token-';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange((prev) => ({
      ...prev,
      k8sClusterToken: token,
    }));
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(config.k8sClusterToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleEngineChange = (engine: KubernetesEngine) => {
    const isRke2 = engine === 'rke2';
    const defaultVer = isRke2 ? 'v1.31.2+rke2r1' : 'v1.31.2+k3s1';
    onChange((prev) => ({
      ...prev,
      versions: {
        ...prev.versions,
        k8sEngine: engine,
        k8sVersion: defaultVer,
      },
    }));
  };

  const handleAddChart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChart.name || !newChart.repository) return;
    onChange((prev) => ({
      ...prev,
      helmCharts: [
        ...prev.helmCharts,
        {
          ...newChart,
          id: `chart-${Date.now()}`,
        },
      ],
    }));
    setNewChart({
      name: '',
      repository: '',
      chart: '',
      version: '',
      targetNamespace: 'default',
      createNamespace: true,
    });
    setShowAddChart(false);
  };

  const handleRemoveChart = (id: string) => {
    onChange((prev) => ({
      ...prev,
      helmCharts: prev.helmCharts.filter((c) => c.id !== id),
    }));
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.image) return;
    onChange((prev) => ({
      ...prev,
      containerImages: [
        ...prev.containerImages,
        {
          ...newImage,
          id: `img-${Date.now()}`,
        },
      ],
    }));
    setNewImage({
      image: '',
      tag: 'latest',
      category: 'custom',
    });
    setShowAddImage(false);
  };

  const handleRemoveImage = (id: string) => {
    onChange((prev) => ({
      ...prev,
      containerImages: prev.containerImages.filter((img) => img.id !== id),
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>03. Kubernetes Distribution, Cluster Security & Workloads</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure lightweight K3s or enterprise-hardened RKE2, cluster join token, and declare air-gapped Helm charts & container images.
        </p>
      </div>

      {/* Engine Selection: RKE2 vs K3s */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Kubernetes Engine <span className="text-emerald-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleEngineChange('rke2')}
            className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 ${
              config.versions.k8sEngine === 'rke2'
                ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">RKE2 (Government / Enterprise)</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                  FIPS 140-2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rancher Kubernetes Engine 2 — Next-generation hardened Kubernetes with CIS benchmarks built in.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleEngineChange('k3s')}
            className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 ${
              config.versions.k8sEngine === 'k3s'
                ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0 border border-slate-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">K3s (Lightweight Edge)</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  Resource Efficient
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fully compliant certified Kubernetes packaged as a single 50MB binary. Optimized for resource-constrained IoT gateways.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Cluster Security & Networking Block */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          Cluster Join Secret & API Endpoint
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Shared Cluster Join Token <span className="text-emerald-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateToken}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={config.k8sClusterToken}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  k8sClusterToken: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Required for secondary worker/control-plane nodes to join the master appliance.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              API Server VIP / Load Balancer Endpoint
            </label>
            <input
              type="text"
              value={config.apiServerVip}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  apiServerVip: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 192.168.10.10 or edge-api.corp"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Virtual IP for high-availability multi-node control planes.
            </p>
          </div>
        </div>

        {/* CNI Selector */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Container Network Interface (CNI) Plugin
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['cilium', 'calico', 'canal', 'flannel'].map((cni) => (
              <button
                key={cni}
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    versions: { ...prev.versions, cniPlugin: cni },
                  }))
                }
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition border ${
                  config.versions.cniPlugin === cni
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cni}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-packaged Helm Charts Manager */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Embedded Helm Charts</h3>
              <p className="text-xs text-slate-400">
                Pre-downloaded during build and installed automatically on first boot.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddChart(!showAddChart)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Helm Chart</span>
          </button>
        </div>

        {/* Add Chart Sub-Form */}
        {showAddChart && (
          <form
            onSubmit={handleAddChart}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Chart Release Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. my-app"
                  value={newChart.name}
                  onChange={(e) => setNewChart({ ...newChart, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Repository URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://charts.example.com"
                  value={newChart.repository}
                  onChange={(e) => setNewChart({ ...newChart, repository: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Target Namespace
                </label>
                <input
                  type="text"
                  required
                  placeholder="default"
                  value={newChart.targetNamespace}
                  onChange={(e) => setNewChart({ ...newChart, targetNamespace: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddChart(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Save Chart
              </button>
            </div>
          </form>
        )}

        {/* Existing Charts Table */}
        <div className="space-y-2">
          {config.helmCharts.map((chart) => (
            <div
              key={chart.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white font-mono">{chart.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      v{chart.version}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ns: {chart.targetNamespace}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{chart.repository}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveChart(chart.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                title="Remove Chart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Air-Gapped OCI Container Images */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Embedded OCI Container Images Registry
              </h3>
              <p className="text-xs text-slate-400">
                Air-gapped pre-caching: Stored directly into the installation ISO image.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddImage(!showAddImage)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Container Image</span>
          </button>
        </div>

        {/* Add Image Form */}
        {showAddImage && (
          <form
            onSubmit={handleAddImage}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Image Path (Repository & Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. docker.io/rancher/mirrored-pause"
                  value={newImage.image}
                  onChange={(e) => setNewImage({ ...newImage, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tag</label>
                <input
                  type="text"
                  required
                  placeholder="3.6"
                  value={newImage.tag}
                  onChange={(e) => setNewImage({ ...newImage, tag: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddImage(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Add Image
              </button>
            </div>
          </form>
        )}

        {/* Existing Images Pills */}
        <div className="flex flex-wrap gap-2">
          {config.containerImages.map((img) => (
            <div
              key={img.id}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200"
            >
              <span>{img.image}:{img.tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveImage(img.id)}
                className="text-slate-400 hover:text-rose-400 ml-1"
                aria-label={`Remove image ${img.image}`}
              >
                &times;
              </button>
            </div>
          ))}
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
          <span>Next: Nodes & Storage Topology</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};
