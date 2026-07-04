import { useState } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import GrimdarkInput from './grimdark/GrimdarkInput'
import '../styles/grimdark-theme.css'

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


    setLoading(true)
    const res = await apiFetch('/market/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
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
    <div
      className="crt-scanlines"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <GrimdarkCard title={`SELL ${itemId}`} status="warning" style={{ width: 320 }}>
        <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          <div style={{ color: '#888', marginBottom: 15, fontSize: '1rem' }}>
            Available: <span style={{ color: '#00FF9D' }}>{currentQuantity}</span>
          </div>
          
          <GrimdarkInput
            label="QUANTITY"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            style={{ marginBottom: 12 }}
          />

          <GrimdarkInput
            label="PRICE PER UNIT"
            type="number"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            style={{ marginBottom: 15 }}
          />
          
          <div style={{
            textAlign: 'right',
            color: '#FFA500',
            marginBottom: 15,
            fontSize: '1.1rem',
            textShadow: '0 0 5px rgba(255, 165, 0, 0.3)',
          }}>
            [TOTAL: ₡{quantity * price}]
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <GrimdarkButton variant="danger" onClick={onClose} style={{ flex: 1 }}>
              CANCEL
            </GrimdarkButton>
            <GrimdarkButton onClick={handleSell} disabled={loading} style={{ flex: 1 }}>
              {loading ? '...' : 'LIST ITEM'}
            </GrimdarkButton>
          </div>
        </div>
      </GrimdarkCard>
    </div>
  )
}
