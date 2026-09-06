import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import tenantService from '@/services/tenantService';
import { extractTenantIdFromPath } from '@/lib/appRouting';

const tenantNameCache = new Map<string, string>();

const ROOT_HOME_PATH = '/dashboard';
const TENANT_LIST_PATH = '/tenantlist';

const TOP_LEVEL_LABELS: Record<string, string> = {
  dashboard: 'Home',
  tenantlist: 'Tenant List',
  users: 'Users',
  offers: 'Offers',
  profile: 'Profile',
  help: 'Help',
  security: 'Security',
  finance: 'Finance',
  actions: 'Actions',
  integrations: 'Integrations',
};

const TENANT_SECTION_LABELS: Record<string, string> = {
  'sub-users': 'Sub Users',
  vendors: 'Vendors',
  vessels: 'Vessels',
  orders: 'Orders',
  catalogue: 'Catalogue',
  documents: 'Documents',
  'activity-logs': 'Activity Logs',
  cart: 'Cart',
};

const KNOWN_TENANT_SECTIONS = new Set(Object.keys(TENANT_SECTION_LABELS));

const splitPath = (path: string): string[] =>
  path
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);

const titleCase = (value: string): string =>
  value
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');

const toTenantFallbackName = (tenantId: string): string => `Tenant ${tenantId.slice(0, 8)}`;

const buildTopLevelLabel = (segments: string[], index: number): string => {
  const segment = segments[index];

  if (index === 0 && TOP_LEVEL_LABELS[segment]) {
    return TOP_LEVEL_LABELS[segment];
  }

  if (segments[0] === 'users' && segment === 'new') {
    return 'Add User';
  }

  if (segments[0] === 'tenant' && segment === 'new') {
    return 'Add Tenant';
  }

  return titleCase(segment);
};

const buildTenantLabel = (segments: string[], index: number): string => {
  const segment = segments[index];

  if (segment === 'new' && segments[index - 1] === 'sub-users') {
    return 'Add Sub User';
  }

  if (segment === 'add-product' && segments[index - 1] === 'catalogue') {
    return 'Add Product';
  }

  if (segment === 'new' && segments[index - 1] === 'vendors') {
    return 'Add Vendor';
  }

  if (segments[index - 1] === 'vendors' && segment !== 'new') {
    return 'Vendor Details';
  }

  return TENANT_SECTION_LABELS[segment] || titleCase(segment);
};

const buildCrumbsFromPath = (
  pathname: string,
  tenantName?: string,
): Array<{ label: string; path: string; active?: boolean }> => {
  const segments = splitPath(pathname);

  if (segments.length === 0 || pathname === '/') {
    return [{ label: 'Home', path: ROOT_HOME_PATH, active: true }];
  }

  if (segments[0] !== 'tenant') {
    const crumbs: Array<{ label: string; path: string; active?: boolean }> = [
      { label: 'Home', path: ROOT_HOME_PATH },
    ];

    let runningPath = '';
    for (let index = 0; index < segments.length; index += 1) {
      runningPath += `/${segments[index]}`;
      crumbs.push({
        label: buildTopLevelLabel(segments, index),
        path: runningPath,
        active: index === segments.length - 1,
      });
    }

    if (segments[0] === 'dashboard') {
      return [{ label: 'Home', path: ROOT_HOME_PATH, active: true }];
    }

    return crumbs;
  }

  if (segments[1] === 'new') {
    return [
      { label: 'Home', path: ROOT_HOME_PATH },
      { label: 'Tenant List', path: TENANT_LIST_PATH },
      { label: 'Add Tenant', path: '/tenant/new', active: true },
    ];
  }

  const tenantId = segments[1];
  if (!tenantId) {
    return [
      { label: 'Home', path: ROOT_HOME_PATH, active: true },
    ];
  }

  const maybeSection = segments[2];
  const hasSlug = Boolean(maybeSection) && !KNOWN_TENANT_SECTIONS.has(maybeSection);
  const tenantDetailsPath = hasSlug
    ? `/tenant/${tenantId}/${maybeSection}`
    : `/tenant/${tenantId}`;

  const crumbs: Array<{ label: string; path: string; active?: boolean }> = [
    { label: 'Home', path: ROOT_HOME_PATH },
    { label: 'Tenant List', path: TENANT_LIST_PATH },
    {
      label: tenantName || (hasSlug ? titleCase(maybeSection || '') : toTenantFallbackName(tenantId)),
      path: tenantDetailsPath,
      active: segments.length <= (hasSlug ? 3 : 2),
    },
  ];

  const startIndex = hasSlug ? 3 : 2;
  let runningPath = `/${segments.slice(0, startIndex).join('/')}`;

  for (let index = startIndex; index < segments.length; index += 1) {
    runningPath += `/${segments[index]}`;
    crumbs.push({
      label: buildTenantLabel(segments, index),
      path: runningPath,
      active: index === segments.length - 1,
    });
  }

  return crumbs;
};

export const useAutoBreadcrumbs = (): BreadcrumbLink[] => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState<string | undefined>(undefined);

  const tenantId = useMemo(
    () => extractTenantIdFromPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    if (!tenantId) {
      setTenantName(undefined);
      return;
    }

    const cached = tenantNameCache.get(tenantId);
    if (cached) {
      setTenantName(cached);
      return;
    }

    let cancelled = false;

    const loadTenantName = async () => {
      try {
        const tenant = await tenantService.getTenantById(tenantId);
        if (cancelled) {
          return;
        }

        const name = tenant.name?.trim();
        if (name) {
          tenantNameCache.set(tenantId, name);
          setTenantName(name);
          return;
        }
      } catch {
        // Ignore tenant lookup failures and fallback to ID-based label.
      }

      if (!cancelled) {
        setTenantName(undefined);
      }
    };

    void loadTenantName();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return useMemo(() => {
    const pathCrumbs = buildCrumbsFromPath(location.pathname, tenantName);

    return pathCrumbs.map((crumb) => ({
      label: crumb.label,
      href: crumb.path,
      active: crumb.active,
      onClick: crumb.active ? undefined : () => navigate(crumb.path),
    }));
  }, [location.pathname, navigate, tenantName]);
};

export default useAutoBreadcrumbs;
