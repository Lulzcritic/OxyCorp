import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useInteractionStore } from '../../../services/InteractionStore';

interface Choice {
  text: string;
  nextNode: string;
  trigger?: string;
}

interface Dialogue {
  questId: string | null;
  questTitle: string | null;
  npcId: string;
  nodeName: string;
  text: string;
  choices: Choice[];
  state: 'DEFAULT' | 'AVAILABLE' | 'IN_PROGRESS' | 'CAN_COMPLETE' | 'COMPLETED' | 'CLOSED';
}

const NPCS = [
  { id: 'DECIMUS', name: 'Navigateur Decimus', role: 'Cartography & Onboarding', color: '#00F3FF', avatar: '🧭', bio: 'OxyCorp High Commissioner. Stern, cold, and strictly compliance-driven.' },
  { id: 'HELENA', name: 'Sister Helena', role: 'Smelting & Drone Forge', color: '#FF9500', avatar: '🔥', bio: 'Master Technologist of the Corpse-Forge. Values raw materials and iron will.' },
  { id: 'ARBITRE_01', name: 'Arbitre-01', role: 'OxyCorp Compliance AI', color: '#00FF9D', avatar: '🤖', bio: 'Autonomous corporate arbiter. Enforces Service Credits and territory limits.' },
  { id: 'V_45', name: 'V-45 "The Scavenger"', role: 'Auction & Logistics', color: '#FFA500', avatar: '⚖️', bio: 'Rusty logistical machine. Connects operators to the Global Auction House.' },
  { id: 'KAELEN', name: 'Commandant Kaelen', role: 'Tactical Command', color: '#FF0055', avatar: '⚔️', bio: 'Martian Garrison veteran. Manages drone swarms and active combat vectors.' }
];

export default function NPCDialoguePanel() {
  const activeNpcId = useInteractionStore((s) => s.activeNpcId);
  const setActiveNpcId = useInteractionStore((s) => s.setActiveNpcId);
  const [selectedNpcId, setSelectedNpcId] = useState<string>('DECIMUS');
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeNpcId) {
      setSelectedNpcId(activeNpcId);
    }
  }, [activeNpcId]);

  useEffect(() => {
    fetchDialogue(selectedNpcId);
  }, [selectedNpcId]);

  const fetchDialogue = async (npcId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/rpg/npc/${npcId}/dialogue`);
      if (res.ok) {
        const data = await res.json();
        setDialogue(data);
      } else {
        setError(`Failed to open dialogue link: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || 'Connection timeout');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choiceIndex: number) => {
    if (!dialogue || !dialogue.questId) return;

    setLoading(true);
    try {
      const res = await apiFetch('/rpg/dialogue/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: dialogue.npcId,
          questId: dialogue.questId,
          nodeName: dialogue.nodeName,
          choiceIndex,
        }),
      });

      if (res.ok) {
        const nextDialogue = await res.json();
        if (nextDialogue.state === 'CLOSED' || nextDialogue.state === 'COMPLETED') {
          // Re-fetch default dialogue for this NPC
          fetchDialogue(selectedNpcId);
        } else {
          setDialogue(nextDialogue);
        }
      } else {
        const errData = await res.json();
        setError(errData.message || 'Response transmission failed');
      }
    } catch (err: any) {
      setError(err.message || 'Response transmission timeout');
    } finally {
      setLoading(false);
    }
  };

  const activeNpc = NPCS.find(n => n.id === selectedNpcId);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: 20,
      background: '#0E0E0E',
      border: '1px solid #1A1A1A',
      borderRadius: 4,
      padding: 15,
      minHeight: 400
    }}>
      {/* Left: NPC Directory */}
      <div style={{
        borderRight: '1px solid #1A1A1A',
        paddingRight: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ color: '#555', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: 5 }}>NPC DIRECTORY</div>
        {NPCS.map((npc) => {
          const isSelected = npc.id === selectedNpcId;
          return (
            <button
              key={npc.id}
              onClick={() => {
                setSelectedNpcId(npc.id);
                setActiveNpcId(npc.id);
              }}
              style={{
                width: '100%',
                background: isSelected ? 'rgba(0, 243, 255, 0.05)' : 'transparent',
                border: `1px solid ${isSelected ? npc.color : '#1A1A1A'}`,
                borderRadius: 4,
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{npc.avatar}</span>
              <div>
                <div style={{ color: isSelected ? npc.color : '#888', fontWeight: 600, fontSize: '0.95rem' }}>{npc.name}</div>
                <div style={{ color: '#555', fontSize: '0.75rem', marginTop: 2 }}>{npc.role}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: Dialogue Box */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        {/* NPC Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          paddingBottom: 15,
          borderBottom: '1px solid #1A1A1A',
          marginBottom: 15
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#161616',
            border: `1px solid ${activeNpc?.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            {activeNpc?.avatar}
          </div>
          <div>
            <div style={{ color: activeNpc?.color, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
              {activeNpc?.name.toUpperCase()}
            </div>
            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: 2 }}>
              {activeNpc?.bio}
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 0' }}>
          {loading ? (
            <div style={{ color: '#555', fontSize: '1.1rem', textAlign: 'center', fontFamily: 'monospace' }} className="cursor-blink">
              ESTABLISHING ENCRYPTED LINK...
            </div>
          ) : error ? (
            <div style={{ color: '#FF0055', textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8 }}>⚠️ TRANSMISSION ERROR</div>
              <div style={{ fontSize: '0.9rem' }}>{error}</div>
              <button
                onClick={() => fetchDialogue(selectedNpcId)}
                style={{
                  marginTop: 15,
                  background: 'transparent',
                  border: '1px solid #FF0055',
                  color: '#FF0055',
                  padding: '6px 16px',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                RETRY LINK
              </button>
            </div>
          ) : dialogue ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Quest Header */}
              {dialogue.questTitle && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '3px 8px',
                  border: `1px solid ${dialogue.state === 'CAN_COMPLETE' ? '#00FF9D' : '#00F3FF'}`,
                  background: dialogue.state === 'CAN_COMPLETE' ? 'rgba(0, 255, 157, 0.05)' : 'rgba(0, 243, 255, 0.05)',
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: dialogue.state === 'CAN_COMPLETE' ? '#00FF9D' : '#00F3FF'
                }}>
                  QUEST LINKED: {dialogue.questTitle.toUpperCase()} [{dialogue.state}]
                </div>
              )}

              {/* Dialogue Text */}
              <div style={{
                color: '#E5E7EB',
                fontSize: '1.05rem',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                background: '#080808',
                border: '1px solid #121212',
                borderRadius: 4,
                padding: '20px 24px',
                minHeight: 120,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
              }}>
                {dialogue.text}
              </div>

              {/* Choice Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {dialogue.choices.length > 0 ? (
                  dialogue.choices.map((choice, index) => {
                    const isAccept = choice.trigger === 'ACCEPT_QUEST';
                    const isComplete = choice.trigger === 'COMPLETE_QUEST';
                    let btnColor = '#00F3FF';
                    if (isAccept) btnColor = '#FFA500';
                    if (isComplete) btnColor = '#00FF9D';

                    return (
                      <button
                        key={index}
                        onClick={() => handleChoice(index)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: `1px solid ${btnColor}`,
                          borderRadius: 4,
                          color: btnColor,
                          padding: '12px 18px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${btnColor}10`;
                          e.currentTarget.style.boxShadow = `0 0 8px ${btnColor}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        &gt; {choice.text}
                      </button>
                    );
                  })
                ) : (
                  <button
                    onClick={() => fetchDialogue(selectedNpcId)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid #CC0000',
                      borderRadius: 4,
                      color: '#CC0000',
                      padding: '12px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem'
                    }}
                  >
                    &gt; [DISCONNECT CHANNEL]
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: '#555', textAlign: 'center' }}>NO CHANNEL SELECTED</div>
          )}
        </div>
      </div>
    </div>
  );
}
