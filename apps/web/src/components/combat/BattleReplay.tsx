import { useState, useEffect } from 'react';
import type { BattleLog, BattleDroneState } from '../../types/battle';
import '../../styles/grimdark-theme.css';

interface BattleReplayProps {
  battleLog: BattleLog;
  onClose?: () => void;
}

/** Build ASCII HP bar like [||||    ] */
function asciiHpBar(hp: number, maxHp: number, width = 8): string {
  const filled = Math.round((hp / maxHp) * width);
  return '[' + '|'.repeat(filled) + ' '.repeat(width - filled) + ']';
}

export default function BattleReplay({ battleLog, onClose }: BattleReplayProps) {
  const [currentTick, setCurrentTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const maxTick = battleLog.ticks.length - 1;

  const getDroneStates = (): BattleDroneState[] => {
    const states = new Map<string, BattleDroneState>(
      battleLog.initialState.drones.map((d) => [d.id, { ...d }]),
    );

    for (let i = 0; i <= currentTick && i < battleLog.ticks.length; i++) {
      const tick = battleLog.ticks[i];
      for (const event of tick.events) {
        if (event.type === 'MOVE') {
          const drone = states.get(event.droneId);
          if (drone) {
            drone.x = event.to.x;
            drone.y = event.to.y;
          }
        } else if (event.type === 'DAMAGE') {
          const drone = states.get(event.targetId);
          if (drone) {
            drone.hp = event.remainingHp;
          }
        }
      }
    }

    return Array.from(states.values());
  };

  const droneStates = getDroneStates();

  useEffect(() => {
    if (!isPlaying) return;
    if (currentTick >= maxTick) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentTick((prev) => Math.min(prev + 1, maxTick));
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentTick, maxTick, speed]);

  const skipToEnd = () => {
    setCurrentTick(maxTick);
    setIsPlaying(false);
  };

  const winnerName = battleLog.meta.winnerId === battleLog.meta.swarmAId
    ? battleLog.meta.swarmAName
    : battleLog.meta.winnerId === battleLog.meta.swarmBId
      ? battleLog.meta.swarmBName
      : 'DRAW';

  return (
    <div className="battle-replay-container crt-scanlines">
      {/* Header */}
      <div className="battle-replay-header">
        <h2>[ COMBAT LOG ]</h2>
        <p className="battle-matchup">
          <span className="team-a-name">{battleLog.meta.swarmAName}</span>
          {' '}<span style={{ color: '#555' }}>vs</span>{' '}
          <span className="team-b-name">{battleLog.meta.swarmBName}</span>
        </p>
        <p className="battle-winner">
          VICTOR: <span style={{ color: '#00FF9D', textShadow: '0 0 5px rgba(0, 255, 157, 0.4)' }}>{winnerName}</span>
        </p>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            [X]
          </button>
        )}
      </div>

      {/* 5x5 Grid */}
      <div className="battle-grid">
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid-row">
            {Array.from({ length: 5 }).map((_, col) => {
              const drone = droneStates.find((d) => d.x === col && d.y === row);
              return (
                <div key={`${row}-${col}`} className="grid-cell">
                  {drone && drone.hp > 0 && (
                    <div
                      className={`drone ${
                        drone.teamId === 'A' ? 'team-a' : 'team-b'
                      }`}
                    >
                      <div className="drone-icon">
                        {drone.teamId === 'A' ? '◆' : '◇'}
                      </div>
                      <div className="hp-ascii">
                        {asciiHpBar(drone.hp, drone.maxHp)}
                      </div>
                      <div className="hp-text">
                        {drone.hp}/{drone.maxHp}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="battle-controls">
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '[PAUSE]' : '[PLAY]'}
        </button>
        <button onClick={skipToEnd}>[SKIP]</button>
        <label>
          SPEED:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          {speed}x
        </label>
        <div className="tick-info">
          TICK: [{currentTick}/{maxTick}]
        </div>
      </div>

      <style>{`
        .battle-replay-container {
          background: #0A0A0A;
          border: 1px solid #2A2A2A;
          padding: 20px;
          color: #888;
          max-width: 600px;
          margin: 0 auto;
          font-family: var(--gd-font-primary, 'VT323', monospace);
          position: relative;
        }

        .battle-replay-header {
          text-align: center;
          margin-bottom: 20px;
          position: relative;
        }

        .battle-replay-header h2 {
          margin: 0;
          color: #00CC66;
          letter-spacing: 0.15em;
          text-shadow: 0 0 5px rgba(0, 255, 157, 0.3);
        }

        .battle-matchup {
          font-size: 1rem;
        }

        .team-a-name {
          color: #00F3FF;
          text-shadow: 0 0 5px rgba(0, 243, 255, 0.3);
        }

        .team-b-name {
          color: #CC0000;
          text-shadow: 0 0 5px rgba(204, 0, 0, 0.3);
        }

        .battle-winner {
          color: #555;
          font-size: 0.95rem;
        }

        .close-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: transparent;
          border: 1px solid #CC0000;
          color: #CC0000;
          font-size: 1rem;
          cursor: pointer;
          padding: 4px 8px;
          font-family: var(--gd-font-primary, 'VT323', monospace);
        }

        .close-btn:hover {
          background: #CC0000;
          color: #FFFFFF;
        }

        .battle-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 20px;
        }

        .grid-row {
          display: flex;
          gap: 2px;
        }

        .grid-cell {
          width: 80px;
          height: 80px;
          background: #161616;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .drone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .drone-icon {
          font-size: 24px;
        }

        .team-a .drone-icon {
          color: #00F3FF;
          text-shadow: 0 0 8px rgba(0, 243, 255, 0.5);
        }

        .team-b .drone-icon {
          color: #CC0000;
          text-shadow: 0 0 8px rgba(204, 0, 0, 0.5);
        }

        .hp-ascii {
          font-size: 10px;
          color: #00CC66;
          letter-spacing: 0;
        }

        .hp-text {
          font-size: 10px;
          color: #555;
        }

        .battle-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .battle-controls button {
          background: transparent;
          border: 1px solid #00CC66;
          padding: 6px 14px;
          color: #00CC66;
          cursor: pointer;
          font-family: var(--gd-font-primary, 'VT323', monospace);
          font-size: 0.95rem;
          letter-spacing: 0.1em;
        }

        .battle-controls button:hover {
          background: rgba(0, 204, 102, 0.1);
          box-shadow: 0 0 8px rgba(0, 204, 102, 0.3);
        }

        .battle-controls label {
          display: flex;
          gap: 6px;
          align-items: center;
          color: #555;
          font-size: 0.9rem;
        }

        .battle-controls input[type="range"] {
          accent-color: #00CC66;
        }

        .tick-info {
          color: #555;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
