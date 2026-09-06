/**
 * API Client — Central HTTP layer for all backend calls.
 *
 * Base URL: http://localhost:3001 (NestJS backend)
 *
 * Features:
 * - Automatically attaches Authorization: Bearer <token>
 * - Parses the standard API envelope { success, statusCode, data }
 * - Throws descriptive errors on failure
 * - Handles token refresh on 401
 */

const BASE_URL = '/api'; // Proxied by Vite to http://localhost:3001

// ─── Token Management ───────────────────────────────────────────────────────
const TOKEN_KEY = 'b2b_access_token';
const REFRESH_KEY = 'b2b_refresh_token';

export const tokenStore = {
  getAccess: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string): void => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Standard API Envelope ──────────────────────────────────────────────────
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
}

export class ApiException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorMessage: string,
  ) {
    super(errorMessage);
    this.name = 'ApiException';
  }
}

// ─── Core Fetch Wrapper ──────────────────────────────────────────────────────
let isRefreshing = false;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true,
): Promise<T> {
  const token = tokenStore.getAccess();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401: Try refresh token once ─────────────────────────────────────────
  if (res.status === 401 && retry && !isRefreshing) {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const envelope = (await refreshRes.json()) as ApiEnvelope<{
            accessToken: string;
            refreshToken: string;
          }>;
          tokenStore.set(envelope.data.accessToken, envelope.data.refreshToken);
          isRefreshing = false;
          return request<T>(method, path, body, false); // retry once
        }
      } catch {
        /* fall through */
      } finally {
        isRefreshing = false;
      }
    }
    // Refresh failed — clear tokens and let the error bubble
    tokenStore.clear();
  }

  if (!res.ok) {
    let errBody: ApiError;
    try {
      errBody = await res.json();
    } catch {
      throw new ApiException(res.status, res.statusText);
    }
    throw new ApiException(
      errBody.statusCode ?? res.status,
      errBody.error ?? 'An unexpected error occurred',
    );
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

// ─── HTTP Verb Shortcuts ─────────────────────────────────────────────────────
export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export default apiClient;
