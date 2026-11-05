/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Standard Web Crypto API encryption and decryption for EIB profiles.
 * Uses PBKDF2 (100,000 iterations, SHA-256) and AES-256-GCM authenticated encryption.
 */

import { EncryptedPayload } from '../types/profile';

// Convert Uint8Array to Hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to Base64 string
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM-256 CryptoKey from a user passphrase and random salt using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string (e.g. YAML or JSON) using AES-256-GCM with a user-supplied passphrase.
 */
export async function encryptProfilePayload(
  plainText: string,
  passphrase: string
): Promise<EncryptedPayload> {
  if (!passphrase || passphrase.length < 4) {
    throw new Error('Passphrase must be at least 4 characters long.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 100000;

  const key = await deriveKey(passphrase, salt, iterations);

  const encoder = new TextEncoder();
  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(plainText)
  );

  return {
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations,
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    cipherText: bytesToBase64(new Uint8Array(cipherBuffer)),
  };
}

/**
 * Decrypts an EncryptedPayload back into plaintext using the supplied passphrase.
 */
export async function decryptProfilePayload(
  payload: EncryptedPayload,
  passphrase: string
): Promise<string> {
  if (!passphrase) {
    throw new Error('Passphrase is required to decrypt this profile.');
  }

  const salt = hexToBytes(payload.salt);
  const iv = hexToBytes(payload.iv);
  const cipherBytes = base64ToBytes(payload.cipherText);

  try {
    const key = await deriveKey(passphrase, salt, payload.iterations || 100000);
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      cipherBytes as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error('Incorrect passphrase or corrupted encrypted profile data.');
  }
}
