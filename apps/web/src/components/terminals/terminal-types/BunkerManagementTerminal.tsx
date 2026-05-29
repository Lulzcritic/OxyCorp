/**
 * Bunker Management Terminal
 * 
 * Terminal wrapper for facilities and infrastructure management.
 */

import { useState, useEffect } from 'react';
import TerminalContainer from '../TerminalContainer';
import FacilitiesWidget from '../../FacilitiesWidget';
import StorageWidget from '../widgets/StorageWidget';
import EquipmentWidget from '../widgets/EquipmentWidget';
import { apiFetch } from '../../../lib/api';
import { TerminalType } from '../../../types/terminal';

interface UserProfile {
  credits: number;
  bunkerLevel: number;
  username: string;
  equipment: Record<string, string>;
  inventory: Array<{
    id: string;
    item: string;
    quantity: string;
  }>;
}

export default function BunkerManagementTerminal() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'storage' | 'equipment'>('infrastructure');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!session) return;

      const res = await apiFetch('/user/profile', {
      });

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

  return (
    <TerminalContainer
      terminalType={TerminalType.BUNKER_MANAGEMENT}
      title="BUNKER OPERATIONS"
    >
      {/* Bunker Stats Header */}
      {profile && (
        <div
          style={{
            padding: 20,
            marginBottom: 20,
            background: '#0A0A0A',
            border: '1px solid #00FF9D',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>OPERATOR</div>
            <div style={{ color: '#00FF9D', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {profile.username}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>BUNKER LEVEL</div>
            <div style={{ color: '#00F3FF', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {profile.bunkerLevel}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>CREDITS</div>
            <div style={{ color: '#FFD700', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {profile.credits.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {(['infrastructure', 'storage', 'equipment'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab ? '#00FF9D' : '#111',
              color: activeTab === tab ? '#000' : '#00FF9D',
              border: '1px solid #00FF9D',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              flex: 1
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'infrastructure' && <FacilitiesWidget onUpgrade={fetchProfile} inventory={profile?.inventory} />}
      {activeTab === 'storage' && profile && <StorageWidget inventory={profile.inventory} />}
      {activeTab === 'equipment' && profile && (
        <EquipmentWidget 
          equipment={profile.equipment} 
          inventory={profile.inventory} 
          onRefresh={fetchProfile} 
        />
      )}

    </TerminalContainer>
  );
}
