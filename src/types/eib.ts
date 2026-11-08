/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Data models and preset types for HVPgg Wizard
 * (Hardware to Value Project "green generation" Appliance Builder).
 */

export type EnvironmentMode = 'free' | 'commercial';
export type HardwareArch = 'x86_64' | 'aarch64';
export type KubernetesEngine = 'rke2' | 'k3s';
export type EdgeGeneration = '3.6' | '3.5';
export type TargetDisk = '/dev/nvme0n1' | '/dev/sda' | '/dev/vda' | 'custom';

export interface ProxyConfig {
  enabled: boolean;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  authEnabled: boolean;
  username?: string;
  password?: string;
}

export interface SCCConfig {
  regCode: string;
  email: string;
  sccUrl: string;
}

export interface HelmChartItem {
  id: string;
  name: string;
  repository: string;
  chart: string;
  version: string;
  targetNamespace: string;
  createNamespace: boolean;
  valuesContent?: string;
}

export interface ContainerImageItem {
  id: string;
  image: string;
  tag: string;
  category: 'core' | 'cni' | 'storage' | 'custom';
}

export interface NodeNetworkConfig {
  enabled: boolean;
  role: 'master' | 'worker';
  hostname: string;
  macAddress: string;
  interfaceName: string;
  ipAddress: string;
  cidr: number;
  gateway: string;
  dnsServers: string[];
}

export interface ComponentVersions {
  edgeGeneration: EdgeGeneration;
  eibVersion: string;
  baseOsName: string;
  baseOsVersion: string;
  k8sEngine: KubernetesEngine;
  k8sVersion: string;
  cniPlugin: string;
}

export interface EIBConfigState {
  environmentMode: EnvironmentMode;
  targetArch: HardwareArch;
  kiwiPrepatch: boolean;
  baseIsoUrl: string;
  baseIsoSha256: string;
  proxy: ProxyConfig;
  scc: SCCConfig;
  versions: ComponentVersions;
  k8sClusterToken: string;
  apiServerVip: string;
  helmCharts: HelmChartItem[];
  containerImages: ContainerImageItem[];
  targetDisk: TargetDisk;
  customTargetDisk: string;
  rootPasswordHash: string;
  sshAuthorizedKey: string;
  nodes: {
    node1: NodeNetworkConfig;
    node2: NodeNetworkConfig;
    node3: NodeNetworkConfig;
  };
}

export interface EdgeVersionPreset {
  generation: EdgeGeneration;
  label: string;
  releaseDate: string;
  status: 'current' | 'previous-stable';
  eibVersion: string;
  freeOsName: string;
  freeOsVersion: string;
  freeIsoUrlX86: string;
  freeIsoSha256X86: string;
  freeIsoUrlArm: string;
  freeIsoSha256Arm: string;
  commercialOsName: string;
  commercialOsVersion: string;
  commercialIsoUrlX86: string;
  commercialIsoSha256X86: string;
  commercialIsoUrlArm: string;
  commercialIsoSha256Arm: string;
  defaultRke2Version: string;
  defaultK3sVersion: string;
  testedCni: string[];
  recommendedCharts: HelmChartItem[];
  recommendedImages: ContainerImageItem[];
}

// Centralized presets and defaults are maintained in src/config/eibDefaults.ts
// Re-exported here to ensure backward compatibility across all modules and tests.
export { EDGE_VERSION_PRESETS, INITIAL_CONFIG_STATE } from '../config/eibDefaults';

