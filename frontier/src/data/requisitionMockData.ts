/**
 * requisitionMockData.ts
 * ──────────────────────
 * Centralised static mock data for all Requisition-related features.
 *
 * When the real API is ready:
 *   1. Replace the data arrays below with API-fetched values.
 *   2. Replace the helper functions with React Query hooks or service calls.
 *   3. Keep the TypeScript interfaces — they match the backend contract.
 */

// ─── Status & Priority enums ──────────────────────────────────────────────────

export type RequisitionStatus =
  | 'Draft'
  | 'Proceed'
  | 'Pending approval'
  | 'Awaiting Vendor'
  | 'Proceed Further'
  | 'Rejected by PO'
  | 'Order Placed'
  | 'Out For delivery'
  | 'Delivered';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TabKey = 'items' | 'vendor-enquiries' | 'vendor-responses';

// ─── Core domain interfaces ───────────────────────────────────────────────────

export interface RequisitionDetail {
  id: number;
  referenceId: string;
  requisitionName: string;
  categoryName: string;
  vesselName: string;
  status: RequisitionStatus;
  priority: Priority;
  deliveryPort: string;
  eta: string;        // ISO date "YYYY-MM-DD"
  etd: string;        // ISO date "YYYY-MM-DD"
  createdBy: string;
  createdOn: string;  // ISO datetime
  updatedOn?: string; // ISO datetime — absent if never edited
}

export interface RequisitionItem {
  id: number;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  referenceCode: string;
  vendor: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
}

export interface VendorEnquiry {
  id: number;
  vendorName: string;
  sentOn: string;
  itemsCount: number;
  status: 'Sent' | 'Viewed' | 'Responded' | 'Expired';
  responseDeadline: string;
}

export interface VendorResponse {
  id: number;
  vendorName: string;
  respondedOn: string;
  itemsQuoted: number;
  totalValue: string;
  status: 'Under Review' | 'Accepted' | 'Rejected';
}

// ─── Status colour map (used by both list and details pages) ──────────────────

export const STATUS_COLOR_MAP: Record<
  RequisitionStatus,
  'success' | 'warning' | 'danger' | 'info' | 'primary' | 'dark' | 'light'
> = {
  Draft: 'light',
  Proceed: 'success',
  'Pending approval': 'warning',
  'Awaiting Vendor': 'info',
  'Proceed Further': 'primary',
  'Rejected by PO': 'danger',
  'Order Placed': 'dark',
  'Out For delivery': 'info',
  Delivered: 'success',
};

export const PRIORITY_COLOR_MAP: Record<Priority, 'danger' | 'warning' | 'info' | 'light'> = {
  Urgent: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'light',
};

// ─── Static mock requisition records ─────────────────────────────────────────
// NOTE: "Engine Spare Parts Q1" is id=1 — this matches the first entry from the
// RequisitionOrdersPage list and will resolve correctly when navigated to.

export const MOCK_REQUISITION_DETAILS: RequisitionDetail[] = [
  {
    id: 1,
    referenceId: 'REQ-0001',
    requisitionName: 'Engine Spare Parts Q1',
    categoryName: 'Engine',
    vesselName: 'MSC Neptune',
    status: 'Draft',
    priority: 'High',
    deliveryPort: 'Mumbai Port (JNPT)',
    eta: '2024-03-15',
    etd: '2024-03-10',
    createdBy: 'John Carter',
    createdOn: '2024-01-10T09:30:00',
  },
  {
    id: 2,
    referenceId: 'REQ-0002',
    requisitionName: 'Deck Safety Equipment',
    categoryName: 'Safety',
    vesselName: 'MSC Titan',
    status: 'Proceed',
    priority: 'Urgent',
    deliveryPort: 'Singapore Port (PSA)',
    eta: '2024-04-01',
    etd: '2024-03-25',
    createdBy: 'Emma Watson',
    createdOn: '2024-01-15T11:00:00',
    updatedOn: '2024-02-05T14:22:00',
  },
  {
    id: 3,
    referenceId: 'REQ-0003',
    requisitionName: 'Navigation System Upgrade',
    categoryName: 'Navigation',
    vesselName: 'MSC Voyager',
    status: 'Pending approval',
    priority: 'Medium',
    deliveryPort: 'Rotterdam Port',
    eta: '2024-04-20',
    etd: '2024-04-15',
    createdBy: 'Sarah Miller',
    createdOn: '2024-01-20T08:00:00',
  },
  {
    id: 4,
    referenceId: 'REQ-0004',
    requisitionName: 'Fresh Provisions Feb',
    categoryName: 'Provisions',
    vesselName: 'MSC Pioneer',
    status: 'Awaiting Vendor',
    priority: 'Medium',
    deliveryPort: 'Jebel Ali (Dubai)',
    eta: '2024-03-28',
    etd: '2024-03-22',
    createdBy: 'David Chen',
    createdOn: '2024-02-01T10:15:00',
    updatedOn: '2024-02-10T09:45:00',
  },
  {
    id: 5,
    referenceId: 'REQ-0005',
    requisitionName: 'Lubricants Replenishment',
    categoryName: 'Lubricants',
    vesselName: 'MSC Endeavour',
    status: 'Proceed Further',
    priority: 'Low',
    deliveryPort: 'Chennai Port',
    eta: '2024-04-10',
    etd: '2024-04-05',
    createdBy: 'Maria Garcia',
    createdOn: '2024-02-05T13:00:00',
  },
  {
    id: 6,
    referenceId: 'REQ-0006',
    requisitionName: 'Communication Equipment',
    categoryName: 'Communication',
    vesselName: 'MSC Demo',
    status: 'Rejected by PO',
    priority: 'High',
    deliveryPort: 'Hamburg Port',
    eta: '2024-04-05',
    etd: '2024-03-30',
    createdBy: 'James Wilson',
    createdOn: '2024-02-10T16:30:00',
    updatedOn: '2024-02-18T11:00:00',
  },
  {
    id: 7,
    referenceId: 'REQ-0007',
    requisitionName: 'Chemical Stores Q1',
    categoryName: 'Chemicals',
    vesselName: 'MSC Neptune',
    status: 'Order Placed',
    priority: 'High',
    deliveryPort: 'Busan Port',
    eta: '2024-04-15',
    etd: '2024-04-08',
    createdBy: 'Lisa Thompson',
    createdOn: '2024-02-14T09:00:00',
    updatedOn: '2024-02-20T10:15:00',
  },
  {
    id: 8,
    referenceId: 'REQ-0008',
    requisitionName: 'Paint & Coating Supplies',
    categoryName: 'Paints',
    vesselName: 'MSC Titan',
    status: 'Out For delivery',
    priority: 'Medium',
    deliveryPort: 'Shanghai Port',
    eta: '2024-04-22',
    etd: '2024-04-16',
    createdBy: 'John Carter',
    createdOn: '2024-02-18T14:00:00',
  },
  {
    id: 9,
    referenceId: 'REQ-0009',
    requisitionName: 'Dry Stores March Batch',
    categoryName: 'Stores',
    vesselName: 'MSC Voyager',
    status: 'Delivered',
    priority: 'Low',
    deliveryPort: 'Tokyo Port',
    eta: '2024-03-20',
    etd: '2024-03-14',
    createdBy: 'Emma Watson',
    createdOn: '2024-02-22T08:30:00',
    updatedOn: '2024-03-22T12:00:00',
  },
  {
    id: 10,
    referenceId: 'REQ-0010',
    requisitionName: 'Deck Equipment Restock',
    categoryName: 'Deck',
    vesselName: 'MSC Pioneer',
    status: 'Draft',
    priority: 'Urgent',
    deliveryPort: 'Colombo Port',
    eta: '2024-05-01',
    etd: '2024-04-25',
    createdBy: 'Sarah Miller',
    createdOn: '2024-03-01T11:45:00',
  },
  {
    id: 11,
    referenceId: 'REQ-0011',
    requisitionName: 'Provision Supplies — March Run',
    categoryName: 'Provisions',
    vesselName: 'MSC Neptune',
    status: 'Awaiting Vendor',
    priority: 'High',
    deliveryPort: 'Mumbai Port (JNPT)',
    eta: '2024-03-30',
    etd: '2024-03-24',
    createdBy: 'David Chen',
    createdOn: '2024-03-05T08:00:00',
    updatedOn: '2024-03-08T14:30:00',
  },
];

// ─── Items per requisition ────────────────────────────────────────────────────

export const MOCK_ITEMS: Record<number, RequisitionItem[]> = {
  1: [
    {
      id: 1,
      productName: 'Piston Ring Set',
      category: 'Engine',
      quantity: 4,
      unit: 'Sets',
      referenceCode: 'ENG-PR-001',
      vendor: 'Marine Supplies Ltd',
      status: 'Confirmed',
    },
    {
      id: 2,
      productName: 'Cylinder Liner',
      category: 'Engine',
      quantity: 2,
      unit: 'Pcs',
      referenceCode: 'ENG-CL-002',
      vendor: 'Global Ship Parts',
      status: 'Pending',
    },
    {
      id: 3,
      productName: 'Fuel Injector Nozzle',
      category: 'Engine',
      quantity: 6,
      unit: 'Pcs',
      referenceCode: 'ENG-FI-003',
      vendor: 'Marine Supplies Ltd',
      status: 'Pending',
    },
  ],
  2: [
    {
      id: 1,
      productName: 'Life Jacket (SOLAS Approved)',
      category: 'Safety',
      quantity: 20,
      unit: 'Pcs',
      referenceCode: 'SAF-LJ-001',
      vendor: 'SeaSafe Co.',
      status: 'Confirmed',
    },
    {
      id: 2,
      productName: 'Fire Extinguisher 9KG',
      category: 'Safety',
      quantity: 5,
      unit: 'Pcs',
      referenceCode: 'SAF-FE-002',
      vendor: 'SeaSafe Co.',
      status: 'Confirmed',
    },
  ],
  3: [
    {
      id: 1,
      productName: 'GPS Navigation Unit',
      category: 'Navigation',
      quantity: 1,
      unit: 'Unit',
      referenceCode: 'NAV-GPS-001',
      vendor: 'NavTech Marine',
      status: 'Pending',
    },
    {
      id: 2,
      productName: 'AIS Transponder Class B',
      category: 'Navigation',
      quantity: 1,
      unit: 'Unit',
      referenceCode: 'NAV-AIS-002',
      vendor: 'NavTech Marine',
      status: 'Pending',
    },
  ],
  11: [
    {
      id: 1,
      productName: 'Fresh Apples (Red Delicious)',
      category: 'Provisions',
      quantity: 50,
      unit: 'Kg',
      referenceCode: 'PRV-FRT-001',
      vendor: 'Ocean Fresh Suppliers',
      status: 'Pending',
    },
    {
      id: 2,
      productName: 'Fresh Tomatoes',
      category: 'Provisions',
      quantity: 30,
      unit: 'Kg',
      referenceCode: 'PRV-VEG-002',
      vendor: 'Ocean Fresh Suppliers',
      status: 'Pending',
    },
    {
      id: 3,
      productName: 'Whole Milk (UHT)',
      category: 'Provisions',
      quantity: 120,
      unit: 'Litres',
      referenceCode: 'PRV-DAI-003',
      vendor: 'Maritime Dairy Co.',
      status: 'Confirmed',
    },
    {
      id: 4,
      productName: 'Frozen Chicken Breast',
      category: 'Provisions',
      quantity: 80,
      unit: 'Kg',
      referenceCode: 'PRV-MEA-004',
      vendor: 'Global Protein Supplies',
      status: 'Pending',
    },
    {
      id: 5,
      productName: 'Bottled Mineral Water (500ml)',
      category: 'Provisions',
      quantity: 500,
      unit: 'Bottles',
      referenceCode: 'PRV-BEV-005',
      vendor: 'AquaMarine Beverages',
      status: 'Confirmed',
    },
    {
      id: 6,
      productName: 'Basmati Rice (Long Grain)',
      category: 'Provisions',
      quantity: 100,
      unit: 'Kg',
      referenceCode: 'PRV-DRY-006',
      vendor: 'Grain & Co. Maritime',
      status: 'Pending',
    },
    {
      id: 7,
      productName: 'Sunflower Cooking Oil',
      category: 'Provisions',
      quantity: 40,
      unit: 'Litres',
      referenceCode: 'PRV-OIL-007',
      vendor: 'Maritime Dairy Co.',
      status: 'Pending',
    },
    {
      id: 8,
      productName: 'All-Purpose Cleaning Detergent',
      category: 'Provisions',
      quantity: 25,
      unit: 'Kg',
      referenceCode: 'PRV-CLN-008',
      vendor: 'ShipCare Essentials',
      status: 'Rejected',
    },
    {
      id: 9,
      productName: 'Mixed Spice Pack (Cumin, Turmeric, Pepper)',
      category: 'Provisions',
      quantity: 10,
      unit: 'Kg',
      referenceCode: 'PRV-SPC-009',
      vendor: 'Grain & Co. Maritime',
      status: 'Pending',
    },
    {
      id: 10,
      productName: 'Whole Wheat Bread Loaves',
      category: 'Provisions',
      quantity: 60,
      unit: 'Pcs',
      referenceCode: 'PRV-BAK-010',
      vendor: 'Ocean Fresh Suppliers',
      status: 'Confirmed',
    },
  ],
};

// ─── Vendor enquiries per requisition ─────────────────────────────────────────

export const MOCK_ENQUIRIES: Record<number, VendorEnquiry[]> = {
  1: [
    {
      id: 1,
      vendorName: 'Marine Supplies Ltd',
      sentOn: '2024-01-12',
      itemsCount: 3,
      status: 'Responded',
      responseDeadline: '2024-01-20',
    },
    {
      id: 2,
      vendorName: 'Global Ship Parts',
      sentOn: '2024-01-12',
      itemsCount: 3,
      status: 'Viewed',
      responseDeadline: '2024-01-20',
    },
    {
      id: 3,
      vendorName: 'Oceanic Traders',
      sentOn: '2024-01-12',
      itemsCount: 3,
      status: 'Sent',
      responseDeadline: '2024-01-20',
    },
  ],
  2: [
    {
      id: 1,
      vendorName: 'SeaSafe Co.',
      sentOn: '2024-01-18',
      itemsCount: 2,
      status: 'Responded',
      responseDeadline: '2024-01-26',
    },
  ],
  3: [
    {
      id: 1,
      vendorName: 'NavTech Marine',
      sentOn: '2024-01-22',
      itemsCount: 2,
      status: 'Sent',
      responseDeadline: '2024-01-30',
    },
  ],
  11: [
    {
      id: 1,
      vendorName: 'Ocean Fresh Suppliers',
      sentOn: '2024-03-06',
      itemsCount: 5,
      status: 'Viewed',
      responseDeadline: '2024-03-14',
    },
    {
      id: 2,
      vendorName: 'Grain & Co. Maritime',
      sentOn: '2024-03-06',
      itemsCount: 3,
      status: 'Sent',
      responseDeadline: '2024-03-14',
    },
    {
      id: 3,
      vendorName: 'AquaMarine Beverages',
      sentOn: '2024-03-06',
      itemsCount: 1,
      status: 'Responded',
      responseDeadline: '2024-03-14',
    },
  ],
};

// ─── Vendor responses per requisition ─────────────────────────────────────────

export const MOCK_RESPONSES: Record<number, VendorResponse[]> = {
  1: [
    {
      id: 1,
      vendorName: 'Marine Supplies Ltd',
      respondedOn: '2024-01-19',
      itemsQuoted: 3,
      totalValue: '$4,250',
      status: 'Under Review',
    },
  ],
  2: [
    {
      id: 1,
      vendorName: 'SeaSafe Co.',
      respondedOn: '2024-01-24',
      itemsQuoted: 2,
      totalValue: '$1,890',
      status: 'Accepted',
    },
  ],
  11: [
    {
      id: 1,
      vendorName: 'AquaMarine Beverages',
      respondedOn: '2024-03-08',
      itemsQuoted: 1,
      totalValue: '$620',
      status: 'Under Review',
    },
  ],
};

// ─── Data-access helpers ──────────────────────────────────────────────────────

/**
 * Look up a requisition by numeric ID.
 * Returns undefined when the ID is not found (triggers the 404 state).
 */
export function getRequisitionById(id: number): RequisitionDetail | undefined {
  return MOCK_REQUISITION_DETAILS.find((r) => r.id === id);
}

/**
 * Look up a requisition by its display name (case-insensitive, trimmed).
 * Used as a fallback when the numeric ID is absent from the URL — which
 * happens because the current routing service does not preserve the :id
 * path segment in tabParam for non-tenant routes.
 */
export function getRequisitionByName(name: string): RequisitionDetail | undefined {
  const normalised = name.trim().toLowerCase();
  return MOCK_REQUISITION_DETAILS.find(
    (r) => r.requisitionName.trim().toLowerCase() === normalised,
  );
}

/**
 * Returns the previous and next requisition IDs relative to the given ID.
 * Used by the header navigation arrows.
 */
export function getAdjacentIds(id: number): { prevId: number | null; nextId: number | null } {
  const index = MOCK_REQUISITION_DETAILS.findIndex((r) => r.id === id);
  if (index === -1) return { prevId: null, nextId: null };
  const prevId = index > 0 ? MOCK_REQUISITION_DETAILS[index - 1].id : null;
  const nextId =
    index < MOCK_REQUISITION_DETAILS.length - 1
      ? MOCK_REQUISITION_DETAILS[index + 1].id
      : null;
  return { prevId, nextId };
}

/** Returns items for a given requisition, or [] when none exist. */
export function getItemsForRequisition(id: number): RequisitionItem[] {
  return MOCK_ITEMS[id] ?? [];
}

/** Returns enquiries for a given requisition, or [] when none exist. */
export function getEnquiriesForRequisition(id: number): VendorEnquiry[] {
  return MOCK_ENQUIRIES[id] ?? [];
}

/** Returns vendor responses for a given requisition, or [] when none exist. */
export function getResponsesForRequisition(id: number): VendorResponse[] {
  return MOCK_RESPONSES[id] ?? [];
}
