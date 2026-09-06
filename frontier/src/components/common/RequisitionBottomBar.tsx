/**
 * RequisitionBottomBar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A sticky bottom bar for the Requisition Details page.
 *
 * Variants:
 *  • info    – Read-only summary strip (no CTA button).
 *  • action  – Left: total item count. Right: optional CTA button + expand icon.
 *  • summary – Displays key stats (items, vendors, value) with optional CTA.
 *
 * Expand / Collapse:
 *  Clicking the ChevronUp / ChevronDown icon toggles an expanded panel that
 *  slides into view above the collapsed strip. The panel content is passed via
 *  the `expandedContent` prop.
 *
 * Design tokens used:
 *  All colours follow the project's Tailwind token map in `style/constants.ts`.
 *  Typography uses shared components from `@/components/ui/Typography`.
 */

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Package } from 'lucide-react';
import { BodySm, LabelSm, Caption } from '@/components/ui/Typography';
import Button from '../ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BottomBarVariant = 'info' | 'action' | 'summary';

export interface SummaryDataItem {
  label: string;
  value: string | number;
}

export interface RequisitionBottomBarProps {
  /**
   * Controls the layout and which slots are rendered.
   *  - `info`    : read-only count strip, expandable.
   *  - `action`  : count + optional action button, expandable.
   *  - `summary` : stat pills + optional action button, expandable.
   */
  variant: BottomBarVariant;

  /** Total number of line items in the requisition. */
  totalItems: number;

  /** Optional requisition display name — shown in info / summary expanded view. */
  requisitionName?: string;

  /**
   * Rendered on the right side of the bar (typically a `<Button>`).
   * Only visible when `variant === 'action'` or `variant === 'summary'`.
   */
  actionButton?: React.ReactNode;

  /**
   * Key-value pairs shown as stat pills when `variant === 'summary'`.
   * Example: [{ label: 'Vendors', value: 3 }, { label: 'Total Value', value: '$12,400' }]
   */
  summaryData?: SummaryDataItem[];

  /**
   * Content rendered inside the expanded panel above the collapsed strip.
   * If omitted the expand toggle is still shown but the panel body is empty.
   */
  expandedContent?: React.ReactNode;
}

// ─── Variant accent colours (left border + label) ─────────────────────────────

const VARIANT_ACCENT: Record<BottomBarVariant, string> = {
  info: 'border-m-info',
  action: 'border-m-primary',
  summary: 'border-m-success',
};

const VARIANT_LABEL_COLOR: Record<BottomBarVariant, string> = {
  info: 'text-info',
  action: 'text-primary',
  summary: 'text-success',
};

// ─── Component ────────────────────────────────────────────────────────────────

const RequisitionBottomBar: React.FC<RequisitionBottomBarProps> = ({
  variant,
  totalItems,
  requisitionName,
  actionButton,
  summaryData,
  expandedContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const accentBorder = VARIANT_ACCENT[variant];
  const labelColor = VARIANT_LABEL_COLOR[variant];

  // ── Expanded panel ──────────────────────────────────────────────────────────

  const renderExpandedPanel = () => (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}
      `}
    >
      <div className="border-t border-grey-200 dark:border-grey-700 px-5 py-4">
        {expandedContent ? (
          expandedContent
        ) : (
          /* Default expanded content when nothing is passed */
          <div className="flex flex-col gap-2">
            {requisitionName && (
              <div className="flex items-center gap-2">
                <Caption className="text-grey-500 dark:text-grey-400">Requisition:</Caption>
                <Caption className="text-grey-800 dark:text-grey-200 font-medium">
                  {requisitionName}
                </Caption>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Caption className="text-grey-500 dark:text-grey-400">Total Products:</Caption>
              <Caption className={`font-semibold ${labelColor}`}>{totalItems}</Caption>
            </div>
            {summaryData?.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Caption className="text-grey-500 dark:text-grey-400">{s.label}:</Caption>
                <Caption className="text-grey-800 dark:text-grey-200 font-medium">
                  {s.value}
                </Caption>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Summary stat pills (summary variant) ────────────────────────────────────

  const renderSummaryPills = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 bg-grey-100 dark:bg-grey-800 rounded-full px-3 py-1">
        <Package size={13} className="text-grey-500 dark:text-grey-400" />
        <Caption className="text-grey-700 dark:text-grey-300 font-medium">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Caption>
      </div>
      {summaryData?.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 bg-grey-100 dark:bg-grey-800 rounded-full px-3 py-1"
        >
          <Caption className="text-grey-500 dark:text-grey-400">{s.label}:</Caption>
          <Caption className="text-grey-700 dark:text-grey-300 font-semibold">{s.value}</Caption>
        </div>
      ))}
    </div>
  );

  // ── Collapsed strip ─────────────────────────────────────────────────────────

  const renderCollapsedLeft = () => {
    if (variant === 'summary') {
      return renderSummaryPills();
    }

    // info | action variants
    return (
      <div className="flex items-center gap-2">
        <Package size={15} className={labelColor} />
        <LabelSm className="text-grey-600 dark:text-grey-300">
          Total Products:
        </LabelSm>
        <LabelSm className={`font-bold ${labelColor}`}>
          {totalItems}
        </LabelSm>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`
        rounded-xl border border-grey-200 dark:border-grey-200
        bg-white dark:bg-grey-100
        mb-1
        border-[1px] ${accentBorder}
        overflow-hidden
        transition-all duration-200
      `}
      role="complementary"
      aria-label="Requisition bottom bar"
    >
      {/* ── Expanded Panel (slides above the collapsed strip) ── */}
      {renderExpandedPanel()}

      {/* ── Collapsed strip ── */}
      <div className="flex items-center justify-between h-14 px-5 gap-4">
        {/* Left: count / summary pills */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {renderCollapsedLeft()}
        </div>

        {/* Right: action button + expand toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* CTA button — only for action & summary variants */}
          {(variant === 'action' || variant === 'summary') && actionButton}

          {/* Expand / Collapse toggle */}
          {/* Expand / Collapse toggle — uses ghost/grey = closest to "secondary" in this design system */}
          <Button
            variant="ghost"
            color="grey"
            size="small"
            iconOnly
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse bottom bar' : 'Expand bottom bar'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown size={16} strokeWidth={2.2} />
            ) : (
              <ChevronUp size={16} strokeWidth={2.2} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequisitionBottomBar;
