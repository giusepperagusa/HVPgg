/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Unit tests for SUSE Edge Image Builder generator logic.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDefinitionYaml,
  generateBuildScript,
  generateNMStateYaml,
  generateKiwiConfig,
  generateRepoFile,
} from './eibGenerator.ts';
import { INITIAL_CONFIG_STATE } from '../types/eib.ts';

test('generateDefinitionYaml creates valid YAML for Free Mode', () => {
  const yamlContent = generateDefinitionYaml(INITIAL_CONFIG_STATE);
  assert.match(yamlContent, /apiVersion: '1.0'/);
  assert.match(yamlContent, /baseImage: leap-base.iso/);
  assert.match(yamlContent, /arch: x86_64/);
  assert.match(yamlContent, /targetDevice: \/dev\/nvme0n1/);
  assert.match(yamlContent, /hostname: edge-node-01/);
});

test('generateDefinitionYaml sets commercial baseImage and SCC in Commercial Mode', () => {
  const commConfig = {
    ...INITIAL_CONFIG_STATE,
    environmentMode: 'commercial' as const,
    scc: {
      regCode: 'SUSE-REG-TEST-12345',
      email: 'admin@corp.io',
      sccUrl: 'https://scc.suse.com',
    },
  };
  const yamlContent = generateDefinitionYaml(commConfig);
  assert.match(yamlContent, /baseImage: sl-micro-base.iso/);
  assert.match(yamlContent, /registrationCode: SUSE-REG-TEST-12345/);
});

test('generateNMStateYaml generates correct interface and route mappings', () => {
  const node = INITIAL_CONFIG_STATE.nodes.node1;
  const nmstate = generateNMStateYaml(node);
  assert.match(nmstate, /mac-address: ['"]?52:54:00:12:34:01['"]?/);
  assert.match(nmstate, /ip: 192.168.10.11/);
  assert.match(nmstate, /prefix-length: 24/);
  assert.match(nmstate, /next-hop-address: 192.168.10.1/);
  assert.match(nmstate, /server:/);
  assert.match(nmstate, /1.1.1.1/);
});

test('generateBuildScript handles proxy and QEMU multi-arch emulation for ARM64', () => {
  const arm64ProxyConfig = {
    ...INITIAL_CONFIG_STATE,
    targetArch: 'aarch64' as const,
    proxy: {
      enabled: true,
      httpProxy: 'http://proxy.internal:8080',
      httpsProxy: 'http://proxy.internal:8080',
      noProxy: 'localhost,127.0.0.1',
      authEnabled: true,
      username: 'corpuser',
      password: 'secretpassword',
    },
  };
  const script = generateBuildScript(arm64ProxyConfig);
  assert.match(script, /HTTP_PROXY="http:\/\/corpuser:secretpassword@proxy.internal:8080"/);
  assert.match(script, /TARGET_ARCH="aarch64"/);
  assert.match(script, /multiarch\/qemu-user-static/);
  assert.match(script, /sha256sum "\$TARGET_ISO"/);
});

test('generateBuildScript switches to Kiwi container when Kiwi pre-patch is enabled', () => {
  const kiwiConfig = {
    ...INITIAL_CONFIG_STATE,
    kiwiPrepatch: true,
  };
  const script = generateBuildScript(kiwiConfig);
  assert.match(script, /Kiwi pre-patch option ENABLED/);
  assert.match(script, /system build/);
});

test('generateKiwiConfig produces valid XML description for openSUSE Leap 16.1 Immutable Mode', () => {
  const kiwiXml = generateKiwiConfig(INITIAL_CONFIG_STATE);
  assert.match(kiwiXml, /<image schemaversion="7.4"/);
  assert.match(kiwiXml, /openSUSE Leap \(Immutable Mode\)/);
  assert.match(kiwiXml, /patterns-base-transactional/);
  assert.match(kiwiXml, /transactional-update/);
  assert.match(kiwiXml, /distribution\/leap\/16.1\/repo\/oss/);
});

test('generateRepoFile creates public repos for free mode and authenticated for commercial', () => {
  const freeRepo = generateRepoFile(INITIAL_CONFIG_STATE);
  assert.match(freeRepo, /openSUSE-Leap-16.1/);
  assert.match(freeRepo, /distribution\/leap\/16.1\/repo\/oss/);

  const commRepo = generateRepoFile({
    ...INITIAL_CONFIG_STATE,
    environmentMode: 'commercial',
    scc: { regCode: 'ABC-XYZ', email: '', sccUrl: '' },
  });
  assert.match(commRepo, /suse-sle-micro/);
  assert.match(commRepo, /\?ABC-XYZ/);
});
