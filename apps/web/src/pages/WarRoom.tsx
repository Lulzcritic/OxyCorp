import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../lib/api';
import '../styles/grimdark-theme.css';

interface SwarmSlot {
  slotIndex: number;
  droneId: string;
  count: number;
}

interface InventoryItem {
  item: string;
  quantity: string;
}

interface DroneDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  hp: number;
  atk: number;
  speed: number;
  range: number;
  desc: string;
}

const DRONE_DEFINITIONS: Record<string, DroneDef> = {
  DRONE_GUARDIAN: {
    id: 'DRONE_GUARDIAN',
    name: 'Guardian I',
    icon: '🛡️',
    color: '#FFD700',
    hp: 200,
    atk: 10,
    speed: 2,
    range: 1,
    desc: 'Adds +15 HP globally to all units per Guardian in swarm.',
  },
  DRONE_CARRIER: {
    id: 'DRONE_CARRIER',
    name: 'Carrier I',
    icon: '🛰️',
    color: '#00F3FF',
    hp: 150,
    atk: 20,
    speed: 3,
    range: 1,
    desc: 'Adds +0.5 Mult ATK globally to all units per Carrier in swarm.',
  },
  DRONE_KAMIKAZE: {
    id: 'DRONE_KAMIKAZE',
    name: 'Kamikaze I',
    icon: '💥',
    color: '#FF3B30',
    hp: 20,
    atk: 80,
    speed: 6,
    range: 1,
    desc: 'Gains x2.0 Mult ATK if swarm has >=5 Kamikazes and >=1 Carrier.',
  },
  DRONE_JAMMER: {
    id: 'DRONE_JAMMER',
    name: 'Jammer I',
    icon: '📡',
    color: '#AF52DE',
    hp: 80,
    atk: 30,
    speed: 4,
    range: 1,
    desc: 'Multiplies attack speed of all units by x1.1 per Jammer in swarm.',
  },
  DRONE_COMMANDO: {
    id: 'DRONE_COMMANDO',
    name: 'Commando I',
    icon: '🪖',
    color: '#34C759',
    hp: 100,
    atk: 50,
    speed: 4,
    range: 1,
    desc: 'Gains x3.0 HP and ATK if exactly 1 Commando exists in swarm.',
  },
};

export default function WarRoom({ embedded = false }: { embedded?: boolean }) {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'Attack' | 'Defense'>('Attack');
  const [localFormations, setLocalFormations] = useState<Record<string, SwarmSlot[]>>({
    Attack: [],
    Defense: [],
  });
  const [slots, setSlots] = useState<SwarmSlot[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [maxDrones, setMaxDrones] = useState(50);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Profile for Inventory
      const resProfile = await apiFetch('/user/profile');
      if (resProfile.ok) {
        const profile = await resProfile.json();
        const droneInv: Record<string, number> = {};
        
        Object.keys(DRONE_DEFINITIONS).forEach((k) => {
          droneInv[k] = 0;
        });

        profile.inventory.forEach((i: InventoryItem) => {
          if (DRONE_DEFINITIONS[i.item]) {
            droneInv[i.item] = Number(i.quantity);
          }
        });
        setInventory(droneInv);
      }

      // Fetch Existing Swarms
      const resSwarm = await apiFetch('/swarms');
      if (resSwarm.ok) {
        const swarms = await resSwarm.json();
        const initialFormations: Record<string, SwarmSlot[]> = {
          Attack: [],
          Defense: [],
        };
        
        swarms.forEach((s: any) => {
          if (s.name === 'Attack' || s.name === 'Defense') {
            initialFormations[s.name] = s.formation;
          } else if (s.name === 'Alpha Squad' || s.name === 'Alpha Squadron' || s.isActive) {
            // Default active or old custom swarm maps to Attack
            initialFormations.Attack = s.formation;
          }
        });
        
        setLocalFormations(initialFormations);
        setSlots(initialFormations[activeTab]);
      }
    } catch (err) {
      console.error('Failed to load War Room data:', err);
    }
  };

  // Compute global totals
  const globalTotals = useMemo(() => {
    let guardians = 0;
    let carriers = 0;
    let kamikazes = 0;
    let jammers = 0;
    let commandos = 0;
    let total = 0;

    slots.forEach((s) => {
      total += s.count;
      if (s.droneId === 'DRONE_GUARDIAN') guardians += s.count;
      else if (s.droneId === 'DRONE_CARRIER') carriers += s.count;
      else if (s.droneId === 'DRONE_KAMIKAZE') kamikazes += s.count;
      else if (s.droneId === 'DRONE_JAMMER') jammers += s.count;
      else if (s.droneId === 'DRONE_COMMANDO') commandos += s.count;
    });

    return { guardians, carriers, kamikazes, jammers, commandos, total };
  }, [slots]);

  // Compute math properties for each slot
  const resolvedSlots = useMemo(() => {
    const addedHp = 15 * globalTotals.guardians;
    const addedMult = 0.5 * globalTotals.carriers;
    const speedMultiplier = Math.pow(1.1, globalTotals.jammers);

    return slots.map((slot) => {
      const def = DRONE_DEFINITIONS[slot.droneId];
      if (!def) return null;

      let hp = def.hp + addedHp;
      let mult = 1.0 + addedMult;

      let isKamikazeActive = false;
      if (slot.droneId === 'DRONE_KAMIKAZE') {
        if (globalTotals.kamikazes >= 5 && globalTotals.carriers >= 1) {
          mult *= 2.0;
          isKamikazeActive = true;
        }
      }

      let atk = def.atk * mult;
      let speed = def.speed * speedMultiplier;

      let isCommandoActive = false;
      if (slot.droneId === 'DRONE_COMMANDO' && globalTotals.commandos === 1) {
        hp *= 3.0;
        atk *= 3.0;
        isCommandoActive = true;
      }

      return {
        ...slot,
        def,
        finalHp: Math.floor(hp),
        finalAtk: Math.floor(atk),
        finalSpeed: Number(speed.toFixed(2)),
        isKamikazeActive,
        isCommandoActive,
      };
    }).filter(Boolean);
  }, [slots, globalTotals]);

  // Save swarm configuration
  const handleSave = async () => {
    if (globalTotals.total > maxDrones) {
      setMessage(`Error: Exceeds max drone limit of ${maxDrones}. Remove some drones.`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await apiFetch('/swarms/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: activeTab,
          formation: slots,
        }),
      });

      if (res.ok) {
        setMessage(`${activeTab === 'Attack' ? 'Attack' : 'Defense'} swarm configuration successfully locked!`);
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.message}`);
      }
    } catch (err) {
      setMessage('Failed to connect to battle network.');
    } finally {
      setLoading(false);
    }
  };

  // Add a drone variant to a slot
  const assignToSlot = (slotIndex: number, droneId: string) => {
    const existingIndex = slots.findIndex((s) => s.droneId === droneId);
    let updatedSlots = [...slots];
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      updatedSlots = updatedSlots.filter((s) => s.droneId !== droneId);
    }

    const newSlots = [...updatedSlots.filter((s) => s.slotIndex !== slotIndex), { slotIndex, droneId, count: 1 }].sort((a, b) => a.slotIndex - b.slotIndex);
    
    setSlots(newSlots);
    setLocalFormations((prev) => ({
      ...prev,
      [activeTab]: newSlots,
    }));
  };

  // Modify drone count in a slot
  const updateSlotCount = (slotIndex: number, delta: number) => {
    const newSlots = slots.map((s) => {
      if (s.slotIndex === slotIndex) {
        const nextCount = Math.max(1, Math.min(10, s.count + delta));
        return { ...s, count: nextCount };
      }
      return s;
    });

    setSlots(newSlots);
    setLocalFormations((prev) => ({
      ...prev,
      [activeTab]: newSlots,
    }));
  };

  // Remove a slot
  const removeSlot = (slotIndex: number) => {
    const newSlots = slots.filter((s) => s.slotIndex !== slotIndex).sort((a, b) => a.slotIndex - b.slotIndex);
    
    setSlots(newSlots);
    setLocalFormations((prev) => ({
      ...prev,
      [activeTab]: newSlots,
    }));
  };

  // Handle tab switcher swap
  const handleTabChange = (tab: 'Attack' | 'Defense') => {
    setActiveTab(tab);
    setSlots(localFormations[tab] || []);
    setMessage('');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, droneId: string) => {
    e.dataTransfer.setData('text/plain', droneId);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const droneId = e.dataTransfer.getData('text/plain');
    if (DRONE_DEFINITIONS[droneId]) {
      assignToSlot(slotIndex, droneId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div style={embedded ? { fontFamily: 'monospace', color: '#E5E7EB' } : { padding: '24px', background: '#070708', minHeight: '100vh', fontFamily: 'monospace', color: '#E5E7EB' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1F1F24', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          {!embedded ? (
            <>
              <h1 style={{ margin: 0, color: '#FFD700', fontSize: '1.5rem', letterSpacing: '0.1em', textShadow: '0 0 10px rgba(255,215,0,0.15)' }}>
                🤖 SWARM CONSOLE
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                Configure specialized drone formations for offensive and territorial defense operations.
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Configure specialized drone formations for offensive and territorial defense operations.
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem' }}>
            SWARM CAPACITY:{' '}
            <span style={{ color: globalTotals.total > maxDrones ? '#FF3B30' : '#00FF9D', fontWeight: 'bold' }}>
              {globalTotals.total}
            </span>
            /{maxDrones} DRONES
          </div>
          
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: activeTab === 'Attack' ? '#FFD700' : '#00FF9D',
              color: '#070708',
              border: 'none',
              padding: '10px 24px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderRadius: '3px',
              boxShadow: `0 0 15px ${activeTab === 'Attack' ? 'rgba(255,215,0,0.2)' : 'rgba(0,255,157,0.2)'}`,
              transition: 'opacity 0.2s',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'TRANSMITTING...' : `LOCK ${activeTab.toUpperCase()} CONFIG`}
          </button>
        </div>
      </div>

      {/* Deck Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => handleTabChange('Attack')}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: activeTab === 'Attack' ? 'rgba(255,215,0,0.08)' : '#0F0F12',
            color: activeTab === 'Attack' ? '#FFD700' : '#6B7280',
            border: `1px solid ${activeTab === 'Attack' ? '#FFD700' : '#1F1F24'}`,
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          🚀 OFFENSIVE SQUAD (USED FOR SECTOR ASSAULTS)
        </button>
        <button
          onClick={() => handleTabChange('Defense')}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: activeTab === 'Defense' ? 'rgba(0,255,157,0.06)' : '#0F0F12',
            color: activeTab === 'Defense' ? '#00FF9D' : '#6B7280',
            border: `1px solid ${activeTab === 'Defense' ? '#00FF9D' : '#1F1F24'}`,
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          🛡️ DEFENSIVE SQUAD (AUTO-DEFENDS SECURED LAND PLOTS)
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 18px', background: message.startsWith('Error') ? 'rgba(255,59,48,0.1)' : 'rgba(0,255,157,0.06)', border: `1px solid ${message.startsWith('Error') ? '#FF3B30' : '#00FF9D'}`, color: message.startsWith('Error') ? '#FF3B30' : '#00FF9D', borderRadius: '4px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Global Synergy Dashboard */}
      <div style={{ background: '#0F0F12', border: '1px solid #1F1F24', borderRadius: '4px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8rem', color: '#6B7280', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 'bold' }}>
          ACTIVE {activeTab.toUpperCase()} SYNERGIES
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ border: '1px solid #1F1F24', padding: '8px 12px', borderRadius: '3px', background: '#070708' }}>
            <span style={{ color: '#FFD700' }}>🛡️ {globalTotals.guardians} Guardians</span>
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px' }}>+{15 * globalTotals.guardians} HP to all units</div>
          </div>
          <div style={{ border: '1px solid #1F1F24', padding: '8px 12px', borderRadius: '3px', background: '#070708' }}>
            <span style={{ color: '#00F3FF' }}>🛰️ {globalTotals.carriers} Carriers</span>
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px' }}>+{0.5 * globalTotals.carriers} Mult ATK globally</div>
          </div>
          <div style={{ border: '1px solid #1F1F24', padding: '8px 12px', borderRadius: '3px', background: '#070708' }}>
            <span style={{ color: '#FF3B30' }}>💥 {globalTotals.kamikazes} Kamikazes</span>
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px' }}>
              {globalTotals.kamikazes >= 5 && globalTotals.carriers >= 1 ? '🔥 x2.0 ATK Active' : 'Requires >=5 Kamikaze & >=1 Carrier'}
            </div>
          </div>
          <div style={{ border: '1px solid #1F1F24', padding: '8px 12px', borderRadius: '3px', background: '#070708' }}>
            <span style={{ color: '#AF52DE' }}>📡 {globalTotals.jammers} Jammers</span>
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px' }}>x{Math.pow(1.1, globalTotals.jammers).toFixed(2)} Attack rate</div>
          </div>
          <div style={{ border: '1px solid #1F1F24', padding: '8px 12px', borderRadius: '3px', background: '#070708' }}>
            <span style={{ color: '#34C759' }}>🪖 {globalTotals.commandos} Commandos</span>
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '3px' }}>
              {globalTotals.commandos === 1 ? '⚡ x3.0 Solo Buff Active' : 'Requires exactly 1 Commando'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        
        {/* Main Panel: The 5 Synergy Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.05em', color: '#6B7280' }}>
            ACTIVE CONSOLE FORMATION (LEFT-TO-RIGHT POSITIONING)
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {Array.from({ length: 5 }).map((_, index) => {
              const slot = resolvedSlots.find((s) => s.slotIndex === index);
              const color = slot ? slot.def.color : '#1F1F24';

              return (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    background: '#0B0B0D',
                    border: `2px ${slot ? 'solid' : 'dashed'} ${color}`,
                    borderRadius: '4px',
                    padding: '16px 12px',
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: slot ? `0 0 15px ${color}1A` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Slot Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 'bold' }}>
                      SLOT {index + 1}
                    </span>
                    {slot && (
                      <button
                        onClick={() => removeSlot(index)}
                        style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {slot ? (
                    /* Active Slot Details */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '12px 0', flex: 1, justifyContent: 'space-between' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>
                          {slot.def.icon}
                        </span>
                        <span style={{ color, fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}>
                          {slot.def.name.toUpperCase()}
                        </span>
                      </div>

                      {/* Stacking Counter */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateSlotCount(index, -1)}
                          style={{ width: '24px', height: '24px', background: '#1F1F24', border: '1px solid #333', color: '#fff', cursor: 'pointer', borderRadius: '3px' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>
                          {slot.count}
                        </span>
                        <button
                          onClick={() => updateSlotCount(index, 1)}
                          style={{ width: '24px', height: '24px', background: '#1F1F24', border: '1px solid #333', color: '#fff', cursor: 'pointer', borderRadius: '3px' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Live Resolved Stats Display */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '3px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          HP:{' '}
                          <span style={{ color: '#00FF9D' }}>
                            {slot.finalHp * slot.count}
                          </span>{' '}
                          <span style={{ color: '#555' }}>
                            ({slot.finalHp} ea)
                          </span>
                        </div>
                        <div>
                          ATK:{' '}
                          <span style={{ color: '#FF3B30' }}>
                            {slot.finalAtk * slot.count}
                          </span>{' '}
                          <span style={{ color: '#555' }}>
                            ({slot.finalAtk} ea)
                          </span>
                        </div>
                        <div>
                          RATE:{' '}
                          <span style={{ color: '#AF52DE' }}>
                            x{slot.finalSpeed}
                          </span>
                        </div>
                        {slot.isKamikazeActive && (
                          <div style={{ color: '#FF3B30', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>
                            🔥 KAMIKAZE x2.0
                          </div>
                        )}
                        {slot.isCommandoActive && (
                          <div style={{ color: '#34C759', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>
                            ⚡ SOLO x3.0
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Empty Dropzone slot */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px 0', color: '#333' }}>
                      <span style={{ fontSize: '1.8rem', marginBottom: '8px' }}>◌</span>
                      <span style={{ fontSize: '0.72rem', textAlign: 'center', lineHeight: '1.4' }}>
                        DRAG HERE OR ASSIGN
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Drone Inventory */}
        <div style={{ background: '#0F0F12', border: '1px solid #1F1F24', borderRadius: '4px', padding: '20px 16px' }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', letterSpacing: '0.15em', borderBottom: '1px solid #1F1F24', paddingBottom: '12px', marginBottom: '16px', color: '#FFD700' }}>
            DRONE STORAGE
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(DRONE_DEFINITIONS).map(([id, def]) => {
              const countInInventory = inventory[id] || 0;
              const activeCountInSwarm = slots.find((s) => s.droneId === id)?.count || 0;
              const remaining = Math.max(0, countInInventory - activeCountInSwarm);

              return (
                <div
                  key={id}
                  draggable={remaining > 0}
                  onDragStart={(e) => handleDragStart(e, id)}
                  style={{
                    background: '#070708',
                    border: `1px solid ${def.color}`,
                    borderRadius: '4px',
                    padding: '12px',
                    opacity: remaining === 0 ? 0.35 : 1,
                    cursor: remaining > 0 ? 'grab' : 'not-allowed',
                    boxShadow: remaining > 0 ? `inset 0 0 10px ${def.color}0D` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#E5E7EB' }}>
                      {def.icon} {def.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: def.color }}>
                      QTY: {remaining}/{countInInventory}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: '1.4', marginBottom: '10px' }}>
                    {def.desc}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const isAssigned = slots.some((s) => s.slotIndex === index && s.droneId === id);
                      return (
                        <button
                          key={index}
                          disabled={remaining === 0 && !isAssigned}
                          onClick={() => assignToSlot(index, id)}
                          style={{
                            background: isAssigned ? def.color : 'transparent',
                            border: `1px solid ${isAssigned ? def.color : '#333'}`,
                            color: isAssigned ? '#070708' : '#888',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            padding: '4px 0',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            transition: 'all 0.1s',
                          }}
                        >
                          S{index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
