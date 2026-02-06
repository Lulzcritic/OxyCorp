import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  COGITATOR: '#00F3FF', // Cyan
  FORGE: '#FF0055',     // Red
  MERCHANT: '#00FF9D',  // Green
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('http://localhost:3000/api/skills', {
      headers: { Authorization: `Bearer ${session.access_token}` }
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setUnlocking(true)
    const res = await fetch('http://localhost:3000/api/skills/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
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
      <div style={{ border: '1px solid #333', padding: 20, background: '#111', marginTop: 20 }}>
        <h3 style={{ color: '#00F3FF', marginTop: 0 }}>THE CORTEX</h3>
        <div style={{ color: '#666' }}>Syncing neural pathways...</div>
      </div>
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

  return (
    <div style={{ border: '1px solid #333', padding: 20, background: '#111', marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <h3 style={{ color: '#00F3FF', marginTop: 0, marginBottom: 0 }}>THE CORTEX</h3>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ color: '#888' }}>LEVEL <span style={{ color: '#00FF9D' }}>{data.level}</span></span>
          <span style={{ color: '#888' }}>XP <span style={{ color: '#FFD700' }}>{data.xp}</span></span>
          <span style={{ color: '#888' }}>SP <span style={{ color: '#FF6600' }}>{data.skillPoints}</span></span>
        </div>
      </div>

      {/* Skill Trees */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
        {Object.entries(trees).map(([treeName, skills]) => (
          <div key={treeName} style={{ border: `1px solid ${TREE_COLORS[treeName]}40`, padding: 10, background: '#0A0A0A' }}>
            <div style={{ color: TREE_COLORS[treeName], fontSize: '0.9rem', marginBottom: 10, fontWeight: 'bold' }}>
              {treeName}
            </div>
            {skills.map(skill => {
              const unlocked = isUnlocked(skill.id)
              const available = canUnlock(skill)
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    background: unlocked ? TREE_COLORS[skill.specialization || treeName] + '30' : '#1A1A1A',
                    border: `1px solid ${unlocked ? TREE_COLORS[skill.specialization || treeName] : '#333'}`,
                    padding: 8,
                    marginBottom: 8,
                    cursor: 'pointer',
                    opacity: unlocked ? 1 : available ? 0.9 : 0.5,
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: unlocked ? TREE_COLORS[skill.specialization || treeName] : '#888' }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#555' }}>
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
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedSkill(null)}
        >
          <div
            style={{
              background: '#111', border: '1px solid #333', padding: 25, maxWidth: 400, width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: TREE_COLORS[selectedSkill.specialization || 'COGITATOR'], marginTop: 0 }}>
              {selectedSkill.name}
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>{selectedSkill.description}</p>
            <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: 15 }}>
              Cost: {selectedSkill.cost} SP
              {selectedSkill.prereq && <span> | Requires: {selectedSkill.prereq}</span>}
            </div>

            {isUnlocked(selectedSkill.id) ? (
              <div style={{ color: '#00FF9D', textAlign: 'center' }}>✓ SKILL ACTIVE</div>
            ) : canUnlock(selectedSkill) ? (
              <button
                onClick={() => unlockSkill(selectedSkill.id)}
                disabled={unlocking}
                style={{
                  width: '100%', background: '#00FF9D', color: 'black',
                  border: 'none', padding: '12px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {unlocking ? 'UNLOCKING...' : 'UNLOCK SKILL'}
              </button>
            ) : (
              <div style={{ color: '#FF0055', textAlign: 'center', fontSize: '0.9rem' }}>
                {data.skillPoints < selectedSkill.cost ? 'INSUFFICIENT SP' : 'PREREQUISITE LOCKED'}
              </div>
            )}

            <button
              onClick={() => setSelectedSkill(null)}
              style={{
                width: '100%', background: 'transparent', color: '#666',
                border: '1px solid #333', padding: '10px', marginTop: 10, cursor: 'pointer'
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
