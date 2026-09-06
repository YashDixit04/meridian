# Marine Product Category and Subcategory Dynamic System (Catalogue)

## Objective

Design a category-driven product management model for marine procurement where product fields, validations, compliance controls, inventory logic, and RFQ matching behavior change dynamically by category and subcategory while remaining fully multi-tenant.

This document aligns with:
- IMPA Marine Stores Guide (MSG)
- SOLAS
- MARPOL
- MLC 2006
- IMDG / IMO compliance expectations

## Current System Baseline (as-is)

Current catalogue backend supports:
- tenant catalog containers in `tenant_catalogues`
- offerings in `catalogue_offereing`
- derived mappings in `catalogue_mappings` and `tenant_catalogue`
- basic field structure (`name`, `price`, `vendorId`, `productId`, media, variations, inventory)

Gap:
- category-specific dynamic schema behavior is not yet enforced at data layer.

## Target Category Model

Primary categories:
1. Technical Stores / Spares
2. Lubricants and Bunkers
3. Provisions and Victualling
4. Cabin Stores
5. Deck Stores
6. Electrical Stores
7. Safety and Fire Fighting
8. Marine Chemicals
9. Engine Room Consumables
10. Bonded Stores

Each category has subcategories with independent behavior (field visibility, requiredness, locking, validation strictness, compliance requirements).

## Data Model Extension (non-breaking)

To keep previous functionality working, extend offering payload with optional structured metadata instead of replacing existing fields.

Recommended additive fields on offering:
- `categoryCode` (string)
- `subcategoryCode` (string)
- `idType` (enum: IMPA, MFR_PART, GTIN, SKU, ISSA, OTHER)
- `impaCode` (string, 6 digits where applicable)
- `manufacturer` (string)
- `brand` (string)
- `specification` (object)
- `dimensions` (object: length/width/height + units)
- `weight` (object: value + unit)
- `volume` (object: value + unit)
- `storageType` (enum)
- `expiryDate` (date)
- `shelfLifeDays` (number)
- `isHazmat` (boolean)
- `hazmat` (object: `unNumber`, `imdgClass`, `packingGroup`, `flashPoint`)
- `certification` (object)
- `serialTracking` (object)
- `barcode` (string)
- `hsCode` (string)
- `complianceFlags` (array)
- `pricingRules` (object)
- `inventoryMode` (enum: PIECE, SERIAL, BATCH, VOLUME)

Existing fields remain valid to preserve current API consumers.

## Dynamic Field Behavior Engine

Implement a config-driven rules engine:
- key: `categoryCode + subcategoryCode`
- outputs:
  - visible fields
  - required fields
  - locked/default fields
  - per-field validation constraints
  - inventory behavior
  - pricing behavior
  - RFQ matching strategy

Rules are global across tenants, while prices and commercial data remain tenant-scoped.

## Required Dynamic Behaviors

Examples to enforce:
- Fresh provisions: show `shelfLifeDays` (required), hide `expiryDate`
- Frozen provisions: require `expiryDate`, lock `storageType=FROZEN_MINUS_18`
- Chilled provisions: require `expiryDate`, lock `storageType=CHILLED_0_TO_4`
- Safety LSA/FFA: require `certification`, `serviceDueDate`, `serialNumber`
- Marine chemicals: require `hazmat.unNumber`, `hazmat.imdgClass`, `hazmat.packingGroup`
- Bonded stores: require `barcode`, `customsRef`, `dutyFreeFlag`
- Cables/Wires: require length unit and value
- Lubricants: require volume unit and pack-size variants

## Validation Matrix (high-level)

- MFR part number mandatory for Technical Spares, Safety, Electrical
- Brand mandatory for Lubricants, Safety, Bonded, Spares
- Expiry must be future date for Frozen, Safety, Bonded (and any medical extension)
- DG class required when `isHazmat=true`
- Certification mandatory for Safety and applicable Navigation/Electrical items
- Barcode mandatory for Bonded
- Volume unit mandatory for Lubricants/Chemicals/Beverages/Bonded alcohol
- Length unit mandatory for ropes/chains/wires/cables
- IMPA format: 6 digits where supplied
- Serial tracking mandatory for critical Safety equipment

## Inventory Behavior by Category

- FIFO: Provisions, Bonded (and medical if enabled)
- Serial tracking: Safety LSA/FFA
- Batch tracking: Provisions (HACCP), Chemicals
- Volume stock: Lubricants, Chemicals, Bunkers
- Piece stock: remaining categories
- Reorder alerts: critical spares and safety items

## Pricing and RFQ Logic

Pricing:
- regular/sale pricing for all
- tax inclusion toggle for all
- volume-tier pricing for Lubricants and Chemicals
- tenant currency separation (SMC vs Vendor)
- disallow discount for compliance-critical Safety/LSA items

RFQ matching:
- Technical spares: exact MFR + maker match
- Lubricants: brand-constrained match (OEM check)
- Provisions: flexible brand, type + quantity match
- Safety: equivalent certification mandatory
- Chemicals: concentration + MSDS/SDS comparison
- Bonded: exact brand + volume
- General consumables: controlled substitution

## Multi-Tenant Enforcement

- SMC: requisition and catalog consumption
- Vendor: RFQ response and product proposal
- Admin: schema/rule governance

Non-negotiable compliance fields (Safety, Bonded, Chemicals) cannot be bypassed by any role.

## Backward Compatibility Strategy

1. Keep existing offering endpoints and fields unchanged.
2. Add optional metadata fields and rules evaluation service.
3. Enforce strict validation only when category/subcategory is supplied.
4. Migrate existing records with default category profile `LEGACY_GENERIC`.
5. Introduce frontend dynamic forms gradually based on backend-provided rule schema.

This preserves current functionality while enabling phased rollout.

## Suggested Implementation Phases

Phase 1:
- Add category/subcategory and metadata fields
- Add rule config store (static JSON or DB table/collection)
- Add backend validation middleware/service

Phase 2:
- Expose `GET /catalog-rules` for dynamic UI rendering
- UI show/hide/lock/required behavior by selected category

Phase 3:
- Add compliance workflows (certificate and SDS attachments)
- Add RFQ comparator upgrades per category logic

Phase 4:
- Add migration scripts and reporting dashboards

## Acceptance Criteria

- Product form dynamically changes by category/subcategory.
- Invalid compliance submissions are rejected at API layer.
- Existing product CRUD and import flows continue to function.
- Multi-tenant isolation and pricing behavior remain unchanged.
- RFQ matching behavior changes correctly by category profile.

