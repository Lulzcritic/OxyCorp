
import React from 'react';

interface DraggableDroneProps {
  id: string; // The unique inventory item ID or type (e.g. DRONE_ATTACK_V1)
  quantity?: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export default function DraggableDrone({ id, quantity, onDragStart }: DraggableDroneProps) {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      style={{ 
        padding: 10, 
        border: '1px solid #00FF9D', 
        marginBottom: 10, 
        cursor: 'move',
        background: '#050505',
        color: '#00FF9D'
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{id}</div>
      {quantity !== undefined && <div style={{ fontSize: '0.8rem', color: '#888' }}>x{quantity}</div>}
    </div>
  );
}
