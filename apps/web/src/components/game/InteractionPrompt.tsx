/**
 * Interaction Prompt Component
 * 
 * HTML overlay that shows "Press E to access [TERMINAL_NAME]" when
 * the player is looking at a terminal within interaction range.
 */

import { useInteractionStore } from '../../services/InteractionStore';

export default function InteractionPrompt() {
  const hoveredLabel = useInteractionStore((s) => s.hoveredLabel);
  const inRange = useInteractionStore((s) => s.inRange);

  if (!hoveredLabel || !inRange) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        pointerEvents: 'none',
        textAlign: 'center',
      }}
    >
      {/* Crosshair */}
      <div
        style={{
          width: 4,
          height: 4,
          background: '#00FF9D',
          borderRadius: '50%',
          margin: '0 auto 15px',
          boxShadow: '0 0 8px #00FF9D',
        }}
      />

      {/* Prompt */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #00FF9D',
          padding: '10px 20px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          color: '#00FF9D',
          textShadow: '0 0 5px #00FF9D',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
          [ {hoveredLabel} ]
        </div>
        <div style={{ color: '#AAFFDD', fontSize: '0.8rem' }}>
          PRESS <span style={{ color: '#FFD700', fontWeight: 'bold' }}>E</span> TO ACCESS
        </div>
      </div>
    </div>
  );
}
