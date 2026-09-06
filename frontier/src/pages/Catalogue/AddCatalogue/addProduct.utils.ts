import productFormConfig from '@/data/json/productFormConfig.json';
import { ExternalVendor } from '@/services/microservices/tenant';

export type TenantCatalogueMode = 'vendor-only' | 'both' | 'smc-only' | 'unknown';

export const DEFAULT_PORT_OPTIONS = ['Jebel Ali', 'Mumbai', 'Singapore', 'Rotterdam'];

export const resolveTenantCatalogueMode = (selection: string | undefined): TenantCatalogueMode => {
  if (typeof selection !== 'string') {
    return 'unknown';
  }

  const normalized = selection.trim().toLowerCase();
  if (!normalized) {
    return 'unknown';
  }

  if (normalized.includes('both')) {
    return 'both';
  }

  if (normalized.includes('vendor') && !normalized.includes('smc')) {
    return 'vendor-only';
  }

  if (normalized.includes('smc') && !normalized.includes('vendor')) {
    return 'smc-only';
  }

  if (normalized.includes('smc') && normalized.includes('vendor')) {
    return 'both';
  }

  return 'unknown';
};

export const buildAddProductTemplateHeaders = (): string[] => {
  const dimensionTypes = Array.isArray(productFormConfig.dimensionTypes)
    ? productFormConfig.dimensionTypes
    : [];

  const requiredDimensions = dimensionTypes
    .filter((dimension: any) => dimension.required)
    .flatMap((dimension: any) => [`${dimension.label} Value`, `${dimension.label} Unit`]);

  const optionalDimensions = dimensionTypes
    .filter((dimension: any) => !dimension.required)
    .flatMap((dimension: any) => [`${dimension.label} Value`, `${dimension.label} Unit`]);

  return [
    'Product ID',
    'Product ID type',
    'Select category',
    'Select subcategory',
    'Select subcategory product',
    'Title',
    'Brand',
    'Manufacturer',
    'MFR part number',
    'Name of product',
    'Write a description',
    ...requiredDimensions,
    ...optionalDimensions,
    'Images',
    'Videos',
    'This product has variants (Yes/No)',
    'Variations',
    'Pricing Variant',
    'Quantity',
    'Regular pricing',
    'Sale price',
    'Include tax (Yes/No)',
    'Tax (%)',
    'Inventory Variant',
    'SKU (Stock keeping unit)',
    'Barcode (ISBN, UPC, GTIN etc)',
    'Track quantity (Yes/No)',
    'Continue selling when out of stock (Yes/No)',
    'This is a physical product (Yes/No)',
    'Select country / region',
    'Enter a HS code',
    'IMPA code (6 digits)',
    'Storage type',
    'Shelf life days',
    'Expiry date (YYYY-MM-DD)',
    'Is Hazmat (Yes/No)',
    'UN number',
    'IMDG class',
    'Packing group',
    'Customs ref',
    'Duty free flag (Yes/No)',
    'Tags',
  ];
};

export const normalizeCellText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

export const parseCsvCell = (value: unknown): string[] => {
  return normalizeCellText(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

export const parseNumberCell = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  const normalized = normalizeCellText(value);
  if (!normalized) {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeKey = (value: string): string => value.trim().toLowerCase();

export const resolveVendorTenantId = (vendorId: string, externalVendors: ExternalVendor[]): string | undefined => {
  return externalVendors.find((v) => v.id === vendorId)?.vendorTenantId;
};
