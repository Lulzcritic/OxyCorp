

interface StorageWidgetProps {
  inventory: Array<{
    id: string;
    item: string;
    quantity: string;
  }>;
}

export default function StorageWidget({ inventory }: StorageWidgetProps) {
  return (
    <div style={{ padding: '20px', background: '#0A0A0A', border: '1px solid #00FF9D' }}>
      <h3 style={{ color: '#00F3FF', marginBottom: '15px', textTransform: 'uppercase' }}>Secure Storage Overview</h3>
      
      {inventory && inventory.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {inventory.map((slot) => (
            <div 
              key={slot.id} 
              style={{
                background: '#111', 
                border: '1px dashed #333', 
                padding: '10px', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '80px',
              }}
            >
              <div style={{ color: '#0dff00', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {slot.item}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem', textAlign: 'right' }}>
                QTY: {parseInt(slot.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
          STORAGE EXHAUSTED. NO ITEMS DETECTED.
        </div>
      )}
    </div>
  );
}
