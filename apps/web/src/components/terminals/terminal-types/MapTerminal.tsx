/**
 * Map Terminal
 * 
 * Interactive navigation UI that allows players to select plots
 * and travel directly to their procedurally generated areas.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalContainer from '../TerminalContainer';
import { TerminalType } from '../../../types/terminal';
import { useTerminalStore } from '../../../services/TerminalManager';
import MapGrid from '../../MapGrid';
import { apiFetch } from '../../../lib/api';
import { useAuthStore } from '../../../stores/authStore';

export default function MapTerminal() {
  const navigate = useNavigate();
  const closeTerminal = useTerminalStore((s) => s.closeTerminal);
  const [userId, setUserId] = useState<string>();
  const [selectedSector, setSelectedSector] = useState<any>(null);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user) {
      setUserId(user.id);
    }
  }, []);

  // Calculate state flags clearly
  const isOwnedByMe = Boolean(selectedSector?.ownerId && selectedSector.ownerId === userId);
  const isOwnedByOther = Boolean(selectedSector?.ownerId && selectedSector.ownerId !== userId && selectedSector.ownerId !== 'null' && selectedSector.ownerId !== '');
  
  // A BUNKER is always a headquarters. If we don't own it, it belongs to someone else.
  const isExternalBunker = Boolean(selectedSector?.type === 'BUNKER' && !isOwnedByMe);
  
  const isJumpDisabled = isExternalBunker;

  const handleJump = () => {
    if (!selectedSector || isJumpDisabled) return;
    
    if (isExternalBunker) {
        alert("WARNING: Unauthorized Access. You cannot jump to another player's Headquarters.");
        return;
    }

    closeTerminal();
    navigate(`/plot/${selectedSector.id}`, { state: { isOwned: isOwnedByMe } });
  };

  return (
    <TerminalContainer
      terminalType={TerminalType.VEHICLE_MAP}
      title="NAVIGATION PROTOCOL"
    >
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <MapGrid 
          initialCenterX="0" 
          initialCenterY="0" 
          currentUserId={userId}
          selectedSectorId={selectedSector?.id}
          onSelectSector={(sector) => setSelectedSector(sector)}
        />
        
        <div style={{ marginTop: 25, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {selectedSector ? (
            <>
              <div style={{ color: '#888', marginBottom: 10, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                STATUS: {
                  isOwnedByMe ? <span style={{color: '#00F3FF'}}>OWNED BY YOU</span> :
                  isExternalBunker ? <span style={{color: '#FF0055'}}>EXTERNAL HEADQUARTERS</span> :
                  isOwnedByOther ? <span style={{color: '#FF0055'}}>OWNED BY EXTERNAL CORP</span> :
                  <span style={{color: '#FFA500'}}>WILD SECTOR</span>
                }
              </div>
              <button
                onClick={handleJump}
              disabled={isJumpDisabled}
              style={{
                background: isJumpDisabled ? '#1A1A1A' : 'transparent',
                color: isJumpDisabled ? '#555' : '#00FF9D',
                border: `1px solid ${isJumpDisabled ? '#333' : '#00FF9D'}`,
                padding: '12px 30px',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                cursor: isJumpDisabled ? 'not-allowed' : 'pointer',
                pointerEvents: isJumpDisabled ? 'none' : 'auto',
                fontWeight: 'bold',
                textShadow: isJumpDisabled ? 'none' : '0 0 5px rgba(0,255,157,0.5)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isJumpDisabled) {
                  e.currentTarget.style.background = '#00FF9D';
                  e.currentTarget.style.color = '#000';
                }
              }}
              onMouseLeave={(e) => {
                if (!isJumpDisabled) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#00FF9D';
                }
              }}
            >
              [ INITIALIZE JUMP TO {selectedSector.x}, {selectedSector.y} ]
            </button>
            </>
          ) : (
            <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '1.2rem', marginTop: 10 }}>
              &gt; AWAITING TACTICAL COORDINATES...
            </div>
          )}
        </div>
      </div>
    </TerminalContainer>
  );
}
