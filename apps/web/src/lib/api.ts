import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the JWT Bearer token and handles 401 refresh.
 * 
 * @param path - API path (e.g. '/user/profile'). Will be prefixed with API_BASE.
 * @param options - Standard RequestInit options.
 * @returns The fetch Response.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = useAuthStore.getState().getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await useAuthStore.getState().refresh();
    if (refreshed) {
      const newToken = useAuthStore.getState().getToken();
      return fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          ...options.headers,
        },
      });
    }
  }

  return res;
}

/**
 * Returns the current access token for non-fetch use cases (e.g. WebSocket headers).
 */
export function getAuthToken(): string | null {
  return useAuthStore.getState().getToken();
}
