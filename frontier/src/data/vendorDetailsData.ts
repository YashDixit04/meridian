export const vendorDetailsData = {
  type: 'Vendor',
  basic: {
    basicCompanyInformation: {
      companyName: '',
      legalName: '',
      registrationNumber: '',
      taxId: '',
      companyType: 'Supplier',
      yearEstablished: '',
      website: '',
      email: '',
      phone: '',
    },
    kycCompliance: {
      kycStatus: 'Pending',
      tradeLicense: '',
      taxCertificate: '',
      incorporationCertificate: '',
      bankProof: '',
      addressProof: '',
      insuranceCertificate: '',
      tradeLicenseExpiry: '',
      insuranceExpiry: '',
    },
    contactDetails: {
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      primaryContactDesignation: '',
      secondaryContactName: '',
      secondaryContactEmail: '',
      secondaryContactPhone: '',
    },
    businessCapability: {
      productCategories: [] as string[],
      brandsHandled: [] as string[],
      certifications: [] as string[],
      serviceType: 'Supply',
    },
    geographicCoverage: {
      countriesServed: [] as string[],
      portsServed: [] as string[],
      deliveryTime: '48 Hours',
      emergencySupply: false,
    },
    financialDetails: {
      paymentTerms: 'Net 30',
      currencyAccepted: ['USD'] as string[],
      creditLimit: '',
      bankName: '',
      accountNumber: '',
      swiftCode: '',
      iban: '',
    },
  },
  advanced: {
    performanceMetrics: {
      rating: '',
      totalOrders: '',
      onTimeDelivery: '',
      rejectionRate: '',
    },
    systemFlags: {
      isActive: true,
      isApproved: false,
      isBlacklisted: false,
      isPreferredVendor: false,
    },
    contractDetails: {
      contractType: 'Spot',
      contractStartDate: '',
      contractEndDate: '',
    },
    integration: {
      externalVendorId: '',
      erpLinked: false,
      referenceSource: '',
    },
  },
};

export type VendorDetailsData = typeof vendorDetailsData;
