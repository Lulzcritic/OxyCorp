import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MiningWidget from './MiningWidget'
import RefiningWidget from './RefiningWidget'
import SkillsWidget from './SkillsWidget'
import DirectivesWidget from './DirectivesWidget'
import FacilitiesWidget from './FacilitiesWidget'
import SellModal from './SellModal'
import MarketWidget from './MarketWidget'
import SectorDetailPanel from './SectorDetailPanel'

import MapGrid from './MapGrid'

interface UserProfile {
  id: string
  username: string
  credits: string
  bunker_level: number
  inventory: { item: string; quantity: string }[]
  sectors: { x: string; y: string; type: string }[]
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ id: string; qty: string } | null>(null)
  const [selectedSector, setSelectedSector] = useState<{ 
    id: string;
    x: string;
    y: string;
    type: string; 
    ownerId?: string; 
    resources?: { type: string; quantity: number; richness: number };
  } | null>(null)
  const [questRefreshTrigger, setQuestRefreshTrigger] = useState(0)

  useEffect(() => {
    async function initProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const token = session.access_token

      // 1. Onboard (Idempotent)
      await fetch('http://localhost:3000/api/user/onboard', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      // 2. Fetch Profile
      const res = await fetch('http://localhost:3000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
      setLoading(false)
    }

    initProfile()
  }, [])

  const handleRefresh = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('http://localhost:3000/api/user/profile', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
    }
    // Trigger quest refresh (for mining/refining progress updates)
    setQuestRefreshTrigger(prev => prev + 1)
  }

  const openSellModal = (item: string, qty: string) => {
    setSelectedItem({ id: item, qty })
    setIsSellModalOpen(true)
  }

  if (loading) return <div style={{ background: '#050505', color: '#00FF9D', height: '100vh', padding: 20 }}>Initializing System...</div>

  return (
    <div style={{ padding: 20, background: '#050505', color: '#00FF9D', minHeight: '100vh', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: 20 }}>
        <h1>COMMAND CENTER</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => window.location.href = '/war-room'}
            style={{ background: '#00FF9D', color: 'black', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            WAR ROOM
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ background: '#FF0055', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {profile && (
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div style={{ border: '1px solid #333', padding: 20, background: '#111' }}>
            <h3 style={{ color: '#888' }}>OPERATOR</h3>
            <div style={{ fontSize: '1.5rem' }}>{profile.username}</div>
          </div>
          <div style={{ border: '1px solid #333', padding: 20, background: '#111' }}>
            <h3 style={{ color: '#888' }}>CREDITS</h3>
            <div style={{ fontSize: '1.5rem', color: '#FFD700' }}>{profile.credits}</div>
          </div>
          <div style={{ border: '1px solid #333', padding: 20, background: '#111' }}>
            <h3 style={{ color: '#888' }}>BUNKER LEVEL</h3>
            <div style={{ fontSize: '1.5rem' }}>LVL {profile.bunker_level}</div>
          </div>
        </div>
      )}
      
      {/* Pass selectedSector to MiningWidget (requires update to MiningWidget props) */}
      {profile && <MiningWidget selectedSector={selectedSector} currentUserId={profile.id} onJobComplete={handleRefresh} />}
      {profile && <RefiningWidget onJobComplete={handleRefresh} />}
      {profile && <SkillsWidget />}
      {profile && <FacilitiesWidget onUpgrade={handleRefresh} inventory={profile.inventory} />}
      {profile && <DirectivesWidget onQuestClaimed={handleRefresh} refreshTrigger={questRefreshTrigger} />}  
      {/* Note: profile.username is not IDs, but we need ID for owner check? actually ownerId in sector is likely UUID, username is string. 
          We need user ID. Profile endpoint usually returns ID? 
          Wait, `UserProfile` interface only has username.
          I need to check `UserProfile` interface and `getProfile`.
          If I need user ID for check, I might need it. 
          Actually MiningWidget can check `currentUserId` if valid. 
          Or simpler: `MiningWidget` will try to start job, backend verifies.
      */}
      {profile && <MarketWidget />}

      {/* Map Grid - Uses first found bunker as center, or 0,0 default */}
      {profile && (
        <MapGrid 
          initialCenterX={profile.sectors?.find(s => s.type === 'BUNKER')?.x || '0'} 
          initialCenterY={profile.sectors?.find(s => s.type === 'BUNKER')?.y || '0'} 
          onSelectSector={(s) => setSelectedSector(s)}
          selectedSectorId={selectedSector?.id}
          currentUserId={profile.id}
        />
      )}

      {/* Sector Detail Panel with Claim functionality */}
      {profile && (
        <SectorDetailPanel 
          sector={selectedSector}
          currentUserId={profile.id}
          onClaimed={handleRefresh}
        />
      )}


      {profile && profile.inventory && profile.inventory.length > 0 ? (
        <div style={{ marginTop: 40, border: '1px solid #333', padding: 20, background: '#111' }}>
          <h3 style={{ color: '#888' }}>INVENTORY</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {profile.inventory.map((slot, idx) => (
              <div key={idx} style={{ background: '#222', padding: 15, border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#00FF9D', fontWeight: 'bold' }}>{slot.item}</div>
                  <div style={{ color: '#888' }}>x{slot.quantity}</div>
                </div>
                <button 
                  onClick={() => openSellModal(slot.item, slot.quantity)}
                  style={{ background: '#FFD700', color: 'black', border: 'none', padding: '5px 10px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  SELL
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 40, padding: 20, color: '#666', border: '1px dashed #333' }}>
             NO RESOURCES IN STORAGE
        </div>
      )}

      {isSellModalOpen && selectedItem && (
        <SellModal 
          itemId={selectedItem.id} 
          currentQuantity={selectedItem.qty} 
          onClose={() => setIsSellModalOpen(false)} 
          onSuccess={handleRefresh} 
        />
      )}
    </div>
  )
}
