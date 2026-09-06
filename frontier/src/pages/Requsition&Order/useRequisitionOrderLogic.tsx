import React, { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Column } from '@/components/common/table/table';
import { ModalConfig } from '@/components/ui/GenericModal';
import { Flag } from 'lucide-react';
import reqConfig from '@/data/requisitionModalConfig.json';

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface RequisitionOrder {
  id: number;
  requisitionName: string;
  categoryName: string;
  vesselName: string;
  status: RequisitionStatus;
  createdBy: string;
  createdOn: string;
}

// ─── Status badge color map ───────────────────────────────────────────────────

const statusColorMap: Record<RequisitionStatus, 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'dark' | 'light'> = {
  'Draft':            'light',
  'Proceed':          'success',
  'Pending approval': 'warning',
  'Awaiting Vendor':  'info',
  'Proceed Further':  'primary',
  'Rejected by PO':   'danger',
  'Order Placed':     'dark',
  'Out For delivery': 'info',
  'Delivered':        'success',
};

// ─── Static mock data ─────────────────────────────────────────────────────────

export const MOCK_REQUISITIONS: RequisitionOrder[] = [
  {
    id: 1,
    requisitionName: 'Engine Spare Parts Q1',
    categoryName: 'Engine',
    vesselName: 'MSC Neptune',
    status: 'Draft',
    createdBy: 'John Carter',
    createdOn: '2024-01-10',
  },
  {
    id: 2,
    requisitionName: 'Deck Safety Equipment',
    categoryName: 'Safety',
    vesselName: 'MSC Titan',
    status: 'Proceed',
    createdBy: 'Emma Watson',
    createdOn: '2024-01-15',
  },
  {
    id: 3,
    requisitionName: 'Navigation System Upgrade',
    categoryName: 'Navigation',
    vesselName: 'MSC Voyager',
    status: 'Pending approval',
    createdBy: 'Sarah Miller',
    createdOn: '2024-01-20',
  },
  {
    id: 4,
    requisitionName: 'Fresh Provisions Feb',
    categoryName: 'Provisions',
    vesselName: 'MSC Pioneer',
    status: 'Awaiting Vendor',
    createdBy: 'David Chen',
    createdOn: '2024-02-01',
  },
  {
    id: 5,
    requisitionName: 'Lubricants Replenishment',
    categoryName: 'Lubricants',
    vesselName: 'MSC Endeavour',
    status: 'Proceed Further',
    createdBy: 'Maria Garcia',
    createdOn: '2024-02-05',
  },
  {
    id: 6,
    requisitionName: 'Communication Equipment',
    categoryName: 'Communication',
    vesselName: 'MSC Demo',
    status: 'Rejected by PO',
    createdBy: 'James Wilson',
    createdOn: '2024-02-10',
  },
  {
    id: 7,
    requisitionName: 'Chemical Stores Q1',
    categoryName: 'Chemicals',
    vesselName: 'MSC Neptune',
    status: 'Order Placed',
    createdBy: 'Lisa Thompson',
    createdOn: '2024-02-14',
  },
  {
    id: 8,
    requisitionName: 'Paint & Coating Supplies',
    categoryName: 'Paints',
    vesselName: 'MSC Titan',
    status: 'Out For delivery',
    createdBy: 'John Carter',
    createdOn: '2024-02-18',
  },
  {
    id: 9,
    requisitionName: 'Dry Stores March Batch',
    categoryName: 'Stores',
    vesselName: 'MSC Voyager',
    status: 'Delivered',
    createdBy: 'Emma Watson',
    createdOn: '2024-02-22',
  },
  {
    id: 10,
    requisitionName: 'Deck Equipment Restock',
    categoryName: 'Deck',
    vesselName: 'MSC Pioneer',
    status: 'Draft',
    createdBy: 'Sarah Miller',
    createdOn: '2024-03-01',
  },
];

// ─── Status filter options ────────────────────────────────────────────────────

export const STATUS_FILTER_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Proceed', label: 'Proceed' },
  { value: 'Pending approval', label: 'Pending approval' },
  { value: 'Awaiting Vendor', label: 'Awaiting Vendor' },
  { value: 'Proceed Further', label: 'Proceed Further' },
  { value: 'Rejected by PO', label: 'Rejected by PO' },
  { value: 'Order Placed', label: 'Order Placed' },
  { value: 'Out For delivery', label: 'Out For delivery' },
  { value: 'Delivered', label: 'Delivered' },
];

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export interface UseRequisitionOrderLogicReturn {
  /** Filtered dataset to feed into the table */
  filteredData: RequisitionOrder[];
  /** Currently selected status filter value */
  selectedStatus: string;
  /** Change handler for status filter */
  onStatusChange: (val: string | string[]) => void;
  /** Whether the Create Requisition modal is open */
  isModalOpen: boolean;
  /** Open the Create Requisition modal */
  openModal: () => void;
  /** Close the Create Requisition modal */
  closeModal: () => void;
  /** Fully-assembled ModalConfig for GenericModal */
  modalConfig: ModalConfig;
  /** Column definitions for the table */
  columns: Column<RequisitionOrder>[];
  /** Row-click handler */
  handleRowClick: (row: RequisitionOrder, onNavigate?: (target: string) => void) => void;
  /** Edit handler (called from action cell) */
  handleEdit: (row: RequisitionOrder, event: React.MouseEvent) => void;
  /** Delete handler (called from action cell) */
  handleDelete: (row: RequisitionOrder, event: React.MouseEvent) => void;
}

export function useRequisitionOrderLogic(
  onNavigate?: (target: string) => void,
): UseRequisitionOrderLogicReturn {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requisitions, setRequisitions] = useState<RequisitionOrder[]>(MOCK_REQUISITIONS);

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredData = useMemo<RequisitionOrder[]>(() => {
    if (selectedStatus === 'All') return requisitions;
    return requisitions.filter((r) => r.status === selectedStatus);
  }, [requisitions, selectedStatus]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onStatusChange = (val: string | string[]) => {
    setSelectedStatus(typeof val === 'string' ? val : (val[0] ?? 'All'));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleRowClick = (row: RequisitionOrder) => {
    if (onNavigate) {
      onNavigate(`/requisition-details/${row.id}?name=${encodeURIComponent(row.requisitionName)}`);
    }
  };

  const handleEdit = (row: RequisitionOrder, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Edit requisition:', row.id);
  };

  const handleDelete = (row: RequisitionOrder, event: React.MouseEvent) => {
    event.stopPropagation();
    const confirmed = window.confirm(
      `Delete requisition "${row.requisitionName}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setRequisitions((prev) => prev.filter((r) => r.id !== row.id));
  };

  // ── Column definitions (JSX inside cells — requires .tsx extension) ────────

  const columns: Column<RequisitionOrder>[] = useMemo(
    () => [
      {
        header: '#',
        accessorKey: 'id',
        cell: (row) => (
          <span className="text-grey-500 dark:text-grey-400 font-mono text-xs">{row.id}</span>
        ),
      },
      {
        header: 'Requisition Name',
        accessorKey: 'requisitionName',
        cell: (row) => (
          <span className="font-medium text-grey-900 dark:text-white">{row.requisitionName}</span>
        ),
      },
      {
        header: 'Category Name',
        accessorKey: 'categoryName',
        cell: (row) => (
          <Badge variant="soft" color="info" className="rounded-full px-3">
            {row.categoryName}
          </Badge>
        ),
      },
      {
        header: 'Vessel Name',
        accessorKey: 'vesselName',
        cell: (row) => (
          <span className="text-grey-700 dark:text-grey-300">{row.vesselName}</span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (row) => (
          <Badge
            variant="soft"
            color={statusColorMap[row.status] ?? 'light'}
            className="rounded-full px-3 whitespace-nowrap"
          >
            {row.status}
          </Badge>
        ),
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy',
        cell: (row) => (
          <span className="text-grey-700 dark:text-grey-300">{row.createdBy}</span>
        ),
      },
      {
        header: 'Created On',
        accessorKey: 'createdOn',
        cell: (row) => (
          <span className="text-grey-500 dark:text-grey-400 text-sm">{row.createdOn}</span>
        ),
      },
      {
        header: 'Actions',
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => handleEdit(row, e)}
              className="inline-flex items-center gap-1 rounded-md border border-grey-200 dark:border-grey-700 px-2 py-1 text-xs font-medium text-grey-700 dark:text-grey-300 hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              onClick={(e) => handleDelete(row, e)}
              className="inline-flex items-center gap-1 rounded-md border border-danger/20 px-2 py-1 text-xs font-medium text-danger hover:bg-danger-soft transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        ),
      },
    ],
    // Columns depend on the delete handler which captures `setRequisitions` — stable ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Modal config ──────────────────────────────────────────────────────────

  const modalConfig: ModalConfig = useMemo(() => {
    const tabs = (reqConfig as any).tabs.map((tab: any) => tab);
    return {
      variant: 'stepper' as const,
      isOpen: isModalOpen,
      onClose: closeModal,
      title: 'Create New Requisition',
      subtitle: 'Provide the necessary details to initiate a new requisition request.',
      icon: <Flag className="h-6 w-6" />,
      tabs,
      actions: [
        {
          id: 'back',
          label: 'Back',
          variant: 'outline' as const,
          color: 'grey' as const,
          onClick: () => closeModal(),
        },
        {
          id: 'continue',
          label: 'Create Requisition',
          variant: 'solid' as const,
          color: 'primary' as const,
          onClick: (data: Record<string, any>) => {
            const newReq: RequisitionOrder = {
              id: Date.now(),
              requisitionName: data.requisitionName || 'New Requisition',
              categoryName: data.categoryType || 'General',
              vesselName: 'MSC Demo',
              status: 'Draft',
              createdBy: data.creatorName || 'Current User',
              createdOn: new Date().toISOString().slice(0, 10),
            };
            setRequisitions((prev) => [newReq, ...prev]);
            closeModal();
          },
          closeAfter: false,
        },
      ],
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  return {
    filteredData,
    selectedStatus,
    onStatusChange,
    isModalOpen,
    openModal,
    closeModal,
    modalConfig,
    columns,
    handleRowClick,
    handleEdit,
    handleDelete,
  };
}
