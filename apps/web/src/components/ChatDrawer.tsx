
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import '../styles/grimdark-theme.css';

export default function ChatDrawer() {
  const { isConnected, messages, sendMessage } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (isOpen) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnread(0);
    } else {
        if (messages.length > 0) setUnread(prev => prev + 1);
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div style={{
        position: 'fixed',
        bottom: 0,
        right: 20,
        width: 300,
        background: '#0A0A0A',
        border: '1px solid #2A2A2A',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
            padding: '8px 12px',
            background: '#0E0E0E',
            color: '#00CC66',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: isOpen ? '1px solid #2A2A2A' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ letterSpacing: '0.15em', fontSize: '1rem' }}>[ COMMS-LINK ]</span>
            <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isConnected ? '#00FF9D' : '#CC0000',
                boxShadow: isConnected ? '0 0 6px #00FF9D' : '0 0 6px #CC0000',
            }} />
        </div>
        {unread > 0 && !isOpen && (
            <div style={{
                background: '#CC0000',
                color: 'white',
                padding: '1px 6px',
                fontSize: '0.85rem',
            }}>
                {unread}
            </div>
        )}
      </div>

      {/* Body */}
      {isOpen && (
        <div style={{ height: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                {messages.length === 0 && (
                  <div style={{ color: '#444', fontSize: '0.95rem' }}>
                    &gt; No signals...
                  </div>
                )}
                
                {messages.map((m, i) => (
                    <div key={i} style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                        <span style={{ color: '#444', fontSize: '0.85rem', marginRight: 4 }}>
                            [{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]
                        </span>
                        <span style={{ color: '#FFA500' }}>{m.sender}: </span>
                        <span style={{ color: '#888' }}>{m.content}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ borderTop: '1px solid #2A2A2A', display: 'flex' }}>
                <span style={{
                  color: '#00CC66',
                  padding: '8px 0 8px 10px',
                  fontSize: '1rem',
                }}>
                  &gt;
                </span>
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Transmit..."
                    style={{
                        flex: 1,
                        background: 'transparent',
                        color: '#888',
                        border: 'none',
                        padding: '8px',
                        outline: 'none',
                        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
                        fontSize: '1rem',
                    }}
                />
                <button 
                    type="submit"
                    disabled={!isConnected}
                    style={{
                        background: 'transparent',
                        color: '#00CC66',
                        border: 'none',
                        borderLeft: '1px solid #2A2A2A',
                        padding: '0 12px',
                        cursor: isConnected ? 'pointer' : 'not-allowed',
                        fontFamily: "var(--gd-font-primary, 'VT323', monospace)",
                        fontSize: '1rem',
                        letterSpacing: '0.1em',
                    }}
                >
                    TX
                </button>
            </form>
        </div>
      )}
    </div>
  );
}
