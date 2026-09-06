/**
 * types.ts — Re-exports all RequisitionDetails types from the centralised
 * data file so that any component importing from this path keeps working
 * without changes.
 *
 * Source of truth: b2b2/data/requisitionMockData.ts
 */
export type {
  RequisitionStatus,
  Priority,
  TabKey,
  RequisitionDetail,
  RequisitionItem,
  VendorEnquiry,
  VendorResponse,
} from '@/data/requisitionMockData';
