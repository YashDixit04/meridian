// --- Interfaces ---

export interface TenantAdminProfile {
  type: 'Tenant Admin';
  basic: {
    userInformation: {
      name: string;
      email: string;
      phone: string;
      profilePhoto: string;
      status: 'Active' | 'Suspended';
      lastLogin: string;
    };
  };
  advanced: {
    organizationOverview: {
      companyName: string;
      registrationNumber: string;
      taxGstNumber: string;
      yearEstablished: string;
      operatingRegions: string[];
      companyType: string;
    };
    platformControlSettings: {
      totalUsers: number;
      activeUsers: number;
      pendingInvitations: number;
    };
    financialOverview: {
      totalSpend: string;
      outstandingPayments: string;
      creditLimit: string;
      paymentTerms: string;
      billingContact: string;
    };
    integrationStatus: {
      erpStatus: 'Connected' | 'Disconnected';
      apiKeyManagement: string;
      connectedSystems: string[];
      webhookStatus: 'Active' | 'Inactive';
    };
    securityControls: {
      twoFactorStatus: boolean;
      ssoEnabled: boolean;
      passwordLastUpdated: string;
      auditLogsAccess: boolean;
    };
  };
}

export interface ChannelAdminProfile {
  type: 'Channel Admin';
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  channelAssignment: {
    assignedTenants: string[];
    managedRegions: string[];
    managedCategories: string[];
    channelCode: string;
  };
  operationalControls: {
    rfqApprovalRights: boolean;
    orderApprovalLimit: string;
    vendorAssignmentRights: boolean;
  };
  performanceSummary: {
    rfqsHandled: number;
    ordersProcessed: number;
    conversionRate: string;
    responseTime: string;
  };
  activityLogs: {
    recentApprovals: number;
    recentAssignments: number;
    auditTrail: string; // Link or summary
  };
}

export interface SMCProfile {
  type: 'SMC';
  companyProfile: {
    companyName: string;
    imoCompanyNumber: string;
    fleetSize: number;
    vesselTypes: string[];
    operatingRegions: string[];
  };
  procurementSettings: {
    preferredPorts: string[];
    defaultCurrency: string;
    paymentTerms: string;
    contractType: string;
  };
  fleetOverview: {
    activeVessels: number;
    vesselsInPort: number;
    upcomingPortCalls: number;
  };
  spendSummary: {
    monthlySpend: string;
    topCategories: string[];
    topVendors: string[];
  };
  integrationCompliance: {
    erpConnected: boolean;
    documentVerificationStatus: 'Verified' | 'Pending' | 'Rejected';
    isoCertificates: string[];
    complianceExpiryDates: string;
  };
}

export interface VendorProfile {
  type: 'Vendor';
  vendorIdentity: {
    companyName: string;
    vendorCode: string;
    registrationNumber: string;
    taxId: string;
    bankDetails: string;
  };
  businessCoverage: {
    portsServed: string[];
    productCategories: string[];
    leadTime: string;
    minimumOrderValue: string;
  };
  performanceMetrics: {
    ordersFulfilled: number;
    onTimeDelivery: string;
    rating: number;
    rejectionRate: string;
  };
  financialDetails: {
    paymentTerms: string;
    creditAgreement: string;
    outstandingInvoices: string;
  };
  documents: {
    tradeLicense: string;
    gstCertificate: string;
    insuranceCertificate: string;
    expiryDates: string;
  };
}

export interface SubAdminProfile {
  type: 'Sub Admin';
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  assignedPermissions: {
    canCreateRFQ: boolean;
    canApproveOrders: boolean;
    canManageVendors: boolean;
    canViewReports: boolean;
  };
  activitySummary: {
    rfqsCreated: number;
    ordersApproved: number;
    lastActionTimestamp: string;
  };
  departmentAssignment: {
    procurement: boolean;
    finance: boolean;
    operations: boolean;
    admin: boolean;
  };
}

export interface StandardUserProfile {
  type: 'Standard User';
  basicDetails: {
    name: string;
    email: string;
    phone: string;
    department: string;
  };
  usageActivity: {
    rfqsCreated: number;
    ordersRaised: number;
    lastLogin: string;
    recentActivity: string;
  };
  preferences: {
    notificationSettings: string;
    defaultPort: string;
    defaultCurrency: string;
    language: string;
  };
}

// --- Mock Data ---

export const tenantAdminData: TenantAdminProfile = {
  type: 'Tenant Admin',
  basic: {
    userInformation: {
      name: 'Jason Tatum',
      email: 'jason.tatum@keenthemes.com',
      phone: '+1 (555) 123-4567',
      profilePhoto: 'https://i.pravatar.cc/150?u=3',
      status: 'Active',
      lastLogin: '2024-02-22 09:45 AM',
    },
  },
  advanced: {
    organizationOverview: {
      companyName: 'KeenThemes',
      registrationNumber: 'REG-2024-8899',
      taxGstNumber: 'GST-99887766',
      yearEstablished: '2015',
      operatingRegions: ['North America', 'Europe', 'Asia Pacific'],
      companyType: 'Technology / SaaS',
    },
    platformControlSettings: {
      totalUsers: 145,
      activeUsers: 132,
      pendingInvitations: 13,
    },
    financialOverview: {
      totalSpend: '$124,500.00',
      outstandingPayments: '$12,450.00',
      creditLimit: '$500,000.00',
      paymentTerms: 'Net 30',
      billingContact: 'billing@keenthemes.com',
    },
    integrationStatus: {
      erpStatus: 'Connected',
      apiKeyManagement: '********************',
      connectedSystems: ['SAP', 'Salesforce', 'Slack'],
      webhookStatus: 'Active',
    },
    securityControls: {
      twoFactorStatus: true,
      ssoEnabled: true,
      passwordLastUpdated: '2024-01-15',
      auditLogsAccess: true,
    },
  },
};

export const channelAdminData: ChannelAdminProfile = {
  type: 'Channel Admin',
  personalDetails: {
    name: 'Sarah Connor',
    email: 'sarah.c@channel.com',
    phone: '+1 (555) 987-6543',
    status: 'Active',
  },
  channelAssignment: {
    assignedTenants: ['Tenant A', 'Tenant B', 'Tenant C'],
    managedRegions: ['North America'],
    managedCategories: ['Electronics', 'Hardware'],
    channelCode: 'CH-001',
  },
  operationalControls: {
    rfqApprovalRights: true,
    orderApprovalLimit: '$50,000',
    vendorAssignmentRights: true,
  },
  performanceSummary: {
    rfqsHandled: 120,
    ordersProcessed: 95,
    conversionRate: '79%',
    responseTime: '2.5 Hours',
  },
  activityLogs: {
    recentApprovals: 5,
    recentAssignments: 2,
    auditTrail: 'View Logs',
  },
};

export const smcData: SMCProfile = {
  type: 'SMC',
  companyProfile: {
    companyName: 'Global Shipping Co.',
    imoCompanyNumber: 'IMO-1234567',
    fleetSize: 45,
    vesselTypes: ['Container', 'Bulk Carrier'],
    operatingRegions: ['Global'],
  },
  procurementSettings: {
    preferredPorts: ['Singapore', 'Rotterdam', 'Shanghai'],
    defaultCurrency: 'USD',
    paymentTerms: 'Net 60',
    contractType: 'Annual',
  },
  fleetOverview: {
    activeVessels: 40,
    vesselsInPort: 5,
    upcomingPortCalls: 12,
  },
  spendSummary: {
    monthlySpend: '$2,500,000',
    topCategories: ['Fuel', 'Provisions', 'Spares'],
    topVendors: ['Vendor X', 'Vendor Y'],
  },
  integrationCompliance: {
    erpConnected: true,
    documentVerificationStatus: 'Verified',
    isoCertificates: ['ISO 9001', 'ISO 14001'],
    complianceExpiryDates: '2025-12-31',
  },
};

export const vendorData: VendorProfile = {
  type: 'Vendor',
  vendorIdentity: {
    companyName: 'Marine Supplies Ltd.',
    vendorCode: 'VEN-888',
    registrationNumber: 'REG-555',
    taxId: 'TAX-123',
    bankDetails: '**** **** **** 1234',
  },
  businessCoverage: {
    portsServed: ['Singapore', 'Johor Bahru'],
    productCategories: ['Provisions', 'Bonded Stores'],
    leadTime: '24 Hours',
    minimumOrderValue: '$500',
  },
  performanceMetrics: {
    ordersFulfilled: 1500,
    onTimeDelivery: '98%',
    rating: 4.8,
    rejectionRate: '0.5%',
  },
  financialDetails: {
    paymentTerms: 'Net 30',
    creditAgreement: 'Active',
    outstandingInvoices: '$5,000',
  },
  documents: {
    tradeLicense: 'Valid',
    gstCertificate: 'Valid',
    insuranceCertificate: 'Valid',
    expiryDates: '2024-11-30',
  },
};

export const subAdminData: SubAdminProfile = {
  type: 'Sub Admin',
  personalInfo: {
    name: 'Mike Ross',
    email: 'mike.ross@keenthemes.com',
    phone: '+1 (555) 222-3333',
    status: 'Active',
  },
  assignedPermissions: {
    canCreateRFQ: true,
    canApproveOrders: false,
    canManageVendors: true,
    canViewReports: true,
  },
  activitySummary: {
    rfqsCreated: 45,
    ordersApproved: 0,
    lastActionTimestamp: '2024-02-21 14:30',
  },
  departmentAssignment: {
    procurement: true,
    finance: false,
    operations: true,
    admin: false,
  },
};

export const standardUserData: StandardUserProfile = {
  type: 'Standard User',
  basicDetails: {
    name: 'John Doe',
    email: 'john.doe@keenthemes.com',
    phone: '+1 (555) 111-2222',
    department: 'Operations',
  },
  usageActivity: {
    rfqsCreated: 12,
    ordersRaised: 8,
    lastLogin: '2024-02-22 10:00 AM',
    recentActivity: 'Created RFQ #1234',
  },
  preferences: {
    notificationSettings: 'Email, In-App',
    defaultPort: 'Singapore',
    defaultCurrency: 'USD',
    language: 'English',
  },
};
