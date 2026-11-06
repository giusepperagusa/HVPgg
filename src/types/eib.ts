/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Data models and preset types for SUSE Edge Image Builder (EIB)
 * Provisioning & Execution Assistant (PEA).
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

export const EDGE_VERSION_PRESETS: Record<EdgeGeneration, EdgeVersionPreset> = {
  '3.6': {
    generation: '3.6',
    label: 'SUSE Edge 3.6 (Current Release)',
    releaseDate: 'Q3 2026',
    status: 'current',
    eibVersion: '3.6.0',
    freeOsName: 'openSUSE Leap Micro',
    freeOsVersion: '6.0',
    freeIsoUrlX86: 'https://download.opensuse.org/distribution/leap-micro/6.0/product/iso/openSUSE-Leap-Micro.x86_64-Default-SelfInstall.install.iso',
    freeIsoSha256X86: '9f2b847a281e09c855a024c085b3bc8f15893a9d9e6e3441a1c97a80ee2bfd7b',
    freeIsoUrlArm: 'https://download.opensuse.org/ports/aarch64/distribution/leap-micro/6.0/product/iso/openSUSE-Leap-Micro.aarch64-Default-SelfInstall.install.iso',
    freeIsoSha256Arm: 'a4c8f25e9821d3f8205b38f8373da9b5e523f04495c0cbe25ef1df11b2b8e391',
    commercialOsName: 'SUSE Linux Enterprise Micro',
    commercialOsVersion: '6.0',
    commercialIsoUrlX86: 'https://updates.suse.com/SUSE/Products/SLE-Micro/6.0/x86_64/product/iso/SLE-Micro-6.0-DVD-x86_64-GM-Media1.iso',
    commercialIsoSha256X86: 'd3b07384d113edec49eaa6238ad5ff00fc53a56ffc58a620e0d5a4bbff2c3886',
    commercialIsoUrlArm: 'https://updates.suse.com/SUSE/Products/SLE-Micro/6.0/aarch64/product/iso/SLE-Micro-6.0-DVD-aarch64-GM-Media1.iso',
    commercialIsoSha256Arm: '78923a9efb63200155b41297e68fa7075c2e5b882312b9d0426b3848b61c1e55',
    defaultRke2Version: 'v1.31.2+rke2r1',
    defaultK3sVersion: 'v1.31.2+k3s1',
    testedCni: ['cilium', 'calico', 'canal', 'flannel'],
    recommendedCharts: [
      {
        id: 'chart-metallb',
        name: 'metallb',
        repository: 'https://metallb.github.io/metallb',
        chart: 'metallb',
        version: '0.14.8',
        targetNamespace: 'metallb-system',
        createNamespace: true,
      },
      {
        id: 'chart-longhorn',
        name: 'longhorn',
        repository: 'https://charts.longhorn.io',
        chart: 'longhorn',
        version: '1.7.2',
        targetNamespace: 'longhorn-system',
        createNamespace: true,
      },
      {
        id: 'chart-nginx-ingress',
        name: 'ingress-nginx',
        repository: 'https://kubernetes.github.io/ingress-nginx',
        chart: 'ingress-nginx',
        version: '4.11.3',
        targetNamespace: 'ingress-nginx',
        createNamespace: true,
      },
    ],
    recommendedImages: [
      { id: 'img-1', image: 'rancher/pause', tag: '3.6', category: 'core' },
      { id: 'img-2', image: 'rancher/mirrored-coredns-coredns', tag: '1.11.3', category: 'core' },
      { id: 'img-3', image: 'quay.io/cilium/cilium', tag: 'v1.16.2', category: 'cni' },
      { id: 'img-4', image: 'longhornio/longhorn-manager', tag: 'v1.7.2', category: 'storage' },
    ],
  },
  '3.5': {
    generation: '3.5',
    label: 'SUSE Edge 3.5 (Previous Stable)',
    releaseDate: 'Q1 2026',
    status: 'previous-stable',
    eibVersion: '3.5.2',
    freeOsName: 'openSUSE Leap Micro',
    freeOsVersion: '5.5',
    freeIsoUrlX86: 'https://download.opensuse.org/distribution/leap-micro/5.5/product/iso/openSUSE-Leap-Micro.x86_64-Default-SelfInstall.install.iso',
    freeIsoSha256X86: '8e1b6a2f347c09d854a013b084b2bc7f14792a8d8e5e2330a0b87a70ee1bfd6a',
    freeIsoUrlArm: 'https://download.opensuse.org/ports/aarch64/distribution/leap-micro/5.5/product/iso/openSUSE-Leap-Micro.aarch64-Default-SelfInstall.install.iso',
    freeIsoSha256Arm: 'c3b7f14e8710d2f7104b27f7262da8b4e412f03384b0bbe14ef0df00b1b7e280',
    commercialOsName: 'SUSE Linux Enterprise Micro',
    commercialOsVersion: '5.5',
    commercialIsoUrlX86: 'https://updates.suse.com/SUSE/Products/SLE-Micro/5.5/x86_64/product/iso/SLE-Micro-5.5-DVD-x86_64-GM-Media1.iso',
    commercialIsoSha256X86: 'c2a06273c002dcda38d9951279cd4ee0eb42945eeb479510df49a3aafe1b2775',
    commercialIsoUrlArm: 'https://updates.suse.com/SUSE/Products/SLE-Micro/5.5/aarch64/product/iso/SLE-Micro-5.5-DVD-aarch64-GM-Media1.iso',
    commercialIsoSha256Arm: '6781298dea52199044a30186d57e96964b1d4a771201a8c9315a2737a50b0e44',
    defaultRke2Version: 'v1.30.5+rke2r1',
    defaultK3sVersion: 'v1.30.5+k3s1',
    testedCni: ['cilium', 'canal', 'calico', 'flannel'],
    recommendedCharts: [
      {
        id: 'chart-metallb',
        name: 'metallb',
        repository: 'https://metallb.github.io/metallb',
        chart: 'metallb',
        version: '0.13.12',
        targetNamespace: 'metallb-system',
        createNamespace: true,
      },
      {
        id: 'chart-longhorn',
        name: 'longhorn',
        repository: 'https://charts.longhorn.io',
        chart: 'longhorn',
        version: '1.6.2',
        targetNamespace: 'longhorn-system',
        createNamespace: true,
      },
    ],
    recommendedImages: [
      { id: 'img-1', image: 'rancher/pause', tag: '3.6', category: 'core' },
      { id: 'img-2', image: 'rancher/mirrored-coredns-coredns', tag: '1.10.1', category: 'core' },
      { id: 'img-3', image: 'quay.io/cilium/cilium', tag: 'v1.15.7', category: 'cni' },
    ],
  },
};

export const INITIAL_CONFIG_STATE: EIBConfigState = {
  environmentMode: 'free',
  targetArch: 'x86_64',
  kiwiPrepatch: false,
  baseIsoUrl: EDGE_VERSION_PRESETS['3.6'].freeIsoUrlX86,
  baseIsoSha256: EDGE_VERSION_PRESETS['3.6'].freeIsoSha256X86,
  proxy: {
    enabled: false,
    httpProxy: 'http://proxy.corp.internal:8080',
    httpsProxy: 'http://proxy.corp.internal:8080',
    noProxy: 'localhost,127.0.0.1,.internal,.corp,10.0.0.0/8,192.168.0.0/16',
    authEnabled: false,
    username: '',
    password: '',
  },
  scc: {
    regCode: '',
    email: '',
    sccUrl: 'https://scc.suse.com',
  },
  versions: {
    edgeGeneration: '3.6',
    eibVersion: '3.6.0',
    baseOsName: 'openSUSE Leap Micro',
    baseOsVersion: '6.0',
    k8sEngine: 'rke2',
    k8sVersion: 'v1.31.2+rke2r1',
    cniPlugin: 'cilium',
  },
  k8sClusterToken: 'edge-cluster-secret-token-' + Math.random().toString(36).substring(2, 10),
  apiServerVip: '192.168.10.10',
  helmCharts: [...EDGE_VERSION_PRESETS['3.6'].recommendedCharts],
  containerImages: [...EDGE_VERSION_PRESETS['3.6'].recommendedImages],
  targetDisk: '/dev/nvme0n1',
  customTargetDisk: '/dev/sdb',
  rootPasswordHash: '$6$rounds=656000$edgecluster$vR.89eK2XJ43fJkQ6oP2Fk8K9dJ3mN8L1oQ2W4eR5tY6uI7oP8aS9dF0gH1jK2lZ3x',
  sshAuthorizedKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyForEdgeClusterRootAccess admin@edge-ops',
  nodes: {
    node1: {
      enabled: true,
      role: 'master',
      hostname: 'edge-node-01',
      macAddress: '52:54:00:12:34:01',
      interfaceName: 'eth0',
      ipAddress: '192.168.10.11',
      cidr: 24,
      gateway: '192.168.10.1',
      dnsServers: ['1.1.1.1', '8.8.8.8'],
    },
    node2: {
      enabled: false,
      role: 'master',
      hostname: 'edge-node-02',
      macAddress: '52:54:00:12:34:02',
      interfaceName: 'eth0',
      ipAddress: '192.168.10.12',
      cidr: 24,
      gateway: '192.168.10.1',
      dnsServers: ['1.1.1.1', '8.8.8.8'],
    },
    node3: {
      enabled: false,
      role: 'master',
      hostname: 'edge-node-03',
      macAddress: '52:54:00:12:34:03',
      interfaceName: 'eth0',
      ipAddress: '192.168.10.13',
      cidr: 24,
      gateway: '192.168.10.1',
      dnsServers: ['1.1.1.1', '8.8.8.8'],
    },
  },
};
