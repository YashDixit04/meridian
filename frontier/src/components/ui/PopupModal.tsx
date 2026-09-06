/**
 * PopupModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Purpose-built popup variant for sending vendor enquiries from the
 * Requisition Details page.
 *
 * This is NOT driven by `GenericModal`'s config API — it is a standalone
 * popup variant tailored specifically to the vendor enquiry flow.
 *
 * Backend Integration (future):
 *  - Wire the "Send Enquiries" button to POST /requisitions/:id/enquiries
 *  - Replace the static vendor list with a real API fetch (GET /vendors)
 *  - Track per-item check state and send only selected item IDs
 *
 * Closes on:
 *  - Backdrop click
 *  - Escape key
 *  - "Cancel" button
 *  - "Send Enquiries" button (after action)
 */

import React, { useEffect, useState } from 'react';
import { X, Send, Search, CheckSquare, Square, Store } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Heading6, BodySm, Caption, LabelSm, InputLabel } from '@/components/ui/Typography';
import { RequisitionItem } from '@/data/requisitionMockData';

// ─── Static placeholder vendor list ──────────────────────────────────────────
// Replace with a real API call (GET /vendors) when the backend is ready.

const PLACEHOLDER_VENDORS = [
  { id: 'v1', name: 'Ocean Fresh Suppliers' },
  { id: 'v2', name: 'Grain & Co. Maritime' },
  { id: 'v3', name: 'AquaMarine Beverages' },
  { id: 'v4', name: 'Maritime Dairy Co.' },
  { id: 'v5', name: 'Global Protein Supplies' },
  { id: 'v6', name: 'ShipCare Essentials' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PopupModalProps {
  /** Whether the popup is visible. */
  isOpen: boolean;
  /** Called when the popup should close. */
  onClose: () => void;
  /** Items to display in the checklist (pre-selected by default). */
  items: RequisitionItem[];
  /** Requisition display name — shown in the popup header. */
  requisitionName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  items,
  requisitionName,
}) => {
  // ── Local state ─────────────────────────────────────────────────────────────
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set());
  const [vendorSearch, setVendorSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Pre-select all items on open
  useEffect(() => {
    if (isOpen) {
      setSelectedItemIds(new Set(items.map((i) => i.id)));
      setSelectedVendorIds(new Set());
      setVendorSearch('');
    }
  }, [isOpen, items]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const toggleItem = (id: number) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllItems = () => {
    setSelectedItemIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id)),
    );
  };

  const toggleVendor = (id: string) => {
    setSelectedVendorIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredVendors = PLACEHOLDER_VENDORS.filter((v) =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()),
  );

  const canSend = selectedItemIds.size > 0 && selectedVendorIds.size > 0;

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    // TODO: replace with POST /requisitions/:id/enquiries
    await new Promise((res) => setTimeout(res, 800));
    setIsSending(false);
    onClose();
  };

  const allItemsSelected = selectedItemIds.size === items.length && items.length > 0;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-enquiry-popup-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div className="relative bg-white dark:bg-grey-100 border border-grey-200 dark:border-grey-400 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[88vh] w-full max-w-xl mx-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-grey-100 dark:border-grey-800">
          <div className="flex flex-col gap-1">
            {/* Icon row */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-xl bg-primary-soft dark:bg-primary/10 flex items-center justify-center">
                <Send size={16} className="text-primary" />
              </div>
              <div id="vendor-enquiry-popup-title">
                <Heading6 className="text-grey-900 dark:text-white">
                  Send Vendor Enquiries
                </Heading6>
              </div>
            </div>
            {requisitionName && (
              <Caption className="text-grey-500 dark:text-grey-400">
                Requisition: <span className="font-medium text-grey-700 dark:text-grey-300">{requisitionName}</span>
              </Caption>
            )}
          </div>

          <Button variant="ghost" color="grey" size="small" iconOnly onClick={onClose} aria-label="Close popup">
            <X size={18} />
          </Button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {/* ── Section 1: Select Items ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <InputLabel className="text-grey-700 dark:text-grey-300 font-semibold">
                Select Items
                <span className="ml-2 text-grey-400 dark:text-grey-500 font-normal">
                  ({selectedItemIds.size}/{items.length} selected)
                </span>
              </InputLabel>

              {/* Select All toggle */}
              <button
                onClick={toggleAllItems}
                className="flex items-center gap-1.5 text-primary hover:text-primary-active transition-colors text-[12px] font-medium"
              >
                {allItemsSelected ? (
                  <CheckSquare size={13} />
                ) : (
                  <Square size={13} />
                )}
                {allItemsSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar-thin">
              {items.map((item) => {
                const checked = selectedItemIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                      border transition-colors duration-150
                      ${checked
                        ? 'bg-primary-soft dark:bg-primary/10 border-primary/30'
                        : 'bg-grey-50 dark:bg-grey-800/50 border-transparent hover:border-grey-200 dark:hover:border-grey-700'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                    />
                    {checked ? (
                      <CheckSquare size={15} className="text-primary flex-shrink-0" />
                    ) : (
                      <Square size={15} className="text-grey-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <BodySm className="text-grey-800 dark:text-grey-200 font-medium truncate">
                        {item.productName}
                      </BodySm>
                    </div>
                    <Caption className="text-grey-400 dark:text-grey-500 flex-shrink-0 font-mono">
                      {item.referenceCode}
                    </Caption>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Section 2: Select Vendors ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <InputLabel className="text-grey-700 dark:text-grey-300 font-semibold">
                Select Vendors
                <span className="ml-2 text-grey-400 dark:text-grey-500 font-normal">
                  ({selectedVendorIds.size} selected)
                </span>
              </InputLabel>
            </div>

            {/* Vendor search */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400" />
              <input
                type="text"
                placeholder="Search vendors…"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="
                  w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-grey-200 dark:border-grey-700
                  bg-white dark:bg-grey-900 text-grey-800 dark:text-grey-200
                  placeholder-grey-400 dark:placeholder-grey-600
                  focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50
                  transition-colors
                "
              />
            </div>

            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar-thin">
              {filteredVendors.length === 0 ? (
                <div className="text-center py-4">
                  <Caption className="text-grey-400 dark:text-grey-500">No vendors found.</Caption>
                </div>
              ) : (
                filteredVendors.map((vendor) => {
                  const checked = selectedVendorIds.has(vendor.id);
                  return (
                    <label
                      key={vendor.id}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                        border transition-colors duration-150
                        ${checked
                          ? 'bg-success-soft dark:bg-success/10 border-success/30'
                          : 'bg-grey-50 dark:bg-grey-800/50 border-transparent hover:border-grey-200 dark:hover:border-grey-700'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleVendor(vendor.id)}
                      />
                      {checked ? (
                        <CheckSquare size={15} className="text-success flex-shrink-0" />
                      ) : (
                        <Square size={15} className="text-grey-400 flex-shrink-0" />
                      )}
                      <div className="h-6 w-6 rounded-full bg-grey-200 dark:bg-grey-700 flex items-center justify-center flex-shrink-0">
                        <Store size={11} className="text-grey-500 dark:text-grey-400" />
                      </div>
                      <LabelSm className="text-grey-700 dark:text-grey-300 flex-1 truncate">
                        {vendor.name}
                      </LabelSm>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-grey-100 dark:border-grey-800 flex items-center justify-between gap-3">
          {/* Selection summary */}
          <Caption className="text-grey-400 dark:text-grey-500">
            {selectedItemIds.size} item{selectedItemIds.size !== 1 ? 's' : ''} · {selectedVendorIds.size} vendor{selectedVendorIds.size !== 1 ? 's' : ''}
          </Caption>

          <div className="flex items-center gap-2">
            <Button variant="outline" color="grey" size="small" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              size="small"
              leftIcon={<Send size={13} />}
              onClick={handleSend}
              disabled={!canSend || isSending}
            >
              {isSending ? 'Sending…' : 'Send Enquiries'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
