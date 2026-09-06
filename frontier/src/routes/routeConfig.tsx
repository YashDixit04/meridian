/**
 * Route configuration for the legacy-tab routing layer.
 *
 * Each entry maps a tabBase string to:
 *   - accessPage: the page-permission key used by canAccessPage()
 *   - render: a function that receives routing context and returns the JSX to display
 *
 * IMPORTANT: Pages are NOT lazy-loaded here because the project currently has no
 * code-splitting boundary and Suspense was not previously in use. To avoid
 * behaviour changes this is a direct extraction of the existing JSX. Add lazy()
 * per-page when you're ready to enable code-splitting.
 */

import React from 'react';
import Dashboard from '@/pages/Dashboard';
import Tenants from '@/pages/TableList/tenantsListViewPage';
import Users from '@/pages/TableList/UsersListViewPage';
import Offers from '@/pages/adminOffers';
import UserDetails from '@/pages/Details/ProfilePage';
import TenantDetailsView from '@/pages/Details/TenantDetailsViewPage';
import UiComponentsPage from '@/pages/UiComponentsPage';
import SubUsersPage from '@/pages/TableList/SubUsersListViewPage';
import VesselsPage from '@/pages/TableList/VesselsListViewPage';
import RequisitionOrderPage from '@/pages/Requsition&Order/RequisitionOrdersPage';
import RequisitionDetailsPage from '@/pages/Requsition&Order/RequisitionDetailsPage';
import DocumentsPage from '@/pages/documentsInfo/DocumentsPage';
import ActivityLogsPage from '@/pages/TableList/ActivityLogsListViewPage';
import CataloguePage from '@/pages/Catalogue/list/CataloguePage';
import SuperadminCataloguePage from '@/pages/Catalogue/SuperadminCataloguePage';
import AddProduct from '@/pages/Catalogue/AddCatalogue/AddProduct';
import CartPage from '@/pages/Cart/CartPage';
import AddAccountPage from '@/pages/Details/AddAccountPage';
import AddSubUserPage from '@/pages/Details/AddSubUserPage';
import AddTenantPage from '@/pages/Details/AddTenantPage';
import AddVesselPage from '@/pages/Details/AddVesselPage';
import AddVendorPage from '@/pages/Details/AddVendorPage';
import VendorDetailsViewPage from '@/pages/Details/VendorDetailsViewPage';
import VendorsListViewPage from '@/pages/TableList/VendorsListViewPage';
import { authService } from '@/services/authService';

export interface RouteRenderContext {
  onNavigate: (tab: string) => void;
  tabParam: string | undefined;
  routeVendorId: string | undefined;
  locationSearch: string;
}

export interface RouteEntry {
  /** Matches App's tabBase value */
  tabBase: string;
  /** Key passed to canAccessPage(). Undefined means no access check is needed. */
  accessPage: string | undefined;
  /** Renders the page element given the current routing context */
  render: (ctx: RouteRenderContext) => React.ReactElement;
}

export const routeConfig: RouteEntry[] = [
  {
    tabBase: 'dashboard',
    accessPage: 'dashboard',
    render: () => <Dashboard />,
  },
  {
    tabBase: 'users',
    accessPage: 'users',
    render: ({ onNavigate }) => <Tenants onNavigate={onNavigate} />,
  },
  {
    tabBase: 'platformUsers',
    accessPage: 'platformUsers',
    render: ({ onNavigate }) => <Users onNavigate={onNavigate} />,
  },
  {
    tabBase: 'superadminCatalogue',
    accessPage: 'superadminCatalogue',
    render: () => <SuperadminCataloguePage />,
  },
  {
    tabBase: 'offers',
    accessPage: 'offers',
    render: () => <Offers />,
  },
  {
    tabBase: 'userDetails',
    accessPage: 'userDetails',
    render: ({ onNavigate }) => {
      const session = authService.getSession();
      if (session?.roleType === 'tenantadmin') {
        return <TenantDetailsView onNavigate={onNavigate} tenantId={session.tenantId} />;
      }
      return <UserDetails />;
    },
  },
  {
    tabBase: 'tenantDetails',
    accessPage: 'tenantDetails',
    render: ({ onNavigate, tabParam }) => (
      <TenantDetailsView onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'help',
    accessPage: 'help',
    render: () => <UiComponentsPage />,
  },
  {
    tabBase: 'addAccount',
    accessPage: 'addAccount',
    render: ({ onNavigate }) => <AddAccountPage onNavigate={onNavigate} />,
  },
  {
    tabBase: 'addSubUser',
    // Note: addSubUser is guarded by 'tenantSubUsers' permission (not 'addSubUser')
    accessPage: 'tenantSubUsers',
    render: ({ onNavigate, tabParam }) => (
      <AddSubUserPage onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'addVendor',
    accessPage: 'tenantVendors',
    render: ({ onNavigate, tabParam }) => (
      <AddVendorPage onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'addVessel',
    accessPage: 'tenantVessels',
    render: ({ onNavigate, tabParam }) => (
      <AddVesselPage onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'addTenant',
    accessPage: 'addTenant',
    render: ({ onNavigate }) => <AddTenantPage onNavigate={onNavigate} />,
  },
  {
    tabBase: 'tenantSubUsers',
    accessPage: 'tenantSubUsers',
    render: ({ onNavigate, tabParam }) => (
      <SubUsersPage onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'tenantVendors',
    accessPage: 'tenantVendors',
    render: ({ onNavigate, tabParam, routeVendorId }) =>
      routeVendorId ? (
        <VendorDetailsViewPage
          tenantId={tabParam}
          vendorId={routeVendorId}
          onNavigate={onNavigate}
        />
      ) : (
        <VendorsListViewPage tenantId={tabParam} onNavigate={onNavigate} />
      ),
  },
  {
    tabBase: 'tenantVessels',
    accessPage: 'tenantVessels',
    render: ({ onNavigate, tabParam }) => (
      <VesselsPage tenantId={tabParam} onNavigate={onNavigate} />
    ),
  },
  {
    tabBase: 'tenantOrders',
    accessPage: 'tenantOrders',
    render: ({ onNavigate }) => <RequisitionOrderPage onNavigate={onNavigate} />,
  },
  {
    tabBase: 'requisitionDetails',
    // No access-page check — rendered for any authenticated user who has the URL
    accessPage: undefined,
    render: ({ onNavigate, tabParam, locationSearch }) => {
      let requisitionName = 'Requisition';
      try {
        requisitionName = new URLSearchParams(locationSearch).get('name') || 'Requisition';
      } catch {
        // fall back to default
      }
      return (
        <RequisitionDetailsPage
          requisitionId={tabParam}
          requisitionName={requisitionName}
          onNavigate={onNavigate}
        />
      );
    },
  },
  {
    tabBase: 'tenantCatalogue',
    accessPage: 'tenantCatalogue',
    render: ({ onNavigate, tabParam }) => (
      <CataloguePage onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'addProduct',
    accessPage: 'addProduct',
    render: ({ onNavigate, tabParam }) => (
      <AddProduct onNavigate={onNavigate} tenantId={tabParam} />
    ),
  },
  {
    tabBase: 'cart',
    accessPage: 'cart',
    render: ({ onNavigate }) => <CartPage onNavigate={onNavigate} />,
  },
  {
    tabBase: 'tenantDocuments',
    accessPage: 'tenantDocuments',
    render: ({ tabParam }) => <DocumentsPage tenantId={tabParam} />,
  },
  {
    tabBase: 'tenantActivityLogs',
    accessPage: 'tenantActivityLogs',
    render: ({ tabParam }) => <ActivityLogsPage tenantId={tabParam} />,
  },
];

/** Fast lookup map: tabBase → RouteEntry */
export const routeMap = new Map<string, RouteEntry>(
  routeConfig.map((entry) => [entry.tabBase, entry]),
);
