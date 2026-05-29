import BattleReplay from './BattleReplay';
import type { BattleLog } from '../../types/battle';
import '../../styles/grimdark-theme.css';

interface BattleResultModalProps {
  battleLog: BattleLog | null;
  onClose: () => void;
}

export default function BattleResultModal({
  battleLog,
  onClose,
}: BattleResultModalProps) {
  if (!battleLog) return null;

  return (
    <div className="gd-modal-backdrop" onClick={onClose}>
      <div className="gd-modal-content" onClick={(e) => e.stopPropagation()}>
        <BattleReplay battleLog={battleLog} onClose={onClose} />
      </div>

      <style>{`
        .gd-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .gd-modal-content {
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
          animation: gd-slide-in 0.3s ease;
        }

        @keyframes gd-slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
