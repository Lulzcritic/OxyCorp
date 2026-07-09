import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import { useTerminalStore } from '../services/TerminalManager'
import BattleReplay3D from './combat/BattleReplay3D'
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
  bunkerCoords?: { x: number; y: number } | null
  onClaimed?: () => void
}

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default function SectorDetailPanel({ sector, currentUserId, bunkerCoords, onClaimed }: SectorDetailPanelProps) {
  const navigate = useNavigate()
  const closeTerminal = useTerminalStore((s) => s.closeTerminal)
  const [claiming, setClaiming] = useState(false)
  const [sectorInfo, setSectorInfo] = useState<{ count: number; limit: number } | null>(null)
  
  // Battle integration states
  const [activeBattle, setActiveBattle] = useState<any | null>(null)
  const [currentTick, setCurrentTick] = useState<number>(0)
  const [showReplay, setShowReplay] = useState(false)
  const [launchingAttack, setLaunchingAttack] = useState(false)

  useEffect(() => {
    fetchSectorInfo()
  }, [])

  useEffect(() => {
    if (!sector) return
    fetchBattleStatus()
    const interval = setInterval(fetchBattleStatus, 3000)
    return () => clearInterval(interval)
  }, [sector])

  const fetchSectorInfo = async () => {
    const res = await apiFetch('/map/my-sectors')
    if (res.ok) {
      const data = await res.json()
      setSectorInfo({ count: data.count, limit: data.limit })
    }
  }

  const fetchBattleStatus = async () => {
    try {
      // Get current tick
      const tickRes = await apiFetch('/gametick/status')
      let currTick = 0
      if (tickRes.ok) {
        const tickData = await tickRes.json()
        currTick = tickData.current || tickData.tick || 0
        setCurrentTick(currTick)
      }

      // Get battle history
      const res = await apiFetch('/combat/battles')
      if (res.ok) {
        const battles = await res.json()
        // Find most recent battle for this sector
        const sectorBattle = battles.find((b: any) => b.sectorId === sector?.id)
        setActiveBattle(sectorBattle || null)
      }
    } catch (err) {
      console.error('Failed to load battle status:', err)
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
      return
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

  const launchAttack = async () => {
    if (!sector) return
    setLaunchingAttack(true)
    try {
      const res = await apiFetch('/combat/attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectorId: sector.id }),
      })

      if (res.ok) {
        alert('Assault fleet launched successfully! Monitor the ETA in this panel.')
        await fetchBattleStatus()
      } else {
        const err = await res.json()
        alert('Failed to launch assault: ' + err.message)
      }
    } catch (err) {
      console.error('Assault launch connection error:', err)
    } finally {
      setLaunchingAttack(false)
    }
  }

  const travelTicks = useMemo(() => {
    if (!sector || !bunkerCoords) return 1
    const targetX = parseInt(sector.x)
    const targetY = parseInt(sector.y)
    const distance = Math.max(Math.abs(targetX - bunkerCoords.x), Math.abs(targetY - bunkerCoords.y))
    return Math.max(1, Math.floor(distance / 2))
  }, [sector, bunkerCoords])

  const sectorSeed = useMemo(() => {
    if (!sector) return 42
    return hashStringToInt(sector.id)
  }, [sector])

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
  const isTown = sector.type === 'TOWN'
  const isExternalBunker = sector.type === 'BUNKER' && !isOwnedByMe
  const canTravel = !isExternalBunker
  const canClaim = !isOwned && (sector.type === 'RESOURCE' || sector.type === 'EMPTY')
  const canInstallOutpost = isOwnedByMe && sector.type === 'RESOURCE' && !sector.hasOutpost
  
  // Combat availability checks
  const canAttack = !isOwnedByMe && !isTown && sector.type !== 'POI' && activeBattle?.status !== 'PENDING'

  return (
    <>
      <GrimdarkCard
        title="SECTOR INTEL"
        status={isOwnedByMe || isTown ? 'online' : isOwned ? 'offline' : 'warning'}
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
                       sector.type === 'TOWN' ? '#00F3FF' :
                       sector.type === 'RESOURCE' ? '#FFA500' : '#555'
              }}>
                {sector.type}
              </div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '0.85rem' }}>STATUS</div>
              <div style={{
                color: isTown ? '#00F3FF' : isOwnedByMe ? '#00F3FF' : isOwned ? '#CC0000' : '#00FF9D',
                textShadow: (isTown || isOwnedByMe) ? '0 0 5px rgba(0, 243, 255, 0.3)' : 'none',
              }}>
                {isTown ? 'NEUTRAL SOCIAL HUB' : isOwnedByMe ? 'YOUR TERRITORY' : isOwned ? 'HOSTILE' : 'UNCLAIMED'}
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

          {/* Incoming Assault indicator */}
          {activeBattle?.status === 'PENDING' && (
            <div style={{
              marginTop: 12,
              padding: '10px 8px',
              background: 'rgba(255,59,48,0.06)',
              border: '1px solid #FF3B30',
              borderRadius: '3px'
            }}>
              <div style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '0.9rem' }}>
                ⚔ ASSAULT FLEET IN ROUTE
              </div>
              <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px' }}>
                ETA: {Math.max(1, activeBattle.resolveTick - currentTick)} Ticks remaining
              </div>
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

          {canTravel && (
            <GrimdarkButton
              onClick={() => {
                closeTerminal()
                if (isTown) {
                  navigate('/town')
                } else {
                  navigate(`/plot/${sector.id}`, { state: { isOwned: isOwnedByMe } })
                }
              }}
              style={{ width: '100%', marginTop: 12 }}
            >
              {isTown ? 'ENTER NEUTRAL TOWN' : 'TRAVEL TO SECTOR'}
            </GrimdarkButton>
          )}

          {canClaim && (
            <GrimdarkButton
              onClick={claimSector}
              disabled={claiming}
              style={{ width: '100%', marginTop: 12 }}
            >
              {claiming ? 'CLAIMING...' : 'CLAIM SECTOR [10 SC]'}
            </GrimdarkButton>
          )}

          {/* Launch Attack Button */}
          {canAttack && (
            <GrimdarkButton
              variant="danger"
              onClick={launchAttack}
              disabled={launchingAttack}
              style={{ width: '100%', marginTop: 8 }}
            >
              {launchingAttack ? 'LAUNCHING MISSION...' : `LAUNCH ASSAULT [ETA: ${travelTicks} T]`}
            </GrimdarkButton>
          )}

          {/* Play Battle Replay Button */}
          {activeBattle?.status === 'RESOLVED' && activeBattle.battleLog && (
            <GrimdarkButton
              variant="warning"
              onClick={() => setShowReplay(true)}
              style={{ width: '100%', marginTop: 8 }}
            >
              ⚔ VIEW 3D BATTLE REPLAY
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

      {/* 3D Replay Overlay Component */}
      {showReplay && activeBattle?.battleLog && (
        <BattleReplay3D
          battleLog={activeBattle.battleLog}
          sectorSeed={sectorSeed}
          onClose={() => setShowReplay(false)}
        />
      )}
    </>
  )
}
