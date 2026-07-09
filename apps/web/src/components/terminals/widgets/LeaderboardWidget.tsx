import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuthStore } from '../../../stores/authStore';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: string;
}

export default function LeaderboardWidget() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<'wealth' | 'territory' | 'combat'>('wealth');
  const [seasonsCount, setSeasonsCount] = useState<number>(1);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchSeasons = useCallback(async () => {
    try {
      const res = await apiFetch('/leaderboard/seasons');
      if (res.ok) {
        const data = await res.json();
        setSeasonsCount(data.seasonsCount || 1);
        setSelectedSeason(data.seasonsCount || 1); // Default to current season
      }
    } catch (err) {
      console.error('Failed to load seasons count:', err);
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/leaderboard?category=${category}&season=${selectedSeason}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data || []);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to load rankings.');
      }
    } catch (err) {
      setError('Failed to contact database.');
    } finally {
      setLoading(false);
    }
  }, [category, selectedSeason]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleAdvanceSeason = async () => {
    if (!confirm('Are you sure you want to end the current season and advance to the next? This will snapshot current standings.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/leaderboard/advance-season', {
        method: 'POST',
      });
      if (res.ok) {
        alert('Season advanced successfully!');
        fetchSeasons();
      } else {
        const err = await res.json();
        alert(`Failed to advance season: ${err.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = () => {
    if (category === 'wealth') return 'CREDITS';
    if (category === 'territory') return 'SECTORS';
    return 'WINS';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#00FF9D',
      fontFamily: 'monospace',
      background: '#020202',
      border: '1px solid #142c1e',
      padding: 15,
      boxSizing: 'border-box'
    }}>
      {/* Title / Season Select */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #142c1e',
        paddingBottom: 10,
        marginBottom: 10
      }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          GLOBAL COGITATOR LEADERBOARD
        </span>
        
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#008f57' }}>SEASON:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            style={{
              background: '#090909',
              color: '#00FF9D',
              border: '1px solid #222',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              padding: '2px 8px'
            }}
          >
            {Array.from({ length: seasonsCount }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>

          {/* Admin Override Action */}
          {user?.username === 'test@oxycorp.com' && (
            <button
              onClick={handleAdvanceSeason}
              style={{
                background: '#441111',
                color: '#FF3366',
                border: '1px solid #551111',
                padding: '2px 6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
              title="Developer Season Advance Tool"
            >
              NEXT SEASON ⚡
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 15 }}>
        {(['wealth', 'territory', 'combat'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            style={{
              flex: 1,
              background: category === tab ? '#00FF9D' : '#050505',
              color: category === tab ? 'black' : '#00FF9D',
              border: category === tab ? 'none' : '1px solid #142c1e',
              padding: '8px 5px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #08110b',
        background: '#010101'
      }}>
        {loading ? (
          <div style={{ color: '#008f57', padding: 20, textAlign: 'center' }}>
            SCANNING COGITATOR NETWORKS...
          </div>
        ) : error ? (
          <div style={{ color: '#ff3366', padding: 20, textAlign: 'center' }}>
            {error}
          </div>
        ) : rankings.length === 0 ? (
          <div style={{ color: '#555', padding: 20, textAlign: 'center' }}>
            NO RECORDED STANDINGS IN THIS VECTOR.
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #08110b', color: '#008f57' }}>
                <th style={{ padding: '8px 10px', width: '50px' }}>RANK</th>
                <th style={{ padding: '8px 10px' }}>OPERATOR</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>{getScoreLabel()}</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry) => {
                const isMe = entry.userId === user?.id;
                return (
                  <tr
                    key={entry.userId}
                    style={{
                      borderBottom: '1px solid #08110b',
                      background: isMe ? 'rgba(0, 255, 157, 0.05)' : 'transparent',
                      color: isMe ? '#00FF9D' : '#88aa99',
                      fontWeight: isMe ? 'bold' : 'normal'
                    }}
                  >
                    <td style={{ padding: '8px 10px', color: isMe ? '#00FF9D' : '#008f57' }}>
                      #{entry.rank}
                    </td>
                    <td style={{ padding: '8px 10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {entry.username} {isMe && ' (YOU)'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                      {entry.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}