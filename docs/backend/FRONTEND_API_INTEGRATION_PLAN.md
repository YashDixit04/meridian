# Frontend-Backend API Integration Plan & Microservices Mapping

This document outlines the step-by-step plan to transition the frontend from static data rendering (via local JSON/config files) to dynamic, role-based backend API integration.

## Current State Analysis
1. **Frontend Routing:** Managed via `App.tsx` and `rbac.ts`. Access is enforced through `session.permissions`.
2. **Frontend Data:** Pages like `Dashboard` render using static hardcoded files (e.g., `import { REVENUE_TABLE_DATA } from '@/data/config/...'`).
3. **Backend Structure:** NestJS is logically divided into modular Microservices in `src/modules/` (`tenant`, `vessels`, `users`, `catalog`, `requisition`, etc.).

---

## 1. Step-by-Step Transition Plan

### **Phase 1: Dashboard API Service (First Implementation)**
*   **Backend (`src/modules/tenant` or a dedicated `dashboard` module):**
    *   Create `GET /api/v1/dashboard/stats`: Returns KPI metrics (revenue, active users, ships).
    *   Create `GET /api/v1/dashboard/revenue-chart`: Returns time-series chart data.
    *   *RBAC Enforcement*: Apply role filtering (e.g. `captain` does not get revenue metrics back).
*   **Frontend (`b2b2/pages/Dashboard.tsx`):**
    *   Remove static imports (`REVENUE_TABLE_DATA`).
    *   Implement React `useEffect` or SWR/React Query using `apiClient.get('/dashboard/stats')`.

### **Phase 2: Users & Tenants Directory API**
*   **Backend (`src/modules/users` & `src/modules/tenant`):**
    *   `GET /api/v1/users`: Fetches platform users.
    *   `GET /api/v1/tenants`: Fetches registered tenants.
    *   `GET /api/v1/tenant/sub-users`: Fetches sub-users restricted safely by the requesting user's `tenantId`.
*   **Frontend (`b2b2/pages/TableList/`):**
    *   Update `UsersListViewPage` and `tenantsListViewPage` to fetch data dynamically based on the current page route.

### **Phase 3: Vessels & Catalog (Domain Entities)**
*   **Backend (`src/modules/vessels` & `src/modules/catalog`):**
    *   `GET /api/v1/vessels`: Apply field-level filtering (stripping `capacity` if the user is a `captain`).
    *   `GET /api/v1/catalog`: Retrieve products/categories dynamically.
*   **Frontend Check:**
    *   When the URL changes to `/tenant/vessels`, the React component triggers `apiClient.get('/vessels')`.

### **Phase 4: Orders, Cart, & Action Mutation APIs**
*   **Backend (`src/modules/requisition`):**
    *   `POST /api/v1/orders/cart/add`
    *   `POST /api/v1/orders/checkout`
    *   `GET /api/v1/orders`

---

## 2. API Implementation Standard / Logic

Instead of a single monolithic data call, every page will have an initialization lifecycle hooked exactly to its Route/Tab.

*Example pattern for any frontend Page:*
```tsx
import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

const VesselsPage: React.FC = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // As per the page URL, the endpoint changes.
        apiClient.get('/vessels')
           .then(res => setData(res))
           .catch(err => console.error(err));
    }, []);

    return <Table data={data} />;
};
```

*Example Backend Implementation standard (`vessels.controller.ts`):*
```typescript
@Get()
@UseGuards(JwtClaimsGuard)
async getVessels(@Request() req: AuthenticatedRequest) {
    // 1. Backend identifies user role from Token
    // 2. Fetch data specifically scoped to their tenantId
    // 3. Strip unauthorized fields before responding
    return this.vesselsService.findAllForUser(req.user);
}
```

## Immediate Next Steps (Starting Execution)
To start fulfilling this plan immediately, I will initiate **Phase 1 (Dashboard)**. I will create the dedicated Dashboard analytics endpoint in the backend and link it to the frontend Dashboard view, removing the static `REVENUE_TABLE_DATA`.
