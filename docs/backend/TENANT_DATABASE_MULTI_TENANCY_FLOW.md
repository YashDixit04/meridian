# Tenant Database Multi-Tenancy Flow (MongoDB Atlas)

## Purpose

This document explains what happens in backend when a **new tenant is created** and how the system uses **tenant-specific MongoDB databases**.

Requirement covered:

- Each tenant must use its own MongoDB database.
- **Database name format: `tenant_<tenantId>`** (UUID-based — never the human-readable name).
- Required collections must be created inside that database.
- All API operations (GET, POST, PUT, PATCH, DELETE) must continue to work without API contract changes.

---

## Backend Components Connected to MongoDB Atlas

### Core Atlas connection

- `src/core/mongodb/mongodb.module.ts`
  - Registers Mongo services globally.
- `src/core/mongodb/mongodb.service.ts`
  - Connects to Atlas using:
    - `MONGODB_URI`
    - `MONGODB_DB_NAME` (base/default DB for shared collections like `tenants`)
  - Supports selecting a different DB at runtime via:
    - `collection(name, databaseName?)`
    - `ensureCollection(name, databaseName?)`

### Tenant storage routing

- `src/core/mongodb/tenant-collection.service.ts`
  - Resolves where a tenant's data should live.
  - If `databaseName` exists, tenant is treated as **database-scoped**.
  - For database-scoped tenants, collection names are plain names (no prefix), and DB is selected by `databaseName`.

### Tenant create API entry point

- `src/modules/tenant/controller/tenant.controller.ts`
  - `POST /tenants` -> `tenantService.createTenant(...)`

### Tenant create business logic

- `src/modules/tenant/service/tenant.service.ts`
  - Validates/sanitizes tenant payload.
  - Sets `databaseName` from tenant name.
  - Calls collection provisioning after tenant record is created.

---

## New Tenant Creation: What Happens

When `POST /tenants` is called:

1. Input is sanitized in `TenantService`.
2. Tenant name is validated and normalized (trimmed).
3. **`databaseName` is generated as `tenant_${tenantId}`** (UUID-based, spec-compliant).
   - Example:
     - tenant UUID: `550e8400-e29b-41d4-a716-446655440000`
     - database name: `tenant_550e8400-e29b-41d4-a716-446655440000`
4. `databaseName` is stamped onto the tenant record via `TenantRepository.setDatabaseName()`.
5. Tenant metadata is saved in the `tenants` collection in **`core_db`** (central DB).
5. `TenantCollectionService.ensureTenantCollections(...)` is executed.
6. Service resolves tenant as database-scoped and provisions collections in tenant DB.
7. If a legacy `collectionPrefix` exists for that tenant, it is removed for clean DB-scoped behavior.

Important:

- MongoDB Atlas creates DB/collections automatically on first write.
- Explicit `ensureCollection` + index creation is still executed for deterministic provisioning.

---

## Collections Created Per Tenant Database

Current backend collection specs provision the following tenant-scoped collections (subject to feature flags like vendor/sub-user provisioning options):

- `users`
- `sub_users`
- `user_resource_permissions`
- `vendors`
- `vessels`
- `tenant_catalogues`
- `catalogue_mappings`
- `requisition_orders`
- `activity_logs`
- `dashboard_stats`

### Why `tenant_catalogues` exists

- `tenant_catalogues` stores each tenant's top-level catalog containers (for example "Engine Spares", "Deck Stores", or any tenant-defined catalog buckets).
- Offerings/products are stored directly in `catalogue_mappings` and linked through `catalogId`.
- The backend uses `tenant_catalogues` in `CatalogRepository.catalogsCollection()` for:
  - create catalog
  - list catalogs
  - update/delete catalog
  - resolving source catalog names for superadmin views
- When a new tenant is created, this collection is provisioned proactively so catalog APIs work immediately without delayed first-write setup.
- Legacy `catalogue_offereing` and `tenant_catalogue` collections have been fully decommissioned and removed from all environments.
- If exact renamed collection names are required, that should be a separate schema-naming change.

---

## How Runtime CRUD Works Across Tenant Databases

No controller contract change is required. Existing repositories/services call:

- `tenantCollectionService.getCollection(tenantId, resourceType)`

This resolves:

- Correct tenant DB (`databaseName`),
- Correct collection name for resource type,
- and returns a Mongo collection handle.

Therefore:

- GET, POST, PUT, PATCH, DELETE continue to work with same APIs.
- Data isolation is at database level for new tenants.

---

## Database Selection Rules

- If tenant has `databaseName`: use that DB (database-scoped, preferred behavior).
- If tenant only has `collectionPrefix` (legacy case): use shared DB with prefixed collections.

This provides backward compatibility while new tenants follow database-level isolation.

---

## Environment Requirements

In backend `.env`:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/?appName=<app>"
MONGODB_DB_NAME="core_db"
SUPERADMIN_DB_NAME="superadmin"

# Redis (required for shared tenant cache across horizontal instances)
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
TENANT_CACHE_TTL_SECONDS="300"
# For cloud Redis: REDIS_URL="redis://:password@host:6379"
```

- `MONGODB_DB_NAME` = `core_db` — the central database for tenants registry, superadmin, global config.
- `SUPERADMIN_DB_NAME` — superadmin collections isolated here.
- Tenant-specific DBs selected dynamically at runtime using `databaseName = tenant_<tenantId>`.

---

## Quick Verification Steps

1. Start backend.
2. Create tenant using `POST /tenants`.
3. In Atlas, confirm DB `tenant_<uuid>` exists (UUID from the response `id`).
4. Confirm tenant collections exist inside `tenant_<uuid>` (for enabled resources).
5. Create/read/update/delete tenant-scoped data (users/vendors/catalogue/etc.) and verify writes go to `tenant_<uuid>`.
6. Confirm `tenants` collection exists in **`core_db`** (not `b2b2`).

---

## Global Superadmin Bootstrap (Main DB)

To provision an immutable global superadmin in a dedicated DB:

1. Set environment variables:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/?appName=<app>"
MONGODB_DB_NAME="b2b2"
SUPERADMIN_DB_NAME="superadmin"
SUPERADMIN_EMAIL="superadmin@company.com"
SUPERADMIN_PASSWORD="<strong-password>"
```

2. Run:

```bash
npm run bootstrap:superadmin
```

This script is idempotent and ensures:

- superadmin collections are migrated from `MONGODB_DB_NAME` to `SUPERADMIN_DB_NAME`
- `superadmin_users` has one global superadmin account (`role=ADMIN`, `roleType=superadmin`)
- `userResourcePermissions` contains full page-level access for this account
- `superadmin_catalogue` and related indexes exist in `SUPERADMIN_DB_NAME`
- Global superadmin deletion is blocked in backend repository logic

Note:

- `vendors` and `catalogue_mappings` are active tenant-scoped collections and are used by runtime catalogue/vendor flows, so they should not be deleted.

---

## Summary

For new tenants, backend now follows database-level multi-tenancy:

- `tenant_<tenantId>` → dedicated MongoDB database per tenant
- tenant collections provisioned in that DB on creation
- central `core_db` holds the `tenants` registry and global config
- CRUD flows continue unchanged at API level
- isolation and scalability are improved in a shared Atlas cluster

---

## May 2026 Changes

| Change | Detail |
|---|---|
| DB naming format | Was: tenant name string. Now: `tenant_<tenantId>` |
| Central DB name | Was: `b2b2`. Now: `core_db` |
| Tenant cache | Was: in-process Map. Now: Redis-backed `TenantCacheService` |
| Tenant resolution | Was: JWT only. Now: `x-tenant-id` header + JWT via `TenantResolverMiddleware` |
| Legacy Catalog Decommissioning | Decommissioned `catalogue_offereing` and `tenant_catalogue`; consolidated on unified `tenant_catalogues` and `catalogue_mappings` |
| Cross-Tenant Vendor Mapping | Added support for SMCs to see and select external vendors from other tenants. Controlled via `canViewOtherTenantVendors` tenant setting. Core DB tracks sync relationships in `contracted_vendor_mappings`. |
