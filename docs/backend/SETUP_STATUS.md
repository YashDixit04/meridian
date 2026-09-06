# Backend Project Setup Status

Last updated: 2026-04-05

## Runtime Verification Note (2026-04-19)

- Backend started successfully with `npm.cmd run start:dev` on port `3001`.
- Mongo connection confirmed at startup log: `Connected to MongoDB Atlas (b2b2)`.
- Provisioning verification run:
	- Command: `node scripts/verify-tenant-provisioning.cjs`
	- Result: `PASS`
	- Verified outcomes:
		- SMC-only tenant created with no vendors collection.
		- Vendor-enabled tenant created with vendors collection.
		- No unexpected `sub_users` collection auto-created during onboarding.
- CRUD verification run:
	- Command: `$env:TEST_BASE_URL='http://localhost:3001'; node scripts/verify-mongo-crud.cjs`
	- Result: `PASS`
	- Verified outcomes:
		- Tenant create, read, update, delete lifecycle works.
		- User create, read, update, delete lifecycle works under the created tenant.

Note: `scripts/verify-mongo-crud.cjs` was adjusted to run user CRUD against the tenant created in the same script run so it does not depend on legacy platform tenant hints from `/auth/me`.

### How to start a application 
 - npx prisma dev - for database
 - npx prisma studio - show the databse
 - npm run start:dev - for backend
 - npm run dev - for frontend

## Completed Work Summary

### 1. Data Analysis and Domain Modeling
- Parsed frontend mock data from `b2b2/data/` and extracted backend-ready entity structures.
- Normalized fields and removed UI-only data for persistence design.
- Finalized multi-tenant domain entities:
	- Tenant
	- User
	- SubUser
	- Vendor
	- Vessel
	- Catalog
	- Offering
	- RequisitionOrder
	- DashboardStat
	- ActivityLog

### 2. Prisma Schema and Multi-Tenancy
- Implemented complete schema in `prisma/schema.prisma`.
- Configured UUID primary keys and timestamps (`createdAt`, `updatedAt`).
- Added enums (`UserRole`, `OrderStatus`).
- Implemented relational mapping and tenant scoping on major entities via `tenantId`.
- Configured Prisma client generation output to `src/generated/prisma`.

### 3. Core Infrastructure
- Added global Prisma infrastructure:
	- `src/core/prisma/prisma.module.ts`
	- `src/core/prisma/prisma.service.ts`
- Wired Prisma module in root application module.

### 4. Feature Modules Implemented (Clean Architecture)
Implemented module structure with Controller -> Service -> Repository for:
- `tenant`
- `users` (including sub-user operations)
- `vendor`
- `vessels`
- `catalog`
- `requisition`
- `smc`

### 5. API Validation and Contract Hardening
- Added DTOs with `class-validator` across all feature modules.
- Enabled global `ValidationPipe` with:
	- `whitelist: true`
	- `forbidNonWhitelisted: true`
	- `transform: true`
- Added UUID param validation using `ParseUUIDPipe` in route parameters.

### 6. Security and Tenant Isolation
- Added authentication core:
	- `src/core/auth/auth.module.ts`
	- `src/core/auth/guard/jwt-claims.guard.ts`
	- `src/core/auth/guard/tenant-access.guard.ts`
- Applied guards to tenant-scoped controllers.
- Enforced route `tenantId` to match token tenant claim.

### 7. API Docs and App Bootstrapping
- Added Swagger/OpenAPI setup in `src/main.ts`.
- Exposed docs endpoint at `/docs`.
- Added bearer auth scheme in OpenAPI config.

### 8. Role-Based Authorization (RBAC) — ✅ COMPLETE
- Created `UserRole` guard (`src/core/auth/guard/roles.guard.ts`) and `@Roles()` decorator (`src/core/auth/decorators/roles.decorator.ts`).
- Protected high-risk endpoints (create/update/delete) on all modules using `UserRole.ADMIN`.
- Updated Swagger documentation with `@ApiBearerAuth` and `@ApiOperation` across all controllers.

### 9. Prisma 7.x Compatibility & Database Connectivity — ✅ COMPLETE
Problem resolved: Prisma v7.6.0 completely removed the `library` engine and replaced it with the new **query compiler** (`client` engine), which requires a driver adapter — not a raw connection string.

**Changes made:**
- Installed `@prisma/adapter-pg`, `pg`, and `@types/pg` packages.
- Rewired `src/core/prisma/prisma.service.ts` to use `PrismaPg` driver adapter with a `pg.Pool`.
- Updated `.env` `DATABASE_URL` from the incompatible `prisma+postgres://` HTTP proxy URL to the direct TCP `postgres://` connection string (decoded from the original API key's Base64 payload).
- Removed `engineType = "library"` from `schema.prisma` (no longer supported or needed).
- Fixed all stale imports from the old `../../generated/prisma` path in DTOs and repositories.
- Added `nest-cli.json` asset copy rules so the Prisma-generated JS files are included in the build output.

**Startup confirmed:** All 9 modules initialized, all routes mapped. Server runs successfully when `npx prisma dev` is active.

**How to run:**
1. Terminal 1 (keep running): `npx prisma dev` — starts the local Postgres engine on port 51214.
2. Terminal 2: `npm run start:dev` — boots the NestJS application on port 3000.
3. Visit `http://localhost:3000/docs` to explore the Swagger API docs.

### 10. Frontend Connection Analysis
- Analyzed `b2b2` frontend project — it is NOT yet connected to the backend.
- All data is currently served from local JSON mock files in `b2b2/data/`.
- Services (`authService.ts`, `catalogService.ts`) have `TODO` comments marking where API calls should replace the mock data.
- Integration bridge is planned for a future phase.

---

### N2: Standard Exception Mapping — ✅ COMPLETE
- Created `src/core/prisma/prisma-client-exception.filter.ts`.
- Maps Prisma error codes to HTTP responses: `P2002` → 409, `P2025` → 404, `P2003` → 400, `P2014`/`P2016` → 400, `P2021`/`P2022` → 500.
- Registered globally in `main.ts`.
- All error responses follow the standard envelope: `{ success, statusCode, timestamp, path, error, prismaCode }`.

### N3: Pagination, Filtering & Sorting — ✅ COMPLETE
- Created `src/core/dto/pagination-query.dto.ts` with `page`, `limit`, `search`, `sortBy`, `sortOrder` fields.
- Created `src/core/dto/pagination.helper.ts` with `paginate<T>()` function and `PaginatedResult<T>` type.
- Includes computed Prisma helpers: `query.skip`, `query.take`, `query.orderBy`.
- Applied to `TenantRepository.findAll()` and wired through `TenantService` and `TenantController` as a reference implementation.
- All other modules can adopt N3 pagination by injecting `@Query() query: PaginationQueryDto`.

### N4: Global Response Envelope Interceptor — ✅ COMPLETE
- Created `src/core/interceptors/transform.interceptor.ts`.
- Wraps every successful response in: `{ success, statusCode, timestamp, path, data }`.
- Registered globally via `app.useGlobalInterceptors()` in `main.ts`.

### N5: JWT Refresh Token Flow — ✅ COMPLETE
- Created `src/core/auth/auth.service.ts` with `login()` and `refresh()` methods.
  - `login()`: validates credentials, issues access + refresh token pair via bcrypt.
  - `refresh()`: verifies refresh token with separate `JWT_REFRESH_SECRET`, reissues token pair.
- Created `src/core/auth/auth.controller.ts` with `POST /auth/login` and `POST /auth/refresh`.
- Created `src/core/auth/dto/auth.dto.ts` with `LoginDto` and `RefreshTokenDto`.
- Updated `auth.module.ts` to register `AuthService`, `AuthController`, and `RolesGuard`.
- Supports dual JWT secrets: `JWT_SECRET` (access) and `JWT_REFRESH_SECRET` (refresh).
- Add to `.env`: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL=900`, `JWT_REFRESH_TTL=604800`.

---


### Step N6: Frontend-to-Backend Integration — ✅ COMPLETE

**Files created/updated:**
- `b2b2/lib/apiClient.ts` — Central HTTP client with automatic JWT injection, token refresh, envelope parsing.
- `b2b2/services/authService.ts` — Now calls `POST /auth/login` and `GET /auth/me` on the real backend.
- `b2b2/services/catalogService.ts` — Now calls real catalog/offering API endpoints with pagination.
- `b2b2/services/tenantService.ts` — New file calling real tenant API endpoints.
- `b2b2/vite.config.ts` — Added Vite proxy: `/api/*` → `http://localhost:3001`.
- `b2-backend/src/main.ts` — CORS enabled for `localhost:3000`; backend moved to port **3001**.
- `b2-backend/src/core/auth/auth.controller.ts` — Added `GET /auth/me` endpoint.
- `b2-backend/src/core/auth/auth.service.ts` — Added `getMe(userId)` service method.

**How it works:**
- Frontend (Vite, port 3000): All API calls use `/api/...` prefix.
- Vite proxy transparently forwards `/api/...` → `http://localhost:3001/...` (NestJS).
- No hardcoded URLs or CORS issues in the browser.

**How to run (3 terminals):**
1. `npx prisma dev` (in `b2-backend/`) — starts Postgres on port 51214.
2. `npm run start:dev` (in `b2-backend/`) — starts NestJS API on port 3001.
3. `npm run dev` (in `b2b2/`) — starts frontend on port 3000.

**Hotfixes Applied:**
- 🐛 Fixed database/backend 500 error caused by PrismaClient exception masking.
- 🐛 Fixed brittle UI permission logic: Captain/Purchaser requisition locks no longer depend on hardcoded usernames, but rather strictly on the `roleType === 'tenantadmin_subusers'` mapped dynamically from the database.
- 📝 Created explicit reference architecture documentation: `REQUISITION_FLOW.md` in the workspace root.

## Upcoming Roadmap

- N8: Redis caching strategy for dashboard and catalog reads.
- N9: Docker + CI pipeline + migration/deployment runbooks.

---

### N7: SuperAdmin Users Full CRUD + DB Hierarchy — ✅ COMPLETE (2026-04-16)

**Problem:** Username, password, roleType, and permissions were silently dropped on user creation. The `authService.signup()` only sent `email`, `firstName`, `lastName` to the backend. The backend `CreateUserDto` and repository `create()` method didn't accept those fields either.

**Root cause fix chain:**

#### Backend:
- `src/modules/users/dto/user.dto.ts` — Added `username`, `password`, `roleType`, `permissions` to `CreateUserDto` and `UpdateUserDto`
- `src/modules/users/repository/user.repository.ts` — `create()` now hashes password with bcrypt, saves `username`, `roleType`, `permissions`; `update()` rehashes password only if a new one is provided
- `src/modules/users/service/user.service.ts` — Added `getPlatformUsers()` method (admin + adminusers only)
- `src/modules/users/controller/user.controller.ts` — Added `GET platform-users` endpoint; superadmin excluded from all listings
- `src/modules/tenant/repository/tenant.repository.ts` — `findAll()` excludes `global.platform` from Tenants list

#### Database:
- Ran `restructure-db.ts` — moved `tenantadmin@msc.com`, `captain@msc.com`, `purchaser@msc.com` to new **MSC Shipping** tenant
- Created `SubUser` entries for captain + purchaser → linked to `tenantadmin01` as parent
- `global.platform` tenant holds only: `superadmin`, `admin01`, `adminuser01`
- Updated `prisma/seed.ts` to preserve this structure on future reseeds

#### Frontend:
- `services/authService.ts` — `signup()` now sends all fields: `username`, `password`, `roleType`, `permissions`, `role`
- `services/tenantService.ts` — `createTenantUser()`, `updateTenantUser()` extended; added `deleteTenantUser()`; added `getPlatformUsers()`
- `pages/TableList/UsersListViewPage.tsx` — Full rewrite with:
  - Calls `platform-users` endpoint (superadmin never appears)
  - Edit modal: first/last name, username, email, password (optional), role
  - Delete confirmation modal
  - "Add User" button → navigates to AddAccountPage
- `pages/Details/AddAccountPage.tsx` — Default role set to `admin`; navigates to `platformUsers` after creation

**Correct data hierarchy:**
```
Global Platform tenant  →  superadmin (hidden), admin01, adminuser01  ← SuperAdmin's Users page
MSC Shipping tenant     →  tenantadmin01                              ← SuperAdmin's Tenants page
  └─ SubUsers: captain01, purchaser01                                 ← TenantAdmin's SubUsers page
```
