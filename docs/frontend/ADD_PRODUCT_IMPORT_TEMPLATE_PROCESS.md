# Add Product Import Template Process

## Purpose
- Use the Export button on Add Product page to download a clean Excel template.
- Fill one row for single product import or multiple rows for bulk upload.
- Vendor and Port sections are intentionally excluded from this template.

## Where To Export
1. Open tenant Add Product page.
2. Click Export.
3. Downloaded file name format:
   add-product-import-template-tenant-XXXXXXXX-YYYY-MM-DD.xlsx

## Template Columns
The template includes Add Product form fields only:

- Product ID
- Product ID type
- Select category
- Title
- Brand
- Manufacturer
- MFR part number
- Name of product
- Write a description
- Length Value
- Length Unit
- Width Value
- Width Unit
- Height Value
- Height Unit
- Weight Value
- Weight Unit
- Volume Value
- Volume Unit
- Images
- Videos
- This product has variants (Yes/No)
- Variations
- Pricing Variant
- Quantity
- Regular pricing
- Sale price
- Include tax (Yes/No)
- Tax (%)
- Inventory Variant
- SKU (Stock keeping unit)
- Barcode (ISBN, UPC, GTIN etc)
- Track quantity (Yes/No)
- Continue selling when out of stock (Yes/No)
- This is a physical product (Yes/No)
- Select country / region
- Enter a HS code
- Tags

## Data Entry Rules
1. Product ID must be unique for each product row.
2. Use Yes or No for boolean fields.
3. Use comma separated values for multi-value fields:
   Images, Videos, Variations, Tags.
4. Keep numeric values in numeric columns:
   Quantity, Regular pricing, Sale price, Tax (%).
5. Leave optional fields empty if not applicable.

## Single Product Import
1. Fill only one data row under headers.
2. Save as .xlsx.
3. Upload with single product import flow.

## Bulk Upload
1. Fill multiple rows, one product per row.
2. Keep column headers unchanged.
3. Save as .xlsx.
4. Upload with bulk upload flow.

## Important Notes
- Do not rename, remove, or reorder column headers.
- Do not add Vendor or Port columns.
- Keep one workbook format for both single and bulk upload.
