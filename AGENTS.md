# AGENTS.md — AtoZ B2B SaaS Monorepo

> This file is the canonical guide for AI coding agents working on this project.
> Nested `AGENTS.md` files inside `b2b2/` and `b2-backend/` provide package-level detail and take precedence for changes inside their respective directories.

---

## 📦 Project Overview

This is a **multi-tenant B2B SaaS platform** for the maritime industry with two packages:

| Package | Path | Stack | Dev Port |
|---|---|---|---|
| **b2b2** | `./b2b2/` | React 18 + Vite + TypeScript | `3000` |
| **b2-backend** | `./b2-backend/` | NestJS 11 + MongoDB Atlas | `3001` |

The frontend proxies all `/api/*` requests to the backend (`http://localhost:3001`).

---

## 🏗️ Architecture at a Glance

- **Multi-Tenancy:** Each tenant gets a dedicated MongoDB database named `tenant_<tenantId>`. The central metadata database is `core_db`. Superadmin data lives in `superadmin` DB.
- **Tenant-Scoped Collections:** Named with prefix `<collectionPrefix>_<resourceType>` (e.g. `msc_users`, `msc_vessels`). The prefix is derived from tenant name at creation time and is immutable.
- **Auth:** JWT-based with `x-tenant-id` header for tenant context resolution.
- **Queue/Cache:** BullMQ + Redis for async jobs. Redis also backs the shared tenant-metadata cache (replaces per-instance in-memory cache).
- **RBAC:** Role-based access control covering Superadmin, Admin, Tenant Admin, Captain, Purchaser, and Vendor roles.

---

## 🚀 Dev Environment Tips

### Starting both services

```bash
# Terminal 1 — Frontend (http://localhost:3000)
cd b2b2
npm run dev

# Terminal 2 — Backend (http://localhost:3001)
cd b2-backend
npm run start:dev
```

### Key environment files
- **Frontend:** `b2b2/.env.local` — only the `GEMINI_API_KEY` is currently used.
- **Backend:** `b2-backend/.env` — contains `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`.
- **Never commit** `.env` or `.env.local` files.

### Path aliases
- Frontend uses `@/` resolving to `b2b2/` root (configured in `vite.config.ts`).
- Always use `@/` imports instead of relative `../../` paths in frontend code.

### Confirm module names
- Check `package.json` `name` field inside each package root before running filtered commands.
  - Frontend: `b2b-saas-design-system`
  - Backend: `temp-app`

---

## 🧪 Testing Instructions

### Frontend
```bash
cd b2b2
# Type-check only (no test runner configured yet)
npx tsc --noEmit
```

### Backend
```bash
cd b2-backend
npm test                        # All unit tests (Jest)
npm run test:e2e                # E2E suite
npm run test:cov                # Coverage report
npm run lint                    # ESLint + Prettier check
```

- Fix all TypeScript and lint errors before finishing a task.
- Add or update `.spec.ts` files for any changed service or controller logic.

---

## 🔐 Security Considerations

- **Never** expose raw MongoDB credentials in code. Use `process.env.MONGODB_URI`.
- The `x-tenant-id` header is resolved in middleware — always validate it is present on tenant-scoped routes.
- Guard routes with JWT auth guards; never skip guards for convenience in dev code.
- BullMQ workers should never have direct HTTP access — they consume jobs from Redis queues only.
- Do not store plain-text passwords. Backend uses `bcrypt` for hashing.

---

## 📁 Documentation

All design documents and specs live in the `docx/` subfolder of each package:
- `b2b2/docx/` — Frontend specs (auth flow, routing, catalogue, requisition, etc.)
- `b2-backend/docx/` — Backend specs (architecture, multi-tenancy, RBAC, MongoDB setup)

Always read the relevant `docx/` file before implementing a feature in that domain.

---

## 🔄 PR / Commit Instructions

- **Title format:** `[b2b2] <Title>` or `[b2-backend] <Title>` depending on which package changed.
- Run `npx tsc --noEmit` (frontend) or `npm run lint && npm test` (backend) before committing.
- Keep commits atomic — one logical change per commit.
- Update the relevant `docx/` markdown if the change affects documented architecture.

---

## ❓ FAQ for Agents

| Question | Answer |
|---|---|
| Which DB holds tenant metadata? | `core_db` in MongoDB Atlas |
| How do I find a tenant's collection name? | Resolve `collectionPrefix` from tenant metadata, then `{prefix}_{resourceType}` |
| Frontend API base URL? | All calls go through `/api/` which Vite proxies to `http://localhost:3001` |
| Where are shared TypeScript types? | `b2-backend/src/core/types/` |
| How is the Gemini API key injected in frontend? | `process.env.GEMINI_API_KEY` — set in `b2b2/.env.local` and injected by Vite `define` |
