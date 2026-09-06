/**
 * RouteRenderer
 *
 * Replaces the long `{tabBase === 'x' && canAccessPage('x') && <X />}` chain
 * that previously lived inline in App.tsx.
 *
 * Rendering priority (mirrors original behaviour exactly):
 *  1. Known + allowed + implemented tab  → render the page
 *  2. Known tab + access denied          → "Access Denied" message
 *  3. Known tab + allowed + not yet built → "Work in progress"
 *  4. Unknown tab                         → "Work in progress"
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { canAccessPage } from '@/utils/rbac';
import { routeMap, type RouteRenderContext } from '@/routes/routeConfig';

// Keep in sync with App.tsx originals
const KNOWN_TABS = [
  'dashboard',
  'users',
  'platformUsers',
  'superadminCatalogue',
  'security',
  'offers',
  'finance',
  'actions',
  'integrations',
  'userDetails',
  'tenantDetails',
  'help',
  'tenantSubUsers',
  'tenantVendors',
  'tenantVessels',
  'tenantOrders',
  'tenantCatalogue',
  'addProduct',
  'cart',
  'tenantDocuments',
  'tenantActivityLogs',
  'addAccount',
  'addTenant',
  'addSubUser',
  'addVendor',
  'addVessel',
  'requisitionDetails',
];

const IMPLEMENTED_TABS = new Set([
  'dashboard',
  'users',
  'platformUsers',
  'superadminCatalogue',
  'offers',
  'userDetails',
  'tenantDetails',
  'help',
  'tenantSubUsers',
  'tenantVendors',
  'tenantVessels',
  'tenantOrders',
  'tenantCatalogue',
  'addProduct',
  'cart',
  'tenantDocuments',
  'tenantActivityLogs',
  'addAccount',
  'addTenant',
  'addSubUser',
  'addVendor',
  'addVessel',
  'requisitionDetails',
]);

interface RouteRendererProps {
  tabBase: string;
  tabParam: string | undefined;
  routeVendorId: string | undefined;
  onNavigate: (tab: string) => void;
}

export const RouteRenderer: React.FC<RouteRendererProps> = ({
  tabBase,
  tabParam,
  routeVendorId,
  onNavigate,
}) => {
  const location = useLocation();

  const routeEntry = routeMap.get(tabBase);
  const isKnown = KNOWN_TABS.includes(tabBase);
  const isImplemented = IMPLEMENTED_TABS.has(tabBase);

  // ── 1. Known + implemented + access allowed ──────────────────────────────
  if (routeEntry && isImplemented) {
    const { accessPage, render } = routeEntry;

    // If there's an access check and the user fails it → fall through to #2
    if (accessPage && !canAccessPage(accessPage)) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-grey-400 text-lg mb-2">Access Denied</p>
            <p className="text-grey-500 text-sm">You don&apos;t have permission to view this page.</p>
          </div>
        </div>
      );
    }

    const ctx: RouteRenderContext = {
      onNavigate,
      tabParam,
      routeVendorId,
      locationSearch: location.search,
    };

    return <>{render(ctx)}</>;
  }

  // ── 2. Known + not implemented → WIP ────────────────────────────────────
  if (isKnown && !isImplemented) {
    return (
      <div className="flex-1 flex items-center justify-center text-grey-400">
        Work in progress
      </div>
    );
  }

  // ── 3. Unknown tab → WIP ─────────────────────────────────────────────────
  return (
    <div className="flex-1 flex items-center justify-center text-grey-400">
      Work in progress
    </div>
  );
};
