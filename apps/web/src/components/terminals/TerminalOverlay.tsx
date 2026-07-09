/**
 * Terminal Overlay
 * 
 * Full-screen modal system for displaying terminal UIs.
 * Renders above 3D canvas with CRT power-on animation.
 */

import { useEffect } from 'react';
import { useTerminalStore } from '../../services/TerminalManager';
import Dashboard from '../Dashboard';

export default function TerminalOverlay() {
  const { isOpen, closeTerminal } = useTerminalStore();

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terminal OS Interface"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          closeTerminal();
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <style>
        {`
          @keyframes crtPowerOn {
            0% {
              transform: scaleY(0.005) scaleX(0.3);
              opacity: 1;
            }
            30% {
              transform: scaleY(0.005) scaleX(1);
              opacity: 1;
            }
            50% {
              transform: scaleY(0.6) scaleX(1);
              opacity: 1;
            }
            100% {
              transform: scaleY(1) scaleX(1);
              opacity: 1;
            }
          }
        `}
      </style>
      
      <div
        style={{
          width: '95vw',
          height: '95vh',
          maxWidth: '1600px',
          background: '#070708',
          border: '2px solid #00FF9D',
          boxShadow: '0 0 20px rgba(0, 255, 157, 0.15)',
          overflow: 'hidden',
          transform: 'scaleY(0.005) scaleX(0.3)',
          animation: 'crtPowerOn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transformOrigin: 'center center',
        }}
      >
        <Dashboard />
      </div>
    </div>
  );
}

