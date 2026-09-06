import React, { useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { ApiException } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import tenantService, { CreateVesselPayload } from '@/services/tenantService';
import { vesselDetailsData, VesselDetailsProfile } from '@/data/vesselDetailsData';

interface AddVesselPageProps {
  onNavigate?: (target: string) => void;
  tenantId?: string;
}

const VALID_STATUSES: Array<CreateVesselPayload['operations']['currentStatus']> = [
  'Active',
  'In Port',
  'Sailing',
  'Dry Dock',
];

const VALID_CONTRACT_TYPES: Array<NonNullable<CreateVesselPayload['procurement']['contractType']>> = [
  'Spot',
  'Annual',
  'Contract',
];

const cloneInitialData = (): VesselDetailsProfile => ({
  ...vesselDetailsData,
  basic: {
    ...vesselDetailsData.basic,
    coreInformation: {
      ...vesselDetailsData.basic.coreInformation,
    },
    ownershipAndManagement: {
      ...vesselDetailsData.basic.ownershipAndManagement,
    },
    operationalDetails: {
      ...vesselDetailsData.basic.operationalDetails,
    },
    procurementSettings: {
      ...vesselDetailsData.basic.procurementSettings,
    },
  },
  advanced: {
    ...vesselDetailsData.advanced,
    crewMapping: {
      ...vesselDetailsData.advanced.crewMapping,
    },
    integration: {
      ...vesselDetailsData.advanced.integration,
    },
    systemFlags: {
      ...vesselDetailsData.advanced.systemFlags,
    },
  },
});

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeRequiredText = (value: unknown): string => normalizeOptionalText(value) || '';

const normalizeOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }

  return value;
};

const splitCsv = (value: unknown): string[] => {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const AddVesselPage: React.FC<AddVesselPageProps> = ({ onNavigate, tenantId: propTenantId }) => {
  const session = authService.getSession();
  const tenantId = propTenantId || session?.tenantId || '';

  const [details, setDetails] = useState<VesselDetailsProfile>(cloneInitialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const navigateBack = () => {
    if (tenantId) {
      onNavigate?.(`/tenant/${tenantId}/vessels`);
      return;
    }

    onNavigate?.('tenantVessels');
  };

  const handleSave = async () => {
    setSaveError('');

    if (!tenantId) {
      setSaveError('Missing tenant context. Open this page from Tenant Details.');
      return;
    }

    const vesselName = normalizeRequiredText(details.basic.coreInformation.vesselName);
    const imoNumber = normalizeRequiredText(details.basic.coreInformation.imoNumber);
    const vesselType = normalizeRequiredText(details.basic.coreInformation.vesselType);
    const flag = normalizeRequiredText(details.basic.coreInformation.flag);
    const ownerCompany = normalizeRequiredText(details.basic.ownershipAndManagement.ownerCompany);
    const operatorCompany = normalizeRequiredText(details.basic.ownershipAndManagement.operatorCompany);
    const currentPort = normalizeRequiredText(details.basic.operationalDetails.currentPort);

    if (!vesselName || !imoNumber || !vesselType || !flag || !ownerCompany || !operatorCompany || !currentPort) {
      setSaveError('Please fill all required vessel fields before creating.');
      return;
    }

    const currentStatus = details.basic.operationalDetails.currentStatus;
    if (!VALID_STATUSES.includes(currentStatus)) {
      setSaveError('Please select a valid operational status.');
      return;
    }

    const contractType = details.basic.procurementSettings.contractType;
    if (!VALID_CONTRACT_TYPES.includes(contractType)) {
      setSaveError('Please select a valid contract type.');
      return;
    }

    setIsSaving(true);

    const preferredPorts = splitCsv(details.basic.procurementSettings.preferredPorts);
    const preferredVendors = splitCsv(details.basic.procurementSettings.preferredVendors);
    const assignedDepartments = splitCsv(details.advanced.crewMapping.assignedDepartments);

    const payload: CreateVesselPayload = {
      coreInfo: {
        vesselName,
        imoNumber,
        vesselType,
        flag,
        callSign: normalizeOptionalText(details.basic.coreInformation.callSign),
        mmsiNumber: normalizeOptionalText(details.basic.coreInformation.mmsiNumber),
        yearBuilt: normalizeOptionalText(details.basic.coreInformation.yearBuilt),
        deadweight: normalizeOptionalText(details.basic.coreInformation.deadweight),
        grossTonnage: normalizeOptionalText(details.basic.coreInformation.grossTonnage),
        netTonnage: normalizeOptionalText(details.basic.coreInformation.netTonnage),
      },
      ownership: {
        ownerCompany,
        operatorCompany,
        technicalManager: normalizeOptionalText(details.basic.ownershipAndManagement.technicalManager),
        commercialManager: normalizeOptionalText(details.basic.ownershipAndManagement.commercialManager),
      },
      operations: {
        currentStatus,
        currentPort,
        nextPort: normalizeOptionalText(details.basic.operationalDetails.nextPort),
        eta: normalizeOptionalText(details.basic.operationalDetails.eta),
        etd: normalizeOptionalText(details.basic.operationalDetails.etd),
        tradingArea: normalizeOptionalText(details.basic.operationalDetails.tradingArea),
      },
      procurement: {
        defaultCurrency:
          normalizeOptionalText(details.basic.procurementSettings.defaultCurrency) || 'USD',
        budgetLimit: normalizeOptionalNumber(details.basic.procurementSettings.budgetLimit),
        approvalRequired: details.basic.procurementSettings.approvalRequired,
        preferredPorts: preferredPorts.length > 0 ? preferredPorts : undefined,
        preferredVendors: preferredVendors.length > 0 ? preferredVendors : undefined,
        contractType,
      },
      crew: {
        captain: normalizeOptionalText(details.advanced.crewMapping.captain),
        chiefEngineer: normalizeOptionalText(details.advanced.crewMapping.chiefEngineer),
        assignedDepartments,
      },
      integration: {
        erpSystem: normalizeOptionalText(details.advanced.integration.erpSystem),
        externalVesselId: normalizeOptionalText(details.advanced.integration.externalVesselId),
        syncEnabled: details.advanced.integration.syncEnabled,
      },
      systemFlags: {
        isActive: details.advanced.systemFlags.isActive,
        isProcurementEnabled: details.advanced.systemFlags.isProcurementEnabled,
        isVendorAccessAllowed: details.advanced.systemFlags.isVendorAccessAllowed,
        isBudgetControlled: details.advanced.systemFlags.isBudgetControlled,
      },
    };

    try {
      await tenantService.createVessel(tenantId, payload);
      navigateBack();
    } catch (err) {
      if (err instanceof ApiException) {
        setSaveError(err.errorMessage);
      } else {
        setSaveError('Failed to create vessel. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Tenant', href: '#' },
    { label: 'Vessels', href: '#' },
    { label: 'Add Vessel', active: true },
  ];

  const actions = (
    <div className="flex flex-col items-end gap-2">
      {saveError && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger">
          {saveError}
        </div>
      )}
      <div className="flex gap-3">
        <Button
          variant="outline"
          color="grey"
          size="small"
          onClick={navigateBack}
          className="gap-2"
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          color="primary"
          size="small"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? 'Creating...' : 'Create Vessel'}
        </Button>
      </div>
    </div>
  );

  return (
    <DetailsView
      data={details}
      onChange={(next) => setDetails(next as VesselDetailsProfile)}
      showSectionSaveButtons={false}
      breadcrumbItems={breadcrumbItems}
      actions={actions}
      pageTitle="Create New Vessel"
      pageSubtitle="Fill in structured vessel details for tenant-scoped operations and procurement."
      isEditMode={true}
    />
  );
};

export default AddVesselPage;
