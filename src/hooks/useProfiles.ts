/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Hook for managing, persisting, exporting, and importing SUSE EIB Profiles.
 * Supports multiple profiles, overwrite collision detection, commented YAML,
 * and optional AES-256-GCM encryption.
 */

import { useState, useEffect, useCallback } from 'react';
import { EIBConfigState, INITIAL_CONFIG_STATE } from '../types/eib';
import { EIBProfile, ProfileConflictResolution } from '../types/profile';
import {
  normalizeEIBConfig,
  serializeProfileToCommentedYaml,
  serializeProfileToEncryptedYaml,
  serializeProfileBundleToCommentedYaml,
} from '../utils/profileSerializer';

const STORAGE_PROFILES_KEY = 'eib_profiles_v1';
const LEGACY_STORAGE_PROFILES_KEY = 'suse_eib_profiles_v1';
const STORAGE_ACTIVE_ID_KEY = 'eib_active_profile_id_v1';
const LEGACY_STORAGE_ACTIVE_ID_KEY = 'suse_eib_active_profile_id_v1';

// Initial default seed profile
const DEFAULT_INITIAL_PROFILE: EIBProfile = {
  id: 'profile-default',
  name: 'Default Production Profile',
  description: 'Baseline dual-node RKE2 Kubernetes cluster configuration for openSUSE Leap Micro.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: INITIAL_CONFIG_STATE,
};

export function useProfiles(
  currentConfig: EIBConfigState,
  onLoadConfig: (config: EIBConfigState) => void
) {
  const [profiles, setProfiles] = useState<EIBProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROFILES_KEY) || localStorage.getItem(LEGACY_STORAGE_PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as EIBProfile[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => ({
            ...p,
            config: normalizeEIBConfig(p.config),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed reading profiles from localStorage:', e);
    }
    return [DEFAULT_INITIAL_PROFILE];
  });

  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY) || localStorage.getItem(LEGACY_STORAGE_ACTIVE_ID_KEY);
      if (storedId) return storedId;
    } catch {
      // ignore
    }
    return 'profile-default';
  });

  // Persist profiles to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed saving profiles to localStorage:', e);
    }
  }, [profiles]);

  // Persist activeProfileId
  useEffect(() => {
    try {
      if (activeProfileId) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProfileId);
      }
    } catch {
      // ignore
    }
  }, [activeProfileId]);

  // Find active profile
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;

  // Save current wizard state as a brand new profile
  const saveCurrentAsNewProfile = useCallback(
    (name: string, description: string): EIBProfile => {
      const trimmedName = name.trim() || `Profile ${profiles.length + 1}`;
      const newProfile: EIBProfile = {
        id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: trimmedName,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: normalizeEIBConfig(currentConfig),
      };

      setProfiles((prev) => [newProfile, ...prev]);
      setActiveProfileId(newProfile.id);
      return newProfile;
    },
    [currentConfig, profiles.length]
  );

  // Update existing active profile with current wizard state
  const updateActiveProfileFromForm = useCallback(() => {
    if (!activeProfileId) return;
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === activeProfileId) {
          return {
            ...p,
            updatedAt: new Date().toISOString(),
            config: normalizeEIBConfig(currentConfig),
          };
        }
        return p;
      })
    );
  }, [activeProfileId, currentConfig]);

  // Update profile metadata (name & comment)
  const updateProfileMetadata = useCallback((id: string, name: string, description: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            name: name.trim() || p.name,
            description: description.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  }, []);

  // Load a profile into active wizard form
  const loadProfile = useCallback(
    (id: string) => {
      const target = profiles.find((p) => p.id === id);
      if (target) {
        setActiveProfileId(target.id);
        onLoadConfig(normalizeEIBConfig(target.config));
        return true;
      }
      return false;
    },
    [profiles, onLoadConfig]
  );

  // Delete a profile
  const deleteProfile = useCallback(
    (id: string) => {
      setProfiles((prev) => {
        const remaining = prev.filter((p) => p.id !== id);
        if (remaining.length === 0) {
          // Keep at least one default profile
          return [DEFAULT_INITIAL_PROFILE];
        }
        return remaining;
      });

      if (activeProfileId === id) {
        const remaining = profiles.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          setActiveProfileId(remaining[0].id);
          onLoadConfig(normalizeEIBConfig(remaining[0].config));
        }
      }
    },
    [activeProfileId, profiles, onLoadConfig]
  );

  // Duplicate a profile
  const duplicateProfile = useCallback(
    (id: string): EIBProfile | null => {
      const source = profiles.find((p) => p.id === id);
      if (!source) return null;

      const duplicated: EIBProfile = {
        id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: `${source.name} (Copy)`,
        description: source.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: JSON.parse(JSON.stringify(source.config)),
      };

      setProfiles((prev) => [duplicated, ...prev]);
      return duplicated;
    },
    [profiles]
  );

  // Check if a profile with the same name or ID exists
  const findExistingProfileConflict = useCallback(
    (candidate: EIBProfile): EIBProfile | null => {
      return (
        profiles.find(
          (p) =>
            p.name.trim().toLowerCase() === candidate.name.trim().toLowerCase() ||
            p.id === candidate.id
        ) || null
      );
    },
    [profiles]
  );

  // Apply imported profile with collision resolution
  const commitImportedProfile = useCallback(
    (imported: EIBProfile, resolution?: ProfileConflictResolution): EIBProfile => {
      const normalized: EIBProfile = {
        ...imported,
        id: imported.id || `profile-${Date.now()}`,
        updatedAt: new Date().toISOString(),
        config: normalizeEIBConfig(imported.config),
      };

      setProfiles((prev) => {
        const existingIdx = prev.findIndex(
          (p) =>
            p.name.trim().toLowerCase() === normalized.name.trim().toLowerCase() ||
            p.id === normalized.id
        );

        if (existingIdx !== -1) {
          if (resolution?.action === 'overwrite') {
            // Overwrite existing profile at same index
            const updated = [...prev];
            updated[existingIdx] = {
              ...normalized,
              id: prev[existingIdx].id, // preserve existing ID
            };
            return updated;
          }

          if (resolution?.action === 'rename') {
            const newName = resolution.newName?.trim() || `${normalized.name} (Imported)`;
            return [
              {
                ...normalized,
                id: `profile-${Date.now()}`,
                name: newName,
              },
              ...prev,
            ];
          }
        }

        // No conflict or append
        return [normalized, ...prev];
      });

      return normalized;
    },
    []
  );

  // Export single profile to download (Commented YAML or Encrypted)
  const exportProfileToFile = useCallback(
    async (id: string, options: { encrypted: boolean; passphrase?: string }) => {
      const target = profiles.find((p) => p.id === id);
      if (!target) return;

      let fileData: string;
      let filename: string;
      const safeName = target.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

      if (options.encrypted && options.passphrase) {
        fileData = await serializeProfileToEncryptedYaml(target, options.passphrase, '1.3.1');
        filename = `${safeName}.eib-profile.enc.yaml`;
      } else {
        fileData = serializeProfileToCommentedYaml(target, '1.3.1');
        filename = `${safeName}.eib-profile.yaml`;
      }

      const blob = new Blob([fileData], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [profiles]
  );

  // Export all profiles as bundle (Commented YAML or Encrypted)
  const exportAllProfilesBundle = useCallback(
    async (options: { encrypted: boolean; passphrase?: string }) => {
      if (profiles.length === 0) return;

      let fileData: string;
      let filename: string;

      if (options.encrypted && options.passphrase) {
        fileData = await serializeProfileToEncryptedYaml(profiles, options.passphrase, '1.3.1');
        filename = `eib-profiles-bundle-${Date.now()}.enc.yaml`;
      } else {
        fileData = serializeProfileBundleToCommentedYaml(profiles, '1.3.1');
        filename = `eib-profiles-bundle-${Date.now()}.yaml`;
      }

      const blob = new Blob([fileData], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [profiles]
  );

  return {
    profiles,
    activeProfile,
    activeProfileId,
    saveCurrentAsNewProfile,
    updateActiveProfileFromForm,
    updateProfileMetadata,
    loadProfile,
    deleteProfile,
    duplicateProfile,
    findExistingProfileConflict,
    commitImportedProfile,
    exportProfileToFile,
    exportAllProfilesBundle,
  };
}
