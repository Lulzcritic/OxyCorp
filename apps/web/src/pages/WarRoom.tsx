
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DraggableDrone from '../components/DraggableDrone';

interface DronePosition {
  droneId: string;
  x: number;
  y: number;
}

interface InventoryItem {
  item: string;
  quantity: string;
}

export default function WarRoom() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formation, setFormation] = useState<DronePosition[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 5x5 Grid
  const gridSize = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch Inventory (Profile)
    const resProfile = await fetch('http://localhost:3000/api/user/profile', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (resProfile.ok) {
      const profile = await resProfile.json();
      // Filter for items starting with DRONE_
      const drones = profile.inventory.filter((i: InventoryItem) => i.item.startsWith('DRONE_'));
      setInventory(drones);
    }

    // Fetch Existing Swarm
    const resSwarm = await fetch('http://localhost:3000/api/swarms', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (resSwarm.ok) {
      const swarms = await resSwarm.json();
      if (swarms.length > 0) {
        setFormation(swarms[0].formation);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    const droneId = e.dataTransfer.getData('text/plain');
    
    // Check if slot is occupied
    const existing = formation.find(p => p.x === x && p.y === y);
    if (existing) {
      // Replace or ignore? Let's replace.
    }

    // Update formation
    setFormation(prev => {
        // Remove any existing drone at this x,y
        const filtered = prev.filter(p => !(p.x === x && p.y === y));
        return [...filtered, { droneId, x, y }];
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleRemove = (x: number, y: number) => {
      setFormation(prev => prev.filter(p => !(p.x === x && p.y === y)));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('http://localhost:3000/api/swarms/save', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
            name: 'Alpha Squad', // Hardcoded for MVP
            formation
        })
    });

    if (res.ok) {
        setMessage('Formation Saved Successfully!');
    } else {
        const err = await res.json();
        setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, display: 'flex', gap: 40, height: '100vh', background: '#050505', color: '#00FF9D', overflow: 'hidden' }}>
      
      {/* Sidebar: Drone Inventory */}
      <div style={{ width: 300 }}>
        <h2>DRONE BAY</h2>
        {inventory.length === 0 ? (
            <div style={{ color: '#555' }}>No Drones in Inventory. Buy or Mine some!</div>
        ) : (
            inventory.map((slot, idx) => (
                <DraggableDrone 
                    key={idx} 
                    id={slot.item} 
                    quantity={Number(slot.quantity)} 
                    onDragStart={handleDragStart} 
                />
            ))
        )}
      </div>

      {/* Main: Tac Map */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>TACTICAL MAP</h2>
            <button 
                onClick={handleSave}
                disabled={loading}
                style={{ 
                    background: '#00FF9D', color: 'black', 
                    border: 'none', padding: '10px 30px', 
                    fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                    opacity: loading ? 0.5 : 1
                }}
            >
                {loading ? 'SAVING...' : 'SAVE CONFIGURATION'}
            </button>
        </div>
        
        {message && <div style={{ padding: 10, background: '#333', color: 'white', marginBottom: 20 }}>{message}</div>}

        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridSize}, 100px)`, 
            gap: 10,
            justifyContent: 'center',
            marginTop: 40
        }}>
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                const drone = formation.find(p => p.x === x && p.y === y);

                return (
                    <div
                        key={i}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, x, y)}
                        onDoubleClick={() => handleRemove(x, y)}
                        style={{
                            width: 100, height: 100,
                            border: '1px dashed #333',
                            background: drone ? '#111' : 'transparent',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontSize: '0.8rem', textAlign: 'center',
                            cursor: drone ? 'pointer' : 'default',
                            position: 'relative'
                        }}
                        title={drone ? 'Double click to remove' : ''}
                    >
                        {drone ? (
                            <div style={{ color: '#00FF9D', fontWeight: 'bold' }}>
                                ☢ {drone.droneId.replace('DRONE_', '')}
                            </div>
                        ) : (
                            <span style={{ color: '#222' }}>{x},{y}</span>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
