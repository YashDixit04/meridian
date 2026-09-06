import React, { useMemo } from 'react';
import { Table, Column } from '@/components/common/table/table';
import Badge from '@/components/ui/Badge';
import { RequisitionItem } from '@/data/requisitionMockData';
import { Package } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItemsTabProps {
  items: RequisitionItem[];
}

// ─── Status colour map ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<RequisitionItem['status'], 'success' | 'warning' | 'danger'> = {
  Confirmed: 'success',
  Pending: 'warning',
  Rejected: 'danger',
};

// ─── Component ────────────────────────────────────────────────────────────────

const ItemsTab: React.FC<ItemsTabProps> = ({ items }) => {
  /**
   * Pre-build a Map<itemId, rowIndex> so the cell renderer can display a
   * 1-based serial number. The Table component's `cell` callback only receives
   * the row object (not its index), so we derive the position here.
   */
  const indexMap = useMemo(
    () => new Map(items.map((item, i) => [item.id, i + 1])),
    [items],
  );

  // ─── Column definitions for the generic Table ────────────────────────────

  const COLUMNS: Column<RequisitionItem>[] = [
    {
      header: '#',
      accessorKey: 'id',
      cell: (row) => (
        <span className="text-grey-400 dark:text-grey-600 text-xs font-semibold tabular-nums">
          {indexMap.get(row.id) ?? '—'}
        </span>
      ),
    },
    {
      header: 'Product',
      accessorKey: 'productName',
      cell: (row) => (
        <span className="font-medium text-grey-900 dark:text-white text-sm">{row.productName}</span>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (row) => (
        <Badge variant="soft" color="info" className="rounded-full px-2.5 text-[11px]">
          {row.category}
        </Badge>
      ),
    },
    {
      header: 'Ref Code',
      accessorKey: 'referenceCode',
      cell: (row) => (
        <span className="font-mono text-xs text-grey-500 dark:text-grey-400">
          {row.referenceCode}
        </span>
      ),
    },
    {
      header: 'Qty',
      accessorKey: 'quantity',
      cell: (row) => (
        <span className="font-semibold text-grey-900 dark:text-white text-sm">
          {row.quantity} {row.unit}
        </span>
      ),
    },
    {
      header: 'Vendor',
      accessorKey: 'vendor',
      cell: (row) => (
        <span className="text-grey-700 dark:text-grey-300 text-sm">{row.vendor}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant="soft" color={STATUS_COLOR[row.status]} className="rounded-full px-2.5 text-[11px]">
          {row.status}
        </Badge>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Package size={40} className="text-grey-300 dark:text-grey-600" />
        <p className="text-grey-500 dark:text-grey-400 text-sm">
          No items have been added to this requisition yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table
        data={items}
        columns={COLUMNS}
        showSearch={false}
        itemsPerPage={items.length}
      />
    </div>
  );
};

export default ItemsTab;

