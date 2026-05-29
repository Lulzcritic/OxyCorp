/**
 * Refinery Terminal
 * 
 * Terminal wrapper for the Refinery system.
 * Allows the player to process raw resources into refined materials.
 */

import TerminalContainer from '../TerminalContainer';
import { TerminalType } from '../../../types/terminal';

export default function RefineryTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.REFINERY}
      title="REFINERY STATUS"
    >
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ color: '#00FF9D', fontSize: '1.5rem', marginBottom: 20 }}>
          ⚙ REFINERY OVERVIEW
        </div>
        <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 40 }}>
          Resource processing operations are currently online.
        </div>
        
        {/* Placeholder for future refinery functionalities */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 40
        }}>
          <div style={{ background: '#111', border: '1px solid #333', padding: 20, width: 200 }}>
            <div style={{ color: '#00cc66', marginBottom: 10 }}>RAW ORE</div>
            <div style={{ fontSize: '1.8rem', color: '#fff' }}>0</div>
          </div>
          <div style={{ background: '#111', border: '1px solid #333', padding: 20, width: 200 }}>
            <div style={{ color: '#ffaa00', marginBottom: 10 }}>REFINED METALS</div>
            <div style={{ fontSize: '1.8rem', color: '#fff' }}>0</div>
          </div>
        </div>
      </div>
    </TerminalContainer>
  );
}
