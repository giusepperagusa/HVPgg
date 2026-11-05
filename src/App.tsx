/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Main Application Component for SUSE Edge Image Builder (EIB)
 * Provisioning & Execution Assistant (PEA).
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TabsNav, WizardTab } from './components/TabsNav';
import { TabEnvironment } from './components/TabEnvironment';
import { TabVersions } from './components/TabVersions';
import { TabKubernetes } from './components/TabKubernetes';
import { TabNodesStorage } from './components/TabNodesStorage';
import { TabExport } from './components/TabExport';
import { AboutModal } from './components/AboutModal';
import { DocsModal } from './components/DocsModal';
import { ProfileManagerModal } from './components/ProfileManagerModal';
import { ProfileConflictModal } from './components/ProfileConflictModal';
import { PWAProvider } from './context/PWAContext';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { useTheme } from './hooks/useTheme';
import { useProfiles } from './hooks/useProfiles';
import { INITIAL_CONFIG_STATE, EIBConfigState } from './types/eib';
import { EIBProfile, ProfileConflictResolution } from './types/profile';
import { exportWorkspaceZip } from './utils/zipExporter';

export default function App() {
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [config, setConfig] = useState<EIBConfigState>(INITIAL_CONFIG_STATE);
  const [currentTab, setCurrentTab] = useState<WizardTab>('environment');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [conflictModalData, setConflictModalData] = useState<{
    existing: EIBProfile;
    candidate: EIBProfile;
    resolve: (resolution: ProfileConflictResolution) => void;
  } | null>(null);

  // Profiles management hook
  const {
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
  } = useProfiles(config, setConfig);

  const handleConflictDetected = useCallback(
    (
      existing: EIBProfile,
      candidate: EIBProfile,
      resolveCallback: (resolution: ProfileConflictResolution) => void
    ) => {
      setConflictModalData({
        existing,
        candidate,
        resolve: resolveCallback,
      });
    },
    []
  );

  // Track completed tabs for wizard progress checkmarks
  const completedTabs = useMemo<Record<WizardTab, boolean>>(() => {
    return {
      environment: !!config.baseIsoUrl && !!config.baseIsoSha256,
      versions: !!config.versions.k8sVersion && !!config.versions.eibVersion,
      kubernetes: !!config.k8sClusterToken && config.helmCharts.length > 0,
      nodes: !!config.nodes.node1.hostname && !!config.nodes.node1.ipAddress,
      export: true,
    };
  }, [config]);

  const handleQuickExport = async () => {
    try {
      await exportWorkspaceZip(config);
    } catch (err) {
      console.error('Quick export failed:', err);
    }
  };

  return (
    <PWAProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
        {/* PWA Floating Update & Offline Alerts */}
        <PWAUpdateNotification />

        {/* Global Application Header */}
        <Header
          environmentMode={config.environmentMode}
          themeMode={themeMode}
          activeProfileName={activeProfile?.name}
          onOpenProfiles={() => setIsProfileManagerOpen(true)}
          onThemeChange={setThemeMode}
          onOpenDocs={() => setIsDocsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onQuickExport={handleQuickExport}
        />

      {/* Wizard Step Navigation */}
      <TabsNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        completedTabs={completedTabs}
      />

      {/* Main Form Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'environment' && (
          <TabEnvironment
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('versions')}
          />
        )}

        {currentTab === 'versions' && (
          <TabVersions
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('kubernetes')}
            onPrev={() => setCurrentTab('environment')}
          />
        )}

        {currentTab === 'kubernetes' && (
          <TabKubernetes
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('nodes')}
            onPrev={() => setCurrentTab('versions')}
          />
        )}

        {currentTab === 'nodes' && (
          <TabNodesStorage
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('export')}
            onPrev={() => setCurrentTab('kubernetes')}
          />
        )}

        {currentTab === 'export' && (
          <TabExport
            config={config}
            onPrev={() => setCurrentTab('nodes')}
          />
        )}
      </main>

      {/* Global Application Footer */}
      <footer className="border-t border-slate-850 bg-slate-900/60 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            SUSE Edge Image Builder Provisioning & Execution Assistant • Licensed under{' '}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              AGPL-3.0
            </button>
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Air-Gap Guide
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Official Documentation
            </button>
            <a
              href="https://github.com/suse-edge/edge-image-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition"
            >
              EIB Upstream
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      
      {/* Profile Management Modal */}
      <ProfileManagerModal
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        profiles={profiles}
        activeProfile={activeProfile}
        activeProfileId={activeProfileId}
        onSaveCurrentAsNew={saveCurrentAsNewProfile}
        onUpdateActiveProfile={updateActiveProfileFromForm}
        onUpdateProfileMetadata={updateProfileMetadata}
        onLoadProfile={loadProfile}
        onDeleteProfile={deleteProfile}
        onDuplicateProfile={duplicateProfile}
        findExistingProfileConflict={findExistingProfileConflict}
        onCommitImportedProfile={commitImportedProfile}
        onExportProfile={exportProfileToFile}
        onExportAllBundle={exportAllProfilesBundle}
        onConflictDetected={handleConflictDetected}
      />

      {/* Collision Diff Comparison & Resolution Modal */}
      {conflictModalData && (
        <ProfileConflictModal
          isOpen={!!conflictModalData}
          existingProfile={conflictModalData.existing}
          importedProfile={conflictModalData.candidate}
          onResolve={(res) => {
            conflictModalData.resolve(res);
            setConflictModalData(null);
          }}
          onCancel={() => {
            conflictModalData.resolve({ action: 'cancel' });
            setConflictModalData(null);
          }}
        />
      )}
    </div>
  </PWAProvider>
  );
}
