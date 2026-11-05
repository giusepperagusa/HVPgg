/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Unit tests for profile serialization, backward compatibility, normalization,
 * Web Crypto AES-256-GCM encryption/decryption, and collision comparison.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { INITIAL_CONFIG_STATE } from '../types/eib';
import { EIBProfile } from '../types/profile';
import {
  normalizeEIBConfig,
  serializeProfileToCommentedYaml,
  serializeProfileToEncryptedYaml,
  serializeProfileBundleToCommentedYaml,
  parseProfileFile,
  compareProfiles,
} from './profileSerializer';

test('normalizeEIBConfig fills missing fields with defaults for older profiles', () => {
  // Simulate an older profile from v1.0.0 that lacked customTargetDisk, kiwiPrepatch, and node3
  const partialConfig = {
    environmentMode: 'free',
    targetArch: 'x86_64',
    // kiwiPrepatch is missing
    versions: {
      k8sEngine: 'k3s',
      k8sVersion: 'v1.30.0+k3s1',
    },
    nodes: {
      node1: {
        hostname: 'edge-master-01',
        ipAddress: '192.168.1.10',
      },
      // node2 and node3 missing
    },
  };

  const normalized = normalizeEIBConfig(partialConfig);

  assert.strictEqual(normalized.environmentMode, 'free');
  assert.strictEqual(normalized.targetArch, 'x86_64');
  assert.strictEqual(typeof normalized.kiwiPrepatch, 'boolean');
  assert.strictEqual(normalized.versions.k8sEngine, 'k3s');
  assert.strictEqual(normalized.nodes.node1.hostname, 'edge-master-01');
  assert.strictEqual(normalized.nodes.node1.ipAddress, '192.168.1.10');
  // Verified that node2 and node3 were safely backfilled
  assert.ok(normalized.nodes.node2);
  assert.strictEqual(normalized.nodes.node2.enabled, true);
  assert.ok(normalized.nodes.node3);
  assert.strictEqual(normalized.nodes.node3.enabled, false);
  // Verified official ISO URLs were backfilled
  assert.ok(normalized.baseIsoUrl.length > 0);
  assert.ok(normalized.baseIsoSha256.length > 0);
});

test('serializeProfileToCommentedYaml outputs valid YAML with security notice', () => {
  const profile: EIBProfile = {
    id: 'test-profile-1',
    name: 'Industrial Gateway RKE2',
    description: 'Edge appliance for factory IoT',
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    config: INITIAL_CONFIG_STATE,
  };

  const yamlText = serializeProfileToCommentedYaml(profile, '1.3.1');

  assert.ok(yamlText.includes('Edge Image Builder (EIB) - Profile Configuration File'));
  assert.ok(yamlText.includes('SECURITY WARNING'));
  assert.ok(yamlText.includes('Industrial Gateway RKE2'));
  assert.ok(yamlText.includes('format: eib-profile'));
});

test('serializeProfileToEncryptedYaml and parseProfileFile roundtrip with passphrase', async () => {
  const profile: EIBProfile = {
    id: 'test-encrypted-1',
    name: 'Confidential Production Node',
    description: 'High-security air-gapped node',
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    config: {
      ...INITIAL_CONFIG_STATE,
      k8sClusterToken: 'SuperSecretClusterToken12345!',
    },
  };

  const passphrase = 'SecretPassphrase!2026';
  const encryptedYaml = await serializeProfileToEncryptedYaml(profile, passphrase, '1.3.1');

  assert.ok(encryptedYaml.includes('Edge Image Builder (EIB) - ENCRYPTED Profile File'));
  assert.ok(encryptedYaml.includes('AES-256-GCM'));
  assert.ok(!encryptedYaml.includes('SuperSecretClusterToken12345!')); // Secret is not in plaintext!

  // Attempt parse without passphrase -> signals needsPassphrase
  const checkNeedPass = await parseProfileFile(encryptedYaml);
  assert.strictEqual(checkNeedPass.isEncrypted, true);
  assert.strictEqual(checkNeedPass.needsPassphrase, true);

  // Attempt parse with wrong passphrase -> fails cleanly
  const wrongPassResult = await parseProfileFile(encryptedYaml, 'WrongPassword');
  assert.strictEqual(wrongPassResult.success, false);
  assert.ok(wrongPassResult.error?.includes('Incorrect passphrase'));

  // Parse with correct passphrase -> restores profile
  const correctResult = await parseProfileFile(encryptedYaml, passphrase);
  assert.strictEqual(correctResult.success, true);
  assert.strictEqual(correctResult.profile?.name, 'Confidential Production Node');
  assert.strictEqual(correctResult.profile?.config.k8sClusterToken, 'SuperSecretClusterToken12345!');
});

test('serializeProfileBundleToCommentedYaml supports multi-profile backups', async () => {
  const p1: EIBProfile = {
    id: 'p1',
    name: 'Cluster Alpha',
    description: 'First cluster',
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    config: INITIAL_CONFIG_STATE,
  };
  const p2: EIBProfile = {
    id: 'p2',
    name: 'Cluster Beta',
    description: 'Second cluster',
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    config: { ...INITIAL_CONFIG_STATE, environmentMode: 'commercial' },
  };

  const bundleYaml = serializeProfileBundleToCommentedYaml([p1, p2], '1.3.0');
  const parsed = await parseProfileFile(bundleYaml);

  assert.strictEqual(parsed.success, true);
  assert.ok(Array.isArray(parsed.profiles));
  assert.strictEqual(parsed.profiles?.length, 2);
  assert.strictEqual(parsed.profiles[0].name, 'Cluster Alpha');
  assert.strictEqual(parsed.profiles[1].name, 'Cluster Beta');
  assert.strictEqual(parsed.profiles[1].config.environmentMode, 'commercial');
});

test('compareProfiles identifies exact differences between profiles', () => {
  const p1: EIBProfile = {
    id: 'p1',
    name: 'Cluster One',
    description: 'Initial',
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:00:00Z',
    config: INITIAL_CONFIG_STATE,
  };

  const p2: EIBProfile = {
    id: 'p2',
    name: 'Cluster One',
    description: 'Updated with ARM64 and SLE Micro',
    createdAt: '2026-11-05T12:00:00Z',
    updatedAt: '2026-11-05T12:30:00Z',
    config: {
      ...INITIAL_CONFIG_STATE,
      environmentMode: 'commercial',
      targetArch: 'aarch64',
    },
  };

  const diff = compareProfiles(p1, p2);
  const diffArch = diff.find((d) => d.label === 'Target Architecture');
  const diffTier = diff.find((d) => d.label === 'Subscription Tier');

  assert.ok(diffArch);
  assert.strictEqual(diffArch.isDifferent, true);
  assert.strictEqual(diffArch.existingValue, 'x86_64');
  assert.strictEqual(diffArch.importedValue, 'aarch64');

  assert.ok(diffTier);
  assert.strictEqual(diffTier.isDifferent, true);
});
