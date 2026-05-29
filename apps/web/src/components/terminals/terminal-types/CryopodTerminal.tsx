/**
 * Cryopod Terminal
 * 
 * Terminal wrapper for neural conditioning / skills interface.
 * Located near cryopod area of bunker.
 */

import TerminalContainer from '../TerminalContainer';
import SkillsWidget from '../../SkillsWidget';
import { TerminalType } from '../../../types/terminal';

export default function CryopodTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.CRYOPOD}
      title="NEURAL CONDITIONING STATION"
    >
      <SkillsWidget />
    </TerminalContainer>
  );
}
