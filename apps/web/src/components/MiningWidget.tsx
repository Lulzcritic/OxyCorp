import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import GrimdarkProgressBar from './grimdark/GrimdarkProgressBar'
import '../styles/grimdark-theme.css'

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
      const res = await apiFetch('/jobs/active')

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
    setLoading(true)
    const res = await apiFetch('/jobs/claim', {
      method: 'POST',
    })

    if (res.ok) {
      const data = await res.json()
      setJob(null)
      const xpMsg = data.xpAwarded ? ` | +${data.xpAwarded} XP` : ''
      const levelMsg = data.levelUp ? ` | 🎉 LEVEL UP! Now Lvl ${data.newLevel}` : ''
      alert(`Success: +10 Iron Ore Claimed!${xpMsg}${levelMsg}`)
      window.dispatchEvent(new CustomEvent('inventory-updated'));
      if (onJobComplete) onJobComplete();
    } else {
      const err = await res.json()
      alert('Failed to claim job: ' + err.message)
    }
    setLoading(false)
  }

  const startMining = async (resourceId: string) => {
    if (!selectedSector) return;

    setLoading(true)
    const res = await apiFetch('/jobs/start', {
      method: 'POST',
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

  if (loading) {
    return (
      <GrimdarkCard title="RESOURCE OPS" status="online" style={{ marginTop: 20 }}>
        <div style={{ color: '#555', fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          &gt; Scanning deposits...
        </div>
      </GrimdarkCard>
    )
  }

  const renderContent = () => {
    if (job) {
      const totalDuration = job.durationSeconds
      const elapsed = totalDuration - timeLeft
      const progressPct = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100

      return timeLeft > 0 ? (
        <div>
          <div style={{
            color: '#00CC66',
            fontSize: '1.1rem',
            marginBottom: 12,
            textShadow: '0 0 5px rgba(0, 255, 157, 0.3)',
          }}>
            &gt; MINERS DEPLOYED
          </div>
          <div style={{
            fontSize: '2rem',
            color: '#00FF9D',
            fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
            textShadow: '0 0 10px rgba(0, 255, 157, 0.5)',
            marginBottom: 12,
          }}>
            T-MINUS {timeLeft}s
          </div>
          <GrimdarkProgressBar value={progressPct} label="EXTRACTION PROGRESS" />
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: 8 }}>
            Extracting: {job.rewardItemId}
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            color: '#FFA500',
            fontSize: '1.2rem',
            marginBottom: 12,
            textShadow: '0 0 5px rgba(255, 165, 0, 0.4)',
          }}>
            &gt; EXTRACTION COMPLETE
          </div>
          <GrimdarkButton variant="warning" onClick={claimJob} style={{ width: '100%' }}>
            COLLECT RESOURCES
          </GrimdarkButton>
        </div>
      )
    }

    if (!selectedSector) {
      return (
        <div style={{ color: '#555', textAlign: 'center', padding: 20 }}>
          SELECT A SECTOR TO INITIATE MINING OPS
        </div>
      )
    }

    if (selectedSector.type !== 'RESOURCE') {
      return (
        <div>
          <div style={{ color: '#888', marginBottom: 8 }}>
            SECTOR {selectedSector.id.substring(0, 4)}
          </div>
          <div style={{ color: '#555' }}>TYPE: {selectedSector.type}</div>
          <div style={{ color: '#444', fontSize: '0.9rem' }}>No harvestable resources.</div>
        </div>
      )
    }

    if (selectedSector.ownerId !== currentUserId) {
      return (
        <div>
          <div style={{
            color: '#CC0000',
            marginBottom: 8,
            textShadow: '0 0 5px rgba(204, 0, 0, 0.3)',
          }}>
            &gt; SECTOR LOCKED
          </div>
          <div style={{ color: '#888' }}>Owner ID Mismatch</div>
          <div style={{ color: '#555', fontSize: '0.85rem' }}>You do not have mining rights.</div>
          <div style={{ color: '#444', fontSize: '0.8rem', marginTop: 8 }}>
            Sector Owner: {selectedSector.ownerId?.substring(0, 8)}...
            <br/>
            Your ID: {currentUserId?.substring(0, 8)}...
          </div>
        </div>
      )
    }

    const res = selectedSector.resources;
    const resourceType = res ? res.type : 'UNKNOWN';
    const itemMap: Record<string, string> = {
      'IRON': 'IRON_ORE',
      'COPPER': 'COPPER_ORE',
      'SILICA': 'SILICA'
    };
    const rewardId = itemMap[resourceType] || 'IRON_ORE';

    return (
      <div>
        <div style={{
          color: '#00FF9D',
          marginBottom: 8,
          textShadow: '0 0 5px rgba(0, 255, 157, 0.3)',
        }}>
          &gt; DEPOSIT: {resourceType}
        </div>
        <div style={{ marginBottom: 15, fontSize: '0.9rem', color: '#888' }}>
          Yield: {res ? (res.richness * 100).toFixed(0) : 100}% | Est. Qty: {res ? res.quantity : '???'}
        </div>
        <GrimdarkButton onClick={() => startMining(rewardId)} style={{ width: '100%' }}>
          INITIATE EXTRACTION
        </GrimdarkButton>
      </div>
    )
  }

  return (
    <GrimdarkCard title="RESOURCE OPS" status="online" style={{ marginTop: 20 }}>
      {renderContent()}
    </GrimdarkCard>
  )
}
