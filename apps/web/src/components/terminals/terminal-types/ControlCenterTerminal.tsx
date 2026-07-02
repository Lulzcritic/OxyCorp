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
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user) {
      setUserId(user.id);
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
          <MapGrid 
            initialCenterX="0" 
            initialCenterY="0" 
            onSelectSector={setSelectedSector}
            selectedSectorId={selectedSector?.id}
            currentUserId={userId}
            refreshTrigger={mapRefreshTrigger}
          />
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
