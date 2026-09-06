# Role-Based Access Control (RBAC) & User Flow Documentation

This document defines the application's user flow, permission structure, and data access limits based on `usersManagement.json`. It is intended to be used as a source of truth for the backend to enforce authorization rules on API endpoints and apply field-level data filtering.

## 1. User Roles Overview

The system defines hierarchical roles, generally grouped into the **Platform/Admin level** and the **Tenant level**.

### Platform / Admin Level
| Username | Role Type | Description |
| --- | --- | --- |
| `superadmin` | `superadmin` | Full system access. Can manage the platform, finance, security, integrations, and all tenants. |
| `admin01` | `admin` | General administrator. Can manage users, tenants, and perform operational tasks but lacks access to core platform settings (security, finance, integrations). |
| `adminuser01` | `adminusers` | Restricted view-only admin. Has limited visibility into tenant and user details. |

### Tenant Level
| Username | Role Type | Description |
| --- | --- | --- |
| `tenantadmin01` | `tenantadmin` | High-level administrator strictly for their specific tenant. Manages sub-users, vessels, and oversees tenant operations (orders, catalogue, documents). |
| `captain01` | `tenantadmin_subusers` | Operational user (e.g., ship captain). Can view catalogue, view orders, and manage a cart, but with restricted visibility (e.g., hidden financial amounts). |
| `purchaser01` | `tenantadmin_subusers` | Operational/Financial user. Similar to Captain but has access to financial and transactional elements (sees order amounts, catalogue prices/stock, and can perform purchasing "actions"). |

---

## 2. Page-level Access Control

The backend must enforce that a given role can ONLY access APIs relevant to these pages.

| Page Name | `superadmin` | `admin` | `adminusers` | `tenantadmin` | `captain` | `purchaser` | Description / Action Capabilities |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **System Pages** | | | | | | | |
| `dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Landing page. Content differs heavily by role. |
| `security` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Manage system security policies. |
| `finance` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Manage platform finances. |
| `integrations`| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Manage system integrations/webhooks. |
| **Platform Management** | | | | | | | |
| `users` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | View/Manage system platform users. |
| `platformUsers`| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | View/Manage top-level administrators. |
| `userManagement`| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Administration portal for users. |
| `addAccount` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | Capability to add new admin or tenant accounts. |
| `offers` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Manage platform-wide offers/promotions. |
| `actions` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | Perform high-level systemic or purchasing actions. |
| `help` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Support & Help desk visibility. |
| **Tenant CRM & Details** | | | | | | | |
| `tenantDetails`| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Master view of standard tenants (Platform admins only). |
| `userDetails` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Ability to view self or allowed users' profiles. |
| **Tenant Internal Pages** | | | | | | | |
| `tenantSubUsers` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | Manage employees/users belonging to the tenant. |
| `tenantVessels`| ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | Manage or view tenant vessels fleet. |
| `tenantOrders` | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | View and manage orders placed by the tenant. |
| `tenantCatalogue`| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Browse available products. |
| `tenantDocuments`| ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | View internal tenant business documents. |
| `tenantActivityLogs`|✅ | ✅ | ❌ | ✅ | ✅ | ✅ | View audit logs for the tenant. |
| `cart` | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | Add items to cart for checkout. |
| `addProduct` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Create new products into the global catalogue. |

---

## 3. Field-Level Payload & Data Permissions

When returning data from the backend, the JSON payload MUST be filtered based on the requesting user's role. Some users are not authorized to view financial data or certain metrics.

### A. Dashboard Metrics
*   **`superadmin`**: Can view EVERYTHING (`*`).
*   **`admin`**: Sees `revenue`, `subscriptions`, `tenants`, `activeUsers`.
*   **`adminusers`**: Restricted visibility. Sees **ONLY** `tenants` and `activeUsers` (Financials hidden).

### B. Tenant Data & List (`tenantTable`)
*   **`admin`**: Sees `name`, `email`, `status`, `subscription`, `vessels`, `orders`.
*   **`adminusers`**: Sees `name`, `email`, `status`, `vessels` (Order and subscription data hidden).

### C. Users Data List (`userTable` / `subUsersTable`)
*   **`admin` (`userTable`)**: Sees `name`, `email`, `role`, `status`.
*   **`tenantadmin` (`subUsersTable`)**: Sees internal tenant users `name`, `email`, `role`.

### D. Vessel Details (`vesselTable`)
*   **`tenantadmin`**: Full details - `name`, `type`, `capacity`, `status`.
*   **`captain`**: Operational view - `name`, `type`, `status` (Vessel `capacity` is hidden).

### E. Orders details (`orderTable`)
*   **`tenantadmin`**: Full details - `orderId`, `date`, `status`, `amount`.
*   **`purchaser`**: Full details - `orderId`, `date`, `status`, `amount`.
*   **`captain`**: Restricted view - `orderId`, `date`, `status` (Order `amount` / Pricing is completely hidden).

### F. Catalogue items (`catalogueTable`)
*   **`tenantadmin`**: Sees `productName`, `category`, `price`, `stock`.
*   **`purchaser`**: Sees `productName`, `category`, `price`, `stock`.
*   **`captain`**: Only allowed to see products, but presumably, pricing could be hidden or restricted at the UI level based on the lack of field definition on their profile.

---

## 4. API Backend Implementation Recommendations

1.  **JWT / Session Token**: Inject `roleType` directly into the authenticated token.
2.  **Middleware Gatekeeper**: Implement an authorization middleware (`hasPageAccess(pageName)`) on the Router level.
    *   *Example: `GET /api/v1/tenant/vessels` should strictly check if user's role has `"tenantVessels"` in their `pages` list.*
3.  **Data Serialization (DTOs)**: Implement response transformers that prune JSON response keys if the field is not listed in `permissions.fields[tableName]`.
    *   *Example: When querying Orders, if the requesting user is `captain01`, prune the `amount` key before returning `200 OK`.*
4.  **Implicit Deny**: If a page or field is not explicitly defined in the user's permission set (and they are not `superadmin` with `*`), the backend must return a `403 Forbidden` or sanitize the data.
