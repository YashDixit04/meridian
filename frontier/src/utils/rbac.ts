/**
 * RBAC (Role-Based Access Control) Utilities
 * Provides helper functions for permission checking and UI rendering
 * Designed to work independently of data source (JSON or API)
 */

import React from 'react';
import { authService } from '../services/authService';

/**
 * Hook-like function to get current user session
 * Can be used in components to access user data
 */
export const useAuth = () => {
  const session = authService.getSession();
  const isAuthenticated = authService.isAuthenticated();

  return {
    user: session,
    isAuthenticated,
    roleType: session?.roleType,
    permissions: session?.permissions,
  };
};

/**
 * Checks if current user can access a specific page
 * @param pageName - Name of the page to check
 * @returns True if user has access
 */
export const canAccessPage = (pageName: string): boolean => {
  return authService.hasPageAccess(pageName);
};

/**
 * Checks if current user can access a specific field in a component
 * @param componentName - Name of the component
 * @param fieldName - Name of the field
 * @returns True if user has access
 */
export const canAccessField = (componentName: string, fieldName: string): boolean => {
  return authService.hasFieldAccess(componentName, fieldName);
};

/**
 * Gets all pages the current user can access
 * @returns Array of accessible page names
 */
export const getAccessiblePages = (): string[] => {
  return authService.getAccessiblePages();
};

/**
 * Filters an array of menu items based on user permissions
 * @param menuItems - Array of menu items with id property
 * @returns Filtered array of accessible menu items
 */
export const filterMenuByPermissions = <T extends { id: string }>(
  menuItems: T[]
): T[] => {
  const accessiblePages = getAccessiblePages();

  return menuItems.filter((item) => accessiblePages.includes(item.id));
};

/**
 * Filters an array of fields/columns based on user permissions
 * @param componentName - Name of the component
 * @param fields - Array of field/column objects with name/key property
 * @returns Filtered array of accessible fields
 */
export const filterFieldsByPermissions = <T extends { name?: string; key?: string }>(
  componentName: string,
  fields: T[]
): T[] => {
  const session = authService.getSession();

  if (!session) {
    return [];
  }

  // Superadmin sees all fields
  if (session.roleType === 'superadmin') {
    return fields;
  }

  // Get allowed fields for this component
  const allowedFields = session.permissions.fields[componentName] || [];

  // Filter fields based on permissions
  return fields.filter((field) => {
    const fieldName = field.name || field.key || '';
    return allowedFields.includes(fieldName);
  });
};

/**
 * Component wrapper to conditionally render based on page access
 * @param pageName - Name of the page
 * @param children - React children to render if access is granted
 * @returns Children if access granted, null otherwise
 */
export const PageGuard = ({
  pageName,
  children,
}: {
  pageName: string;
  children: React.ReactNode;
}): React.ReactNode => {
  if (!canAccessPage(pageName)) {
    return null;
  }

  return children;
};

/**
 * Component wrapper to conditionally render based on field access
 * @param componentName - Name of the component
 * @param fieldName - Name of the field
 * @param children - React children to render if access is granted
 * @returns Children if access granted, null otherwise
 */
export const FieldGuard = ({
  componentName,
  fieldName,
  children,
}: {
  componentName: string;
  fieldName: string;
  children: React.ReactNode;
}): React.ReactNode => {
  if (!canAccessField(componentName, fieldName)) {
    return null;
  }

  return children;
};

/**
 * Checks if current user has admin privileges (superadmin or admin)
 * @returns True if user is admin or superadmin
 */
export const isAdmin = (): boolean => {
  const session = authService.getSession();

  if (!session) {
    return false;
  }

  return session.roleType === 'superadmin' || session.roleType === 'admin';
};

/**
 * Checks if current user is superadmin
 * @returns True if user is superadmin
 */
export const isSuperAdmin = (): boolean => {
  const session = authService.getSession();

  if (!session) {
    return false;
  }

  return session.roleType === 'superadmin';
};

/**
 * Gets user role display name
 * @param roleType - Role type to get display name for
 * @returns Human-readable role name
 */
export const getRoleDisplayName = (roleType?: string): string => {
  const roleNames: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    adminusers: 'Admin User',
    tenantadmin: 'Tenant Admin',
    tenantadmin_subusers: 'Tenant Sub User',
  };

  return roleNames[roleType || ''] || 'Unknown Role';
};

/**
 * Validates if a page name exists in the system
 * @param pageName - Page name to validate
 * @returns True if page exists
 */
export const isValidPage = (pageName: string): boolean => {
  const validPages = [
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
    'tenantDocuments',
    'tenantActivityLogs',
    'addAccount',
    'addVendor',
    'cart',
  ];

  return validPages.includes(pageName);
};
