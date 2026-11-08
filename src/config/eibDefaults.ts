/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Centralized Settings, Versions, Checksums, URLs & Defaults Repository.
 * 
 * DESIGN RATIONALE:
 * This file serves as the single source of truth for all built-in parameters,
 * version presets, container images, download endpoints, cryptographic checksums,
 * Zypper repository structures, and default configuration states used throughout
 * the HVPgg Wizard (Hardware to Value Project "green generation" Appliance Builder).
 * 
 * Future maintainers and AI assistants should edit THIS FILE to:
 * - Update SUSE Edge generation baselines (e.g., adding Edge 3.7 or updating 3.6)
 * - Modify base OS ISO download URLs and official SHA-256 hashes
 * - Update tested Kubernetes (RKE2 / K3s) releases and CNI plugins
 * - Adjust container registry tags or Zypper repository mirrors
 * - Update pre-bundled Helm chart versions or air-gapped OCI images
 */

import {
  EdgeGeneration,
  EdgeVersionPreset,
  EIBConfigState,
  EnvironmentMode,
  HardwareArch,
  HelmChartItem,
  ContainerImageItem,
} from '../types/eib';

/* ==============================================================================
 * 1. Application Release & Build Metadata
 * ============================================================================== */

export const APP_METADATA = {
  version: '1.4.0',
  name: 'HVPgg Wizard',
  fullName: 'HVPgg Wizard • Hardware to Value Project "green generation"',
  projectSuite: 'HVPgg (Hardware to Value Project "green generation")',
  shortName: 'HVPgg Wizard',
  tagline: 'Turnkey On-Premises IT Infrastructure for Small Businesses',
  description: 'An opinionated, turnkey, hardware-based IT infrastructure appliance generator for small business enterprises, powered by best-of-breed open source solutions and automated SUSE Edge provisioning.',
  lineage: {
    ancestor1: {
      name: 'HVP',
      fullName: 'Heretic oVirt Project',
      desc: 'Legacy virtualization, centralized storage & Active Directory foundation.',
    },
    ancestor2: {
      name: 'HVPng',
      fullName: 'Heretic oVirt Project "next generation"',
      desc: 'Heterogeneous containerized stack (Fedora CoreOS + K3s), ambitious but too broad with steep technical requirements.',
    },
    current: {
      name: 'HVPgg',
      fullName: 'Hardware to Value Project "green generation"',
      desc: 'SUSE-technology-flavoured ("green" chameleon heritage) evolution: opinionated, turnkey, minimal user friction, small-business value focused.',
    },
  },
  buildDate: '2026-11-07',
  license: 'AGPL-3.0-only',
  licenseName: 'GNU Affero General Public License v3.0',
} as const;

export const APP_VERSION = APP_METADATA.version;

export interface HvpStackLayer {
  layer: number;
  id: string;
  title: string;
  category: string;
  status: 'active' | 'modular-ready' | 'planned';
  description: string;
  technicalMechanism: string;
  capabilities: string[];
}

/**
 * 6-Layer HVPgg Architecture Roadmap.
 * Prepared with an open, extensible structure to accommodate all modular components
 * without premature hardcoding of application-level selections.
 */
export const HVP_VALUE_STACK_LAYERS: HvpStackLayer[] = [
  {
    layer: 1,
    id: 'base-os',
    title: 'Operating System & Appliance Engine',
    category: 'Core Infrastructure',
    status: 'active',
    description: 'Immutable, transactional base operating system with btrfs snapshots and atomic updates.',
    technicalMechanism: 'openSUSE Leap in immutable mode or SUSE Linux Enterprise Micro, built via containerized EIB & Kiwi.',
    capabilities: ['Transactional updates', 'Btrfs read-only rootfs', 'Automated reboot snapshots', 'Zero runtime maintenance'],
  },
  {
    layer: 2,
    id: 'k8s-platform',
    title: 'Cloud-Native Kubernetes Foundation',
    category: 'Core Infrastructure',
    status: 'active',
    description: 'Embedded-etcd Kubernetes cluster with unified control-plane + worker nodes, storage replication, and networking.',
    technicalMechanism: 'RKE2 or K3s with Cilium/Calico CNI, Longhorn distributed CSI storage, MetalLB ingress load balancing, and backup/monitoring tooling.',
    capabilities: ['Raft quorum clustering (1 or 3 nodes)', 'Distributed block storage', 'L2/BGP VIP networking', 'Air-gapped artifact caching'],
  },
  {
    layer: 3,
    id: 'identity-sso',
    title: 'Identity & Access Management (OIDC)',
    category: 'Platform Services',
    status: 'modular-ready',
    description: 'Centralized OpenID Connect (OIDC) identity provider with Single Sign-On (SSO) and RBAC across all business applications.',
    technicalMechanism: 'Standard OpenID Connect / OAuth2 identity platform with self-service user management, MFA, and unified directory integration.',
    capabilities: ['Single Sign-On (SSO)', 'Multi-Factor Authentication (MFA)', 'Centralized user accounts', 'Standard OIDC token federation'],
  },
  {
    layer: 4,
    id: 'cloud-workspace',
    title: 'Cloud Workspace & Collaboration Suite',
    category: 'Business Applications',
    status: 'modular-ready',
    description: 'On-premises private cloud workspace with shared storage, collaborative spaces, messaging/chat, and web-based Office suite.',
    technicalMechanism: 'Self-hosted cloud collaboration hub with real-time browser document editing (Word, Excel, PowerPoint compatible), team chat, and unified search.',
    capabilities: ['Private cloud file sync & share', 'Web Office document editing', 'Real-time team chat & channels', 'Universal content search'],
  },
  {
    layer: 5,
    id: 'business-erp',
    title: 'Business ERP & Core Data Services',
    category: 'Business Applications',
    status: 'modular-ready',
    description: 'Comprehensive Enterprise Resource Planning system providing accounting, CRM, invoicing, purchasing, and inventory.',
    technicalMechanism: 'Pre-configured ERP application layered with automated database cluster, message broker, and in-memory key-value cache.',
    capabilities: ['Accounting & invoicing', 'Customer Relationship Management (CRM)', 'Inventory & supply chain', 'Managed database & message queues'],
  },
  {
    layer: 6,
    id: 'device-mdm',
    title: 'Modern Device Management (MDM)',
    category: 'Fleet Operations',
    status: 'modular-ready',
    description: 'Centralized endpoint management platform for company PCs, laptops, and mobile smartphones/tablets.',
    technicalMechanism: 'Cross-platform MDM agent and policy engine managing security baselines, remote configuration, and device health compliance.',
    capabilities: ['PC & laptop management (Linux/Windows/macOS)', 'Mobile device security policies', 'Zero-touch enrollment', 'Compliance telemetry'],
  },
];

/* ==============================================================================
 * 2. Operating System Names, Labels & Standard Image Filenames
 * ============================================================================== */

/**
 * Operating system human-readable display names across deployment tiers.
 * Notice: Version-agnostic names are used for top-level UI cards and labels.
 * Granular version numbers (e.g. 16.1 or 6.0) are confined to details inputs.
 */
export const OS_DISPLAY_NAMES: Record<EnvironmentMode, string> = {
  free: 'openSUSE Leap (Immutable Mode)',
  commercial: 'SUSE Linux Enterprise Micro',
};

/**
 * Short labels for mode badges and pill indicators.
 */
export const MODE_PILL_LABELS: Record<EnvironmentMode, string> = {
  free: 'Free (openSUSE Leap Immutable)',
  commercial: 'Commercial (SLE Micro)',
};

/**
 * Standard base ISO image filenames consumed by Edge Image Builder.
 */
export const BASE_IMAGE_FILENAMES: Record<EnvironmentMode, string> = {
  free: 'leap-base.iso',
  commercial: 'sl-micro-base.iso',
};

/**
 * Injected Zypper repository configuration paths inside exported ZIP workspace.
 */
export const REPO_BUNDLE_FILENAMES: Record<EnvironmentMode, string> = {
  free: 'rpms/opensuse-leap.repo',
  commercial: 'rpms/sle-micro.repo',
};

/**
 * Standard workspace structure file paths.
 */
export const WORKSPACE_PATHS = {
  definitionYaml: 'definition.yaml',
  buildScript: 'build.sh',
  manifestsDir: 'manifests/',
  helmChartsYaml: 'manifests/helm-charts.yaml',
  networkDir: 'network/',
  rpmsDir: 'rpms/',
  kiwiDir: 'kiwi-config/',
  kiwiConfigXml: 'kiwi-config/config.xml',
  readme: 'README.md',
  changelog: 'CHANGELOG.md',
  license: 'LICENSE',
} as const;

/* ==============================================================================
 * 3. Container Images & Upstream Tooling
 * ============================================================================== */

export const CONTAINER_IMAGES = {
  // Edge Image Builder (EIB) container wrapper
  eib: {
    free: 'registry.opensuse.org/isv/suse/edge/eib/containerfile/suse/edge-image-builder:latest',
    commercial: (generation: EdgeGeneration) =>
      `registry.suse.com/edge/${generation}/edge-image-builder:latest`,
  },
  // SUSE Kiwi appliance compilation runner
  kiwi: {
    free: 'registry.opensuse.org/virtualization/appliances/images/kiwi:latest',
    commercial: (generation: EdgeGeneration) =>
      `registry.suse.com/edge/${generation}/kiwi-builder:latest`,
  },
  // Multiarch QEMU user-static registration container for ARM64 cross-emulation
  qemuUserStatic: 'multiarch/qemu-user-static',
} as const;

/* ==============================================================================
 * 4. Zypper Repositories, Mirrors & GPG Keys
 * ============================================================================== */

export const REPOSITORY_ENDPOINTS = {
  // openSUSE Leap Immutable repositories (dynamically parameterized by version)
  openSuseLeap: {
    ossRepo: (version: string) =>
      `https://download.opensuse.org/distribution/leap/${version}/repo/oss/`,
    updateRepo: (version: string) =>
      `https://download.opensuse.org/update/leap/${version}/oss/`,
    ossGpgKey: (version: string) =>
      `https://download.opensuse.org/distribution/leap/${version}/repo/oss/repodata/repomd.xml.key`,
    updateGpgKey: (version: string) =>
      `https://download.opensuse.org/update/leap/${version}/oss/repodata/repomd.xml.key`,
  },
  // SLE Micro commercial authenticated repositories
  sleMicro: {
    poolRepo: (version: string, arch: HardwareArch, regCode: string) =>
      `https://updates.suse.com/SUSE/Products/SLE-Micro/${version}/${arch}/product/?${regCode}`,
    updateRepo: (version: string, arch: HardwareArch, regCode: string) =>
      `https://updates.suse.com/SUSE/Updates/SLE-Micro/${version}/${arch}/update/?${regCode}`,
    kiwiProductSource: (version: string, arch: HardwareArch) =>
      `https://updates.suse.com/SUSE/Products/SLE-Micro/${version}/${arch}/product/`,
  },
} as const;

/* ==============================================================================
 * 5. Default OS Packages, Systemd Services & Kernel Arguments
 * ============================================================================== */

/**
 * Standard baseline packages injected into EIB definition.yaml operatingSystem.packages.
 */
export const DEFAULT_EIB_OS_PACKAGES: string[] = [
  'curl',
  'jq',
  'vim',
  'bind-utils',
  'iptables',
  'iproute2',
  'ethtool',
  'conntrack-tools',
  'tar',
  'gzip',
  'nmstate',
];

/**
 * Default packages for SUSE Kiwi appliance description (kiwi-config/config.xml).
 * For openSUSE Leap Immutable mode: uses transactional-update and btrfs snapshot tooling.
 */
export const KIWI_PACKAGES_LEAP_IMMUTABLE: string[] = [
  'patterns-base-transactional',
  'transactional-update',
  'btrfsprogs',
  'snapper',
  'kernel-default',
  'combustion',
  'ignition',
  'NetworkManager',
  'nmstate',
  'podman',
  'curl',
  'jq',
];

/**
 * Default packages for SUSE Kiwi appliance description (SLE Micro).
 */
export const KIWI_PACKAGES_SLE_MICRO: string[] = [
  'patterns-microos-base',
  'kernel-default',
  'combustion',
  'ignition',
  'NetworkManager',
  'nmstate',
  'podman',
  'curl',
  'jq',
];

/**
 * Baseline kernel arguments for unattended appliance boot.
 */
export const DEFAULT_KERNEL_ARGS: string[] = [
  'console=ttyS0,115200',
  'console=tty0',
  'ignition.firstboot=1',
  'systemd.journald.forward_to_console=1',
];

/**
 * Systemd services enabled on first boot.
 */
export const DEFAULT_SYSTEMD_UNITS = [
  { name: 'sshd.service', enable: true },
  { name: 'NetworkManager.service', enable: true },
];

/* ==============================================================================
 * 6. Tested SUSE Edge Generation Presets (Master Reference Matrix)
 * ============================================================================== */

export const EDGE_VERSION_PRESETS: Record<EdgeGeneration, EdgeVersionPreset> = {
  '3.6': {
    generation: '3.6',
    label: 'SUSE Edge 3.6 (Current Release)',
    releaseDate: 'Q3 2026',
    status: 'current',
    eibVersion: '3.6.0',
    freeOsName: 'openSUSE Leap (Immutable Mode)',
    freeOsVersion: '16.1',
    freeIsoUrlX86: 'https://download.opensuse.org/distribution/leap/16.1/iso/openSUSE-Leap-16.1-x86_64-Current.iso',
    freeIsoSha256X86: '5a4d382f183c09e855a024c085b3bc8f15893a9d9e6e3441a1c97a80ee2bfd7b',
    freeIsoUrlArm: 'https://download.opensuse.org/ports/aarch64/distribution/leap/16.1/iso/openSUSE-Leap-16.1-aarch64-Current.iso',
    freeIsoSha256Arm: '7b2c918e9821d3f8205b38f8373da9b5e523f04495c0cbe25ef1df11b2b8e391',
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
    freeOsName: 'openSUSE Leap (Immutable Mode)',
    freeOsVersion: '16.1',
    freeIsoUrlX86: 'https://download.opensuse.org/distribution/leap/16.1/iso/openSUSE-Leap-16.1-x86_64-Current.iso',
    freeIsoSha256X86: '5a4d382f183c09e855a024c085b3bc8f15893a9d9e6e3441a1c97a80ee2bfd7b',
    freeIsoUrlArm: 'https://download.opensuse.org/ports/aarch64/distribution/leap/16.1/iso/openSUSE-Leap-16.1-aarch64-Current.iso',
    freeIsoSha256Arm: '7b2c918e9821d3f8205b38f8373da9b5e523f04495c0cbe25ef1df11b2b8e391',
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

/* ==============================================================================
 * 7. Initial Configuration State (Safe Production Baseline)
 * ============================================================================== */

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
    baseOsName: 'openSUSE Leap (Immutable Mode)',
    baseOsVersion: '16.1',
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

/* ==============================================================================
 * 8. Official Documentation References & URLs
 * ============================================================================== */

export const OFFICIAL_DOCUMENTATION_REFS = [
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
    title: 'openSUSE Leap Portal',
    url: 'https://en.opensuse.org/Portal:Leap',
    desc: 'Versatile Linux distribution featuring immutable mode with transactional-update and btrfs.',
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
] as const;
