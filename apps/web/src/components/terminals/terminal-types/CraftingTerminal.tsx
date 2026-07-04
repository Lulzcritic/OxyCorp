import TerminalContainer from '../TerminalContainer';
import { TerminalType } from '../../../types/terminal';
import CraftingWidget from '../widgets/CraftingWidget';

export default function CraftingTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.CRAFTING}
      title="EQUIPMENT FORGE"
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <CraftingWidget />
      </div>
    </TerminalContainer>
  );
}
