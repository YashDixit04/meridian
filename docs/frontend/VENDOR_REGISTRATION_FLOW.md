# Vendor Registration Flow (Public + Vendor-Only Tenant)

## Objective
This document defines and verifies the vendor onboarding flow where a vendor can register without sign-in, optionally link to an existing tenant by tenant contact email, or auto-create a tenant workspace when no SMC linkage exists.

## Scope Covered
- Public vendor registration without login.
- Reference dropdown on no-login vendor registration form.
- Optional tenant contact email linking.
- Auto tenant workspace creation when no tenant contact email is provided.
- Vendor-only tenant behavior (single Vendor KYC profile).
- Tenant quick links for vendor-only tenant.
- Vendor KYC documents surfaced under Documents.
- Activity logs availability.
- Backend and frontend build/test verification.

## Architecture Summary
### Backend
- Public endpoint: `POST /public/vendors/register`.
- Public DTO includes:
  - `vendor` (full KYC payload)
  - `tenantContactEmail` (optional)
  - `applicantEmail` (optional)
  - `sendForApproval` (optional)
  - `tenantUserTypeSelection` (optional: SMC Users only, Vendor Users only, Both SMC and Vendor Users)
- Auto-provision logic:
  - If `tenantContactEmail` is absent, backend creates a tenant workspace and provisions tenant-scoped collections.
  - If `tenantContactEmail` exists, backend links the vendor to matching tenant by tenant contact email.
- Vendor-only enforcement:
  - If tenant is vendor-only, backend allows only one Vendor KYC profile.
- Documents endpoint:
  - `GET /tenants/:tenantId/activity-logs/vendor-kyc-documents`
  - Returns all uploaded Vendor KYC documents for tenant documents listing.

### Frontend
- No-login route: `/vendor-register`.
- Public form includes:
  - Full vendor KYC form.
  - Reference Source dropdown.
  - Tenant User Type dropdown.
  - Optional Tenant Contact Email.
  - Optional Applicant Email.
- Tenant details quick links for vendor-only tenants:
  - Sub Users
  - Vendor KYC
  - Catalogue
  - Documents
  - Activity Logs
- Vendor-only UX behavior:
  - Vendor list auto-opens Vendor KYC details when exactly one vendor exists.
  - Add Vendor action is hidden/blocked when one Vendor KYC already exists.

## Functional Flow
1. Vendor opens `/vendor-register` without logging in.
2. Vendor fills KYC form and selects optional Reference Source.
3. Vendor may provide tenant contact email:
   - If provided and matched: vendor is linked to that tenant.
   - If not provided: new tenant workspace is auto-created.
4. Vendor submits `Send for Approval`.
5. Backend creates vendor and returns:
   - `vendorId`
   - `tenantId`
   - `tenantCreated` / `tenantLinkedByEmail`
   - approval metadata
6. For vendor-only tenant:
   - Only one vendor KYC record is permitted.
7. Post-login (tenant context):
   - Quick links show vendor-only set.
   - Documents page shows Vendor KYC uploaded documents.
   - Activity Logs page continues to work normally.

## Catalogue Rules By Tenant Type
1. Vendor Users only tenant:
- Open only vendor-specific catalogue items for that tenant's vendor(s).
- If no vendor-mapped offerings exist, catalogue appears empty until mapped offerings are added.
- Product creation rule: products are treated as vendor products and must be mapped to a tenant vendor with price.

2. Both SMC and Vendor Users tenant:
- Show tenant catalogue (tenant-scoped catalogs and offerings).
- While adding product, a mandatory decision is shown: is this vendor product or not.
- If vendor product is Yes: show tenant vendors only and map offering to selected vendor.
- If vendor product is No: product is treated as SMC product and added under tenant catalogue without vendor mapping.

3. SMC Users only tenant:
- Show tenant catalogue (tenant-scoped catalogs and offerings).
- Product creation rule: SMC products are added port-wise for that tenant.

4. Page-load resiliency:
- Catalogue page first tries tenant-scoped APIs.
- If tenant APIs fail, page falls back to default dataset instead of hard-failing the screen.

## Product Listing Required Fields (Create Product)
The minimum required fields for catalogue creation flow are:
- Product ID
- Product ID Type
- Category
- Product Title
- Price (Regular price)
- Tenant type specific mapping:
  - Vendor-only: Vendor mapping required.
  - SMC-only: Port selection required.
  - Both: Vendor mapping required when vendor product = Yes; port selection required when vendor product = No.

## API Failure Handling For Invalid Tenant Context
- If tenant context is stale/invalid, tenant-scoped endpoints can return 404 (for details/vendors/catalogs).
- Frontend resolves tenant context from route first, then session fallback.
- Tenant details are validated before loading other tenant-scoped catalogue endpoints to avoid cascading 404 requests.

## Vendor-Only Department Options
Sub-user departments for this flow are:
- Sales
- RFQ Desk
- Operations
- Logistics
- Procurement
- Warehouse
- Finance
- Compliance
- Quality Assurance
- Customer Support
- Management
- IT

## Verification Results (Executed)
### Build Verification
- Backend build: PASS (`npm.cmd run build`)
- Frontend build: PASS (`npm.cmd run build`)

### Runtime API Verification
1. Public registration without tenant contact email:
- Result: `201 Created`
- `tenantCreated: true`
- `tenantLinkedByEmail: false`
- `vendorId: 4f2d1574-8865-442c-92f5-c516aae92ba5`
- `tenantId: 3ecf6ff0-2420-46aa-999d-99435240504e`

2. Atlas verification for created tenant workspace:
- Tenant collection prefix: `public_vendor_244164_workspace`
- Provisioned tenant-scoped collections found: 9
  - users, vendors, vessels, catalogs, offerings, requisition_orders, activity_logs, dashboard_stats, user_resource_permissions

Important platform note:
- The platform uses one MongoDB database (`b2b2`) with tenant-scoped prefixed collections.
- So this flow creates a new tenant workspace (collection set), not a separate MongoDB database name.

3. Single Vendor KYC enforcement in vendor-only tenant:
- Second vendor registration linked to same tenant returned `409 Conflict`.
- Error: `Vendor-only tenants can have only one Vendor KYC profile.`

4. Documents endpoint verification:
- `GET /tenants/3ecf6ff0-2420-46aa-999d-99435240504e/activity-logs/vendor-kyc-documents`
- Returned Vendor KYC document records successfully (tradeLicense, taxCertificate, incorporationCertificate, bankProof, addressProof, insuranceCertificate).

## Reusability and Optimization Notes
- Reusable service layer:
  - Frontend tenant microservice facade now includes dedicated documents service.
- Reusable quick-link resolver:
  - Quick links are generated by tenant user type using one central function.
- Backend validation and constraints:
  - Vendor-only single-KYC enforcement centralized in vendor service.
- Public onboarding remains decoupled:
  - Uses existing tenant and vendor services instead of duplicate persistence logic.

## Key Files
### Backend
- `b2-backend/src/modules/vendor-onboarding/controller/vendor-onboarding.controller.ts`
- `b2-backend/src/modules/vendor-onboarding/dto/public-vendor-registration.dto.ts`
- `b2-backend/src/modules/vendor-onboarding/service/vendor-onboarding.service.ts`
- `b2-backend/src/modules/vendor/service/vendor.service.ts`
- `b2-backend/src/modules/vendor/repository/vendor.repository.ts`
- `b2-backend/src/modules/vendor/dto/vendor.dto.ts`
- `b2-backend/src/modules/tenant/controller/activity-log.controller.ts`
- `b2-backend/src/modules/tenant/service/activity-log.service.ts`
- `b2-backend/src/modules/tenant/repository/activity-log.repository.ts`
- `b2-backend/scripts/verify-tenant-collections.cjs`

### Frontend
- `b2b2/pages/Auth/VendorRegistrationPage.tsx`
- `b2b2/services/publicVendorRegistrationService.ts`
- `b2b2/pages/Details/vendorFormMapper.ts`
- `b2b2/components/common/DynamicRender.tsx`
- `b2b2/data/vendorDetailsData.ts`
- `b2b2/data/tenantDetailsData.tsx`
- `b2b2/pages/Details/TenantDetailsViewPage.tsx`
- `b2b2/pages/TableList/VendorsListViewPage.tsx`
- `b2b2/pages/documentsInfo/DocumentsPage.tsx`
- `b2b2/pages/Catalogue/list/CataloguePage.tsx`
- `b2b2/components/users/userFormConfig.ts`
- `b2b2/App.tsx`

## Status
Flow implemented and verified for:
- Public no-login registration
- Auto tenant workspace creation
- Vendor-only single KYC policy
- Vendor-only quick links
- Vendor KYC documents visibility in Documents
- Activity logs continuity
