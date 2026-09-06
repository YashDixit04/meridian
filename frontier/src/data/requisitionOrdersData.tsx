import React from 'react';
import Badge from '../components/ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { Column } from '@/components/common/table/table';

export interface RequisitionOrder {
  id: number;
  orderId: string;
  vessel: string;
  requisitionBy: string;
  supplier: string;
  orderValue: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Delivered';
  orderDate: string;
  deliveryDate: string;
}

export const requisitionOrdersColumns: Column<RequisitionOrder>[] = [
  {
    header: 'Order ID',
    accessorKey: 'orderId',
    cell: (row) => <span className="text-primary font-medium">{row.orderId}</span>,
  },
  {
    header: 'Vessel',
    accessorKey: 'vessel',
    cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.vessel}</span>,
  },
  {
    header: 'Requisition By',
    accessorKey: 'requisitionBy',
  },
  {
    header: 'Supplier',
    accessorKey: 'supplier',
  },
  {
    header: 'Order Value',
    accessorKey: 'orderValue',
    className: 'font-medium',
    cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.orderValue}</span>,
  },
  {
    header: 'Status',
    cell: (row) => (
      <Badge
        variant="soft"
        color={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : row.status === 'Delivered' ? 'info' : 'danger'}
        className="rounded-full px-3"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Order Date',
    accessorKey: 'orderDate',
  },
  {
    header: 'Delivery Date',
    accessorKey: 'deliveryDate',
  },
  {
    header: 'Action',
    className: 'text-right',
    cell: () => (
      <div className="flex items-center justify-end gap-2">
        <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
    ),
  },
];

export const requisitionOrdersTableData: RequisitionOrder[] = [
  {
    id: 1,
    orderId: "ORD-1001",
    vessel: "MSC Demo",
    requisitionBy: "John Carter",
    supplier: "Marine Supplies Ltd",
    orderValue: "$12,500",
    status: "Approved",
    orderDate: "2024-02-18",
    deliveryDate: "2024-02-22",
  },
  {
    id: 2,
    orderId: "ORD-1002",
    vessel: "MSC Neptune",
    requisitionBy: "Emma Watson",
    supplier: "Oceanic Traders",
    orderValue: "$8,200",
    status: "Pending",
    orderDate: "2024-02-20",
    deliveryDate: "2024-02-25",
  },
  {
    id: 3,
    orderId: "ORD-1003",
    vessel: "MSC Titan",
    requisitionBy: "Sarah Miller",
    supplier: "Global Ship Parts",
    orderValue: "$15,800",
    status: "Delivered",
    orderDate: "2024-02-10",
    deliveryDate: "2024-02-15",
  },
  {
    id: 4,
    orderId: "ORD-1004",
    vessel: "MSC Demo",
    requisitionBy: "David Chen",
    supplier: "Marine Supplies Ltd",
    orderValue: "$3,450",
    status: "Approved",
    orderDate: "2024-02-19",
    deliveryDate: "2024-02-24",
  },
  {
    id: 5,
    orderId: "ORD-1005",
    vessel: "MSC Voyager",
    requisitionBy: "James Wilson",
    supplier: "SeaTech Solutions",
    orderValue: "$22,100",
    status: "Pending",
    orderDate: "2024-02-21",
    deliveryDate: "2024-02-28",
  },
  {
    id: 6,
    orderId: "ORD-1006",
    vessel: "MSC Pioneer",
    requisitionBy: "Lisa Thompson",
    supplier: "Oceanic Traders",
    orderValue: "$6,750",
    status: "Rejected",
    orderDate: "2024-02-15",
    deliveryDate: "2024-02-20",
  },
  {
    id: 7,
    orderId: "ORD-1007",
    vessel: "MSC Neptune",
    requisitionBy: "Maria Garcia",
    supplier: "Port Supply Co.",
    orderValue: "$9,900",
    status: "Delivered",
    orderDate: "2024-02-12",
    deliveryDate: "2024-02-17",
  },
  {
    id: 8,
    orderId: "ORD-1008",
    vessel: "MSC Endeavour",
    requisitionBy: "John Carter",
    supplier: "Marine Supplies Ltd",
    orderValue: "$18,300",
    status: "Approved",
    orderDate: "2024-02-22",
    deliveryDate: "2024-02-27",
  },
];
