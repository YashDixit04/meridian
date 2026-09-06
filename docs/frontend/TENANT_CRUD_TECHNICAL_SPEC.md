# SuperAdmin - Tenant CRUD Technical Specification

## Overview
This document outlines the technical specification for the SuperAdmin Tenant CRUD system within the multi-tenant SaaS architecture. It covers the frontend flow, state transitions, validation rules, Prisma schema updates, and backend API structure.

## PHASE 1: FRONTEND FLOW DOCUMENTATION
The frontend tenant functionality consists of three main areas:
1. **Tenant List Page**: Displays all tenants.
2. **Create Tenant Form**: A multi-section form to onboard a new tenant.
3. **Tenant Detail Page (Read/Edit)**: Displays existing tenant details with inline section editing.

### Overall Mechanics
- **Creation Flow**: The top-level action is a "Create Tenant" button. Submitting it validates all sections and sends a single POST request to create the tenant.
- **Editing Flow**: A separate "Save Changes" button appears per section when viewing an existing tenant. It sends a PATCH request updating only the fields in that specific section.

---

### SECTION 1: Tenant Information
Captures the primary identity and contact details of the tenant.
- **Fields**: Name, Slug/Domain, Address, Contact Email, Contact Phone.
- **Country & Currency Logic**: 
  - Country selection drives currency. For now, it auto-sets to USD or a generic default.
  - *Note: Country → Currency precise mapping logic will be implemented/refined later. The current mapping is simple.*
- **Timezone**: Auto-populated or selectable based on the chosen Country.
- **Validation**: Name is required. Domain must be unique (backend). Email must be a valid email format.

### SECTION 2: Subscription
Captures the pricing plan details.
- **Fields**: 
  - Plan Name (Text input, must exist in a predefined list of valid plans)
  - Plan Type (Dropdown: Free, Starter, Pro, Enterprise)
- **Validation**: Plan name + type must be a recognized valid combination.
- **Auto-Renew Toggle**: Rendered in the UI with a label. 
  - *Note: Auto-Renew functionality is STATIC FOR NOW and its backend logic will be implemented later.*

### SECTION 3: Plan Features (Modules)
Manages which modules and limits apply to the tenant.
- **Modules (Enable/Disable Toggles)**: 
  - Requisition Management, Catalogue Services, Sub Users Creation, Vessels Additions, Catalogue Management, Meals Creation, Victualling Management Services, Active Logs Mapping, Orders Management, Invoice Management.
  - *Note: All module toggles in this section are STATIC FOR NOW. Rendered as disabled state with a "Coming Soon/Static" label.*
- **Quota Fields**:
  - Max User Creations (Numeric or "Unlimited")
  - Max Sub Users (Numeric or "Unlimited")
  - Max Storage (GB) (Numeric or "Unlimited")
  - API Requests (Dropdown: Free tier limit / Unlimited)
- **Validation**: Quotas must be parsable as numbers unless selected as "Unlimited".

### SECTION 4: Users
Manages user configurations and the primary tenant admin.
- **Removed Fields**: 
  - *Reasoning for Removal*: "Total Users", "Active Users", "Inactive Users", and "Pending Invitation" are removed because they are derived metrics best handled dynamically on a dashboard rather than stored statically on the Tenant model. "Has Vendor Users" is removed because it's redundant with the new "User Type Selection".
- **Fields**:
  - Tenant Admin Details (Name, Email, Role)
  - User Type Selection (Radio/Dropdown: SMC Users only, Vendor Users only, Both SMC and Vendor Users).
- **Conditional Fields**:
  - Base Users Count (Visible for all types based on plan).
  - Total Vendor Users Count (Visible *only* if User Type is "Vendor Users only" or "Both SMC and Vendor Users").
- **Documentation Note**: Vendor users are distinct from tenant users. A tenant may have SMC users, vendor users, or both; this determines the user pools explicitly available for that tenant.

### SECTION 5: Catalogue & Products
Manages how the tenant handles catalogs and product distribution.
- **Fields**:
  - Company-Specific Catalogue Count (Numeric input/display).
  - Product Availability / Port Mapping (Dropdown: Global vs Specific Ports).
- **Conditional Fields**:
  - Specific Ports Selection (Multi-select or text input to specify which ports). Visible *only* if Product Availability is "Specific Ports".

### SECTION 6: Billing, Usage Analytics, Integrations, Security
- All four sections are visible but non-functional placeholders.
- Rendered with a clear "Coming Soon / Static" label. 
- *Note: Implementation of these sections is deferred.*

---

## PHASE 3: TENANT LIST PAGE
- **Flow**: After saving a tenant, the user is redirected to or refreshes this page.
- **UI**: A table or card list showing key details (Name, Plan, Status, Created Date).
- **Interaction**: Row/Card clicks navigate to the Tenant Detail Page.

## PHASE 4: TENANT DETAIL PAGE
- **Route**: `/superadmin/tenants/:tenantId`
- **Data Loading**: Fetches full tenant records from the backend. 
- **Display Mode**: Renders all creation form sections but in read/edit mode. A right-side Quick Links panel acts as a sticky sidebar.
- **Quick Links Panel**: 
  - *Note: Quick link functionality is STATIC FOR NOW and will be implemented later. It is a visual placeholder only.*

---

## Backend & Database Specifications

### Tenant-Specific Mongo Collection Architecture (Required)
All tenant-scoped data must use physical tenant-specific MongoDB collections.

- Shared collection is only `tenants` metadata.
- Each tenant receives a persisted `collectionPrefix` generated from tenant name at creation.
- Naming rule: `<collectionPrefix>_<resourceType>`.
- Example for tenant "MSC":
  - `msc_users`, `msc_sub_users`, `msc_catalogs`, `msc_vessels`, `msc_vendors`, `msc_offerings`, `msc_requisition_orders`, `msc_activity_logs`, `msc_dashboard_stats`, `msc_user_resource_permissions`.

Lifecycle rules:
- On tenant creation, backend pre-creates required collections and indexes.
- On tenant-scoped requests, repositories resolve collection names using `tenantId`.
- On tenant deletion, backend drops all collections for that tenant prefix.
- On tenant rename, collection prefix remains unchanged to avoid expensive collection rename operations.

### Prisma Schema Updates (`schema.prisma`)
The `Tenant` model will be expanded with the following fields:
- `address` (String?)
- `currency` (String?)
- `collectionPrefix` (String?)
- `maxUserCreations` (Int?)
- `maxSubUsers` (Int?)
- `maxStorageGB` (Int?)
- `apiRequestsTier` (String?)
- `userTypeSelection` (String?)
- `baseUsersCount` (Int?)
- `totalVendorUsersCount` (Int?)
- `companySpecificCatalogueCount` (Int?)
- `productAvailability` (String?)
- `specificPorts` (String? - to store JSON string of selected ports)

### Backend API Design (NestJS)
- **POST `/tenants` (Create)**: Accepts the full payload mapping all active fields in the sections. Validates domain uniqueness.
- **PATCH `/tenants/:id` (Update)**: Accepts partial payloads, mapping to the specific section being saved independently.
- **GET `/tenants/:id` (Details)**: Retrieves the full tenant record.
- **Collection Resolver (internal service)**: Resolves tenant collection names from `tenantId` and `collectionPrefix`.

### Request Payloads
Section 1 payload for update: `{ name, domain, address, contactEmail, contactPhone, country, timezone, currency }`
Section 2 payload for update: `{ planName, planType }`
Section 3 payload for update: `{ maxUserCreations, maxSubUsers, maxStorageGB, apiRequestsTier }`
Section 4 payload for update: `{ userTypeSelection, baseUsersCount, totalVendorUsersCount }`
Section 5 payload for update: `{ companySpecificCatalogueCount, productAvailability, specificPorts }`

---

## FUTURE PHASE: Bootstrapping Tenant Users (Admin and Sub-Users)

Based on the newly architected Tenant details logic, the user identities flow must strictly follow the tenant quotas and types.

### 1. Creating the Initial Tenant Admin
When a Super Admin creates a Tenant, the Super Admin must also immediately provision the Tenant’s root administrator to grant them access to their designated portal. 
* **Trigger:** After effectively saving the Tenant (`POST /tenants`), the backend will (or SuperAdmin UI will guide to) trigger an invite for the `tenantAdminEmail` supplied in Section 4.
* **Mechanism:** A `User` record is generated attached strictly to the newly minted `tenantId`. The user identity adopts the `RoleId` mapping to "Tenant Admin". This root admin bypasses quota checks for `maxSubUsers` as they are the primary owner.

### 2. Creating Tenant Sub-Users
Once the Tenant Admin logs in utilizing their credentials, they have the right to onboard "Sub-Users".
* **Quota Checks Mechanism:** 
    * The backend `POST /users` (Tenant-scoped) must query the parent `Tenant` via `tenantId`.
    * It checks `count(SubUsers WHERE tenantId = X)` and validates it against `tenant.maxSubUsers` and `tenant.maxUserCreations`. If the limit is hit, the request terminates with a `403 Quota Exceeded` exception.
* **User Type Enforcement:**
    * When onboarding a new sub-user, the Tenant Admin must define if they are an internally focused SMC User or an external Vendor User.
    * The backend cross-references the Tenant's `userTypeSelection`. 
        * If `SMC Users only` is selected for the parent tenant, attempting to create a Vendor User structurally fails dynamically.
        * If Vendor users are permitted, the count must similarly validate against `tenant.totalVendorUsersCount`.
