import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import StorageWidget from '../terminals/widgets/StorageWidget';
import { useInteractionStore } from '../../services/InteractionStore';
import { useNotificationStore } from '../../services/NotificationStore';
import GameNotifications from './GameNotifications';
import QuestJournal from './QuestJournal';

const NPCS = [
  { id: 'DECIMUS', name: 'Navigateur Decimus', role: 'Cartography & Onboarding', color: '#00F3FF', avatar: '🧭' },
  { id: 'HELENA', name: 'Sister Helena', role: 'Smelting & Drone Forge', color: '#FF9500', avatar: '🔥' },
  { id: 'ARBITRE_01', name: 'Arbitre-01', role: 'OxyCorp Compliance AI', color: '#00FF9D', avatar: '🤖' },
  { id: 'V_45', name: 'V-45 "The Scavenger"', role: 'Auction & Logistics', color: '#FFA500', avatar: '⚖️' },
  { id: 'KAELEN', name: 'Commandant Kaelen', role: 'Tactical Command', color: '#FF0055', avatar: '⚔️' }
];

export default function PlayerHUD() {
  const activeNpcId = useInteractionStore((s) => s.activeNpcId);
  const isDialogueActive = useInteractionStore((s) => s.isDialogueActive);
  const setDialogueActive = useInteractionStore((s) => s.setDialogueActive);
  const setActiveNpcId = useInteractionStore((s) => s.setActiveNpcId);

  const [dialogue, setDialogue] = useState<any>(null);
  const [dialogueLoading, setDialogueLoading] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const pushNotification = useNotificationStore((s) => s.push);

  const [isOpen, setIsOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [tick, setTick] = useState<number>(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(3600);
  const [martianDate, setMartianDate] = useState({
    year: 3615,
    month: 1,
    monthName: 'Sagittarius',
    day: 1,
    hour: 0,
  });
  
  const targetTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync dialogue states
  useEffect(() => {
    if (isDialogueActive && activeNpcId) {
      fetchNpcDialogue(activeNpcId);
    } else {
      setDialogue(null);
    }
  }, [isDialogueActive, activeNpcId]);

  const fetchNpcDialogue = async (npcId: string) => {
    setDialogueLoading(true);
    try {
      const res = await apiFetch(`/rpg/npc/${npcId}/dialogue`);
      if (res.ok) {
        const data = await res.json();
        setDialogue(data);
      }
    } catch (err) {
      console.error('Failed to fetch NPC dialogue:', err);
    } finally {
      setDialogueLoading(false);
    }
  };

  const handleDialogueChoice = async (choiceIndex: number) => {
    if (!dialogue || !dialogue.questId) {
      setDialogueActive(false);
      setActiveNpcId(null);
      return;
    }

    setDialogueLoading(true);
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

        // Push notification on quest accepted
        if (nextDialogue.state === 'TALKING' && dialogue?.state === 'AVAILABLE') {
          pushNotification({
            type: 'quest_accepted',
            title: 'Contract Accepted',
            message: `"${dialogue.questTitle || 'New mission'}" is now active.`,
            color: '#00F3FF',
          });
        }

        // Push notification on quest completed with rewards
        if (nextDialogue.state === 'COMPLETED' && nextDialogue.rewards) {
          const r = nextDialogue.rewards;
          const rewardParts: string[] = [];
          if (r.credits) rewardParts.push(`${r.credits} Credits`);
          if (r.serviceCredits) rewardParts.push(`${r.serviceCredits} SC`);
          if (r.xp) rewardParts.push(`${r.xp} XP`);
          if (r.items) r.items.forEach((i: any) => rewardParts.push(`${i.quantity}x ${i.item}`));

          pushNotification({
            type: 'quest_complete',
            title: 'Contract Fulfilled',
            message: `"${nextDialogue.questTitle}" completed!`,
            icon: '🏆',
            duration: 6000,
          });
          if (rewardParts.length > 0) {
            pushNotification({
              type: 'reward',
              title: 'Rewards Received',
              message: rewardParts.join(' • '),
              duration: 6000,
            });
          }
        }

        if (nextDialogue.state === 'CLOSED' || nextDialogue.state === 'COMPLETED') {
          setDialogueActive(false);
          setActiveNpcId(null);
          window.dispatchEvent(new CustomEvent('inventory-updated'));
        } else {
          setDialogue(nextDialogue);
        }
      }
    } catch (err) {
      console.error('Failed to respond to dialogue:', err);
    } finally {
      setDialogueLoading(false);
    }
  };

  const fetchTickStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/gametick/status');
      if (res.ok) {
        const data = await res.json();
        setTick(data.current);
        if (data.martianDate) {
          setMartianDate(data.martianDate);
        }
        
        // Sync target time with local system time
        targetTimeRef.current = Date.now() + data.msRemaining;
        
        // Start/Restart local countdown loop
        if (timerRef.current) clearInterval(timerRef.current);
        
        timerRef.current = setInterval(() => {
          const diff = Math.max(0, Math.ceil((targetTimeRef.current - Date.now()) / 1000));
          setTimeLeftSeconds(diff);
          
          if (diff <= 0) {
            // When countdown reaches 0, perform a single sync to fetch the new tick
            if (timerRef.current) clearInterval(timerRef.current);
            fetchTickStatus();
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to sync game tick:', err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await apiFetch('/user/profile');
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
        
        // Sync tick status from profile action response too to avoid extra API request
        if (data.blueprints !== undefined) {
          // Profile is successfully loaded, sync local tick too
          fetchTickStatus();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchTickStatus]);

  useEffect(() => {
    // Initial loads
    fetchInventory();
    fetchTickStatus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.code === 'KeyI') {
        setIsOpen((prev) => {
          if (!prev) fetchInventory();
          return !prev;
        });
      }
      if (e.code === 'KeyJ') {
        setJournalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('inventory-updated', fetchInventory);
    window.addEventListener('gametick-updated', fetchTickStatus);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('inventory-updated', fetchInventory);
      window.removeEventListener('gametick-updated', fetchTickStatus);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchInventory, fetchTickStatus]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Martian Clock (Always Visible) */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(10, 10, 10, 0.85)',
          border: '1px solid #FFD700',
          color: '#FFD700',
          padding: '8px 15px',
          fontFamily: 'monospace',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
          textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>
          SOL {martianDate.day} {martianDate.monthName.toUpperCase()} {martianDate.year} | {martianDate.hour.toString().padStart(2, '0')}:00
        </span>
        <span style={{ color: '#444' }}>|</span>
        <span>RESET: {formatTime(timeLeftSeconds)}</span>
      </div>

      {/* Inventory Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '400px',
            maxHeight: '80vh',
            background: 'rgba(10, 10, 10, 0.95)',
            border: '1px solid #00FF9D',
            color: '#fff',
            padding: '20px',
            zIndex: 1000,
            overflowY: 'auto',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#00FF9D' }}>PERSONAL INVENTORY</h2>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', color: '#00FF9D', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              [X]
            </button>
          </div>
          <div style={{ color: '#888', marginBottom: '10px' }}>[PRESS 'I' TO CLOSE]</div>
          <StorageWidget inventory={inventory} />
        </div>
      )}

      {/* RPG Dialogue Overlay */}
      {isDialogueActive && dialogue && (() => {
        const activeNpc = NPCS.find(n => n.id === activeNpcId) || NPCS[0];
        return (
          <div
            role="dialog"
            aria-label={`Dialogue with ${activeNpc.name}`}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '850px',
              background: 'rgba(7, 7, 8, 0.95)',
              border: `2px solid ${activeNpc.color}`,
              boxShadow: `0 0 25px ${activeNpc.color}33`,
              padding: '24px',
              zIndex: 9999,
              display: 'grid',
              gridTemplateColumns: '80px 1fr',
              gap: '24px',
              fontFamily: 'monospace',
              borderRadius: '4px',
              pointerEvents: 'auto',
            }}
          >
            {/* Left: Portrait / Avatar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid #1F1F24',
              paddingRight: '20px',
            }}>
              <span style={{ fontSize: '3rem', textShadow: `0 0 10px ${activeNpc.color}` }}>
                {activeNpc.avatar}
              </span>
            </div>

            {/* Right: Message Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header: Name + Role */}
              <div>
                <div style={{ color: activeNpc.color, fontWeight: 'bold', fontSize: '1.2rem', textShadow: `0 0 8px ${activeNpc.color}40`, letterSpacing: '0.05em' }}>
                  {activeNpc.name.toUpperCase()}
                </div>
                <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '2px', letterSpacing: '0.05em' }}>
                  {activeNpc.role.toUpperCase()}
                </div>
              </div>

              {/* Body Text */}
              <div style={{
                color: '#E5E7EB',
                fontSize: '1rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                borderTop: '1px solid #1F1F24',
                paddingTop: '12px',
              }}>
                {dialogueLoading ? (
                  <span style={{ color: activeNpc.color }}>TRANSMITTING SECURE FEED...</span>
                ) : (
                  dialogue.text
                )}
              </div>

              {/* Choices list */}
              {!dialogueLoading && dialogue.choices && dialogue.choices.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '8px',
                }}>
                  {dialogue.choices.map((choice: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleDialogueChoice(index)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #27272A',
                        color: '#9CA3AF',
                        padding: '10px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontFamily: 'monospace',
                        transition: 'all 0.15s',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = activeNpc.color;
                        e.currentTarget.style.borderColor = activeNpc.color;
                        e.currentTarget.style.background = `${activeNpc.color}0D`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9CA3AF';
                        e.currentTarget.style.borderColor = '#27272A';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      [{index + 1}] {choice.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Notification Toasts */}
      <GameNotifications />

      {/* Quest Journal (opened with J) */}
      <QuestJournal isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
    </>
  );
}
