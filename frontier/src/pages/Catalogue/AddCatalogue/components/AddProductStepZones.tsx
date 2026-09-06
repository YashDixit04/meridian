import React, { type Dispatch, type KeyboardEvent, type SetStateAction } from 'react';
import { Plus } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Combobox from '@/components/ui/Combobox';
import Radio from '@/components/ui/Radio';
import Checkbox from '@/components/ui/Checkbox';
import Switch from '@/components/ui/Switch';
import { DraggableList } from '@/components/ui/DraggableList';

import productFormConfig from '@/data/json/productFormConfig.json';
import type { TenantCatalogueMode } from '../addProduct.utils';

interface VariantRow {
  id: string;
  type: string;
}

interface PricingRow {
  id: string;
  variant: string;
  quantity: number;
  regularPrice: number;
  salePrice: number;
  includeTax: boolean;
  taxPercent: number;
}

interface InventoryRow {
  id: string;
  variant: string;
  sku: string;
  barcode: string;
}

interface OptionItem {
  value: string;
  label: string;
}

export interface AddProductZoneProps {
  tenantCatalogueMode: TenantCatalogueMode;
  isVendorProduct: boolean | null;
  setIsVendorProduct: (value: boolean | null) => void;
  requiresVendorSelection: boolean;
  selectedVendor: string;
  setSelectedVendor: (value: string) => void;
  vendorOptions: OptionItem[];
  shouldShowPortSelection: boolean;
  selectedPort: string;
  setSelectedPort: (value: string) => void;
  availablePortOptions: string[];

  productId: string;
  setProductId: (value: string) => void;
  productIdType: string;
  setProductIdType: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
  selectedSubcategoryProduct: string;
  setSelectedSubcategoryProduct: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;

  customInputClass: string;
  customComboboxClass: string;
  tableWrapClass: string;
  tableHeaderClass: string;
  tableRowClass: string;

  handleMediaFileSelection: (files: FileList | null) => void;
  mediaImages: string[];
  mediaVideos: string[];

  hasVariants: boolean;
  setHasVariants: (value: boolean) => void;
  variants: VariantRow[];
  setVariants: Dispatch<SetStateAction<VariantRow[]>>;
  removeVariant: (id: string) => void;
  updateVariantType: (id: string, value: string) => void;
  addVariant: () => void;

  pricingRows: PricingRow[];
  setPricingRows: Dispatch<SetStateAction<PricingRow[]>>;

  inventoryRows: InventoryRow[];
  setInventoryRows: Dispatch<SetStateAction<InventoryRow[]>>;
  trackQuantity: boolean;
  setTrackQuantity: (value: boolean) => void;
  continueSellingOutOfStock: boolean;
  setContinueSellingOutOfStock: (value: boolean) => void;

  isPhysicalProduct: boolean;
  setIsPhysicalProduct: (value: boolean) => void;
  shippingCountry: string;
  setShippingCountry: (value: string) => void;
  hsCode: string;
  setHsCode: (value: string) => void;

  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  handleTagKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  removeTag: (tag: string) => void;
}

interface StepZoneRendererProps {
  stepId: number;
  zoneProps: AddProductZoneProps;
}

function VitalInfoZone({
  productId,
  setProductId,
  productIdType,
  setProductIdType,
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
}: AddProductZoneProps) {
  const subcategoryMap = (productFormConfig.categoryHierarchy as Record<string, Record<string, string[]>>)[selectedCategory] || {};
  const subcategoryOptions = Object.keys(subcategoryMap).map((key) => ({ value: key, label: key }));

  const subcategoryProducts = selectedSubcategory ? subcategoryMap[selectedSubcategory] || [] : [];
  const subcategoryProductOptions = subcategoryProducts.map((item) => ({ value: item, label: item }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Input
          placeholder="Product ID"
          size="medium"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={customInputClass}
        />
        <Combobox
          placeholder="Product ID type"
          value={productIdType}
          onChange={(val) => setProductIdType(val as string)}
          options={productFormConfig.productIdTypes}
          size="medium"
          className={customComboboxClass}
        />
      </div>
      <p className="text-sm text-grey-500 leading-relaxed py-2">
        To list your products you require a unique identifier for your product such as UPC, EAN, or GCID. You can request
        exemptions to list products that do not have standard product IDs for certain categories <a href="#" className="font-semibold text-primary">Learn more</a>
      </p>

      {tenantCatalogueMode === 'vendor-only' && (
        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          Tenant mode: Vendor-only. Product will be mapped to a tenant vendor.
        </div>
      )}

      {tenantCatalogueMode === 'smc-only' && (
        <div className="rounded-md border border-info/20 bg-info-soft px-3 py-2 text-sm text-info">
          Tenant mode: SMC-only. Product will be created as port-wise SMC product.
        </div>
      )}

      <div className="flex flex-col gap-3 py-2">
        {(tenantCatalogueMode === 'both' || tenantCatalogueMode === 'unknown') && (
          <>
            <span className="text-sm font-semibold text-grey-700 dark:text-grey-300">
              Is this a vendor product?
            </span>
            <div className="flex items-center gap-6">
              <Radio
                checked={isVendorProduct === true}
                onChange={() => setIsVendorProduct(true)}
                label="Yes, this is a vendor product"
              />
              <Radio
                checked={isVendorProduct === false}
                onChange={() => setIsVendorProduct(false)}
                label="No, this is our SMC product"
              />
            </div>
          </>
        )}

        {requiresVendorSelection && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
            <Combobox
              placeholder="Select a tenant vendor"
              value={selectedVendor}
              onChange={(val) => setSelectedVendor(val as string)}
              options={vendorOptions}
              size="medium"
              className={customComboboxClass}
            />
            {vendorOptions.length === 0 && (
              <p className="mt-2 text-xs text-danger">
                No tenant vendors available. Add a vendor first, then publish vendor product.
              </p>
            )}
          </div>
        )}

        {shouldShowPortSelection && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
            <Combobox
              placeholder="Select availability port"
              value={selectedPort}
              onChange={(val) => setSelectedPort(val as string)}
              options={availablePortOptions.map((port) => ({ value: port, label: port }))}
              size="medium"
              className={customComboboxClass}
            />
            <p className="mt-2 text-xs text-grey-500">
              Select the port where this product is available for tenant ordering.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Combobox
          placeholder="Select category"
          value={selectedCategory}
          onChange={(val) => {
            setSelectedCategory(val as string);
            setSelectedSubcategory('');
            setSelectedSubcategoryProduct('');
          }}
          options={productFormConfig.categories}
          size="medium"
          className={customComboboxClass}
        />
        {subcategoryOptions.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Combobox
              placeholder="Select subcategory"
              value={selectedSubcategory}
              onChange={(val) => {
                setSelectedSubcategory(val as string);
                setSelectedSubcategoryProduct('');
              }}
              options={subcategoryOptions}
              size="medium"
              className={customComboboxClass}
            />
          </div>
        )}
        {subcategoryProductOptions.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Combobox
              placeholder="Select subcategory product"
              value={selectedSubcategoryProduct}
              onChange={(val) => setSelectedSubcategoryProduct(val as string)}
              options={subcategoryProductOptions}
              size="medium"
              className={customComboboxClass}
            />
          </div>
        )}
      </div>

      <Input
        placeholder="Title"
        size="medium"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={customInputClass}
      />
      <Input placeholder="Brand" size="medium" className={customInputClass} />
      <Input placeholder="Manufacturer" size="medium" className={customInputClass} />
      <Input placeholder="MFR part number" size="medium" className={customInputClass} />
    </div>
  );
}

function NameAndDescriptionZone({ customInputClass }: AddProductZoneProps) {
  return (
    <div className="flex flex-col gap-4">
      <Input placeholder="Name of product" size="medium" className={customInputClass} />
      <div className="rounded-lg bg-[#f1f4f9] dark:bg-[#1e2128] overflow-hidden min-h-[200px] flex flex-col">
        <div className="flex items-center gap-4 p-3 border-b border-grey-200/50 dark:border-[#2a2d35] text-grey-500">
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0 text-xs opacity-50 cursor-not-allowed">↶</Button>
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0 text-xs opacity-50 cursor-not-allowed">↷</Button>
          <div className="w-px h-4 bg-grey-300 dark:bg-[#2a2d35]"></div>
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0 font-bold">B</Button>
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0 italic font-serif">I</Button>
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0 underline font-serif">U</Button>
          <div className="w-px h-4 bg-grey-300 dark:bg-[#2a2d35]"></div>
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0">≡</Button>
          <Button variant="ghost" size="small" className="h-6 w-6 !min-h-0">≣</Button>
        </div>
        <textarea
          className="flex-1 w-full resize-none p-4 text-sm bg-transparent outline-none text-grey-900 dark:text-grey-100 placeholder:text-grey-400 dark:placeholder:text-grey-600 dark:caret-grey-100"
          placeholder="Write a description..."
        />
      </div>
    </div>
  );
}

function ProductInformationZone({ customInputClass, customComboboxClass }: AddProductZoneProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold text-[#D34053]">Required*</span>
        {productFormConfig.dimensionTypes.filter((dim: any) => dim.required).map((dim: any) => (
          <div key={dim.key} className="grid grid-cols-[1fr_3fr_1fr] gap-4 items-center">
            <div className="px-4 py-2.5 bg-[#e4e8ec] dark:bg-[#1e2128] rounded-md text-sm text-grey-400 select-none">{dim.label}</div>
            <Input placeholder="Value" size="medium" className={customInputClass} />
            <Combobox placeholder="Unit" value="Feet" options={productFormConfig.lengthUnits} size="medium" className={customComboboxClass} />
          </div>
        ))}
      </div>
      <div className="pt-4 flex items-center gap-4 cursor-pointer hover:opacity-80">
        <span className="text-sm font-medium text-grey-800 dark:text-grey-200">Optional</span>
        <div className="w-5 h-5 rounded flex items-center justify-center text-grey-700"><Plus size={16} /></div>
      </div>
    </div>
  );
}

function MediaZone({ handleMediaFileSelection, mediaImages, mediaVideos }: AddProductZoneProps) {
  const fileInputId = 'add-product-media-upload';

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl dark:bg-[#1a1d24] p-3">
        <div
          className="rounded-xl border-2 border-dashed border-grey-700 min-h-[140px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onClick={() => document.getElementById(fileInputId)?.click()}
        >
          <input
            id={fileInputId}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleMediaFileSelection(e.target.files)}
          />
          <div className="flex items-center gap-2 text-grey-400 group-hover:text-grey-300 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-sm">Drag &amp; Drop files here</span>
            <span className="text-sm text-grey-600">or</span>
            <span className="text-sm text-primary font-medium hover:underline">browse from device</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-grey-500">Accepted formats: JPG, PNG, GIF, MP4, MOV. Max file size 50MB.</p>
      {(mediaImages.length > 0 || mediaVideos.length > 0) && (
        <div className="rounded-lg border border-grey-200 dark:border-grey-400 bg-grey-50 dark:bg-grey-100 px-3 py-3 text-xs text-grey-700 dark:text-grey-700">
          <p>Images: {mediaImages.length > 0 ? mediaImages.join(', ') : 'None'}</p>
          <p className="mt-1">Videos: {mediaVideos.length > 0 ? mediaVideos.join(', ') : 'None'}</p>
        </div>
      )}
    </div>
  );
}

function VariationsZone({
  hasVariants,
  setHasVariants,
  variants,
  setVariants,
  removeVariant,
  updateVariantType,
  addVariant,
  customComboboxClass,
}: AddProductZoneProps) {
  return (
    <div className="flex flex-col gap-4">
      <Radio checked={!hasVariants} onChange={() => setHasVariants(false)} label="This product does not have variants" />
      <Radio checked={hasVariants} onChange={() => setHasVariants(true)} label="This product has variants, like size or color" />
      {hasVariants && (
        <div className="bg-[#fbfeff] dark:bg-[#1a1d24] py-4 px-6 rounded-2xl border border-grey-100 dark:border-[#2a2d35] mt-2 shadow-sm">
          <DraggableList
            items={variants}
            setItems={setVariants}
            onRemove={removeVariant}
            renderItem={(item: VariantRow) => {
              const index = variants.findIndex((v) => v.id === item.id);
              return (
                <div className="flex-1 flex flex-col gap-1 py-1 w-full max-w-sm">
                  <span className="text-sm text-grey-800 dark:text-grey-300 ml-1 mb-1 font-medium">Option {index + 1}</span>
                  <Combobox placeholder="Select variant" value={item.type} onChange={(val) => updateVariantType(item.id, val as string)} options={productFormConfig.variantOptions} size="medium" className={customComboboxClass} />
                </div>
              );
            }}
          />
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-grey-800 dark:text-grey-300 cursor-pointer hover:opacity-75 select-none pl-8" onClick={addVariant}>
            <Plus size={16} /> Add another option
          </div>
        </div>
      )}
    </div>
  );
}

function PricingZone({
  tableWrapClass,
  tableHeaderClass,
  tableRowClass,
  pricingRows,
  setPricingRows,
}: AddProductZoneProps) {
  return (
    <div className={tableWrapClass}>
      <div className={`grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] px-4 py-3 ${tableHeaderClass}`}>
        {productFormConfig.pricingColumns.map((col: any) => (
          <span key={col.key}>{col.label}</span>
        ))}
      </div>
      {pricingRows.map((row) => (
        <div key={row.id} className={`grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] px-4 py-3 items-center gap-2 ${tableRowClass}`}>
          <span className="text-sm text-grey-400">{row.variant}</span>
          <Input
            type="number"
            value={row.quantity}
            min={0}
            size="small"
            onChange={(e) => setPricingRows((rows) => rows.map((r) => r.id === row.id ? { ...r, quantity: +e.target.value } : r))}
          />
          <Input
            type="number"
            value={row.regularPrice}
            min={0}
            size="small"
            onChange={(e) => setPricingRows((rows) => rows.map((r) => r.id === row.id ? { ...r, regularPrice: +e.target.value } : r))}
          />
          <Input
            type="number"
            value={row.salePrice}
            min={0}
            size="small"
            onChange={(e) => setPricingRows((rows) => rows.map((r) => r.id === row.id ? { ...r, salePrice: +e.target.value } : r))}
          />
          <Switch
            checked={row.includeTax}
            onChange={(checked) => setPricingRows((rows) => rows.map((r) => r.id === row.id ? { ...r, includeTax: checked } : r))}
          />
          <Input
            type="number"
            value={row.taxPercent}
            min={0}
            size="small"
            disabled={!row.includeTax}
            onChange={(e) => setPricingRows((rows) => rows.map((r) => r.id === row.id ? { ...r, taxPercent: +e.target.value } : r))}
          />
        </div>
      ))}
    </div>
  );
}

function InventoryZone({
  tableWrapClass,
  tableHeaderClass,
  tableRowClass,
  inventoryRows,
  setInventoryRows,
  trackQuantity,
  setTrackQuantity,
  continueSellingOutOfStock,
  setContinueSellingOutOfStock,
}: AddProductZoneProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className={tableWrapClass}>
        <div className={`grid grid-cols-[1.5fr_2fr_2fr] px-4 py-3 ${tableHeaderClass}`}>
          {productFormConfig.inventoryColumns.map((col: any) => (
            <span key={col.key}>{col.label}</span>
          ))}
        </div>
        {inventoryRows.map((row) => (
          <div key={row.id} className={`grid grid-cols-[1.5fr_2fr_2fr] px-4 py-3 items-center gap-3 ${tableRowClass}`}>
            <span className="text-sm text-grey-400">{row.variant}</span>
            <Input
              type="text"
              placeholder="SKU (Stock keeping unit)"
              size="small"
              onChange={(e) => setInventoryRows((rows) => rows.map((r) => r.id === row.id ? { ...r, sku: e.target.value } : r))}
            />
            <Input
              type="text"
              placeholder="Barcode (ISBN, UPC, GTIN etc)"
              size="small"
              onChange={(e) => setInventoryRows((rows) => rows.map((r) => r.id === row.id ? { ...r, barcode: e.target.value } : r))}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        {productFormConfig.inventoryOptions.map((opt: any) => (
          <Checkbox
            key={opt.key}
            checked={opt.key === 'trackQuantity' ? trackQuantity : continueSellingOutOfStock}
            onChange={(e) => opt.key === 'trackQuantity' ? setTrackQuantity(e.target.checked) : setContinueSellingOutOfStock(e.target.checked)}
            label={opt.label}
          />
        ))}
      </div>
    </div>
  );
}

function ShippingZone({
  isPhysicalProduct,
  setIsPhysicalProduct,
  shippingCountry,
  setShippingCountry,
  hsCode,
  setHsCode,
  customComboboxClass,
}: AddProductZoneProps) {
  return (
    <div className="flex flex-col gap-5">
      <Checkbox
        checked={isPhysicalProduct}
        onChange={(e) => setIsPhysicalProduct(e.target.checked)}
        label="This is a physical product"
        className="font-semibold"
      />

      <Combobox
        placeholder="Select country / region"
        value={shippingCountry}
        onChange={(val) => setShippingCountry(val as string)}
        options={productFormConfig.countryRegions}
        size="medium"
        className={customComboboxClass}
      />
      <Combobox
        placeholder="Enter a HS code"
        value={hsCode}
        onChange={(val) => setHsCode(val as string)}
        options={productFormConfig.hsCodes}
        size="medium"
        className={customComboboxClass}
      />
    </div>
  );
}

function TagZone({
  tags,
  tagInput,
  setTagInput,
  handleTagKeyDown,
  removeTag,
}: AddProductZoneProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 min-h-[48px] bg-[#f1f4f9] dark:bg-[#1e2128] rounded-lg px-4 py-2.5 focus-within:ring-1 focus-within:ring-primary">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 bg-[#e4e8ec] dark:bg-[#2a2d35] text-grey-700 dark:text-grey-300 text-xs font-medium px-3 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-grey-400 hover:text-grey-600 dark:hover:text-grey-200 leading-none">x</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={tags.length === 0 ? 'Type and add tags' : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-grey-900 dark:text-grey-100 placeholder:text-grey-400"
        />
      </div>
      <p className="text-xs text-grey-500">Press Enter or comma to add a tag.</p>
    </div>
  );
}

export default function StepZoneRenderer({ stepId, zoneProps }: StepZoneRendererProps) {
  if (stepId === 1) {
    return <VitalInfoZone {...zoneProps} />;
  }

  if (stepId === 2) {
    return <NameAndDescriptionZone {...zoneProps} />;
  }

  if (stepId === 3) {
    return <ProductInformationZone {...zoneProps} />;
  }

  if (stepId === 4) {
    return <MediaZone {...zoneProps} />;
  }

  if (stepId === 5) {
    return <VariationsZone {...zoneProps} />;
  }

  if (stepId === 6) {
    return <PricingZone {...zoneProps} />;
  }

  if (stepId === 7) {
    return <InventoryZone {...zoneProps} />;
  }

  if (stepId === 8) {
    return <ShippingZone {...zoneProps} />;
  }

  if (stepId === 9) {
    return <TagZone {...zoneProps} />;
  }

  return null;
}
