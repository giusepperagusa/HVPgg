/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Profile Management & Export/Import Data Models for HVPgg Wizard.
 * Designed with backward and forward schema compatibility.
 */

import { EIBConfigState } from './eib';

export const CURRENT_PROFILE_SCHEMA_VERSION = 1;

export interface EIBProfile {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  config: EIBConfigState;
}

export interface EncryptedPayload {
  algorithm: 'AES-GCM-256';
  kdf: 'PBKDF2';
  hash: 'SHA-256';
  iterations: number;
  salt: string; // Hex encoded
  iv: string; // Hex encoded
  cipherText: string; // Base64 encoded
}

export interface ProfileExportEnvelope {
  format: 'eib-profile' | 'eib-profile-bundle' | 'suse-eib-profile' | 'suse-eib-profile-bundle';
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  isEncrypted: boolean;
  profile?: EIBProfile;
  profiles?: EIBProfile[];
  encryptedPayload?: EncryptedPayload;
}

export interface ProfileDiffField {
  label: string;
  path: string;
  existingValue: string;
  importedValue: string;
  isDifferent: boolean;
}

export interface ProfileConflictResolution {
  action: 'overwrite' | 'rename' | 'skip' | 'cancel';
  newName?: string;
}
