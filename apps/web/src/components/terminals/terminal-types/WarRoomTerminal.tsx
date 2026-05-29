/**
 * War Room Terminal
 * 
 * Terminal wrapper for combat systems.
 * Links to dedicated War Room page with swarm configuration and battle analysis.
 */

import TerminalContainer from '../TerminalContainer';
import { TerminalType } from '../../../types/terminal';

export default function WarRoomTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.WAR_ROOM}
      title="TACTICAL COMMAND"
    >
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ color: '#FF0055', fontSize: '1.5rem', marginBottom: 20 }}>
          ⚔ COMBAT OPERATIONS
        </div>
        <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 40 }}>
          Full tactical interface available at dedicated War Room terminal
        </div>
        <a
          href="/war-room"
          style={{
            display: 'inline-block',
            background: '#FF0055',
            color: 'white',
            padding: '15px 30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ENTER WAR ROOM →
        </a>
      </div>
    </TerminalContainer>
  );
}
