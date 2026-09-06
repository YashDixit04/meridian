import React, { useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import Input from '@/components/ui/Input';
import { VendorDetailsData } from '@/data/vendorDetailsData';
import { ApiException } from '@/lib/apiClient';
import publicVendorRegistrationService from '@/services/publicVendorRegistrationService';
import {
  buildCreateVendorPayload,
  cloneInitialVendorDetails,
  mapVendorApiErrorsToFieldErrors,
  validateVendorDetailsFields,
  VendorFieldErrors,
} from '@/pages/Details/vendorFormMapper';

interface VendorRegistrationPageProps {
  onBackToLogin?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TENANT_USER_TYPE_OPTIONS = [
  { value: 'Vendor Users only', label: 'Vendor Users only' },
  { value: 'Both SMC and Vendor Users', label: 'Both SMC and Vendor Users' },
  { value: 'SMC Users only', label: 'SMC Users only' },
];

const REFERENCE_SOURCE_OPTIONS = [
  { value: 'Self Registered', label: 'Self Registered' },
  { value: 'SMC Referral', label: 'SMC Referral' },
  { value: 'Partner Referral', label: 'Partner Referral' },
  { value: 'Web Discovery', label: 'Web Discovery' },
  { value: 'Existing Contract Renewal', label: 'Existing Contract Renewal' },
  { value: 'Other', label: 'Other' },
];

const normalizeOptionalText = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const VendorRegistrationPage: React.FC<VendorRegistrationPageProps> = ({ onBackToLogin }) => {
  const [details, setDetails] = useState<VendorDetailsData>(cloneInitialVendorDetails);
  const [tenantContactEmail, setTenantContactEmail] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [tenantUserTypeSelection, setTenantUserTypeSelection] = useState<'SMC Users only' | 'Vendor Users only' | 'Both SMC and Vendor Users'>('Vendor Users only');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<VendorFieldErrors>({});

  const referenceSource = details.advanced.integration.referenceSource || '';

  const handleReferenceSourceChange = (value: string | string[]) => {
    const selected = Array.isArray(value) ? value[0] : value;
    setDetails((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        integration: {
          ...prev.advanced.integration,
          referenceSource: selected,
        },
      },
    }));
  };

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

  const handleSubmit = async () => {
    setSaveError('');
    setSuccessMessage('');
    setFieldErrors({});

    const validationErrors = validateVendorDetailsFields(details);

    const normalizedTenantEmail = normalizeOptionalText(tenantContactEmail);
    if (normalizedTenantEmail && !EMAIL_REGEX.test(normalizedTenantEmail)) {
      validationErrors.tenantContactEmail = 'Please enter a valid tenant contact email.';
    }

    const normalizedApplicantEmail = normalizeOptionalText(applicantEmail);
    if (normalizedApplicantEmail && !EMAIL_REGEX.test(normalizedApplicantEmail)) {
      validationErrors.applicantEmail = 'Please enter a valid applicant email.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSaveError('Please correct highlighted fields and try again.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await publicVendorRegistrationService.registerVendor({
        vendor: buildCreateVendorPayload(details),
        tenantContactEmail: normalizedTenantEmail,
        applicantEmail: normalizedApplicantEmail,
        sendForApproval: true,
        tenantUserTypeSelection,
      });

      const tenantResolution = response.tenantLinkedByEmail
        ? 'Linked to the matching tenant by contact email.'
        : response.tenantCreated
          ? 'No tenant email was linked, so a new tenant workspace was auto-created.'
          : 'Registration was saved.';

      const approvalDetails = response.approvalNotificationSent
        ? `Approval request has been sent to ${response.approvalRecipientEmail || 'aksyashdixit@gmail.com'}.`
        : `Approval request has been queued for ${response.approvalRecipientEmail || 'aksyashdixit@gmail.com'} (SMTP config is pending).`;

      setSuccessMessage(`${response.message} ${tenantResolution} ${approvalDetails}`);
      setDetails(cloneInitialVendorDetails());
      setTenantContactEmail('');
      setApplicantEmail('');
      setTenantUserTypeSelection('Vendor Users only');
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
        setSaveError('Failed to submit vendor registration. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const actions = (
    <div className="flex flex-col items-end gap-3">
      {saveError && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger max-w-xl text-right">
          {saveError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success max-w-xl text-right">
          {successMessage}
        </div>
      )}

      <div className="w-[22rem] space-y-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-grey-500">Reference Source (Optional)</label>
          <Combobox
            options={REFERENCE_SOURCE_OPTIONS}
            value={referenceSource}
            onChange={handleReferenceSourceChange}
            placeholder="Select reference source"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-grey-500">Tenant User Type</label>
          <Combobox
            options={TENANT_USER_TYPE_OPTIONS}
            value={tenantUserTypeSelection}
            onChange={(value) => {
              const selected = Array.isArray(value) ? value[0] : value;
              if (
                selected === 'Vendor Users only'
                || selected === 'SMC Users only'
                || selected === 'Both SMC and Vendor Users'
              ) {
                setTenantUserTypeSelection(selected);
              }
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-grey-500">
            Tenant Contact Email (Optional)
          </label>
          <Input
            type="email"
            value={tenantContactEmail}
            onChange={(event) => setTenantContactEmail(event.target.value)}
            placeholder="tenant@company.com"
            state={fieldErrors.tenantContactEmail ? 'error' : 'default'}
          />
          {fieldErrors.tenantContactEmail && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.tenantContactEmail}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-grey-500">Applicant Email (Optional)</label>
          <Input
            type="email"
            value={applicantEmail}
            onChange={(event) => setApplicantEmail(event.target.value)}
            placeholder="you@vendor.com"
            state={fieldErrors.applicantEmail ? 'error' : 'default'}
          />
          {fieldErrors.applicantEmail && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.applicantEmail}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" color="grey" size="small" onClick={onBackToLogin}>
          Back to Login
        </Button>
        <Button
          variant="solid"
          color="primary"
          size="small"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? 'Sending...' : 'Send for Approval'}
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
      breadcrumbItems={[
        { label: 'Login', href: '/' },
        { label: 'Vendor Registration', href: '/vendor-register', active: true },
      ]}
      actions={actions}
      pageTitle="Vendor KYC Registration"
      pageSubtitle="Register as a vendor without login. You can optionally link by tenant contact email, or we will auto-create a tenant workspace and submit for superadmin approval."
      isEditMode={true}
    />
  );
};

export default VendorRegistrationPage;
