/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Theme and High-Visibility Accessibility Controller.
 */

import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light' | 'contrast';

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('suse_pea_theme_mode') as ThemeMode | null;
      if (saved && ['system', 'dark', 'light', 'contrast'].includes(saved)) {
        return saved;
      }
    }
    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let isDark = true;
      let isContrast = false;

      if (mode === 'contrast') {
        isDark = true;
        isContrast = true;
      } else if (mode === 'dark') {
        isDark = true;
        isContrast = false;
      } else if (mode === 'light') {
        isDark = false;
        isContrast = false;
      } else {
        // System preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isContrast = window.matchMedia('(prefers-contrast: more)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      if (isContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    };

    applyTheme();
    localStorage.setItem('suse_pea_theme_mode', mode);

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    const listener = () => {
      if (mode === 'system') {
        applyTheme();
      }
    };

    darkQuery.addEventListener('change', listener);
    contrastQuery.addEventListener('change', listener);

    return () => {
      darkQuery.removeEventListener('change', listener);
      contrastQuery.removeEventListener('change', listener);
    };
  }, [mode]);

  return { mode, setMode };
}
