import routingService, { RouteContext } from '../services/routingService';

export type { RouteContext };

export const initializeRoutingManifest = (): Promise<void> => routingService.initialize();

export const extractTenantIdFromPath = (pathname: string): string | undefined =>
  routingService.extractTenantIdFromPath(pathname);

export const extractVendorIdFromPath = (
  pathname: string,
  sessionTenantId?: string,
): string | undefined => routingService.extractVendorIdFromPath(pathname, sessionTenantId);

export const resolveNavigationTarget = (target: string, context: RouteContext = {}): string =>
  routingService.resolveNavigationTarget(target, context);

export const pathToLegacyTab = (pathname: string, sessionTenantId?: string): string =>
  routingService.pathToLegacyTab(pathname, sessionTenantId);

export const getAccessPageForLegacyTab = (legacyTab: string): string | undefined =>
  routingService.getAccessPageForLegacyTab(legacyTab);

export const getDefaultPathForAccessPages = (
  accessiblePages: string[],
  tenantId?: string,
): string => routingService.getDefaultPathForAccessPages(accessiblePages, tenantId);
