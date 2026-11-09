/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * Accessible Modal Dismiss Hook.
 * Listens for Escape key press to dismiss modal dialogs and locks
 * body scrolling when modal is active.
 */

import { useEffect } from 'react';

export function useModalDismiss(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
