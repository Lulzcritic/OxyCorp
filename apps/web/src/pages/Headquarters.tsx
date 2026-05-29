/**
 * Headquarters Page
 * 
 * Page wrapper for the 3D outside HQ scene with terminal overlay integration.
 * Includes interaction prompt and crosshair HUD.
 */

import HeadquartersScene from '../components/game/HeadquartersScene';
import TerminalOverlay from '../components/terminals/TerminalOverlay';
import InteractionPrompt from '../components/game/InteractionPrompt';
import { useTerminalStore } from '../services/TerminalManager';

export default function Headquarters() {
  const isTerminalOpen = useTerminalStore((s) => s.isOpen);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      {/* 3D Scene */}
      <div 
        id="hq-container"
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: isTerminalOpen ? 'hidden' : 'visible',
        }}
      >
        <HeadquartersScene />
      </div>

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

      {/* Interaction Prompt */}
      {!isTerminalOpen && <InteractionPrompt />}

      {/* Terminal Overlay */}
      <TerminalOverlay />
    </div>
  );
}
