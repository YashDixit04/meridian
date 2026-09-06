import { vendorDetailsData, VendorDetailsData } from '@/data/vendorDetailsData';
import {
  CreateVendorPayload,
  TenantVendor,
  UpdateVendorPayload,
  VendorCompanyType,
  VendorContractType,
  VendorKycStatus,
  VendorServiceType,
} from '@/services/tenantService';

export type VendorFieldErrors = Record<string, string>;

export const vendorUiFieldPathByApiPath: Record<string, string> = {
  'basicInfo.companyName': 'basic.basicCompanyInformation.companyName',
  'basicInfo.legalName': 'basic.basicCompanyInformation.legalName',
  'basicInfo.registrationNumber': 'basic.basicCompanyInformation.registrationNumber',
  'basicInfo.taxId': 'basic.basicCompanyInformation.taxId',
  'basicInfo.companyType': 'basic.basicCompanyInformation.companyType',
  'basicInfo.yearEstablished': 'basic.basicCompanyInformation.yearEstablished',
  'basicInfo.website': 'basic.basicCompanyInformation.website',
  'basicInfo.email': 'basic.basicCompanyInformation.email',
  'basicInfo.phone': 'basic.basicCompanyInformation.phone',

  'kyc.kycStatus': 'basic.kycCompliance.kycStatus',
  'kyc.documents.tradeLicense': 'basic.kycCompliance.tradeLicense',
  'kyc.documents.taxCertificate': 'basic.kycCompliance.taxCertificate',
  'kyc.documents.incorporationCertificate': 'basic.kycCompliance.incorporationCertificate',
  'kyc.documents.bankProof': 'basic.kycCompliance.bankProof',
  'kyc.documents.addressProof': 'basic.kycCompliance.addressProof',
  'kyc.documents.insuranceCertificate': 'basic.kycCompliance.insuranceCertificate',
  'kyc.expiryDates.tradeLicenseExpiry': 'basic.kycCompliance.tradeLicenseExpiry',
  'kyc.expiryDates.insuranceExpiry': 'basic.kycCompliance.insuranceExpiry',

  'contact.primaryContact.name': 'basic.contactDetails.primaryContactName',
  'contact.primaryContact.email': 'basic.contactDetails.primaryContactEmail',
  'contact.primaryContact.phone': 'basic.contactDetails.primaryContactPhone',
  'contact.primaryContact.designation': 'basic.contactDetails.primaryContactDesignation',
  'contact.secondaryContact.name': 'basic.contactDetails.secondaryContactName',
  'contact.secondaryContact.email': 'basic.contactDetails.secondaryContactEmail',
  'contact.secondaryContact.phone': 'basic.contactDetails.secondaryContactPhone',
  'contact.secondaryContact.designation': 'basic.contactDetails.secondaryContactDesignation',

  'capability.productCategories': 'basic.businessCapability.productCategories',
  'capability.brandsHandled': 'basic.businessCapability.brandsHandled',
  'capability.certifications': 'basic.businessCapability.certifications',
  'capability.serviceType': 'basic.businessCapability.serviceType',

  'coverage.countriesServed': 'basic.geographicCoverage.countriesServed',
  'coverage.portsServed': 'basic.geographicCoverage.portsServed',
  'coverage.deliveryTime': 'basic.geographicCoverage.deliveryTime',
  'coverage.emergencySupply': 'basic.geographicCoverage.emergencySupply',

  'financial.paymentTerms': 'basic.financialDetails.paymentTerms',
  'financial.currencyAccepted': 'basic.financialDetails.currencyAccepted',
  'financial.creditLimit': 'basic.financialDetails.creditLimit',
  'financial.bankDetails.bankName': 'basic.financialDetails.bankName',
  'financial.bankDetails.accountNumber': 'basic.financialDetails.accountNumber',
  'financial.bankDetails.swiftCode': 'basic.financialDetails.swiftCode',
  'financial.bankDetails.iban': 'basic.financialDetails.iban',

  'performance.rating': 'advanced.performanceMetrics.rating',
  'performance.totalOrders': 'advanced.performanceMetrics.totalOrders',
  'performance.onTimeDelivery': 'advanced.performanceMetrics.onTimeDelivery',
  'performance.rejectionRate': 'advanced.performanceMetrics.rejectionRate',

  'systemFlags.isActive': 'advanced.systemFlags.isActive',
  'systemFlags.isApproved': 'advanced.systemFlags.isApproved',
  'systemFlags.isBlacklisted': 'advanced.systemFlags.isBlacklisted',
  'systemFlags.isPreferredVendor': 'advanced.systemFlags.isPreferredVendor',

  'contract.contractType': 'advanced.contractDetails.contractType',
  'contract.contractStartDate': 'advanced.contractDetails.contractStartDate',
  'contract.contractEndDate': 'advanced.contractDetails.contractEndDate',

  'integration.externalVendorId': 'advanced.integration.externalVendorId',
  'integration.erpLinked': 'advanced.integration.erpLinked',
  'integration.referenceSource': 'advanced.integration.referenceSource',
};

const setFieldError = (
  errors: VendorFieldErrors,
  fieldPath: string,
  message: string,
): void => {
  if (!errors[fieldPath]) {
    errors[fieldPath] = message;
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value);

const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_REGEX.test(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

const isValidNumberString = (value: string): boolean => {
  const parsed = Number(value);
  return Number.isFinite(parsed);
};

const toFriendlyFieldMessage = (message: string): string => {
  if (message.includes('must be a valid ISO 8601 date string')) {
    return 'Please enter a valid date in YYYY-MM-DD format.';
  }

  if (message.includes('must be an email')) {
    return 'Please enter a valid email address.';
  }

  if (message.includes('must be a number')) {
    return 'Please enter a valid number.';
  }

  if (message.includes('should not be empty') || message.includes('must not be empty')) {
    return 'This field is required.';
  }

  if (message.includes('must contain at least 1 elements')) {
    return 'Please select at least one value.';
  }

  if (message.includes('must be one of the following values')) {
    return 'Please select a valid option.';
  }

  return message;
};

const VENDOR_COMPANY_TYPES: VendorCompanyType[] = ['Supplier', 'Manufacturer', 'Trader'];
const VENDOR_KYC_STATUSES: VendorKycStatus[] = ['Pending', 'Verified', 'Rejected'];
const VENDOR_SERVICE_TYPES: VendorServiceType[] = ['Supply', 'Service', 'Both'];
const VENDOR_CONTRACT_TYPES: VendorContractType[] = ['Spot', 'Annual', 'Contract'];

const toVendorCompanyType = (value: unknown): VendorCompanyType => {
  if (typeof value === 'string' && VENDOR_COMPANY_TYPES.includes(value as VendorCompanyType)) {
    return value as VendorCompanyType;
  }

  return 'Supplier';
};

const toVendorKycStatus = (value: unknown): VendorKycStatus => {
  if (typeof value === 'string' && VENDOR_KYC_STATUSES.includes(value as VendorKycStatus)) {
    return value as VendorKycStatus;
  }

  return 'Pending';
};

const toVendorServiceType = (value: unknown): VendorServiceType => {
  if (typeof value === 'string' && VENDOR_SERVICE_TYPES.includes(value as VendorServiceType)) {
    return value as VendorServiceType;
  }

  return 'Supply';
};

const toVendorContractType = (value: unknown): VendorContractType | undefined => {
  if (typeof value === 'string' && VENDOR_CONTRACT_TYPES.includes(value as VendorContractType)) {
    return value as VendorContractType;
  }

  return undefined;
};

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeRequiredText = (value: unknown): string => normalizeOptionalText(value) || '';

const normalizeOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeOptionalText(item))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const normalizeSecondaryContact = (details: VendorDetailsData) => {
  const name = normalizeOptionalText(details.basic.contactDetails.secondaryContactName);
  const email = normalizeOptionalText(details.basic.contactDetails.secondaryContactEmail);
  const phone = normalizeOptionalText(details.basic.contactDetails.secondaryContactPhone);

  if (!name && !email && !phone) {
    return undefined;
  }

  return {
    name,
    email,
    phone,
  };
};

const normalizeBankDetails = (details: VendorDetailsData) => {
  const bankName = normalizeOptionalText(details.basic.financialDetails.bankName);
  const accountNumber = normalizeOptionalText(details.basic.financialDetails.accountNumber);
  const swiftCode = normalizeOptionalText(details.basic.financialDetails.swiftCode);
  const iban = normalizeOptionalText(details.basic.financialDetails.iban);

  if (!bankName && !accountNumber && !swiftCode && !iban) {
    return undefined;
  }

  return {
    bankName,
    accountNumber,
    swiftCode,
    iban,
  };
};

export const cloneInitialVendorDetails = (): VendorDetailsData => ({
  ...vendorDetailsData,
  basic: {
    ...vendorDetailsData.basic,
    basicCompanyInformation: {
      ...vendorDetailsData.basic.basicCompanyInformation,
    },
    kycCompliance: {
      ...vendorDetailsData.basic.kycCompliance,
    },
    contactDetails: {
      ...vendorDetailsData.basic.contactDetails,
    },
    businessCapability: {
      ...vendorDetailsData.basic.businessCapability,
      productCategories: [...vendorDetailsData.basic.businessCapability.productCategories],
      brandsHandled: [...vendorDetailsData.basic.businessCapability.brandsHandled],
      certifications: [...vendorDetailsData.basic.businessCapability.certifications],
    },
    geographicCoverage: {
      ...vendorDetailsData.basic.geographicCoverage,
      countriesServed: [...vendorDetailsData.basic.geographicCoverage.countriesServed],
      portsServed: [...vendorDetailsData.basic.geographicCoverage.portsServed],
    },
    financialDetails: {
      ...vendorDetailsData.basic.financialDetails,
      currencyAccepted: [...vendorDetailsData.basic.financialDetails.currencyAccepted],
    },
  },
  advanced: {
    ...vendorDetailsData.advanced,
    performanceMetrics: {
      ...vendorDetailsData.advanced.performanceMetrics,
    },
    systemFlags: {
      ...vendorDetailsData.advanced.systemFlags,
    },
    contractDetails: {
      ...vendorDetailsData.advanced.contractDetails,
    },
    integration: {
      ...vendorDetailsData.advanced.integration,
    },
  },
});

export const validateVendorDetails = (details: VendorDetailsData): string | null => {
  const fieldErrors = validateVendorDetailsFields(details);
  if (Object.keys(fieldErrors).length > 0) {
    return 'Please correct highlighted vendor fields and try again.';
  }

  return null;
};

export const validateVendorDetailsFields = (details: VendorDetailsData): VendorFieldErrors => {
  const fieldErrors: VendorFieldErrors = {};

  const requiredFields: Array<{ path: string; value: unknown; message: string }> = [
    {
      path: 'basic.basicCompanyInformation.companyName',
      value: details.basic.basicCompanyInformation.companyName,
      message: 'Company name is required.',
    },
    {
      path: 'basic.basicCompanyInformation.legalName',
      value: details.basic.basicCompanyInformation.legalName,
      message: 'Legal name is required.',
    },
    {
      path: 'basic.basicCompanyInformation.registrationNumber',
      value: details.basic.basicCompanyInformation.registrationNumber,
      message: 'Registration number is required.',
    },
    {
      path: 'basic.basicCompanyInformation.taxId',
      value: details.basic.basicCompanyInformation.taxId,
      message: 'Tax ID is required.',
    },
    {
      path: 'basic.basicCompanyInformation.email',
      value: details.basic.basicCompanyInformation.email,
      message: 'Company email is required.',
    },
    {
      path: 'basic.basicCompanyInformation.phone',
      value: details.basic.basicCompanyInformation.phone,
      message: 'Company phone is required.',
    },
    {
      path: 'basic.contactDetails.primaryContactName',
      value: details.basic.contactDetails.primaryContactName,
      message: 'Primary contact name is required.',
    },
    {
      path: 'basic.contactDetails.primaryContactEmail',
      value: details.basic.contactDetails.primaryContactEmail,
      message: 'Primary contact email is required.',
    },
    {
      path: 'basic.contactDetails.primaryContactPhone',
      value: details.basic.contactDetails.primaryContactPhone,
      message: 'Primary contact phone is required.',
    },
    {
      path: 'basic.kycCompliance.tradeLicense',
      value: details.basic.kycCompliance.tradeLicense,
      message: 'Trade license is required.',
    },
    {
      path: 'basic.kycCompliance.taxCertificate',
      value: details.basic.kycCompliance.taxCertificate,
      message: 'Tax certificate is required.',
    },
    {
      path: 'basic.kycCompliance.incorporationCertificate',
      value: details.basic.kycCompliance.incorporationCertificate,
      message: 'Incorporation certificate is required.',
    },
    {
      path: 'basic.kycCompliance.bankProof',
      value: details.basic.kycCompliance.bankProof,
      message: 'Bank proof is required.',
    },
    {
      path: 'basic.kycCompliance.addressProof',
      value: details.basic.kycCompliance.addressProof,
      message: 'Address proof is required.',
    },
    {
      path: 'basic.kycCompliance.insuranceCertificate',
      value: details.basic.kycCompliance.insuranceCertificate,
      message: 'Insurance certificate is required.',
    },
  ];

  for (const item of requiredFields) {
    if (!normalizeOptionalText(item.value)) {
      setFieldError(fieldErrors, item.path, item.message);
    }
  }

  if (normalizeStringArray(details.basic.businessCapability.productCategories).length === 0) {
    setFieldError(
      fieldErrors,
      'basic.businessCapability.productCategories',
      'Select at least one product category.',
    );
  }

  if (normalizeStringArray(details.basic.geographicCoverage.portsServed).length === 0) {
    setFieldError(
      fieldErrors,
      'basic.geographicCoverage.portsServed',
      'Select at least one port.',
    );
  }

  const emailFields: Array<{ path: string; value: unknown }> = [
    {
      path: 'basic.basicCompanyInformation.email',
      value: details.basic.basicCompanyInformation.email,
    },
    {
      path: 'basic.contactDetails.primaryContactEmail',
      value: details.basic.contactDetails.primaryContactEmail,
    },
    {
      path: 'basic.contactDetails.secondaryContactEmail',
      value: details.basic.contactDetails.secondaryContactEmail,
    },
  ];

  for (const item of emailFields) {
    const value = normalizeOptionalText(item.value);
    if (value && !isValidEmail(value)) {
      setFieldError(fieldErrors, item.path, 'Please enter a valid email address.');
    }
  }

  const dateFields: Array<{ path: string; value: unknown }> = [
    {
      path: 'basic.kycCompliance.tradeLicenseExpiry',
      value: details.basic.kycCompliance.tradeLicenseExpiry,
    },
    {
      path: 'basic.kycCompliance.insuranceExpiry',
      value: details.basic.kycCompliance.insuranceExpiry,
    },
    {
      path: 'advanced.contractDetails.contractStartDate',
      value: details.advanced.contractDetails.contractStartDate,
    },
    {
      path: 'advanced.contractDetails.contractEndDate',
      value: details.advanced.contractDetails.contractEndDate,
    },
  ];

  for (const item of dateFields) {
    const value = normalizeOptionalText(item.value);
    if (value && !isValidIsoDate(value)) {
      setFieldError(fieldErrors, item.path, 'Please enter a valid date in YYYY-MM-DD format.');
    }
  }

  const numberFields: Array<{ path: string; value: unknown; min?: number; max?: number }> = [
    {
      path: 'basic.financialDetails.creditLimit',
      value: details.basic.financialDetails.creditLimit,
      min: 0,
    },
    {
      path: 'advanced.performanceMetrics.rating',
      value: details.advanced.performanceMetrics.rating,
      min: 0,
      max: 5,
    },
    {
      path: 'advanced.performanceMetrics.totalOrders',
      value: details.advanced.performanceMetrics.totalOrders,
      min: 0,
    },
  ];

  for (const item of numberFields) {
    const rawValue = normalizeOptionalText(item.value);
    if (!rawValue) {
      continue;
    }

    if (!isValidNumberString(rawValue)) {
      setFieldError(fieldErrors, item.path, 'Please enter a valid number.');
      continue;
    }

    const parsedValue = Number(rawValue);
    if (typeof item.min === 'number' && parsedValue < item.min) {
      setFieldError(fieldErrors, item.path, `Value must be greater than or equal to ${item.min}.`);
      continue;
    }

    if (typeof item.max === 'number' && parsedValue > item.max) {
      setFieldError(fieldErrors, item.path, `Value must be less than or equal to ${item.max}.`);
    }
  }

  return fieldErrors;
};

export const mapVendorApiErrorsToFieldErrors = (errorMessage: string): VendorFieldErrors => {
  const fieldErrors: VendorFieldErrors = {};
  const rawMessages = errorMessage
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  for (const rawMessage of rawMessages) {
    const match = rawMessage.match(/^([A-Za-z0-9_.]+)\s+(must|should)\b/);
    if (!match) {
      continue;
    }

    const apiPath = match[1];
    const uiPath = vendorUiFieldPathByApiPath[apiPath];
    if (!uiPath) {
      continue;
    }

    setFieldError(fieldErrors, uiPath, toFriendlyFieldMessage(rawMessage));
  }

  return fieldErrors;
};

export const buildCreateVendorPayload = (details: VendorDetailsData): CreateVendorPayload => ({
  basicInfo: {
    companyName: normalizeRequiredText(details.basic.basicCompanyInformation.companyName),
    legalName: normalizeRequiredText(details.basic.basicCompanyInformation.legalName),
    registrationNumber: normalizeRequiredText(details.basic.basicCompanyInformation.registrationNumber),
    taxId: normalizeRequiredText(details.basic.basicCompanyInformation.taxId),
    companyType: toVendorCompanyType(details.basic.basicCompanyInformation.companyType),
    yearEstablished: normalizeOptionalText(details.basic.basicCompanyInformation.yearEstablished),
    website: normalizeOptionalText(details.basic.basicCompanyInformation.website),
    email: normalizeRequiredText(details.basic.basicCompanyInformation.email),
    phone: normalizeRequiredText(details.basic.basicCompanyInformation.phone),
  },
  kyc: {
    kycStatus: toVendorKycStatus(details.basic.kycCompliance.kycStatus),
    documents: {
      tradeLicense: normalizeRequiredText(details.basic.kycCompliance.tradeLicense),
      taxCertificate: normalizeRequiredText(details.basic.kycCompliance.taxCertificate),
      incorporationCertificate: normalizeRequiredText(details.basic.kycCompliance.incorporationCertificate),
      bankProof: normalizeRequiredText(details.basic.kycCompliance.bankProof),
      addressProof: normalizeRequiredText(details.basic.kycCompliance.addressProof),
      insuranceCertificate: normalizeRequiredText(details.basic.kycCompliance.insuranceCertificate),
    },
    expiryDates: {
      tradeLicenseExpiry: normalizeOptionalText(details.basic.kycCompliance.tradeLicenseExpiry),
      insuranceExpiry: normalizeOptionalText(details.basic.kycCompliance.insuranceExpiry),
    },
  },
  contact: {
    primaryContact: {
      name: normalizeRequiredText(details.basic.contactDetails.primaryContactName),
      email: normalizeRequiredText(details.basic.contactDetails.primaryContactEmail),
      phone: normalizeRequiredText(details.basic.contactDetails.primaryContactPhone),
      designation: normalizeOptionalText(details.basic.contactDetails.primaryContactDesignation),
    },
    secondaryContact: normalizeSecondaryContact(details),
  },
  capability: {
    productCategories: normalizeStringArray(details.basic.businessCapability.productCategories),
    brandsHandled: normalizeStringArray(details.basic.businessCapability.brandsHandled),
    certifications: normalizeStringArray(details.basic.businessCapability.certifications),
    serviceType: toVendorServiceType(details.basic.businessCapability.serviceType),
  },
  coverage: {
    countriesServed: normalizeStringArray(details.basic.geographicCoverage.countriesServed),
    portsServed: normalizeStringArray(details.basic.geographicCoverage.portsServed),
    deliveryTime: normalizeOptionalText(details.basic.geographicCoverage.deliveryTime),
    emergencySupply: Boolean(details.basic.geographicCoverage.emergencySupply),
  },
  financial: {
    paymentTerms: normalizeOptionalText(details.basic.financialDetails.paymentTerms),
    currencyAccepted: normalizeStringArray(details.basic.financialDetails.currencyAccepted),
    creditLimit: normalizeOptionalNumber(details.basic.financialDetails.creditLimit),
    bankDetails: normalizeBankDetails(details),
  },
  performance: {
    rating: normalizeOptionalNumber(details.advanced.performanceMetrics.rating),
    totalOrders: normalizeOptionalNumber(details.advanced.performanceMetrics.totalOrders),
    onTimeDelivery: normalizeOptionalText(details.advanced.performanceMetrics.onTimeDelivery),
    rejectionRate: normalizeOptionalText(details.advanced.performanceMetrics.rejectionRate),
  },
  systemFlags: {
    isActive: Boolean(details.advanced.systemFlags.isActive),
    isApproved: Boolean(details.advanced.systemFlags.isApproved),
    isBlacklisted: Boolean(details.advanced.systemFlags.isBlacklisted),
    isPreferredVendor: Boolean(details.advanced.systemFlags.isPreferredVendor),
  },
  contract: {
    contractType: toVendorContractType(details.advanced.contractDetails.contractType),
    contractStartDate: normalizeOptionalText(details.advanced.contractDetails.contractStartDate),
    contractEndDate: normalizeOptionalText(details.advanced.contractDetails.contractEndDate),
  },
  integration: {
    externalVendorId: normalizeOptionalText(details.advanced.integration.externalVendorId),
    erpLinked: Boolean(details.advanced.integration.erpLinked),
    referenceSource: normalizeOptionalText(details.advanced.integration.referenceSource),
  },
});

export const buildUpdateVendorPayload = (details: VendorDetailsData): UpdateVendorPayload =>
  buildCreateVendorPayload(details);

export const mapVendorToDetails = (vendor: TenantVendor): VendorDetailsData => ({
  ...cloneInitialVendorDetails(),
  basic: {
    basicCompanyInformation: {
      companyName: vendor.basicInfo.companyName || '',
      legalName: vendor.basicInfo.legalName || '',
      registrationNumber: vendor.basicInfo.registrationNumber || '',
      taxId: vendor.basicInfo.taxId || '',
      companyType: vendor.basicInfo.companyType || 'Supplier',
      yearEstablished: vendor.basicInfo.yearEstablished || '',
      website: vendor.basicInfo.website || '',
      email: vendor.basicInfo.email || '',
      phone: vendor.basicInfo.phone || '',
    },
    kycCompliance: {
      kycStatus: vendor.kyc.kycStatus || 'Pending',
      tradeLicense: vendor.kyc.documents.tradeLicense || '',
      taxCertificate: vendor.kyc.documents.taxCertificate || '',
      incorporationCertificate: vendor.kyc.documents.incorporationCertificate || '',
      bankProof: vendor.kyc.documents.bankProof || '',
      addressProof: vendor.kyc.documents.addressProof || '',
      insuranceCertificate: vendor.kyc.documents.insuranceCertificate || '',
      tradeLicenseExpiry: vendor.kyc.expiryDates.tradeLicenseExpiry || '',
      insuranceExpiry: vendor.kyc.expiryDates.insuranceExpiry || '',
    },
    contactDetails: {
      primaryContactName: vendor.contact.primaryContact.name || '',
      primaryContactEmail: vendor.contact.primaryContact.email || '',
      primaryContactPhone: vendor.contact.primaryContact.phone || '',
      primaryContactDesignation: vendor.contact.primaryContact.designation || '',
      secondaryContactName: vendor.contact.secondaryContact?.name || '',
      secondaryContactEmail: vendor.contact.secondaryContact?.email || '',
      secondaryContactPhone: vendor.contact.secondaryContact?.phone || '',
    },
    businessCapability: {
      productCategories: vendor.capability.productCategories || [],
      brandsHandled: vendor.capability.brandsHandled || [],
      certifications: vendor.capability.certifications || [],
      serviceType: vendor.capability.serviceType || 'Supply',
    },
    geographicCoverage: {
      countriesServed: vendor.coverage.countriesServed || [],
      portsServed: vendor.coverage.portsServed || [],
      deliveryTime: vendor.coverage.deliveryTime || '',
      emergencySupply: Boolean(vendor.coverage.emergencySupply),
    },
    financialDetails: {
      paymentTerms: vendor.financial.paymentTerms || 'Net 30',
      currencyAccepted: vendor.financial.currencyAccepted || ['USD'],
      creditLimit: vendor.financial.creditLimit?.toString() || '',
      bankName: vendor.financial.bankDetails?.bankName || '',
      accountNumber: vendor.financial.bankDetails?.accountNumber || '',
      swiftCode: vendor.financial.bankDetails?.swiftCode || '',
      iban: vendor.financial.bankDetails?.iban || '',
    },
  },
  advanced: {
    performanceMetrics: {
      rating: vendor.performance.rating?.toString() || '',
      totalOrders: vendor.performance.totalOrders?.toString() || '',
      onTimeDelivery: vendor.performance.onTimeDelivery || '',
      rejectionRate: vendor.performance.rejectionRate || '',
    },
    systemFlags: {
      isActive: Boolean(vendor.systemFlags.isActive),
      isApproved: Boolean(vendor.systemFlags.isApproved),
      isBlacklisted: Boolean(vendor.systemFlags.isBlacklisted),
      isPreferredVendor: Boolean(vendor.systemFlags.isPreferredVendor),
    },
    contractDetails: {
      contractType: vendor.contract.contractType || 'Spot',
      contractStartDate: vendor.contract.contractStartDate || '',
      contractEndDate: vendor.contract.contractEndDate || '',
    },
    integration: {
      externalVendorId: vendor.integration.externalVendorId || '',
      erpLinked: Boolean(vendor.integration.erpLinked),
      referenceSource: vendor.integration.referenceSource || '',
    },
  },
});
