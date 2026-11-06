/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Future-proof YAML profile serialization, normalization, backward-compatibility
 * migrations, and visual profile diff comparison.
 */

import * as yaml from 'js-yaml';
import { EIBConfigState, INITIAL_CONFIG_STATE, EDGE_VERSION_PRESETS, EdgeGeneration } from '../types/eib';
import {
  EIBProfile,
  ProfileExportEnvelope,
  CURRENT_PROFILE_SCHEMA_VERSION,
  ProfileDiffField,
} from '../types/profile';
import { decryptProfilePayload, encryptProfilePayload } from './profileCrypto';

/**
 * Normalizes an imported config object, filling in missing fields with defaults
 * from INITIAL_CONFIG_STATE and adapting presets. Ensures future-proofing when
 * new features or fields are added in later versions.
 */
export function normalizeEIBConfig(raw: unknown): EIBConfigState {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(INITIAL_CONFIG_STATE));
  }

  const r = raw as Record<string, unknown>;
  const base = JSON.parse(JSON.stringify(INITIAL_CONFIG_STATE)) as EIBConfigState;

  // Environment & Arch
  const environmentMode = (r.environmentMode === 'commercial' ? 'commercial' : 'free');
  const targetArch = (r.targetArch === 'aarch64' ? 'aarch64' : 'x86_64');
  const kiwiPrepatch = Boolean(r.kiwiPrepatch ?? base.kiwiPrepatch);

  // Versions
  const rVersions = (r.versions && typeof r.versions === 'object') ? (r.versions as Record<string, unknown>) : {};
  const edgeGen = (rVersions.edgeGeneration === '3.5' ? '3.5' : '3.6') as EdgeGeneration;
  const preset = EDGE_VERSION_PRESETS[edgeGen];

  const versions = {
    edgeGeneration: edgeGen,
    eibVersion: typeof rVersions.eibVersion === 'string' ? rVersions.eibVersion : preset.eibVersion,
    baseOsName: typeof rVersions.baseOsName === 'string' ? rVersions.baseOsName : (environmentMode === 'commercial' ? preset.commercialOsName : preset.freeOsName),
    baseOsVersion: typeof rVersions.baseOsVersion === 'string' ? rVersions.baseOsVersion : (environmentMode === 'commercial' ? preset.commercialOsVersion : preset.freeOsVersion),
    k8sEngine: (rVersions.k8sEngine === 'k3s' ? 'k3s' : 'rke2') as 'k3s' | 'rke2',
    k8sVersion: typeof rVersions.k8sVersion === 'string' ? rVersions.k8sVersion : (rVersions.k8sEngine === 'k3s' ? preset.defaultK3sVersion : preset.defaultRke2Version),
    cniPlugin: typeof rVersions.cniPlugin === 'string' ? rVersions.cniPlugin : base.versions.cniPlugin,
  };

  // Base ISO URL & Checksum (fallback to official presets if empty)
  let baseIsoUrl = typeof r.baseIsoUrl === 'string' ? r.baseIsoUrl : '';
  let baseIsoSha256 = typeof r.baseIsoSha256 === 'string' ? r.baseIsoSha256 : '';

  if (!baseIsoUrl) {
    if (environmentMode === 'free') {
      baseIsoUrl = targetArch === 'aarch64' ? preset.freeIsoUrlArm : preset.freeIsoUrlX86;
    } else {
      baseIsoUrl = targetArch === 'aarch64' ? preset.commercialIsoUrlArm : preset.commercialIsoUrlX86;
    }
  }

  if (!baseIsoSha256) {
    if (environmentMode === 'free') {
      baseIsoSha256 = targetArch === 'aarch64' ? preset.freeIsoSha256Arm : preset.freeIsoSha256X86;
    } else {
      baseIsoSha256 = targetArch === 'aarch64' ? preset.commercialIsoSha256Arm : preset.commercialIsoSha256X86;
    }
  }

  // Proxy
  const rProxy = (r.proxy && typeof r.proxy === 'object') ? (r.proxy as Record<string, unknown>) : {};
  const proxy = {
    enabled: Boolean(rProxy.enabled ?? base.proxy.enabled),
    httpProxy: typeof rProxy.httpProxy === 'string' ? rProxy.httpProxy : base.proxy.httpProxy,
    httpsProxy: typeof rProxy.httpsProxy === 'string' ? rProxy.httpsProxy : base.proxy.httpsProxy,
    noProxy: typeof rProxy.noProxy === 'string' ? rProxy.noProxy : base.proxy.noProxy,
    authEnabled: Boolean(rProxy.authEnabled ?? base.proxy.authEnabled),
    username: typeof rProxy.username === 'string' ? rProxy.username : '',
    password: typeof rProxy.password === 'string' ? rProxy.password : '',
  };

  // SCC
  const rScc = (r.scc && typeof r.scc === 'object') ? (r.scc as Record<string, unknown>) : {};
  const scc = {
    regCode: typeof rScc.regCode === 'string' ? rScc.regCode : '',
    email: typeof rScc.email === 'string' ? rScc.email : '',
    sccUrl: typeof rScc.sccUrl === 'string' ? rScc.sccUrl : 'https://scc.suse.com',
  };

  // Target Disk & Auth
  const targetDisk = ['/dev/nvme0n1', '/dev/sda', '/dev/vda', 'custom'].includes(r.targetDisk as string)
    ? (r.targetDisk as EIBConfigState['targetDisk'])
    : base.targetDisk;

  const customTargetDisk = typeof r.customTargetDisk === 'string' ? r.customTargetDisk : base.customTargetDisk;
  const rootPasswordHash = typeof r.rootPasswordHash === 'string' ? r.rootPasswordHash : base.rootPasswordHash;
  const sshAuthorizedKey = typeof r.sshAuthorizedKey === 'string' ? r.sshAuthorizedKey : base.sshAuthorizedKey;
  const k8sClusterToken = typeof r.k8sClusterToken === 'string' ? r.k8sClusterToken : base.k8sClusterToken;
  const apiServerVip = typeof r.apiServerVip === 'string' ? r.apiServerVip : base.apiServerVip;

  // Helm Charts & Container Images arrays
  const helmCharts = Array.isArray(r.helmCharts)
    ? r.helmCharts.map((c: Record<string, unknown>, idx: number) => ({
        id: typeof c.id === 'string' ? c.id : `chart-${idx}`,
        name: typeof c.name === 'string' ? c.name : 'custom-chart',
        repository: typeof c.repository === 'string' ? c.repository : '',
        chart: typeof c.chart === 'string' ? c.chart : '',
        version: typeof c.version === 'string' ? c.version : '',
        targetNamespace: typeof c.targetNamespace === 'string' ? c.targetNamespace : 'default',
        createNamespace: Boolean(c.createNamespace ?? true),
        valuesContent: typeof c.valuesContent === 'string' ? c.valuesContent : '',
      }))
    : base.helmCharts;

  const containerImages = Array.isArray(r.containerImages)
    ? r.containerImages.map((img: Record<string, unknown>, idx: number) => ({
        id: typeof img.id === 'string' ? img.id : `img-${idx}`,
        image: typeof img.image === 'string' ? img.image : '',
        tag: typeof img.tag === 'string' ? img.tag : 'latest',
        category: (['core', 'cni', 'storage', 'custom'].includes(img.category as string)
          ? img.category
          : 'custom') as 'core' | 'cni' | 'storage' | 'custom',
      }))
    : base.containerImages;

  // Nodes (Node 1, Node 2, Node 3)
  const rNodes = (r.nodes && typeof r.nodes === 'object') ? (r.nodes as Record<string, unknown>) : {};
  const normalizeNode = (nRaw: unknown, fallback: EIBConfigState['nodes']['node1']) => {
    if (!nRaw || typeof nRaw !== 'object') return fallback;
    const n = nRaw as Record<string, unknown>;
    return {
      enabled: Boolean(n.enabled ?? fallback.enabled),
      role: (n.role === 'worker' ? 'worker' : 'master') as 'master' | 'worker',
      hostname: typeof n.hostname === 'string' ? n.hostname : fallback.hostname,
      macAddress: typeof n.macAddress === 'string' ? n.macAddress : fallback.macAddress,
      interfaceName: typeof n.interfaceName === 'string' ? n.interfaceName : fallback.interfaceName,
      ipAddress: typeof n.ipAddress === 'string' ? n.ipAddress : fallback.ipAddress,
      cidr: typeof n.cidr === 'number' ? n.cidr : fallback.cidr,
      gateway: typeof n.gateway === 'string' ? n.gateway : fallback.gateway,
      dnsServers: Array.isArray(n.dnsServers) ? n.dnsServers.map(String) : fallback.dnsServers,
    };
  };

  const rawNode1 = normalizeNode(rNodes.node1, base.nodes.node1);
  const rawNode2 = normalizeNode(rNodes.node2, base.nodes.node2);
  const rawNode3 = normalizeNode(rNodes.node3, base.nodes.node3);

  // Quorum Enforcement: Embedded-etcd requires either 1 node or 3 nodes.
  // 2-node clusters are disallowed due to lack of quorum fault tolerance and split-brain risks.
  // If an imported profile has exactly 2 nodes enabled (e.g. node2 enabled but not node3),
  // promote to 3-node HA quorum so multi-node intent and node settings are preserved safely.
  let node2Enabled = rawNode2.enabled;
  let node3Enabled = rawNode3.enabled;
  if (node2Enabled !== node3Enabled) {
    node2Enabled = true;
    node3Enabled = true;
  }

  const nodes = {
    node1: { ...rawNode1, enabled: true, role: 'master' as const },
    node2: { ...rawNode2, enabled: node2Enabled, role: 'master' as const },
    node3: { ...rawNode3, enabled: node3Enabled, role: 'master' as const },
  };

  return {
    environmentMode,
    targetArch,
    kiwiPrepatch,
    baseIsoUrl,
    baseIsoSha256,
    proxy,
    scc,
    versions,
    k8sClusterToken,
    apiServerVip,
    helmCharts,
    containerImages,
    targetDisk,
    customTargetDisk,
    rootPasswordHash,
    sshAuthorizedKey,
    nodes,
  };
}

/**
 * Serializes a single profile to human-readable, commented YAML.
 */
export function serializeProfileToCommentedYaml(profile: EIBProfile, appVersion = '1.3.2'): string {
  const envelope: ProfileExportEnvelope = {
    format: 'eib-profile',
    schemaVersion: CURRENT_PROFILE_SCHEMA_VERSION,
    appVersion,
    exportedAt: new Date().toISOString(),
    isEncrypted: false,
    profile: {
      ...profile,
      config: normalizeEIBConfig(profile.config),
    },
  };

  const yamlBody = yaml.dump(envelope, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  return `# ==============================================================================
# Edge Image Builder (EIB) - Profile Configuration File
# Compatible with SUSE Edge Image Builder
# ==============================================================================
# Profile Name : ${profile.name}
# Description  : ${profile.description.replace(/\n/g, ' ')}
# Created At   : ${profile.createdAt}
# Last Updated : ${profile.updatedAt}
# App Version  : ${appVersion}
# Schema Ver   : ${CURRENT_PROFILE_SCHEMA_VERSION}
#
# SECURITY WARNING:
# This file contains unencrypted configuration parameters, which may include
# sensitive tokens (k8sClusterToken, rootPasswordHash, SCC registration codes).
# Ensure this file is stored securely in your encrypted vault or access-controlled repo.
# ==============================================================================

${yamlBody}
`;
}

/**
 * Serializes multiple profiles into an encrypted YAML envelope using AES-256-GCM.
 */
export async function serializeProfileToEncryptedYaml(
  profileOrProfiles: EIBProfile | EIBProfile[],
  passphrase: string,
  appVersion = '1.3.2'
): Promise<string> {
  const isBundle = Array.isArray(profileOrProfiles);
  const plainTextEnvelope: ProfileExportEnvelope = {
    format: isBundle ? 'eib-profile-bundle' : 'eib-profile',
    schemaVersion: CURRENT_PROFILE_SCHEMA_VERSION,
    appVersion,
    exportedAt: new Date().toISOString(),
    isEncrypted: false,
    ...(isBundle
      ? { profiles: profileOrProfiles.map((p) => ({ ...p, config: normalizeEIBConfig(p.config) })) }
      : { profile: { ...profileOrProfiles, config: normalizeEIBConfig(profileOrProfiles.config) } }),
  };

  const plainText = yaml.dump(plainTextEnvelope, { indent: 2, lineWidth: 120, noRefs: true });
  const encryptedPayload = await encryptProfilePayload(plainText, passphrase);

  const envelope: ProfileExportEnvelope = {
    format: isBundle ? 'eib-profile-bundle' : 'eib-profile',
    schemaVersion: CURRENT_PROFILE_SCHEMA_VERSION,
    appVersion,
    exportedAt: new Date().toISOString(),
    isEncrypted: true,
    encryptedPayload,
  };

  const yamlBody = yaml.dump(envelope, { indent: 2, lineWidth: 120, noRefs: true });

  return `# ==============================================================================
# Edge Image Builder (EIB) - ENCRYPTED Profile File
# Compatible with SUSE Edge Image Builder
# ==============================================================================
# Encryption   : AES-256-GCM (PBKDF2 key derivation, 100,000 iterations, SHA-256)
# Exported At  : ${new Date().toISOString()}
# App Version  : ${appVersion}
# Schema Ver   : ${CURRENT_PROFILE_SCHEMA_VERSION}
#
# NOTE: This file is password-protected. The passphrase chosen during export
# will be required to decrypt and import this profile back into EIB-PEA.
# ==============================================================================

${yamlBody}
`;
}

/**
 * Serializes all profiles into a commented YAML bundle.
 */
export function serializeProfileBundleToCommentedYaml(profiles: EIBProfile[], appVersion = '1.3.2'): string {
  const envelope: ProfileExportEnvelope = {
    format: 'eib-profile-bundle',
    schemaVersion: CURRENT_PROFILE_SCHEMA_VERSION,
    appVersion,
    exportedAt: new Date().toISOString(),
    isEncrypted: false,
    profiles: profiles.map((p) => ({
      ...p,
      config: normalizeEIBConfig(p.config),
    })),
  };

  const yamlBody = yaml.dump(envelope, { indent: 2, lineWidth: 120, noRefs: true });

  return `# ==============================================================================
# Edge Image Builder (EIB) - Profile Bundle Backup (${profiles.length} Profiles)
# Compatible with SUSE Edge Image Builder
# ==============================================================================
# Exported At  : ${new Date().toISOString()}
# App Version  : ${appVersion}
# Schema Ver   : ${CURRENT_PROFILE_SCHEMA_VERSION}
#
# SECURITY WARNING:
# This bundle contains unencrypted operational profiles with cluster tokens and
# authentication keys. Store and transfer this file through secure channels only.
# ==============================================================================

${yamlBody}
`;
}

/**
 * Parsed import result indicating whether the file was plaintext or encrypted,
 * and returning the normalized profile(s).
 */
export interface ParseProfileResult {
  success: boolean;
  isEncrypted: boolean;
  needsPassphrase?: boolean;
  profile?: EIBProfile;
  profiles?: EIBProfile[];
  error?: string;
}

/**
 * Parses an imported YAML or JSON string. If encrypted and no passphrase is provided,
 * returns { isEncrypted: true, needsPassphrase: true }. If passphrase is provided, decrypts
 * and normalizes the profile(s).
 */
export async function parseProfileFile(
  fileContent: string,
  passphrase?: string
): Promise<ParseProfileResult> {
  try {
    const parsed = yaml.load(fileContent) as ProfileExportEnvelope | Record<string, unknown>;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, isEncrypted: false, error: 'Invalid profile file: content is empty or not valid YAML/JSON.' };
    }

    const envelope = parsed as ProfileExportEnvelope;

    // Case 1: Encrypted profile
    if (envelope.isEncrypted && envelope.encryptedPayload) {
      if (!passphrase) {
        return {
          success: false,
          isEncrypted: true,
          needsPassphrase: true,
        };
      }

      // Decrypt
      const decryptedText = await decryptProfilePayload(envelope.encryptedPayload, passphrase);
      return parseProfileFile(decryptedText); // Recursively parse decrypted YAML
    }

    // Case 2: Plaintext bundle of profiles
    if (envelope.profiles && Array.isArray(envelope.profiles)) {
      const normalizedProfiles: EIBProfile[] = envelope.profiles.map((p, idx) => ({
        id: typeof p.id === 'string' ? p.id : `profile-${Date.now()}-${idx}`,
        name: typeof p.name === 'string' ? p.name : `Imported Profile ${idx + 1}`,
        description: typeof p.description === 'string' ? p.description : '',
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
        updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
        config: normalizeEIBConfig(p.config),
      }));

      return {
        success: true,
        isEncrypted: false,
        profiles: normalizedProfiles,
      };
    }

    // Case 3: Plaintext single profile in envelope
    if (envelope.profile && typeof envelope.profile === 'object') {
      const p = envelope.profile;
      const normalizedProfile: EIBProfile = {
        id: typeof p.id === 'string' ? p.id : `profile-${Date.now()}`,
        name: typeof p.name === 'string' ? p.name : 'Imported Profile',
        description: typeof p.description === 'string' ? p.description : '',
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
        updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
        config: normalizeEIBConfig(p.config),
      };

      return {
        success: true,
        isEncrypted: false,
        profile: normalizedProfile,
      };
    }

    // Case 4: Raw EIBConfigState directly exported (e.g. user pasted raw definition or bare state)
    if ('environmentMode' in parsed || 'versions' in parsed) {
      const normalizedConfig = normalizeEIBConfig(parsed);
      const profile: EIBProfile = {
        id: `profile-${Date.now()}`,
        name: 'Imported Recipe Configuration',
        description: 'Profile created from imported configuration state',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: normalizedConfig,
      };

      return {
        success: true,
        isEncrypted: false,
        profile,
      };
    }

    return {
      success: false,
      isEncrypted: false,
      error: 'Unrecognized profile structure. Missing profile definition or envelope format.',
    };
  } catch (err) {
    return {
      success: false,
      isEncrypted: false,
      error: `Failed to parse profile: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Compares an existing profile against an imported profile and returns a side-by-side
 * diff field list to help the user resolve collisions.
 */
export function compareProfiles(existing: EIBProfile, imported: EIBProfile): ProfileDiffField[] {
  const fields: ProfileDiffField[] = [];

  const addField = (label: string, path: string, v1: unknown, v2: unknown) => {
    const s1 = String(v1 ?? 'None');
    const s2 = String(v2 ?? 'None');
    fields.push({
      label,
      path,
      existingValue: s1,
      importedValue: s2,
      isDifferent: s1 !== s2,
    });
  };

  addField('Profile Name', 'name', existing.name, imported.name);
  addField('Description', 'description', existing.description, imported.description);
  addField('Last Updated', 'updatedAt', new Date(existing.updatedAt).toLocaleString(), new Date(imported.updatedAt).toLocaleString());
  addField('Subscription Tier', 'environmentMode', existing.config.environmentMode === 'commercial' ? 'Commercial (SLE Micro)' : 'Free (openSUSE Leap)', imported.config.environmentMode === 'commercial' ? 'Commercial (SLE Micro)' : 'Free (openSUSE Leap)');
  addField('Target Architecture', 'targetArch', existing.config.targetArch, imported.config.targetArch);
  addField('Kiwi Pre-patching', 'kiwiPrepatch', existing.config.kiwiPrepatch ? 'Enabled' : 'Disabled', imported.config.kiwiPrepatch ? 'Enabled' : 'Disabled');
  addField('Kubernetes Engine', 'versions.k8sEngine', existing.config.versions.k8sEngine.toUpperCase(), imported.config.versions.k8sEngine.toUpperCase());
  addField('Kubernetes Version', 'versions.k8sVersion', existing.config.versions.k8sVersion, imported.config.versions.k8sVersion);
  addField('Corporate Proxy', 'proxy.enabled', existing.config.proxy.enabled ? existing.config.proxy.httpProxy : 'Disabled', imported.config.proxy.enabled ? imported.config.proxy.httpProxy : 'Disabled');
  addField('Target Storage Disk', 'targetDisk', existing.config.targetDisk === 'custom' ? existing.config.customTargetDisk : existing.config.targetDisk, imported.config.targetDisk === 'custom' ? imported.config.customTargetDisk : imported.config.targetDisk);
  addField('Node 1 Hostname / IP', 'nodes.node1', `${existing.config.nodes.node1.hostname} (${existing.config.nodes.node1.ipAddress})`, `${imported.config.nodes.node1.hostname} (${imported.config.nodes.node1.ipAddress})`);
  addField('Node 2 Enabled', 'nodes.node2.enabled', existing.config.nodes.node2.enabled ? `${existing.config.nodes.node2.hostname} (${existing.config.nodes.node2.ipAddress})` : 'Disabled', imported.config.nodes.node2.enabled ? `${imported.config.nodes.node2.hostname} (${imported.config.nodes.node2.ipAddress})` : 'Disabled');
  addField('Node 3 Enabled', 'nodes.node3.enabled', existing.config.nodes.node3.enabled ? `${existing.config.nodes.node3.hostname} (${existing.config.nodes.node3.ipAddress})` : 'Disabled', imported.config.nodes.node3.enabled ? `${imported.config.nodes.node3.hostname} (${imported.config.nodes.node3.ipAddress})` : 'Disabled');
  addField('Helm Charts Count', 'helmCharts.length', existing.config.helmCharts.length, imported.config.helmCharts.length);
  addField('Container Images Count', 'containerImages.length', existing.config.containerImages.length, imported.config.containerImages.length);

  return fields;
}
