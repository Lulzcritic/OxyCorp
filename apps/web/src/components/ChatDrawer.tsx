
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';

export default function ChatDrawer() {
  const { isConnected, messages, sendMessage } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [unread, setUnread] = useState(0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnread(0);
    } else {
        // Simple unread logic (if messages change while closed, inc unread? 
        // Logic roughly: if last message timestamp > lastOpenedTimestamp... simplified for now)
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
        background: '#111',
        border: '1px solid #333',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        zIndex: 1000
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
            padding: '10px 15px',
            background: '#222',
            color: '#00FF9D',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '8px 8px 0 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>COMMS-LINK</span>
            <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isConnected ? '#00FF9D' : '#FF0055'
            }} />
        </div>
        {unread > 0 && !isOpen && (
            <div style={{
                background: '#FF0055', color: 'white',
                borderRadius: '50%', padding: '2px 6px',
                fontSize: '0.7rem'
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
                gap: 8
            }}>
                {messages.length === 0 && <div style={{ color: '#555', fontStyle: 'italic' }}>No signals...</div>}
                
                {messages.map((m, i) => (
                    <div key={i} style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: '#888', fontSize: '0.7rem', marginRight: 5 }}>
                            [{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]
                        </span>
                        <span style={{ color: '#00FF9D', fontWeight: 'bold' }}>{m.sender}: </span>
                        <span style={{ color: '#ccc' }}>{m.content}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ borderTop: '1px solid #333', display: 'flex' }}>
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Transmit..."
                    style={{
                        flex: 1,
                        background: '#000',
                        color: 'white',
                        border: 'none',
                        padding: 10,
                        outline: 'none'
                    }}
                />
                <button 
                    type="submit"
                    disabled={!isConnected}
                    style={{
                        background: '#333',
                        color: '#00FF9D',
                        border: 'none',
                        padding: '0 15px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    SEND
                </button>
            </form>
        </div>
      )}
    </div>
  );
}
