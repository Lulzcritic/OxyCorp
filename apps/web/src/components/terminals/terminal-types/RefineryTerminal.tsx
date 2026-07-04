/**
 * Refinery Terminal
 * 
 * Terminal wrapper for the Refinery system.
 * Allows the player to process raw resources into refined materials.
 */

import TerminalContainer from '../TerminalContainer';
import { TerminalType } from '../../../types/terminal';
import RefiningWidget from '../../RefiningWidget';

export default function RefineryTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.REFINERY}
      title="REFINERY STATUS"
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <RefiningWidget />
      </div>
    </TerminalContainer>
  );
}
