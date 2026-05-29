import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface AuthUser {
  id: string;
  email: string | null;
  username: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  loginWithDiscord: () => void;
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  getToken: () => string | null;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('refreshToken', data.refreshToken);
    set({
      accessToken: data.accessToken,
      user: data.user,
      isAuthenticated: true,
    });
  },

  register: async (email: string, username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }

    const data = await res.json();
    localStorage.setItem('refreshToken', data.refreshToken);
    set({
      accessToken: data.accessToken,
      user: data.user,
      isAuthenticated: true,
    });
  },

  loginWithDiscord: () => {
    window.location.href = `${API_BASE}/auth/discord`;
  },

  handleOAuthCallback: async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('refreshToken', refreshToken);

    // Fetch user profile with the access token
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const user = await res.json();
      set({
        accessToken,
        user: { id: user.id, email: user.email, username: user.username },
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    const token = get().accessToken;
    if (token) {
      // Best-effort logout on server
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('refreshToken');
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        localStorage.removeItem('refreshToken');
        set({ accessToken: null, user: null, isAuthenticated: false });
        return false;
      }

      const data = await res.json();
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ accessToken: data.accessToken });
      return true;
    } catch {
      return false;
    }
  },

  getToken: () => {
    return get().accessToken;
  },

  initialize: async () => {
    set({ isLoading: true });

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    // Attempt silent refresh
    const refreshed = await get().refresh();
    if (refreshed) {
      // Fetch user profile
      const token = get().accessToken;
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const user = await res.json();
            set({
              user: { id: user.id, email: user.email, username: user.username },
              isAuthenticated: true,
            });
          }
        } catch {
          // Couldn't fetch profile, still authenticated
        }
      }
    }

    set({ isLoading: false });
  },
}));
