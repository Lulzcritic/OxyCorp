/**
 * Town Page
 * 
 * Page wrapper for the dedicated 3D Town scene with terminal and PNJ overlays.
 */

import { useNavigate } from 'react-router-dom';
import TownScene from '../components/game/TownScene';
import TerminalOverlay from '../components/terminals/TerminalOverlay';
import InteractionPrompt from '../components/game/InteractionPrompt';
import { useTerminalStore } from '../services/TerminalManager';
import PlayerHUD from '../components/game/PlayerHUD';

export default function Town() {
  const navigate = useNavigate();
  const isTerminalOpen = useTerminalStore((s) => s.isOpen);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <PlayerHUD />
      
      {/* 3D Scene */}
      <div 
        id="town-container"
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: isTerminalOpen ? 'hidden' : 'visible',
        }}
      >
        <TownScene />
      </div>

      {/* Floating Return Button */}
      {!isTerminalOpen && (
        <button
          onClick={() => navigate('/bunker')}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: '10px 20px',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #00F3FF',
            color: '#00F3FF',
            fontFamily: 'monospace',
            fontSize: '1rem',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00F3FF';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.85)';
            e.currentTarget.style.color = '#00F3FF';
          }}
        >
          [ RETURN TO BUNKER ]
        </button>
      )}

      {/* Crosshair */}
      {!isTerminalOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 2,
              height: 16,
              background: 'rgba(0, 243, 255, 0.6)',
              position: 'absolute',
              top: -8,
              left: -1,
            }}
          />
          <div
            style={{
              width: 16,
              height: 2,
              background: 'rgba(0, 243, 255, 0.6)',
              position: 'absolute',
              top: -1,
              left: -8,
            }}
          />
        </div>
      )}

      {/* Interaction Prompt for terminals / PNJs */}
      <InteractionPrompt />

      {/* Unified Terminal & Dialogue overlay */}
      <TerminalOverlay />
    </div>
  );
}
