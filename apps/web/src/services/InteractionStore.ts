/**
 * Interaction Store
 * 
 * Zustand store for managing 3D raycasting interaction state.
 * Tracks which terminal the player is looking at and whether they're in range.
 */

import { create } from 'zustand';

interface InteractionState {
  /** Terminal type the player is currently looking at, or null */
  hoveredTerminal: string | null;
  /** Display label for the hovered terminal */
  hoveredLabel: string | null;
  /** Whether the player is within interaction range (3 units) */
  inRange: boolean;
  /** Optional callback for custom interactions, e.g. scene transitions */
  onInteract?: () => void;
  /** Whether player movement is currently locked (terminal open) */
  movementLocked: boolean;

  setHovered: (terminalType: string | null, label: string | null, inRange: boolean, onInteract?: () => void) => void;
  setMovementLocked: (locked: boolean) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  hoveredTerminal: null,
  hoveredLabel: null,
  inRange: false,
  movementLocked: false,
  onInteract: undefined,

  setHovered: (terminalType, label, inRange, onInteract) => {
    set({ hoveredTerminal: terminalType, hoveredLabel: label, inRange, onInteract });
  },

  setMovementLocked: (locked) => {
    set({ movementLocked: locked });
  },
}));
