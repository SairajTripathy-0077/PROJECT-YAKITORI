import { auth } from '../config/firebase';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }
  return ''; // Use relative path in dev and prod (proxied by Vite dev server or Vercel)
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Firebase ID token as a Bearer token.
 * 
 * @param endpoint - API path (e.g. '/api/auth/sync')
 * @param options  - Standard fetch options (method, body, etc.)
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const user = auth.currentUser;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach Firebase ID token if user is authenticated
  if (user) {
    try {
      const token = await user.getIdToken(/* forceRefresh */ false);
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.warn('[API] Failed to get Firebase ID token:', err);
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(
      json.message || `Request failed with status ${response.status}`,
      response.status,
      json.error || 'UNKNOWN_ERROR'
    );
  }

  return json;
}

/**
 * Typed API error with status code and error code.
 */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Convenience methods ────────────────────────────────────────

export const api = {
  get: <T = unknown>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};
