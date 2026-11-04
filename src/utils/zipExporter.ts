/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * ZIP Exporter module for SUSE Edge Image Builder Workspace Bundles.
 * Uses JSZip (supporting both bundled and CDN window.JSZip fallbacks).
 */

import JSZip from 'jszip';
import { EIBConfigState } from '../types/eib';
import {
  generateDefinitionYaml,
  generateBuildScript,
  generateNMStateYaml,
  generateKiwiConfig,
  generateRepoFile,
  generateReadmeMarkdown,
  generateChangelogMarkdown,
  generateLicenseText,
} from './eibGenerator';

export interface WorkspaceFilePreview {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  description: string;
}

/**
 * Builds an in-memory preview of all files that will be included in the exported ZIP.
 */
export function buildWorkspaceTree(config: EIBConfigState): WorkspaceFilePreview[] {
  const isFree = config.environmentMode === 'free';
  const tree: WorkspaceFilePreview[] = [
    {
      path: 'definition.yaml',
      type: 'file',
      content: generateDefinitionYaml(config),
      description: 'SUSE Edge Image Builder core definition recipe',
    },
    {
      path: 'build.sh',
      type: 'file',
      content: generateBuildScript(config),
      description: 'Hardened bash runner script with proxy, checksum & container orchestration',
    },
    {
      path: 'manifests/',
      type: 'directory',
      description: 'Kubernetes manifests & Helm values definitions',
    },
    {
      path: 'manifests/helm-charts.yaml',
      type: 'file',
      content: `# Pre-bundled Helm Chart definitions\n${JSON.stringify(config.helmCharts, null, 2)}`,
      description: 'Configured Helm chart releases definition',
    },
    {
      path: 'network/',
      type: 'directory',
      description: 'NMState host networking declarations',
    },
  ];

  if (config.nodes.node1.enabled) {
    tree.push({
      path: 'network/node1.yaml',
      type: 'file',
      content: generateNMStateYaml(config.nodes.node1),
      description: `NMState configuration for ${config.nodes.node1.hostname} (Master)`,
    });
  }
  if (config.nodes.node2.enabled) {
    tree.push({
      path: 'network/node2.yaml',
      type: 'file',
      content: generateNMStateYaml(config.nodes.node2),
      description: `NMState configuration for ${config.nodes.node2.hostname} (Worker 1)`,
    });
  }
  if (config.nodes.node3.enabled) {
    tree.push({
      path: 'network/node3.yaml',
      type: 'file',
      content: generateNMStateYaml(config.nodes.node3),
      description: `NMState configuration for ${config.nodes.node3.hostname} (Worker 2)`,
    });
  }

  const repoFileName = isFree ? 'rpms/opensuse-leap-micro.repo' : 'rpms/sle-micro.repo';
  tree.push(
    {
      path: 'rpms/',
      type: 'directory',
      description: 'Zypper repository definitions for offline / mirror package resolution',
    },
    {
      path: repoFileName,
      type: 'file',
      content: generateRepoFile(config),
      description: isFree ? 'Public openSUSE mirrors' : 'Commercial SCC update repos',
    }
  );

  if (config.kiwiPrepatch) {
    tree.push(
      {
        path: 'kiwi-config/',
        type: 'directory',
        description: 'SUSE Kiwi containerized appliance build description',
      },
      {
        path: 'kiwi-config/config.xml',
        type: 'file',
        content: generateKiwiConfig(config),
        description: 'Kiwi appliance description file (config.xml)',
      }
    );
  }

  tree.push(
    {
      path: 'README.md',
      type: 'file',
      content: generateReadmeMarkdown(config),
      description: 'Quickstart instructions & official SUSE Edge documentation links',
    },
    {
      path: 'CHANGELOG.md',
      type: 'file',
      content: generateChangelogMarkdown(),
      description: 'Version and change history',
    },
    {
      path: 'LICENSE',
      type: 'file',
      content: generateLicenseText(),
      description: 'GNU Affero General Public License v3.0 text',
    }
  );

  return tree;
}

/**
 * Compiles and triggers download of the structured ZIP workspace bundle.
 */
export async function exportWorkspaceZip(config: EIBConfigState): Promise<{ filename: string; sizeBytes: number }> {
  // Use JSZip instance (fallback to window.JSZip if loaded via CDN)
  const ZipConstructor = (typeof window !== 'undefined' && (window as unknown as { JSZip?: typeof JSZip }).JSZip) || JSZip;
  const zip = new ZipConstructor();

  const files = buildWorkspaceTree(config);

  for (const item of files) {
    if (item.type === 'file' && item.content !== undefined) {
      // Set executable permission for build.sh in unix zip header (0755 = 0o100755)
      const options = item.path === 'build.sh' ? { unixPermissions: '755' } : undefined;
      zip.file(item.path, item.content, options);
    } else if (item.type === 'directory') {
      zip.folder(item.path.replace(/\/$/, ''));
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `suse-eib-${config.environmentMode}-${config.versions.k8sEngine}-${config.targetArch}-${timestamp}.zip`;

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    filename,
    sizeBytes: blob.size,
  };
}
