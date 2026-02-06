import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

// Facility display configuration
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

// Upgrade costs (mirrored from backend for display)
const UPGRADE_COSTS: Record<string, FacilityCost> = {
  REFINING_VAT_2: { credits: 500, items: [{ item: 'STEEL_PLATING', quantity: 5 }] },
  REFINING_VAT_3: { credits: 1500, items: [{ item: 'STEEL_PLATING', quantity: 15 }] },
  LOGISTICS_HUB_2: { credits: 750, items: [{ item: 'STEEL_PLATING', quantity: 3 }] },
  LOGISTICS_HUB_3: { credits: 2000, items: [{ item: 'STEEL_PLATING', quantity: 10 }] },
  COMMAND_ARRAY_2: { credits: 1000, items: [{ item: 'STEEL_PLATING', quantity: 5 }] },
  COMMAND_ARRAY_3: { credits: 3000, items: [{ item: 'STEEL_PLATING', quantity: 20 }] },
}

const MAX_LEVEL = 3

export default function FacilitiesWidget({ onUpgrade, inventory }: FacilitiesWidgetProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)

  const fetchFacilities = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/bunker/facilities', {
      headers: { Authorization: `Bearer ${session.access_token}` }
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
    const slot = inventory.find(i => i.item === item)
    return slot ? parseInt(slot.quantity) : 0
  }

  const canAffordUpgrade = (facility: Facility): boolean => {
    const cost = getUpgradeCost(facility.type, facility.level)
    if (!cost) return false
    
    // Check materials
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setUpgrading(type)
    const res = await fetch('http://localhost:3000/api/bunker/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
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
      <div style={{ border: '1px solid #FF9500', padding: 20, background: '#111', marginTop: 20 }}>
        <h3 style={{ color: '#FF9500', marginTop: 0 }}>FACILITIES</h3>
        <div style={{ color: '#666' }}>Scanning infrastructure...</div>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #FF9500', padding: 20, background: '#111', marginTop: 20 }}>
      <h3 style={{ color: '#FF9500', marginTop: 0, marginBottom: 15 }}>FACILITIES</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
        {facilities.map(facility => {
          const config = FACILITY_CONFIG[facility.type]
          const cost = getUpgradeCost(facility.type, facility.level)
          const isMaxLevel = facility.level >= MAX_LEVEL

          return (
            <div
              key={facility.type}
              onClick={() => setSelectedFacility(facility)}
              style={{
                background: '#0A0A0A',
                border: `1px solid ${config.color}40`,
                padding: 15,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = config.color
                e.currentTarget.style.boxShadow = `0 0 10px ${config.color}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${config.color}40`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                <span style={{
                  background: config.color,
                  color: 'black',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  LVL {facility.level}
                </span>
              </div>

              {/* Name */}
              <div style={{ color: config.color, fontWeight: 'bold', marginBottom: 5 }}>
                {config.name}
              </div>

              {/* Level Progress Bar */}
              <div style={{ background: '#222', height: 4, marginBottom: 10 }}>
                <div style={{
                  background: config.color,
                  height: '100%',
                  width: `${(facility.level / MAX_LEVEL) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* Status */}
              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                {isMaxLevel ? (
                  <span style={{ color: '#00FF9D' }}>MAX LEVEL</span>
                ) : cost ? (
                  <span>Upgrade: {cost.credits} CR</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Default facilities if none exist */}
      {facilities.length === 0 && (
        <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
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
          <div
            style={{
              background: '#111', border: `1px solid ${FACILITY_CONFIG[selectedFacility.type].color}`,
              padding: 25, maxWidth: 400, width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
              <span style={{ fontSize: '2rem' }}>{FACILITY_CONFIG[selectedFacility.type].icon}</span>
              <div>
                <h3 style={{ color: FACILITY_CONFIG[selectedFacility.type].color, margin: 0 }}>
                  {FACILITY_CONFIG[selectedFacility.type].name}
                </h3>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>
                  Current Level: {selectedFacility.level}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 20 }}>
              {FACILITY_CONFIG[selectedFacility.type].description}
            </p>

            {/* Upgrade Cost */}
            {selectedFacility.level < MAX_LEVEL ? (
              <>
                <div style={{ 
                  background: '#0A0A0A', 
                  padding: 15, 
                  marginBottom: 15,
                  border: '1px solid #333' 
                }}>
                  <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: 10 }}>
                    UPGRADE TO LEVEL {selectedFacility.level + 1}
                  </div>
                  {(() => {
                    const cost = getUpgradeCost(selectedFacility.type, selectedFacility.level)
                    if (!cost) return null
                    return (
                      <>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: 8,
                          color: '#FFD700'
                        }}>
                          <span>Credits</span>
                          <span>{cost.credits}</span>
                        </div>
                        {cost.items?.map(item => (
                          <div 
                            key={item.item}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              color: getInventoryQuantity(item.item) >= item.quantity ? '#00FF9D' : '#FF0055'
                            }}
                          >
                            <span>{item.item.replace(/_/g, ' ')}</span>
                            <span>
                              {getInventoryQuantity(item.item)} / {item.quantity}
                            </span>
                          </div>
                        ))}
                      </>
                    )
                  })()}
                </div>

                <button
                  onClick={() => upgradeFacility(selectedFacility.type)}
                  disabled={upgrading !== null || !canAffordUpgrade(selectedFacility)}
                  style={{
                    width: '100%',
                    background: canAffordUpgrade(selectedFacility) 
                      ? FACILITY_CONFIG[selectedFacility.type].color 
                      : '#333',
                    color: canAffordUpgrade(selectedFacility) ? 'black' : '#666',
                    border: 'none',
                    padding: '12px',
                    fontWeight: 'bold',
                    cursor: canAffordUpgrade(selectedFacility) ? 'pointer' : 'not-allowed',
                    marginBottom: 10
                  }}
                >
                  {upgrading === selectedFacility.type 
                    ? 'UPGRADING...' 
                    : canAffordUpgrade(selectedFacility) 
                      ? '⬆ UPGRADE FACILITY' 
                      : 'INSUFFICIENT RESOURCES'}
                </button>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#00FF9D', 
                padding: 20,
                background: '#00FF9D10',
                marginBottom: 10
              }}>
                ✓ MAXIMUM LEVEL REACHED
              </div>
            )}

            <button
              onClick={() => setSelectedFacility(null)}
              style={{
                width: '100%', background: 'transparent', color: '#666',
                border: '1px solid #333', padding: '10px', cursor: 'pointer'
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
