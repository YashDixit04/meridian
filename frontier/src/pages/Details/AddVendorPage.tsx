import React, { useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { ApiException } from '@/lib/apiClient';
import { authService } from '@/services/authService';
import tenantService from '@/services/tenantService';
import { VendorDetailsData } from '@/data/vendorDetailsData';
import {
  buildCreateVendorPayload,
  cloneInitialVendorDetails,
  mapVendorApiErrorsToFieldErrors,
  validateVendorDetailsFields,
  VendorFieldErrors,
} from './vendorFormMapper';

interface AddVendorPageProps {
  onNavigate?: (target: string) => void;
  tenantId?: string;
}

const AddVendorPage: React.FC<AddVendorPageProps> = ({ onNavigate, tenantId: propTenantId }) => {
  const session = authService.getSession();
  const tenantId = propTenantId || session?.tenantId || '';

  const [details, setDetails] = useState<VendorDetailsData>(cloneInitialVendorDetails);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<VendorFieldErrors>({});

  const handleFieldInteraction = (fieldPath: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldPath]) {
        return prev;
      }

      const next = { ...prev };
      delete next[fieldPath];
      return next;
    });
  };

  const navigateBack = () => {
    if (tenantId) {
      onNavigate?.(`/tenant/${tenantId}/vendors`);
      return;
    }

    onNavigate?.('tenantVendors');
  };

  const handleSave = async () => {
    setSaveError('');
    setFieldErrors({});

    if (!tenantId) {
      setSaveError('Missing tenant context. Open this page from Tenant Details.');
      return;
    }

    const validationErrors = validateVendorDetailsFields(details);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSaveError('Please correct highlighted fields and try again.');
      return;
    }

    setIsSaving(true);

    try {
      await tenantService.createVendor(tenantId, buildCreateVendorPayload(details));
      navigateBack();
    } catch (err) {
      if (err instanceof ApiException) {
        const mappedFieldErrors = mapVendorApiErrorsToFieldErrors(err.errorMessage);
        if (Object.keys(mappedFieldErrors).length > 0) {
          setFieldErrors(mappedFieldErrors);
          setSaveError('Please correct highlighted fields and try again.');
        } else {
          setSaveError(err.errorMessage);
        }
      } else {
        setSaveError('Failed to create vendor. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Tenant', href: '#' },
    { label: 'Vendors', href: '#' },
    { label: 'Add Vendor', active: true },
  ];

  const actions = (
    <div className="flex flex-col items-end gap-2">
      {saveError && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger max-w-lg text-right">
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
          {isSaving ? 'Creating...' : 'Create Vendor'}
        </Button>
      </div>
    </div>
  );

  return (
    <DetailsView
      data={details}
      onChange={(next) => setDetails(next as VendorDetailsData)}
      fieldErrors={fieldErrors}
      onFieldInteraction={handleFieldInteraction}
      showSectionSaveButtons={false}
      breadcrumbItems={breadcrumbItems}
      actions={actions}
      pageTitle="Create New Vendor"
      pageSubtitle="Register a tenant-scoped vendor profile with compliance, capability, and contract details."
      isEditMode={true}
    />
  );
};

export default AddVendorPage;
