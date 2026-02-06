import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface SellModalProps {
  itemId: string
  currentQuantity: string
  onClose: () => void
  onSuccess: () => void
}

export default function SellModal({ itemId, currentQuantity, onClose, onSuccess }: SellModalProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [price, setPrice] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  const handleSell = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setLoading(true)
    const res = await fetch('http://localhost:3000/api/market/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}` 
      },
      body: JSON.stringify({ 
        itemId, 
        quantity: Number(quantity), 
        price: Number(price) 
      })
    })

    if (res.ok) {
      alert('Order Placed Successfully!')
      onSuccess()
      onClose()
    } else {
      const err = await res.json()
      alert('Failed to place order: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#111', border: '1px solid #333', padding: 20, width: 300 }}>
        <h3 style={{ color: '#00FF9D', marginTop: 0 }}>SELL {itemId}</h3>
        <p>Available: {currentQuantity}</p>
        
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', color: '#888' }}>Quantity</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={e => setQuantity(Number(e.target.value))}
            style={{ width: '100%', background: '#222', border: '1px solid #444', color: 'white', padding: 5 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#888' }}>Price Per Unit</label>
          <input 
            type="number" 
            value={price} 
            onChange={e => setPrice(Number(e.target.value))}
            style={{ width: '100%', background: '#222', border: '1px solid #444', color: 'white', padding: 5 }}
          />
        </div>
        
        <div style={{ textAlign: 'right', color: '#FFD700', marginBottom: 20 }}>
          Total Value: {quantity * price} Credits
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#333', color: 'white', border: 'none', padding: 10, cursor: 'pointer' }}>CANCEL</button>
          <button onClick={handleSell} disabled={loading} style={{ flex: 1, background: '#00FF9D', color: 'black', border: 'none', padding: 10, cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? '...' : 'CONFIRM LISTING'}
          </button>
        </div>
      </div>
    </div>
  )
}
