import React, { useMemo, useState } from 'react';
import RequisitionDetailHeader from './RequisitionDetails/RequisitionDetailHeader';
import RequisitionTabs from './RequisitionDetails/RequisitionTabs';
import RequisitionSidebar from './RequisitionDetails/RequisitionSidebar';
import {
  getRequisitionById,
  getRequisitionByName,
  getAdjacentIds,
  getItemsForRequisition,
  getEnquiriesForRequisition,
  getResponsesForRequisition,
} from '@/data/requisitionMockData';
import Button from '@/components/ui/Button';
import RequisitionBottomBar from '@/components/common/RequisitionBottomBar';
import PopupModal from '@/components/ui/PopupModal';


// ─── Props ────────────────────────────────────────────────────────────────────

interface RequisitionDetailsPageProps {
  /**
   * Numeric ID from the URL path segment (e.g. "/requisition-details/1").
   *
   * ⚠ ROUTING NOTE: The current routing service (routingService.ts) does NOT
   * preserve path segments after the first segment for non-tenant routes.
   * `pathToLegacyTab('/requisition-details/1')` → tabBase='requisitionDetails',
   * tabParam=undefined.  The numeric ID is therefore ALWAYS missing here.
   *
   * Resolution: we fall back to name-based lookup using the `requisitionName`
   * prop (which IS preserved via the ?name= query parameter in App.tsx).
   * When the routing service is updated to preserve the segment this prop will
   * automatically start working correctly.
   */
  requisitionId?: string;

  /**
   * Display name decoded from `?name=` query parameter — used as the primary
   * lookup key until the routing service is fixed to pass the numeric ID.
   */
  requisitionName?: string;

  onNavigate?: (target: string) => void;
}

// ─── 404 fallback state ───────────────────────────────────────────────────────

interface NotFoundProps {
  displayName: string;
  onNavigate?: (target: string) => void;
}

const NotFoundState: React.FC<NotFoundProps> = ({ displayName, onNavigate }) => (
  <main className="flex-1 mr-2 rounded-xl border border-[#DBDFE9] dark:border-grey-200 bg-white dark:bg-grey-100 overflow-y-auto shadow-sm flex flex-col">
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <p className="text-[72px] font-bold leading-none text-grey-100 dark:text-grey-800 select-none">
          404
        </p>
        <h2 className="text-xl font-semibold text-grey-900 dark:text-white mt-2 mb-2">
          Requisition not found
        </h2>
        <p className="text-sm text-grey-500 dark:text-grey-400 mb-6">
          {displayName
            ? `"${displayName}" could not be found. It may have been deleted or the link is invalid.`
            : 'The requested requisition could not be found.'}
        </p>
        <Button
          variant="outline"
          color="primary"
          size="small"
          onClick={() => onNavigate?.('/tenant/orders')}
        >
          ← Back to Requisitions
        </Button>
      </div>
    </div>
  </main>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const RequisitionDetailsPage: React.FC<RequisitionDetailsPageProps> = ({
  requisitionId,
  requisitionName = '',
  onNavigate,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /** Controls the Vendor Enquiry popup visibility */
  const [isEnquiryPopupOpen, setIsEnquiryPopupOpen] = useState(false);

  /**
   * Resolve the requisition using a two-step strategy:
   *
   * Step 1 — ID lookup (works once routing service is fixed):
   *   Parse requisitionId as a number and search by ID.
   *
   * Step 2 — Name fallback (current working path):
   *   The routing service strips the numeric ID segment, so tabParam is
   *   undefined in App.tsx. However, App.tsx DOES decode `?name=` from
   *   location.search and passes it as requisitionName. We use that for
   *   a case-insensitive name lookup.
   *
   * This means "Engine Spare Parts Q1" resolves correctly from the ?name=
   * query param even when requisitionId is undefined.
   */
  const requisition = useMemo(() => {
    // Step 1: try numeric ID
    const numericId = parseInt(requisitionId ?? '', 10);
    if (!isNaN(numericId)) {
      const byId = getRequisitionById(numericId);
      if (byId) return byId;
    }

    // Step 2: try name-based lookup
    if (requisitionName.trim()) {
      return getRequisitionByName(requisitionName);
    }

    return undefined;
  }, [requisitionId, requisitionName]);

  const { prevId, nextId } = useMemo(
    () => (requisition ? getAdjacentIds(requisition.id) : { prevId: null, nextId: null }),
    [requisition],
  );

  const items = useMemo(
    () => (requisition ? getItemsForRequisition(requisition.id) : []),
    [requisition],
  );

  const enquiries = useMemo(
    () => (requisition ? getEnquiriesForRequisition(requisition.id) : []),
    [requisition],
  );

  const responses = useMemo(
    () => (requisition ? getResponsesForRequisition(requisition.id) : []),
    [requisition],
  );

  // ── Graceful 404 state ────────────────────────────────────────────────────

  if (!requisition) {
    return <NotFoundState displayName={requisitionName} onNavigate={onNavigate} />;
  }

  // ── Full detail view ──────────────────────────────────────────────────────

  return (
    <>
      {/* ── Vendor Enquiry Popup ── */}
      <PopupModal
        isOpen={isEnquiryPopupOpen}
        onClose={() => setIsEnquiryPopupOpen(false)}
        items={items}
        requisitionName={requisition.requisitionName}
      />

      <div className="flex flex-col flex-1 min-h-0 mr-2 gap-2">
        {/* ── Main content row (left panel + sidebar) ── */}
        <div className="flex flex-row gap-3 flex-1 min-h-0">
          {/* ── Left column: ~72% — sticky header + scrollable tabs ── */}
          <main
            className="
              flex flex-col flex-1 min-w-0
              rounded-xl border border-[#DBDFE9] dark:border-grey-200
              bg-white dark:bg-grey-100
              overflow-hidden shadow-sm
            "
          >
            {/* Sticky header — position: sticky is set inside the component */}
            <RequisitionDetailHeader
              requisition={requisition}
              prevId={prevId}
              nextId={nextId}
              onNavigate={onNavigate}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Scrollable body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <RequisitionTabs
                items={items}
                enquiries={enquiries}
                responses={responses}
              />
            </div>
          </main>

          {/* ── Right column: ~28% — sticky sidebar ── */}
          {isSidebarOpen && (
            <aside
              className="
                flex-shrink-0 w-[28%] min-w-[260px] max-w-[340px]
                min-h-0 overflow-hidden
              "
            >
              <RequisitionSidebar status={requisition.status} />
            </aside>
          )}
        </div>

        {/* ── Bottom Bar ── */}
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
      </div>
    </>
  );
};

export default RequisitionDetailsPage;
