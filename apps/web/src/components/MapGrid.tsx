import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Sector {
  x: string;
  y: string;
  type: 'BUNKER' | 'RESOURCE' | 'EMPTY';
  id: string;
  ownerId?: string;
  resources?: { type: string; quantity: number; richness: number };
  hasOutpost?: boolean;
}

interface MapGridProps {
  initialCenterX: string;
  initialCenterY: string;
  onSelectSector?: (sector: Sector) => void;
  selectedSectorId?: string | null;
  currentUserId?: string;
}

const CELL_SIZE = 50;
const RADIUS = 5; // View radius (5 means 11x11 grid)

export default function MapGrid({ initialCenterX, initialCenterY, onSelectSector, selectedSectorId, currentUserId }: MapGridProps) {
  const [centerX, setCenterX] = useState(BigInt(initialCenterX));
  const [centerY, setCenterY] = useState(BigInt(initialCenterY));
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch area: center +/- radius
    // API expects BigInt string format
    const query = new URLSearchParams({
      x: centerX.toString(),
      y: centerY.toString(),
      radius: RADIUS.toString(),
    });

    try {
      const res = await fetch(`http://localhost:3000/api/map/sectors?${query}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSectors(data);
      }
    } catch (err) {
      console.error('Failed to fetch sectors', err);
    } finally {
      setLoading(false);
    }
  }, [centerX, centerY]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]); // fetchSectors is stable if useCallback is used, or suppressed if deemed safe.
  // Actually, let's wrap fetchSectors in useCallback to satisfy linter properly

  // Generate grid cells for rendering
  // We want to render a perfect square grid from -RADIUS to +RADIUS relative to center
  const gridCells = [];
  const range = Array.from({ length: RADIUS * 2 + 1 }, (_, i) => i - RADIUS);
  // Y loop (Top to Bottom: y decreasing)
  for (const dy of [...range].reverse()) {
    // X loop (Left to Right: x increasing)
    for (const dx of range) {
      const cellX = centerX + BigInt(dx);
      const cellY = centerY + BigInt(dy);
      
      const sector = sectors.find(
        (s) => s.x === cellX.toString() && s.y === cellY.toString()
      );

      gridCells.push({
        x: cellX,
        y: cellY,
        sector,
      });
    }
  }

  const handleNav = (dx: number, dy: number) => {
    setCenterX((prev) => prev + BigInt(dx));
    setCenterY((prev) => prev + BigInt(dy));
  };

  const getCellColor = (sector?: Sector) => {
    if (!sector) return '#222'; // Unknown/Fog (Empty but not fetched? OR empty on map)
    switch (sector.type) {
      case 'BUNKER':
        return '#00FF9D';
      case 'RESOURCE':
        return '#FFD700';
      case 'EMPTY':
      default:
        return '#333';
    }
  };

  return (
    <div style={{ marginTop: 40, border: '1px solid #333', padding: 20, background: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ color: '#888', margin: 0 }}>TACTICAL MAP</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ color: '#666', fontFamily: 'monospace' }}>
            CENTER: {centerX.toString()}, {centerY.toString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Navigation Pad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: 5, height: 'fit-content' }}>
          <div />
          <button onClick={() => handleNav(0, 1)} style={navBtnStyle}>N</button>
          <div />
          <button onClick={() => handleNav(-1, 0)} style={navBtnStyle}>W</button>
          <button 
            onClick={() => { 
                // Reset to initial center (Bunker)
                setCenterX(BigInt(initialCenterX)); 
                setCenterY(BigInt(initialCenterY)); 
            }} 
            style={{ ...navBtnStyle, fontSize: '10px', background: '#005533', color: 'white', border: '1px solid #00FF9D' }}
            title="JUMP TO HQ"
          >
            HQ
          </button>
          <button onClick={() => handleNav(1, 0)} style={navBtnStyle}>E</button>
          <div />
          <button onClick={() => handleNav(0, -1)} style={navBtnStyle}>S</button>
          <div />
        </div>

        {/* The Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${RADIUS * 2 + 1}, ${CELL_SIZE}px)`,
            gap: 2,
            background: '#000',
            border: '1px solid #444',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {gridCells.map((cell) => {
             const isSelected = cell.sector && cell.sector.id === selectedSectorId;
             return (
            <div
              key={`${cell.x.toString()},${cell.y.toString()}`}
              title={`(${cell.x.toString()}, ${cell.y.toString()}) ${cell.sector?.type || 'EMPTY'}`}
              onClick={() => cell.sector && onSelectSector && onSelectSector(cell.sector)}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: getCellColor(cell.sector),
                border: isSelected ? '2px solid white' : (cell.sector?.ownerId === currentUserId ? '2px solid #00FFFF' : '1px solid #222'),
                boxShadow: cell.sector?.ownerId === currentUserId ? '0 0 10px #00FFFF' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'black',
                fontWeight: 'bold',
                cursor: cell.sector ? 'pointer' : 'default',
                position: 'relative' // Needed for absolute positioning of labels
              }}
            >
               {cell.x === centerX && cell.y === centerY && <span style={{ color: 'white' }}>+</span>}
               {cell.sector?.type === 'BUNKER' && cell.sector.ownerId === currentUserId && (
                 <div style={{ position: 'absolute', bottom: 2, right: 2, fontSize: '8px', color: 'black', fontWeight: 'bold' }}>HQ</div>
               )}
               {cell.sector?.hasOutpost && (
                 <div style={{ position: 'absolute', top: 2, right: 2, fontSize: '10px' }}>⚡</div>
               )}
               {cell.sector?.type === 'RESOURCE' && cell.sector.ownerId === currentUserId && (
                 <div style={{ position: 'absolute', bottom: 2, right: 2, fontSize: '8px', color: 'black', fontWeight: 'bold' }}>MINE</div>
               )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}

const navBtnStyle = {
  background: '#333',
  color: '#00FF9D',
  border: '1px solid #444',
  height: 40,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold' as const,
};
