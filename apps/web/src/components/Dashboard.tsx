import { useState, useEffect } from 'react';
import '../styles/grimdark-theme.css';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

// Import widgets
import SkillsWidget from './SkillsWidget';
import MiningWidget from './MiningWidget';
import RefiningWidget from './RefiningWidget';
import MapGrid from './MapGrid';
import SectorDetailPanel from './SectorDetailPanel';
import DirectivesWidget from './DirectivesWidget';
import FacilitiesWidget from './FacilitiesWidget';
import MarketWidget from './MarketWidget';
import LeaderboardWidget from './terminals/widgets/LeaderboardWidget';
import CompanyAIWidget from './terminals/widgets/CompanyAIWidget';
import NPCDialoguePanel from './terminals/widgets/NPCDialoguePanel';
import LogicEditorWidget from './terminals/widgets/LogicEditorWidget';
import WarRoom from '../pages/WarRoom';

import { useTerminalStore } from '../services/TerminalManager';
import { TerminalType } from '../types/terminal';

interface UserProfile {
  username: string;
  credits: number;
  serviceCredits: number;
  bunkerLevel: number;
  specialization: string | null;
}

interface Sector {
  id: string;
  x: string;
  y: string;
  type: 'BUNKER' | 'RESOURCE' | 'EMPTY';
  ownerId?: string;
  resources?: { type: string; quantity: number; richness: number };
  hasOutpost?: boolean;
}

type Subsystem = 'COMMAND' | 'NEURAL' | 'LOGISTICS' | 'FACILITIES' | 'COMBAT' | 'COMMUNICATIONS' | 'CLASSIFICATION';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const userId = useAuthStore((state) => state.user?.id || '');
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystem>('COMMAND');
  
  // Terminal overlay integration
  const isTerminalOpen = useTerminalStore((s) => s.isOpen);
  const activeTerminal = useTerminalStore((s) => s.activeTerminal);
  const closeTerminal = useTerminalStore((s) => s.closeTerminal);

  useEffect(() => {
    if (isTerminalOpen && activeTerminal) {
      let tab: Subsystem = 'COMMAND';
      if (activeTerminal === TerminalType.CRYOPOD) tab = 'NEURAL';
      else if (activeTerminal === TerminalType.CONTROL_CENTER) tab = 'COMMAND';
      else if (activeTerminal === TerminalType.COMM) tab = 'COMMUNICATIONS';
      else if (activeTerminal === TerminalType.BUNKER_MANAGEMENT) tab = 'FACILITIES';
      else if (activeTerminal === TerminalType.MARKET) tab = 'LOGISTICS';
      else if (activeTerminal === TerminalType.WAR_ROOM) tab = 'COMBAT';
      else if (activeTerminal === TerminalType.LEADERBOARD) tab = 'CLASSIFICATION';
      setSelectedSubsystem(tab);
    }
  }, [isTerminalOpen, activeTerminal]);
  
  // Operations Command specific states
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [bunkerCoords, setBunkerCoords] = useState<{ x: string; y: string } | null>(null);
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0);

  // Combat specific states
  const [combatTab, setCombatTab] = useState<'swarm' | 'logic'>('swarm');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const bunker = data.sectors?.find((s: any) => s.type === 'BUNKER');
        if (bunker) {
          setBunkerCoords({ x: bunker.x, y: bunker.y });
        } else {
          setBunkerCoords({ x: '0', y: '0' });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setBunkerCoords({ x: '0', y: '0' });
    }
  };

  const handleLogout = async () => {
    if (isTerminalOpen) {
      closeTerminal();
    } else {
      await useAuthStore.getState().logout();
      window.location.reload();
    }
  };

  if (!profile) {
    return (
      <div className="grimdark" style={{ background: 'var(--gd-bg)', color: 'var(--gd-text)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "var(--gd-font-mono, monospace)" }}>
        <div className="cursor-blink" style={{ color: '#00F3FF' }}>&gt; INITIALIZING COCKPIT SYSTEMS...</div>
      </div>
    );
  }

  const navItems: Array<{ id: Subsystem; label: string; icon: string; color: string }> = [
    { id: 'COMMAND', label: 'OPERATIONS COMMAND', icon: '📡', color: '#00FF9D' },
    { id: 'NEURAL', label: 'NEURAL CONDITIONING', icon: '🧠', color: '#00F3FF' },
    { id: 'LOGISTICS', label: 'LOGISTICS & TRADE', icon: '⚖️', color: '#00FFAA' },
    { id: 'FACILITIES', label: 'INFRASTRUCTURE', icon: '🧱', color: '#FF6600' },
    { id: 'COMBAT', label: 'TACTICAL COMMAND', icon: '⚔️', color: '#FF0055' },
    { id: 'COMMUNICATIONS', label: 'COMMUNICATIONS', icon: '📡', color: '#FFD700' },
    { id: 'CLASSIFICATION', label: 'CLASSIFICATION', icon: '🏆', color: '#00FF9D' }
  ];

  return (
    <div className="grimdark crt-scanlines" style={{
      background: '#070708',
      color: '#E5E7EB',
      minHeight: isTerminalOpen ? '100%' : '100vh',
      height: isTerminalOpen ? '100%' : 'auto',
      display: 'grid',
      gridTemplateRows: '64px 1fr',
      fontFamily: "var(--gd-font-primary, sans-serif)",
    }}>
      {/* Top Header Bar */}
      <header style={{
        background: '#0E0E10',
        borderBottom: '1px solid #1F1F24',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '1.5rem', animation: 'pulse-glow 2s infinite' }}>🔴</span>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#F9FAFB',
              fontFamily: "var(--gd-font-mono, monospace)"
            }}>
              TARSIS OS <span style={{ color: '#00F3FF', fontWeight: 300 }}>v2.4</span>
            </h1>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', letterSpacing: '0.05em' }}>
              SECURE SECTOR ACCESS // UNIT ID: {userId.substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Specialization Indicator */}
        {profile.specialization && (
          <div style={{
            background: 'rgba(0, 243, 255, 0.05)',
            border: '1px solid #00F3FF',
            padding: '4px 12px',
            borderRadius: 4,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#00F3FF',
            letterSpacing: '0.1em',
            fontFamily: "var(--gd-font-mono, monospace)"
          }}>
            ROLE: {profile.specialization}
          </div>
        )}

        {/* Top Wallet Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              color: '#FFA500',
              fontFamily: "var(--gd-font-mono, monospace)",
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              ₡ {Number(profile.credits).toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>CREDITS</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              color: '#00F3FF',
              fontFamily: "var(--gd-font-mono, monospace)",
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              {profile.serviceCredits}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>SERVICE CREDITS</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              color: '#00FF9D',
              fontFamily: "var(--gd-font-mono, monospace)",
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              {profile.bunkerLevel}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>BUNKER LEVEL</div>
          </div>

          <button
            onClick={() => window.location.href = '/bunker'}
            style={{
              background: '#00FF9D',
              border: 'none',
              borderRadius: 4,
              color: 'black',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 255, 157, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🌐 3D VIEW
          </button>
        </div>
      </header>

      {/* Main OS Window (Sidebar + Stage) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden' }}>
        {/* Left Navigation Sidebar */}
        <aside style={{
          background: '#0B0B0C',
          borderRight: '1px solid #1F1F24',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 16
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              color: '#4B5563',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              marginBottom: 8,
              paddingLeft: 8
            }}>
              SYSTEM OPERATIONS
            </div>

            {navItems.map((item) => {
              const isActive = selectedSubsystem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedSubsystem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: isActive ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    border: `1px solid ${isActive ? item.color : 'transparent'}`,
                    borderRadius: 4,
                    color: isActive ? '#F3F4F6' : '#9CA3AF',
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    fontFamily: "var(--gd-font-mono, monospace)",
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#F3F4F6';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#9CA3AF';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Signout info */}
          <div style={{
            borderTop: '1px solid #1F1F24',
            paddingTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              LOGGED AS: <span style={{ color: '#9CA3AF', fontWeight: 600 }}>{profile.username}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid #374151',
                borderRadius: 4,
                color: '#9CA3AF',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#EF4444';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#374151';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              {isTerminalOpen ? 'CLOSE TERMINAL' : 'DISCONNECT SESSION'}
            </button>
          </div>
        </aside>

        {/* Center Panel (Selected Subsystem Viewport) */}
        <main style={{
          overflowY: 'auto',
          padding: 24,
          background: '#070708',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedSubsystem === 'COMMAND' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, height: '100%' }}>
              {/* Left Column: Mining & Refining */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <MiningWidget selectedSector={selectedSector} currentUserId={userId} />
                <RefiningWidget />
              </div>

              {/* Right Column: Map & Sector Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {bunkerCoords ? (
                  <MapGrid
                    initialCenterX={bunkerCoords.x}
                    initialCenterY={bunkerCoords.y}
                    onSelectSector={setSelectedSector}
                    selectedSectorId={selectedSector?.id}
                    currentUserId={userId}
                    refreshTrigger={mapRefreshTrigger}
                  />
                ) : (
                  <div style={{ color: '#00F3FF', padding: 40, textAlign: 'center', fontFamily: 'var(--gd-font-mono, monospace)', border: '1px solid #1F1F24', borderRadius: 4 }}>
                    ACQUIRING BUNKER TELEMETRY...
                  </div>
                )}
                <SectorDetailPanel
                  sector={selectedSector}
                  currentUserId={userId}
                  bunkerCoords={bunkerCoords}
                  onClaimed={() => {
                    setSelectedSector(null);
                    setMapRefreshTrigger(prev => prev + 1);
                    fetchProfile(); // Refresh service credits
                  }}
                />
              </div>
            </div>
          )}

          {selectedSubsystem === 'NEURAL' && (
            <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
              <SkillsWidget onSkillUnlock={fetchProfile} />
            </div>
          )}

          {selectedSubsystem === 'LOGISTICS' && (
            <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
              <MarketWidget />
            </div>
          )}

          {selectedSubsystem === 'FACILITIES' && (
            <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
              <FacilitiesWidget onUpgrade={fetchProfile} />
            </div>
          )}

          {selectedSubsystem === 'COMBAT' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', borderBottom: '1px solid #1F1F24', background: '#0E0E10', borderRadius: '4px 4px 0 0' }}>
                <button
                  onClick={() => setCombatTab('swarm')}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: combatTab === 'swarm' ? '#16161A' : 'transparent',
                    color: combatTab === 'swarm' ? '#00FF9D' : '#9CA3AF',
                    border: 'none',
                    borderBottom: combatTab === 'swarm' ? '2px solid #00FF9D' : 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    fontFamily: "var(--gd-font-mono, monospace)"
                  }}
                >
                  [SWARM POSITIONING]
                </button>
                <button
                  onClick={() => setCombatTab('logic')}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: combatTab === 'logic' ? '#16161A' : 'transparent',
                    color: combatTab === 'logic' ? (profile.specialization === 'FORGE' ? '#00FF9D' : '#FF0055') : '#9CA3AF',
                    border: 'none',
                    borderBottom: combatTab === 'logic' ? `2px solid ${profile.specialization === 'FORGE' ? '#00FF9D' : '#FF0055'}` : 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    fontFamily: "var(--gd-font-mono, monospace)"
                  }}
                >
                  {profile.specialization === 'FORGE' ? '[LOGIC COMPILER]' : '[🔒 LOGIC COMPILER]'}
                </button>
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, background: '#0E0E10', border: '1px solid #1F1F24', borderTop: 'none', padding: 24, borderRadius: '0 0 4px 4px' }}>
                {combatTab === 'swarm' ? (
                  <WarRoom embedded={true} />
                ) : (
                  <div>
                    {profile.specialization === 'FORGE' ? (
                      <LogicEditorWidget />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 15 }}>🔒</div>
                        <h3 style={{ color: '#FF0055', fontSize: '1.3rem', margin: '0 0 10px' }}>IDE LOCK: REQUIRES FORGE SPECIALIZATION</h3>
                        <p style={{ color: '#6B7280', maxWidth: 500, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
                          The RISK-16 Logic Compiler is restricted to members of the Corpse-Fuelled Forge. Non-specialists must purchase combat logic cartridges on the Global Auction House.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedSubsystem === 'COMMUNICATIONS' && (
            <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* NPC Dialogue Link (First priority for story progression) */}
              <NPCDialoguePanel />

              {/* Global Company AI Status Alert */}
              <CompanyAIWidget />

              {/* Daily & Company Directives */}
              <DirectivesWidget />
            </div>
          )}

          {selectedSubsystem === 'CLASSIFICATION' && (
            <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
              <LeaderboardWidget />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
