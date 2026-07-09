import React, { useState, useRef, useEffect } from 'react';
import { compile } from 'risk16-vm/compiler';
import { apiFetch } from '../../../lib/api';

export default function LogicEditorWidget() {
  const [code, setCode] = useState<string>(
`// --- TARSIS RISK-16 LOGIC CORE ---
// Variables are declared with the 'sigil' keyword
sigil enemy = getNearestEnemy();

if (enemy != 0) {
  aimAt(enemy);
  fire();
} else {
  // Patrolling logic
  move(10, 10);
}`
  );
  
  const [diagnostics, setDiagnostics] = useState<string>('LOGIC COMPILER STANDBY. READY FOR INPUT.');
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [compiledHex, setCompiledHex] = useState<string>('');
  const [cartridgeName, setCartridgeName] = useState<string>('Strike AI');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync scroll between textarea and pre
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleCompile = () => {
    setDiagnostics('COMMENCING COMPILATION...');
    const res = compile(code);
    
    if (res.success && res.bytecode) {
      setIsSuccess(true);
      setDiagnostics(
        `COMPILATION SUCCESSFUL.\n` +
        `----------------------------------------\n` +
        `Size: ${res.size} Bytes / 2048 Bytes Limit.\n` +
        `Status: AUTHORIZED FOR IN-GAME EXECUTION.`
      );
      
      // Format bytecode as hex string for display
      const hex = Array.from(res.bytecode)
        .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
      setCompiledHex(hex);
    } else {
      setIsSuccess(false);
      setDiagnostics(`COMPILATION FAILED:\nERROR: ${res.error}`);
      setCompiledHex('');
    }
  };

  const handleBurn = async () => {
    if (!cartridgeName.trim()) {
      setIsSuccess(false);
      setDiagnostics('CARTRIDGE NAME CANNOT BE EMPTY.');
      return;
    }

    setDiagnostics('COMMENCING COMPILATION...');
    const compileRes = compile(code);
    if (!compileRes.success || !compileRes.bytecode) {
      setIsSuccess(false);
      setDiagnostics(`COMPILATION FAILED:\nERROR: ${compileRes.error}`);
      return;
    }

    setDiagnostics('COMPILATION SUCCESSFUL. BURNING TO PHYSICAL CARTRIDGE...');
    try {
      const res = await apiFetch('/cartridges/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cartridgeName, code }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setDiagnostics(
          `CARTRIDGE BURNED SUCCESSFULLY!\n` +
          `----------------------------------------\n` +
          `Name: ${cartridgeName}\n` +
          `Size: ${compileRes.size} Bytes\n` +
          `Resource consumed: 1x Blank Cartridge.`
        );
        
        // Format bytecode as hex string for display
        const hex = Array.from(compileRes.bytecode)
          .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
          .join(' ');
        setCompiledHex(hex);

        // Dispatch event to reload inventory HUD
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      } else {
        const err = await res.json();
        setIsSuccess(false);
        setDiagnostics(`BURN TO CARTRIDGE FAILED:\nERROR: ${err.message}`);
        setCompiledHex('');
      }
    } catch (err: any) {
      setIsSuccess(false);
      setDiagnostics(`BURN TO CARTRIDGE FAILED:\nERROR: ${err.message || err}`);
      setCompiledHex('');
    }
  };

  const loadTemplate = (type: 'combat' | 'retreat' | 'patrol') => {
    if (type === 'combat') {
      setCode(
`// Hunter-Seeker combat logic
sigil enemy = getNearestEnemy();
if (enemy != 0) {
  aimAt(enemy);
  fire();
}`
      );
    } else if (type === 'retreat') {
      setCode(
`// Emergency HP recovery logic
sigil hp = getSelfHP();
if (hp < 30) {
  // Move back to sector HQ coordinates
  move(0, 0);
}`
      );
    } else if (type === 'patrol') {
      setCode(
`// Standby patrol loop
sigil enemy = getNearestEnemy();
if (enemy == 0) {
  move(15, 15);
} else {
  aimAt(enemy);
  fire();
}`
      );
    }
    setDiagnostics('TEMPLATE LOADED. AWAITING COMPILATION.');
    setIsSuccess(true);
    setCompiledHex('');
  };

  // Basic syntax highlighter helper
  const highlightCode = (text: string) => {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Keywords
    html = html.replace(/\b(sigil|if|else|while)\b/g, '<span style="color:#00FF9D;font-weight:bold;">$1</span>');
    
    // Functions
    html = html.replace(/\b(move|aimAt|fire|moveToTarget|getNearestEnemy|getSelfHP)\b/g, '<span style="color:#FF0055;font-weight:bold;">$1</span>');
    
    // Numbers
    html = html.replace(/\b(\d+)\b/g, '<span style="color:#FF9D00;">$1</span>');
    
    // Comments
    html = html.replace(/(\/\/.*)/g, '<span style="color:#555555;font-style:italic;">$1</span>');
    
    return { __html: html };
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#030303',
      border: '2px solid #333',
      boxShadow: '0 0 20px rgba(0, 255, 157, 0.05)',
      fontFamily: '"Courier New", Courier, monospace',
      height: '100%',
      color: '#aaa',
      padding: 15,
      boxSizing: 'border-box'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333',
        paddingBottom: 10,
        marginBottom: 15
      }}>
        <div style={{ color: '#00FF9D', fontWeight: 'bold', fontSize: '1.1rem', textShadow: '0 0 5px rgba(0, 255, 157, 0.5)' }}>
          ☢ SIGILSCRIPT COMPILING UNIT // RISK-16
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => loadTemplate('combat')}
            style={btnStyle}
          >
            [COMBAT AI]
          </button>
          <button 
            onClick={() => loadTemplate('retreat')}
            style={btnStyle}
          >
            [RETREAT AI]
          </button>
          <button 
            onClick={() => loadTemplate('patrol')}
            style={btnStyle}
          >
            [PATROL AI]
          </button>
        </div>
      </div>

      {/* Editor & Core Block */}
      <div style={{
        display: 'flex',
        border: '1px solid #222',
        background: '#050505',
        height: 350,
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {/* Line Numbers */}
        <pre style={{
          margin: 0,
          padding: '10px 5px',
          borderRight: '1px solid #222',
          color: '#333',
          textAlign: 'right',
          width: 35,
          fontSize: '14px',
          lineHeight: '20px',
          userSelect: 'none',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {lineNumbers}
        </pre>

        {/* Code area container */}
        <div style={{
          position: 'relative',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* Overlay Highlighted Pre */}
          <pre
            ref={preRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 10,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'var(--gd-font-mono, monospace)',
              letterSpacing: 'normal',
              whiteSpace: 'pre',
              color: '#888',
              overflow: 'hidden',
              boxSizing: 'border-box',
              pointerEvents: 'none',
              background: 'transparent',
              border: 'none',
            }}
            dangerouslySetInnerHTML={highlightCode(code)}
          />

          {/* Transparent Input Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            spellCheck="false"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 10,
              fontSize: '14px',
              lineHeight: '20px',
              fontFamily: 'var(--gd-font-mono, monospace)',
              letterSpacing: 'normal',
              color: 'transparent',
              background: 'transparent',
              caretColor: '#00FF9D',
              border: 'none',
              outline: 'none',
              resize: 'none',
              whiteSpace: 'pre',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          />
        </div>
      </div>

      {/* Buttons and Naming Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '15px 0' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCompile}
            style={{
              flex: 1,
              background: '#00FF9D',
              color: 'black',
              border: 'none',
              padding: '12px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 0 10px rgba(0, 255, 157, 0.2)'
            }}
          >
            COMPILE SCRIPT →
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            value={cartridgeName}
            onChange={(e) => setCartridgeName(e.target.value)}
            placeholder="Cartridge Label (e.g. Hunter AI v1)..."
            style={{
              flex: 1,
              background: '#090909',
              border: '1px solid #333',
              color: '#00FF9D',
              padding: '10px 15px',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleBurn}
            style={{
              background: '#FF0055',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 0 10px rgba(255, 0, 85, 0.2)'
            }}
          >
            BURN TO CARTRIDGE ⚡
          </button>
        </div>
      </div>

      {/* Diagnostics Panel */}
      <div style={{
        background: '#090909',
        border: '1px solid #222',
        padding: 12,
        maxHeight: 180,
        overflowY: 'auto',
        fontSize: '0.9rem',
        boxSizing: 'border-box'
      }}>
        <div style={{
          color: isSuccess ? '#00FF9D' : '#FF0055',
          fontWeight: 'bold',
          marginBottom: 8
        }}>
          [{isSuccess ? 'SYS_OK' : 'SYS_ERR'}] DIAGNOSTICS:
        </div>
        <pre style={{
          margin: 0,
          color: isSuccess ? '#888' : '#FF5555',
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap'
        }}>
          {diagnostics}
        </pre>

        {compiledHex && (
          <div style={{ marginTop: 12, borderTop: '1px solid #1a1a1a', paddingTop: 8 }}>
            <div style={{ color: '#555', fontWeight: 'bold', marginBottom: 4 }}>COMPILED BYTECODE (HEX):</div>
            <code style={{ color: '#888', wordBreak: 'break-all', fontSize: '0.85rem' }}>{compiledHex}</code>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle = {
  background: '#111',
  color: '#888',
  border: '1px solid #222',
  padding: '6px 12px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontFamily: 'inherit'
};
