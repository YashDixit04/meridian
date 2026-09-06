# Backend Architecture & Data Transformation Strategy

This document outlines the architecture, data processing strategy, and implemented module structures for the `b2-backend` project. The backend is designed strictly to adhere to Clean Architecture principles, ensuring it is modular, microservices-ready, and decoupled from the React frontend UI logic present in `b2b2/data/`.

## 📂 1. Data Analysis & Transformation Strategy

The frontend `b2b2/data/` folder contains `.tsx` files (e.g., `vesselsData.tsx`, `dashboard_stats.tsx`, `usersdata.tsx`) that mix **Pure Data** (e.g., arrays of objects) with **React/UI logic** (e.g., table columns containing JSX elements like `<span>` and icons). Node.js backends cannot process JSX/React components directly.

**Strategy:**
1. **Extraction:** The pure data arrays are extracted into clean `.json` representations within `src/data/json/`. This completely insulates the backend from React components.
2. **Transformation Layer (`src/core/transformers/`):** Dedicated transformer classes map frontend-specific mock shapes into production-ready backend DTOs (Data Transfer Objects).
    * *Example:* `SmcTransformer.ts` extracts numerical values from `dashboard_stats.tsx` and explicitly drops UI configurations like `icon: 'Crown'` or `color: 'danger'`.
    * *Example:* `VesselTransformer.ts` sanitizes property names matching API specs.

## 🏗️ 2. Clean Architecture Structure

The project structure enforces strict boundaries between HTTP delivery, business logic, and data access.

```text
b2-backend/
├── src/
│   ├── config/                 # Environment, DB, Logger configurations (Prepared)
│   ├── core/
│   │   ├── errors/             # Global error handling (Prepared)
│   │   ├── middlewares/        # Middlewares (Prepared)
│   │   └── transformers/       # ⚠️ TSX -> JSON DTO Converters (Implemented)
│   │       ├── SmcTransformer.ts
│   │       ├── UserTransformer.ts
│   │       └── VesselTransformer.ts
│   ├── data/
│   │   └── json/               # Extracted pure JSON mock tables
│   ├── modules/                # Domain-Driven Design Modules (Microservices-ready)
│   │   ├── catalog/            # (Folders prepared)
│   │   ├── requisition/        # (Folders prepared)
│   │   ├── smc/                # (Fully Implemented)
│   │   ├── tenant/             # (Folders prepared)
│   │   ├── users/              # (Fully Implemented)
│   │   ├── vendor/             # (Folders prepared)
│   │   └── vessels/            # (Fully Implemented)
```

## ⚙️ 3. Layered Implementation (per module)

Each module follows a strict 4-layer pattern:

1. **Controller (`*.controller.ts`):** Handles HTTP request/response, invokes the Service, utilizes the Transformer, and prepares standardized JSON API responses.
2. **Service (`*.service.ts`):** Contains pure business logic, isolated from HTTP context (e.g., checking roles, permissions).
3. **Repository (`*.repository.ts`):** The data access layer. It interfaces directly with MongoDB Atlas, using dynamic tenant collection resolution where appropriate.
4. **Transformer (`*Transformer.ts`):** Converts the repository data into strict DTOs.

## 🧠 4. Mapped Data to Modules & APIs

| Module | Analyzed Data Files (`b2b2/data/`) | Implemented Components | Planned APIs |
|---|---|---|---|
| **SMC** | `dashboard_stats.tsx`, `highlightsData.tsx` | Transformer, Service, Repo, Controller | `GET /smc/dashboard-stats`<br>`GET /smc/highlights` |
| **Vessels** | `vesselsData.tsx` | Transformer, Service, Repo, Controller | `GET /vessel/list`<br>`GET /vessel/:id` |
| **Users** | `usersdata.tsx`, `subUsersData.tsx`, `users.json` | Transformer, Service, Repo, Controller | `GET /users`<br>`GET /users/:id`<br>`GET /users/sub-users/:id` |
| **Vendors** | `offeringdata.tsx`, `catalogData.tsx` | Folders prepared | `GET /vendor/catalog`<br>`GET /vendor/top-products` |
| **Tenants** | `tenantdata.tsx`, `tenantDetailsData.tsx` | Folders prepared | `GET /tenant/details`<br>`GET /tenant/users` |
| **Requisition**| `requisitionOrdersData.tsx`, `config.json` | Folders prepared | `GET /requisition/orders` |

## 🔌 5. Microservices-Ready Design

The modular approach separates business domains completely. For instance, the `vessels` module never imports services directly from `users`. If module communication is needed, it should be done through defined core event systems or HTTP gateways. This ensures any module (e.g., `smc`) can easily be extracted into its own `.dockerignore` container as an independent service (e.g., `smc-service`, `vessel-service`).

## 🧱 6. Database Schema (MongoDB Atlas Collections)

The database schema defines the structure for the following MongoDB collections:

* **`User` (Users Data):** `id`, `fullName`, `email`, `department`, `role` (Admin/User), `status`, `lastActiveAt`.
* **`Vessel` (Vessel Data):** `id`, `name`, `imo`, `type`, `captain`, `location`, `status`, `lastInspectionDate`.
* **`DashboardLog` & `Highlights` (SMC Data):** `id`, `label`, `value`, `trendAmount`, `isUpwardTrend`.
* **`Order` & `LineItem` (Requisition Data):** `req_no`, `vessel_id`, `vendor_id`, `status`, `amount`, `submit_date`.
* **`Tenant` & `TenantBilling` (Tenants Data):** `id`, `name`, `plan`, `billing_cycle`.
* **`Vendor` & `CatalogItem` (Vendor/Catalog Data):** `id`, `company`, `offerings`, `rating`.

## ✅ Summary of Actions Taken

1. Evaluated `b2b2/data/` payload to construct pure Data APIs from complex frontend layouts.
2. Created standard backend module directories for `smc`, `vendor`, `users`, `tenant`, `catalog`, `requisition`, and `vessels`.
3. Scaffolded `src/data/json` mock data bridges avoiding JSX syntax errors in a Node backend.
4. Created scalable `src/core/transformers` layer applying strictly separated backend Data Transfer Objects.
5. Fully generated domain-driven code (Controller, Service, Repository, Transformer) mapped logically to actual data entities for:
   * **Vessels** Module (`src/modules/vessels`)
   * **Users** Module (`src/modules/users`)
   * **SMC** Module (`src/modules/smc`)

## 🧩 7. Tenant-Named Collection Architecture (2026 Update)

The backend now follows a tenant-specific physical partitioning strategy in MongoDB for tenant-scoped resources.

- Shared global metadata collection: `tenants`.
- Tenant data collections are named using: `<collectionPrefix>_<resourceType>`.
- `collectionPrefix` is generated from tenant name when tenant is created and persisted on tenant metadata.
- Prefix is immutable by default even if tenant name changes.

Example for tenant name `MSC`:
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

Lifecycle:
- On tenant creation: create required collections and indexes.
- On tenant-scoped requests: resolve collection names from `tenantId` through tenant metadata.
- On tenant deletion: drop all collections for that tenant prefix.

Benefits:
- Strong physical isolation by tenant.
- Easier data ops and diagnostics per tenant.
- Clear mapping for auditors and support teams to locate tenant data quickly.
