# MongoDB Atlas Integration Guide (B2 Backend)

## 1) What to choose in your Atlas screen

Based on your NestJS backend project, choose:

- **Drivers** (under **Connect to your application**)

Do not choose Compass/Shell/Atlas SQL for backend runtime connection.

## 2) Atlas setup steps

1. Open Atlas and create/select your cluster.
2. Click **Connect** on the cluster.
3. Select **Drivers**.
4. Driver: **Node.js**.
5. Version: **6.7 or later** (as shown in your screen).
6. Create a database user if prompted.
7. Add your current IP in **Network Access** (or allow broader access temporarily for testing).
8. Copy the connection string. It looks like:

```text
mongodb+srv://aksyashdixit_db_user:<db_password>@b2b2.worru9u.mongodb.net/?appName=B2B2
```

## 3) Backend environment variables

In your backend `.env`, add:

```env
MONGODB_URI="mongodb+srv://aksyashdixit_db_user:<db_password>@b2b2.worru9u.mongodb.net/?appName=B2B2"
MONGODB_DB_NAME="b2b2"
```

You said you will set the password manually later, so keep `<db_password>` for now and replace it when ready.

If your password contains special characters, URL-encode it before pasting.

Keep your existing `DATABASE_URL` for Prisma during transition.

## 4) What is implemented in this backend

This workspace now includes MongoDB Atlas integration with a dual-write pattern:

- Global MongoDB service: `src/core/mongodb/mongodb.service.ts`
- Global MongoDB module: `src/core/mongodb/mongodb.module.ts`
- App module wiring for MongoDB initialization
- Tenant repository sync to Atlas on create/update/delete
- Admin endpoint to push dynamic fields to MongoDB and auto-create them

## 5) Auto-create field behavior (your requirement)

MongoDB creates new fields automatically when `$set` is used with new keys.

This is implemented via upsert/update logic in the MongoDB service:

- `upsertOne(..., { upsert: true })`
- `updateFields(..., { upsert: true })`

So when you send new keys through the dynamic endpoint below, those keys are created in Atlas immediately.

## 6) Dynamic field sync endpoint (Admin)

Endpoint:

- `PATCH /tenants/:id/mongo-fields`

Request body:

```json
{
  "fields": {
    "customFlag": true,
    "newBillingCode": "ATLAS-001",
    "preferences": {
      "theme": "ocean",
      "language": "en"
    }
  }
}
```

Result:

- MongoDB Atlas document in `tenants` collection for that tenant is created/updated.
- New keys are added automatically.

## 7) Important note about full migration

Your codebase is currently Prisma-first across many modules. This update gives you a safe first step:

- Existing APIs continue to work.
- Tenant changes are mirrored to MongoDB Atlas.
- You can incrementally migrate other repositories from Prisma to MongoDB.

## 8) Verify quickly

1. Set `MONGODB_URI` and `MONGODB_DB_NAME`.
2. Run backend: `npm run start:dev`.
3. Update a tenant using existing API.
4. Check Atlas `tenants` collection for synced document.
5. Call `PATCH /tenants/:id/mongo-fields` with new keys.
6. Confirm new fields are visible in Atlas.

## 9) Migration status (latest run)

Migration from PostgreSQL to Atlas was executed successfully.

- Date: 2026-04-17
- Script: `scripts/migrate-postgres-to-atlas.ts`
- Run command: `npm run migrate:pg-to-mongo`
- Export dump: `migration-dumps/postgres-export-2026-04-17T16-36-37-240Z`

Final Atlas collection counts after migration:

- `tenants`: 5
- `users`: 3
- `vendors`: 1
- `catalogs`: 1
- `offerings`: 3
- `subUsers`: 0
- `vessels`: 0
- `requisitionOrders`: 0
- `dashboardStats`: 0
- `activityLogs`: 0
- `userResourcePermissions`: 0

## 10) Production readiness verdict

Short answer: **Not fully production-ready yet** for a complete PostgreSQL to MongoDB cutover.

Current state:

- Atlas connectivity is working and migration can run successfully.
- Tenant dual-write and dynamic field sync are implemented.
- The backend still remains Prisma-first for most modules.

Blocking items before full production cutover:

1. **Consistency strategy**
  - Current dual-write is not atomic across PostgreSQL and MongoDB.
  - If one write succeeds and the other fails, data can diverge.
  - Add outbox/event-driven sync with retries and dead-letter handling.

2. **Scope completion**
  - Only Tenant sync path is implemented for continuous write mirroring.
  - Remaining modules (users, vendors, catalog, requisition, etc.) need either dual-write or full repository migration.

3. **Test quality gate**
  - Unit test suite currently has failing tests.
  - CI should block deploys when tests fail.

4. **Operational hardening**
  - Add structured logging for Mongo sync failures.
  - Add metrics/alerts (sync success rate, lag, failure counts).
  - Add runbooks for replaying failed sync operations.

5. **Security and secrets**
  - Ensure Atlas credentials are managed via secure secret manager.
  - Rotate database credentials after setup/testing.
  - Keep Atlas IP allowlist maintained for deployment environments.

6. **Performance and data model checks**
  - Create required Mongo indexes for query paths used by APIs.
  - Validate document schema constraints and required fields.
  - Load test before switching production traffic.

## 11) Practical recommendation

- **Ready for staging / controlled pilot**: Yes.
- **Ready for full production cutover**: No (until the blocking items above are completed).

Recommended rollout path:

1. Keep PostgreSQL as system of record temporarily.
2. Continue dual-write plus periodic reconciliation jobs.
3. Fix failing tests and enforce CI quality gates.
4. Complete module-by-module migration and observability.
5. Cut over read paths gradually, then write paths.

## 12) Current run checklist (backend + frontend)

Use these commands in separate terminals:

1. Backend database engine (Prisma local engine)

```bash
cd b2-backend
npx prisma dev
```

2. Backend API (NestJS)

```bash
cd b2-backend
npm run start:dev
```

3. Frontend (Vite)

```bash
cd b2b2
npm run dev
```

Current ports:

- Backend API: `http://localhost:3001` (see `src/main.ts`)
- Frontend UI: `http://localhost:3000` (see `b2b2/vite.config.ts`)
- Frontend API proxy: `/api/* -> http://localhost:3001/*`

Quick health checks:

1. Open backend docs at `http://localhost:3001/docs`.
2. Open frontend at `http://localhost:3000`.
3. Login from frontend and confirm `/api/auth/login` succeeds.

## 13) Is frontend connected to MongoDB Atlas?

Short answer: **partially, through backend APIs**.

- Frontend is correctly connected to backend APIs via Vite proxy and `apiClient`.
- Backend is correctly connected to MongoDB Atlas (`MONGODB_URI`, `MONGODB_DB_NAME`, successful ping).
- However, several frontend screens still use mock data or fallback-to-mock logic.

What is already backend-driven:

- Auth (`/auth/login`, `/auth/me`)
- Users page (`getPlatformUsers` path)
- Tenant list fetch (`GET /tenants`), but with mock fallback when API fails/empty

What still uses mock/fallback logic and is not fully backend-driven:

1. Catalogue page currently loads mock products/vendors/modal config from `catalogService` compatibility methods.
2. Requisition Orders page uses static requisition mock dataset.
3. Activity Logs page initializes from mock dataset and keeps fallback behavior.
4. Vessels page initializes from mock dataset and keeps fallback behavior.
5. Tenants page initializes from mock dataset and falls back to mock on API issues.

Meaning:

- Your frontend is integrated with backend infrastructure.
- But not all frontend modules are fully migrated to live backend/Atlas data paths yet.

## 14) tsconfig warning found during checks

File: `b2-backend/tsconfig.json`

Observed warning:

- `baseUrl` is marked deprecated for future TypeScript 7 behavior.

Current impact:

- Build still works now.

Recommended action:

1. Keep current config for now if no immediate TS upgrade is planned.
2. Before TypeScript 7 migration, replace `baseUrl` usage with explicit path mappings strategy.
3. If needed temporarily, add:

```json
"ignoreDeprecations": "6.0"
```

to silence the warning while preparing a clean migration.

---

## 15) Architecture Fixes Applied — May 2026

> **Context:** A full audit against the multi-tenant SaaS spec revealed 4 critical issues. All fixed in one pass.

---

### Fix 1 — Central Database Renamed `core_db` ✅

**Spec requirement:** The shared central database must be called `core_db`.

**What was wrong:** `.env` had `MONGODB_DB_NAME="b2b2"`.

**Changed in `.env`:**
```env
MONGODB_DB_NAME="core_db"
```

> ⚠️ **Atlas action required:** Rename or migrate the `b2b2` database to `core_db` in Atlas. The `tenants` collection and all superadmin/shared collections live here.

---

### Fix 2 — Tenant Database Naming: `tenant_<tenantId>` ✅

**Spec requirement:** Tenant DB name must be `tenant_<tenantId>` (UUID-based), NOT the human name.

**What was wrong:** `createTenant()` called `createDatabaseName(tenantName)` which used the raw name string (e.g. `"Acme Corp"`) as the database name.

**Files changed:**
- `src/modules/tenant/service/tenant.service.ts` — derives `databaseName = tenant_${createdTenant.id}` after record creation.
- `src/modules/tenant/repository/tenant.repository.ts` — added `setDatabaseName(id, dbName)` helper.

**New flow:**
```
POST /tenants
  → record created (UUID auto-generated)
  → databaseName stamped as "tenant_<uuid>"
  → collections provisioned in that DB
  → cache invalidated
```

> ⚠️ **Existing tenants:** Legacy tenant DBs still work (read from `databaseName` field in their record). Only new tenants follow the new format. Run a migration script to rename existing DBs if needed.

---

### Fix 3 — Redis-Backed Shared Tenant Cache ✅

**Spec requirement:** Redis caching for tenant metadata so horizontal scaling works.

**What was wrong:** `TenantCollectionService` used an in-process `Map<>` — resets on restart, not shared across pods.

**File added:** `src/core/mongodb/tenant-cache.service.ts` — `TenantCacheService`
- Uses `ioredis` (already a dependency).
- Key format: `tenant_meta:<tenantId>`, TTL: `TENANT_CACHE_TTL_SECONDS` (default 300s).
- Graceful degradation to local Map when Redis is unavailable.
- `invalidate(tenantId)` called on tenant create/delete.

**File changed:** `src/core/mongodb/mongodb.module.ts` — added `TenantCacheService` to providers/exports.

**New env vars:**
```env
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
TENANT_CACHE_TTL_SECONDS="300"
# For cloud: REDIS_URL="redis://:password@host:6379"
```

---

### Fix 4 — Tenant Resolver Middleware (`x-tenant-id` Header) ✅

**Spec requirement:** Resolve tenant per request from `x-tenant-id` header OR JWT payload OR subdomain.

**What was wrong:** Only JWT scope validation existed. No middleware read the `x-tenant-id` header or attached `TenantContext` to `req`.

**File added:** `src/core/middleware/tenant-resolver.middleware.ts` — `TenantResolverMiddleware`
- Priority: `x-tenant-id` header → JWT `tenantId`/`tenant_id`
- Lookup: Redis cache → `core_db.tenants` fallback
- Attaches `req.tenantContext = { tenantId, dbName, name, status }`
- Non-blocking — public/superadmin routes unaffected.

**File changed:** `src/app.module.ts` — `AppModule` now implements `NestModule`, applies middleware globally via `consumer.apply(TenantResolverMiddleware).forRoutes('*')`.

**Frontend usage:** Include `x-tenant-id: <tenantId>` header in all tenant-scoped API requests.

---

### Summary

| Issue | Severity | Status |
|---|---|---|
| Central DB named `b2b2` instead of `core_db` | 🔴 Critical | ✅ Fixed |
| Tenant DB uses name string instead of `tenant_<id>` | 🔴 Critical | ✅ Fixed |
| No shared Redis tenant cache | 🟡 High | ✅ Fixed |
| No `x-tenant-id` header resolution | 🟡 High | ✅ Fixed |
| `tenant_<uuid>` exceeded Atlas 38-byte DB name limit | 🔴 Critical | ✅ Fixed |

---

### Hotfix — Atlas 38-byte Database Name Limit (May 2026)

**Error observed:** `Database name tenant_4a94704e-6559-478d-b7c9-d0a8dce0c099 is too long. Max database name length is 38 bytes.`

**Root cause:**
- Full UUID = 36 chars (with hyphens)
- `tenant_` prefix = 7 chars
- Total = **43 chars** — exceeds Atlas's 38-byte hard limit

**Fix applied in `tenant.service.ts`:**
```typescript
// Strip hyphens (32 hex chars), take first 31 → 7 + 31 = 38 bytes exactly ✅
const compactId = createdTenant.id.replace(/-/g, '').slice(0, 31);
const specDbName = `tenant_${compactId}`;
```

**Example:**
- UUID: `4a94704e-6559-478d-b7c9-d0a8dce0c099`
- compactId: `4a94704e6559478db7c9d0a8dce0c09` (31 chars)
- dbName: `tenant_4a94704e6559478db7c9d0a8dce0c09` (38 chars ✅)

**Also fixed:** `validateDatabaseName()` in `tenant-collection.service.ts` now enforces the 38-byte Atlas limit (was incorrectly set to 64 bytes, the generic MongoDB limit).

**Self-healing migration:** `ensureTenantStorageTarget()` in `tenant-collection.service.ts` now auto-compacts ANY existing tenant whose `databaseName` exceeds 38 bytes. On first access (login, getMe, any API call), it:
1. Detects the legacy long name (e.g., `tenant_9b136b4a-2da5-4d7c-8df5-bd45de56daf8`)
2. Compacts it (e.g., `tenant_9b136b4a2da54d7c8df5bd45de56daf`)
3. Persists the compacted name back to `core_db.tenants`
4. Caches the result — subsequent requests use the compact name directly

This means **no manual migration scripts are needed** — the system self-heals on first request.
