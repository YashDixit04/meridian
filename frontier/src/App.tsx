import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TourProvider } from '@reactour/tour';
import { CartProvider } from '@/context/CartContext';
import { authService } from '@/services/authService';
import {
  extractTenantIdFromPath,
  extractVendorIdFromPath,
  pathToLegacyTab,
  resolveNavigationTarget,
} from '@/lib/appRouting';
import { useTheme } from '@/hooks/useTheme';
import { useAuthGate } from '@/hooks/useAuthGate';
import { tourSteps } from '@/react-tour/json/tourSteps';
import { tourStyles } from '@/react-tour/tourStyles';
import { TourController } from '@/react-tour/TourController';
import { TourNavigation } from '@/react-tour/TourCustomComponents';
import AppShell from '@/components/layout/AppShell';
import { RouteRenderer } from '@/routes/RouteRenderer';
import LoginSignup from '@/pages/Auth/LoginSignup';
import VendorRegistrationPage from '@/pages/Auth/VendorRegistrationPage';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Theme ─────────────────────────────────────────────────────────────────
  const { isDarkMode, toggleTheme } = useTheme();

  // ── Routing context ───────────────────────────────────────────────────────
  const session = authService.getSession();
  const activeTab = useMemo(
    () => pathToLegacyTab(location.pathname, session?.tenantId),
    [location.pathname, session?.tenantId],
  );
  const tabBase = activeTab.split('_')[0];
  const tabParam = activeTab.split('_')[1];
  const routeTenantId = extractTenantIdFromPath(location.pathname);
  const routeVendorId = extractVendorIdFromPath(location.pathname, session?.tenantId);
  const navigationTenantId = tabParam || routeTenantId || session?.tenantId || '';

  // ── Auth gate (session check + redirect effects) ──────────────────────────
  const { isAuthenticated, isAuthChecked, handleLoginSuccess, handleLogout } =
    useAuthGate(activeTab);

  // ── Navigation handler ────────────────────────────────────────────────────
  const handleNavigate = (tabOrUrl: string) => {
    const nextPath = resolveNavigationTarget(tabOrUrl, {
      sessionTenantId: session?.tenantId,
      currentTenantId: navigationTenantId,
    });

    if (nextPath !== location.pathname) {
      navigate(nextPath);
    }
  };

  // ── Loading splash ────────────────────────────────────────────────────────
  if (!isAuthChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-grey-50 dark:bg-grey-50">
        <div className="text-grey-400">Loading...</div>
      </div>
    );
  }

  // ── Unauthenticated screens ───────────────────────────────────────────────
  if (!isAuthenticated) {
    if (location.pathname === '/vendor-register') {
      return (
        <VendorRegistrationPage
          onBackToLogin={() => navigate('/', { replace: true })}
        />
      );
    }

    return (
      <LoginSignup
        onLoginSuccess={handleLoginSuccess}
        onRegisterVendor={() => navigate('/vendor-register')}
      />
    );
  }

  // ── Authenticated app shell ───────────────────────────────────────────────
  return (
    <TourProvider
      steps={tourSteps}
      styles={tourStyles}
      components={{ Navigation: TourNavigation }}
    >
      <CartProvider>
        <TourController />
        <AppShell
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={tabBase}
          pathname={location.pathname}
        >
          <RouteRenderer
            tabBase={tabBase}
            tabParam={tabParam}
            routeVendorId={routeVendorId}
            onNavigate={handleNavigate}
          />
        </AppShell>
      </CartProvider>
    </TourProvider>
  );
};

export default App;
