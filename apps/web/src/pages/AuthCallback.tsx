import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Handles the Discord OAuth callback redirect.
 * Extracts tokens from URL params and stores them in the auth store.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      handleOAuthCallback(accessToken, refreshToken).then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [handleOAuthCallback, navigate]);

  return (
    <div style={{
      background: '#050505',
      color: '#00FF9D',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'VT323', monospace",
    }}>
      &gt; Establishing secure connection...
    </div>
  );
}
