/**
 * TerminalContainer Base Component
 * 
 * Provides grimdark terminal-themed frame and layout for all terminal types.
 * Includes CRT scanlines, retro header, close button, loading states, and error boundary.
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { useTerminalStore } from '../../services/TerminalManager';
import type { TerminalType } from '../../types/terminal';
import '../../styles/grimdark-theme.css';

interface TerminalContainerProps {
  terminalType: TerminalType;
  title: string;
  children: ReactNode;
  loading?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class TerminalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Terminal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{
            color: '#CC0000',
            fontSize: '1.4rem',
            fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
            textShadow: '0 0 10px rgba(204, 0, 0, 0.5)',
            marginBottom: 10,
          }}>
            ⚠ TERMINAL ERROR
          </div>
          <div style={{
            color: '#888',
            fontSize: '1rem',
            fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
          }}>
            {this.state.error?.message || 'Unknown system failure'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: 20,
              background: 'transparent',
              color: '#00CC66',
              border: '1px solid #00CC66',
              padding: '10px 20px',
              cursor: 'pointer',
              fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
              fontSize: '1rem',
              letterSpacing: '0.15em',
            }}
          >
            [&gt;&gt;&gt; RETRY &lt;&lt;&lt;]
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function TerminalContainer({
  terminalType,
  title,
  children,
  loading = false,
}: TerminalContainerProps) {
  const closeTerminal = useTerminalStore((state) => state.closeTerminal);

  return (
    <div
      className="grimdark crt-scanlines crt-vignette"
      style={{
        width: '100%',
        height: '100vh',
        background: 'var(--gd-bg, #0A0A0A)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
      }}
    >
      {/* Terminal Header */}
      <div
        style={{
          height: 56,
          borderBottom: '1px solid var(--gd-border-active, #00CC66)',
          background: '#0E0E0E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        {/* Left: Terminal ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Status dot */}
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00FF9D',
            boxShadow: '0 0 6px #00FF9D',
            animation: 'pulse-glow 2s infinite',
          }} />
          <div style={{
            color: 'var(--gd-primary-bright, #00FF9D)',
            fontSize: '1.2rem',
            letterSpacing: '0.15em',
            textShadow: '0 0 5px rgba(0, 255, 157, 0.4)',
          }}>
            [ {title} ]
          </div>
        </div>

        {/* Right: Close */}
        <button
          onClick={closeTerminal}
          style={{
            background: 'transparent',
            border: '1px solid #CC0000',
            color: '#CC0000',
            padding: '6px 16px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
            letterSpacing: '0.15em',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#CC0000';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(204, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#CC0000';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          [X] DISCONNECT
        </button>
      </div>

      {/* Terminal Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 20,
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{
              color: '#00CC66',
              fontSize: '1.3rem',
              textShadow: '0 0 5px rgba(0, 255, 157, 0.4)',
              marginBottom: 8,
            }}>
              &gt; INITIALIZING TERMINAL...
            </div>
            <div style={{
              color: '#555',
              fontSize: '1rem',
            }} className="cursor-blink">
              LOADING SYSTEM DATA
            </div>
          </div>
        ) : (
          <TerminalErrorBoundary>
            {children}
          </TerminalErrorBoundary>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div
        style={{
          height: 28,
          borderTop: '1px solid #2A2A2A',
          background: '#0E0E0E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 15px',
          fontSize: '0.85rem',
          color: '#555',
          flexShrink: 0,
        }}
      >
        <span>SYS://TERMINAL/{terminalType}</span>
        <span className="text-flicker">SIGNAL: ACTIVE</span>
      </div>
    </div>
  );
}
