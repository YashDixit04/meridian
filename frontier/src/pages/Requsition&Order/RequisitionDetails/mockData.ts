/**
 * mockData.ts — Re-exports all data access helpers and mock arrays from
 * the centralised data file so that existing internal component imports
 * (RequisitionTabs, ItemsTab, etc.) continue to resolve without changes.
 *
 * Source of truth: b2b2/data/requisitionMockData.ts
 */
export {
  MOCK_REQUISITION_DETAILS,
  MOCK_ITEMS,
  MOCK_ENQUIRIES,
  MOCK_RESPONSES,
  STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP,
  getRequisitionById,
  getRequisitionByName,
  getAdjacentIds,
  getItemsForRequisition,
  getEnquiriesForRequisition,
  getResponsesForRequisition,
} from '@/data/requisitionMockData';
