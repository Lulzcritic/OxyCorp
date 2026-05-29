import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import GrimdarkCard from './grimdark/GrimdarkCard'
import GrimdarkButton from './grimdark/GrimdarkButton'
import GrimdarkProgressBar from './grimdark/GrimdarkProgressBar'
import '../styles/grimdark-theme.css'

interface SkillDefinition {
  id: string
  name: string
  description: string
  cost: number
  prereq?: string
  specialization?: 'COGITATOR' | 'FORGE' | 'MERCHANT'
}

interface UserSkill {
  skillId: string
  level: number
}

interface SkillsData {
  xp: string
  level: number
  skillPoints: number
  specialization: string | null
  unlockedSkills: UserSkill[]
  availableSkills: SkillDefinition[]
}

const TREE_COLORS: Record<string, string> = {
  COGITATOR: '#00F3FF',
  FORGE: '#FF0055',
  MERCHANT: '#00FF9D',
}

interface SkillsWidgetProps {
  onSkillUnlock?: () => void
}

export default function SkillsWidget({ onSkillUnlock }: SkillsWidgetProps) {
  const [data, setData] = useState<SkillsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null)
  const [unlocking, setUnlocking] = useState(false)

  const fetchSkills = async () => {
    if (!session) return

    const res = await apiFetch('/skills', {
    })

    if (res.ok) {
      const result = await res.json()
      setData(result)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const isUnlocked = (skillId: string): boolean => {
    return data?.unlockedSkills.some(s => s.skillId === skillId) || false
  }

  const canUnlock = (skill: SkillDefinition): boolean => {
    if (!data) return false
    if (isUnlocked(skill.id)) return false
    if (data.skillPoints < skill.cost) return false
    if (skill.prereq && !isUnlocked(skill.prereq)) return false
    return true
  }

  const unlockSkill = async (skillId: string) => {
    if (!session) return

    setUnlocking(true)
    const res = await apiFetch('/skills/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skillId })
    })

    if (res.ok) {
      await fetchSkills()
      setSelectedSkill(null)
      if (onSkillUnlock) onSkillUnlock()
    } else {
      const err = await res.json()
      alert('Unlock failed: ' + err.message)
    }
    setUnlocking(false)
  }

  if (loading) {
    return (
      <GrimdarkCard title="THE CORTEX" status="online" style={{ marginTop: 20 }}>
        <div style={{ color: '#555', fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          &gt; Syncing neural pathways...
        </div>
      </GrimdarkCard>
    )
  }

  if (!data) return null

  // Group skills by specialization
  const trees: Record<string, SkillDefinition[]> = {
    COGITATOR: [],
    FORGE: [],
    MERCHANT: [],
  }
  data.availableSkills.forEach(skill => {
    if (skill.specialization && trees[skill.specialization]) {
      trees[skill.specialization].push(skill)
    }
  })

  const unlockedCount = data.unlockedSkills.length
  const totalSkills = data.availableSkills.length

  return (
    <GrimdarkCard title="THE CORTEX" status="online" style={{ marginTop: 20 }}>
      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        fontSize: '1rem',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ color: '#888' }}>LEVEL <span style={{ color: '#00FF9D' }}>{data.level}</span></span>
          <span style={{ color: '#888' }}>XP <span style={{ color: '#FFA500' }}>{data.xp}</span></span>
          <span style={{ color: '#888' }}>SP <span style={{ color: '#FF6600' }}>{data.skillPoints}</span></span>
        </div>
        <div style={{ color: '#555', fontSize: '0.9rem' }}>
          [{unlockedCount}/{totalSkills}] ACTIVE
        </div>
      </div>

      {/* Progress */}
      <GrimdarkProgressBar
        value={unlockedCount}
        max={totalSkills || 1}
        label="NEURAL INTEGRATION"
        variant="primary"
        width={25}
      />

      {/* Skill Trees */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 15 }}>
        {Object.entries(trees).map(([treeName, skills]) => (
          <div key={treeName} style={{
            border: `1px solid ${TREE_COLORS[treeName]}30`,
            padding: 10,
            background: '#0A0A0A',
          }}>
            <div style={{
              color: TREE_COLORS[treeName],
              fontSize: '1rem',
              marginBottom: 10,
              letterSpacing: '0.15em',
              textShadow: `0 0 5px ${TREE_COLORS[treeName]}40`,
              fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
            }}>
              [ {treeName} ]
            </div>
            {skills.map(skill => {
              const unlocked = isUnlocked(skill.id)
              const available = canUnlock(skill)
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    background: unlocked ? TREE_COLORS[skill.specialization || treeName] + '15' : '#161616',
                    border: `1px solid ${unlocked ? TREE_COLORS[skill.specialization || treeName] + '60' : '#2A2A2A'}`,
                    padding: 8,
                    marginBottom: 6,
                    cursor: 'pointer',
                    opacity: unlocked ? 1 : available ? 0.9 : 0.5,
                    transition: 'all 0.15s',
                    fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
                  }}
                >
                  <div style={{
                    fontSize: '0.95rem',
                    color: unlocked ? TREE_COLORS[skill.specialization || treeName] : '#888',
                  }}>
                    {unlocked ? '▸ ' : '  '}{skill.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#555' }}>
                    {unlocked ? '✓ ACTIVE' : `${skill.cost} SP`}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedSkill(null)}
        >
          <GrimdarkCard
            title={selectedSkill.name}
            status={isUnlocked(selectedSkill.id) ? 'online' : canUnlock(selectedSkill) ? 'warning' : 'offline'}
            style={{ maxWidth: 400, width: '90%' }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <p style={{
                color: '#888',
                fontSize: '1rem',
                fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
              }}>
                {selectedSkill.description}
              </p>
              <div style={{
                color: '#555',
                fontSize: '0.9rem',
                marginBottom: 15,
                fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
              }}>
                Cost: {selectedSkill.cost} SP
                {selectedSkill.prereq && <span> | Requires: {selectedSkill.prereq}</span>}
              </div>

              {isUnlocked(selectedSkill.id) ? (
                <div style={{
                  color: '#00FF9D',
                  textAlign: 'center',
                  fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
                  textShadow: '0 0 5px rgba(0, 255, 157, 0.4)',
                }}>
                  ✓ SKILL ACTIVE
                </div>
              ) : canUnlock(selectedSkill) ? (
                <GrimdarkButton
                  onClick={() => unlockSkill(selectedSkill.id)}
                  disabled={unlocking}
                  style={{ width: '100%' }}
                >
                  {unlocking ? 'UNLOCKING...' : 'UNLOCK SKILL'}
                </GrimdarkButton>
              ) : (
                <div style={{
                  color: '#CC0000',
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
                }}>
                  {data.skillPoints < selectedSkill.cost ? 'INSUFFICIENT SP' : 'PREREQUISITE LOCKED'}
                </div>
              )}

              <GrimdarkButton
                variant="danger"
                onClick={() => setSelectedSkill(null)}
                style={{ width: '100%', marginTop: 10 }}
              >
                CLOSE
              </GrimdarkButton>
            </div>
          </GrimdarkCard>
        </div>
      )}
    </GrimdarkCard>
  )
}
