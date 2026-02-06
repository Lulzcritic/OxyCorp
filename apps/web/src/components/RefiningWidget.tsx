import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

// Hardcoded recipes matching backend REFINING_RECIPES
const RECIPES: Recipe[] = [
  {
    id: 'IRON_TO_STEEL',
    name: 'Iron Ore → Steel Plating',
    inputItem: 'IRON_ORE',
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/refine/jobs', {
      headers: { Authorization: `Bearer ${session.access_token}` }
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

  // Timer logic
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setLoading(true)
    const res = await fetch('http://localhost:3000/api/refine/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/refine/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
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
      <div style={{ border: '1px solid #444', padding: 20, background: '#111', marginTop: 20 }}>
        <h3 style={{ color: '#FF6600', marginTop: 0 }}>THE FORGE</h3>
        <div style={{ color: '#666' }}>Heating up...</div>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #444', padding: 20, background: '#111', marginTop: 20 }}>
      <h3 style={{ color: '#FF6600', marginTop: 0 }}>THE FORGE</h3>

      {/* Recipe Selector */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ color: '#888', display: 'block', marginBottom: 5 }}>RECIPE</label>
        <select
          value={selectedRecipe}
          onChange={(e) => setSelectedRecipe(e.target.value)}
          style={{
            background: '#222', color: '#00FF9D', border: '1px solid #444',
            padding: '8px 12px', width: '100%', fontSize: '0.9rem'
          }}
        >
          {RECIPES.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.inputQty} {r.inputItem} → {r.outputQty} {r.outputItem})
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Input */}
      <div style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{ color: '#888' }}>BATCHES</label>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            background: '#222', color: '#00FF9D', border: '1px solid #444',
            padding: '8px', width: 60, textAlign: 'center'
          }}
        />
        <button
          onClick={startRefining}
          style={{
            background: '#FF6600', color: 'black', border: 'none',
            padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', flex: 1
          }}
        >
          IGNITE FORGE
        </button>
      </div>

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <div style={{ borderTop: '1px solid #333', paddingTop: 15 }}>
          <div style={{ color: '#888', marginBottom: 10, fontSize: '0.8rem' }}>ACTIVE BURNS</div>
          {jobs.map(job => {
            const timeLeft = timers[job.id] ?? 0
            const isReady = timeLeft === 0 && job.status === 'ACTIVE'
            const batches = job.data?.batches || 1
            const output = job.data?.outputPerBatch || 1

            return (
              <div
                key={job.id}
                style={{
                  background: '#1A1A1A', padding: 10, marginBottom: 8,
                  border: isReady ? '1px solid #FFD700' : '1px solid #333'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ color: isReady ? '#FFD700' : '#00FF9D' }}>
                    {job.rewardItemId} x{batches * output}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    {isReady ? 'READY' : `${timeLeft}s`}
                  </span>
                </div>

                {/* Progress Bar */}
                {!isReady && (
                  <div style={{ background: '#333', height: 4, borderRadius: 2 }}>
                    <div
                      style={{
                        background: '#FF6600',
                        height: '100%',
                        width: `${Math.max(0, 100 - (timeLeft / job.durationSeconds) * 100)}%`,
                        transition: 'width 1s linear'
                      }}
                    />
                  </div>
                )}

                {isReady && (
                  <button
                    onClick={() => claimJob(job.id)}
                    style={{
                      background: '#FFD700', color: 'black', border: 'none',
                      padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer',
                      width: '100%', marginTop: 8
                    }}
                  >
                    COLLECT
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
