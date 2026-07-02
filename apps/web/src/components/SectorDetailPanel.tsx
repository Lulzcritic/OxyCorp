import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import '../styles/grimdark-theme.css'

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


    const res = await apiFetch('/map/my-sectors', {
    })

    if (res.ok) {
      const data = await res.json()
      setSectorInfo({ count: data.count, limit: data.limit })
    }
  }

  const claimSector = async () => {
    if (!sector) return



    setClaiming(true)
    try {
      const res = await apiFetch('/map/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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



    if (!confirm('Install Outpost?\nCost: 1000 Credits, 50 Steel Plating, 100 Iron Ore\nEffect: +25% Mining Yield')) {
      return;
    }

    setClaiming(true)
    try {
      const res = await apiFetch('/map/install-outpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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


    setClaiming(true)
    try {
      const res = await apiFetch('/map/generate-territory', {
        method: 'POST',
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
      <GrimdarkCard title="SECTOR INTEL" status="offline" style={{ marginTop: 20 }}>
        <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          <div style={{ color: '#555' }}>Select a sector on the tactical map for details.</div>
          {sectorInfo && (
            <div style={{
              marginTop: 10,
              color: '#00F3FF',
              textShadow: '0 0 5px rgba(0, 243, 255, 0.3)',
            }}>
              [TERRITORIES: {sectorInfo.count}/{sectorInfo.limit}]
            </div>
          )}
          <GrimdarkButton
            variant="warning"
            onClick={generateTerritory}
            disabled={claiming}
            style={{ width: '100%', marginTop: 12 }}
          >
            {claiming ? 'GENERATING...' : 'EXPAND TERRITORY'}
          </GrimdarkButton>
        </div>
      </GrimdarkCard>
    )
  }

  const isOwned = !!sector.ownerId
  const isOwnedByMe = sector.ownerId === currentUserId
  const canClaim = !isOwned && (sector.type === 'RESOURCE' || sector.type === 'EMPTY')
  const canInstallOutpost = isOwnedByMe && sector.type === 'RESOURCE' && !sector.hasOutpost

  return (
    <GrimdarkCard
      title="SECTOR INTEL"
      status={isOwnedByMe ? 'online' : isOwned ? 'offline' : 'warning'}
      style={{ marginTop: 20 }}
    >
      <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ color: '#555', fontSize: '0.85rem' }}>COORDINATES</div>
            <div style={{ color: '#00FF9D' }}>
              [{sector.x}, {sector.y}]
            </div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '0.85rem' }}>TYPE</div>
            <div style={{
              color: sector.type === 'BUNKER' ? '#00FF9D' :
                     sector.type === 'RESOURCE' ? '#FFA500' : '#555'
            }}>
              {sector.type}
            </div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '0.85rem' }}>STATUS</div>
            <div style={{
              color: isOwnedByMe ? '#00F3FF' : isOwned ? '#CC0000' : '#00FF9D',
              textShadow: isOwnedByMe ? '0 0 5px rgba(0, 243, 255, 0.3)' : 'none',
            }}>
              {isOwnedByMe ? 'YOUR TERRITORY' : isOwned ? 'HOSTILE' : 'UNCLAIMED'}
            </div>
          </div>
          {sector.resources && (
            <div>
              <div style={{ color: '#555', fontSize: '0.85rem' }}>RESOURCE</div>
              <div style={{ color: '#FFA500' }}>
                [{sector.resources.type}: {Math.round(sector.resources.richness * 100)}%]
              </div>
            </div>
          )}
        </div>

        {sector.hasOutpost && (
          <div style={{
            marginTop: 12,
            padding: 8,
            background: 'rgba(0, 255, 157, 0.05)',
            border: '1px solid #00CC66'
          }}>
            <div style={{
              color: '#00FF9D',
              textShadow: '0 0 5px rgba(0, 255, 157, 0.3)',
            }}>
              ⚡ OUTPOST ACTIVE
            </div>
            <div style={{ color: '#555', fontSize: '0.9rem' }}>Extraction Yield: +25%</div>
          </div>
        )}

        {sectorInfo && (
          <div style={{
            marginTop: 12,
            padding: 8,
            background: '#0E0E0E',
            borderLeft: '2px solid #00F3FF'
          }}>
            <div style={{ color: '#555', fontSize: '0.85rem' }}>EXPANSION STATUS</div>
            <div style={{ color: '#00F3FF' }}>
              [TERRITORIES: {sectorInfo.count}/{sectorInfo.limit}]
            </div>
          </div>
        )}

        {canClaim && (
          <GrimdarkButton
            onClick={claimSector}
            disabled={claiming}
            style={{ width: '100%', marginTop: 12 }}
          >
            {claiming ? 'CLAIMING...' : 'CLAIM SECTOR [500 CR]'}
          </GrimdarkButton>
        )}

        {canInstallOutpost && (
          <GrimdarkButton
            variant="warning"
            onClick={installOutpost}
            disabled={claiming}
            style={{ width: '100%', marginTop: 8 }}
          >
            {claiming ? 'CONSTRUCTING...' : 'CONSTRUCT OUTPOST'}
          </GrimdarkButton>
        )}
      </div>
    </GrimdarkCard>
  )
}
