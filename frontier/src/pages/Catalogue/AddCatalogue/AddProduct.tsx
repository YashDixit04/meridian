import React, { useEffect, useMemo, useState } from 'react';

import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/ui/Button';

import { productStepsData } from '@/data/productFormSteps';
import productFormConfig from '@/data/json/productFormConfig.json';
import authService from '@/services/authService';
import tenantService from '@/services/tenantService';
import { ApiException } from '@/lib/apiClient';

import AddProductActions from './components/AddProductActions';
import ImportProductsModal from './components/ImportProductsModal';
import StepZoneRenderer, { type AddProductZoneProps } from './components/AddProductStepZones';
import { useTenantCatalogueContext } from './hooks/useTenantCatalogueContext';
import {
  exportAddProductTemplate,
  importProductsFromExcel,
} from './services/addProductImportExport';
import { resolveVendorTenantId } from './addProduct.utils';

interface AddProductProps {
  onNavigate?: (tab: string) => void;
  tenantId?: string;
}

export default function AddProduct({ onNavigate, tenantId }: AddProductProps) {
  const session = authService.getSession();
  const resolvedTenantId = tenantId || session?.tenantId || '';

  const {
    tenantCatalogueMode,
    tenantVendors,
    tenantCatalogs,
    setTenantCatalogs,
    portOptions,
    isContextLoading,
    contextMessage,
    vendorOptions,
    externalVendors,
  } = useTenantCatalogueContext(resolvedTenantId);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [variants, setVariants] = useState([{ id: '1', type: '' }]);
  const [hasVariants, setHasVariants] = useState<boolean>(true);

  const [productId, setProductId] = useState('');
  const [productIdType, setProductIdType] = useState('UPC');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSubcategoryProduct, setSelectedSubcategoryProduct] = useState('');
  const [title, setTitle] = useState('');

  const [isVendorProduct, setIsVendorProduct] = useState<boolean | null>(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedPort, setSelectedPort] = useState('');

  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importIsVendorProduct, setImportIsVendorProduct] = useState<boolean | null>(null);
  const [importSelectedVendor, setImportSelectedVendor] = useState<string>('');
  const [importSelectedPort, setImportSelectedPort] = useState<string>('');
  const [importExecutionMode, setImportExecutionMode] = useState<'import' | 'bulk'>('import');

  const [pricingRows, setPricingRows] = useState([
    { id: '1', variant: 'N/A', quantity: 0, regularPrice: 0, salePrice: 0, includeTax: false, taxPercent: 0 },
  ]);

  const [inventoryRows, setInventoryRows] = useState([
    { id: '1', variant: 'N/A', sku: '', barcode: '' },
  ]);
  const [trackQuantity, setTrackQuantity] = useState(false);
  const [continueSellingOutOfStock, setContinueSellingOutOfStock] = useState(false);

  const [isPhysicalProduct, setIsPhysicalProduct] = useState(false);
  const [shippingCountry, setShippingCountry] = useState('');
  const [hsCode, setHsCode] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [mediaVideos, setMediaVideos] = useState<string[]>([]);

  useEffect(() => {
    if (tenantCatalogueMode === 'vendor-only') {
      setIsVendorProduct(true);
      return;
    }

    if (tenantCatalogueMode === 'smc-only') {
      setIsVendorProduct(false);
      setSelectedVendor('');
    }
  }, [tenantCatalogueMode]);

  useEffect(() => {
    if (isVendorProduct !== true) {
      setSelectedVendor('');
    }
  }, [isVendorProduct]);

  const categoryLabelMap = useMemo(
    () => new Map(productFormConfig.categories.map((item) => [item.value, item.label])),
    [],
  );

  const requiresVendorSelection =
    tenantCatalogueMode === 'vendor-only'
    || ((tenantCatalogueMode === 'both' || tenantCatalogueMode === 'unknown') && isVendorProduct === true);

  const requiresPortSelection =
    tenantCatalogueMode === 'smc-only'
    || ((tenantCatalogueMode === 'both' || tenantCatalogueMode === 'unknown') && isVendorProduct === false);

  const shouldShowPortSelection = requiresPortSelection || requiresVendorSelection;

  const availablePortOptions = useMemo(() => {
    if (!requiresVendorSelection || !selectedVendor) {
      return portOptions;
    }

    const selectedVendorRecord = tenantVendors.find((vendor) => vendor.id === selectedVendor);
    const vendorPorts = Array.isArray(selectedVendorRecord?.coverage?.portsServed)
      ? selectedVendorRecord.coverage.portsServed.filter(
        (port): port is string => typeof port === 'string' && port.trim().length > 0,
      )
      : [];

    return vendorPorts.length > 0 ? vendorPorts : portOptions;
  }, [requiresVendorSelection, selectedVendor, tenantVendors, portOptions]);

  useEffect(() => {
    if (selectedPort && !availablePortOptions.includes(selectedPort)) {
      setSelectedPort('');
    }
  }, [selectedPort, availablePortOptions]);

  const importModeNeedsChoice = tenantCatalogueMode === 'both' || tenantCatalogueMode === 'unknown';

  const importRequiresVendorSelection =
    tenantCatalogueMode === 'vendor-only'
    || (importModeNeedsChoice && importIsVendorProduct === true);

  const importSelectedVendorRecord = useMemo(
    () => tenantVendors.find((vendor) => vendor.id === importSelectedVendor),
    [tenantVendors, importSelectedVendor],
  );

  const importAvailablePortOptions = useMemo(() => {
    if (!importRequiresVendorSelection) {
      return [] as string[];
    }

    const vendorPorts = Array.isArray(importSelectedVendorRecord?.coverage?.portsServed)
      ? importSelectedVendorRecord.coverage.portsServed.filter(
        (port): port is string => typeof port === 'string' && port.trim().length > 0,
      )
      : [];

    return vendorPorts.length > 0 ? vendorPorts : portOptions;
  }, [importRequiresVendorSelection, importSelectedVendorRecord, portOptions]);

  useEffect(() => {
    if (!isImportModalOpen || !importRequiresVendorSelection) {
      return;
    }

    if (!importSelectedVendor && vendorOptions.length === 1) {
      setImportSelectedVendor(vendorOptions[0].value);
    }
  }, [
    isImportModalOpen,
    importRequiresVendorSelection,
    importSelectedVendor,
    vendorOptions,
  ]);

  useEffect(() => {
    if (!isImportModalOpen) {
      return;
    }

    if (tenantCatalogueMode === 'vendor-only' && !importSelectedVendor && vendorOptions.length > 0) {
      setImportSelectedVendor(vendorOptions[0].value);
    }

    if (tenantCatalogueMode === 'smc-only') {
      setImportIsVendorProduct(false);
      setImportSelectedVendor('');
      setImportSelectedPort('');
    }
  }, [
    isImportModalOpen,
    tenantCatalogueMode,
    importSelectedVendor,
    vendorOptions,
  ]);

  useEffect(() => {
    if (!isImportModalOpen || !importRequiresVendorSelection) {
      setImportSelectedPort('');
      return;
    }

    if (importAvailablePortOptions.length === 0) {
      setImportSelectedPort('');
      return;
    }

    if (!importSelectedPort || !importAvailablePortOptions.includes(importSelectedPort)) {
      setImportSelectedPort(importAvailablePortOptions[0]);
    }
  }, [
    isImportModalOpen,
    importRequiresVendorSelection,
    importAvailablePortOptions,
    importSelectedPort,
  ]);

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Users', href: '#' },
    { label: 'Tenant Details', href: '#' },
    {
      label: 'Catalogue',
      href: '#',
      onClick: () => onNavigate?.(resolvedTenantId ? `tenantCatalogue_${resolvedTenantId}` : 'tenantCatalogue'),
    },
    { label: 'Add Product', href: '#', active: true },
  ];

  const actions = (
    <AddProductActions
      isContextLoading={isContextLoading}
      contextMessage={contextMessage}
      isImporting={isImporting}
      isExporting={isExporting}
      onBulkUploadClick={() => {
        openImportModal('bulk');
      }}
      onImportClick={() => {
        openImportModal('import');
      }}
      onExportClick={() => {
        void handleExportProducts();
      }}
    />
  );

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, productStepsData.length));
  const handlePrev = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const addVariant = () => setVariants([...variants, { id: Date.now().toString(), type: '' }]);
  const removeVariant = (id: string) => setVariants(variants.filter((v) => v.id !== id));
  const updateVariantType = (id: string, type: string) =>
    setVariants(variants.map((v) => v.id === id ? { ...v, type } : v));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleExportProducts = async () => {
    setSubmitError('');
    setSubmitSuccess('');
    setIsExporting(true);

    try {
      exportAddProductTemplate(resolvedTenantId);
      setSubmitSuccess('Add Product import template exported successfully.');
    } catch (error) {
      console.error('Failed to export add product template:', error);
      setSubmitError('Failed to export Add Product import template.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMediaFileSelection = (files: FileList | null) => {
    if (!files) {
      return;
    }

    const images: string[] = [];
    const videos: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        images.push(file.name);
      } else if (file.type.startsWith('video/')) {
        videos.push(file.name);
      }
    });

    setMediaImages(images);
    setMediaVideos(videos);
  };

  const openImportModal = (mode: 'import' | 'bulk') => {
    setImportExecutionMode(mode);
    setSubmitError('');
    setSubmitSuccess('');
    setImportFile(null);
    setImportFileName('');

    if (tenantCatalogueMode === 'vendor-only') {
      setImportIsVendorProduct(true);
      setImportSelectedVendor(vendorOptions[0]?.value || '');
    } else if (tenantCatalogueMode === 'smc-only') {
      setImportIsVendorProduct(false);
      setImportSelectedVendor('');
    } else {
      setImportIsVendorProduct(null);
      setImportSelectedVendor('');
    }

    setImportSelectedPort('');
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    if (isImporting) {
      return;
    }

    setIsImportModalOpen(false);
    setImportFile(null);
    setImportFileName('');
  };

  const handleImportFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImportFile(file);
    setImportFileName(file?.name || '');
  };

  const handleImportProducts = async () => {
    setSubmitError('');
    setSubmitSuccess('');

    const isBulkUpload = importExecutionMode === 'bulk';

    if (!resolvedTenantId) {
      setSubmitError('Tenant context is missing. Open Add Product from tenant catalogue.');
      return;
    }

    if (isContextLoading || contextMessage) {
      setSubmitError('Tenant context is not ready. Resolve tenant issues and try again.');
      return;
    }

    if (!importFile) {
      setSubmitError('Select an Excel file to import.');
      return;
    }

    if (importModeNeedsChoice && importIsVendorProduct === null) {
      setSubmitError('Select whether imported products are vendor products.');
      return;
    }

    if (importRequiresVendorSelection && !importSelectedVendor) {
      setSubmitError('Select a tenant vendor for vendor product import mapping.');
      return;
    }

    if (importRequiresVendorSelection && importAvailablePortOptions.length > 0 && !importSelectedPort) {
      setSubmitError('Select an available port for vendor product import mapping.');
      return;
    }

    setIsImporting(true);
    if (isBulkUpload) {
      setSubmitSuccess('Bulk upload started. Large files can take a few minutes to process.');
    }

    try {
      const result = await importProductsFromExcel({
        tenantServiceApi: tenantService,
        tenantId: resolvedTenantId,
        importFile,
        tenantVendors,
        importRequiresVendorSelection,
        importSelectedVendor,
        importSelectedPort,
        categoryLabelMap,
        preferBulkUpload: isBulkUpload,
        bulkChunkSize: 60,
      });

      setTenantCatalogs(result.refreshedCatalogs);
      setImportIsVendorProduct(null);
      setImportSelectedVendor('');
      setImportSelectedPort('');
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportFileName('');

      const totalVendorMapped = result.mappedExistingCount + result.mappedCreatedCount;
      const completionLabel = isBulkUpload ? 'Bulk upload completed.' : 'Import completed.';
      setSubmitSuccess(
        `${completionLabel} Created: ${result.createdCount}, Vendor mapped: ${totalVendorMapped}, `
        + `Vendor mapped (new): ${result.mappedCreatedCount}, Vendor mapped (existing): ${result.mappedExistingCount}, `
        + `Skipped existing: ${result.skippedExistingCount}, Skipped invalid: ${result.skippedInvalidCount}, `
        + `Skipped duplicate rows: ${result.skippedDuplicateInFileCount}, New catalogs: ${result.createdCatalogCount}.`,
      );
    } catch (error) {
      console.error('Failed to import products from Excel:', error);
      if (error instanceof ApiException) {
        setSubmitError(error.errorMessage || 'Failed to import products.');
      } else if (error instanceof Error) {
        setSubmitError(error.message || 'Failed to import products from the uploaded file.');
      } else {
        setSubmitError('Failed to import products from the uploaded file.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const deriveCatalogName = () => {
    const categoryLabel = categoryLabelMap.get(selectedCategory) || selectedCategory || 'General';

    if (requiresVendorSelection) {
      return `${categoryLabel}`;
    }

    if (requiresPortSelection && selectedPort) {
      return `${categoryLabel} - ${selectedPort}`;
    }

    return categoryLabel;
  };

  const handlePublishProduct = async () => {
    setSubmitError('');
    setSubmitSuccess('');

    if (!resolvedTenantId) {
      setSubmitError('Tenant context is missing. Open Add Product from tenant catalogue.');
      return;
    }

    if (isContextLoading || contextMessage) {
      setSubmitError('Tenant context is not ready. Resolve tenant issues and try again.');
      return;
    }

    if (!productId.trim()) {
      setSubmitError('Product ID is required.');
      setActiveStep(1);
      return;
    }

    if (!selectedCategory) {
      setSubmitError('Category is required.');
      setActiveStep(1);
      return;
    }

    if (!title.trim()) {
      setSubmitError('Product title is required.');
      setActiveStep(1);
      return;
    }

    const regularPrice = Number(pricingRows[0]?.regularPrice ?? 0);
    if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
      setSubmitError('Regular price must be greater than zero.');
      setActiveStep(6);
      return;
    }

    if ((tenantCatalogueMode === 'both' || tenantCatalogueMode === 'unknown') && isVendorProduct === null) {
      setSubmitError('Select whether this is a vendor product or an SMC product.');
      setActiveStep(1);
      return;
    }

    if (requiresVendorSelection && !selectedVendor) {
      setSubmitError('Select a tenant vendor for vendor product mapping.');
      setActiveStep(1);
      return;
    }

    if (shouldShowPortSelection && !selectedPort) {
      setSubmitError('Select a port where this product is available.');
      setActiveStep(1);
      return;
    }

    const variationPayload = hasVariants
      ? variants
        .map((variant) => variant.type.trim())
        .filter((variant) => variant.length > 0)
      : [];

    const inventoryPayload = inventoryRows
      .map((row) => {
        const matchedPriceRow = pricingRows.find((priceRow) => priceRow.id === row.id);
        const sku = row.sku.trim();
        const barcode = row.barcode.trim();
        const quantity = Number(matchedPriceRow?.quantity ?? 0);
        const variant = row.variant.trim();

        return {
          variant,
          sku,
          barcode,
          quantity: Number.isFinite(quantity) ? quantity : 0,
        };
      })
      .filter((item) =>
        item.sku.length > 0
        || item.barcode.length > 0
        || item.quantity > 0
        || (item.variant.length > 0 && item.variant !== 'N/A'),
      );

    setIsSubmitting(true);

    try {
      const catalogName = deriveCatalogName();
      const existingCatalog = tenantCatalogs.find(
        (catalog) => catalog.name.trim().toLowerCase() === catalogName.trim().toLowerCase(),
      );

      const catalog = existingCatalog
        ?? await tenantService.createCatalog(resolvedTenantId, {
          name: catalogName,
          description: shouldShowPortSelection && selectedPort
            ? `Port-wise catalogue for ${selectedPort}`
            : 'Tenant catalogue',
        });

      if (!existingCatalog) {
        setTenantCatalogs((prev) => [catalog, ...prev]);
      }

      const resolvedSubcategory = selectedSubcategoryProduct
        ? (selectedSubcategory ? `${selectedSubcategory} - ${selectedSubcategoryProduct}` : selectedSubcategoryProduct)
        : selectedSubcategory || undefined;

      const vendorTenantId = requiresVendorSelection && selectedVendor
        ? resolveVendorTenantId(selectedVendor, externalVendors)
        : undefined;

      await tenantService.createOffering(resolvedTenantId, catalog.id, {
        name: title.trim(),
        price: regularPrice,
        vendorId: requiresVendorSelection ? selectedVendor : undefined,
        vendorTenantId,
        isVendorProduct: requiresVendorSelection,
        ports: selectedPort ? [selectedPort] : [],
        productId: productId.trim(),
        productIdType,
        images: mediaImages,
        videos: mediaVideos,
        variations: variationPayload,
        inventory: inventoryPayload,
        category: selectedCategory || undefined,
        subcategory: resolvedSubcategory,
      });

      setSubmitSuccess('Product published successfully.');
      onNavigate?.(resolvedTenantId ? `tenantCatalogue_${resolvedTenantId}` : 'tenantCatalogue');
    } catch (error) {
      if (error instanceof ApiException) {
        setSubmitError(error.errorMessage || 'Failed to publish product.');
      } else {
        setSubmitError('Failed to publish product.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepHeader = (step: typeof productStepsData[0]) => (
    <div
      className="flex items-center gap-4 py-5 cursor-pointer transition-colors hover:text-primary"
      onClick={() => setActiveStep(step.id)}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors bg-primary text-white">
        {step.id}
      </div>
      <span className="text-base font-bold dark:text-grey-900">{step.title}</span>
    </div>
  );

  const customInputClass = 'bg-[#f1f4f9] dark:bg-[#1e2128] border-none text-grey-900 dark:text-grey-100 placeholder:text-grey-500 rounded-md py-2.5 px-4 shadow-none focus:ring-1 focus:ring-primary';
  const customComboboxClass = 'bg-[#f1f4f9] dark:bg-[#1e2128] border-none text-grey-900 dark:text-grey-100 shadow-none';

  const tableWrapClass = 'border border-grey-200 dark:border-grey-300 overflow-visible';
  const tableHeaderClass = 'bg-grey-100 dark:bg-grey-100 text-grey-600 dark:text-grey-600 text-sm font-medium';
  const tableRowClass = ' bg-grey-50 dark:bg-grey-50 text-grey-800 dark:text-grey-800 border-t border-grey-200 dark:border-grey-300';

  const zoneProps: AddProductZoneProps = {
    tenantCatalogueMode,
    isVendorProduct,
    setIsVendorProduct,
    requiresVendorSelection,
    selectedVendor,
    setSelectedVendor,
    vendorOptions,
    shouldShowPortSelection,
    selectedPort,
    setSelectedPort,
    availablePortOptions,

    productId,
    setProductId,
    productIdType,
    setProductIdType,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedSubcategoryProduct,
    setSelectedSubcategoryProduct,
    title,
    setTitle,

    customInputClass,
    customComboboxClass,
    tableWrapClass,
    tableHeaderClass,
    tableRowClass,

    handleMediaFileSelection,
    mediaImages,
    mediaVideos,

    hasVariants,
    setHasVariants,
    variants,
    setVariants,
    removeVariant,
    updateVariantType,
    addVariant,

    pricingRows,
    setPricingRows,

    inventoryRows,
    setInventoryRows,
    trackQuantity,
    setTrackQuantity,
    continueSellingOutOfStock,
    setContinueSellingOutOfStock,

    isPhysicalProduct,
    setIsPhysicalProduct,
    shippingCountry,
    setShippingCountry,
    hsCode,
    setHsCode,

    tags,
    tagInput,
    setTagInput,
    handleTagKeyDown,
    removeTag,
  };

  return (
    <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
      <div className="flex-1 flex flex-col pt-6 pb-20 max-w-full mx-auto w-full bg-white dark:bg-[#0d0d12] overflow-visible">
        <div className="px-10 pb-6 border-b border-grey-100 dark:border-grey-400">
          <h2 className="text-2xl font-bold text-grey-900 dark:text-white">Add Product</h2>
          {isContextLoading && (
            <p className="mt-2 text-sm text-grey-500">Loading tenant catalogue context...</p>
          )}
          {contextMessage && (
            <p className="mt-2 text-sm text-danger">{contextMessage}</p>
          )}
          {submitError && (
            <p className="mt-2 text-sm text-danger">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="mt-2 text-sm text-success">{submitSuccess}</p>
          )}
        </div>

        <div className="flex flex-col w-full max-w-4xl mx-auto px-10 mt-6 pb-20 overflow-visible">
          {productStepsData.map((step, index) => (
            <div key={step.id} className={`flex flex-col border-grey-100 dark:border-grey-400 overflow-visible ${index !== 0 ? 'border-t mt-2' : ''}`}>
              {renderStepHeader(step)}

              {activeStep === step.id && (
                <div className="pl-10 pr-4 pb-8 animate-in fade-in slide-in-from-top-2 duration-500 ease-in-out overflow-visible">
                  <StepZoneRenderer stepId={step.id} zoneProps={zoneProps} />

                  <div className="flex items-center gap-2 mt-8 pt-4">
                    {step.id === productStepsData.length ? (
                      <>
                        <Button variant="outline" className="border-none text-grey-700 shadow-none font-semibold px-4" onClick={handlePrev}>
                          {'< Previous'}
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" className="border border-grey-300 dark:border-[#3a3d45] text-grey-800 dark:text-grey-200 font-semibold px-5 rounded-xl">
                          Archive product
                        </Button>
                        <Button
                          variant="solid"
                          color="primary"
                          className="font-semibold px-5 rounded-xl"
                          onClick={handlePublishProduct}
                          disabled={isSubmitting || isContextLoading || !!contextMessage}
                        >
                          {isSubmitting ? 'Publishing...' : 'Publish product'}
                        </Button>
                      </>
                    ) : (
                      <>
                        {step.id > 1 && (
                          <Button variant="outline" className="border-none text-grey-700 shadow-none font-semibold px-4" onClick={handlePrev}>
                            {'< Previous'}
                          </Button>
                        )}
                        <Button variant="outline" className="border-none text-grey-800 shadow-none font-semibold px-4" onClick={handleNext}>
                          {'Finish and proceed >'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ImportProductsModal
        isImportModalOpen={isImportModalOpen}
        isImporting={isImporting}
        executionMode={importExecutionMode}
        importModeNeedsChoice={importModeNeedsChoice}
        importIsVendorProduct={importIsVendorProduct}
        importRequiresVendorSelection={importRequiresVendorSelection}
        importSelectedVendor={importSelectedVendor}
        importSelectedVendorRecord={importSelectedVendorRecord}
        importSelectedPort={importSelectedPort}
        importAvailablePortOptions={importAvailablePortOptions}
        importFileName={importFileName}
        tenantCatalogueMode={tenantCatalogueMode}
        vendorOptions={vendorOptions}
        customComboboxClass={customComboboxClass}
        onSetImportIsVendorProduct={setImportIsVendorProduct}
        onSetImportSelectedVendor={setImportSelectedVendor}
        onSetImportSelectedPort={setImportSelectedPort}
        onFileSelected={handleImportFileSelection}
        onClose={closeImportModal}
        onImport={() => {
          void handleImportProducts();
        }}
      />
    </PageLayout>
  );
}
