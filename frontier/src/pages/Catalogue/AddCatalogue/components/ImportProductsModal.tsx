import React from 'react';

import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import Radio from '@/components/ui/Radio';

import type { TenantVendor } from '@/services/microservices/tenant';
import type { TenantCatalogueMode } from '../addProduct.utils';

interface VendorOption {
  value: string;
  label: string;
}

interface ImportProductsModalProps {
  isImportModalOpen: boolean;
  isImporting: boolean;
  executionMode: 'import' | 'bulk';
  importModeNeedsChoice: boolean;
  importIsVendorProduct: boolean | null;
  importRequiresVendorSelection: boolean;
  importSelectedVendor: string;
  importSelectedVendorRecord?: TenantVendor;
  importSelectedPort: string;
  importAvailablePortOptions: string[];
  importFileName: string;
  tenantCatalogueMode: TenantCatalogueMode;
  vendorOptions: VendorOption[];
  customComboboxClass: string;
  onSetImportIsVendorProduct: (value: boolean | null) => void;
  onSetImportSelectedVendor: (value: string) => void;
  onSetImportSelectedPort: (value: string) => void;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onImport: () => void;
}

export default function ImportProductsModal({
  isImportModalOpen,
  isImporting,
  executionMode,
  importModeNeedsChoice,
  importIsVendorProduct,
  importRequiresVendorSelection,
  importSelectedVendor,
  importSelectedVendorRecord,
  importSelectedPort,
  importAvailablePortOptions,
  importFileName,
  tenantCatalogueMode,
  vendorOptions,
  customComboboxClass,
  onSetImportIsVendorProduct,
  onSetImportSelectedVendor,
  onSetImportSelectedPort,
  onFileSelected,
  onClose,
  onImport,
}: ImportProductsModalProps) {
  if (!isImportModalOpen) {
    return null;
  }

  const isBulkMode = executionMode === 'bulk';
  const modalTitle = isBulkMode ? 'Bulk Upload Products' : 'Import Products From Excel';
  const modalDescription = isBulkMode
    ? 'Upload one Excel file generated from the Add Product export template. Large files are processed in batches and may take a few minutes.'
    : 'Upload one Excel file generated from the Add Product export template.';
  const submitLabel = isBulkMode ? 'Upload Products' : 'Import Products';
  const submitLoadingLabel = isBulkMode ? 'Uploading...' : 'Importing...';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#11141c] shadow-xl border border-grey-200 dark:border-grey-700">
        <div className="px-6 py-5 border-b border-grey-100 dark:border-grey-700">
          <h3 className="text-lg font-semibold text-grey-900 dark:text-white">{modalTitle}</h3>
          <p className="mt-1 text-sm text-grey-500 dark:text-grey-400">
            {modalDescription}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {importModeNeedsChoice && (
            <div>
              <p className="text-sm font-semibold text-grey-700 dark:text-grey-300 mb-2">
                Is this vendor product?
              </p>
              <div className="flex items-center gap-6">
                <Radio
                  checked={importIsVendorProduct === true}
                  onChange={() => onSetImportIsVendorProduct(true)}
                  label="Yes, map imported products with a tenant vendor"
                />
                <Radio
                  checked={importIsVendorProduct === false}
                  onChange={() => {
                    onSetImportIsVendorProduct(false);
                    onSetImportSelectedVendor('');
                    onSetImportSelectedPort('');
                  }}
                  label="No, map imported products with tenant catalogue"
                />
              </div>
            </div>
          )}

          {importRequiresVendorSelection && (
            <div className="space-y-3">
              <Combobox
                placeholder="Select tenant vendor"
                value={importSelectedVendor}
                onChange={(value) => onSetImportSelectedVendor(value as string)}
                options={vendorOptions}
                size="medium"
                className={customComboboxClass}
                state={tenantCatalogueMode === 'vendor-only' && vendorOptions.length === 1 ? 'disabled' : 'default'}
              />

              {tenantCatalogueMode === 'vendor-only' && importSelectedVendorRecord && (
                <p className="text-xs text-grey-500">
                  Vendor-only tenant: vendor mapping is auto-enabled for {importSelectedVendorRecord.basicInfo.companyName}.
                </p>
              )}

              <Combobox
                placeholder="Select available port"
                value={importSelectedPort}
                onChange={(value) => onSetImportSelectedPort(value as string)}
                options={importAvailablePortOptions.map((port) => ({ value: port, label: port }))}
                size="medium"
                className={customComboboxClass}
              />

              {importAvailablePortOptions.length === 0 && (
                <p className="text-xs text-danger">
                  No available ports found for the selected vendor.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-grey-700 dark:text-grey-300 mb-2">
              Upload Excel file (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileSelected}
              className="block w-full rounded-lg border border-grey-300 dark:border-grey-600 bg-white dark:bg-[#1a1f2b] px-3 py-2 text-sm text-grey-700 dark:text-grey-200"
            />
            {importFileName && (
              <p className="mt-2 text-xs text-grey-500">Selected file: {importFileName}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-grey-100 dark:border-grey-700 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            color="grey"
            size="small"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            color="primary"
            size="small"
            onClick={onImport}
            disabled={
              isImporting
              || !importFileName
              || (importModeNeedsChoice && importIsVendorProduct === null)
              || (importRequiresVendorSelection && !importSelectedVendor)
              || (
                importRequiresVendorSelection
                && importAvailablePortOptions.length > 0
                && !importSelectedPort
              )
            }
          >
            {isImporting ? submitLoadingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
