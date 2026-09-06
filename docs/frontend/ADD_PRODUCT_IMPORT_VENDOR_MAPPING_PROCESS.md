# Add Product Excel Import Flow (Tenant + Vendor Mapping)

## Objective
- Import products from Add Product Excel template through Import popup.
- Support tenant modes:
  - SMC + Vendor (both)
  - SMC only
  - Vendor only
- Prevent duplicate product creation.
- Map products correctly by tenant and vendor rules.

## Popup Behavior By Tenant Mode

### 1) SMC + Vendor (Both)
- Show question: Is this vendor product?
- If Yes:
  - Show Select Vendor field.
  - Map imported products to selected vendor.
  - Product still belongs to tenant catalogue context.
- If No:
  - Map imported products as tenant (SMC) products only.

### 2) SMC Only
- Do not show vendor selection.
- Import maps products to tenant only.
- No vendor mapping is applied.

### 3) Vendor Only
- Vendor mapping mode is auto-enabled.
- Vendor selector is auto-populated and pre-selected when possible.
- Available vendor ports are auto-shown from selected vendor.
- Imported products are mapped to selected vendor in tenant catalogue.

## Duplicate Handling Rules

### Existing Product In Tenant
- Match rule: Product ID (case-insensitive).
- If importing as Vendor product:
  - Do not create duplicate.
  - Update existing product mapping to selected vendor.
- If importing as SMC product:
  - Do not create duplicate.
  - Keep existing product unchanged.

### Duplicate Rows Inside Same Excel
- First occurrence is processed.
- Repeated Product ID rows are skipped.

## Import File Rules
- Accept .xlsx / .xls.
- Use first sheet for parsing.
- Expected key columns:
  - Product ID (required)
  - Product ID type
  - Select category
  - Title / Name of product
  - Regular pricing
  - Sale price
  - Include tax (Yes/No)
  - Tax (%)
  - Images
  - Videos
  - Variations
  - Inventory Variant
  - SKU (Stock keeping unit)
  - Barcode (ISBN, UPC, GTIN etc)

## Catalog Mapping Rules
- Category is resolved from Select category value.
- Vendor import products use category vendor catalogue naming.
- SMC import products use tenant category catalogue naming.
- Catalog is created if missing.

## Import Outcome Summary
- Show counts after import:
  - Created
  - Updated (vendor mapped)
  - Skipped existing
  - Skipped invalid
  - Skipped duplicate rows in file

## Scope Note
- Current scope supports importing from one uploaded Excel file at a time.
- Multiple product rows can still be processed from that single file.

## Related Dynamic Catalogue Spec
- For category/subcategory-driven marine rules (dynamic field visibility, compliance validations, inventory behavior, RFQ matching), refer to:
  - `CATALOGUE_MARINE_DYNAMIC_REQUIREMENTS.md`
