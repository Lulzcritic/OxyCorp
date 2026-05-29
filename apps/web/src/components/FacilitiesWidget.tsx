import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import GrimdarkProgressBar from './grimdark/GrimdarkProgressBar'
import '../styles/grimdark-theme.css'

interface Facility {
  type: 'REFINING_VAT' | 'LOGISTICS_HUB' | 'COMMAND_ARRAY'
  level: number
}

interface FacilityCost {
  credits: number
  items?: { item: string; quantity: number }[]
}

interface FacilitiesWidgetProps {
  onUpgrade?: () => void
  inventory?: { item: string; quantity: string }[]
}

const FACILITY_CONFIG: Record<string, { name: string; icon: string; color: string; description: string }> = {
  REFINING_VAT: {
    name: 'Refining Vat',
    icon: '🔥',
    color: '#FF9500',
    description: 'Increases refining speed and batch capacity'
  },
  LOGISTICS_HUB: {
    name: 'Logistics Hub',
    icon: '📦',
    color: '#00B4D8',
    description: 'Reduces market fees and shipping times'
  },
  COMMAND_ARRAY: {
    name: 'Command Array',
    icon: '📡',
    color: '#9933FF',
    description: 'Enhances drone coordination and combat efficiency'
  }
}

const UPGRADE_COSTS: Record<string, FacilityCost> = {
  REFINING_VAT_2: { credits: 500, items: [{ item: 'steel_plating', quantity: 5 }] },
  REFINING_VAT_3: { credits: 1500, items: [{ item: 'steel_plating', quantity: 15 }] },
  LOGISTICS_HUB_2: { credits: 750, items: [{ item: 'steel_plating', quantity: 3 }] },
  LOGISTICS_HUB_3: { credits: 2000, items: [{ item: 'steel_plating', quantity: 10 }] },
  COMMAND_ARRAY_2: { credits: 1000, items: [{ item: 'steel_plating', quantity: 5 }] },
  COMMAND_ARRAY_3: { credits: 3000, items: [{ item: 'steel_plating', quantity: 20 }] },
}

const MAX_LEVEL = 3

export default function FacilitiesWidget({ onUpgrade, inventory }: FacilitiesWidgetProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)

  const fetchFacilities = async () => {
    if (!session) return

    const res = await apiFetch('/bunker/facilities', {
    })

    if (res.ok) {
      const data = await res.json()
      setFacilities(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFacilities()
  }, [])

  const getUpgradeCost = (type: string, currentLevel: number): FacilityCost | null => {
    const targetLevel = currentLevel + 1
    if (targetLevel > MAX_LEVEL) return null
    return UPGRADE_COSTS[`${type}_${targetLevel}`] || null
  }

  const getInventoryQuantity = (item: string): number => {
    if (!inventory) return 0
    const slot = inventory.find(i => i.item.toLowerCase() === item.toLowerCase())
    return slot ? parseInt(slot.quantity) : 0
  }

  const canAffordUpgrade = (facility: Facility): boolean => {
    const cost = getUpgradeCost(facility.type, facility.level)
    if (!cost) return false
    if (cost.items) {
      for (const req of cost.items) {
        if (getInventoryQuantity(req.item) < req.quantity) {
          return false
        }
      }
    }
    return true
  }

  const upgradeFacility = async (type: string) => {
    if (!session) return

    setUpgrading(type)
    const res = await apiFetch('/bunker/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type })
    })

    if (res.ok) {
      await fetchFacilities()
      setSelectedFacility(null)
      if (onUpgrade) onUpgrade()
    } else {
      const err = await res.json()
      alert('Upgrade failed: ' + err.message)
    }
    setUpgrading(null)
  }

  if (loading) {
    return (
      <GrimdarkCard title="INFRASTRUCTURE" status="online" style={{ marginTop: 20 }}>
        <div style={{ color: '#555', fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          &gt; Scanning infrastructure...
        </div>
      </GrimdarkCard>
    )
  }

  return (
    <GrimdarkCard title="INFRASTRUCTURE" status="online" style={{ marginTop: 20 }}>
      <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {facilities.map(facility => {
            const config = FACILITY_CONFIG[facility.type]
            const cost = getUpgradeCost(facility.type, facility.level)
            const isMaxLevel = facility.level >= MAX_LEVEL

            return (
              <div
                key={facility.type}
                onClick={() => setSelectedFacility(facility)}
                style={{
                  background: '#0E0E0E',
                  border: `1px solid ${config.color}30`,
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = config.color
                  e.currentTarget.style.boxShadow = `0 0 10px ${config.color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${config.color}30`
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '1.3rem' }}>{config.icon}</span>
                  <span style={{
                    color: config.color,
                    fontSize: '0.95rem',
                    textShadow: `0 0 5px ${config.color}40`,
                  }}>
                    [LVL: {facility.level}]
                  </span>
                </div>

                <div style={{
                  color: config.color,
                  marginBottom: 8,
                  fontSize: '1rem',
                  letterSpacing: '0.1em',
                }}>
                  {config.name}
                </div>

                <GrimdarkProgressBar
                  value={facility.level}
                  max={MAX_LEVEL}
                  variant={isMaxLevel ? 'primary' : 'warning'}
                  width={10}
                />

                <div style={{ fontSize: '0.9rem', color: '#555', marginTop: 6 }}>
                  {isMaxLevel ? (
                    <span style={{ color: '#00FF9D' }}>MAX LEVEL</span>
                  ) : cost ? (
                    <span>[COST: {cost.credits} CR]</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {facilities.length === 0 && (
          <div style={{ color: '#555', textAlign: 'center', padding: 20 }}>
            No facilities initialized. Contact support.
          </div>
        )}

        {/* Upgrade Modal */}
        {selectedFacility && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setSelectedFacility(null)}
          >
            <GrimdarkCard
              title={FACILITY_CONFIG[selectedFacility.type].name}
              status={selectedFacility.level >= MAX_LEVEL ? 'online' : 'warning'}
              style={{ maxWidth: 400, width: '90%' }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: '1.8rem' }}>{FACILITY_CONFIG[selectedFacility.type].icon}</span>
                  <div>
                    <div style={{ color: '#888', fontSize: '0.95rem' }}>
                      [LVL: {selectedFacility.level}]
                    </div>
                  </div>
                </div>

                <p style={{ color: '#888', fontSize: '1rem', marginBottom: 15 }}>
                  {FACILITY_CONFIG[selectedFacility.type].description}
                </p>

                {selectedFacility.level < MAX_LEVEL ? (
                  <>
                    <div style={{
                      background: '#0A0A0A',
                      padding: 12,
                      marginBottom: 12,
                      border: '1px solid #2A2A2A'
                    }}>
                      <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8 }}>
                        &gt; UPGRADE TO LEVEL {selectedFacility.level + 1}
                      </div>
                      {(() => {
                        const cost = getUpgradeCost(selectedFacility.type, selectedFacility.level)
                        if (!cost) return null
                        return (
                          <>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: 6,
                              color: '#FFA500'
                            }}>
                              <span>Credits</span>
                              <span>[{cost.credits}]</span>
                            </div>
                            {cost.items?.map(item => (
                              <div
                                key={item.item}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  color: getInventoryQuantity(item.item) >= item.quantity ? '#00FF9D' : '#CC0000'
                                }}
                              >
                                <span>{item.item.replace(/_/g, ' ')}</span>
                                <span>
                                  [{getInventoryQuantity(item.item)} / {item.quantity}]
                                </span>
                              </div>
                            ))}
                          </>
                        )
                      })()}
                    </div>

                    <GrimdarkButton
                      onClick={() => upgradeFacility(selectedFacility.type)}
                      disabled={upgrading !== null || !canAffordUpgrade(selectedFacility)}
                      variant={canAffordUpgrade(selectedFacility) ? 'primary' : 'danger'}
                      style={{ width: '100%', marginBottom: 8 }}
                    >
                      {upgrading === selectedFacility.type
                        ? 'UPGRADING...'
                        : canAffordUpgrade(selectedFacility)
                          ? 'UPGRADE FACILITY'
                          : 'INSUFFICIENT RESOURCES'}
                    </GrimdarkButton>
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#00FF9D',
                    padding: 15,
                    background: 'rgba(0, 255, 157, 0.05)',
                    marginBottom: 8,
                    textShadow: '0 0 5px rgba(0, 255, 157, 0.4)',
                  }}>
                    ✓ MAXIMUM LEVEL REACHED
                  </div>
                )}

                <GrimdarkButton
                  variant="danger"
                  onClick={() => setSelectedFacility(null)}
                  style={{ width: '100%' }}
                >
                  CLOSE
                </GrimdarkButton>
              </div>
            </GrimdarkCard>
          </div>
        )}
      </div>
    </GrimdarkCard>
  )
}
