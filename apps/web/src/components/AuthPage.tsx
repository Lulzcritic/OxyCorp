import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithDiscord } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, username, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#050505',
      fontFamily: "'VT323', monospace",
    }}>
      <div style={{
        width: '420px',
        padding: '30px',
        border: '1px solid #1a1a1a',
        background: '#0a0a0a',
        boxShadow: '0 0 30px rgba(0, 255, 157, 0.05), inset 0 0 60px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <h2 style={{
          color: '#00FF9D',
          textAlign: 'center',
          fontSize: '1.8rem',
          letterSpacing: '0.2em',
          margin: '0 0 5px 0',
          textShadow: '0 0 10px rgba(0, 255, 157, 0.3)',
        }}>
          MOLOCH PROTOCOL
        </h2>
        <div style={{
          color: '#333',
          textAlign: 'center',
          fontSize: '0.9rem',
          marginBottom: '25px',
          letterSpacing: '0.1em',
        }}>
          {isRegister ? '[ NEW OPERATOR REGISTRATION ]' : '[ OPERATOR AUTHENTICATION ]'}
        </div>

        {/* Error display */}
        {error && (
          <div style={{
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            color: '#FF0055',
            padding: '10px',
            marginBottom: '15px',
            fontSize: '0.9rem',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#555', fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                background: '#111',
                border: '1px solid #222',
                color: '#00FF9D',
                fontFamily: "'VT323', monospace",
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00FF9D'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#222'}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#555', fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>
                CALLSIGN
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#111',
                  border: '1px solid #222',
                  color: '#00FF9D',
                  fontFamily: "'VT323', monospace",
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00FF9D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#222'}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#555', fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '10px',
                background: '#111',
                border: '1px solid #222',
                color: '#00FF9D',
                fontFamily: "'VT323', monospace",
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00FF9D'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#222'}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#1a1a1a' : '#00FF9D',
              border: 'none',
              color: loading ? '#555' : '#000',
              fontFamily: "'VT323', monospace",
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'wait' : 'pointer',
              letterSpacing: '0.15em',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '> PROCESSING...' : isRegister ? '> REGISTER OPERATOR' : '> AUTHENTICATE'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
          color: '#333',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#222' }} />
          <span style={{ margin: '0 10px', fontSize: '0.8rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#222' }} />
        </div>

        {/* Discord OAuth */}
        <button
          onClick={loginWithDiscord}
          style={{
            width: '100%',
            padding: '12px',
            background: '#5865F2',
            border: 'none',
            color: '#fff',
            fontFamily: "'VT323', monospace",
            fontSize: '1.1rem',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4752C4'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#5865F2'}
        >
          SIGN IN WITH DISCORD
        </button>

        {/* Toggle register/login */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          color: '#555',
          fontSize: '0.9rem',
        }}>
          {isRegister ? 'Already registered?' : 'New operator?'}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00FF9D',
              cursor: 'pointer',
              fontFamily: "'VT323', monospace",
              fontSize: '0.9rem',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'AUTHENTICATE' : 'REGISTER'}
          </button>
        </div>
      </div>
    </div>
  );
}
