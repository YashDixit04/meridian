export interface VesselDetailsProfile {
  type: string;
  basic: {
    coreInformation: {
      vesselName: string;
      imoNumber: string;
      vesselType: string;
      flag: string;
      callSign: string;
      mmsiNumber: string;
      yearBuilt: string;
      deadweight: string;
      grossTonnage: string;
      netTonnage: string;
    };
    ownershipAndManagement: {
      ownerCompany: string;
      operatorCompany: string;
      technicalManager: string;
      commercialManager: string;
    };
    operationalDetails: {
      currentStatus: 'Active' | 'In Port' | 'Sailing' | 'Dry Dock';
      currentPort: string;
      nextPort: string;
      eta: string;
      etd: string;
      tradingArea: string;
    };
    procurementSettings: {
      defaultCurrency: string;
      budgetLimit: number;
      approvalRequired: boolean;
      preferredPorts: string;
      preferredVendors: string;
      contractType: 'Spot' | 'Annual' | 'Contract';
    };
  };
  advanced: {
    crewMapping: {
      captain: string;
      chiefEngineer: string;
      assignedDepartments: string;
    };
    integration: {
      erpSystem: string;
      externalVesselId: string;
      syncEnabled: boolean;
    };
    systemFlags: {
      isActive: boolean;
      isProcurementEnabled: boolean;
      isVendorAccessAllowed: boolean;
      isBudgetControlled: boolean;
    };
  };
}

export const vesselDetailsData: VesselDetailsProfile = {
  type: 'Vessel',
  basic: {
    coreInformation: {
      vesselName: '',
      imoNumber: '',
      vesselType: '',
      flag: '',
      callSign: '',
      mmsiNumber: '',
      yearBuilt: '',
      deadweight: '',
      grossTonnage: '',
      netTonnage: '',
    },
    ownershipAndManagement: {
      ownerCompany: '',
      operatorCompany: '',
      technicalManager: '',
      commercialManager: '',
    },
    operationalDetails: {
      currentStatus: 'Active',
      currentPort: '',
      nextPort: '',
      eta: '',
      etd: '',
      tradingArea: '',
    },
    procurementSettings: {
      defaultCurrency: 'USD',
      budgetLimit: 0,
      approvalRequired: true,
      preferredPorts: '',
      preferredVendors: '',
      contractType: 'Spot',
    },
  },
  advanced: {
    crewMapping: {
      captain: '',
      chiefEngineer: '',
      assignedDepartments: '',
    },
    integration: {
      erpSystem: '',
      externalVesselId: '',
      syncEnabled: false,
    },
    systemFlags: {
      isActive: true,
      isProcurementEnabled: true,
      isVendorAccessAllowed: true,
      isBudgetControlled: true,
    },
  },
};
