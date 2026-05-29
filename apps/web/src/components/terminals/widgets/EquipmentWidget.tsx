import { useState } from 'react';
import { apiFetch } from '../../../lib/api';

interface EquipmentWidgetProps {
  equipment: Record<string, string>;
  inventory: Array<{ id: string; item: string; quantity: string }>;
  onRefresh: () => void;
}

const EQUIPMENT_SLOTS = [
  { id: 'head', label: 'NEURAL RIG' },
  { id: 'body', label: 'EXOSUIT' },
  { id: 'weapon', label: 'PRIMARY ARMAMENT' },
  { id: 'tool', label: 'EXTRACTION TOOL' },
];

export default function EquipmentWidget({ equipment, inventory, onRefresh }: EquipmentWidgetProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEquip = async (itemId: string) => {
    if (!selectedSlot || loading) return;
    setLoading(true);
    try {
      if (!session) return;

      const res = await apiFetch('/user/equipment/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slot: selectedSlot, itemId }),
      });

      if (res.ok) {
        onRefresh();
        setSelectedSlot(null);
      } else {
        console.error('Equip failed:', await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnequip = async (slotId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      if (!session) return;

      const res = await apiFetch('/user/equipment/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slot: slotId }),
      });

      if (res.ok) {
        onRefresh();
      } else {
        console.error('Unequip failed:', await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Slots Panel */}
      <div style={{ flex: 1, padding: '20px', background: '#0A0A0A', border: '1px solid #00FF9D' }}>
        <h3 style={{ color: '#00F3FF', marginBottom: '15px' }}>CURRENT LOADOUT</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {EQUIPMENT_SLOTS.map((slot) => {
            const equippedItem = equipment[slot.id];
            const isSelected = selectedSlot === slot.id;

            return (
              <div 
                key={slot.id}
                onClick={() => setSelectedSlot(isSelected ? null : slot.id)}
                style={{
                  padding: '15px',
                  background: isSelected ? '#1a2b1f' : '#111',
                  border: `1px solid ${isSelected ? '#00FF9D' : '#333'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '5px' }}>
                    {slot.label}
                  </div>
                  <div style={{ color: equippedItem ? '#0dff00' : '#444', fontWeight: 'bold' }}>
                    {equippedItem || 'EMPTY SLOT'}
                  </div>
                </div>
                {equippedItem && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUnequip(slot.id); }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #FF3366',
                      color: '#FF3366',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                    disabled={loading}
                  >
                    REMOVE
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selection Panel */}
      {selectedSlot && (
        <div style={{ flex: 1, padding: '20px', background: '#0A0A0A', border: '1px solid #FFD700' }}>
          <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>SELECT ITEM ({selectedSlot.toUpperCase()})</h3>
          {inventory.length === 0 ? (
            <div style={{ color: '#888' }}>NO ITEMS IN STORAGE</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventory.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleEquip(item.item)}
                  style={{
                    padding: '10px',
                    background: '#111',
                    border: '1px solid #444',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: '#FFF' }}>{item.item}</span>
                  <span style={{ color: '#888' }}>x{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
