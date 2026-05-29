/**
 * Grimdark Input
 * 
 * Terminal-style text input with blinking cursor and prompt prefix.
 */

import type { InputHTMLAttributes } from 'react';
import '../../styles/grimdark-theme.css';

interface GrimdarkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prompt?: string;
  error?: string;
}

export default function GrimdarkInput({
  label,
  prompt = '>',
  error,
  style,
  ...props
}: GrimdarkInputProps) {
  return (
    <div style={{ fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
      {label && (
        <div
          style={{
            color: '#888',
            fontSize: '0.85rem',
            marginBottom: 6,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#0A0A0A',
          border: error ? '1px solid #CC0000' : '1px solid #2A2A2A',
          padding: '0 12px',
          transition: 'border-color 0.2s',
        }}
      >
        <span
          style={{
            color: error ? '#CC0000' : '#00CC66',
            marginRight: 8,
            fontSize: '1.1rem',
            flexShrink: 0,
          }}
        >
          {prompt}
        </span>
        <input
          {...props}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#00FF9D',
            fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
            fontSize: '1rem',
            letterSpacing: '0.1em',
            padding: '10px 0',
            width: '100%',
            caretColor: '#00FF9D',
            ...style,
          }}
        />
      </div>
      {error && (
        <div
          style={{
            color: '#CC0000',
            fontSize: '0.85rem',
            marginTop: 4,
            textShadow: '0 0 5px rgba(204, 0, 0, 0.3)',
          }}
        >
          ERROR: {error}
        </div>
      )}
    </div>
  );
}
