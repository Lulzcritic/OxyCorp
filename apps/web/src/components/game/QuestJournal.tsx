/**
 * QuestJournal
 * 
 * Side-panel HUD quest journal (WoW-style), toggled with 'J'.
 * Shows active and completed quests in a compact list with expandable details.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../lib/api';

interface QuestEntry {
  questId: string;
  title: string;
  description: string;
  difficulty: string;
  giverNpc: string;
  objective: any;
  rewards: any;
  status: string;
  progress: number;
  currentStep: string;
  startedAt: string;
  updatedAt: string;
}

const NPC_COLORS: Record<string, string> = {
  DECIMUS: '#00F3FF',
  HELENA: '#FF9500',
  ARBITRE_01: '#00FF9D',
  V_45: '#FFA500',
  KAELEN: '#FF0055',
};

const NPC_NAMES: Record<string, string> = {
  DECIMUS: 'Nav. Decimus',
  HELENA: 'Sister Helena',
  ARBITRE_01: 'Arbitre-01',
  V_45: 'V-45',
  KAELEN: 'Cdt. Kaelen',
};

interface QuestJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestJournal({ isOpen, onClose }: QuestJournalProps) {
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [quests, setQuests] = useState<QuestEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/rpg/quests/my');
      if (res.ok) {
        const data = await res.json();
        setQuests(data);
      }
    } catch (err) {
      console.error('Failed to fetch quests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchQuests();

      const handleUpdate = () => {
        fetchQuests();
      };
      window.addEventListener('inventory-updated', handleUpdate);
      return () => window.removeEventListener('inventory-updated', handleUpdate);
    }
  }, [isOpen, fetchQuests]);

  if (!isOpen) return null;

  const activeQuests = quests.filter((q) => q.status === 'ACTIVE');
  const completedQuests = quests.filter((q) => q.status === 'COMPLETED');
  const displayedQuests = tab === 'active' ? activeQuests : completedQuests;

  const formatObjective = (quest: QuestEntry) => {
    const obj = quest.objective;
    if (!obj) return 'Unknown';
    if (obj.type === 'TALK_TO') return `Talk to ${NPC_NAMES[obj.npcId] || obj.npcId}`;
    if (obj.type === 'MINE') return `Mine ${obj.count} ${obj.item}`;
    return `${obj.type}: ${obj.item || obj.npcId || ''}`;
  };

  const formatRewards = (rewards: any) => {
    if (!rewards) return [];
    const items: string[] = [];
    if (rewards.credits) items.push(`💰 ${rewards.credits}`);
    if (rewards.serviceCredits) items.push(`⚙️ ${rewards.serviceCredits} SC`);
    if (rewards.xp) items.push(`⭐ ${rewards.xp} XP`);
    if (rewards.items) {
      for (const ri of rewards.items) items.push(`📦 ${ri.quantity}x ${ri.item}`);
    }
    return items;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10%',
        left: '20px',
        width: '340px',
        maxHeight: '75vh',
        background: 'rgba(10, 10, 10, 0.95)',
        border: '1px solid #FFD700',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.12)',
        color: '#fff',
        zIndex: 1000,
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid #222',
          background: 'rgba(255, 215, 0, 0.04)',
        }}
      >
        <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
          📜 MISSION JOURNAL
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFD700',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'monospace',
            padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
        {(['active', 'completed'] as const).map((t) => {
          const isActive = tab === t;
          const count = t === 'active' ? activeQuests.length : completedQuests.length;
          return (
            <button
              key={t}
              onClick={() => { setTab(t); setExpandedId(null); }}
              style={{
                flex: 1,
                padding: '8px 0',
                background: isActive ? 'rgba(255, 215, 0, 0.06)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #FFD700' : '2px solid transparent',
                color: isActive ? '#FFD700' : '#555',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              {t === 'active' ? `⚡ ACTIVE (${count})` : `✓ DONE (${count})`}
            </button>
          );
        })}
      </div>

      {/* Quest List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ color: '#444', fontSize: '0.7rem', padding: '6px 14px', letterSpacing: '0.08em' }}>
          [PRESS 'J' TO CLOSE]
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#FFD700', fontSize: '0.8rem' }}>
            LOADING...
          </div>
        ) : displayedQuests.length === 0 ? (
          <div style={{ padding: '20px 14px', color: '#4B5563', fontSize: '0.8rem', lineHeight: '1.5' }}>
            {tab === 'active'
              ? 'No active missions.\nTalk to NPCs in town to accept contracts.'
              : 'No completed missions yet.'}
          </div>
        ) : (
          displayedQuests.map((quest) => {
            const npcColor = NPC_COLORS[quest.giverNpc] || '#888';
            const isExpanded = expandedId === quest.questId;
            const targetCount = quest.objective?.count || 1;
            const progressPct = quest.status === 'COMPLETED' ? 100 : Math.min(100, (quest.progress / targetCount) * 100);

            return (
              <div key={quest.questId}>
                {/* Quest row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : quest.questId)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #151515',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${npcColor}`,
                    background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Title */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#E5E7EB', fontWeight: 'bold', fontSize: '0.82rem' }}>
                      {quest.title}
                    </span>
                    <span style={{ color: '#555', fontSize: '0.7rem' }}>
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </div>

                  {/* Objective line */}
                  <div style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '3px' }}>
                    {formatObjective(quest)}
                  </div>

                  {/* Progress bar (active + countable only) */}
                  {tab === 'active' && quest.objective?.count && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <div style={{
                        flex: 1,
                        height: '3px',
                        background: '#1F1F24',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: progressPct >= 100 ? '#00FF9D' : npcColor,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ color: '#9CA3AF', fontSize: '0.65rem' }}>
                        {quest.progress}/{targetCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '10px 14px 14px',
                      background: 'rgba(255, 215, 0, 0.02)',
                      borderBottom: '1px solid #1A1A1A',
                      borderLeft: `3px solid ${npcColor}`,
                    }}
                  >
                    {/* Description */}
                    <div style={{
                      color: '#9CA3AF',
                      fontSize: '0.78rem',
                      lineHeight: '1.5',
                      marginBottom: '10px',
                      borderLeft: '2px solid #27272A',
                      paddingLeft: '8px',
                    }}>
                      {quest.description}
                    </div>

                    {/* Giver */}
                    <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '8px' }}>
                      CONTRACT FROM{' '}
                      <span style={{ color: npcColor, fontWeight: 'bold' }}>
                        {NPC_NAMES[quest.giverNpc] || quest.giverNpc}
                      </span>
                    </div>

                    {/* Rewards */}
                    <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      REWARDS
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {formatRewards(quest.rewards).map((r, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '3px 8px',
                            background: 'rgba(0, 255, 157, 0.05)',
                            border: '1px solid #1F1F24',
                            borderRadius: '3px',
                            color: '#00FF9D',
                            fontSize: '0.72rem',
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>

                    {/* Status badge */}
                    <div style={{
                      marginTop: '10px',
                      color: quest.status === 'COMPLETED' ? '#00FF9D' : '#FFD700',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.06em',
                    }}>
                      {quest.status === 'COMPLETED' ? '✓ FULFILLED' : '⚡ IN PROGRESS'}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
