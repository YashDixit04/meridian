# Tenant & User Architecture Plan

This document clarifies the domain relationship between Platform (Superadmin) Users and Tenant-Specific Users alongside their respective resources.

## 1. User Domain Separation

### Platform Users (Superadmins / Admins / AdminUsers)
- **Role:** They manage the core platform.
- **Records:** Belongs logically to the generic "Platform", not a single client tenant.
- **Scope:** Has global capabilities (viewing multiple tenants, global dashboard stats, global user lists).
- **Frontend Pages:** `UsersListViewPage` (Platform Users table) should strictly list **only** users with roles belonging to `superadmin | admin | adminusers`.

### Tenant Users (TenantAdmins / SubUsers / Captains / Purchasers)
- **Role:** They act exclusively within the boundaries of a specific Tenant (e.g. "MSC Falcons").
- **Records:** They are treated as `SubUsers` strictly tied to a `tenantId`.
- **Scope:** Restricted viewing. They only see their specific tenant's catalogue, vessels, and internal users.
- **Frontend Pages:** They are not mixed loosely with Platform Users. They appear inside the `tenantDetails` page of that respective tenant, or on their own dashboard when logged in.

## 2. API Microservice Enhancements (To Do)

The Tenant Details backend needs to seamlessly aggregate data (Vessels, Catalogues, SubUsers) natively tied to the `tenantId`.

**Endpoints to Implementation:**
- `GET /api/v1/tenants/:id/details`
  - Fetches core tenant config.
- `GET /api/v1/tenants/:id/sub-users`
  - Returns `tenantadmin`, `purchaser`, `captain` strictly associated with this tenant.
- `GET /api/v1/tenants/:id/vessels`
  - Fetches the fleet vessels mapped specifically to the Tenant.
- `GET /api/v1/tenants/:id/catalogues`
  - Shows dynamically filtered catalogue offerings mapped or approved for this specific tenant.

## 3. Frontend Implementation Strategy (To Do)

### A. The Platform Users List
- Must filter out tenant users. The `GET /api/v1/users` call will be strictly refined to return superadmins & admins.

### B. The Tenant Details Page (`tenantDetails`)
- The current implementation likely uses mock data tabs.
- Must be updated to pull dynamically from `/api/v1/tenants/:tenantId/sub-users`, `/api/v1/tenants/:tenantId/vessels`, and `/api/v1/tenants/:tenantId/catalogues`.
- Ensure standard "Implicit Deny" rules apply if a user views a tenant details page without appropriate field access.
