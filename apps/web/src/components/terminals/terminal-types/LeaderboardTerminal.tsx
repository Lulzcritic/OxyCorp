import TerminalContainer from '../TerminalContainer';
import LeaderboardWidget from '../widgets/LeaderboardWidget';
import { TerminalType } from '../../../types/terminal';

export default function LeaderboardTerminal() {
  return (
    <TerminalContainer
      terminalType={TerminalType.LEADERBOARD}
      title="COGNITIVE CLASSIFICATION SYSTEM"
    >
      <div style={{ maxWidth: 800, margin: '0 auto', height: '80vh' }}>
        <LeaderboardWidget />
      </div>
    </TerminalContainer>
  );
}
