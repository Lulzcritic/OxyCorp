/**
 * Grimdark Progress Bar
 * 
 * ASCII-style progress bar: [####----] with percentage display.
 * Supports different color variants and animated fill.
 */

import '../../styles/grimdark-theme.css';

interface GrimdarkProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  variant?: 'primary' | 'warning' | 'danger';
  showPercentage?: boolean;
  width?: number; // number of ASCII characters for the bar
}

const VARIANT_COLORS = {
  primary: '#00FF9D',
  warning: '#FFA500',
  danger: '#FF0033',
};

export default function GrimdarkProgressBar({
  value,
  max = 100,
  label,
  variant = 'primary',
  showPercentage = true,
  width = 20,
}: GrimdarkProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const color = VARIANT_COLORS[variant];

  const barText = '#'.repeat(filled) + '-'.repeat(empty);

  return (
    <div
      style={{
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        fontSize: '1rem',
        letterSpacing: '0.05em',
      }}
    >
      {label && (
        <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: 4 }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#555' }}>[</span>
        <span
          style={{
            color,
            textShadow: `0 0 5px ${color}40`,
            transition: 'all 0.3s ease',
          }}
        >
          {barText}
        </span>
        <span style={{ color: '#555' }}>]</span>
        {showPercentage && (
          <span style={{ color, fontSize: '0.9rem', minWidth: 45, textAlign: 'right' }}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}
