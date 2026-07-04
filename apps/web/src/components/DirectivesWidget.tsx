import { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import GrimdarkProgressBar from './grimdark/GrimdarkProgressBar'
import '../styles/grimdark-theme.css'

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


    const res = await apiFetch('/directives', {
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

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchQuests()
    }
  }, [refreshTrigger, fetchQuests])

  const generateDaily = async () => {


    setLoading(true)
    const res = await apiFetch('/directives/daily', {
      method: 'POST',
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


    setClaiming(questId)
    const res = await apiFetch('/directives/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      <GrimdarkCard title="INCOMING TRANSMISSION" status="warning" style={{ marginTop: 20 }}>
        <div style={{
          color: '#FFA500',
          fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
          textShadow: '0 0 5px rgba(255, 165, 0, 0.3)',
        }}>
          &gt; Receiving transmission...
        </div>
      </GrimdarkCard>
    )
  }

  const activeQuests = quests.filter(q => q.status === 'ACTIVE')

  return (
    <GrimdarkCard title="INCOMING TRANSMISSION" status={activeQuests.length > 0 ? 'online' : 'warning'} style={{ marginTop: 20 }}>
      <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        {/* Sub-header */}
        <div style={{
          color: '#555',
          fontSize: '0.9rem',
          marginBottom: 12,
          borderBottom: '1px solid #2A2A2A',
          paddingBottom: 8,
        }}>
          DIRECTIVES // ACTIVE MISSIONS: {activeQuests.length}
        </div>

        {activeQuests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ color: '#555', marginBottom: 15 }}>NO ACTIVE MISSIONS</div>
            <GrimdarkButton variant="warning" onClick={generateDaily}>
              GENERATE DAILY DIRECTIVES
            </GrimdarkButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeQuests.slice(0, 3).map(quest => {
              const targetCount = quest.target?.count || 1
              const isComplete = quest.progress >= targetCount
              const isClaiming = claiming === quest.id

              return (
                <div
                  key={quest.id}
                  style={{
                    background: isComplete ? 'rgba(0, 255, 157, 0.05)' : '#0E0E0E',
                    border: isComplete ? '1px solid #00CC66' : '1px solid #2A2A2A',
                    padding: 12,
                  }}
                >
                  {/* Quest Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      color: isComplete ? '#00FF9D' : '#FFA500',
                      fontSize: '1rem',
                      textShadow: isComplete ? '0 0 5px rgba(0, 255, 157, 0.3)' : '0 0 5px rgba(255, 165, 0, 0.3)',
                    }}>
                      &gt; {quest.type}
                    </span>
                    <span style={{ color: '#555', fontSize: '0.9rem' }}>
                      {quest.target?.item || 'OBJECTIVE'}
                    </span>
                  </div>

                  {/* ASCII Progress */}
                  <div style={{ marginBottom: 8 }}>
                    <GrimdarkProgressBar
                      value={quest.progress}
                      max={targetCount}
                      variant={isComplete ? 'primary' : 'warning'}
                      width={15}
                    />
                  </div>

                  {/* Rewards */}
                  <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: 8 }}>
                    REWARD: {quest.reward?.credits ? `₡${quest.reward.credits}` : ''}
                    {quest.reward?.xp ? ` | ${quest.reward.xp} XP` : ''}
                  </div>

                  {/* Claim Button */}
                  {isComplete && (
                    <GrimdarkButton
                      onClick={() => claimQuest(quest.id)}
                      disabled={isClaiming}
                      style={{ width: '100%' }}
                    >
                      {isClaiming ? 'CLAIMING...' : 'CLAIM REWARD'}
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
