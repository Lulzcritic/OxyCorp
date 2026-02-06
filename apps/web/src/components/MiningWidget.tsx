import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Job {
  id: string
  type: string
  status: string
  startedAt: string
  durationSeconds: number
  rewardItemId: string
}

interface MiningWidgetProps {
  selectedSector: { 
    id: string; 
    type: string; 
    ownerId?: string;
    resources?: { type: string; quantity: number; richness: number };
  } | null;
  currentUserId: string;
  onJobComplete?: () => void;
}

export default function MiningWidget({ selectedSector, currentUserId, onJobComplete }: MiningWidgetProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  // Fetch Active Job
  useEffect(() => {
    async function fetchJob() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('http://localhost:3000/api/jobs/active', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (res.ok) {
        const text = await res.text()
        const data = text ? JSON.parse(text) : null
        if (data) {
          setJob(data)
        }
      }
      setLoading(false)
    }
    fetchJob()
  }, [])

  // Timer Logic
  useEffect(() => {
    if (!job) return

    const interval = setInterval(() => {
      const startTime = new Date(job.startedAt).getTime()
      const endTime = startTime + job.durationSeconds * 1000
      const now = Date.now()
      const diff = Math.ceil((endTime - now) / 1000)

      if (diff <= 0) {
        setTimeLeft(0)
      } else {
        setTimeLeft(diff)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [job])



  const claimJob = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setLoading(true)
    const res = await fetch('http://localhost:3000/api/jobs/claim', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (res.ok) {
      const data = await res.json()
      setJob(null) // Reset job to allow starting new one
      const xpMsg = data.xpAwarded ? ` | +${data.xpAwarded} XP` : ''
      const levelMsg = data.levelUp ? ` | 🎉 LEVEL UP! Now Lvl ${data.newLevel}` : ''
      alert(`Success: +10 Iron Ore Claimed!${xpMsg}${levelMsg}`)
      if (onJobComplete) onJobComplete();
    } else {
      const err = await res.json()
      alert('Failed to claim job: ' + err.message)
    }
    setLoading(false)
  }

  const startMining = async (resourceId: string) => {
    if (!selectedSector) return;

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setLoading(true)
    const res = await fetch('http://localhost:3000/api/jobs/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ type: 'MINING', sectorId: selectedSector.id, resource: resourceId })
    })

    if (res.ok) {
      const newJob = await res.json()
      setJob(newJob)
    } else {
      const err = await res.json()
      alert('Failed to start mining: ' + err.message)
    }
    setLoading(false)
  }

  if (loading) return <div style={{ border: '1px solid #333', padding: 20 }}>Scanning...</div>

  // Render Logic
  // 1. If Active Job -> Show Timer (Sector selection irrelevant for timer view, but maybe show job location?)
  // 2. If No Active Job -> 
  //    a. If Sector Selected -> Show "Start Mining" (if owned + resource) OR "Empty Sector"
  //    b. If No Sector Selected -> Show "Select a Sector on Map"

  const renderContent = () => {
    if (job) {
       return (
        timeLeft > 0 ? (
          <div>
            <div style={{ fontSize: '1.2rem', marginBottom: 10 }}>Miners Deployed</div>
            <div style={{ fontSize: '2rem', color: '#00FF9D' }}>T-MINUS {timeLeft}s</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 5 }}>Extracting: {job.rewardItemId}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '1.2rem', marginBottom: 10, color: '#FFD700' }}>Extraction Complete</div>
            <button 
             onClick={claimJob}
             style={{ background: '#FFD700', color: 'black', border: 'none', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
           >
             COLLECT RESOURCES
           </button>
          </div>
        )
       )
    }

    if (!selectedSector) {
      return <div style={{ color: '#666' }}>SELECT A SECTOR TO INITIATE MINING OPS</div>
    }

    if (selectedSector.type !== 'RESOURCE') {
      return (
        <div>
           <div style={{ color: '#888', marginBottom: 10 }}>SECTOR {selectedSector.id.substring(0,4)}</div>
           <div style={{ color: '#555' }}>SECTOR TYPE: {selectedSector.type}</div>
           <div style={{ color: '#555', fontSize: '0.8rem' }}>No harvestable resources.</div>
        </div>
      )
    }

    // It is a RESOURCE sector. Check ownership.
    if (selectedSector.ownerId !== currentUserId) {
       return (
        <div>
           <div style={{ color: '#FF0055', marginBottom: 10 }}>SECTOR LOCKED</div>
           <div style={{ color: '#888' }}>Owner ID Mismatch</div>
           <div style={{ color: '#666', fontSize: '0.8rem' }}>You do not have mining rights.</div>
           <div style={{ color: '#444', fontSize: '0.7rem', marginTop: 10 }}>
             Sector Owner: {selectedSector.ownerId?.substring(0, 8)}...
             <br/>
             Your ID: {currentUserId?.substring(0, 8)}...
           </div>
        </div>
       )
    }

    // Owned + Resource + No Active Job
    // Safe access to resources
    const res = selectedSector.resources;
    const resourceType = res ? res.type : 'UNKNOWN';
    // We Map 'IRON' -> 'IRON_ORE' manually or just pass it if backend handles it.
    // Backend `startJob` uses `rewardItemId`. Let's assume ITEM IDs are `IRON_ORE`, `COPPER_ORE`, `SILICA`.
    // My generator produces `IRON`, `COPPER`. I should align them.
    // For now I will assume suffix `_ORE` except for silica which might be `SILICA`.

    const itemMap: Record<string, string> = {
      'IRON': 'IRON_ORE',
      'COPPER': 'COPPER_ORE',
      'SILICA': 'SILICA' 
    };
    const rewardId = itemMap[resourceType] || 'IRON_ORE';

    return (
        <div>
           <div style={{ marginBottom: 5, color: '#00FF9D' }}>DEPOSIT: {resourceType}</div>
           <div style={{ marginBottom: 15, fontSize: '0.8rem', color: '#888' }}>
             Yield: {res ? (res.richness * 100).toFixed(0) : 100}% | Est. Qty: {res ? res.quantity : '???'}
           </div>
           <button 
             onClick={() => startMining(rewardId)}
             style={{ 
               background: '#00FF9D', color: 'black', border: 'none', 
               padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', width: '100%' 
             }}
           >
             INITIATE EXTRACTION
           </button>
        </div>
    )
  }



  // Render Logic

  return (
    <div style={{ border: '1px solid #333', padding: 20, background: '#111', marginTop: 20, minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h3 style={{ color: '#888', marginTop: 0 }}>RESOURCE OPS</h3>
      {renderContent()}
    </div>
  )
}
