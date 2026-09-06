# Requisition Details — Business Logic & Flow Documentation

> **Purpose:** This document is the single source of truth for the `RequisitionDetails` feature.  
> Update this file any time you change routing, data shape, component responsibilities, or business rules.

---

## 1. Feature Overview

The **Requisition Details** page provides a read-and-act view for a single requisition. It is opened when a user clicks any row in the `RequisitionOrderPage` list view.

**URL pattern:**  
```
/requisition-details/:id?name=<url-encoded-requisition-name>
```
- `:id` is the numeric requisition ID.
- `?name=` is passed as a URL search param as a display fallback while the data resolves.

**App routing:** `tabBase === 'requisitionDetails'` in [`App.tsx`](../../../../App.tsx).

---

## 2. File Structure

```
pages/
└── Requsition&Order/
    ├── RequisitionDetailsPage.tsx          ← Root page component (entry point)
    ├── RequisitionOrdersPage.tsx           ← List page (navigates here on row click)
    ├── useRequisitionOrderLogic.tsx        ← Hook for the list page
    └── RequisitionDetails/
        ├── types.ts                        ← All shared TypeScript interfaces
        ├── mockData.ts                     ← Static mock data + data-access helpers
        ├── RequisitionDetailHeader.tsx     ← Sticky header component
        ├── RequisitionTabs.tsx             ← Tab bar + tab switcher
        ├── ItemsTab.tsx                    ← Tab 1: Catalogue items (# row number column)
        ├── VendorEnquiriesTab.tsx          ← Tab 2: RFQ / Enquiries sent to vendors
        └── VendorResponsesTab.tsx          ← Tab 3: Vendor quote responses

components/
├── common/
│   └── RequisitionBottomBar.tsx           ← [NEW] Sticky bottom action bar (3 variants)
└── ui/
    └── VendorEnquiryPopup.tsx             ← [NEW] Vendor enquiry popup (item + vendor selection)
```

---

## 3. Data Model (`types.ts` / `requisitionMockData.ts`)

### `RequisitionDetail` — Core domain object
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | Numeric primary key |
| `referenceId` | `string` | Display ID, e.g. `REQ-0001` |
| `requisitionName` | `string` | Primary title |
| `categoryName` | `string` | Category type (Engine, Safety, Provisions, …) |
| `vesselName` | `string` | Associated vessel |
| `status` | `RequisitionStatus` | See status flow below |
| `priority` | `Priority` | Urgent / High / Medium / Low |
| `deliveryPort` | `string` | Port of delivery |
| `eta` | `string` | ISO date — Estimated Time of **Arrival** |
| `etd` | `string` | ISO date — Estimated Time of **Departure** |
| `createdBy` | `string` | User who created the requisition |
| `createdOn` | `string` | ISO datetime |
| `updatedOn` | `string?` | ISO datetime — only present if ever edited |

> **NOTE:** The `Create Requisition` modal (in `CataloguePage` and `RequisitionOrdersPage`) currently does **not** capture `eta`, `etd`, `deliveryPort`, or `priority`. These fields must be added to the modal form (tabs `req_details` in `requisitionModalConfig.json`) before the live backend integration.

### `RequisitionItem` — Item in the requisition
| Field | Type |
|---|---|
| `id` | `number` |
| `productName` | `string` |
| `category` | `string` |
| `quantity` | `number` |
| `unit` | `string` |
| `referenceCode` | `string` |
| `vendor` | `string` |
| `status` | `'Pending' \| 'Confirmed' \| 'Rejected'` |

### `VendorEnquiry` — RFQ sent to a vendor
| Field | Type |
|---|---|
| `id` | `number` |
| `vendorName` | `string` |
| `sentOn` | `string` (date) |
| `itemsCount` | `number` |
| `status` | `'Sent' \| 'Viewed' \| 'Responded' \| 'Expired'` |
| `responseDeadline` | `string` (date) |

### `VendorResponse` — Vendor's reply to an enquiry
| Field | Type |
|---|---|
| `id` | `number` |
| `vendorName` | `string` |
| `respondedOn` | `string` (date) |
| `itemsQuoted` | `number` |
| `totalValue` | `string` (formatted, e.g. `"$4,250"`) |
| `status` | `'Under Review' \| 'Accepted' \| 'Rejected'` |

---

## 4. Requisition Status Flow

```
Draft
  └─► Proceed
        └─► Pending approval
              ├─► Awaiting Vendor
              │     └─► Proceed Further
              │           ├─► Order Placed
              │           │     └─► Out For delivery
              │           │               └─► Delivered
              │           └─► Rejected by PO
              └─► Rejected by PO
```

**Colour mappings** (Badge `color` prop):

| Status | Color |
|---|---|
| Draft | `light` |
| Proceed | `success` |
| Pending approval | `warning` |
| Awaiting Vendor | `info` |
| Proceed Further | `primary` |
| Rejected by PO | `danger` |
| Order Placed | `dark` |
| Out For delivery | `info` |
| Delivered | `success` |

---

## 5. Sticky Header — Component Responsibilities (`RequisitionDetailHeader.tsx`)

The header uses `position: sticky; top: 0; z-index: 30` and has a solid `bg-white` / `dark:bg-grey-100` background to prevent content bleed-through during scroll.

**Elements rendered (top-to-bottom, left-to-right):**

| Row | Left | Right |
|---|---|---|
| Row 1 | `DynamicBreadcrumb` (Home → Requisition & Orders → Name) | Prev `<` / Next `>` arrows, Share icon, More (⋯) icon, **Edit** button |
| Row 2 | Requisition Name (h1, 22px semibold) | Status badge, Category badge |
| Row 3 | Meta pills: ID · ETA · ETD · Delivery Port · Priority · Vessel · Timestamp | — |

**Navigation arrows:**
- Left `<` arrow → navigates to `/requisition-details/{prevId}`.
- Right `>` arrow → navigates to `/requisition-details/{nextId}`.
- Both are disabled (opacity 30%) when there is no previous / next record.
- Navigation order mirrors the order of `MOCK_REQUISITION_DETAILS` array.

**Timestamp logic:**
- If `updatedOn` is present → display `"Updated on {formatDateTime(updatedOn)}"`.
- Otherwise → display `"Created at {formatDateTime(createdOn)}"`.

**Action buttons (UI-only for now):**
- **Share** icon: no-op, future integration.
- **More (⋯)** icon: no-op, future dropdown menu.
- **Edit** button: wired to an `onClick` handler (currently a console log); will open an edit modal or navigate to an edit form.

---

## 6. Tabbed Body — Component Responsibilities (`RequisitionTabs.tsx`)

The tab bar is rendered directly below the sticky header. Each tab shows a count badge.

| Tab Key | Label | Component | Count Source |
|---|---|---|---|
| `items` | Items | `ItemsTab` | `items.length` |
| `vendor-enquiries` | Vendor Enquiries | `VendorEnquiriesTab` | `enquiries.length` |
| `vendor-responses` | Vendor Responses | `VendorResponsesTab` | `responses.length` |

Active tab state is local to `RequisitionTabs` (`useState<TabKey>`). Default is `'items'`.

---

## 7. Tab Business Logic

### Tab 1: Items (`ItemsTab.tsx`)
- Displays each catalogue item added to the requisition.
- Shows a table with: `#` (serial row number), Product Name, Category badge, Reference Code, Quantity + Unit, Vendor, Status badge.
- The `#` column uses a pre-built `Map<itemId, index>` since the `Table` component's `cell` callback does not receive a row index.
- Empty state shown when no items exist.
- **Future:** Clicking a row should navigate to the catalogue product detail.

### Tab 2: Vendor Enquiries (`VendorEnquiriesTab.tsx`)
- Shows summary counts: **Total Sent**, **Responded**, **Pending**.
- Card grid — one card per enquiry, showing: vendor name, status badge (with icon), sent date, deadline, items count.
- Status progression: `Sent → Viewed → Responded` (or `Expired` if deadline passed).
- **Future:** "Send RFQ" button should trigger a modal to select vendors and items.

### Tab 3: Vendor Responses (`VendorResponsesTab.tsx`)
- Shows summary counts: **Total Responses**, **Accepted**, **Under Review**, (optionally) **Rejected**.
- Table — one row per response: vendor avatar initial, responded date, items quoted, total value, status badge.
- `Under Review` status uses an animated spinner icon.
- **Future:** Clicking a row should open the full quote comparison view.

---

## 8. Data Access Layer (`data/requisitionMockData.ts`)

All helper functions exported from `requisitionMockData.ts`:

| Function | Returns |
|---|---|
| `getRequisitionById(id)` | `RequisitionDetail \| undefined` |
| `getRequisitionByName(name)` | `RequisitionDetail \| undefined` |
| `getAdjacentIds(id)` | `{ prevId: number \| null; nextId: number \| null }` |
| `getItemsForRequisition(id)` | `RequisitionItem[]` |
| `getEnquiriesForRequisition(id)` | `VendorEnquiry[]` |
| `getResponsesForRequisition(id)` | `VendorResponse[]` |

When the backend is ready, replace the body of each function with an API call (e.g. `GET /requisitions/:id/items`).

### Available Mock Requisitions

| ID | Name | Category | Items |
|---|---|---|---|
| 1 | Engine Spare Parts Q1 | Engine | 3 |
| 2 | Deck Safety Equipment | Safety | 2 |
| 3 | Navigation System Upgrade | Navigation | 2 |
| 4 | Fresh Provisions Feb | Provisions | 0 |
| 5–10 | Various | Various | 0 |
| **11** | **Provision Supplies — March Run** | **Provisions** | **10** |

> Requisition **id=11** is the primary Provisions demo entry with 10 realistic maritime provisioning items (fresh produce, dairy, meat, beverages, dry goods, oil, cleaning supplies, spices, bakery).

---

## 9. Backend Integration Checklist

When connecting to the real API, update these files:

- [ ] **`requisitionMockData.ts`** — replace mock arrays with `useEffect` + API calls (or a React Query hook).
- [ ] **`RequisitionDetailsPage.tsx`** — add loading and error states.
- [ ] **`requisitionModalConfig.json`** — add `eta`, `etd`, `deliveryPort` fields to the `req_details` tab and `priority` as a required select field.
- [ ] **`useRequisitionOrderLogic.tsx`** — extend `RequisitionOrder` type to include the new fields so the list page can display them.
- [ ] **`RequisitionDetailHeader.tsx`** — wire the **Edit** button to call `PUT /requisitions/:id`.
- [ ] **`VendorEnquiriesTab.tsx`** — wire "Send RFQ" to `POST /requisitions/:id/enquiries`.
- [ ] **`VendorResponsesTab.tsx`** — wire response acceptance to `PATCH /requisitions/:id/responses/:responseId`.
- [ ] **`VendorEnquiryPopup.tsx`** — replace static `PLACEHOLDER_VENDORS` with `GET /vendors` API call; wire "Send Enquiries" button to `POST /requisitions/:id/enquiries` with `{ itemIds: number[], vendorIds: string[] }` body.
- [ ] **`RequisitionBottomBar.tsx`** — no backend wiring needed; bar reflects live `items.length` once API data flows in.

---

## 10. Bottom Bar — Component Responsibilities (`RequisitionBottomBar.tsx`)

**Path:** `b2b2/components/common/RequisitionBottomBar.tsx`

The bottom bar sits **below** the main content area inside `RequisitionDetailsPage`. It is always visible and provides a quick-action strip.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `variant` | `'info' \| 'action' \| 'summary'` | ✅ | Controls layout and colour accent |
| `totalItems` | `number` | ✅ | Count of line items shown on the left |
| `requisitionName` | `string` | — | Shown in expanded panel |
| `actionButton` | `React.ReactNode` | — | CTA button (visible in `action` & `summary` variants) |
| `summaryData` | `SummaryDataItem[]` | — | `{ label, value }` pairs shown as pills in `summary` variant |
| `expandedContent` | `React.ReactNode` | — | Custom content rendered in the expanded panel |

### Variants

| Variant | Left content | Right content | Accent colour |
|---|---|---|---|
| `info` | Package icon + "Total Products: N" | Expand toggle only | `info` (indigo) |
| `action` | Package icon + "Total Products: N" | Action button + expand toggle | `primary` (blue) |
| `summary` | Stat pills (items + summaryData) | Action button + expand toggle | `success` (green) |

### Expand / Collapse

- Collapsed height: `h-14` (56 px).
- The **ChevronUp** icon means "click to expand" (panel is hidden).
- The **ChevronDown** icon means "click to collapse" (panel is showing).
- The expanded panel slides in above the strip via a `max-h` / `opacity` CSS transition.
- A 3px left accent border changes colour per variant (`border-l-info`, `border-l-primary`, `border-l-success`).

### Usage in `RequisitionDetailsPage`

```tsx
<RequisitionBottomBar
  variant="action"
  totalItems={items.length}
  requisitionName={requisition.requisitionName}
  actionButton={
    <Button
      id="btn-send-vendor-enquiries"
      variant="solid"
      color="primary"
      size="small"
      onClick={() => setIsEnquiryPopupOpen(true)}
    >
      Send Vendor Enquiries
    </Button>
  }
/>
```

---

## 11. Vendor Enquiry Popup — Component Responsibilities (`VendorEnquiryPopup.tsx`)

**Path:** `b2b2/components/ui/VendorEnquiryPopup.tsx`

A standalone modal popup (not driven by the `GenericModal` config API) tailored to the vendor enquiry flow.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `isOpen` | `boolean` | ✅ | Controls visibility |
| `onClose` | `() => void` | ✅ | Called when the popup should close |
| `items` | `RequisitionItem[]` | ✅ | Items to show in the checklist |
| `requisitionName` | `string` | — | Shown in the popup header |

### Behaviour

| Behaviour | Detail |
|---|---|
| **Open trigger** | "Send Vendor Enquiries" button in `RequisitionBottomBar` |
| **Close triggers** | Backdrop click · Escape key · Cancel button · Send button (after action) |
| **Item checklist** | All items pre-selected on open; individual toggle + "Select all" shortcut |
| **Vendor search** | Text filter over `PLACEHOLDER_VENDORS` (replace with API later) |
| **Vendor selection** | Checkbox toggle per vendor; highlighted with `success-soft` background |
| **Send guard** | "Send Enquiries" button disabled until ≥1 item AND ≥1 vendor selected |
| **Loading state** | Button shows "Sending…" with `disabled` during the async stub |

### Backend wiring (future)

```typescript
// Replace the stub in handleSend():
const response = await fetch(`/api/requisitions/${requisitionId}/enquiries`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
  body: JSON.stringify({
    itemIds: Array.from(selectedItemIds),
    vendorIds: Array.from(selectedVendorIds),
  }),
});
```

Also replace `PLACEHOLDER_VENDORS` with:
```typescript
const vendors = await fetch('/api/vendors').then(r => r.json());
```

---

## 12. UI Components Used

All from the existing design system (`b2b2/components/`):

| Component | Import |
|---|---|
| `Badge` | `@/components/ui/Badge` |
| `Button` | `@/components/ui/Button` |
| `DynamicBreadcrumb` | `@/components/common/Breadcrub/dynamicbreadcrub` |
| `Typography` (various) | `@/components/ui/Typography` |
| `RequisitionBottomBar` | `@/components/common/RequisitionBottomBar` ← NEW |
| `VendorEnquiryPopup` | `@/components/ui/VendorEnquiryPopup` ← NEW |
| Lucide icons | `lucide-react` |

> **Constraint:** No external UI libraries introduced. All styling uses existing Tailwind utility classes consistent with the design system colour tokens defined in `style/constants.ts`.
