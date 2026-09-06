const docx = require("docx");
const fs = require("fs");
const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,BorderStyle,AlignmentType,TableOfContents} = docx;

const BLUE = "2563EB";
const DARK = "1E293B";
const GRAY = "64748B";
const LIGHT_BG = "F1F5F9";

function h1(t){return new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:400,after:200},children:[new TextRun({text:t,bold:true,size:32,color:BLUE})]});}
function h2(t){return new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:300,after:150},children:[new TextRun({text:t,bold:true,size:26,color:DARK})]});}
function h3(t){return new Paragraph({heading:HeadingLevel.HEADING_3,spacing:{before:200,after:100},children:[new TextRun({text:t,bold:true,size:22,color:DARK})]});}
function p(t){return new Paragraph({spacing:{after:120},children:[new TextRun({text:t,size:20,color:DARK})]});}
function bullet(t){return new Paragraph({spacing:{after:80},bullet:{level:0},children:[new TextRun({text:t,size:20,color:DARK})]});}
function boldP(label,val){return new Paragraph({spacing:{after:100},children:[new TextRun({text:label,bold:true,size:20,color:DARK}),new TextRun({text:val,size:20,color:GRAY})]});}
function code(t){return new Paragraph({spacing:{after:100},children:[new TextRun({text:t,size:18,font:"Consolas",color:"7C3AED"})]});}

function makeRow(cells,header=false){
  return new TableRow({children:cells.map(c=>new TableCell({
    shading:header?{fill:"DBEAFE"}:{fill:"FFFFFF"},
    width:{size:100/cells.length,type:WidthType.PERCENTAGE},
    children:[new Paragraph({children:[new TextRun({text:c,bold:header,size:18,color:DARK})]})]
  }))});
}
function makeTable(headers,rows){
  return new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
    makeRow(headers,true),...rows.map(r=>makeRow(r))
  ]});
}

const sections = [];

// COVER
sections.push(
  new Paragraph({spacing:{before:2000},alignment:AlignmentType.CENTER,children:[new TextRun({text:"CATALOG BUSINESS LOGIC",bold:true,size:48,color:BLUE})]}),
  new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"IMPLEMENTATION SPECIFICATION",bold:true,size:36,color:DARK})]}),
  new Paragraph({spacing:{before:400},alignment:AlignmentType.CENTER,children:[new TextRun({text:"Multi-Tenant E-Commerce Platform — AtoZ Marine",size:24,color:GRAY})]}),
  new Paragraph({spacing:{before:200},alignment:AlignmentType.CENTER,children:[new TextRun({text:"Version 1.0 | April 2026",size:20,color:GRAY})]}),
  new Paragraph({spacing:{before:200},alignment:AlignmentType.CENTER,children:[new TextRun({text:"React + Vite (Frontend) | NestJS (Backend) | MongoDB",size:20,color:GRAY})]}),
);

// 1. EXECUTIVE SUMMARY
sections.push(
  h1("1. Executive Summary"),
  p("This document provides a comprehensive technical specification for resolving all identified catalog business logic issues in the AtoZ Marine multi-tenant procurement platform. It covers SMC vs Vendor flow separation, category display correction, currency handling based on vendor financial details, contract details visibility rules, and the future multi-port currency exchange architecture."),
  h2("1.1 Scope"),
  bullet("Issue 1: Remove vendor row/filter for SMC-only tenants"),
  bullet("Issue 2: Display actual category data from API instead of hardcoded 'General'"),
  bullet("Issue 3: Catalog mapping logic — SMC vs Vendor display rules"),
  bullet("Issue 4: Currency handling based on vendor financial configuration"),
  bullet("Issue 5: Hide contract details for vendor tenant type"),
  bullet("Issue 6: Apply all fixes to catalog list views"),
  bullet("Issue 7: Financial details & currency acceptance integration"),
  bullet("Issue 8: Future multi-port currency exchange scenario design"),
  h2("1.2 Current Architecture"),
  boldP("Frontend: ","React + Vite + TypeScript (b2b2/)"),
  boldP("Backend: ","NestJS + MongoDB (b2-backend/)"),
  boldP("Database: ","MongoDB Atlas with per-tenant collections"),
  boldP("Tenant Types: ","vendor-only | smc-only | both"),
  boldP("Key Files: ",""),
  bullet("Frontend: CataloguePage.tsx, catalogService.ts, catalogData.tsx"),
  bullet("Backend: catalog.service.ts, vendor.service.ts, tenant.service.ts"),
  bullet("Repository: catalog.repository.ts, vendor.repository.ts"),
);

// 2. DATA FLOW
sections.push(
  h1("2. Data Flow Architecture"),
  h2("2.1 Current Tenant Catalogue Loading Flow"),
  p("The CataloguePage.tsx component loads tenant data through a multi-step process:"),
  code("1. authService.getSession() → get tenantId"),
  code("2. tenantService.getTenantDetails(tenantId) → get userTypeSelection"),
  code("3. resolveTenantCatalogueMode(userTypeSelection) → 'vendor-only' | 'smc-only' | 'both'"),
  code("4. tenantService.getVendors(tenantId) → vendor list with financial details"),
  code("5. tenantService.getCatalogs(tenantId) → catalogs with offerings"),
  code("6. Filter products by mode → scopedProducts"),
  h2("2.2 Proposed Enhanced Flow"),
  code("1. Resolve tenant mode (same as current)"),
  code("2. Fetch vendors WITH financial.currencyAccepted"),
  code("3. Fetch catalogs WITH actual category field from offering.category"),
  code("4. For each offering: resolve vendor → get currencyAccepted → display price in vendor currency"),
  code("5. Filter: if smc-only → hide vendor column/filter entirely"),
  code("6. Filter: if vendor-only → show vendor details, currency from vendor.financial"),
  h2("2.3 Data Flow Diagram"),
  p("[Captain/User] → [Frontend CataloguePage] → [tenantService.getTenantDetails()]"),
  p("    → Resolves userTypeSelection → TenantCatalogueMode"),
  p("    → [tenantService.getVendors()] → VendorEntity[] (includes financial.currencyAccepted)"),
  p("    → [tenantService.getCatalogs()] → CatalogEntity[] with OfferingEntity[]"),
  p("    → Each offering carries: category, vendorId, price, ports[]"),
  p("    → Frontend joins vendor data to offering → resolves display currency"),
  p("    → Renders table with mode-appropriate columns"),
);

// 3. ISSUE 1 - VENDOR ROW
sections.push(
  h1("3. Issue 1: Vendor Row Section for SMC Tenants"),
  h2("3.1 Problem"),
  p("SMC tenants do not have vendors, but the vendor filter dropdown and vendor column still display in the catalogue table."),
  h2("3.2 Root Cause"),
  p("In CataloguePage.tsx (line 666-686), the vendor filter Combobox renders unconditionally for non-special-role users. The catalogColumns in catalogData.tsx always includes a 'Vendor' column (line 91-94)."),
  h2("3.3 Solution"),
  h3("3.3.1 Frontend: CataloguePage.tsx"),
  code("// In tableFilters section (line ~666), wrap vendor combobox:"),
  code("const showVendorFilter = tenantCatalogueMode !== 'smc-only';"),
  code(""),
  code("{showVendorFilter && ("),
  code("  <div className='w-40'>"),
  code("    <Combobox options={vendorOptions} value={selectedVendor} ... />"),
  code("  </div>"),
  code(")}"),
  h3("3.3.2 Frontend: Column Filtering"),
  code("// Filter vendor column from baseColumns when smc-only:"),
  code("let effectiveColumns = catalogService.getColumnsConfig();"),
  code("if (tenantCatalogueMode === 'smc-only') {"),
  code("  effectiveColumns = effectiveColumns.filter(c => c.header !== 'Vendor');"),
  code("}"),
  h2("3.4 Backend Changes"),
  p("No backend changes required. The mode resolution already works correctly via resolveTenantCatalogueMode()."),
);

// 4. ISSUE 2 - CATEGORY FIELD
sections.push(
  h1("4. Issue 2: Category Field Display Fix"),
  h2("4.1 Problem"),
  p("Category field shows 'General' for all products instead of the actual category from the API."),
  h2("4.2 Root Cause"),
  p("In catalog.repository.ts line 548:"),
  code("category: this.normalizeOptionalString(payload.category) || 'General'"),
  p("When products are imported without an explicit category, they default to 'General'. Additionally, the frontend maps category from catalog.name (line 299 of CataloguePage.tsx), not from offering.category."),
  h2("4.3 Solution"),
  h3("4.3.1 Backend: catalog.repository.ts"),
  code("// Change the fallback chain to use catalogId-derived name:"),
  code("category: this.normalizeOptionalString(payload.category)"),
  code("  || catalogId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')"),
  code("  || 'Uncategorized'"),
  h3("4.3.2 Frontend: CataloguePage.tsx"),
  code("// Line 299 — use offering's own category field:"),
  code("category: offering.category || catalog.name || 'Uncategorized',"),
  p("This ensures the actual category stored per-offering is displayed, falling back to catalog name."),
  h2("4.4 Migration"),
  p("Run a one-time migration script to update existing offerings that have category='General' to derive from their catalogId:"),
  code("db.catalogue_offerings.updateMany("),
  code("  { category: 'General' },"),
  code("  [{ $set: { category: { $replaceAll: { input: '$catalogId', find: '-', replacement: ' ' } } } }]"),
  code(")"),
);

// 5. ISSUE 3 - CATALOG MAPPING LOGIC
sections.push(
  h1("5. Issue 3: Catalog Mapping Logic"),
  h2("5.1 Business Rules"),
  makeTable(["Condition","Display Behavior"],[
    ["Catalog NOT mapped to any vendor","Display as SMC product (no vendor info)"],
    ["Catalog IS mapped to a vendor","Display mapped vendor's name and details"],
    ["offering.isVendorProduct === false","SMC product — hide vendor column value"],
    ["offering.isVendorProduct === true","Show vendor name from vendorId join"],
  ]),
  h2("5.2 Current Implementation (Working)"),
  p("CataloguePage.tsx line 297 already handles this:"),
  code("vendorName: offering.vendor?.name || 'SMC Catalogue'"),
  p("The backend catalog.repository.ts joins vendor data via vendorMap (line 263-268)."),
  h2("5.3 Enhancement"),
  p("Add explicit vendorId null-check for clarity:"),
  code("vendorName: offering.vendorId && offering.vendor?.name"),
  code("  ? offering.vendor.name"),
  code("  : 'SMC Catalogue',"),
  code("isVendorProduct: !!offering.vendorId || (offering.isVendorProduct ?? false),"),
);

// 6. ISSUE 4 - CURRENCY HANDLING
sections.push(
  h1("6. Issue 4: Currency Handling Based on Vendor Financial Details"),
  h2("6.1 Business Rule"),
  p("Each vendor's financial.currencyAccepted[] determines which currencies they operate in. Product prices must display in the vendor's accepted currency."),
  h2("6.2 Data Source"),
  p("VendorEntity (vendor.repository.ts line 67-77):"),
  code("financial: {"),
  code("  paymentTerms: string;"),
  code("  currencyAccepted: string[];  // e.g., ['INR', 'USD']"),
  code("  creditLimit?: number;"),
  code("  bankDetails: { bankName, accountNumber, swiftCode, iban }"),
  code("}"),
  h2("6.3 Frontend Changes"),
  h3("6.3.1 Extend CatalogProduct Interface (catalogData.tsx)"),
  code("export interface CatalogProduct {"),
  code("  // ... existing fields"),
  code("  vendorCurrency?: string;     // Primary currency from vendor financial"),
  code("  displayPrice?: string;       // Formatted price with currency symbol"),
  code("}"),
  h3("6.3.2 CataloguePage.tsx — Product Mapping"),
  code("// Build vendor currency map from tenantVendors"),
  code("const vendorCurrencyMap = new Map("),
  code("  tenantVendors.map(v => ["),
  code("    v.basicInfo.companyName,"),
  code("    v.financial?.currencyAccepted?.[0] || 'USD'"),
  code("  ])"),
  code(");"),
  code(""),
  code("// In offerings mapping:"),
  code("vendorCurrency: offering.vendorId"),
  code("  ? vendorCurrencyMap.get(offering.vendor?.name) || 'USD'"),
  code("  : tenant.currency || 'USD',"),
  code("displayPrice: formatCurrency(offering.price, resolvedCurrency),"),
  h3("6.3.3 Currency Formatter Utility"),
  code("// utils/currencyFormatter.ts"),
  code("const CURRENCY_SYMBOLS: Record<string, string> = {"),
  code("  USD: '$', INR: '₹', EUR: '€', GBP: '£', SGD: 'S$', AED: 'د.إ'"),
  code("};"),
  code(""),
  code("export function formatCurrency(amount: number, currency: string): string {"),
  code("  const symbol = CURRENCY_SYMBOLS[currency] || currency;"),
  code("  return `${symbol}${amount.toLocaleString(undefined, {"),
  code("    minimumFractionDigits: 2, maximumFractionDigits: 2"),
  code("  })}`;"),
  code("}"),
  h2("6.4 Backend Enhancement"),
  p("The backend already returns vendor.financial.currencyAccepted in the vendor entity. No new endpoints needed. The frontend resolves currency at display time."),
  h2("6.5 Multi-Region Pricing Example"),
  makeTable(["Product","Vendor","Region","Currency","Price"],[
    ["Maggi Noodles","India Foods Pvt","Mumbai, India","INR","₹10.00"],
    ["Maggi Noodles","SG Food Supplies","Singapore","SGD","S$2.00"],
    ["Maggi Noodles","Gulf Provisions","Dubai, UAE","AED","د.إ3.50"],
  ]),
  p("Resolution: Each vendor's financial.currencyAccepted[0] determines the display currency. Same product, different vendor = different currency display."),
);

// 7. ISSUE 5 - CONTRACT DETAILS
sections.push(
  h1("7. Issue 5: Vendor Tenant Contract Details Visibility"),
  h2("7.1 Problem"),
  p("When creating or viewing a vendor tenant, the 'Contract Details' option should NOT appear. Vendor tenants are not contracted entities."),
  h2("7.2 Solution"),
  h3("7.2.1 Frontend — Tenant Details / Create Tenant Form"),
  code("// When rendering tenant detail tabs or form sections:"),
  code("const showContractDetails = tenantCatalogueMode !== 'vendor-only';"),
  code(""),
  code("// Conditionally render:"),
  code("{showContractDetails && <ContractDetailsSection />}"),
  h3("7.2.2 Backend — VendorService.createVendor()"),
  p("In vendor.service.ts line 211-221, the contract field is already optional:"),
  code("contract: payload.contract ? { ... } : undefined"),
  p("No backend changes needed — just ensure the frontend does not send or display contract fields for vendor-type tenants."),
  h2("7.3 Vendor Type Detection"),
  code("// Reuse existing mode resolver:"),
  code("const mode = resolveTenantCatalogueMode(tenant.userTypeSelection);"),
  code("const isVendorOnlyTenant = mode === 'vendor-only';"),
  code("// Hide contract section when isVendorOnlyTenant === true"),
);

// 8. ISSUE 6 - CATALOG LIST UPDATES
sections.push(
  h1("8. Issue 6: Catalog List View Updates"),
  h2("8.1 Changes Summary"),
  makeTable(["Component","Change Required"],[
    ["CataloguePage.tsx","Apply vendor column/filter hiding for smc-only mode"],
    ["CataloguePage.tsx","Use offering.category instead of catalog.name for category column"],
    ["catalogData.tsx","Add vendorCurrency and displayPrice to CatalogProduct interface"],
    ["SuperadminCataloguePage.tsx","Already uses sourceCatalogName for category — no change needed"],
    ["Export Excel function","Include currency column in exported data"],
  ]),
  h2("8.2 Column Visibility Matrix"),
  makeTable(["Column","vendor-only","smc-only","both"],[
    ["Product Name","✓","✓","✓"],
    ["Category","✓","✓","✓"],
    ["Packing Info","✓","✓","✓"],
    ["Reference Code","✓","✓","✓"],
    ["Vendor","✓","✗","✓"],
    ["Currency/Price","✓ (vendor currency)","✓ (tenant currency)","✓ (resolved)"],
    ["Status","✓","✓","✓"],
    ["Published On","✓","✓","✓"],
    ["Action","✓","✓","✓"],
  ]),
);

// 9. ISSUE 7 - FINANCIAL DETAILS
sections.push(
  h1("9. Issue 7: Financial Details & Currency Acceptance"),
  h2("9.1 Vendor Financial Schema"),
  code("// VendorFinancial (vendor.repository.ts):"),
  code("interface VendorFinancial {"),
  code("  paymentTerms: string;"),
  code("  currencyAccepted: string[];  // ['INR','USD']"),
  code("  creditLimit?: number;"),
  code("  bankDetails: {"),
  code("    bankName: string;"),
  code("    accountNumber: string;"),
  code("    swiftCode?: string;"),
  code("    iban?: string;"),
  code("  };"),
  code("}"),
  h2("9.2 How Currency Is Resolved"),
  bullet("Vendor products: Use vendor.financial.currencyAccepted[0] as primary display currency"),
  bullet("SMC products: Use tenant.currency (from tenant configuration)"),
  bullet("Both mode: Resolve per-product based on isVendorProduct flag"),
  h2("9.3 Backend API Enhancement"),
  p("Add a new field to the offerings response to include resolved currency:"),
  code("// In catalog.repository.ts findAllByTenant():"),
  code("const offerings = stripMongoIds(offeringsRows).map(offering => ({"),
  code("  ...offering,"),
  code("  vendor: offering.vendorId ? vendorMap.get(offering.vendorId) : null,"),
  code("  resolvedCurrency: offering.vendorId"),
  code("    ? vendorMap.get(offering.vendorId)?.financial?.currencyAccepted?.[0] || 'USD'"),
  code("    : null  // Frontend will use tenant currency for SMC"),
  code("}));"),
);

// 10. ISSUE 8 - MULTI-PORT
sections.push(
  h1("10. Issue 8: Future Multi-Port Currency Exchange Architecture"),
  h2("10.1 Scenario Description"),
  p("When a captain/company selects a port (e.g., Mumbai), the catalog should:"),
  bullet("Display products available at that port"),
  bullet("Show prices in that port's vendor's accepted currency"),
  bullet("Display how many vendors operate at that port"),
  bullet("Apply currency exchange if captain's company currency ≠ vendor currency"),
  h2("10.2 Architecture Design"),
  h3("10.2.1 New Backend Service: CurrencyExchangeService"),
  code("@Injectable()"),
  code("export class CurrencyExchangeService {"),
  code("  private rates: Map<string, number> = new Map();"),
  code("  private lastFetched: Date | null = null;"),
  code(""),
  code("  async getRate(from: string, to: string): Promise<number> {"),
  code("    if (from === to) return 1.0;"),
  code("    await this.ensureRatesLoaded();"),
  code("    const key = `${from}_${to}`;"),
  code("    return this.rates.get(key) || 1.0;"),
  code("  }"),
  code(""),
  code("  async convert(amount: number, from: string, to: string): Promise<{"),
  code("    convertedAmount: number; rate: number; from: string; to: string;"),
  code("  }> {"),
  code("    const rate = await this.getRate(from, to);"),
  code("    return { convertedAmount: amount * rate, rate, from, to };"),
  code("  }"),
  code(""),
  code("  private async ensureRatesLoaded() {"),
  code("    const ONE_HOUR = 3600000;"),
  code("    if (this.lastFetched && Date.now() - this.lastFetched.getTime() < ONE_HOUR) return;"),
  code("    // Fetch from exchange rate API or internal rate table"),
  code("    // Store in this.rates map"),
  code("    this.lastFetched = new Date();"),
  code("  }"),
  code("}"),
  h3("10.2.2 New API Endpoint"),
  code("// catalog.controller.ts"),
  code("@Get('port-catalog')"),
  code("async getPortCatalog("),
  code("  @Query('tenantId') tenantId: string,"),
  code("  @Query('portName') portName: string,"),
  code("  @Query('companyCurrency') companyCurrency: string,"),
  code(") {"),
  code("  // 1. Find all offerings where ports[] includes portName"),
  code("  // 2. Find all vendors serving that port"),
  code("  // 3. For each offering, resolve vendor currency"),
  code("  // 4. If companyCurrency !== vendorCurrency, apply exchange rate"),
  code("  // 5. Return enriched response"),
  code("}"),
  h3("10.2.3 Response Shape"),
  code("interface PortCatalogResponse {"),
  code("  port: string;"),
  code("  vendorCount: number;"),
  code("  companyCurrency: string;"),
  code("  products: Array<{"),
  code("    id: string;"),
  code("    name: string;"),
  code("    vendorName: string;"),
  code("    vendorCurrency: string;"),
  code("    originalPrice: number;"),
  code("    convertedPrice: number;"),
  code("    exchangeRate: number;"),
  code("    needsConversion: boolean;"),
  code("  }>;"),
  code("}"),
  h3("10.2.4 Currency Exchange Decision Flow"),
  code("CAPTAIN selects PORT (e.g., Mumbai)"),
  code("  → System finds vendors serving Mumbai"),
  code("  → For each vendor: get financial.currencyAccepted[0]"),
  code("  → Compare with captain's company currency (tenant.currency)"),
  code("  → IF same currency: display price as-is, needsConversion = false"),
  code("  → IF different: fetch exchange rate, compute convertedPrice"),
  code("  → Display: originalPrice (vendorCurrency) + convertedPrice (companyCurrency)"),
  h2("10.3 Frontend Port Selection Component"),
  code("// PortCatalogView.tsx"),
  code("const [selectedPort, setSelectedPort] = useState('');"),
  code("const [portCatalog, setPortCatalog] = useState<PortCatalogResponse|null>(null);"),
  code(""),
  code("useEffect(() => {"),
  code("  if (!selectedPort) return;"),
  code("  catalogService.getPortCatalog(tenantId, selectedPort, companyCurrency)"),
  code("    .then(setPortCatalog);"),
  code("}, [selectedPort]);"),
  code(""),
  code("// Display columns: Product | Vendor | Price (Original) | Price (Your Currency) | Rate"),
  h2("10.4 Database Schema for Exchange Rates"),
  code("// Collection: exchange_rates (superadmin database)"),
  code("{"),
  code("  id: string,"),
  code("  fromCurrency: string,    // 'INR'"),
  code("  toCurrency: string,      // 'USD'"),
  code("  rate: number,            // 0.012"),
  code("  source: string,          // 'manual' | 'api'"),
  code("  effectiveDate: Date,"),
  code("  expiresAt: Date,"),
  code("  updatedAt: Date"),
  code("}"),
  h2("10.5 Edge Cases"),
  makeTable(["Scenario","Handling"],[
    ["Exchange rate not available","Use last known rate, flag as 'stale'"],
    ["Vendor accepts multiple currencies","Use first matching with company currency, else first in list"],
    ["Port has no vendors","Show empty state with message"],
    ["Company currency = vendor currency","Skip conversion, display single price"],
    ["Rate is stale (>24h old)","Show warning badge next to converted price"],
  ]),
);

// 11. ERROR HANDLING
sections.push(
  h1("11. Edge Cases & Error Handling"),
  makeTable(["Scenario","Frontend Handling","Backend Handling"],[
    ["Vendor deleted after product created","Show 'SMC Catalogue' as fallback","vendorMap returns null, offering.vendor = null"],
    ["No offerings in tenant","Show empty state","Return empty catalogs array"],
    ["Currency field missing on vendor","Default to 'USD'","financial.currencyAccepted defaults to []"],
    ["Tenant has no userTypeSelection","Mode = 'unknown', show all","Provision all collection types"],
    ["Category is null/empty on offering","Display 'Uncategorized'","Fallback chain in repository"],
    ["Vendor-only tenant tries to add SMC product","isVendorProduct locked to true","Validation in createOffering"],
    ["SMC tenant tries to access vendor filter","Filter hidden by mode check","No filter param sent"],
  ]),
);

// 12. IMPLEMENTATION CHECKLIST
sections.push(
  h1("12. Implementation Checklist"),
  h2("12.1 Frontend Tasks"),
  makeTable(["#","Task","File","Priority"],[
    ["F1","Hide vendor filter/column for smc-only","CataloguePage.tsx","HIGH"],
    ["F2","Use offering.category for display","CataloguePage.tsx L299","HIGH"],
    ["F3","Add vendorCurrency to CatalogProduct","catalogData.tsx","MEDIUM"],
    ["F4","Create formatCurrency utility","utils/currencyFormatter.ts","MEDIUM"],
    ["F5","Display prices with vendor currency","CataloguePage.tsx","MEDIUM"],
    ["F6","Hide contract section for vendor tenant","TenantDetails component","HIGH"],
    ["F7","Add currency column to Excel export","CataloguePage.tsx export","LOW"],
    ["F8","Design PortCatalogView component","New component","FUTURE"],
  ]),
  h2("12.2 Backend Tasks"),
  makeTable(["#","Task","File","Priority"],[
    ["B1","Fix category fallback from 'General'","catalog.repository.ts L548","HIGH"],
    ["B2","Add resolvedCurrency to offerings response","catalog.repository.ts","MEDIUM"],
    ["B3","Create CurrencyExchangeService","New service","FUTURE"],
    ["B4","Add port-catalog endpoint","catalog.controller.ts","FUTURE"],
    ["B5","Create exchange_rates collection","Migration script","FUTURE"],
    ["B6","Category migration for existing data","Migration script","MEDIUM"],
  ]),
);

// BUILD DOCUMENT
const doc = new Document({
  title: "Catalog Business Logic Implementation Specification",
  description: "Comprehensive technical spec for AtoZ Marine catalog system",
  creator: "AtoZ Technical Architecture Team",
  sections: [{ children: sections }],
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "d:\\atozFullcode\\b2b2\\docx\\CATALOG_BUSINESS_LOGIC_SPEC.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("DOCX generated: " + outPath);
});
