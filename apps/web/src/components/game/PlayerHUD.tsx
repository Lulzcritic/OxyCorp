import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import StorageWidget from '../terminals/widgets/StorageWidget';

export default function PlayerHUD() {
  const [isOpen, setIsOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [tick, setTick] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(3600);
  const [martianDate, setMartianDate] = useState({
    year: 3615,
    month: 1,
    monthName: 'Sagittarius',
    day: 1,
    hour: 0,
  });
  
  const targetTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTickStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/gametick/status');
      if (res.ok) {
        const data = await res.json();
        setTick(data.current);
        if (data.martianDate) {
          setMartianDate(data.martianDate);
        }
        
        // Sync target time with local system time
        targetTimeRef.current = Date.now() + data.msRemaining;
        
        // Start/Restart local countdown loop
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
          const diff = Math.max(0, Math.ceil((targetTimeRef.current - Date.now()) / 1000));
          setTimeLeftSeconds(diff);
          
          if (diff <= 0) {
            // When countdown reaches 0, perform a single sync to fetch the new tick
            if (timerRef.current) clearInterval(timerRef.current);
            fetchTickStatus();
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to sync game tick:', err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await apiFetch('/user/profile');
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
        
        // Sync tick status from profile action response too to avoid extra API request
        if (data.blueprints !== undefined) {
          // Profile is successfully loaded, sync local tick too
          fetchTickStatus();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchTickStatus]);

  useEffect(() => {
    // Initial loads
    fetchInventory();
    fetchTickStatus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.code === 'KeyI') {
        setIsOpen((prev) => {
          if (!prev) fetchInventory();
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('inventory-updated', fetchInventory);
    window.addEventListener('gametick-updated', fetchTickStatus);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('inventory-updated', fetchInventory);
      window.removeEventListener('gametick-updated', fetchTickStatus);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchInventory, fetchTickStatus]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Martian Clock (Always Visible) */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(10, 10, 10, 0.85)',
          border: '1px solid #FFD700',
          color: '#FFD700',
          padding: '8px 15px',
          fontFamily: 'monospace',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
          textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>
          SOL {martianDate.day} {martianDate.monthName.toUpperCase()} {martianDate.year} | {martianDate.hour.toString().padStart(2, '0')}:00
        </span>
        <span style={{ color: '#444' }}>|</span>
        <span>RESET: {formatTime(timeLeftSeconds)}</span>
      </div>

      {/* Inventory Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '400px',
            maxHeight: '80vh',
            background: 'rgba(10, 10, 10, 0.95)',
            border: '1px solid #00FF9D',
            color: '#fff',
            padding: '20px',
            zIndex: 1000,
            overflowY: 'auto',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#00FF9D' }}>PERSONAL INVENTORY</h2>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', color: '#00FF9D', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              [X]
            </button>
          </div>
          <div style={{ color: '#888', marginBottom: '10px' }}>[PRESS 'I' TO CLOSE]</div>
          <StorageWidget inventory={inventory} />
        </div>
      )}
    </>
  );
}
