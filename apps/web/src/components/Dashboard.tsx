/**
 * Dashboard Component
 * 
 * Main interface with optional terminal system integration via feature flag.
 * When VITE_USE_TERMINALS is enabled, shows terminal access buttons.
 * Otherwise, renders widgets directly for backward compatibility.
 */

import { useState, useEffect } from 'react';
import '../styles/grimdark-theme.css';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useTerminalStore } from '../services/TerminalManager';
import { TerminalType } from '../types/terminal';
import TerminalOverlay from './terminals/TerminalOverlay';

// Import widgets for direct rendering mode
import SkillsWidget from './SkillsWidget';
import MiningWidget from './MiningWidget';
import RefiningWidget from './RefiningWidget';
import DirectivesWidget from './DirectivesWidget';
import FacilitiesWidget from './FacilitiesWidget';
import MarketWidget from './MarketWidget';

interface UserProfile {
  username: string;
  credits: number;
  bunkerLevel: number;
}

const USE_TERMINALS = import.meta.env.VITE_USE_TERMINALS === 'true';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string>('');
  const openTerminal = useTerminalStore((state) => state.openTerminal);

  useEffect(() => {
    fetchProfile();
    fetchUserId();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch('/user/profile');

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch profile:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserId = async () => {
    const user = useAuthStore.getState().user;
    if (user) {
      setUserId(user.id);
    }
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    window.location.reload();
  };

  if (!profile) {
    return (
      <div className="grimdark" style={{ background: 'var(--gd-bg)', color: 'var(--gd-text)', minHeight: '100vh', padding: 20, fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        &gt; Loading bunker systems...
      </div>
    );
  }

  // Terminal Mode: Show terminal access buttons
  if (USE_TERMINALS) {
    return (
      <div className="grimdark" style={{ background: 'var(--gd-bg)', color: 'var(--gd-text)', minHeight: '100vh', padding: 20, fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: 0, color: '#00FF9D', letterSpacing: '0.15em', textShadow: '0 0 10px rgba(0, 255, 157, 0.3)' }}>OXYCORP BUNKER</h1>
            <div style={{ color: '#555', fontSize: '1rem' }}>OPERATOR: <span style={{ color: '#888' }}>{profile.username}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#FFA500', fontSize: '1.3rem', textShadow: '0 0 5px rgba(255, 165, 0, 0.3)' }}>[CREDITS: ₡{Number(profile.credits).toLocaleString('en-US')}]</div>
            <div style={{ color: '#00F3FF', textShadow: '0 0 5px rgba(0, 243, 255, 0.3)' }}>[BUNKER LVL {profile.bunkerLevel}]</div>
          </div>
        </div>

        {/* Terminal Access Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1200 }}>
          <TerminalButton
            title="NEURAL CONDITIONING"
            subtitle="Skills & Development"
            color="#00F3FF"
            onClick={() => openTerminal(TerminalType.CRYOPOD)}
          />
          <TerminalButton
            title="OPERATIONS COMMAND"
            subtitle="Mining, Refining, Map"
            color="#00FF9D"
            onClick={() => openTerminal(TerminalType.CONTROL_CENTER)}
          />
          <TerminalButton
            title="COMMUNICATIONS"
            subtitle="Directives & Chat"
            color="#FFD700"
            onClick={() => openTerminal(TerminalType.COMM)}
          />
          <TerminalButton
            title="INFRASTRUCTURE"
            subtitle="Facilities Management"
            color="#FF6600"
            onClick={() => openTerminal(TerminalType.BUNKER_MANAGEMENT)}
          />
          <TerminalButton
            title="LOGISTICS & TRADE"
            subtitle="Market Operations"
            color="#00FFAA"
            onClick={() => openTerminal(TerminalType.MARKET)}
          />
          <TerminalButton
            title="TACTICAL COMMAND"
            subtitle="Combat Systems"
            color="#FF0055"
            onClick={() => openTerminal(TerminalType.WAR_ROOM)}
          />
        </div>

        {/* Enter Bunker */}
        <button
          onClick={() => window.location.href = '/bunker'}
          style={{
            marginTop: 40,
            marginRight: 20,
            background: '#00FF9D',
            border: 'none',
            color: 'black',
            padding: '15px 30px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          🌐 ENTER BUNKER (3D MODE)
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 40,
            background: 'transparent',
            border: '1px solid #666',
            color: '#666',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          LOGOUT
        </button>

        {/* Terminal Overlay */}
        <TerminalOverlay />
      </div>
    );
  }

  // Classic Mode: Direct widget rendering
  return (
    <div className="grimdark" style={{ background: 'var(--gd-bg)', color: 'var(--gd-text)', minHeight: '100vh', padding: 20, fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0, color: '#00FF9D', letterSpacing: '0.15em', textShadow: '0 0 10px rgba(0, 255, 157, 0.3)' }}>OXYCORP BUNKER</h1>
          <div style={{ color: '#555', fontSize: '1rem' }}>OPERATOR: <span style={{ color: '#888' }}>{profile.username}</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#FFA500', fontSize: '1.3rem', textShadow: '0 0 5px rgba(255, 165, 0, 0.3)' }}>[CREDITS: ₡{Number(profile.credits).toLocaleString('en-US')}]</div>
          <div style={{ color: '#00F3FF', textShadow: '0 0 5px rgba(0, 243, 255, 0.3)' }}>[BUNKER LVL {profile.bunkerLevel}]</div>
        </div>
      </div>

      {/* Direct Widgets */}
      <SkillsWidget onSkillUnlock={fetchProfile} />
      <MiningWidget selectedSector={null} currentUserId={userId} />
      <RefiningWidget />
      <DirectivesWidget />
      <FacilitiesWidget onUpgrade={fetchProfile} />
      <MarketWidget />

      <button
        onClick={() => window.location.href = '/bunker'}
        style={{
          marginTop: 40,
          background: '#00FF9D',
          border: 'none',
          color: 'black',
          padding: '15px 30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        🌐 ENTER BUNKER (3D MODE)
      </button>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 40,
          background: 'transparent',
          border: '1px solid #666',
          color: '#666',
          padding: '10px 20px',
          cursor: 'pointer',
        }}
      >
        LOGOUT
      </button>
    </div>
  );
}

// Helper component for terminal access buttons
function TerminalButton({
  title,
  subtitle,
  color,
  onClick,
}: {
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#161616',
        border: `1px solid ${color}50`,
        padding: 25,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color + '15';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 15px ${color}30, inset 0 0 30px ${color}08`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#161616';
        e.currentTarget.style.borderColor = color + '50';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        color,
        fontSize: '1.2rem',
        marginBottom: 8,
        letterSpacing: '0.15em',
        textShadow: `0 0 5px ${color}40`,
      }}>
        [ {title} ]
      </div>
      <div style={{ color: '#555', fontSize: '0.95rem' }}>
        {subtitle}
      </div>
    </button>
  );
}
