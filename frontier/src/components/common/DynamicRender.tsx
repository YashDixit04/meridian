import React from 'react';
import {
  Heading5,
  BodyBase,
  LabelSm,
} from '../ui/Typography';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Combobox from '../ui/Combobox';

const vendorMultiSelectOptions: Record<string, Array<{ value: string; label: string }>> = {
  productCategories: [
    { value: 'Provisions', label: 'Provisions' },
    { value: 'Spares', label: 'Spares' },
    { value: 'Technical Stores', label: 'Technical Stores' },
    { value: 'Deck Stores', label: 'Deck Stores' },
    { value: 'Engine Stores', label: 'Engine Stores' },
    { value: 'Cabin Stores', label: 'Cabin Stores' },
    { value: 'Bonded Stores', label: 'Bonded Stores' },
    { value: 'Lubricants', label: 'Lubricants' },
  ],
  brandsHandled: [
    { value: 'Unilever Food Solutions', label: 'Unilever Food Solutions' },
    { value: 'Nestle Professional', label: 'Nestle Professional' },
    { value: 'Shell', label: 'Shell' },
    { value: 'TotalEnergies', label: 'TotalEnergies' },
    { value: 'Bosch', label: 'Bosch' },
    { value: 'Siemens', label: 'Siemens' },
  ],
  certifications: [
    { value: 'ISO 9001', label: 'ISO 9001' },
    { value: 'ISO 14001', label: 'ISO 14001' },
    { value: 'HACCP', label: 'HACCP' },
    { value: 'MARPOL Compliant', label: 'MARPOL Compliant' },
  ],
  countriesServed: [
    { value: 'Singapore', label: 'Singapore' },
    { value: 'UAE', label: 'UAE' },
    { value: 'India', label: 'India' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'United States', label: 'United States' },
  ],
  portsServed: [
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Rotterdam', label: 'Rotterdam' },
    { value: 'Houston', label: 'Houston' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Busan', label: 'Busan' },
  ],
  currencyAccepted: [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'SGD', label: 'SGD' },
    { value: 'AED', label: 'AED' },
    { value: 'INR', label: 'INR' },
  ],
};

const vendorDocumentFields = new Set([
  'tradeLicense',
  'taxCertificate',
  'incorporationCertificate',
  'bankProof',
  'addressProof',
  'insuranceCertificate',
]);

const dateFieldKeys = new Set([
  'tradeLicenseExpiry',
  'insuranceExpiry',
  'contractStartDate',
  'contractEndDate',
  'eta',
  'etd',
]);

const numberFieldKeys = new Set([
  'creditLimit',
  'rating',
  'totalOrders',
  'yearEstablished',
  'maxUserCreations',
  'maxSubUsers',
  'maxStorageGB',
  'totalVendorUsersCount',
  'baseUsersCount',
  'companySpecificCatalogueCount',
  'budgetLimit',
]);

const emailFieldKeys = new Set([
  'email',
  'primaryContactEmail',
  'secondaryContactEmail',
  'contactEmail',
]);

const normalizeDateValueForInput = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const matchedDate = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return matchedDate ? matchedDate[1] : '';
};

const resolveFieldInputType = (fieldKey: string, value: unknown): 'text' | 'number' | 'date' | 'email' | 'password' => {
  const normalizedKey = fieldKey.toLowerCase();
  if (normalizedKey.includes('password')) {
    return 'password';
  }

  if (
    dateFieldKeys.has(fieldKey)
    || normalizedKey.includes('date')
    || normalizedKey.includes('expiry')
  ) {
    return 'date';
  }

  if (numberFieldKeys.has(fieldKey) || typeof value === 'number') {
    return 'number';
  }

  if (emailFieldKeys.has(fieldKey) || normalizedKey.endsWith('email')) {
    return 'email';
  }

  return 'text';
};

const getFieldTypeHint = (inputType: 'text' | 'number' | 'date' | 'email'): string | null => {
  if (inputType === 'date') {
    return 'Date field: use YYYY-MM-DD.';
  }

  if (inputType === 'number') {
    return 'Number field: only numeric values are accepted.';
  }

  return null;
};

// --- Utility: Dynamic Label Generator ---
export const getLabel = (key: string): string => {
  const result = key.replace(/([A-Z])/g, ' $1').trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const isRenderableImageSrc = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0 && !value.startsWith('blob:');
};

const MAX_PROFILE_PHOTO_DIMENSION = 768;
const PROFILE_PHOTO_QUALITY = 0.82;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Invalid file data'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const compressImageToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        let { width, height } = image;

        if (width > MAX_PROFILE_PHOTO_DIMENSION || height > MAX_PROFILE_PHOTO_DIMENSION) {
          const scale = Math.min(
            MAX_PROFILE_PHOTO_DIMENSION / width,
            MAX_PROFILE_PHOTO_DIMENSION / height,
          );
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', PROFILE_PHOTO_QUALITY);
        URL.revokeObjectURL(objectUrl);
        resolve(compressed);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error instanceof Error ? error : new Error('Image compression failed'));
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    image.src = objectUrl;
  });

// --- Component: Dynamic Field Renderer ---
interface DynamicFieldProps {
  fieldKey: string;
  value: any;
  sectionKey: string;
  parentKey: string;
  onInputChange: (parent: string, section: string, field: string, value: any) => void;
  isEditMode?: boolean;
  fieldErrors?: Record<string, string>;
  onFieldInteraction?: (fieldPath: string) => void;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  fieldKey,
  value,
  sectionKey,
  parentKey,
  onInputChange,
  isEditMode = true,
  fieldErrors,
  onFieldInteraction,
}) => {
  if (value === null || value === undefined) {
    return null;
  }

  const label = getLabel(fieldKey);
  const fullFieldPath = `${parentKey}.${sectionKey}.${fieldKey}`;
  const fieldError =
    fieldErrors?.[fullFieldPath]
    || fieldErrors?.[`${sectionKey}.${fieldKey}`]
    || fieldErrors?.[fieldKey];

  const applyFieldChange = (nextValue: any): void => {
    onFieldInteraction?.(fullFieldPath);
    onInputChange(parentKey, sectionKey, fieldKey, nextValue);
  };

  const renderFieldFeedback = (hint: string | null = null): React.ReactNode => {
    if (!fieldError && !hint) {
      return null;
    }

    return (
      <div className="mt-1.5">
        {fieldError && <p className="text-xs font-medium text-danger">{fieldError}</p>}
        {!fieldError && hint && (
          <p className="text-xs text-grey-500 dark:text-grey-400">{hint}</p>
        )}
      </div>
    );
  };

  // Rule: Skip nested objects (like createdBy) — render their fields flat
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <>
        {Object.entries(value).map(([nestedKey, nestedValue]) => (
          <DynamicField
            key={nestedKey}
            fieldKey={nestedKey}
            value={nestedValue}
            sectionKey={sectionKey}
            parentKey={parentKey}
            onInputChange={onInputChange}
            isEditMode={isEditMode}
            fieldErrors={fieldErrors}
            onFieldInteraction={onFieldInteraction}
          />
        ))}
      </>
    );
  }

  // Rule: boolean -> Switch
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-grey-100 dark:border-grey-800/50 last:border-0">
        <div>
          <BodyBase className="font-medium text-grey-900 dark:text-white">{label}</BodyBase>
        </div>
        {isEditMode ? (
          <Switch
            checked={value}
            onChange={(checked) => applyFieldChange(checked)}
          />
        ) : (
          <Badge
            variant="soft"
            color={value ? 'success' : 'danger'}
            className="rounded-full px-3"
          >
            {value ? 'Enabled' : 'Disabled'}
          </Badge>
        )}
      </div>
    );
  }

  // Rule: array -> Badge list (always read-only style)
  if (Array.isArray(value)) {
    if (isEditMode) {
      const options = vendorMultiSelectOptions[fieldKey] || value.map((item) => ({
        value: String(item),
        label: String(item),
      }));

      const normalizedValues = value
        .map((item) => (typeof item === 'string' ? item : String(item)))
        .filter((item) => item.trim().length > 0);

      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3">
            <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
          </div>
          <div className="md:col-span-9">
            <Combobox
              options={options}
              value={normalizedValues}
              onChange={(val) =>
                applyFieldChange(Array.isArray(val) ? val : [val])
              }
              multiple
              state={fieldError ? 'error' : 'default'}
            />
            {renderFieldFeedback()}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <div className="flex flex-wrap gap-2">
            {value.map((item: string, idx: number) => (
              <Badge key={idx} variant="soft" className="bg-grey-50 dark:bg-black border-grey-300 dark:border-grey-700">{item}</Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Rule: document fields -> URL input + upload button
  if (vendorDocumentFields.has(fieldKey) && typeof value === 'string') {
    if (!isEditMode) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3">
            <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
          </div>
          <div className="md:col-span-9">
            <BodyBase className="text-grey-700 dark:text-grey-300 py-2 break-all">
              {value || 'Not uploaded'}
            </BodyBase>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={value}
                onChange={(e) => applyFieldChange(e.target.value)}
                className="bg-grey-50 dark:bg-grey-900/50"
                placeholder="Enter file URL"
                state={fieldError ? 'error' : 'default'}
              />
              {renderFieldFeedback()}
            </div>
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  const uploadedValue = `uploaded://${encodeURIComponent(file.name)}`;
                  applyFieldChange(uploadedValue);
                  event.currentTarget.value = '';
                }}
              />
              <Button variant="outline" size="medium">Upload</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rule: Profile Photo -> Avatar with File upload mock
  if (fieldKey.toLowerCase().includes('photo') && typeof value === 'string') {
    const avatarSrc = isRenderableImageSrc(value)
      ? value
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}`;

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <div className="flex items-center gap-4">
            <Avatar src={avatarSrc} alt={label} size="lg" />
            {isEditMode && (
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    try {
                      const imageDataUrl = await compressImageToDataUrl(file);
                      applyFieldChange(imageDataUrl);
                    } catch {
                      const rawImageDataUrl = await readFileAsDataUrl(file);
                      applyFieldChange(rawImageDataUrl);
                    }

                    // Reset input so selecting the same file again still triggers onChange.
                    e.currentTarget.value = '';
                  }} 
                />
                <Button variant="outline" size="medium">Upload New Photo</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rule: Specific Combobox fields
  const comboboxFields = [
    'apiRequestsTier',
    'userTypeSelection',
    'country',
    'currency',
    'defaultCurrency',
    'specificPorts',
    'currentStatus',
    'contractType',
    'companyType',
    'kycStatus',
    'serviceType',
    'paymentTerms',
    'deliveryTime',
    'referenceSource',
  ];
  if (comboboxFields.includes(fieldKey)) {
    if (!isEditMode) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3">
            <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
          </div>
          <div className="md:col-span-9">
            <BodyBase className="text-grey-700 dark:text-grey-300 py-2">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </BodyBase>
          </div>
        </div>
      );
    }

    let options: { value: string, label: string }[] = [];
    let isMultiple = false;

    if (fieldKey === 'country') {
      options = [
        { value: 'United States', label: 'United States' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'India', label: 'India' },
        { value: 'Singapore', label: 'Singapore' },
        { value: 'UAE', label: 'UAE' },
      ];
    } else if (fieldKey === 'currency' || fieldKey === 'defaultCurrency') {
      options = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'INR', label: 'INR (₹)' },
        { value: 'SGD', label: 'SGD (S$)' },
        { value: 'AED', label: 'AED (د.إ)' },
        { value: 'EUR', label: 'EUR (€)' },
      ];
    } else if (fieldKey === 'currentStatus') {
      options = [
        { value: 'Active', label: 'Active' },
        { value: 'In Port', label: 'In Port' },
        { value: 'Sailing', label: 'Sailing' },
        { value: 'Dry Dock', label: 'Dry Dock' },
      ];
    } else if (fieldKey === 'contractType') {
      options = [
        { value: 'Spot', label: 'Spot' },
        { value: 'Annual', label: 'Annual' },
        { value: 'Contract', label: 'Contract' },
      ];
    } else if (fieldKey === 'companyType') {
      options = [
        { value: 'Supplier', label: 'Supplier' },
        { value: 'Manufacturer', label: 'Manufacturer' },
        { value: 'Trader', label: 'Trader' },
      ];
    } else if (fieldKey === 'kycStatus') {
      options = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Verified', label: 'Verified' },
        { value: 'Rejected', label: 'Rejected' },
      ];
    } else if (fieldKey === 'serviceType') {
      options = [
        { value: 'Supply', label: 'Supply' },
        { value: 'Service', label: 'Service' },
        { value: 'Both', label: 'Both' },
      ];
    } else if (fieldKey === 'paymentTerms') {
      options = [
        { value: 'Advance', label: 'Advance' },
        { value: 'Net 15', label: 'Net 15' },
        { value: 'Net 30', label: 'Net 30' },
        { value: 'Net 45', label: 'Net 45' },
        { value: 'Net 60', label: 'Net 60' },
      ];
    } else if (fieldKey === 'deliveryTime') {
      options = [
        { value: '24 Hours', label: '24 Hours' },
        { value: '48 Hours', label: '48 Hours' },
        { value: '3-5 Days', label: '3-5 Days' },
        { value: '1 Week', label: '1 Week' },
      ];
    } else if (fieldKey === 'referenceSource') {
      options = [
        { value: 'Self Registered', label: 'Self Registered' },
        { value: 'SMC Referral', label: 'SMC Referral' },
        { value: 'Partner Referral', label: 'Partner Referral' },
        { value: 'Web Discovery', label: 'Web Discovery' },
        { value: 'Existing Contract Renewal', label: 'Existing Contract Renewal' },
        { value: 'Other', label: 'Other' },
      ];
    } else if (fieldKey === 'apiRequestsTier') {
      options = [
        { value: 'Free', label: 'Free Tier' },
        { value: 'Standard', label: 'Standard (100k/mo)' },
        { value: 'Unlimited', label: 'Unlimited' },
      ];
    } else if (fieldKey === 'userTypeSelection') {
      options = [
        { value: 'SMC Users only', label: 'SMC Users only' },
        { value: 'Vendor Users only', label: 'Vendor Users only' },
        { value: 'Both SMC and Vendor Users', label: 'Both SMC and Vendor Users' },
      ];
    } else if (fieldKey === 'specificPorts') {
      isMultiple = true;
      options = [
        { value: 'Global (All Ports)', label: 'Global (All Ports)' },
        { value: 'Singapore', label: 'Singapore' },
        { value: 'Rotterdam', label: 'Rotterdam' },
        { value: 'Shanghai', label: 'Shanghai' },
        { value: 'Dubai', label: 'Dubai' },
        { value: 'Houston', label: 'Houston' },
        { value: 'Mumbai', label: 'Mumbai' },
        { value: 'Busan', label: 'Busan' },
        { value: 'Antwerp', label: 'Antwerp' },
      ];
    }

    // Ensure array for multiple select
    const formattedValue = isMultiple && typeof value === 'string'
      ? (value ? value.split(',').map(s => s.trim()) : [])
      : value;

    const handleComboboxChange = (val: string | string[]) => {
      // Re-join multi-select values into string to keep backwards compatibility with backend currently
      const finalValue = isMultiple && Array.isArray(val) ? val.join(', ') : val;
      applyFieldChange(finalValue);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <Combobox
             options={options}
             value={formattedValue}
             onChange={handleComboboxChange}
             multiple={isMultiple}
             state={fieldError ? 'error' : 'default'}
          />
          {renderFieldFeedback()}
        </div>
      </div>
    );
  }

  // Rule: string or number -> Input (editable) or plain text (view mode)
  if (!isEditMode) {
    const isPassword = fieldKey.toLowerCase().includes('password');
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-3">
          <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
        </div>
        <div className="md:col-span-9">
          <BodyBase className="text-grey-700 dark:text-grey-300 py-2">
            {isPassword ? '••••••••' : String(value ?? '')}
          </BodyBase>
        </div>
      </div>
    );
  }

  const resolvedInputType = resolveFieldInputType(fieldKey, value);
  const fieldTypeHint = getFieldTypeHint(resolvedInputType);
  const displayValue = resolvedInputType === 'date'
    ? normalizeDateValueForInput(value)
    : value;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-3">
        <LabelSm className="text-grey-900 dark:text-white font-medium">{label}</LabelSm>
      </div>
      <div className="md:col-span-9">
        <Input
          type={resolvedInputType}
          value={displayValue}
          onChange={(e) => {
            const nextValue = e.target.value;

            if (resolvedInputType === 'number') {
              if (typeof value === 'number') {
                applyFieldChange(nextValue === '' ? 0 : Number(nextValue));
                return;
              }

              applyFieldChange(nextValue);
              return;
            }

            applyFieldChange(nextValue);
          }}
          className="bg-grey-50 dark:bg-grey-900/50"
          state={fieldError ? 'error' : 'default'}
          inputMode={resolvedInputType === 'number' ? 'decimal' : undefined}
          step={resolvedInputType === 'number' ? 'any' : undefined}
        />
        {renderFieldFeedback(fieldTypeHint)}
      </div>
    </div>
  );
};
// --- Component: Dynamic Section Renderer ---
export interface SectionSaveEvent {
  sectionId: string;
  parentKey: string;
  sectionData: Record<string, unknown>;
  timestamp: number;
}

export interface DynamicSectionProps {
  id: string;
  data: any;
  parentKey: string;
  onInputChange: (parent: string, section: string, field: string, value: any) => void;
  setRef: (el: Element | null) => void;
  isEditMode?: boolean;
  showSaveButton?: boolean;
  fieldErrors?: Record<string, string>;
  onFieldInteraction?: (fieldPath: string) => void;
  onSectionSave?: (event: SectionSaveEvent) => void;
}
export const DynamicSection: React.FC<DynamicSectionProps> = ({
  id,
  data,
  parentKey,
  onInputChange,
  setRef,
  isEditMode = true,
  showSaveButton = true,
  fieldErrors,
  onFieldInteraction,
  onSectionSave,
}) => {
  const title = getLabel(id);

  return (
    <div
      id={id}
      ref={setRef}
      className="scroll-mt-28"
    >
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-grey-200 shadow-sm">
        <div className="px-6 py-4 border-b border-grey-200">
          <Heading5 className="text-grey-900 dark:text-white">{title}</Heading5>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(data).map(([key, value]) => {
            // Hardcoded conditional rules for Tenant specifications:
            if (key === 'totalVendorUsersCount' && data['userTypeSelection'] === 'SMC Users only') return null;
            if (key === 'specificPorts' && data['productAvailability'] === 'Global') return null;

            return (
              <DynamicField
                key={key}
                fieldKey={key}
                value={value}
                sectionKey={id}
                parentKey={parentKey}
                onInputChange={onInputChange}
                isEditMode={isEditMode}
                fieldErrors={fieldErrors}
                onFieldInteraction={onFieldInteraction}
              />
            );
          })}
        </div>

        {isEditMode && showSaveButton && (
          <div className="px-6 py-4 border-t border-grey-200 flex justify-end">
            <Button
              variant="solid"
              color="primary"
              onClick={() => onSectionSave?.({
                sectionId: id,
                parentKey,
                sectionData: data,
                timestamp: Date.now(),
              })}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
