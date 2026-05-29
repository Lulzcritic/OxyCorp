/**
 * Terminal Types & State
 * 
 * Defines terminal type constants and state interfaces for the terminal system.
 */

export const TerminalType = {
  CRYOPOD: 'CRYOPOD',
  CONTROL_CENTER: 'CONTROL_CENTER',
  COMM: 'COMM',
  BUNKER_MANAGEMENT: 'BUNKER_MANAGEMENT',
  MARKET: 'MARKET',
  WAR_ROOM: 'WAR_ROOM',
  REFINERY: 'REFINERY',
  VEHICLE_MAP: 'VEHICLE_MAP',
} as const;

export type TerminalType = typeof TerminalType[keyof typeof TerminalType];

export interface TerminalState {
  activeTerminal: TerminalType | null;
  isOpen: boolean;
  canInteract: boolean;
}
