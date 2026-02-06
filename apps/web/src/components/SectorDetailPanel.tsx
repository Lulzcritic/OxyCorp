import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Sector {
  id: string
  x: string
  y: string
  type: string
  ownerId?: string
  resources?: { type: string; quantity: number; richness: number }
  hasOutpost?: boolean
}

interface SectorDetailPanelProps {
  sector: Sector | null
  currentUserId: string
  onClaimed?: () => void
}

export default function SectorDetailPanel({ sector, currentUserId, onClaimed }: SectorDetailPanelProps) {
  const [claiming, setClaiming] = useState(false)
  const [sectorInfo, setSectorInfo] = useState<{ count: number; limit: number } | null>(null)

  useEffect(() => {
    fetchSectorInfo()
  }, [])

  const fetchSectorInfo = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/map/my-sectors', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (res.ok) {
      const data = await res.json()
      setSectorInfo({ count: data.count, limit: data.limit })
    }
  }

  const claimSector = async () => {
    if (!sector) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setClaiming(true)
    try {
      const res = await fetch('http://localhost:3000/api/map/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ x: parseInt(sector.x), y: parseInt(sector.y) })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Sector claimed! Cost: ${data.creditsSpent} CR | Plots: ${data.newPlotCount}/${data.plotLimit}`)
        await fetchSectorInfo()
        if (onClaimed) onClaimed()
      } else {
        const err = await res.json()
        alert('Claim failed: ' + err.message)
      }
    } finally {
      setClaiming(false)
    }
  }

  const installOutpost = async () => {
    if (!sector) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Confirm cost
    if (!confirm('Install Outpost?\nCost: 1000 Credits, 50 Steel Plating, 100 Iron Ore\nEffect: +25% Mining Yield')) {
      return;
    }

    setClaiming(true)
    try {
      const res = await fetch('http://localhost:3000/api/map/install-outpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ sectorId: sector.id })
      })

      if (res.ok) {
        alert(`Outpost constructed successfully! Mining operations will now yield +25% resources.`)
        if (onClaimed) onClaimed()
      } else {
        const err = await res.json()
        alert('Construction failed: ' + err.message)
      }
    } finally {
      setClaiming(false)
    }
  }

  const generateTerritory = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setClaiming(true)
    try {
      const res = await fetch('http://localhost:3000/api/map/generate-territory', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Territory generated! ${data.created} new sectors created around your bunker.`)
        if (onClaimed) onClaimed()
      } else {
        const err = await res.json()
        alert('Failed to generate territory: ' + err.message)
      }
    } finally {
      setClaiming(false)
    }
  }

  if (!sector) {
    return (
      <div style={{ border: '1px solid #444', padding: 20, background: '#111', marginTop: 20 }}>
        <h3 style={{ color: '#888', marginTop: 0 }}>SECTOR INTEL</h3>
        <div style={{ color: '#555' }}>Select a sector on the tactical map for details.</div>
        {sectorInfo && (
          <div style={{ marginTop: 10, color: '#00FFFF', fontFamily: 'monospace' }}>
            TERRITORIES: {sectorInfo.count}/{sectorInfo.limit}
          </div>
        )}
        <button
          onClick={generateTerritory}
          disabled={claiming}
          style={{
            marginTop: 15,
            width: '100%',
            background: claiming ? '#444' : '#FF6600',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontWeight: 'bold',
            cursor: claiming ? 'wait' : 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {claiming ? 'GENERATING...' : '🌐 EXPAND TERRITORY (Generate Nearby Sectors)'}
        </button>
      </div>
    )
  }

  const isOwned = !!sector.ownerId
  const isOwnedByMe = sector.ownerId === currentUserId
  const canClaim = !isOwned && (sector.type === 'RESOURCE' || sector.type === 'EMPTY')
  const canInstallOutpost = isOwnedByMe && sector.type === 'RESOURCE' && !sector.hasOutpost

  return (
    <div style={{ border: '1px solid #444', padding: 20, background: '#111', marginTop: 20 }}>
      <h3 style={{ color: '#888', marginTop: 0 }}>SECTOR INTEL</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ color: '#666', fontSize: '0.8rem' }}>COORDINATES</div>
          <div style={{ color: '#00FF9D', fontFamily: 'monospace' }}>
            ({sector.x}, {sector.y})
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '0.8rem' }}>TYPE</div>
          <div style={{ 
            color: sector.type === 'BUNKER' ? '#00FF9D' : 
                   sector.type === 'RESOURCE' ? '#FFD700' : '#666' 
          }}>
            {sector.type}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '0.8rem' }}>STATUS</div>
          <div style={{ 
            color: isOwnedByMe ? '#00FFFF' : isOwned ? '#FF5555' : '#00FF9D' 
          }}>
            {isOwnedByMe ? 'YOUR TERRITORY' : isOwned ? 'HOSTILE' : 'UNCLAIMED'}
          </div>
        </div>
        {sector.resources && (
          <div>
            <div style={{ color: '#666', fontSize: '0.8rem' }}>RESOURCE</div>
            <div style={{ color: '#FFD700' }}>
              {sector.resources.type} ({Math.round(sector.resources.richness * 100)}%)
            </div>
          </div>
        )}
      </div>

      {sector.hasOutpost && (
        <div style={{ marginTop: 15, padding: 10, background: '#112211', border: '1px solid #00FF9D' }}>
           <div style={{ color: '#00FF9D', fontWeight: 'bold' }}>⚡ OUTPOST ACTIVE</div>
           <div style={{ color: '#888', fontSize: '0.8rem' }}>Extraction Yield: +25%</div>
        </div>
      )}

      {sectorInfo && (
        <div style={{ marginTop: 15, padding: 10, background: '#0A0A0A', borderLeft: '2px solid #00FFFF' }}>
          <div style={{ color: '#888', fontSize: '0.8rem' }}>EXPANSION STATUS</div>
          <div style={{ color: '#00FFFF', fontFamily: 'monospace' }}>
            TERRITORIES: {sectorInfo.count}/{sectorInfo.limit}
          </div>
        </div>
      )}

      {canClaim && (
        <button
          onClick={claimSector}
          disabled={claiming}
          style={{
            marginTop: 15,
            width: '100%',
            background: claiming ? '#444' : '#00FF9D',
            color: 'black',
            border: 'none',
            padding: '12px 20px',
            fontWeight: 'bold',
            cursor: claiming ? 'wait' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {claiming ? 'CLAIMING...' : 'CLAIM SECTOR (500 CR)'}
        </button>
      )}

      {canInstallOutpost && (
        <button
          onClick={installOutpost}
          disabled={claiming}
          style={{
            marginTop: 15,
            width: '100%',
            background: claiming ? '#444' : '#FFD700',
            color: 'black',
            border: 'none',
            padding: '12px 20px',
            fontWeight: 'bold',
            cursor: claiming ? 'wait' : 'pointer',
            fontSize: '0.9rem'
          }}
          title="Cost: 1000 CR, 50 Steel, 100 Iron"
        >
          {claiming ? 'CONSTRUCTING...' : '⚙️ CONSTRUCT OUTPOST'}
        </button>
      )}
    </div>
  )
}
