/**
 * Plot Page wrapper
 * 
 * Handles URL parameters to compute plot seed and renders the Plot 3D scene.
 * Provides overlay UI for crosshairs, terminal interactions, and a back button.
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import PlotScene from '../components/game/PlotScene';
import TerminalOverlay from '../components/terminals/TerminalOverlay';
import InteractionPrompt from '../components/game/InteractionPrompt';
import { useTerminalStore } from '../services/TerminalManager';
import PlayerHUD from '../components/game/PlayerHUD';

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default function Plot() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isTerminalOpen = useTerminalStore((s) => s.isOpen);

  const isOwned = location.state?.isOwned ?? false;

  const seed = useMemo(() => {
    if (!id) return 42;
    // Fast string to number ID for procedural seeding
    return isNaN(Number(id)) ? hashStringToInt(id) : Number(id);
  }, [id]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <PlayerHUD />
      {/* 3D Scene */}
      <div 
        id="plot-container"
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: isTerminalOpen ? 'hidden' : 'visible',
        }}
      >
        <PlotScene seed={seed} isOwned={isOwned} />
      </div>

      {/* Floating HUD Back Button */}
      <button
        onClick={() => navigate('/hq')}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid #FF0055',
          color: '#FF0055',
          fontFamily: 'monospace',
          fontSize: '1rem',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        [ RETURN TO HQ ]
      </button>

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
              background: 'rgba(0, 255, 157, 0.6)',
              position: 'absolute',
              top: -8,
              left: -1,
            }}
          />
          <div
            style={{
              width: 16,
              height: 2,
              background: 'rgba(0, 255, 157, 0.6)',
              position: 'absolute',
              top: -1,
              left: -8,
            }}
          />
        </div>
      )}

      {/* Interaction Prompt for Ore */}
      {!isTerminalOpen && <InteractionPrompt />}

      {/* Terminal Overlay */}
      <TerminalOverlay />
    </div>
  );
}
