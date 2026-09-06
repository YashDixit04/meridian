// --- Tenant Details Data ---

export interface TenantDetailsProfile {
  type: string;
  basic: {
    tenantInformation: {
      tenantProfilePhoto: string;
      tenantName: string;
      domain: string;
      address: string;
      contactEmail: string;
      contactPhone: string;
      country: string;
      timezone: string;
      currency: string;
    };
    subscription: {
      planName: string;
      planType: string;
      autoRenew: boolean;
      amountPaid: string;
    };
    planFeatures: {
      requisitionManagement: boolean;
      catalogueServices: boolean;
      subUsersCreation: boolean;
      vesselsAdditions: boolean;
      catalogueManagement: boolean;
      mealsCreation: boolean;
      victuallingManagementServices: boolean;
      activeLogsMapping: boolean;
      ordersManagement: boolean;
      invoiceManagement: boolean;
      maxUserCreations: number;
      maxSubUsers: number;
      maxStorageGB: number;
      apiRequestsTier: string;
    };
  };
  advanced: {
    users: {
      tenantAdminName: string;
      tenantAdminEmail: string;
      tenantAdminRole: string;
      userTypeSelection: string;
      baseUsersCount: number;
      totalVendorUsersCount: number;
    };
    catalogueAndProducts: {
      companySpecificCatalogueCount: number;
      productAvailability: string;
      specificPorts: string;
      canViewOtherTenantVendors?: boolean;
    };
    billingIntegrationsSecurity: {
      billingDetails: string;
      usageAnalytics: string;
      integrations: string;
      security: string;
    };
  };
}

export const tenantDetailsData: TenantDetailsProfile = {
  type: "Tenant",

  basic: {
    tenantInformation: {
      tenantProfilePhoto: "https://i.pravatar.cc/150?u=12",
      tenantName: "MSC Falcons",
      domain: "mscfalcons.com",
      address: "123 Port Ave, Miami",
      contactEmail: "mscfalcon@gmail.com",
      contactPhone: "+1 987 654 3210",
      country: "United States",
      timezone: "UTC -5",
      currency: "USD",
    },
    subscription: {
      planName: "Enterprise Plan",
      planType: "Annual",
      autoRenew: true,
      amountPaid: "12500",
    },
    planFeatures: {
      requisitionManagement: false,
      catalogueServices: false,
      subUsersCreation: false,
      vesselsAdditions: false,
      catalogueManagement: false,
      mealsCreation: false,
      victuallingManagementServices: false,
      activeLogsMapping: false,
      ordersManagement: false,
      invoiceManagement: false,
      maxUserCreations: 200,
      maxSubUsers: 500,
      maxStorageGB: 500,
      apiRequestsTier: "Unlimited",
    },
  },

  advanced: {
    users: {
      tenantAdminName: "Jason Tatum",
      tenantAdminEmail: "jason.tatum@keenthemes.com",
      tenantAdminPassword: "",
      userTypeSelection: "Both SMC and Vendor Users",
      baseUsersCount: 4,
      totalVendorUsersCount: 4,
    },
    catalogueAndProducts: {
      companySpecificCatalogueCount: 3,
      productAvailability: "Specific Ports",
      specificPorts: "Singapore, Rotterdam",
      canViewOtherTenantVendors: false,
    },
    billingIntegrationsSecurity: {
      billingDetails: "Static placeholder - Coming soon",
      usageAnalytics: "Static placeholder - Coming soon",
      integrations: "Static placeholder - Coming soon",
      security: "Static placeholder - Coming soon",
    },
  },
};

// --- Quick Link Sections ---
export interface QuickLinkSection {
  title: string;
  total: number | null;
  icon: string;
  redirectUrl: string;
}

const defaultTenantQuickLinks: QuickLinkSection[] = [
  {
    title: "Sub Users",
    total: 145,
    icon: "users",
    redirectUrl: "/tenant/sub-users",
  },
  {
    title: "Vendors",
    total: 0,
    icon: "briefcase",
    redirectUrl: "/tenant/vendors",
  },
  {
    title: "Vessels",
    total: 32,
    icon: "ship",
    redirectUrl: "/tenant/vessels",
  },
  {
    title: "Requisition & Orders",
    total: 520,
    icon: "shopping-cart",
    redirectUrl: "/tenant/orders",
  },
  {
    title: "Catalogue",
    total: 12450,
    icon: "package",
    redirectUrl: "/tenant/catalogue",
  },
  {
    title: "Documents",
    total: null,
    icon: "file",
    redirectUrl: "/tenant/documents",
  },
  {
    title: "Activity Logs",
    total: null,
    icon: "clock",
    redirectUrl: "/tenant/activity-logs",
  },
];

const vendorOnlyTenantQuickLinks: QuickLinkSection[] = [
  {
    title: "Sub Users",
    total: 145,
    icon: "users",
    redirectUrl: "/tenant/sub-users",
  },
  {
    title: "Vendor KYC",
    total: 1,
    icon: "briefcase",
    redirectUrl: "/tenant/vendor-kyc",
  },
  {
    title: "Catalogue",
    total: 12450,
    icon: "package",
    redirectUrl: "/tenant/catalogue",
  },
  {
    title: "Documents",
    total: null,
    icon: "file",
    redirectUrl: "/tenant/documents",
  },
  {
    title: "Activity Logs",
    total: null,
    icon: "clock",
    redirectUrl: "/tenant/activity-logs",
  },
];

const smcOnlyTenantQuickLinks: QuickLinkSection[] = [
  {
    title: "Sub Users",
    total: 145,
    icon: "users",
    redirectUrl: "/tenant/sub-users",
  },
  {
    title: "Vessels",
    total: 32,
    icon: "ship",
    redirectUrl: "/tenant/vessels",
  },
  {
    title: "Requisition & Orders",
    total: 520,
    icon: "shopping-cart",
    redirectUrl: "/tenant/orders",
  },
  {
    title: "Catalogue",
    total: 12450,
    icon: "package",
    redirectUrl: "/tenant/catalogue",
  },
  {
    title: "Documents",
    total: null,
    icon: "file",
    redirectUrl: "/tenant/documents",
  },
  {
    title: "Activity Logs",
    total: null,
    icon: "clock",
    redirectUrl: "/tenant/activity-logs",
  },
];

const isSmcOnlyTenantSelection = (userTypeSelection?: string): boolean => {
  if (typeof userTypeSelection !== 'string') {
    return false;
  }

  const normalized = userTypeSelection.toLowerCase();
  if (!normalized.includes('smc')) {
    return false;
  }

  return !normalized.includes('both') && !normalized.includes('vendor');
};

const isVendorOnlyTenantSelection = (userTypeSelection?: string): boolean => {
  if (typeof userTypeSelection !== 'string') {
    return false;
  }

  const normalized = userTypeSelection.toLowerCase();
  if (!normalized.includes('vendor')) {
    return false;
  }

  return !normalized.includes('both') && !normalized.includes('smc');
};

export const getTenantQuickLinks = (userTypeSelection?: string): QuickLinkSection[] => {
  let source: QuickLinkSection[];

  if (isVendorOnlyTenantSelection(userTypeSelection)) {
    source = vendorOnlyTenantQuickLinks;
  } else if (isSmcOnlyTenantSelection(userTypeSelection)) {
    source = smcOnlyTenantQuickLinks;
  } else {
    source = defaultTenantQuickLinks;
  }

  return source.map((link) => ({ ...link }));
};
