export type PermissionFields = Record<string, string[]>;

export type PlatformRoleType = 'admin' | 'adminusers';
export type TenantRoleType = 'tenantadmin' | 'tenantadmin_subusers';

export const PLATFORM_ROLE_OPTIONS: Array<{ value: PlatformRoleType; label: string }> = [
    { value: 'admin', label: 'Admin' },
    { value: 'adminusers', label: 'Admin User' },
];

export const PLATFORM_PAGE_OPTIONS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Tenants' },
    { id: 'platformUsers', label: 'Platform Users' },
    { id: 'security', label: 'Security' },
    { id: 'offers', label: 'Offers' },
    { id: 'finance', label: 'Finance' },
    { id: 'actions', label: 'Actions' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'userDetails', label: 'User Details' },
    { id: 'tenantDetails', label: 'Tenant Details' },
    { id: 'tenantSubUsers', label: 'Tenant Sub Users' },
    { id: 'tenantVendors', label: 'Tenant Vendors' },
    { id: 'tenantVessels', label: 'Tenant Vessels' },
    { id: 'tenantOrders', label: 'Tenant Orders' },
    { id: 'tenantCatalogue', label: 'Tenant Catalogue' },
    { id: 'addProduct', label: 'Add Product' },
    { id: 'tenantDocuments', label: 'Tenant Documents' },
    { id: 'tenantActivityLogs', label: 'Activity Logs' },
];

export const PLATFORM_COMPONENT_FIELD_OPTIONS: Array<{ component: string; fields: string[] }> = [
    { component: 'tenantTable', fields: ['name', 'email', 'status', 'subscription', 'vessels', 'orders'] },
    { component: 'userTable', fields: ['name', 'email', 'role', 'status'] },
    { component: 'vesselTable', fields: ['name', 'type', 'capacity', 'status'] },
    { component: 'vendorTable', fields: ['companyName', 'registrationNumber', 'email', 'companyType', 'kycStatus', 'serviceType', 'approvalStatus'] },
    { component: 'orderTable', fields: ['orderId', 'date', 'status', 'amount'] },
    { component: 'catalogueTable', fields: ['productName', 'category', 'price', 'stock'] },
    { component: 'subUsersTable', fields: ['name', 'email', 'role'] },
    { component: 'dashboard', fields: ['revenue', 'subscriptions', 'tenants', 'activeUsers'] },
];

export const PLATFORM_ROLE_PRESETS: Record<PlatformRoleType, { pages: string[]; fields: PermissionFields }> = {
    admin: {
        pages: ['dashboard', 'users', 'platformUsers', 'offers', 'userDetails', 'tenantDetails'],
        fields: {
            tenantTable: ['name', 'email', 'status', 'subscription', 'vessels', 'orders'],
            userTable: ['name', 'email', 'role', 'status'],
            dashboard: ['revenue', 'subscriptions', 'tenants', 'activeUsers'],
        },
    },
    adminusers: {
        pages: ['dashboard', 'users', 'tenantDetails'],
        fields: {
            tenantTable: ['name', 'email', 'status', 'vessels'],
            dashboard: ['tenants', 'activeUsers'],
        },
    },
};

export const TENANT_ROLE_OPTIONS: Array<{ value: TenantRoleType; label: string }> = [
    { value: 'tenantadmin', label: 'Tenant Admin' },
    { value: 'tenantadmin_subusers', label: 'Tenant Sub Admin' },
];

export const TENANT_DEPARTMENT_OPTIONS = [
    'Sales',
    'RFQ Desk',
    'Operations',
    'Logistics',
    'Procurement',
    'Warehouse',
    "Captain",
    'Finance',
    'Compliance',
    'Quality Assurance',
    'Customer Support',
    'Management',
    'IT',
];

export const SMC_DEPARTMENT_OPTIONS = [
    'Procurement',
    'Operations',
    'Logistics',
    'Finance',
    'Compliance',
    'Captain',
    'Quality Assurance',
    'Customer Support',
    'Management',
    'IT',
];

export const VENDOR_DEPARTMENT_OPTIONS = [
    'Sales',
    'RFQ Desk',
    'Operations',
    'Logistics',
    'Warehouse',
    'Finance',
    'Management',
    'IT',
];

const isSmcOnlyTenantSelection = (userTypeSelection?: string): boolean => {
    if (typeof userTypeSelection !== 'string') return false;
    const normalized = userTypeSelection.toLowerCase();
    if (!normalized.includes('smc')) return false;
    return !normalized.includes('both') && !normalized.includes('vendor');
};

const isVendorOnlyTenantSelection = (userTypeSelection?: string): boolean => {
    if (typeof userTypeSelection !== 'string') return false;
    const normalized = userTypeSelection.toLowerCase();
    if (!normalized.includes('vendor')) return false;
    return !normalized.includes('both') && !normalized.includes('smc');
};

export const getDepartmentOptions = (userTypeSelection?: string): string[] => {
    if (isVendorOnlyTenantSelection(userTypeSelection)) {
        return VENDOR_DEPARTMENT_OPTIONS;
    }
    if (isSmcOnlyTenantSelection(userTypeSelection)) {
        return SMC_DEPARTMENT_OPTIONS;
    }
    return TENANT_DEPARTMENT_OPTIONS;
};

export const TENANT_PAGE_OPTIONS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tenantSubUsers', label: 'Tenant Sub Users' },
    { id: 'tenantVendors', label: 'Tenant Vendors' },
    { id: 'tenantVessels', label: 'Tenant Vessels' },
    { id: 'tenantOrders', label: 'Tenant Orders' },
    { id: 'tenantCatalogue', label: 'Tenant Catalogue' },
    { id: 'addProduct', label: 'Add Product' },
    { id: 'tenantDocuments', label: 'Tenant Documents' },
    { id: 'tenantActivityLogs', label: 'Activity Logs' },
    { id: 'cart', label: 'Cart' },
];

export const TENANT_COMPONENT_FIELD_OPTIONS: Array<{ component: string; fields: string[] }> = [
    { component: 'subUsersTable', fields: ['name', 'email', 'role', 'department', 'vesselAssigned', 'status', 'createdAt'] },
    { component: 'vendorTable', fields: ['companyName', 'registrationNumber', 'email', 'companyType', 'kycStatus', 'serviceType', 'approvalStatus'] },
    { component: 'vesselTable', fields: ['name', 'type', 'capacity', 'status'] },
    { component: 'orderTable', fields: ['orderId', 'date', 'status', 'amount'] },
    { component: 'catalogueTable', fields: ['productName', 'category', 'price', 'stock'] },
    { component: 'dashboard', fields: ['revenue', 'subscriptions', 'tenants', 'activeUsers'] },
];

export const TENANT_ROLE_PRESETS: Record<TenantRoleType, { pages: string[]; fields: PermissionFields }> = {
    tenantadmin: {
        pages: ['dashboard', 'tenantSubUsers', 'tenantVendors', 'tenantVessels', 'tenantOrders', 'tenantCatalogue', 'addProduct', 'tenantDocuments', 'tenantActivityLogs', 'cart'],
        fields: {
            subUsersTable: ['name', 'email', 'role', 'department', 'vesselAssigned', 'status', 'createdAt'],
            vendorTable: ['companyName', 'registrationNumber', 'email', 'companyType', 'kycStatus', 'serviceType', 'approvalStatus'],
            vesselTable: ['name', 'type', 'capacity', 'status'],
            orderTable: ['orderId', 'date', 'status', 'amount'],
            catalogueTable: ['productName', 'category', 'price', 'stock'],
            dashboard: ['revenue', 'subscriptions', 'tenants', 'activeUsers'],
        },
    },
    tenantadmin_subusers: {
        pages: ['dashboard', 'tenantVendors', 'tenantVessels', 'tenantOrders', 'tenantCatalogue', 'tenantDocuments', 'cart'],
        fields: {
            vendorTable: ['companyName', 'email', 'companyType', 'kycStatus', 'serviceType', 'approvalStatus'],
            vesselTable: ['name', 'type', 'status'],
            orderTable: ['orderId', 'date', 'status'],
            catalogueTable: ['productName', 'category', 'price'],
            dashboard: ['activeUsers', 'tenants'],
        },
    },
};

export const isPlatformRoleType = (value: string): value is PlatformRoleType =>
    value === 'admin' || value === 'adminusers';
export const isTenantRoleType = (value: string): value is TenantRoleType =>
    value === 'tenantadmin' || value === 'tenantadmin_subusers';

export const clonePermissionFields = (fields: PermissionFields): PermissionFields =>
    Object.fromEntries(
        Object.entries(fields).map(([key, values]) => [key, [...values]]),
    );
