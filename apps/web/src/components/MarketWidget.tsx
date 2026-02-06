import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Listing {
  id: string
  sellerName: string
  itemId: string
  quantity: string
  pricePerUnit: string
}

export default function MarketWidget() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const fetchListings = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/market/listings', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (res.ok) {
      setListings(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchListings()
    // Poll every 10s for new listings
    const interval = setInterval(fetchListings, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleBuy = async (id: string, cost: number) => {
    if (!confirm(`Buy this listing for ${cost} Credits?`)) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`http://localhost:3000/api/market/buy/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (res.ok) {
      alert('Purchase Successful!')
      fetchListings() // Refresh list
      // Ideally trigger a global refresh of credits via a context or callback
      window.location.reload() // Brute force refresh for MVP to update header credits
    } else {
      const err = await res.json()
      alert('Purchase Failed: ' + err.message)
    }
  }

  if (loading && listings.length === 0) return <div style={{ padding: 20 }}>Loading Market...</div>

  return (
    <div style={{ marginTop: 40, border: '1px solid #333', padding: 20, background: '#111' }}>
      <h3 style={{ color: '#00FF9D', display: 'flex', justifyContent: 'space-between' }}>
        GLOBAL EXCHANGE 
        <button onClick={fetchListings} style={{ background: 'transparent', border: '1px solid #333', color: '#888', cursor: 'pointer' }}>↻</button>
      </h3>
      
      {listings.length === 0 ? (
        <div style={{ color: '#555', fontStyle: 'italic' }}>No active listings. Be the first to sell!</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {listings.map(l => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#080808', padding: 10, border: '1px solid #222' }}>
              <div>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{l.itemId}</span>
                <span style={{ color: '#888', marginLeft: 10 }}>x{l.quantity}</span>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>Seller: {l.sellerName}</div>
              </div>
              <button 
                onClick={() => handleBuy(l.id, Number(l.pricePerUnit) * Number(l.quantity))}
                style={{ background: '#00FF9D', color: 'black', border: 'none', padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                BUY ({Number(l.pricePerUnit) * Number(l.quantity)} CR)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
