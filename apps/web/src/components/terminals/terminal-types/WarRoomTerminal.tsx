import { useEffect, useState } from 'react';
import TerminalContainer from '../TerminalContainer';
import { TerminalType } from '../../../types/terminal';
import LogicEditorWidget from '../widgets/LogicEditorWidget';
import { apiFetch } from '../../../lib/api';

export default function WarRoomTerminal() {
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'swarm' | 'logic'>('swarm');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/user/profile');
        if (res.ok) {
          const data = await res.json();
          setSpecialization(data.specialization);
        }
      } catch (err) {
        console.error('Failed to load user profile for tactical terminal:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <TerminalContainer
      terminalType={TerminalType.WAR_ROOM}
      title="TACTICAL COMMAND"
    >
      {loading ? (
        <div style={{ color: '#00FF9D', padding: 40, textAlign: 'center' }}>
          LOADING SECURE COMPILING ENVIRONMENT...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#080808' }}>
            <button
              onClick={() => setActiveTab('swarm')}
              style={{
                flex: 1,
                padding: '10px 15px',
                background: activeTab === 'swarm' ? '#111' : 'transparent',
                color: activeTab === 'swarm' ? '#00FF9D' : '#555',
                border: 'none',
                borderBottom: activeTab === 'swarm' ? '2px solid #00FF9D' : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              [SWARM POSITIONING]
            </button>
            <button
              onClick={() => setActiveTab('logic')}
              style={{
                flex: 1,
                padding: '10px 15px',
                background: activeTab === 'logic' ? '#111' : 'transparent',
                color: activeTab === 'logic' ? (specialization === 'FORGE' ? '#00FF9D' : '#FF0055') : '#555',
                border: 'none',
                borderBottom: activeTab === 'logic' ? `2px solid ${specialization === 'FORGE' ? '#00FF9D' : '#FF0055'}` : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              {specialization === 'FORGE' ? '[LOGIC COMPILER]' : '[🔒 LOGIC COMPILER]'}
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'swarm' ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ color: '#FF0055', fontSize: '1.5rem', marginBottom: 20 }}>
                  ⚔ COMBAT OPERATIONS
                </div>
                <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 40 }}>
                  Full tactical interface available at dedicated War Room terminal
                </div>
                <a
                  href="/war-room"
                  style={{
                    display: 'inline-block',
                    background: '#FF0055',
                    color: 'white',
                    padding: '15px 30px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ENTER WAR ROOM SCREEN →
                </a>
              </div>
            ) : specialization === 'FORGE' ? (
              <div style={{ height: '500px' }}>
                <LogicEditorWidget />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ color: '#FF0055', fontSize: '1.5rem', marginBottom: 20 }}>
                  ⚔ ACCESS RESTRICTED
                </div>
                <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                  UNAUTHORIZED ENCRYPTED COMPILING MODULE.<br/>
                  Access to the RISK-16 Logic Compiler is restricted to the Corpse-Fuelled Forge class.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </TerminalContainer>
  );
}
