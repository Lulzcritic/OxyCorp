import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import '../styles/grimdark-theme.css';

interface Sector {
  x: string;
  y: string;
  type: 'BUNKER' | 'RESOURCE' | 'EMPTY' | 'TOWN';
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
  refreshTrigger?: number;
}

const CELL_SIZE = 50;
const RADIUS = 5;

export default function MapGrid({ initialCenterX, initialCenterY, onSelectSector, selectedSectorId, currentUserId, refreshTrigger }: MapGridProps) {
  const [centerX, setCenterX] = useState(BigInt(initialCenterX));
  const [centerY, setCenterY] = useState(BigInt(initialCenterY));
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSectors = useCallback(async () => {
    setLoading(true);

    const query = new URLSearchParams({
      x: centerX.toString(),
      y: centerY.toString(),
      radius: RADIUS.toString(),
    });

    try {
      const res = await apiFetch(`/map/sectors?${query}`);
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
  }, [fetchSectors, refreshTrigger]);

  const gridCells = [];
  const range = Array.from({ length: RADIUS * 2 + 1 }, (_, i) => i - RADIUS);
  for (const dy of [...range].reverse()) {
    for (const dx of range) {
      const cellX = centerX + BigInt(dx);
      const cellY = centerY + BigInt(dy);
      
      const sector = sectors.find(
        (s) => String(s.x) === String(cellX) && String(s.y) === String(cellY)
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
    if (!sector) return '#1A1A1A';
    switch (sector.type) {
      case 'BUNKER':
        return '#00CC6640';
      case 'TOWN':
        return '#00F3FF30';
      case 'RESOURCE':
        return '#FFA50040';
      case 'EMPTY':
      default:
        return '#2A2A2A';
    }
  };

  const getCellBorderColor = (sector?: Sector) => {
    if (!sector) return '#1A1A1A';
    switch (sector.type) {
      case 'BUNKER':
        return '#00CC66';
      case 'TOWN':
        return '#00F3FF';
      case 'RESOURCE':
        return '#FFA500';
      case 'EMPTY':
      default:
        return '#2A2A2A';
    }
  };

  return (
    <div style={{
      marginTop: 20,
      border: '1px solid #2A2A2A',
      padding: 20,
      background: '#0A0A0A',
      fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
        <div style={{
          color: '#00CC66',
          fontSize: '1.1rem',
          letterSpacing: '0.15em',
          textShadow: '0 0 5px rgba(0, 255, 157, 0.3)',
        }}>
          [ TACTICAL MAP ]
        </div>
        <div style={{ color: '#555', fontSize: '0.95rem' }}>
          CENTER: [{centerX.toString()}, {centerY.toString()}]
        </div>
      </div>

      <div style={{ display: 'flex', gap: 15 }}>
        {/* Navigation Pad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gap: 4, height: 'fit-content' }}>
          <div />
          <button onClick={() => handleNav(0, 1)} style={navBtnStyle}>N</button>
          <div />
          <button onClick={() => handleNav(-1, 0)} style={navBtnStyle}>W</button>
          <button
            onClick={() => {
              setCenterX(BigInt(initialCenterX));
              setCenterY(BigInt(initialCenterY));
            }}
            style={{ ...navBtnStyle, color: '#00FF9D', border: '1px solid #00CC66', background: '#0E1E0E' }}
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
            gap: 1,
            background: '#111',
            border: '1px solid #2A2A2A',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {gridCells.map((cell) => {
            const isSelected = cell.sector && cell.sector.id === selectedSectorId;
            const isOwned = cell.sector?.ownerId === currentUserId;
            return (
              <div
                key={`${cell.x.toString()},${cell.y.toString()}`}
                title={`(${cell.x.toString()}, ${cell.y.toString()}) ${cell.sector?.type || 'EMPTY'}`}
                onClick={() => cell.sector && onSelectSector && onSelectSector(cell.sector)}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: getCellColor(cell.sector),
                  border: isSelected
                    ? '2px solid #FFFFFF'
                    : isOwned
                      ? `1px solid #00F3FF`
                      : `1px solid ${getCellBorderColor(cell.sector)}40`,
                  boxShadow: isOwned ? '0 0 6px rgba(0, 243, 255, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#888',
                  cursor: cell.sector ? 'pointer' : 'default',
                  position: 'relative',
                  fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
                }}
              >
                {cell.x === centerX && cell.y === centerY && <span style={{ color: '#00FF9D' }}>+</span>}
                {cell.sector?.type === 'BUNKER' && cell.sector.ownerId === currentUserId && (
                  <div style={{ position: 'absolute', bottom: 1, right: 2, fontSize: '9px', color: '#00FF9D' }}>HQ</div>
                )}
                {cell.sector?.type === 'TOWN' && (
                  <div style={{ position: 'absolute', bottom: 1, right: 2, fontSize: '8px', color: '#00F3FF', fontWeight: 'bold' }}>TOWN</div>
                )}
                {cell.sector?.hasOutpost && (
                  <div style={{ position: 'absolute', top: 1, right: 2, fontSize: '9px', color: '#FFA500' }}>⚡</div>
                )}
                {cell.sector?.type === 'RESOURCE' && cell.sector.ownerId === currentUserId && (
                  <div style={{ position: 'absolute', bottom: 1, right: 2, fontSize: '8px', color: '#FFA500' }}>▪</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 15, marginTop: 10, fontSize: '0.85rem', color: '#555' }}>
        <span><span style={{ color: '#00CC66' }}>■</span> BUNKER</span>
        <span><span style={{ color: '#00F3FF' }}>■</span> TOWN</span>
        <span><span style={{ color: '#FFA500' }}>■</span> RESOURCE</span>
        <span><span style={{ color: '#2A2A2A' }}>■</span> EMPTY</span>
        <span><span style={{ color: '#00F3FF' }}>□</span> OWNED</span>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: '#161616',
  color: '#00CC66',
  border: '1px solid #2A2A2A',
  height: 36,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
  fontSize: '0.95rem',
};
