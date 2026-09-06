# AGENTS.md — b2-backend (NestJS Backend)

> Package-level guide. Takes precedence over the root `AGENTS.md` for all files inside `b2-backend/`.

---

## 📦 Package Info

- **Name:** `temp-app` (NestJS 11)
- **Stack:** NestJS · TypeScript · MongoDB Atlas · Redis (BullMQ)
- **Dev server:** `npm run start:dev` → http://localhost:3001
- **Swagger UI:** http://localhost:3001/api (when dev server is running)

---

## 🗂️ Directory Structure

```
b2-backend/
├── src/
│   ├── main.ts                # Bootstrap, global pipes, Swagger setup
│   ├── app.module.ts          # Root module
│   ├── core/
│   │   ├── auth/              # JWT strategy, guards
│   │   ├── dto/               # Shared DTOs
│   │   ├── interceptors/      # Global interceptors
│   │   ├── middleware/        # x-tenant-id resolution middleware
│   │   ├── mongodb/           # MongoDB connection + TenantCollectionService
│   │   ├── transformers/      # TSX→JSON DTO converters
│   │   └── types/             # Shared enums & types (e.g. order-status.enum.ts)
│   ├── modules/               # Domain modules (DDD / Clean Architecture)
│   │   ├── catalog/
│   │   ├── dashboard/
│   │   ├── requisition/
│   │   ├── smc/
│   │   ├── tenant/
│   │   ├── users/
│   │   ├── vendor/
│   │   ├── vendor-onboarding/
│   │   └── vessels/
│   └── data/json/             # Pure JSON mock data bridges (no JSX)
├── scripts/                   # One-off scripts (bootstrap-superadmin.cjs, etc.)
├── migration-dumps/           # MongoDB migration scripts
├── docx/                      # Backend documentation
└── test/                      # E2E tests
```

---

## 🏗️ Architecture Rules

### Module pattern (all modules must follow this)
Every domain module has exactly **4 layers**:
1. `*.controller.ts` — HTTP request/response, calls Service, returns standardized JSON.
2. `*.service.ts` — Business logic only. No HTTP context here.
3. `*.repository.ts` — Data access layer (MongoDB). No business logic.
4. `*Transformer.ts` (in `core/transformers/`) — Maps DB/raw data → DTOs. No DB calls.

### Multi-Tenancy rules
- Central metadata DB: `core_db`
- Superadmin DB: `superadmin`
- Tenant DBs: `tenant_<tenantId>` (resolved via `TenantCollectionService`)
- Collection naming inside tenant DB: `<collectionPrefix>_<resourceType>`
  - `collectionPrefix` is set at tenant creation time and **never changes**.
  - Example for tenant `MSC`: `msc_users`, `msc_vessels`, `msc_catalogs`, `msc_requisition_orders`
- The `x-tenant-id` header is resolved in `core/middleware/` — always validate presence on tenant-scoped routes.
- **Never hard-code** a tenant's collection name. Always derive it from `TenantCollectionService`.

### Redis / BullMQ
- Redis backs both BullMQ queues and the shared tenant-metadata cache.
- Config: `REDIS_HOST` + `REDIS_PORT` from `.env`.
- Workers live in the relevant module's `*.processor.ts` files.

---

## 🚀 Dev Environment Tips

```bash
# Start in watch mode
npm run start:dev

# Run one-off scripts
npm run bootstrap:superadmin    # Seed superadmin account

# Lint & format
npm run lint        # ESLint --fix
npm run format      # Prettier write
```

- All secrets are in `.env` — **never commit this file**.
- `MONGODB_URI` connects directly to MongoDB Atlas.
- Swagger is mounted at `/api` in dev only — do not enable in production config.

---

## 🧪 Testing Instructions

```bash
npm test                  # Unit tests (Jest, from src/)
npm run test:watch        # Watch mode
npm run test:cov          # Coverage
npm run test:e2e          # E2E (from test/jest-e2e.json)
npm run lint              # ESLint check
```

- Write `.spec.ts` unit tests for every service and controller you add or modify.
- Run `npm run lint && npm test` before committing. All tests must pass green.
- To run a single test: `npx jest --testNamePattern "<test name>"`.
- Fix type errors: `npx tsc --noEmit` (uses `tsconfig.json`).
- Build check: `npm run build` (uses `tsconfig.build.json`).

---

## 🔐 Security Considerations

- Use `@UseGuards(JwtAuthGuard)` on all protected routes. Never skip guards in dev.
- The `x-tenant-id` header must be validated in middleware before reaching controllers.
- Passwords must be hashed with `bcrypt` — never store plain text.
- Do not log sensitive fields (`password`, `MONGODB_URI`, JWT secrets).
- BullMQ workers must not expose HTTP endpoints.

---

## 📚 Key Documentation

| Topic | File |
|---|---|
| Architecture overview | `docx/BACKEND_ARCHITECTURE.md` |
| Multi-tenancy flow | `docx/TENANT_DATABASE_MULTI_TENANCY_FLOW.md` |
| RBAC & Auth flow | `docx/RBAC_AUTH_FLOW.md` |
| MongoDB Atlas setup | `docx/MONGODB_ATLAS_INTEGRATION_GUIDE.md` |
| Frontend API integration | `docx/FRONTEND_API_INTEGRATION_PLAN.md` |
| Tenant details arch | `docx/TENANT_DETAILS_ARCHITECTURE.md` |

---

## 🔄 PR Instructions

- **Title format:** `[b2-backend] <Title>`
- Run `npm run lint && npm test` before committing.
- Update the relevant `docx/` file if you change architecture, module structure, or auth flow.
- Do not commit `.env`.
- Migration scripts go in `migration-dumps/` with a timestamped filename.
