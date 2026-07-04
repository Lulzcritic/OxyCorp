import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import '../styles/grimdark-theme.css'

interface Listing {
  id: string
  sellerName: string
  itemId: string
  quantity: string
  pricePerUnit: string
}

interface MarketWidgetProps {
  inventory?: Array<{ id: string; item: string; quantity: string }>;
  onListingCreated?: () => void;
}

export default function MarketWidget({ inventory = [], onListingCreated }: MarketWidgetProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  // Sell Form State
  const [sellItem, setSellItem] = useState<string>('');
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellPrice, setSellPrice] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default sell item if inventory exists
  useEffect(() => {
    if (inventory.length > 0 && !sellItem) {
      setSellItem(inventory[0].item);
    }
  }, [inventory, sellItem]);

  const fetchListings = async () => {
    setLoading(true)
    const res = await apiFetch('/market/listings', {
    })

    if (res.ok) {
      setListings(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchListings()
    const interval = setInterval(fetchListings, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleBuy = async (id: string, cost: number) => {
    if (!confirm(`Buy this listing for ${cost} Credits?`)) return

    const res = await apiFetch(`/market/buy/${id}`, {
      method: 'POST',
    })

    if (res.ok) {
      alert('Purchase Successful!')
      fetchListings()
      if (onListingCreated) onListingCreated() // refresh inventory
    } else {
      const err = await res.json()
      alert('Purchase Failed: ' + err.message)
    }
  }

  const handleSell = async () => {
    if (!sellItem || sellQuantity <= 0 || sellPrice <= 0) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/market/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: sellItem,
          quantity: sellQuantity,
          price: sellPrice
        })
      })

      if (res.ok) {
        alert('Listing Created Successfully!');
        fetchListings();
        if (onListingCreated) onListingCreated();
      } else {
        const err = await res.json();
        alert('Listing Failed: ' + err.message);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && listings.length === 0) {
    return (
      <GrimdarkCard title="GLOBAL EXCHANGE" status="online" style={{ marginTop: 20 }}>
        <div style={{ color: '#555', fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          &gt; Connecting to exchange...
        </div>
      </GrimdarkCard>
    )
  }

  const selectedInventoryItem = inventory.find(i => i.item === sellItem);

  return (
    <GrimdarkCard title="GLOBAL EXCHANGE" status="online" style={{ marginTop: 20 }}>
      <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        
        {/* SELL INTERFACE */}
        <div style={{ 
          background: '#0E0E0E', 
          border: '1px solid #00FF9D', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ color: '#00FF9D', marginTop: 0, marginBottom: '15px', fontSize: '1.2rem' }}>CREATE LISTING</h3>
          {inventory.length === 0 ? (
            <div style={{ color: '#888' }}>NO ITEMS IN STORAGE TO SELL.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>ITEM</label>
                <select 
                  value={sellItem} 
                  onChange={(e) => setSellItem(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#111',
                    color: '#FFF',
                    border: '1px solid #333',
                    padding: '8px',
                    fontFamily: 'inherit'
                  }}
                >
                  {inventory.map(inv => (
                    <option key={inv.item} value={inv.item}>{inv.item} (Owned: {inv.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>QTY (Max: {selectedInventoryItem?.quantity || 0})</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedInventoryItem ? parseInt(selectedInventoryItem.quantity) : 1}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#111',
                    color: '#FFF',
                    border: '1px solid #333',
                    padding: '8px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>PRICE PER UNIT (CR)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#111',
                    color: '#FFF',
                    border: '1px solid #333',
                    padding: '8px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <GrimdarkButton 
                onClick={handleSell} 
                disabled={isSubmitting || !sellItem}
                style={{ padding: '8px 20px', height: '37px' }}
              >
                {isSubmitting ? 'LISTING...' : 'SELL'}
              </GrimdarkButton>
            </div>
          )}
        </div>

        {/* Refresh bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>
            ACTIVE LISTINGS: {listings.length}
          </span>
          <button
            onClick={fetchListings}
            style={{
              background: 'transparent',
              border: '1px solid #2A2A2A',
              color: '#555',
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
              fontSize: '1rem',
            }}
          >
            [REFRESH]
          </button>
        </div>

        {listings.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', padding: 20 }}>
            No active listings. Be the first to sell!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 8,
              padding: '6px 10px',
              borderBottom: '1px solid #2A2A2A',
              color: '#555',
              fontSize: '0.85rem',
            }}>
              <span>ITEM</span>
              <span>QTY</span>
              <span>₡/UNIT</span>
              <span></span>
            </div>

            {listings.map(l => {
              const totalCost = Number(l.pricePerUnit) * Number(l.quantity)
              return (
                <div key={l.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: 8,
                  alignItems: 'center',
                  background: '#0E0E0E',
                  padding: '8px 10px',
                  border: '1px solid #2A2A2A',
                }}>
                  <div>
                    <span style={{ color: '#00FF9D' }}>{l.itemId}</span>
                    <div style={{ fontSize: '0.8rem', color: '#444' }}>
                      Seller: {l.sellerName}
                    </div>
                  </div>
                  <span style={{ color: '#888' }}>x{l.quantity}</span>
                  <span style={{ color: '#FFA500' }}>{l.pricePerUnit}</span>
                  <GrimdarkButton
                    onClick={() => handleBuy(l.id, totalCost)}
                    size="sm"
                  >
                    BUY [{totalCost}]
                  </GrimdarkButton>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </GrimdarkCard>
  )
}
