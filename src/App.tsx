/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * HVPgg Wizard — Interactive Appliance Builder for HVPgg
 * (Hardware to Value Project "green generation")
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TabsNav, WizardTab } from './components/TabsNav';
import { BottomNavDock } from './components/BottomNavDock';
import { TabDeploymentScale } from './components/TabDeploymentScale';
import { TabApplianceIdentity } from './components/TabApplianceIdentity';
import { TabSecurityAutomation } from './components/TabSecurityAutomation';
import { TabValueStackRoadmap } from './components/TabValueStackRoadmap';
import { TabExport } from './components/TabExport';
import { AdvancedStackModal } from './components/AdvancedStackModal';
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
  const [currentTab, setCurrentTab] = useState<WizardTab>('deployment');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [isAdvancedStackOpen, setIsAdvancedStackOpen] = useState(false);
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
      deployment: !!config.targetArch && !!config.versions.k8sEngine,
      identity: !!config.nodes.node1.hostname && !!config.nodes.node1.ipAddress,
      security: true,
      roadmap: true,
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
        {currentTab === 'deployment' && (
          <TabDeploymentScale
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('identity')}
            onOpenAdvancedStack={() => setIsAdvancedStackOpen(true)}
          />
        )}

        {currentTab === 'identity' && (
          <TabApplianceIdentity
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('security')}
            onPrev={() => setCurrentTab('deployment')}
          />
        )}

        {currentTab === 'security' && (
          <TabSecurityAutomation
            config={config}
            onChange={setConfig}
            onNext={() => setCurrentTab('roadmap')}
            onPrev={() => setCurrentTab('identity')}
            onOpenAdvancedStack={() => setIsAdvancedStackOpen(true)}
          />
        )}

        {currentTab === 'roadmap' && (
          <TabValueStackRoadmap
            config={config}
            onNext={() => setCurrentTab('export')}
            onPrev={() => setCurrentTab('security')}
          />
        )}

        {currentTab === 'export' && (
          <TabExport
            config={config}
            onPrev={() => setCurrentTab('roadmap')}
          />
        )}
      </main>

      {/* Floating / Docked Stage Navigation Controls */}
      <BottomNavDock
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAdvancedStack={() => setIsAdvancedStackOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onQuickExport={handleQuickExport}
      />

      {/* Global Application Footer */}
      <footer className="border-t border-slate-850 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            HVPgg (Hardware to Value Project "green generation") • Licensed under{' '}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              AGPL-3.0
            </button>
            {' '}• Independent Open Source Appliance
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Hardware Guide
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-slate-300 transition"
            >
              HVP Lineage & About
            </button>
            <button
              onClick={() => setIsAdvancedStackOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Component Engine
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <AdvancedStackModal
        isOpen={isAdvancedStackOpen}
        onClose={() => setIsAdvancedStackOpen(false)}
        config={config}
        onChange={setConfig}
      />
      
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
