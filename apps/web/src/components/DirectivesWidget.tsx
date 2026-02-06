import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Quest {
  id: string
  type: string
  status: string
  progress: number
  target: { item?: string; count: number }
  reward: { credits?: number; xp?: number }
  expiresAt?: string
}

interface DirectivesWidgetProps {
  onQuestClaimed?: () => void
  refreshTrigger?: number
}

export default function DirectivesWidget({ onQuestClaimed, refreshTrigger }: DirectivesWidgetProps) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/directives', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (res.ok) {
      const data = await res.json()
      setQuests(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  // Refetch quests when refreshTrigger changes (e.g., after mining claim)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchQuests()
    }
  }, [refreshTrigger, fetchQuests])

  const generateDaily = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setLoading(true)
    const res = await fetch('http://localhost:3000/api/directives/daily', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (res.ok) {
      await fetchQuests()
    } else {
      const err = await res.json()
      alert('Failed to generate: ' + err.message)
    }
    setLoading(false)
  }

  const claimQuest = async (questId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setClaiming(questId)
    const res = await fetch('http://localhost:3000/api/directives/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ questId })
    })

    if (res.ok) {
      const result = await res.json()
      alert(`Mission Complete! +${result.creditsAwarded} Credits, +${result.xpAwarded} XP`)
      await fetchQuests()
      if (onQuestClaimed) onQuestClaimed()
    } else {
      const err = await res.json()
      alert('Claim failed: ' + err.message)
    }
    setClaiming(null)
  }

  if (loading) {
    return (
      <div style={{ border: '1px solid #9933FF', padding: 20, background: '#111', marginTop: 20 }}>
        <h3 style={{ color: '#9933FF', marginTop: 0 }}>DIRECTIVES</h3>
        <div style={{ color: '#666' }}>Receiving transmission...</div>
      </div>
    )
  }

  const activeQuests = quests.filter(q => q.status === 'ACTIVE')

  return (
    <div style={{ border: '1px solid #9933FF', padding: 20, background: '#111', marginTop: 20 }}>
      <h3 style={{ color: '#9933FF', marginTop: 0, marginBottom: 15 }}>DIRECTIVES</h3>

      {activeQuests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ color: '#666', marginBottom: 15 }}>NO ACTIVE MISSIONS</div>
          <button
            onClick={generateDaily}
            style={{
              background: '#9933FF', color: 'white', border: 'none',
              padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            GENERATE DAILY DIRECTIVES
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeQuests.slice(0, 3).map(quest => {
            const targetCount = quest.target?.count || 1
            const progressPct = Math.min(100, (quest.progress / targetCount) * 100)
            const isComplete = quest.progress >= targetCount
            const isClaiming = claiming === quest.id

            return (
              <div
                key={quest.id}
                style={{
                  background: isComplete ? '#9933FF20' : '#1A1A1A',
                  border: isComplete ? '1px solid #9933FF' : '1px solid #333',
                  padding: 12
                }}
              >
                {/* Quest Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#9933FF', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {quest.type}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    {quest.target?.item || 'OBJECTIVE'}
                  </span>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: isComplete ? '#00FF9D' : '#888', fontSize: '0.85rem' }}>
                      {quest.progress} / {targetCount}
                    </span>
                    <span style={{ color: '#555', fontSize: '0.75rem' }}>
                      {progressPct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ background: '#333', height: 6, borderRadius: 3 }}>
                    <div
                      style={{
                        background: isComplete ? '#00FF9D' : '#9933FF',
                        height: '100%',
                        width: `${progressPct}%`,
                        borderRadius: 3,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 8 }}>
                  Reward: {quest.reward?.credits ? `${quest.reward.credits} Credits` : ''}
                  {quest.reward?.xp ? ` | ${quest.reward.xp} XP` : ''}
                </div>

                {/* Claim Button */}
                {isComplete && (
                  <button
                    onClick={() => claimQuest(quest.id)}
                    disabled={isClaiming}
                    style={{
                      width: '100%', background: '#00FF9D', color: 'black',
                      border: 'none', padding: '10px', fontWeight: 'bold',
                      cursor: isClaiming ? 'wait' : 'pointer'
                    }}
                  >
                    {isClaiming ? 'CLAIMING...' : 'CLAIM REWARD'}
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
