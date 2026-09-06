import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { canAccessPage, getAccessiblePages } from '@/utils/rbac';
import {
  getAccessPageForLegacyTab,
  getDefaultPathForAccessPages,
  initializeRoutingManifest,
} from '@/lib/appRouting';

/**
 * Handles the two auth-related side-effects that previously lived in App.tsx:
 *  1. On mount: check localStorage for an existing session; redirect to default page
 *     if authenticated, or stay on the login screen.
 *  2. On navigation: if the user tries to visit a tab they cannot access, bounce
 *     them back to their default landing page.
 *
 * Returns handlers and state so App.tsx can decide what to render.
 */
export function useAuthGate(activeTab: string) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

  // ── Effect 1: initial auth check ─────────────────────────────────────────
  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsAuthChecked(true);

    if (authenticated) {
      void initializeRoutingManifest();
    }
  }, []);

  // ── Effect 2: redirect if current tab is forbidden ────────────────────────
  useEffect(() => {
    if (!isAuthChecked || !isAuthenticated) return;

    const session = authService.getSession();
    const accessiblePages = getAccessiblePages();
    const defaultPath = getDefaultPathForAccessPages(accessiblePages, session?.tenantId);

    if (location.pathname === '/') {
      navigate(defaultPath, { replace: true });
      return;
    }

    const accessPage = getAccessPageForLegacyTab(activeTab);
    if (accessPage && !canAccessPage(accessPage) && accessiblePages.length > 0) {
      if (location.pathname !== defaultPath) {
        navigate(defaultPath, { replace: true });
      }
    }
  }, [isAuthChecked, isAuthenticated, location.pathname, activeTab, navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    void initializeRoutingManifest();
    const loggedInSession = authService.getSession();
    const defaultPath = getDefaultPathForAccessPages(
      getAccessiblePages(),
      loggedInSession?.tenantId,
    );
    navigate(defaultPath, { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/dashboard', { replace: true });
  };

  return { isAuthenticated, isAuthChecked, handleLoginSuccess, handleLogout };
}
