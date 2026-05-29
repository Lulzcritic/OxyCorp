/**
 * Terminal Manager Service
 * 
 * Zustand store for centralized terminal state management.
 * Handles opening/closing terminals and managing active terminal state.
 */

import { create } from 'zustand';
import { TerminalType } from '../types/terminal';
import type { TerminalState } from '../types/terminal';

interface TerminalStore extends TerminalState {
  openTerminal: (type: TerminalType) => void;
  closeTerminal: () => void;
  getActiveTerminal: () => TerminalType | null;
  canAccessTerminal: () => boolean;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  activeTerminal: null,
  isOpen: false,
  canInteract: true,

  openTerminal: (type: TerminalType) => {
    set({
      activeTerminal: type,
      isOpen: true,
      canInteract: true,
    });
  },

  closeTerminal: () => {
    set({
      activeTerminal: null,
      isOpen: false,
      canInteract: true,
    });
  },

  getActiveTerminal: () => {
    return get().activeTerminal;
  },

  canAccessTerminal: () => {
    // Placeholder for future facility gating logic
    // TODO: Implement facility-based access control in future story
    return true;
  },
}));

// Global ESC key handler
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const store = useTerminalStore.getState();
      if (store.isOpen) {
        store.closeTerminal();
      }
    }
  });
}
