/**
 * Terminal Router
 * 
 * Routes to the appropriate terminal wrapper based on active terminal type.
 * Maps TerminalType enum to specific terminal components.
 */

import { useTerminalStore } from '../../services/TerminalManager';
import { TerminalType } from '../../types/terminal';

// Import terminal wrappers
import CryopodTerminal from './terminal-types/CryopodTerminal';
import ControlCenterTerminal from './terminal-types/ControlCenterTerminal';
import CommTerminal from './terminal-types/CommTerminal';
import BunkerManagementTerminal from './terminal-types/BunkerManagementTerminal';
import MarketTerminal from './terminal-types/MarketTerminal';
import WarRoomTerminal from './terminal-types/WarRoomTerminal';
import RefineryTerminal from './terminal-types/RefineryTerminal';
import MapTerminal from './terminal-types/MapTerminal';
import CraftingTerminal from './terminal-types/CraftingTerminal';

export default function TerminalRouter() {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);

  if (!activeTerminal) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
        NO TERMINAL ACTIVE
      </div>
    );
  }

  switch (activeTerminal) {
    case TerminalType.CRYOPOD:
      return <CryopodTerminal />;
    
    case TerminalType.CONTROL_CENTER:
      return <ControlCenterTerminal />;
    
    case TerminalType.COMM:
      return <CommTerminal />;
    
    case TerminalType.BUNKER_MANAGEMENT:
      return <BunkerManagementTerminal />;
    
    case TerminalType.MARKET:
      return <MarketTerminal />;
    
    case TerminalType.WAR_ROOM:
      return <WarRoomTerminal />;
    
    case TerminalType.REFINERY:
      return <RefineryTerminal />;
    
    case TerminalType.VEHICLE_MAP:
      return <MapTerminal />;
    
    case TerminalType.CRAFTING:
      return <CraftingTerminal />;
    
    default:
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#FF0055' }}>
          UNKNOWN TERMINAL TYPE
        </div>
      );
  }
}
