# CATALOG BUSINESS LOGIC — IMPLEMENTATION SPECIFICATION

**Multi-Tenant E-Commerce Platform — AtoZ Marine**
Version 1.0 | April 2026
React + Vite (Frontend) | NestJS (Backend) | MongoDB

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Flow Architecture](#2-data-flow-architecture)
3. [Issue 1: Vendor Row Section for SMC Tenants](#3-issue-1-vendor-row-section-for-smc-tenants)
4. [Issue 2: Category Field Display Fix](#4-issue-2-category-field-display-fix)
5. [Issue 3: Catalog Mapping Logic](#5-issue-3-catalog-mapping-logic)
6. [Issue 4: Currency Handling Based on Vendor Financial Details](#6-issue-4-currency-handling-based-on-vendor-financial-details)
7. [Issue 5: Vendor Tenant Contract Details Visibility](#7-issue-5-vendor-tenant-contract-details-visibility)
8. [Issue 6: Catalog List View Updates](#8-issue-6-catalog-list-view-updates)
9. [Issue 7: Financial Details & Currency Acceptance](#9-issue-7-financial-details--currency-acceptance)
10. [Issue 8: Future Multi-Port Currency Exchange Architecture](#10-issue-8-future-multi-port-currency-exchange-architecture)
11. [Edge Cases & Error Handling](#11-edge-cases--error-handling)
12. [Implementation Checklist](#12-implementation-checklist)

---

## 1. Executive Summary

This document provides a comprehensive technical specification for resolving all identified catalog business logic issues in the AtoZ Marine multi-tenant procurement platform. It covers SMC vs Vendor flow separation, category display correction, currency handling based on vendor financial details, contract details visibility rules, and the future multi-port currency exchange architecture.

### 1.1 Scope

- **Issue 1**: Remove vendor row/filter for SMC-only tenants
- **Issue 2**: Display actual category data from API instead of hardcoded `'General'`
- **Issue 3**: Catalog mapping logic — SMC vs Vendor display rules
- **Issue 4**: Currency handling based on vendor financial configuration
- **Issue 5**: Hide contract details for vendor tenant type
- **Issue 6**: Apply all fixes to catalog list views
- **Issue 7**: Financial details & currency acceptance integration
- **Issue 8**: Future multi-port currency exchange scenario design

### 1.2 Current Architecture

| Layer | Technology | Location |
|---|---|---|
| Frontend | React + Vite + TypeScript | `b2b2/` |
| Backend | NestJS + MongoDB | `b2-backend/` |
| Database | MongoDB Atlas (per-tenant collections) | Atlas cluster |
| Tenant Types | `vendor-only \| smc-only \| both` | `userTypeSelection` field |

**Key Files:**
- Frontend: `CataloguePage.tsx`, `catalogService.ts`, `catalogData.tsx`
- Backend: `catalog.service.ts`, `vendor.service.ts`, `tenant.service.ts`
- Repository: `catalog.repository.ts`, `vendor.repository.ts`

---

## 2. Data Flow Architecture

### 2.1 Current Tenant Catalogue Loading Flow

The `CataloguePage.tsx` component loads tenant data through a multi-step process:

```
1. authService.getSession()                          → get tenantId
2. tenantService.getTenantDetails(tenantId)          → get userTypeSelection
3. resolveTenantCatalogueMode(userTypeSelection)     → 'vendor-only' | 'smc-only' | 'both'
4. tenantService.getVendors(tenantId)                → vendor list with financial details
5. tenantService.getCatalogs(tenantId)               → catalogs with offerings
6. Filter products by mode                           → scopedProducts
```

### 2.2 Proposed Enhanced Flow

```
1. Resolve tenant mode (same as current)
2. Fetch vendors WITH financial.currencyAccepted
3. Fetch catalogs WITH actual category field from offering.category
4. For each offering: resolve vendor → get currencyAccepted → display price in vendor currency
5. Filter: if smc-only → hide vendor column/filter entirely
6. Filter: if vendor-only → show vendor details, currency from vendor.financial
```

### 2.3 Data Flow Diagram

```
[Captain/User]
    │
    ▼
[Frontend: CataloguePage.tsx]
    │
    ├── tenantService.getTenantDetails(tenantId)
    │       └── userTypeSelection → resolveTenantCatalogueMode()
    │                └── 'vendor-only' | 'smc-only' | 'both' | 'unknown'
    │
    ├── tenantService.getVendors(tenantId)
    │       └── VendorEntity[] (includes financial.currencyAccepted[])
    │
    └── tenantService.getCatalogs(tenantId)
            └── CatalogEntity[] with OfferingEntity[]
                    └── Each offering: { category, vendorId, price, ports[] }
                            │
                            ├── Join vendor data → resolvedCurrency
                            └── Render table with mode-appropriate columns
                                    ├── smc-only  → No vendor column/filter
                                    ├── vendor-only → Vendor name + vendor currency
                                    └── both       → All columns, per-product resolution
```

---

## 3. Issue 1: Vendor Row Section for SMC Tenants

### 3.1 Problem

SMC tenants do not have vendors, but the vendor filter dropdown and Vendor column still display in the catalogue table for all non-special-role users.

### 3.2 Root Cause

- **`CataloguePage.tsx` (line 666–686)**: The vendor filter `Combobox` renders unconditionally for non-special-role users.
- **`catalogData.tsx` (line 91–94)**: `catalogColumns` always includes a `'Vendor'` column.
- **`CataloguePage.tsx` (line 519)**: `baseColumns` was used directly without filtering out the Vendor column for `smc-only` mode.

### 3.3 Fix Applied ✅

#### 3.3.1 Column Filtering (`CataloguePage.tsx`)

```tsx
// BEFORE (line 519):
const baseColumns = catalogService.getColumnsConfig();

// AFTER — filter Vendor column for SMC-only tenants:
const allBaseColumns = catalogService.getColumnsConfig();

const baseColumns = tenantCatalogueMode === 'smc-only'
  ? allBaseColumns.filter((col) => col.header !== 'Vendor')
  : allBaseColumns;
```

#### 3.3.2 Vendor Filter Combobox

```tsx
// BEFORE — always rendered:
<div className="w-40">
  <Combobox options={vendorOptions} value={selectedVendor} ... />
</div>

// AFTER — hidden for smc-only:
{tenantCatalogueMode !== 'smc-only' && (
  <div className="w-40">
    <Combobox options={vendorOptions} value={selectedVendor} ... />
  </div>
)}
```

#### 3.3.3 useMemo Dependency

```tsx
// Added tenantCatalogueMode to the columns useMemo dependency array:
}, [isSpecialRole, cartItems, isRequisitionCreated, tenantId, deletingOfferingId, tenantCatalogueMode]);
```

### 3.4 Backend Changes

No backend changes required. Mode resolution via `resolveTenantCatalogueMode()` already works correctly.

---

## 4. Issue 2: Category Field Display Fix

### 4.1 Problem

Category field shows `'General'` for all products instead of the actual category from the API.

### 4.2 Root Cause

**`catalog.repository.ts` line 548:**
```ts
category: this.normalizeOptionalString(payload.category) || 'General'
```

When products are imported without an explicit category, they default to `'General'`. The frontend also maps `category` from `catalog.name` (line 299 of `CataloguePage.tsx`), not from `offering.category`.

### 4.3 Solution

#### 4.3.1 Backend: `catalog.repository.ts`

```ts
// Change the fallback chain to use catalogId-derived name:
category: this.normalizeOptionalString(payload.category)
  || catalogId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  || 'Uncategorized'
```

#### 4.3.2 Frontend: `CataloguePage.tsx` (line 299)

```ts
// Use offering's own category field first:
category: offering.category || catalog.name || 'Uncategorized',
```

### 4.4 Migration Script

Run once to update existing offerings that have `category='General'`:

```js
db.catalogue_offerings.updateMany(
  { category: 'General' },
  [{ $set: { category: { $replaceAll: { input: '$catalogId', find: '-', replacement: ' ' } } } }]
)
```

---

## 5. Issue 3: Catalog Mapping Logic

### 5.1 Business Rules

| Condition | Display Behavior |
|---|---|
| Catalog NOT mapped to any vendor | Display as SMC product (no vendor info) |
| Catalog IS mapped to a vendor | Display mapped vendor's name and details |
| `offering.isVendorProduct === false` | SMC product — hide vendor column value |
| `offering.isVendorProduct === true` | Show vendor name from vendorId join |

### 5.2 Current Implementation (Already Working)

`CataloguePage.tsx` line 297 already handles the fallback:
```ts
vendorName: offering.vendor?.name || 'SMC Catalogue'
```

The backend `catalog.repository.ts` joins vendor data via `vendorMap` (lines 263–268).

### 5.3 Enhancement — Explicit Null-Check

```ts
vendorName: offering.vendorId && offering.vendor?.name
  ? offering.vendor.name
  : 'SMC Catalogue',

isVendorProduct: !!offering.vendorId || (offering.isVendorProduct ?? false),
```

---

## 6. Issue 4: Currency Handling Based on Vendor Financial Details

### 6.1 Business Rule

Each vendor's `financial.currencyAccepted[]` determines which currencies they operate in. Product prices **must display in the vendor's accepted currency**.

### 6.2 Data Source

`VendorFinancial` interface (`vendor.repository.ts` lines 67–77):

```ts
financial: {
  paymentTerms: string;
  currencyAccepted: string[];  // e.g., ['INR', 'USD']
  creditLimit?: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
  };
}
```

### 6.3 Frontend Changes

#### 6.3.1 Extend `CatalogProduct` Interface (`catalogData.tsx`)

```ts
export interface CatalogProduct {
  // ... existing fields ...
  vendorCurrency?: string;   // Primary currency from vendor financial
  displayPrice?: string;     // Formatted price with currency symbol
}
```

#### 6.3.2 `CataloguePage.tsx` — Product Mapping

```ts
// Build vendor currency map from tenantVendors
const vendorCurrencyMap = new Map(
  tenantVendors.map(v => [
    v.id,
    v.financial?.currencyAccepted?.[0] || 'USD'
  ])
);

// In offerings mapping:
const resolvedCurrency = offering.vendorId
  ? vendorCurrencyMap.get(offering.vendorId) || 'USD'
  : tenantDetails?.tenantInformation?.currency || 'USD';

// ...
vendorCurrency: resolvedCurrency,
displayPrice: formatCurrency(offering.price, resolvedCurrency),
```

#### 6.3.3 New Utility: `utils/currencyFormatter.ts`

```ts
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  AED: 'د.إ',
  JPY: '¥',
  AUD: 'A$',
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
```

### 6.4 Backend Enhancement

The backend already returns `vendor.financial.currencyAccepted` in the vendor entity. No new endpoints needed — the frontend resolves currency at display time.

Optionally, expose a pre-resolved field:

```ts
// catalog.repository.ts — findAllByTenant():
const offerings = stripMongoIds(offeringsRows).map(offering => ({
  ...offering,
  vendor: offering.vendorId ? vendorMap.get(offering.vendorId) ?? null : null,
  resolvedCurrency: offering.vendorId
    ? vendorMap.get(offering.vendorId)?.financial?.currencyAccepted?.[0] || 'USD'
    : null  // Frontend will use tenant currency for SMC
}));
```

### 6.5 Multi-Region Pricing Example

| Product | Vendor | Region | Currency | Price |
|---|---|---|---|---|
| Maggi Noodles | India Foods Pvt | Mumbai, India | INR | ₹10.00 |
| Maggi Noodles | SG Food Supplies | Singapore | SGD | S$2.00 |
| Maggi Noodles | Gulf Provisions | Dubai, UAE | AED | د.إ3.50 |

> **Resolution**: Each vendor's `financial.currencyAccepted[0]` determines the display currency. Same product + different vendor = different currency display. No cross-vendor price comparison or normalization is applied.

---

## 7. Issue 5: Vendor Tenant Contract Details Visibility

### 7.1 Problem

When creating or viewing a vendor tenant, the **Contract Details** section should NOT appear. Vendor tenants are not contracted entities.

### 7.2 Solution

#### 7.2.1 Frontend — Tenant Details / Create Tenant Form

```tsx
// Derive visibility from mode:
const mode = resolveTenantCatalogueMode(tenant.userTypeSelection);
const showContractDetails = mode !== 'vendor-only';

// Conditionally render:
{showContractDetails && <ContractDetailsSection />}
```

#### 7.2.2 Backend — Already Optional

In `vendor.service.ts` lines 211–221, the contract field is already optional:
```ts
contract: payload.contract ? { ...payload.contract } : undefined
```

No backend changes required — ensure the frontend does not render or submit contract fields for vendor-type tenants.

### 7.3 Vendor Type Detection Helper

```ts
// Reuse existing resolver:
const mode = resolveTenantCatalogueMode(tenant?.userConfigurations?.userTypeSelection);
const isVendorOnlyTenant = mode === 'vendor-only';
// Use isVendorOnlyTenant to conditionally hide contract section
```

---

## 8. Issue 6: Catalog List View Updates

### 8.1 Changes Summary

| Component | Change Required |
|---|---|
| `CataloguePage.tsx` | Vendor column/filter hidden for `smc-only` ✅ Fixed |
| `CataloguePage.tsx` | Use `offering.category` instead of `catalog.name` for category column |
| `catalogData.tsx` | Add `vendorCurrency` and `displayPrice` to `CatalogProduct` interface |
| `SuperadminCataloguePage.tsx` | Already uses `sourceCatalogName` — no change needed |
| Export Excel function | Include `Currency` column in exported rows |

### 8.2 Column Visibility Matrix

| Column | `vendor-only` | `smc-only` | `both` |
|---|---|---|---|
| Product Name | ✅ | ✅ | ✅ |
| Category | ✅ | ✅ | ✅ |
| Packing Info | ✅ | ✅ | ✅ |
| Reference Code | ✅ | ✅ | ✅ |
| **Vendor** | ✅ | ❌ Hidden | ✅ |
| Currency / Price | ✅ Vendor currency | ✅ Tenant currency | ✅ Resolved per-product |
| Status | ✅ | ✅ | ✅ |
| Published On | ✅ | ✅ | ✅ |
| Action | ✅ | ✅ | ✅ |

---

## 9. Issue 7: Financial Details & Currency Acceptance

### 9.1 Vendor Financial Schema

```ts
// VendorFinancial (vendor.repository.ts):
interface VendorFinancial {
  paymentTerms: string;
  currencyAccepted: string[];   // ['INR', 'USD']
  creditLimit?: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
  };
}
```

### 9.2 Currency Resolution Logic

| Product Type | Currency Source |
|---|---|
| Vendor product (`isVendorProduct = true`) | `vendor.financial.currencyAccepted[0]` |
| SMC product (`isVendorProduct = false`) | `tenant.currency` (tenant configuration) |
| `both` mode | Resolved per-product based on `isVendorProduct` flag |

### 9.3 Backend API Enhancement

```ts
// catalog.repository.ts — findAllByTenant():
const offerings = stripMongoIds(offeringsRows).map(offering => ({
  ...offering,
  vendor: offering.vendorId ? vendorMap.get(offering.vendorId) ?? null : null,
  resolvedCurrency: offering.vendorId
    ? vendorMap.get(offering.vendorId)?.financial?.currencyAccepted?.[0] ?? 'USD'
    : null,
}));
```

---

## 10. Issue 8: Future Multi-Port Currency Exchange Architecture

### 10.1 Scenario Description

When a captain/company selects a port (e.g., Mumbai), the catalog should:

- Display only products **available at that port** (`offering.ports[]` includes the selected port)
- Show prices in that **port's vendor's accepted currency**
- Display **how many vendors operate at that port**
- **Apply currency exchange rate** if captain's company currency ≠ vendor currency
- If both use the same currency → **no conversion**, display normally

### 10.2 Architecture Design

#### 10.2.1 New Backend Service: `CurrencyExchangeService`

```ts
// src/modules/currency/currency-exchange.service.ts
@Injectable()
export class CurrencyExchangeService {
  private rates: Map<string, number> = new Map();
  private lastFetched: Date | null = null;
  private readonly CACHE_TTL_MS = 3_600_000; // 1 hour

  async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1.0;
    await this.ensureRatesLoaded();
    const key = `${from}_${to}`;
    return this.rates.get(key) ?? 1.0;
  }

  async convert(
    amount: number,
    from: string,
    to: string,
  ): Promise<{ convertedAmount: number; rate: number; from: string; to: string; isStale: boolean }> {
    const rate = await this.getRate(from, to);
    const isStale = this.isRateStale();
    return { convertedAmount: amount * rate, rate, from, to, isStale };
  }

  private async ensureRatesLoaded(): Promise<void> {
    if (this.lastFetched && Date.now() - this.lastFetched.getTime() < this.CACHE_TTL_MS) {
      return;
    }
    // Fetch from exchange_rates collection OR external API
    // Populate this.rates map
    this.lastFetched = new Date();
  }

  private isRateStale(): boolean {
    if (!this.lastFetched) return true;
    return Date.now() - this.lastFetched.getTime() > 86_400_000; // 24 hours
  }
}
```

#### 10.2.2 New API Endpoint

```ts
// catalog.controller.ts
@Get('port-catalog')
async getPortCatalog(
  @Query('tenantId') tenantId: string,
  @Query('portName') portName: string,
  @Query('companyCurrency') companyCurrency: string,
): Promise<PortCatalogResponse> {
  // 1. Find all offerings where ports[] includes portName
  // 2. Find all vendors serving that port (coverage.portsServed includes portName)
  // 3. For each offering, resolve vendor currency from financial.currencyAccepted[0]
  // 4. If companyCurrency !== vendorCurrency, apply CurrencyExchangeService.convert()
  // 5. Return enriched response
}
```

#### 10.2.3 Response Shape

```ts
interface PortCatalogResponse {
  port: string;
  vendorCount: number;
  companyCurrency: string;
  products: Array<{
    id: string;
    name: string;
    category: string;
    vendorId: string;
    vendorName: string;
    vendorCurrency: string;
    originalPrice: number;          // In vendorCurrency
    convertedPrice: number | null;  // In companyCurrency (null if same currency)
    exchangeRate: number | null;    // Rate applied (null if no conversion)
    needsConversion: boolean;
    rateIsStale: boolean;           // Warning flag if rate is >24h old
  }>;
}
```

#### 10.2.4 Currency Exchange Decision Flow

```
CAPTAIN selects PORT (e.g., Mumbai)
         │
         ▼
System finds vendors serving Mumbai
  → vendor.coverage.portsServed.includes('Mumbai')
         │
         ▼
For each vendor: get financial.currencyAccepted[0]
  e.g., Vendor A → 'INR', Vendor B → 'USD'
         │
         ▼
Compare with captain's company currency (tenant.currency)
  e.g., Company currency = 'USD'
         │
    ┌────┴────┐
    │         │
Same?       Different?
    │         │
    ▼         ▼
No conversion  Fetch rate INR → USD
needsConversion = false   CurrencyExchangeService.convert()
                          convertedPrice = originalPrice × rate
                          Display both: ₹10 (INR) + $0.12 (USD)
                          Show exchange rate badge
```

### 10.3 Frontend Port Selection Component

```tsx
// pages/Catalogue/PortCatalogView.tsx
interface PortCatalogViewProps {
  tenantId: string;
  companyCurrency: string;
}

export function PortCatalogView({ tenantId, companyCurrency }: PortCatalogViewProps) {
  const [selectedPort, setSelectedPort] = useState('');
  const [portCatalog, setPortCatalog] = useState<PortCatalogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedPort) return;
    setIsLoading(true);
    catalogService
      .getPortCatalog(tenantId, selectedPort, companyCurrency)
      .then(setPortCatalog)
      .finally(() => setIsLoading(false));
  }, [selectedPort, tenantId, companyCurrency]);

  // Columns: Product | Vendor | Price (Vendor Currency) | Price (Your Currency) | Rate | Stale?
}
```

### 10.4 Database Schema: Exchange Rates Collection

```js
// Collection: exchange_rates (superadmin database)
{
  id: string,               // UUID
  fromCurrency: string,     // 'INR'
  toCurrency: string,       // 'USD'
  rate: number,             // 0.012
  source: string,           // 'manual' | 'api' | 'ecb'
  effectiveDate: Date,
  expiresAt: Date,
  updatedAt: Date
}

// Index:
{ fromCurrency: 1, toCurrency: 1, effectiveDate: -1 }
```

### 10.5 Edge Cases

| Scenario | Handling |
|---|---|
| Exchange rate not available | Use last known rate, set `rateIsStale: true` flag |
| Vendor accepts multiple currencies | Check if any match `companyCurrency`; if match, no conversion; else use `[0]` |
| Port has no vendors | Return empty products array, show empty state in UI |
| Company currency = vendor currency | `needsConversion = false`, `convertedPrice = null`, single price shown |
| Rate is stale (>24h old) | Show orange warning badge: "Rate may be outdated" |
| Vendor deleted mid-session | Fall back to `'SMC Catalogue'`, `resolvedCurrency` falls to tenant default |
| Multiple vendors at same port | Each product row carries its own vendor + currency — grouped by vendor |

---

## 11. Edge Cases & Error Handling

| Scenario | Frontend Handling | Backend Handling |
|---|---|---|
| Vendor deleted after product created | Show `'SMC Catalogue'` as fallback | `vendorMap` returns `null`, `offering.vendor = null` |
| No offerings in tenant | Show empty state | Return empty catalogs array |
| Currency field missing on vendor | Default to `'USD'` | `financial.currencyAccepted` defaults to `[]` |
| Tenant has no `userTypeSelection` | Mode = `'unknown'`, show all columns | Provision all collection types |
| Category is null/empty on offering | Display `'Uncategorized'` | Fallback chain in repository |
| Vendor-only tenant adds SMC product | `isVendorProduct` locked to `true` | Validation in `createOffering` service |
| SMC tenant accesses vendor filter | Filter hidden by `tenantCatalogueMode !== 'smc-only'` check | No filter param sent |
| API timeout during catalog load | Show stale data notice, retry button | 30s timeout, logged to activity log |

---

## 12. Implementation Checklist

### 12.1 Frontend Tasks

| # | Task | File | Priority | Status |
|---|---|---|---|---|
| F1 | Hide vendor filter/column for `smc-only` | `CataloguePage.tsx` | **HIGH** | ✅ Done |
| F2 | Use `offering.category` for display | `CataloguePage.tsx` L299 | **HIGH** | Pending |
| F3 | Add `vendorCurrency` to `CatalogProduct` | `catalogData.tsx` | MEDIUM | Pending |
| F4 | Create `formatCurrency()` utility | `utils/currencyFormatter.ts` | MEDIUM | Pending |
| F5 | Display prices with vendor currency symbol | `CataloguePage.tsx` | MEDIUM | Pending |
| F6 | Hide contract section for vendor tenant | Tenant Details component | **HIGH** | Pending |
| F7 | Add currency column to Excel export | `CataloguePage.tsx` export fn | LOW | Pending |
| F8 | Build `PortCatalogView` component | New component | FUTURE | Design only |

### 12.2 Backend Tasks

| # | Task | File | Priority | Status |
|---|---|---|---|---|
| B1 | Fix category fallback from `'General'` | `catalog.repository.ts` L548 | **HIGH** | ✅ Done |
| B2 | Add `resolvedCurrency` to offerings response | `catalog.repository.ts` | MEDIUM | ✅ Done |
| B3 | Decommission legacy `catalogueOffereing` and `tenant_catalogue` architecture | `catalog.repository.ts` | **CRITICAL** | ✅ Done |
| B4 | Consolidate CRUD operations to use unified `tenant_catalogues` and `catalogueMappings` | `catalog.repository.ts` | **CRITICAL** | ✅ Done |
| B5 | Create `CurrencyExchangeService` | New service | FUTURE | Design only |
| B6 | Add `GET /port-catalog` endpoint | `catalog.controller.ts` | FUTURE | Design only |
| B7 | Register `tenantCatalogues` & `catalogueMappings` in `TenantScopedResourceType` | `tenant-collection.service.ts` | **HIGH** | ✅ Done |

---

### 12.3 Architecture Refactor Log

#### Decommissioning Legacy Catalog Collections (Completed: May 2026)

**Summary:**
Successfully completed the full decommissioning of legacy `catalogueOffereing` and `tenant_catalogue` collections across the entire platform architecture.

**Actions Taken:**
1. **Schema Consolidation:** Transitioned all read/write paths in `CatalogRepository` to strictly rely on `tenant_catalogues` for category/metadata and `catalogueMappings` for tenant-scoped product entries.
2. **Replication Logic:** Enabled automatic cross-tenant vendor replication logic via `targetVendorTenantId` handling, syncing catalog mappings effortlessly directly to target vendor database contexts.
3. **Database Cleanup:** Executed cleanup script `scripts/drop-tenant-catalogue-collections.ts` across all tenant environments to fully clean up legacy storage overhead.

---

---

## 13. Cross-Tenant Vendor Mapping

### 13.1 Business Rules

SMC tenants (who manage catalogues) can now optionally view and select vendors from other tenants when adding products, provided they have the `canViewOtherTenantVendors` setting enabled.

- **Visibility**: When enabled, the "Add Product" flow displays a dropdown containing both own-tenant vendors and external-tenant vendors (separated by a divider).
- **Ownership**: When a product is mapped to an external vendor, the product is published to the SMC's catalogue normally. It is ALSO synced into the target vendor's catalogue asynchronously.
- **Deduplication**: The backend tracks cross-tenant syncs in `core_db.contracted_vendor_mappings` and prevents duplicate products from being synced to the external vendor. It matches based on `sourceCatalogProductId` or (legacy fallback) `productId`.

### 13.2 Frontend Architecture

- **`useTenantCatalogueContext.ts`**: Fetches own vendors, and if enabled, fetches external vendors via `getCrossTenantVendors(tenantId)`. Constructs a unified `vendorOptions` array with `isExternal` and `vendorTenantId` metadata.
- **`AddProduct.tsx`**: Extracts `vendorTenantId` when an external vendor is selected and passes it in the `createOffering` payload.
- **`tenantService.facade.ts` / `vendors.service.ts`**: Added `getCrossTenantVendors` to retrieve external vendors from the backend.
- **`TenantDetailsViewPage.tsx`**: Superadmin can toggle `canViewOtherTenantVendors` in the advanced catalogue settings section.

### 13.3 Backend Architecture

- **`VendorService.listVendorsAcrossTenants`**: Retrieves vendors from other tenants (excluding the requesting tenant and `global.platform`) and returns them as `ExternalVendorDTO` instances.
- **`CatalogService.createOffering`**: Intercepts cross-tenant mapping logic (when `vendorTenantId !== smcTenantId`), calls `syncProductToVendor` to mirror the product, and records the relationship in `ContractedVendorMappingRepository`.
- **`CatalogService.syncProductToVendor`**: Idempotent synchronization method. Searches the vendor's catalog for an existing mapped product before inserting.

---

*Document updated: May 2026 | AtoZ Technical Architecture Team*
