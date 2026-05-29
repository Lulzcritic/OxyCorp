/**
 * Grimdark Card
 * 
 * Bordered terminal panel with optional scanlines, title, and status indicator.
 */

import type { ReactNode } from 'react';
import '../../styles/grimdark-theme.css';

interface GrimdarkCardProps {
  title?: string;
  status?: 'online' | 'offline' | 'warning';
  children: ReactNode;
  scanlines?: boolean;
  style?: React.CSSProperties;
}

const STATUS_COLORS = {
  online: '#00FF9D',
  offline: '#CC0000',
  warning: '#FFA500',
};

const STATUS_LABELS = {
  online: 'ONLINE',
  offline: 'OFFLINE',
  warning: 'WARNING',
};

export default function GrimdarkCard({
  title,
  status,
  children,
  scanlines = false,
  style,
}: GrimdarkCardProps) {
  return (
    <div
      className={scanlines ? 'crt-scanlines' : ''}
      style={{
        background: '#161616',
        border: '1px solid #2A2A2A',
        position: 'relative',
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        ...style,
      }}
    >
      {/* Card Header */}
      {(title || status) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 15px',
            borderBottom: '1px solid #2A2A2A',
            background: '#0E0E0E',
          }}
        >
          {title && (
            <div
              style={{
                color: '#00CC66',
                fontSize: '0.95rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textShadow: '0 0 5px rgba(0, 255, 157, 0.3)',
              }}
            >
              [ {title} ]
            </div>
          )}
          {status && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: STATUS_COLORS[status],
                  boxShadow: `0 0 6px ${STATUS_COLORS[status]}`,
                  animation: status === 'online' ? 'pulse-glow 2s infinite' : undefined,
                }}
              />
              <span style={{ color: STATUS_COLORS[status] }}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div style={{ padding: 15 }}>
        {children}
      </div>

      {/* Corner decorations */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderTop: '2px solid #00CC66',
          borderLeft: '2px solid #00CC66',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 8,
          height: 8,
          borderTop: '2px solid #00CC66',
          borderRight: '2px solid #00CC66',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 8,
          height: 8,
          borderBottom: '2px solid #00CC66',
          borderLeft: '2px solid #00CC66',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 8,
          height: 8,
          borderBottom: '2px solid #00CC66',
          borderRight: '2px solid #00CC66',
        }}
      />
    </div>
  );
}
