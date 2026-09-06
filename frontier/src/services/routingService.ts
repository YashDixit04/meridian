import { ApiException, apiClient } from '../lib/apiClient';
import { authService } from './authService';

export interface RouteContext {
  sessionTenantId?: string;
  currentTenantId?: string;
}

interface RoutingManifest {
  pagePaths?: Record<string, string>;
  tenantSegments?: Record<string, string>;
  accessPages?: string[];
  defaultPage?: string;
}

const ROUTING_MANIFEST_STORAGE_KEY = 'b2b_routing_manifest';

const splitPath = (path: string): string[] =>
  path
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);

const toKebabCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();

const toCamelCase = (value: string): string =>
  value.replace(/-([a-z0-9])/g, (_, part: string) => part.toUpperCase());

const toPascalCase = (value: string): string => {
  const camel = toCamelCase(value);
  if (!camel.length) {
    return camel;
  }

  return camel[0].toUpperCase() + camel.slice(1);
};

class RoutingService {
  private manifest: RoutingManifest = {};
  private initialized = false;

  constructor() {
    this.loadManifestFromStorage();
  }

  private loadManifestFromStorage() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(ROUTING_MANIFEST_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as RoutingManifest;
      this.manifest = {
        ...this.manifest,
        ...parsed,
      };
    } catch {
      // Ignore invalid cache and use runtime fallback.
    }
  }

  private persistManifest() {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ROUTING_MANIFEST_STORAGE_KEY, JSON.stringify(this.manifest));
  }

  private async fetchManifestFromBackend() {
    try {
      const payload = await apiClient.get<RoutingManifest>('/routing/manifest');
      this.manifest = {
        ...this.manifest,
        ...payload,
      };
      this.persistManifest();
    } catch (error) {
      if (error instanceof ApiException) {
        // Expected for projects where routing manifest endpoint is not ready.
        if (error.statusCode !== 404) {
          console.warn('Routing manifest fetch skipped:', error.errorMessage);
        }
      }
    }
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    await this.fetchManifestFromBackend();
  }

  private getTenantId(context: RouteContext): string | undefined {
    return context.currentTenantId || context.sessionTenantId;
  }

  private buildTenantPath(tenantId: string | undefined, suffix?: string): string {
    if (!tenantId) {
      return '/tenantlist';
    }

    return suffix ? `/tenant/${tenantId}/${suffix}` : `/tenant/${tenantId}`;
  }

  private getRuntimePageKeys(): string[] {
    const fromSession = authService.getAccessiblePages();
    const fromManifest = this.manifest.accessPages || [];

    return Array.from(new Set([
      ...fromManifest,
      ...fromSession,
      'dashboard',
      'users',
      'platformUsers',
      'superadminCatalogue',
      'offers',
      'help',
      'userDetails',
      'tenantDetails',
      'tenantVendors',
      'addAccount',
      'addTenant',
      'addSubUser',
      'addVessel',
      'addVendor',
      'addProduct',
      'cart',
    ]));
  }

  private getTenantSegmentForPage(pageKey: string): string | undefined {
    const configured = this.manifest.tenantSegments?.[pageKey];
    if (configured) {
      return configured;
    }

    if (pageKey === 'addProduct') {
      return 'catalogue/add-product';
    }

    if (pageKey === 'addVendor') {
      return 'vendors/new';
    }

    if (pageKey === 'cart') {
      return 'cart';
    }

    if (!pageKey.startsWith('tenant') || pageKey === 'tenantDetails') {
      return undefined;
    }

    const rawSegment = pageKey.slice('tenant'.length);
    if (!rawSegment) {
      return undefined;
    }

    return toKebabCase(rawSegment);
  }

  private getCorePathForPage(pageKey: string): string | undefined {
    const configured = this.manifest.pagePaths?.[pageKey];
    if (configured && !configured.includes(':tenantId')) {
      return configured;
    }

    if (pageKey === 'users') {
      return '/tenantlist';
    }

    if (pageKey === 'platformUsers') {
      return '/users';
    }

    if (pageKey === 'superadminCatalogue') {
      return '/superadmin/catalogue';
    }

    if (pageKey === 'userDetails') {
      return '/profile';
    }

    if (pageKey === 'addAccount') {
      return '/users/new';
    }

    if (pageKey === 'addTenant') {
      return '/tenant/new';
    }

    if (pageKey === 'tenantDetails') {
      return '/tenant/:tenantId';
    }

    if (pageKey.startsWith('tenant') || pageKey === 'addProduct' || pageKey === 'cart') {
      return undefined;
    }

    return `/${toKebabCase(pageKey)}`;
  }

  private replaceTenantTemplate(path: string, tenantId: string | undefined): string {
    if (!path.includes(':tenantId')) {
      return path;
    }

    if (!tenantId) {
      return '/tenantlist';
    }

    return path.replace(/:tenantId/g, tenantId);
  }

  private resolvePagePath(pageKey: string, context: RouteContext): string | undefined {
    const configuredPath = this.manifest.pagePaths?.[pageKey];
    const tenantId = this.getTenantId(context);

    if (configuredPath) {
      return this.replaceTenantTemplate(configuredPath, tenantId);
    }

    if (pageKey === 'tenantDetails') {
      return this.buildTenantPath(tenantId);
    }

    if (pageKey === 'addSubUser') {
      return this.buildTenantPath(tenantId, 'sub-users/new');
    }

    if (pageKey === 'addVessel') {
      return this.buildTenantPath(tenantId, 'vessels/new');
    }

    if (pageKey === 'addVendor') {
      return this.buildTenantPath(tenantId, 'vendors/new');
    }

    const tenantSegment = this.getTenantSegmentForPage(pageKey);
    if (tenantSegment) {
      return this.buildTenantPath(tenantId, tenantSegment);
    }

    return this.getCorePathForPage(pageKey);
  }

  private getTenantSectionSegments(): string[] {
    const pageKeys = this.getRuntimePageKeys();
    const segments = pageKeys
      .map((key) => this.getTenantSegmentForPage(key))
      .filter((segment): segment is string => Boolean(segment));

    return Array.from(new Set(segments));
  }

  private normalizeTenantAliasPath(path: string, context: RouteContext): string {
    const segments = splitPath(path);

    if (segments[0] !== 'tenant') {
      return path;
    }

    if (segments[1] === 'new') {
      return '/tenant/new';
    }

    const tenantSections = this.getTenantSectionSegments();
    if (segments.length >= 2 && tenantSections.includes(segments[1])) {
      const tenantId = this.getTenantId(context);
      if (!tenantId) {
        return '/tenantlist';
      }

      const suffix = segments.slice(1).join('/');
      return this.buildTenantPath(tenantId, suffix);
    }

    return path;
  }

  extractTenantIdFromPath(pathname: string): string | undefined {
    const segments = splitPath(pathname);

    if (segments[0] !== 'tenant') {
      return undefined;
    }

    if (!segments[1] || segments[1] === 'new') {
      return undefined;
    }

    const tenantSections = this.getTenantSectionSegments();
    if (tenantSections.includes(segments[1])) {
      return undefined;
    }

    return segments[1];
  }

  extractVendorIdFromPath(pathname: string, sessionTenantId?: string): string | undefined {
    const normalizedPath = this.normalizeTenantAliasPath(pathname, { sessionTenantId });
    const segments = splitPath(normalizedPath);

    if (segments[0] !== 'tenant') {
      return undefined;
    }

    if (segments[2] !== 'vendors') {
      return undefined;
    }

    const vendorId = segments[3];
    if (!vendorId || vendorId === 'new') {
      return undefined;
    }

    return vendorId;
  }

  resolveNavigationTarget(target: string, context: RouteContext = {}): string {
    const trimmed = target.trim();
    if (!trimmed) {
      return '/dashboard';
    }

    if (trimmed.startsWith('/')) {
      return this.normalizeTenantAliasPath(trimmed, context);
    }

    const [tabBase, tabParam] = trimmed.split('_');
    const resolvedTenantId = tabParam || this.getTenantId(context);

    const resolved = this.resolvePagePath(tabBase, {
      ...context,
      currentTenantId: resolvedTenantId,
    });

    return resolved || '/dashboard';
  }

  pathToLegacyTab(pathname: string, sessionTenantId?: string): string {
    const normalizedPath = this.normalizeTenantAliasPath(pathname, { sessionTenantId });
    const segments = splitPath(normalizedPath);

    if (segments.length === 0) {
      return 'dashboard';
    }

    if (segments[0] === 'tenantlist') {
      return 'users';
    }

    if (segments[0] === 'users') {
      if (segments[1] === 'new') {
        return 'addAccount';
      }
      return 'platformUsers';
    }

    if (segments[0] === 'tenant') {
      if (segments[1] === 'new') {
        return 'addTenant';
      }

      const tenantId = segments[1];
      if (!tenantId) {
        return 'users';
      }

      const section = segments[2];
      if (!section) {
        return `tenantDetails_${tenantId}`;
      }

      const tenantSections = this.getTenantSectionSegments();
      if (!tenantSections.includes(section)) {
        return `tenantDetails_${tenantId}`;
      }

      if (section === 'sub-users' && segments[3] === 'new') {
        return `addSubUser_${tenantId}`;
      }

      if (section === 'vessels' && segments[3] === 'new') {
        return `addVessel_${tenantId}`;
      }

      if (section === 'vendors' && segments[3] === 'new') {
        return `addVendor_${tenantId}`;
      }

      if (section === 'catalogue' && segments[3] === 'add-product') {
        return `addProduct_${tenantId}`;
      }

      if (section === 'cart') {
        return `cart_${tenantId}`;
      }

      const matchedPageKey = this.getRuntimePageKeys().find((key) => this.getTenantSegmentForPage(key) === section);
      if (!matchedPageKey) {
        const inferred = `tenant${toPascalCase(section)}`;
        return `${inferred}_${tenantId}`;
      }

      return `${matchedPageKey}_${tenantId}`;
    }

    const currentPath = `/${segments.join('/')}`;
    const matchedCorePage = this.getRuntimePageKeys().find((pageKey) => {
      const pagePath = this.resolvePagePath(pageKey, { sessionTenantId });
      return pagePath === currentPath;
    });

    if (matchedCorePage) {
      return matchedCorePage;
    }

    const inferred = toCamelCase(segments[0]);
    return inferred || 'unknown';
  }

  getAccessPageForLegacyTab(legacyTab: string): string | undefined {
    const tabBase = legacyTab.split('_')[0];
    const mapped =
      tabBase === 'addSubUser'
        ? 'tenantSubUsers'
        : tabBase === 'addVessel'
          ? 'tenantVessels'
          : tabBase === 'addVendor'
            ? 'tenantVendors'
          : tabBase;

    const allowedPages = new Set(this.getRuntimePageKeys());
    return allowedPages.has(mapped) ? mapped : undefined;
  }

  getDefaultPathForAccessPages(accessiblePages: string[], tenantId?: string): string {
    const preferred = this.manifest.defaultPage || accessiblePages[0] || 'dashboard';

    return this.resolveNavigationTarget(preferred, {
      sessionTenantId: tenantId,
      currentTenantId: tenantId,
    });
  }
}

export const routingService = new RoutingService();
export default routingService;
