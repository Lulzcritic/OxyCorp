/**
 * Control Center Terminal
 * 
 * Terminal wrapper for operations & resource management.
 * Includes mining, refining, and map systems.
 */

import { useState, useEffect } from 'react';
import TerminalContainer from '../TerminalContainer';
import MiningWidget from '../../MiningWidget';
import RefiningWidget from '../../RefiningWidget';
import MapGrid from '../../MapGrid';
import SectorDetailPanel from '../../SectorDetailPanel';
import { TerminalType } from '../../../types/terminal';
import { useAuthStore } from '../../../stores/authStore';
import { apiFetch } from '../../../lib/api';

interface Sector {
  id: string;
  x: string;
  y: string;
  type: 'BUNKER' | 'RESOURCE' | 'EMPTY';
  ownerId?: string;
  resources?: { type: string; quantity: number; richness: number };
  hasOutpost?: boolean;
}

export default function ControlCenterTerminal() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [bunkerCoords, setBunkerCoords] = useState<{ x: string; y: string } | null>(null);
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/user/profile');
      if (res.ok) {
        const data = await res.json();
        const bunker = data.sectors?.find((s: any) => s.type === 'BUNKER');
        if (bunker) {
          setBunkerCoords({ x: bunker.x, y: bunker.y });
        } else {
          setBunkerCoords({ x: '0', y: '0' });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setBunkerCoords({ x: '0', y: '0' });
    }
  };

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user) {
      setUserId(user.id);
      fetchProfile();
    }
  }, []);

  return (
    <TerminalContainer
      terminalType={TerminalType.CONTROL_CENTER}
      title="OPERATIONS COMMAND"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column: Mining & Refining */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MiningWidget selectedSector={selectedSector} currentUserId={userId} />
          <RefiningWidget />
        </div>

        {/* Right Column: Map & Sector Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {bunkerCoords ? (
            <MapGrid 
              initialCenterX={bunkerCoords.x} 
              initialCenterY={bunkerCoords.y} 
              onSelectSector={setSelectedSector}
              selectedSectorId={selectedSector?.id}
              currentUserId={userId}
              refreshTrigger={mapRefreshTrigger}
            />
          ) : (
            <div style={{ color: '#00FF9D', padding: 20, textAlign: 'center', fontFamily: 'monospace' }}>
              ACQUIRING BUNKER TELEMETRY...
            </div>
          )}
          <SectorDetailPanel
            sector={selectedSector}
            currentUserId={userId}
            onClaimed={() => {
              // Refresh sector data when claimed
              setSelectedSector(null);
              setMapRefreshTrigger(prev => prev + 1);
            }}
          />
        </div>
      </div>
    </TerminalContainer>
  );
}
