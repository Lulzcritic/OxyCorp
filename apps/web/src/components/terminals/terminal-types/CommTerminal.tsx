/**
 * Communications Terminal
 * 
 * Terminal wrapper for directives/missions and chat systems.
 */

import TerminalContainer from '../TerminalContainer';
import DirectivesWidget from '../../DirectivesWidget';
import CompanyAIWidget from '../widgets/CompanyAIWidget';
import NPCDialoguePanel from '../widgets/NPCDialoguePanel';
import { TerminalType } from '../../../types/terminal';

export default function CommTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.COMM}
      title="COMMUNICATIONS ARRAY"
    >
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 25 }}>
        {/* Encrypted NPC Comms Link */}
        <NPCDialoguePanel />

        <CompanyAIWidget />
        
        <DirectivesWidget />
        
        {/* Chat functionality note */}
        <div
          style={{
            padding: 15,
            border: '1px solid #333',
            background: '#0A0A0A',
            color: '#666',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
          }}
        >
          // CHAT_SYSTEM: Available via global ChatDrawer component
        </div>
      </div>
    </TerminalContainer>
  );
}
