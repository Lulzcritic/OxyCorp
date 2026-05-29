/**
 * Communications Terminal
 * 
 * Terminal wrapper for directives/missions and chat systems.
 */

import TerminalContainer from '../TerminalContainer';
import DirectivesWidget from '../../DirectivesWidget';
import { TerminalType } from '../../../types/terminal';

export default function CommTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.COMM}
      title="COMMUNICATIONS ARRAY"
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <DirectivesWidget />
        
        {/* Chat functionality note */}
        <div
          style={{
            marginTop: 20,
            padding: 15,
            border: '1px solid #333',
            background: '#0A0A0A',
            color: '#666',
            fontSize: '0.85rem',
          }}
        >
          // CHAT_SYSTEM: Available via global ChatDrawer component
        </div>
      </div>
    </TerminalContainer>
  );
}
