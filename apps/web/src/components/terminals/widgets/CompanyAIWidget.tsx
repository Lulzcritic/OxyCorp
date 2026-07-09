import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';

interface GlobalEvent {
  id: string;
  eventType: string;
  eventName: string;
  description: string;
  effects: Record<string, number>;
}

interface Directive {
  id: string;
  type: string;
  target: { item: string; count: number };
  reward: { serviceCredits?: number; xp: number };
  progress: number;
  status: string;
}

export default function CompanyAIWidget() {
  const [activeEvent, setActiveEvent] = useState<GlobalEvent | null>(null);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active global event
      const eventRes = await apiFetch('/company-ai/active-event');
      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setActiveEvent(eventData);
      }

      // 2. Fetch directives
      const dirRes = await apiFetch('/directives');
      if (dirRes.ok) {
        const dirData = await dirRes.json();
        setDirectives(dirData);
      }
    } catch (err) {
      console.error('Error fetching Company AI telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaim = async (questId: string) => {
    setClaimingId(questId);
    try {
      const res = await apiFetch('/directives/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      });
      if (res.ok) {
        alert('Directive claimed successfully! Service Credits awarded.');
        // Reload page to update header credit balances and active directives
        window.location.reload();
      } else {
        const err = await res.json();
        alert(`Claim failed: ${err.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  const handleTriggerTick = async () => {
    setTriggering(true);
    try {
      const res = await apiFetch('/company-ai/trigger-tick', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Simulation Tick Completed!\nEvent: ${data.eventName}`);
        fetchData();
      } else {
        alert('Simulation Tick failed to execute.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  const getEventBadgeColor = (type?: string) => {
    switch (type) {
      case 'SOLAR_STORM':
        return '#FF8000';
      case 'RESOURCE_SCARCITY':
        return '#FF0055';
      case 'MILITARY_DEMAND':
        return '#00F3FF';
      case 'ECONOMIC_BOOM':
        return '#00FF9D';
      default:
        return '#888';
    }
  };

  return (
    <div style={{
      border: '1px solid #2A2A2A',
      padding: 15,
      background: '#050505',
      fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <div style={{
          color: '#FF0055',
          fontSize: '1.15rem',
          letterSpacing: '0.15em',
          textShadow: '0 0 5px rgba(255, 0, 85, 0.3)',
        }}>
          [ COMPANY TELEMETRY / ARBITRATOR-01 ]
        </div>
        <button
          onClick={handleTriggerTick}
          disabled={triggering}
          style={{
            background: 'transparent',
            border: '1px solid #FF0055',
            color: '#FF0055',
            padding: '3px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          {triggering ? 'SIMULATING...' : 'TRIGGER TICK'}
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#888', padding: '10px 0' }}>Syncing orbital telemetry link...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {/* Active Global Event Card */}
          {activeEvent ? (
            <div style={{
              border: `1px solid ${getEventBadgeColor(activeEvent.eventType)}`,
              padding: 12,
              background: 'rgba(10, 5, 5, 0.8)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: getEventBadgeColor(activeEvent.eventType),
                color: '#000',
                fontSize: '0.75rem',
                padding: '1px 6px',
                fontWeight: 'bold',
              }}>
                {activeEvent.eventType}
              </div>
              <div style={{
                color: getEventBadgeColor(activeEvent.eventType),
                fontSize: '1.05rem',
                fontWeight: 'bold',
                marginBottom: 5,
              }}>
                EVENT: {activeEvent.eventName}
              </div>
              <div style={{ color: '#CCC', fontSize: '0.9rem', lineHeight: '1.3', marginBottom: 10 }}>
                {activeEvent.description}
              </div>
              {/* Dynamic Modifiers */}
              {Object.keys(activeEvent.effects).length > 0 && (
                <div style={{ display: 'flex', gap: 15, fontSize: '0.85rem', color: '#888', borderTop: '1px solid #222', paddingTop: 8 }}>
                  <span style={{ color: '#555' }}>MODIFIERS:</span>
                  {Object.entries(activeEvent.effects).map(([key, val]) => (
                    <span key={key} style={{ color: val > 1 ? '#FF5555' : '#00FF9D' }}>
                      {key}: {val > 1 ? `+${Math.round((val - 1) * 100)}%` : `-${Math.round((1 - val) * 100)}%`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ border: '1px dashed #2A2A2A', padding: 12, color: '#666', textAlign: 'center' }}>
              No active global economic events registered. Trigger a simulation tick above.
            </div>
          )}

          {/* Active Company Directives */}
          <div>
            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 8, letterSpacing: '0.1em' }}>
              ACTIVE COMPANY DIRECTIVES
            </div>
            {directives.length === 0 ? (
              <div style={{ color: '#555', fontSize: '0.85rem' }}>No directives issued for your sector.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {directives.map((dir) => {
                  const target = dir.target;
                  const isCompleted = dir.progress >= target.count;
                  return (
                    <div
                      key={dir.id}
                      style={{
                        border: '1px solid #222',
                        padding: 10,
                        background: '#0B0B0B',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ color: '#00F3FF', fontSize: '0.95rem', fontWeight: 'bold' }}>
                          {dir.type} {target.item}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 2 }}>
                          Progress: <span style={{ color: isCompleted ? '#00FF9D' : '#FF8000' }}>
                            {dir.progress}/{target.count}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#00FF9D', fontSize: '0.9rem' }}>
                            +{dir.reward.serviceCredits || 0} SC
                          </div>
                          <div style={{ color: '#555', fontSize: '0.75rem' }}>
                            +{dir.reward.xp} XP
                          </div>
                        </div>
                        {isCompleted && (
                          <button
                            onClick={() => handleClaim(dir.id)}
                            disabled={claimingId === dir.id}
                            style={{
                              background: '#00FF9D',
                              border: 'none',
                              color: '#000',
                              padding: '5px 12px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontFamily: 'monospace',
                            }}
                          >
                            {claimingId === dir.id ? 'CLAIMING...' : 'CLAIM'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
