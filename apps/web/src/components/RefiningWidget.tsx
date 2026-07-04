import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import GrimdarkProgressBar from './grimdark/GrimdarkProgressBar'
import '../styles/grimdark-theme.css'

interface RefiningJob {
  id: string
  type: string
  status: string
  startedAt: string
  durationSeconds: number
  rewardItemId: string
  data?: {
    recipeId: string
    batches: number
    outputPerBatch: number
  }
}

interface Recipe {
  id: string
  name: string
  inputItem: string
  inputQty: number
  outputItem: string
  outputQty: number
  durationSeconds: number
}

const RECIPES: Recipe[] = [
  {
    id: 'IRON_TO_STEEL',
    name: 'Iron Ore → Steel Plating',
    inputItem: 'IRON',
    inputQty: 10,
    outputItem: 'STEEL_PLATING',
    outputQty: 1,
    durationSeconds: 60,
  },
  {
    id: 'SLUDGE_TO_FUEL',
    name: 'Sludge → Crude Fuel',
    inputItem: 'SLUDGE',
    inputQty: 10,
    outputItem: 'CRUDE_FUEL',
    outputQty: 1,
    durationSeconds: 60,
  },
]

interface RefiningWidgetProps {
  onJobComplete?: () => void
}

export default function RefiningWidget({ onJobComplete }: RefiningWidgetProps) {
  const [jobs, setJobs] = useState<RefiningJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<string>(RECIPES[0].id)
  const [quantity, setQuantity] = useState<number>(1)
  const [timers, setTimers] = useState<Record<string, number>>({})

  const fetchJobs = useCallback(async () => {
    const res = await apiFetch('/refine/jobs', {
    })

    if (res.ok) {
      const data = await res.json()
      setJobs(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    if (jobs.length === 0) return

    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {}
      jobs.forEach(job => {
        if (job.status !== 'ACTIVE') return
        const startTime = new Date(job.startedAt).getTime()
        const endTime = startTime + job.durationSeconds * 1000
        const diff = Math.ceil((endTime - Date.now()) / 1000)
        newTimers[job.id] = diff > 0 ? diff : 0
      })
      setTimers(newTimers)
    }, 1000)

    return () => clearInterval(interval)
  }, [jobs])

  const startRefining = async () => {
    setLoading(true)
    const res = await apiFetch('/refine/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeId: selectedRecipe, quantity })
    })

    if (res.ok) {
      await fetchJobs()
    } else {
      const err = await res.json()
      alert('Failed to start refining: ' + err.message)
    }
    setLoading(false)
  }

  const claimJob = async (jobId: string) => {
    const res = await apiFetch('/refine/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId })
    })

    if (res.ok) {
      const result = await res.json()
      const xpMsg = result.xpAwarded ? ` | +${result.xpAwarded} XP` : ''
      const levelMsg = result.levelUp ? ` | 🎉 LEVEL UP! Now Lvl ${result.newLevel}` : ''
      alert(`Claimed: +${result.quantity} ${result.item}${xpMsg}${levelMsg}`)
      await fetchJobs()
      if (onJobComplete) onJobComplete()
    } else {
      const err = await res.json()
      alert('Claim failed: ' + err.message)
    }
  }

  if (loading) {
    return (
      <GrimdarkCard title="THE FORGE" status="online" style={{ marginTop: 20 }}>
        <div style={{ color: '#555', fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          &gt; Heating up...
        </div>
      </GrimdarkCard>
    )
  }

  return (
    <GrimdarkCard title="THE FORGE" status="online" style={{ marginTop: 20 }}>
      <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        {/* Recipe Selector */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#555', display: 'block', marginBottom: 4, fontSize: '0.9rem' }}>
            &gt; RECIPE
          </label>
          <select
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
            style={{
              background: '#0E0E0E',
              color: '#00FF9D',
              border: '1px solid #2A2A2A',
              padding: '8px 12px',
              width: '100%',
              fontSize: '1rem',
              fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
            }}
          >
            {RECIPES.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.inputQty} {r.inputItem} → {r.outputQty} {r.outputItem})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity + Start */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#555', fontSize: '0.9rem' }}>BATCHES</label>
          <input
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              background: '#0E0E0E',
              color: '#00FF9D',
              border: '1px solid #2A2A2A',
              padding: '6px',
              width: 60,
              textAlign: 'center',
              fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
              fontSize: '1rem',
            }}
          />
          <GrimdarkButton variant="warning" onClick={startRefining} style={{ flex: 1 }}>
            IGNITE FORGE
          </GrimdarkButton>
        </div>

        {/* Active Jobs */}
        {jobs.length > 0 && (
          <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: 12 }}>
            <div style={{ color: '#555', marginBottom: 8, fontSize: '0.9rem' }}>
              &gt; ACTIVE BURNS
            </div>
            {jobs.map(job => {
              const timeLeft = timers[job.id] ?? 0
              const isReady = timeLeft === 0 && job.status === 'ACTIVE'
              const batches = job.data?.batches || 1
              const output = job.data?.outputPerBatch || 1
              const progressPct = job.durationSeconds > 0
                ? Math.max(0, 100 - (timeLeft / job.durationSeconds) * 100)
                : 100

              return (
                <div
                  key={job.id}
                  style={{
                    background: '#0E0E0E',
                    padding: 10,
                    marginBottom: 6,
                    border: isReady ? '1px solid #FFA500' : '1px solid #2A2A2A'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{
                      color: isReady ? '#FFA500' : '#00FF9D',
                      textShadow: isReady ? '0 0 5px rgba(255, 165, 0, 0.3)' : 'none',
                    }}>
                      {job.rewardItemId} x{batches * output}
                    </span>
                    <span style={{ color: '#555', fontSize: '0.9rem' }}>
                      {isReady ? 'READY' : `${timeLeft}s`}
                    </span>
                  </div>

                  {!isReady && (
                    <GrimdarkProgressBar
                      value={progressPct}
                      variant="warning"
                      width={15}
                    />
                  )}

                  {isReady && (
                    <GrimdarkButton
                      variant="warning"
                      onClick={() => claimJob(job.id)}
                      style={{ width: '100%', marginTop: 6 }}
                    >
                      COLLECT
                    </GrimdarkButton>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </GrimdarkCard>
  )
}
