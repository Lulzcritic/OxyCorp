/**
 * Market Terminal
 * 
 * Terminal wrapper for trading and commerce systems.
 */

import { useState, useEffect } from 'react';
import TerminalContainer from '../TerminalContainer';
import MarketWidget from '../../MarketWidget';
import { apiFetch } from '../../../lib/api';
import { TerminalType } from '../../../types/terminal';

interface UserProfile {
  inventory: Array<{
    id: string;
    item: string;
    quantity: string;
  }>;
}

export default function MarketTerminal() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {


      const res = await apiFetch('/user/profile', {
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <TerminalContainer
      terminalType={TerminalType.MARKET}
      title="LOGISTICS & TRADE"
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Market Widget includes sell functionality */}
        <MarketWidget inventory={profile?.inventory || []} onListingCreated={fetchProfile} />
      </div>
    </TerminalContainer>
  );
}
