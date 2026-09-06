import React, { useEffect, useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { ApiException } from '@/lib/apiClient';
import { authService } from '@/services/authService';

import tenantService from '@/services/tenantService';
import { VendorDetailsData } from '@/data/vendorDetailsData';
import {
  buildUpdateVendorPayload,
  cloneInitialVendorDetails,
  mapVendorApiErrorsToFieldErrors,
  mapVendorToDetails,
  validateVendorDetailsFields,
  VendorFieldErrors,
} from './vendorFormMapper';

interface VendorDetailsViewPageProps {
  onNavigate?: (target: string) => void;
  tenantId?: string;
  vendorId?: string;
}

const VendorDetailsViewPage: React.FC<VendorDetailsViewPageProps> = ({
  onNavigate,
  tenantId: propTenantId,
  vendorId,
}) => {
  const session = authService.getSession();
  const tenantId = propTenantId || session?.tenantId || '';

  const [isEditMode, setIsEditMode] = useState(false);
  const [details, setDetails] = useState<VendorDetailsData>(cloneInitialVendorDetails);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState('');
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

  useEffect(() => {
    const fetchVendor = async () => {
      if (!tenantId || !vendorId) {
        setPageError('Vendor context is missing. Open this page from tenant vendors list.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageError('');
        const vendor = await tenantService.getVendorById(tenantId, vendorId);
        setDetails(mapVendorToDetails(vendor));
      } catch (err) {
        console.error('Failed to load vendor details:', err);
        if (err instanceof ApiException) {
          setPageError(err.errorMessage);
        } else {
          setPageError('Failed to load vendor details. Please refresh and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [tenantId, vendorId]);

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

    if (!tenantId || !vendorId) {
      setSaveError('Vendor context is missing. Open this page from tenant vendors list.');
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
      await tenantService.updateVendor(tenantId, vendorId, buildUpdateVendorPayload(details));
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to save vendor details:', err);
      if (err instanceof ApiException) {
        const mappedFieldErrors = mapVendorApiErrorsToFieldErrors(err.errorMessage);
        if (Object.keys(mappedFieldErrors).length > 0) {
          setFieldErrors(mappedFieldErrors);
          setSaveError('Please correct highlighted fields and try again.');
        } else {
          setSaveError(err.errorMessage);
        }
      } else {
        setSaveError('Failed to save vendor details. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Tenant', href: '#' },
    { label: 'Vendors', href: '#' },
    { label: 'Vendor Details', active: true },
  ];

  const actions = (
    <div className="flex flex-col items-end gap-2">
      {(pageError || saveError) && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger max-w-lg text-right">
          {saveError || pageError}
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
          Back
        </Button>
        <Button
          variant={isEditMode ? 'outline' : 'solid'}
          color={isEditMode ? 'danger' : 'primary'}
          size="small"
          onClick={() => {
            setSaveError('');
            setIsEditMode((prev) => !prev);
          }}
          className="gap-2"
        >
          {isEditMode ? 'Cancel Edit' : 'Edit Details'}
        </Button>
        {isEditMode && (
          <Button
            variant="solid"
            color="primary"
            size="small"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-primary/20 bg-primary-soft px-4 py-2 text-sm text-primary">
          Loading vendor details...
        </div>
      </div>
    );
  }

  return (
    <DetailsView
      data={details}
      onChange={(next) => setDetails(next as VendorDetailsData)}
      fieldErrors={fieldErrors}
      onFieldInteraction={handleFieldInteraction}
      showSectionSaveButtons={false}
      breadcrumbItems={breadcrumbItems}
      actions={actions}
      pageTitle={`Vendor KYC Details`}
      pageSubtitle="Complete vendor profile with compliance, capability, and commercial controls."
      isEditMode={isEditMode}
    />
  );
};

export default VendorDetailsViewPage;
