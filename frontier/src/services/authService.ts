/**
 * Authentication Service — v2 (Backend-connected)
 *
 * Now calls the real NestJS backend at POST /auth/login and POST /auth/refresh.
 * Session is still stored in localStorage for page-reload persistence.
 * Token pair (access + refresh) is managed by apiClient.tokenStore.
 */

import { apiClient, tokenStore, ApiException } from '../lib/apiClient';

export type RoleType = 'superadmin' | 'admin' | 'adminusers' | 'tenantadmin' | 'tenantadmin_subusers';

export interface UserPermissions {
  pages: string[];
  fields: { [componentName: string]: string[] };
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  roleType: RoleType; // kept for UI backward-compatibility
  permissions: UserPermissions;
  loginTimestamp: number;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface BackendUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  roleType: string;
  permissions: any;
}

const SESSION_KEY = 'b2b_user_session';

class AuthService {
  /**
   * Login using the real NestJS backend.
   * Stores access + refresh tokens and creates a session object.
   */
  async login(emailOrUsername: string, password: string): Promise<UserSession | null> {
    try {
      const tokens = await apiClient.post<LoginResponse>('/auth/login', {
        email: emailOrUsername,
        password,
      });

      // Store tokens in localStorage via tokenStore
      tokenStore.set(tokens.accessToken, tokens.refreshToken);

      // Fetch the current user's profile with the fresh token
      const user = await apiClient.get<BackendUser>('/auth/me');

      const session: UserSession = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        roleType: user.roleType as RoleType,
        permissions: user.permissions,
        loginTimestamp: Date.now(),
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (err) {
      if (err instanceof ApiException && err.statusCode === 401) {
        return null; // Invalid credentials
      }
      console.error('Login error:', err);
      throw err;
    }
  }

  logout(): void {
    tokenStore.clear();
    localStorage.removeItem(SESSION_KEY);
  }

  getSession(): UserSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: UserSession = JSON.parse(raw);
      if (!session.email || !session.role) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null && tokenStore.getAccess() !== null;
  }

  hasPageAccess(pageName: string): boolean {
    const session = this.getSession();
    if (!session) return false;
    if (session.roleType === 'superadmin') return true;
    return session.permissions.pages.includes(pageName);
  }

  hasFieldAccess(componentName: string, fieldName: string): boolean {
    const session = this.getSession();
    if (!session) return false;
    if (session.roleType === 'superadmin') return true;
    return session.permissions.fields[componentName]?.includes(fieldName) ?? false;
  }

  getAccessiblePages(): string[] {
    const session = this.getSession();
    if (!session) return [];
    if (session.roleType === 'superadmin') {
      return [
        'dashboard', 'users', 'platformUsers', 'security', 'offers', 'finance',
        'actions', 'integrations', 'userDetails', 'tenantDetails', 'help', 'superadminCatalogue',
        'tenantSubUsers', 'tenantVendors', 'tenantVessels', 'tenantOrders', 'tenantCatalogue',
        'addProduct', 'tenantDocuments', 'tenantActivityLogs', 'addAccount', 'addTenant', 'addVendor', 'cart',
      ];
    }
    return session.permissions.pages;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Create a new platform user account (called from AddAccountPage).
   * Sends all fields — username, password, roleType, permissions — to the backend.
   */
  async signup(data: {
    username: string;
    email: string;
    password: string;
    roleType: RoleType;
    permissions: UserPermissions;
  }): Promise<boolean> {
    const session = this.getSession();
    const tenantId = session?.tenantId || '';
    if (!tenantId) return false;

    try {
      await apiClient.post(`/tenants/${tenantId}/users`, {
        username:    data.username,
        email:       data.email,
        password:    data.password,
        roleType:    data.roleType,
        firstName:   data.username,   // use username as display name
        lastName:    '',
        permissions: data.permissions,
        role:        ['admin'].includes(data.roleType) ? 'ADMIN' : 'USER',
      });
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  }
}

export const authService = new AuthService();
export default authService;
