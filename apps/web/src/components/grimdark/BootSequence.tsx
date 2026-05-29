/**
 * Boot Sequence Animation
 * 
 * ASCII-style terminal boot animation shown on first terminal access.
 * Plays for ~2 seconds with sequential line reveals. Skippable with any key.
 * Uses localStorage to only play once per terminal per session.
 */

import { useState, useEffect, useCallback } from 'react';
import '../../styles/grimdark-theme.css';

interface BootSequenceProps {
  terminalId: string;
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> INITIALIZING TERMINAL...', delay: 0 },
  { text: '> LOADING SYSTEM PROTOCOLS...', delay: 400 },
  { text: '> VERIFYING NEURAL LINK...', delay: 800 },
  { text: '> SECURITY CLEARANCE: GRANTED', delay: 1200 },
  { text: '> ACCESS GRANTED', delay: 1600 },
];

const TOTAL_DURATION = 2000;

export default function BootSequence({ terminalId, onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [skipped, setSkipped] = useState(false);

  // Check if already booted this session
  const storageKey = `boot_${terminalId}`;
  const alreadyBooted = typeof window !== 'undefined' && sessionStorage.getItem(storageKey);

  const finish = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, 'true');
    }
    onComplete();
  }, [storageKey, onComplete]);

  // Skip on first render if already booted
  useEffect(() => {
    if (alreadyBooted) {
      finish();
    }
  }, [alreadyBooted, finish]);

  // Reveal lines sequentially
  useEffect(() => {
    if (alreadyBooted || skipped) return;

    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );

    const completeTimer = setTimeout(finish, TOTAL_DURATION);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [alreadyBooted, skipped, finish]);

  // Skip with any key
  useEffect(() => {
    if (alreadyBooted) return;

    const handleKey = () => {
      setSkipped(true);
      finish();
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleKey);
    };
  }, [alreadyBooted, finish]);

  if (alreadyBooted || skipped) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        fontSize: '1.3rem',
        letterSpacing: '0.1em',
      }}
      className="crt-scanlines"
    >
      <div style={{ maxWidth: 500, width: '100%', padding: '0 40px' }}>
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            style={{
              color: i === BOOT_LINES.length - 1 ? '#00FF9D' : '#00CC66',
              marginBottom: 8,
              textShadow: '0 0 5px rgba(0, 255, 157, 0.4)',
              animation: 'boot-line 0.3s ease-out',
              fontWeight: i === BOOT_LINES.length - 1 ? 'bold' : 'normal',
            }}
          >
            {line.text}
          </div>
        ))}

        {/* Blinking cursor */}
        {visibleLines < BOOT_LINES.length && (
          <span
            style={{
              color: '#00FF9D',
              animation: 'cursor-blink 1s infinite',
            }}
          >
            █
          </span>
        )}
      </div>

      {/* Skip hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          color: '#555',
          fontSize: '0.9rem',
          fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
        }}
      >
        PRESS ANY KEY TO SKIP
      </div>
    </div>
  );
}
