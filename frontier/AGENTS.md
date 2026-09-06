# AGENTS.md — b2b2 (Frontend)

> Package-level guide. Takes precedence over the root `AGENTS.md` for all files inside `b2b2/`.

---

## 📦 Package Info

- **Name:** `b2b-saas-design-system`
- **Stack:** React 18 · Vite 6 · TypeScript 5.8 · React Router v7
- **Dev server:** `npm run dev` → http://localhost:3000
- **Proxy:** `/api/*` → `http://localhost:3001` (NestJS backend)

---

## 🗂️ Directory Structure

```
b2b2/
├── App.tsx                  # Root app — thin composition of hooks + providers
├── index.tsx                # Entry point
├── pages/                   # Page-level components (route leaves)
│   ├── Auth/                # Login / Signup / VendorRegistration
│   ├── Catalogue/           # Marine catalogue (Company + Global scope)
│   ├── Cart/                # Cart page
│   ├── Dashboard.tsx
│   ├── documentsInfo/       # Tenant document management
│   ├── Details/             # Add/view detail pages (AddTenant, AddVessel, etc.)
│   ├── Requsition&Order/    # Requisition workflow (Captain/Purchaser)
│   └── TableList/           # Generic list views (Tenants, Users, Vessels, etc.)
├── components/
│   ├── common/              # Shared components (ErrorBoundary, ProfileDropdown, etc.)
│   ├── layout/              # Structural layout components:
│   │   ├── AppShell.tsx     # Navbar + Sidebar + content area wrapper
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   ├── Sidebar.tsx      # Icon sidebar with RBAC-filtered menu items
│   │   └── PageLayout.tsx
│   └── ui/                  # Reusable primitive UI components (Input, Button, etc.)
├── routes/                  # Routing layer (legacy-tab system)
│   ├── routeConfig.tsx      # Typed RouteEntry[] array — one entry per tab
│   └── RouteRenderer.tsx    # Renders the correct page for current tabBase
├── hooks/                   # Custom React hooks
│   ├── useAuthGate.ts       # Auth check on mount + forbidden-tab redirect
│   └── useTheme.ts          # isDarkMode state + dark class toggle
├── react-tour/              # Onboarding tour (first-login walkthrough)
│   ├── json/tourSteps.tsx   # Tour step definitions
│   ├── TourController.tsx   # Auto-trigger logic (localStorage flag)
│   ├── TourCustomComponents.tsx  # Custom Back/Next navigation
│   └── tourStyles.ts        # TourProvider styles object
├── context/                 # React context providers (CartContext, etc.)
├── data/                    # Static config / mock JSON (e.g. requisitionModalConfig.json)
├── lib/                     # Core utilities (appRouting.ts, apiClient.ts)
├── services/
│   └── microservices/       # API service wrappers per domain (tenant, catalogue, etc.)
├── utils/                   # Shared utilities (rbac.ts, etc.)
├── style/                   # Global CSS & design tokens
├── bones/                   # Boneyard-js skeleton screen configs
└── docx/                    # Frontend documentation (read before coding a feature)
```

---

## 🚀 Dev Environment Tips

- Use `@/` alias for all imports (resolves to `b2b2/` root). Avoid `../../` relative paths.
- The dev server runs on **port 3000**. Backend must be on **port 3001** for the proxy to work.
- Environment variables are set in `.env.local`. Prefix custom vars with `VITE_` if you want them available client-side via `import.meta.env`. The `GEMINI_API_KEY` is injected specially via Vite `define` — do not rename it.
- Type-check without building: `npx tsc --noEmit`

---

## 🗺️ Routing Architecture

The app uses a **legacy-tab routing layer** on top of React Router v7. Do not redesign this system — understand it before adding new pages.

- **`lib/appRouting.ts`**: Thin re-export of `routingService`. Key functions:
  - `pathToLegacyTab(pathname, tenantId)` → converts URL to a `tabBase_tabParam` string
  - `resolveNavigationTarget(tabOrUrl, context)` → converts a tab name or URL into the final path to `navigate()` to
  - `getAccessPageForLegacyTab(legacyTab)` → returns the RBAC page-permission key for a tab
- **`routes/routeConfig.tsx`**: Typed `RouteEntry[]` array. **Add a new entry here** when adding a new page. Each entry has:
  - `tabBase`: matches the `activeTab.split('_')[0]` value
  - `accessPage`: the key passed to `canAccessPage()` — set `undefined` if no RBAC check is needed
  - `render(ctx)`: returns the page element with its exact props
- **`routes/RouteRenderer.tsx`**: Reads the current `tabBase`, looks it up in `routeMap`, checks RBAC, and renders in this priority order:
  1. Allowed + implemented → page component
  2. Known + access denied → "Access Denied" UI
  3. Known + not yet built → "Work in progress"
  4. Unknown tab → "Work in progress"
- **`KNOWN_TABS`** and **`IMPLEMENTED_TABS`** live in `RouteRenderer.tsx`. Keep them in sync when adding or promoting a tab.

---

## 🔑 RBAC & Auth

- Auth is JWT-based (tokens stored in `localStorage`).
- Role hierarchy: `superadmin` > `admin` > `tenantadmin` > sub-users (`captain`, `purchaser`, `vendor`).
- Permission checks live in `utils/rbac.ts`. Always use `canAccessPage()` before rendering a protected page.
- Tenant context is resolved server-side via the `x-tenant-id` header — ensure the API service layer injects this header on all tenant-scoped requests.
- See `docx/AUTHENTICATION_DOCS.md` and `docx/AUTHENTICATION_CHECKLIST.md` for the full auth spec.

---

## 🗄️ Data & API Patterns

- All API calls go through `services/microservices/<domain>/index.ts` wrappers — do not call `fetch` directly in page components.
- Static config for modals / forms lives in `data/` as JSON files (e.g. `requisitionModalConfig.json`). Update these when adding new fields.
- Do **not** use `b2b2/data/` TSX files as a data source in the backend — they contain JSX and cannot be parsed by Node.js.

---

## 🎨 UI / Styling Rules

- **CSS-in-file**: Use Vanilla CSS (style files in `style/`). Do **not** introduce Tailwind unless explicitly asked.
- The project has `tailwind-merge` and `clsx` installed for conditional class merging in components that use utility classes.
- Icons: Use `lucide-react` only (already installed). Do not add a new icon library.
- Charts: Use `react-chartjs-2` + `chart.js`. Do not add another chart library.
- Skeleton screens: Configured via `boneyard-js`. Add snapshots in `bones/` for new list/data pages.

---

## 🧪 Testing Instructions

```bash
# Type check
npx tsc --noEmit

# Build (validate bundle compiles without errors)
npm run build
```

- No Jest/Vitest unit tests are configured yet. Validate changes by running the dev server and verifying in the browser.
- Fix **all** TypeScript errors before finishing a task.

---

## 📚 Key Documentation

| Topic | File |
|---|---|
| Auth & RBAC | `docx/AUTHENTICATION_DOCS.md` |
| Frontend Routing | `docx/FRONTEND_ROUTING_ARCHITECTURE.md` |
| Catalogue Logic | `docx/CATALOG_BUSINESS_LOGIC_SPEC.md` |
| Requisition Flow | `docx/REQUISITION_FLOW.md` |
| Vendor Registration | `docx/VENDOR_REGISTRATION_FLOW.md` |
| Tenant Sub-Users | `docx/TENANT_DETAILS_SUB_USERS_FLOW_SPEC.md` |

---

## 🔄 PR Instructions

- **Title format:** `[b2b2] <Title>`
- Run `npx tsc --noEmit` before committing.
- Update the relevant `docx/` file if you change routing, RBAC, or feature logic.
- Do not commit `.env.local`.
