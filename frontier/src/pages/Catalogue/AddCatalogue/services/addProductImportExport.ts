import * as XLSX from 'xlsx';

import productFormConfig from '@/data/json/productFormConfig.json';
import { ApiException } from '@/lib/apiClient';
import type {
  BulkCreateOfferingsResult,
  TenantCatalog,
  TenantOffering,
  TenantVendor,
  CreateOfferingPayload,
} from '@/services/microservices/tenant';

import {
  buildAddProductTemplateHeaders,
  normalizeCellText,
  normalizeKey,
  parseCsvCell,
  parseNumberCell,
} from '../addProduct.utils';

interface TenantCatalogApi {
  getCatalogs(tenantId: string): Promise<TenantCatalog[]>;
  getOfferings(tenantId: string, catalogId: string): Promise<TenantOffering[]>;
  createCatalog(
    tenantId: string,
    payload: { name: string; description?: string },
  ): Promise<TenantCatalog>;
  createOffering(
    tenantId: string,
    catalogId: string,
    payload: CreateOfferingPayload,
  ): Promise<TenantOffering>;
  createOfferingsBulk?(
    tenantId: string,
    catalogId: string,
    payload: { offerings: CreateOfferingPayload[] },
  ): Promise<BulkCreateOfferingsResult>;
  updateOffering(
    tenantId: string,
    catalogId: string,
    offeringId: string,
    payload: Partial<CreateOfferingPayload>,
  ): Promise<TenantOffering>;
}

export interface ImportProductsFromExcelParams {
  tenantServiceApi: TenantCatalogApi;
  tenantId: string;
  importFile: File;
  tenantVendors: TenantVendor[];
  importRequiresVendorSelection: boolean;
  importSelectedVendor: string;
  importSelectedPort: string;
  categoryLabelMap: Map<string, string>;
  preferBulkUpload?: boolean;
  bulkChunkSize?: number;
}

export interface ImportProductsFromExcelResult {
  createdCount: number;
  mappedExistingCount: number;
  mappedCreatedCount: number;
  skippedExistingCount: number;
  skippedInvalidCount: number;
  skippedDuplicateInFileCount: number;
  createdCatalogCount: number;
  refreshedCatalogs: TenantCatalog[];
}

interface PendingCreateEntry {
  payload: CreateOfferingPayload;
  resolvedVendorId?: string;
}

const DEFAULT_BULK_CHUNK_SIZE = 60;
const MIN_BULK_CHUNK_SIZE = 10;
const MAX_BULK_CHUNK_SIZE = 200;

export const exportAddProductTemplate = (resolvedTenantId: string): void => {
  const exportHeaders = buildAddProductTemplateHeaders();
  const templateRow = exportHeaders.reduce<Record<string, string>>((acc, header) => {
    acc[header] = '';
    return acc;
  }, {});

  const worksheet = XLSX.utils.json_to_sheet([templateRow], { header: exportHeaders });
  worksheet['!cols'] = exportHeaders.map((header) => {
    const width = Math.min(Math.max(header.length + 2, 20), 45);
    return { wch: width };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Add Product Template');

  const dateStamp = new Date().toISOString().slice(0, 10);
  const tenantLabel = resolvedTenantId ? `tenant-${resolvedTenantId.slice(0, 8)}` : 'global';
  XLSX.writeFile(workbook, `add-product-import-template-${tenantLabel}-${dateStamp}.xlsx`);
};

const resolveCategoryLabelForImport = (
  rawCategory: string,
  categoryLabelMap: Map<string, string>,
): string => {
  const trimmedCategory = rawCategory.trim();
  if (!trimmedCategory) {
    return 'General';
  }

  const labelByValue = categoryLabelMap.get(trimmedCategory);
  if (labelByValue) {
    return labelByValue;
  }

  const matchedLabel = productFormConfig.categories.find(
    (category) => category.label.trim().toLowerCase() === trimmedCategory.toLowerCase(),
  );

  if (matchedLabel) {
    return matchedLabel.label;
  }

  return trimmedCategory;
};

const createCountryNormalizer = (): ((value: string) => string) => {
  const countryAliasMap = new Map<string, string>();
  productFormConfig.countryRegions.forEach((region) => {
    countryAliasMap.set(normalizeKey(region.value), normalizeKey(region.label));
    countryAliasMap.set(normalizeKey(region.label), normalizeKey(region.label));
  });

  return (value: string): string => {
    const normalized = normalizeKey(value);
    if (!normalized) {
      return '';
    }

    return countryAliasMap.get(normalized) || normalized;
  };
};

const getVendorPorts = (tenantVendors: TenantVendor[], vendorId: string | undefined): string[] => {
  if (!vendorId) {
    return [];
  }

  const vendor = tenantVendors.find((item) => item.id === vendorId);
  const ports = Array.isArray(vendor?.coverage?.portsServed)
    ? vendor.coverage.portsServed.filter(
      (port): port is string => typeof port === 'string' && port.trim().length > 0,
    )
    : [];

  return ports;
};

const resolveVendorForRow = (
  tenantVendors: TenantVendor[],
  importRequiresVendorSelection: boolean,
  importSelectedVendor: string,
  rowCountryRaw: string,
  normalizeCountryKey: (value: string) => string,
): string | undefined => {
  if (!importRequiresVendorSelection) {
    return undefined;
  }

  if (tenantVendors.length === 1) {
    return tenantVendors[0].id;
  }

  const normalizedCountry = normalizeCountryKey(rowCountryRaw);
  if (!normalizedCountry) {
    return importSelectedVendor || undefined;
  }

  const countryMatchedVendors = tenantVendors.filter((vendor) => {
    const servedCountries = Array.isArray(vendor.coverage?.countriesServed)
      ? vendor.coverage.countriesServed
      : [];

    return servedCountries.some((country) => normalizeCountryKey(country) === normalizedCountry);
  });

  if (countryMatchedVendors.length === 0) {
    return importSelectedVendor || undefined;
  }

  if (countryMatchedVendors.length === 1) {
    return countryMatchedVendors[0].id;
  }

  if (importSelectedVendor && countryMatchedVendors.some((vendor) => vendor.id === importSelectedVendor)) {
    return importSelectedVendor;
  }

  return undefined;
};

const isDuplicateProductError = (error: ApiException): boolean => {
  const message = (error.errorMessage || '').toLowerCase();
  return error.statusCode === 409 || message.includes('productid must be unique');
};

const isDuplicateProductReason = (reason: string): boolean => {
  return reason.trim().toLowerCase().includes('productid must be unique');
};

const resolveBulkChunkSize = (chunkSize: number | undefined): number => {
  if (typeof chunkSize !== 'number' || !Number.isFinite(chunkSize)) {
    return DEFAULT_BULK_CHUNK_SIZE;
  }

  return Math.max(MIN_BULK_CHUNK_SIZE, Math.min(MAX_BULK_CHUNK_SIZE, Math.floor(chunkSize)));
};

const chunkEntries = <T,>(items: T[], chunkSize: number): T[][] => {
  if (items.length === 0) {
    return [];
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

const parseBooleanCell = (value: unknown): boolean | undefined => {
  const normalized = normalizeCellText(value).toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (['yes', 'true', '1', 'y'].includes(normalized)) {
    return true;
  }

  if (['no', 'false', '0', 'n'].includes(normalized)) {
    return false;
  }

  return undefined;
};

export const importProductsFromExcel = async (
  params: ImportProductsFromExcelParams,
): Promise<ImportProductsFromExcelResult> => {
  const {
    tenantServiceApi,
    tenantId,
    importFile,
    tenantVendors,
    importRequiresVendorSelection,
    importSelectedVendor,
    importSelectedPort,
    categoryLabelMap,
    preferBulkUpload = false,
    bulkChunkSize,
  } = params;

  const fileBuffer = await importFile.arrayBuffer();
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('No worksheet found in uploaded file.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
  });

  if (rows.length === 0) {
    throw new Error('Uploaded file has no product rows.');
  }

  const latestCatalogs = await tenantServiceApi.getCatalogs(tenantId);
  const catalogsWithOfferings = await Promise.all(
    latestCatalogs.map(async (catalog) => {
      try {
        const offerings = await tenantServiceApi.getOfferings(tenantId, catalog.id);
        return {
          catalog,
          offerings: Array.isArray(offerings) ? offerings : [],
        };
      } catch {
        return {
          catalog,
          offerings: [] as TenantOffering[],
        };
      }
    }),
  );

  const catalogByName = new Map<string, TenantCatalog>();
  latestCatalogs.forEach((catalog) => {
    catalogByName.set(normalizeKey(catalog.name), catalog);
  });

  const normalizeCountryKey = createCountryNormalizer();

  const existingByProductId = new Map<string, { catalogId: string; offering: TenantOffering }>();
  catalogsWithOfferings.forEach(({ catalog, offerings }) => {
    offerings.forEach((offering) => {
      const offeringProductId = normalizeCellText(offering.productId);
      if (!offeringProductId) {
        return;
      }

      const key = normalizeKey(offeringProductId);
      if (!existingByProductId.has(key)) {
        existingByProductId.set(key, {
          catalogId: catalog.id,
          offering,
        });
      }
    });
  });

  let createdCount = 0;
  let mappedExistingCount = 0;
  let mappedCreatedCount = 0;
  let skippedExistingCount = 0;
  let skippedInvalidCount = 0;
  let skippedDuplicateInFileCount = 0;
  let createdCatalogCount = 0;

  const pendingCreatesByCatalog = new Map<string, PendingCreateEntry[]>();
  const shouldUseBulkUpload = Boolean(preferBulkUpload && tenantServiceApi.createOfferingsBulk);
  const effectiveBulkChunkSize = resolveBulkChunkSize(bulkChunkSize);

  const seenFileProductIds = new Set<string>();

  const ensureCatalog = async (categoryLabel: string): Promise<TenantCatalog> => {
    const catalogName = importRequiresVendorSelection
      ? `${categoryLabel}`
      : categoryLabel;
    const normalizedName = normalizeKey(catalogName);
    const existingCatalog = catalogByName.get(normalizedName);

    if (existingCatalog) {
      return existingCatalog;
    }

    const createdCatalog = await tenantServiceApi.createCatalog(tenantId, {
      name: catalogName,
      description: importRequiresVendorSelection
        ? 'Vendor mapped tenant catalogue'
        : 'Tenant catalogue',
    });

    catalogByName.set(normalizedName, createdCatalog);
    createdCatalogCount += 1;
    return createdCatalog;
  };

  const createSingleOffering = async (
    catalogId: string,
    entry: PendingCreateEntry,
  ): Promise<void> => {
    const createdOffering = await tenantServiceApi.createOffering(
      tenantId,
      catalogId,
      entry.payload,
    );

    if (!importRequiresVendorSelection || !entry.resolvedVendorId) {
      createdCount += 1;
      return;
    }

    const isPersistedVendorMapped =
      createdOffering.vendorId === entry.resolvedVendorId
      && createdOffering.isVendorProduct === true;

    if (isPersistedVendorMapped) {
      mappedCreatedCount += 1;
      createdCount += 1;
      return;
    }

    const updatedOffering = await tenantServiceApi.updateOffering(
      tenantId,
      catalogId,
      createdOffering.id,
      entry.payload,
    );

    if (
      updatedOffering.vendorId === entry.resolvedVendorId
      && updatedOffering.isVendorProduct === true
    ) {
      mappedCreatedCount += 1;
    }

    createdCount += 1;
  };

  const createOfferingsWithBulkApi = async (
    catalogId: string,
    entries: PendingCreateEntry[],
  ): Promise<void> => {
    const chunks = chunkEntries(entries, effectiveBulkChunkSize);

    for (const chunk of chunks) {
      try {
        const bulkResult = await tenantServiceApi.createOfferingsBulk!(
          tenantId,
          catalogId,
          {
            offerings: chunk.map((entry) => entry.payload),
          },
        );

        const createdFromResponse = Array.isArray(bulkResult.created)
          ? bulkResult.created.length
          : 0;
        const createdFromCount = typeof bulkResult.createdCount === 'number'
          ? bulkResult.createdCount
          : createdFromResponse;
        const createdInChunk = Math.max(
          0,
          Math.min(chunk.length, createdFromCount || createdFromResponse),
        );

        createdCount += createdInChunk;
        if (importRequiresVendorSelection) {
          mappedCreatedCount += createdInChunk;
        }

        const failedRows = Array.isArray(bulkResult.failed) ? bulkResult.failed : [];
        failedRows.forEach((failure) => {
          const reason = normalizeCellText(failure.reason);
          if (reason && isDuplicateProductReason(reason)) {
            skippedExistingCount += 1;
            return;
          }

          skippedInvalidCount += 1;
        });

        const accountedRows = createdInChunk + failedRows.length;
        if (accountedRows < chunk.length) {
          skippedInvalidCount += chunk.length - accountedRows;
        }
      } catch {
        for (const entry of chunk) {
          try {
            await createSingleOffering(catalogId, entry);
          } catch (rowError) {
            if (rowError instanceof ApiException && isDuplicateProductError(rowError)) {
              skippedExistingCount += 1;
            } else {
              skippedInvalidCount += 1;
            }
          }
        }
      }
    }
  };

  for (const row of rows) {
    const productIdCell = normalizeCellText(row['Product ID']);
    const productIdKey = normalizeKey(productIdCell);

    if (!productIdCell) {
      skippedInvalidCount += 1;
      continue;
    }

    if (seenFileProductIds.has(productIdKey)) {
      skippedDuplicateInFileCount += 1;
      continue;
    }
    seenFileProductIds.add(productIdKey);

    const productName = normalizeCellText(row['Title'])
      || normalizeCellText(row['Name of product'])
      || productIdCell;

    const regularPrice = parseNumberCell(row['Regular pricing'], 0);
    if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
      skippedInvalidCount += 1;
      continue;
    }

    const categoryRaw = normalizeCellText(row['Select category']);
    const categoryLabel = resolveCategoryLabelForImport(categoryRaw, categoryLabelMap);
    const rowCountry = normalizeCellText(row['Select country / region']);
    const resolvedVendorId = resolveVendorForRow(
      tenantVendors,
      importRequiresVendorSelection,
      importSelectedVendor,
      rowCountry,
      normalizeCountryKey,
    );

    if (importRequiresVendorSelection && !resolvedVendorId) {
      skippedInvalidCount += 1;
      continue;
    }

    const vendorPorts = getVendorPorts(tenantVendors, resolvedVendorId);
    const resolvedPort = importRequiresVendorSelection
      ? (importSelectedPort && vendorPorts.includes(importSelectedPort)
        ? importSelectedPort
        : (vendorPorts[0] || importSelectedPort || ''))
      : '';

    if (importRequiresVendorSelection && !resolvedPort && vendorPorts.length > 0) {
      skippedInvalidCount += 1;
      continue;
    }

    const pricingVariant = normalizeCellText(row['Pricing Variant']);
    const inventoryVariant = normalizeCellText(row['Inventory Variant']) || pricingVariant || 'N/A';
    const sku = normalizeCellText(row['SKU (Stock keeping unit)']);
    const barcode = normalizeCellText(row['Barcode (ISBN, UPC, GTIN etc)']);
    const quantity = parseNumberCell(row['Quantity'], 0);
    const shelfLifeDaysRaw = parseNumberCell(row['Shelf life days'], 0);
    const shelfLifeDays = shelfLifeDaysRaw > 0 ? Math.floor(shelfLifeDaysRaw) : undefined;
    const expiryDate = normalizeCellText(row['Expiry date (YYYY-MM-DD)']);
    const isHazmat = parseBooleanCell(row['Is Hazmat (Yes/No)']);
    const dutyFreeFlag = parseBooleanCell(row['Duty free flag (Yes/No)']);

    const inventoryPayload =
      sku.length > 0
        || barcode.length > 0
        || quantity > 0
        || (inventoryVariant.length > 0 && inventoryVariant !== 'N/A')
        ? [{
          variant: inventoryVariant,
          sku,
          barcode,
          quantity,
        }]
        : [];

    const subcatRaw = normalizeCellText(row['Select subcategory']);
    const subcatProdRaw = normalizeCellText(row['Select subcategory product']);
    const resolvedSubcategory = subcatProdRaw
      ? (subcatRaw ? `${subcatRaw} - ${subcatProdRaw}` : subcatProdRaw)
      : subcatRaw || undefined;

    const offeringPayload: CreateOfferingPayload = {
      name: productName,
      price: regularPrice,
      vendorId: importRequiresVendorSelection ? resolvedVendorId : undefined,
      isVendorProduct: importRequiresVendorSelection,
      ports: importRequiresVendorSelection && resolvedPort ? [resolvedPort] : [],
      productId: productIdCell,
      productIdType: normalizeCellText(row['Product ID type']) || 'UPC',
      images: parseCsvCell(row['Images']),
      videos: parseCsvCell(row['Videos']),
      variations: parseCsvCell(row['Variations']),
      inventory: inventoryPayload,
      category: categoryLabel || undefined,
      subcategory: resolvedSubcategory,
      impaCode: normalizeCellText(row['IMPA code (6 digits)']) || undefined,
      mfrPartNumber: normalizeCellText(row['MFR part number']) || undefined,
      hsCode:
        normalizeCellText(row['Enter a HS code'])
        || normalizeCellText(row['HS code'])
        || undefined,
      storageType: normalizeCellText(row['Storage type']) || undefined,
      shelfLifeDays,
      expiryDate: expiryDate || undefined,
      isHazmat,
      unNumber: normalizeCellText(row['UN number']) || undefined,
      imdgClass: normalizeCellText(row['IMDG class']) || undefined,
      packingGroup: normalizeCellText(row['Packing group']) || undefined,
      customsRef: normalizeCellText(row['Customs ref']) || undefined,
      dutyFreeFlag,
    };

    const existingProduct = existingByProductId.get(productIdKey);

    try {
      if (existingProduct) {
        if (importRequiresVendorSelection) {
          const alreadyMappedToVendor =
            existingProduct.offering.vendorId === resolvedVendorId
            && existingProduct.offering.isVendorProduct === true;

          if (alreadyMappedToVendor) {
            skippedExistingCount += 1;
            continue;
          }

          const updatedOffering = await tenantServiceApi.updateOffering(
            tenantId,
            existingProduct.catalogId,
            existingProduct.offering.id,
            offeringPayload,
          );

          existingByProductId.set(productIdKey, {
            catalogId: existingProduct.catalogId,
            offering: updatedOffering,
          });
          mappedExistingCount += 1;
        } else {
          skippedExistingCount += 1;
        }

        continue;
      }

      const targetCatalog = await ensureCatalog(categoryLabel);
      const pendingEntries = pendingCreatesByCatalog.get(targetCatalog.id) ?? [];
      pendingEntries.push({
        payload: offeringPayload,
        resolvedVendorId,
      });
      pendingCreatesByCatalog.set(targetCatalog.id, pendingEntries);
    } catch (rowError) {
      if (rowError instanceof ApiException && isDuplicateProductError(rowError)) {
        skippedExistingCount += 1;
      } else {
        skippedInvalidCount += 1;
      }
    }
  }

  for (const [catalogId, entries] of pendingCreatesByCatalog.entries()) {
    if (entries.length === 0) {
      continue;
    }

    if (shouldUseBulkUpload) {
      await createOfferingsWithBulkApi(catalogId, entries);
      continue;
    }

    for (const entry of entries) {
      try {
        await createSingleOffering(catalogId, entry);
      } catch (rowError) {
        if (rowError instanceof ApiException && isDuplicateProductError(rowError)) {
          skippedExistingCount += 1;
        } else {
          skippedInvalidCount += 1;
        }
      }
    }
  }

  const refreshedCatalogs = await tenantServiceApi.getCatalogs(tenantId);

  return {
    createdCount,
    mappedExistingCount,
    mappedCreatedCount,
    skippedExistingCount,
    skippedInvalidCount,
    skippedDuplicateInFileCount,
    createdCatalogCount,
    refreshedCatalogs: Array.isArray(refreshedCatalogs) ? refreshedCatalogs : [],
  };
};
