/**
 * Grimdark Button
 * 
 * Retro terminal-style button with bracket decoration.
 * Variants: primary (green), warning (amber), danger (red).
 */

import type { ButtonHTMLAttributes } from 'react';
import '../../styles/grimdark-theme.css';

interface GrimdarkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_STYLES = {
  primary: {
    color: '#00FF9D',
    border: '1px solid #00CC66',
    hoverBg: '#00CC66',
    hoverColor: '#0A0A0A',
    glow: '0 0 10px rgba(0, 255, 157, 0.3)',
  },
  warning: {
    color: '#FFA500',
    border: '1px solid #CC8400',
    hoverBg: '#FFA500',
    hoverColor: '#0A0A0A',
    glow: '0 0 10px rgba(255, 165, 0, 0.3)',
  },
  danger: {
    color: '#FF0033',
    border: '1px solid #CC0000',
    hoverBg: '#CC0000',
    hoverColor: '#FFFFFF',
    glow: '0 0 10px rgba(204, 0, 0, 0.3)',
  },
};

const SIZE_STYLES = {
  sm: { padding: '6px 12px', fontSize: '0.85rem' },
  md: { padding: '10px 20px', fontSize: '1rem' },
  lg: { padding: '14px 28px', fontSize: '1.2rem' },
};

export default function GrimdarkButton({
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  style,
  ...props
}: GrimdarkButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        background: 'transparent',
        color: disabled ? '#555' : v.color,
        border: disabled ? '1px solid #333' : v.border,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        fontWeight: 'bold',
        letterSpacing: '0.15em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textTransform: 'uppercase',
        transition: 'all 0.15s ease',
        textShadow: disabled ? 'none' : v.glow,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = v.hoverBg;
          e.currentTarget.style.color = v.hoverColor;
          e.currentTarget.style.boxShadow = v.glow;
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = v.color;
          e.currentTarget.style.boxShadow = 'none';
        }
        props.onMouseLeave?.(e);
      }}
    >
      [&gt;&gt;&gt; {children} &lt;&lt;&lt;]
    </button>
  );
}
