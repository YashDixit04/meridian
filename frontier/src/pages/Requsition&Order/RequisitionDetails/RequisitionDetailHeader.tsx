import React from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DynamicBreadcrumb from '@/components/common/Breadcrub/dynamicbreadcrub';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Share2,
  MoreHorizontal,
  MapPin,
  Calendar,
  Hash,
  AlertTriangle,
  Anchor,
  Clock,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { RequisitionDetail, RequisitionStatus, Priority } from '@/data/requisitionMockData';

// ─── Status colour map ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PRIORITY_COLOR: Record<Priority, 'danger' | 'warning' | 'info' | 'light'> = {
  Urgent: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'light',
};

// ─── Tiny format helpers ──────────────────────────────────────────────────────

const fmt = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTs = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Dot separator ────────────────────────────────────────────────────────────

const Dot: React.FC = () => (
  <span className="text-grey-300 dark:text-grey-600 select-none mx-0.5">·</span>
);

// ─── Inline meta item ────────────────────────────────────────────────────────

const Meta: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <span className="inline-flex items-center gap-1 text-grey-500 dark:text-grey-400">
    <span className="text-grey-400 dark:text-grey-500">{icon}</span>
    <span>{text}</span>
  </span>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface RequisitionDetailHeaderProps {
  requisition: RequisitionDetail;
  prevId: number | null;
  nextId: number | null;
  onNavigate?: (target: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RequisitionDetailHeader: React.FC<RequisitionDetailHeaderProps> = ({
  requisition,
  prevId,
  nextId,
  onNavigate,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const breadcrumbItems = [
    { label: 'Home', href: '#', onClick: () => onNavigate?.('/') },
    { label: 'Requisition & Orders', onClick: () => onNavigate?.('/tenant/orders') },
    { label: requisition.requisitionName, active: true },
  ];

  const timestamp = requisition.updatedOn
    ? `Updated ${fmtTs(requisition.updatedOn)}`
    : `Created ${fmtTs(requisition.createdOn)}`;

  const navBtn = (disabled: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-7 w-7 rounded-md border border-grey-200 dark:border-grey-700 flex items-center justify-center text-grey-500 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  );

  const iconBtn = (icon: React.ReactNode, title: string, onClick?: () => void) => (
    <button
      onClick={onClick}
      title={title}
      className="h-7 w-7 rounded-md border border-grey-200 dark:border-grey-700 flex items-center justify-center text-grey-500 hover:text-grey-700 dark:hover:text-white transition-colors"
    >
      {icon}
    </button>
  );

  return (
    <div className="sticky top-0 bg-white dark:bg-grey-100 px-5 pt-3 pb-2">

      {/* Row 1 — breadcrumb (left) + controls (right) */}
      <div className="flex items-center justify-between mb-2">
        <DynamicBreadcrumb items={breadcrumbItems} />

        <div className="flex items-center gap-1.5">
          {navBtn(prevId === null, () => prevId !== null && onNavigate?.(`/requisition-details/${prevId}?name=${encodeURIComponent(requisition.requisitionName)}`), <ChevronLeft size={13} />, 'Previous')}
          {navBtn(nextId === null, () => nextId !== null && onNavigate?.(`/requisition-details/${nextId}?name=${encodeURIComponent(requisition.requisitionName)}`), <ChevronRight size={13} />, 'Next')}
          {iconBtn(<Share2 size={13} />, 'Share')}
          {iconBtn(<MoreHorizontal size={13} />, 'More options')}
          {iconBtn(isSidebarOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />, 'Toggle sidebar', onToggleSidebar)}
          <Button variant="outline" color="primary" size="medium" className="h-7 px-2.5 text-xs gap-1">
            <Pencil size={11} />
            Edit
          </Button>
        </div>
      </div>

      {/* Row 2 — title + badges, all on one line */}
      <div className="flex flex-wrap items-center gap-2 m-4">
        <span className="text-[18px] font-semibold text-grey-900 dark:text-white leading-tight">
          {requisition.requisitionName}
        </span>
        <Badge variant="soft" color={STATUS_COLOR[requisition.status] ?? 'light'} className="rounded-full px-2.5 text-[11px] py-0.5">
          {requisition.status}
        </Badge>
        <Badge variant="soft" color="info" className="rounded-full px-2.5 text-[11px] py-0.5">
          {requisition.categoryName}
        </Badge>
      </div>

      {/* Row 3 — all meta in one tight line, separated by dots */}
      <div className="flex flex-wrap items-center gap-6 text-[12px] pb-2.6">
        <Meta icon={<Hash size={11} />} text={requisition.referenceId} />
        {/* <Dot /> */}
        <Meta icon={<Calendar size={11} />} text={`ETA ${fmt(requisition.eta)}`} />
        {/* <Dot /> */}
        <Meta icon={<Calendar size={11} />} text={`ETD ${fmt(requisition.etd)}`} />
        {/* <Dot /> */}
        <Meta icon={<MapPin size={11} />} text={requisition.deliveryPort} />
        {/* <Dot /> */}
        <Meta icon={<AlertTriangle size={11} />} text={requisition.priority} />
        {/* <Dot /> */}
        <Meta icon={<Anchor size={11} />} text={requisition.vesselName} />
        {/* <Dot /> */}
        <Meta icon={<Clock size={11} />} text={timestamp} />
      </div>
    </div>
  );
};

export default RequisitionDetailHeader;
