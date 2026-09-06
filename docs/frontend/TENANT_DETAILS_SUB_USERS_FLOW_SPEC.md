# Tenant Details to Sub Users Flow Specification

## Status
- Drafted before implementation as requested.
- Scope of this task: Sub Users flow first, with strict tenant relation and full CRUD.

## Problem Statement
When a user opens a tenant from Tenant Details, the right-side quick links must always stay bound to that same tenant context. For this phase, Sub Users must be fully tenant-scoped and must not leak data from other tenants or the logged-in session default tenant.

## Tenant Relation Rule (Mandatory)
- Source of truth for context is selected tenantId from Tenant Details.
- Quick link navigation from Tenant Details must pass selected tenantId forward.
- Sub Users page must always read and write using this tenantId.
- Session tenantId fallback is allowed only when tenantId is not provided.

## Tenant-Named Collection Rule (Mandatory)
Tenant-scoped resources must be stored in tenant-specific MongoDB collections instead of shared global collections.

- Collection prefix is derived once when tenant is created using tenant name slug.
- Prefix is persisted on tenant document as `collectionPrefix` and remains stable.
- Collection name format: `<collectionPrefix>_<resourceType>`.
- Example for tenant "MSC":
  - `msc_users`
  - `msc_sub_users`
  - `msc_catalogs`
  - `msc_vessels`
  - `msc_vendors`
  - `msc_offerings`
  - `msc_requisition_orders`
  - `msc_activity_logs`
  - `msc_dashboard_stats`
  - `msc_user_resource_permissions`

Notes:
- This is a physical data partitioning strategy for tenant visibility and operational clarity.
- Tenant rename does not auto-rename collections. Existing `collectionPrefix` stays immutable.

## Sub Users Domain Model (Phase 1)
Sub Users in this flow are tenant users in `users` collection (not legacy `subUsers` collection) with roleType:
- `tenantadmin`
- `tenantadmin_subusers`

Most records are expected to be `tenantadmin_subusers`.

## Required Fields (Create/Update)
- firstName (required on create)
- lastName (required on create)
- email (required on create)
- password (required on create, optional on update)
- roleType (required on create; only tenant role options)
- department (required on create)
- vesselAssigned (required on create, boolean)
- permissions.pages (required on create, tenant-safe pages only)
- permissions.fields (required on create, tenant-safe components only)

## Department Options
- Management
- Procurement
- Purchasing
- Operations
- Technical
- Engineering
- Marine (Deck)
- Stores / Inventory
- Catering / Galley
- Finance
- Compliance / QA
- IT / Systems
- Vendor (Internal)
- Captain

## Allowed Role Options in Sub Users UI
- Tenant Admin (`tenantadmin`)
- Tenant Sub Admin (`tenantadmin_subusers`)

Disallowed in Sub Users UI:
- superadmin
- admin
- adminusers

## Permission Rules for Sub Users UI
Do not show superadmin/admin-only pages or component fields.

### Allowed Page Access Options (tenant-safe)
- dashboard
- tenantSubUsers
- tenantVessels
- tenantOrders
- tenantCatalogue
- addProduct
- tenantDocuments
- tenantActivityLogs
- cart

### Disallowed Page Access Options
- users
- platformUsers
- security
- offers
- finance
- actions
- integrations
- userDetails
- tenantDetails
- addAccount
- addTenant
- help

### Allowed Component Field Groups (tenant-safe)
- subUsersTable
- vesselTable
- orderTable
- catalogueTable
- dashboard

## List Page Requirements
- Show only tenant-scoped users with roleType in (`tenantadmin`, `tenantadmin_subusers`) for selected tenantId.
- Status column value: always `Active`.
- Replace "Last Login" with "Created At".
- Show department and vessel assignment values from backend fields.

## Backend Contract (Phase 1)
- Add `department?: string` and `vesselAssigned?: boolean` to user DTO/input/entity handling.
- Add tenant-scoped list endpoint for Sub Users page:
  - `GET /tenants/:tenantId/users/tenant-users`
  - Returns users filtered to roleType in (`tenantadmin`, `tenantadmin_subusers`) and tenantId match.
- Reuse existing tenant user CRUD endpoints:
  - `POST /tenants/:tenantId/users`
  - `PATCH /tenants/:tenantId/users/:id`
  - `DELETE /tenants/:tenantId/users/:id`
- Tenant access guard behavior:
  - Platform `ADMIN` claim can access tenant-scoped routes across tenants.
  - Non-admin roles remain tenant-bound and must match route tenantId.

## Tenant Lifecycle Contract (Collections)
- On `POST /tenants`:
  - Create and persist `collectionPrefix`.
  - Pre-create tenant-scoped collections for key resource types.
  - Create required indexes (for id, tenantId, createdAt and role filters where relevant).
- On tenant-scoped CRUD routes:
  - Resolve collection names from `tenantId -> collectionPrefix`.
  - Read/write only in those tenant-scoped collections.
- On `DELETE /tenants/:id`:
  - Delete tenant metadata from `tenants`.
  - Drop all tenant-scoped collections mapped by its `collectionPrefix`.

## Tenant Details Quick Link Binding
- Sub Users quick link from Tenant Details must navigate with selected tenantId context.
- App tab state should include tenantId (example: `tenantSubUsers_<tenantId>`), and Sub Users page should consume it.

## Non-Goals (This Phase)
- Legacy nested sub-user endpoints under `/users/:userId/sub-users` are not removed in this phase.
- Vessel assignment to concrete vessel IDs is not in this phase; only boolean `vesselAssigned` is required.

## CRUD Test Plan
1. Open tenant from Tenants list and enter Tenant Details.
2. Click quick link Sub Users and verify selected tenant context is preserved.
3. Create tenant sub user with:
   - roleType `tenantadmin_subusers`
   - department set
   - vesselAssigned true/false
   - tenant-safe page/component permissions
4. Verify list shows new row with:
   - role
   - department
   - vessel assignment
   - createdAt (not last login)
   - status active
5. Update created user and verify persistence.
6. Delete created user and verify removal.
7. API verification: record appears only in selected tenant scope.

## Performance and Maintainability Notes
- Keep filtering by indexed fields where possible (`tenantId`, `roleType`, `createdAt`).
- Centralize tenant-role constants and tenant-safe permission constants to avoid drift between UI and backend.
- Keep Sub Users page logic strictly on tenant-scoped endpoint to avoid mixed data-path bugs.
