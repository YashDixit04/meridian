export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status: string;
  tenantCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  planName?: string;
  planType?: string;
  amountPaid?: string;
  requisitionManagement?: boolean;
  catalogueServices?: boolean;
  subUsersCreation?: boolean;
  vesselsAdditions?: boolean;
  catalogueManagement?: boolean;
  mealsCreation?: boolean;
  victuallingManagementServices?: boolean;
  activeLogsMapping?: boolean;
  ordersManagement?: boolean;
  invoiceManagement?: boolean;
  address?: string;
  currency?: string;
  maxUserCreations?: number;
  maxSubUsers?: number;
  maxStorageGB?: number;
  apiRequestsTier?: string;
  userTypeSelection?: string;
  baseUsersCount?: number;
  totalVendorUsersCount?: number;
  companySpecificCatalogueCount?: number;
  productAvailability?: string;
  specificPorts?: string;
  profilePhoto?: string;
  canViewOtherTenantVendors?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  name: string;
  domain: string;
  status: string;
  tenantCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  planName?: string;
  planType?: string;
  amountPaid?: string;
  requisitionManagement?: boolean;
  catalogueServices?: boolean;
  subUsersCreation?: boolean;
  vesselsAdditions?: boolean;
  catalogueManagement?: boolean;
  mealsCreation?: boolean;
  victuallingManagementServices?: boolean;
  activeLogsMapping?: boolean;
  ordersManagement?: boolean;
  invoiceManagement?: boolean;
  address?: string;
  currency?: string;
  maxUserCreations?: number;
  maxSubUsers?: number;
  maxStorageGB?: number;
  apiRequestsTier?: string;
  userTypeSelection?: string;
  baseUsersCount?: number;
  totalVendorUsersCount?: number;
  companySpecificCatalogueCount?: number;
  productAvailability?: string;
  specificPorts?: string;
  profilePhoto?: string;
  canViewOtherTenantVendors?: boolean;
}

export type UpdateTenantPayload = Partial<CreateTenantPayload>;

export interface TenantUser {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  roleType: string;
  tenantId: string;
  department?: string;
  vesselAssigned?: boolean;
  assignedVesselIds?: string[];
  permissions?: {
    pages?: string[];
    fields?: Record<string, string[]>;
  };
  createdAt: string;
  updatedAt: string;
  subUsers?: SubUser[];
}

export interface SubUser {
  id: string;
  name: string;
  email: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubUserPayload {
  name: string;
  email: string;
}

export type UpdateSubUserPayload = Partial<CreateSubUserPayload>;

export interface CreateTenantUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
  roleType?: string;
  role?: string;
  permissions?: object;
  department?: string;
  vesselAssigned?: boolean;
  assignedVesselIds?: string[];
}

export interface UpdateTenantUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  roleType?: string;
  permissions?: object;
  department?: string;
  vesselAssigned?: boolean;
  assignedVesselIds?: string[];
}

export interface TenantVessel {
  id: string;
  coreInfo: {
    vesselName: string;
    imoNumber: string;
    vesselType: string;
    flag: string;
    callSign?: string;
    mmsiNumber?: string;
    yearBuilt?: string;
    deadweight?: string;
    grossTonnage?: string;
    netTonnage?: string;
  };
  ownership: {
    ownerCompany: string;
    operatorCompany: string;
    technicalManager?: string;
    commercialManager?: string;
  };
  operations: {
    currentStatus: 'Active' | 'In Port' | 'Sailing' | 'Dry Dock';
    currentPort: string;
    nextPort?: string;
    eta?: string;
    etd?: string;
    tradingArea?: string;
  };
  procurement: {
    defaultCurrency: string;
    budgetLimit?: number;
    approvalRequired: boolean;
    preferredPorts?: string[];
    preferredVendors?: string[];
    contractType?: 'Spot' | 'Annual' | 'Contract';
  };
  crew: {
    captain?: string;
    chiefEngineer?: string;
    assignedDepartments: string[];
  };
  integration: {
    erpSystem?: string;
    externalVesselId?: string;
    syncEnabled: boolean;
  };
  systemFlags: {
    isActive: boolean;
    isProcurementEnabled: boolean;
    isVendorAccessAllowed: boolean;
    isBudgetControlled: boolean;
  };
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVesselPayload {
  coreInfo: {
    vesselName: string;
    imoNumber: string;
    vesselType: string;
    flag: string;
    callSign?: string;
    mmsiNumber?: string;
    yearBuilt?: string;
    deadweight?: string;
    grossTonnage?: string;
    netTonnage?: string;
  };
  ownership: {
    ownerCompany: string;
    operatorCompany: string;
    technicalManager?: string;
    commercialManager?: string;
  };
  operations: {
    currentStatus: 'Active' | 'In Port' | 'Sailing' | 'Dry Dock';
    currentPort: string;
    nextPort?: string;
    eta?: string;
    etd?: string;
    tradingArea?: string;
  };
  procurement: {
    defaultCurrency: string;
    budgetLimit?: number;
    approvalRequired: boolean;
    preferredPorts?: string[];
    preferredVendors?: string[];
    contractType?: 'Spot' | 'Annual' | 'Contract';
  };
  crew: {
    captain?: string;
    chiefEngineer?: string;
    assignedDepartments: string[];
  };
  integration: {
    erpSystem?: string;
    externalVesselId?: string;
    syncEnabled: boolean;
  };
  systemFlags: {
    isActive: boolean;
    isProcurementEnabled: boolean;
    isVendorAccessAllowed: boolean;
    isBudgetControlled: boolean;
  };
}

export interface UpdateVesselPayload {
  coreInfo?: Partial<CreateVesselPayload['coreInfo']>;
  ownership?: Partial<CreateVesselPayload['ownership']>;
  operations?: Partial<CreateVesselPayload['operations']>;
  procurement?: Partial<CreateVesselPayload['procurement']>;
  crew?: Partial<CreateVesselPayload['crew']>;
  integration?: Partial<CreateVesselPayload['integration']>;
  systemFlags?: Partial<CreateVesselPayload['systemFlags']>;
}

export type VendorCompanyType = 'Supplier' | 'Manufacturer' | 'Trader';
export type VendorKycStatus = 'Pending' | 'Verified' | 'Rejected';
export type VendorServiceType = 'Supply' | 'Service' | 'Both';
export type VendorContractType = 'Spot' | 'Annual' | 'Contract';

export interface TenantVendor {
  id: string;
  basicInfo: {
    companyName: string;
    legalName: string;
    registrationNumber: string;
    taxId: string;
    companyType: VendorCompanyType;
    yearEstablished?: string;
    website?: string;
    email: string;
    phone: string;
  };
  kyc: {
    kycStatus: VendorKycStatus;
    documents: {
      tradeLicense: string;
      taxCertificate: string;
      incorporationCertificate: string;
      bankProof: string;
      addressProof: string;
      insuranceCertificate: string;
    };
    expiryDates: {
      tradeLicenseExpiry?: string;
      insuranceExpiry?: string;
    };
  };
  contact: {
    primaryContact: {
      name: string;
      email: string;
      phone: string;
      designation?: string;
    };
    secondaryContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
  capability: {
    productCategories: string[];
    brandsHandled?: string[];
    certifications?: string[];
    serviceType: VendorServiceType;
  };
  coverage: {
    countriesServed?: string[];
    portsServed: string[];
    deliveryTime?: string;
    emergencySupply: boolean;
  };
  financial: {
    paymentTerms?: string;
    currencyAccepted: string[];
    creditLimit?: number;
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      swiftCode?: string;
      iban?: string;
    };
  };
  performance: {
    rating?: number;
    totalOrders?: number;
    onTimeDelivery?: string;
    rejectionRate?: string;
  };
  systemFlags: {
    isActive: boolean;
    isApproved: boolean;
    isBlacklisted: boolean;
    isPreferredVendor: boolean;
  };
  contract: {
    contractType?: VendorContractType;
    contractStartDate?: string;
    contractEndDate?: string;
  };
  integration: {
    externalVendorId?: string;
    erpLinked: boolean;
    referenceSource?: string;
  };
  tenantId: string;
  alerts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorPayload {
  basicInfo: TenantVendor['basicInfo'];
  kyc: TenantVendor['kyc'];
  contact: TenantVendor['contact'];
  capability: TenantVendor['capability'];
  coverage: TenantVendor['coverage'];
  financial: TenantVendor['financial'];
  performance?: TenantVendor['performance'];
  systemFlags?: TenantVendor['systemFlags'];
  contract?: TenantVendor['contract'];
  integration?: TenantVendor['integration'];
}

export interface UpdateVendorPayload {
  basicInfo?: Partial<CreateVendorPayload['basicInfo']>;
  kyc?: Partial<CreateVendorPayload['kyc']>;
  contact?: Partial<CreateVendorPayload['contact']>;
  capability?: Partial<CreateVendorPayload['capability']>;
  coverage?: Partial<CreateVendorPayload['coverage']>;
  financial?: Partial<CreateVendorPayload['financial']>;
  performance?: Partial<CreateVendorPayload['performance']>;
  systemFlags?: Partial<CreateVendorPayload['systemFlags']>;
  contract?: Partial<CreateVendorPayload['contract']>;
  integration?: Partial<CreateVendorPayload['integration']>;
}

export interface TenantCatalog {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  offerings?: TenantOffering[];
}

export interface TenantOffering {
  id: string;
  name: string;
  price: number;
  catalogId: string;
  superadminProductId?: string;
  vendorId?: string;
  isVendorProduct?: boolean;
  ports?: string[];
  productId?: string;
  productIdType?: string;
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
  category?: string;
  subcategory?: string;
  impaCode?: string;
  mfrPartNumber?: string;
  hsCode?: string;
  storageType?: string;
  shelfLifeDays?: number;
  expiryDate?: string;
  isHazmat?: boolean;
  unNumber?: string;
  imdgClass?: string;
  packingGroup?: string;
  customsRef?: string;
  dutyFreeFlag?: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: { id: string; name: string };
  catalog?: { id: string; name: string };
}

export interface CreateOfferingPayload {
  name: string;
  price: number;
  vendorId?: string;
  vendorTenantId?: string;
  isVendorProduct?: boolean;
  ports?: string[];
  productId?: string;
  productIdType?: string;
  images?: string[];
  videos?: string[];
  variations?: string[];
  inventory?: Array<Record<string, unknown>>;
  category?: string;
  subcategory?: string;
  impaCode?: string;
  mfrPartNumber?: string;
  hsCode?: string;
  storageType?: string;
  shelfLifeDays?: number;
  expiryDate?: string;
  isHazmat?: boolean;
  unNumber?: string;
  imdgClass?: string;
  packingGroup?: string;
  customsRef?: string;
  dutyFreeFlag?: boolean;
}

export type UpdateOfferingPayload = Partial<CreateOfferingPayload>;

export interface BulkCreateOfferingsPayload {
  offerings: CreateOfferingPayload[];
}

export interface BulkCreateOfferingsFailure {
  index: number;
  productId?: string;
  reason: string;
}

export interface BulkCreateOfferingsResult {
  createdCount: number;
  failedCount: number;
  created: TenantOffering[];
  failed: BulkCreateOfferingsFailure[];
}

export interface ActivityLog {
  id: string;
  action: string;
  description?: string;
  tenantId: string;
  userId?: string;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
}

export interface VendorKycDocument {
  id: string;
  tenantId: string;
  vendorId: string;
  vendorName: string;
  documentType: string;
  documentValue: string;
  kycStatus: string;
  uploadedAt: string;
}

export interface TenantSettings {
  canViewOtherTenantVendors: boolean;
}

export interface ExternalVendor extends TenantVendor {
  isExternal: true;
  vendorTenantId: string;
  vendorTenantName: string;
}
