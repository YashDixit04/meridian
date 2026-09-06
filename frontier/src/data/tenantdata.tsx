import React from 'react';

import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { MoreHorizontal, Download as DownloadIcon, Trash2 } from 'lucide-react';
import { Column } from '@/components/common/table/table';

export interface Tenant {
  id: string;
  tenantName: string;
  email: string;
  createdBy: {
    name: string;
    email: string;
    avatar: string;
  };
  code: string;
  purchasingDate: string;
  amount: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

export const getTenantColumns = (onDelete?: (e: React.MouseEvent, id: string) => void): Column<Tenant>[] => [
  {
    header: 'Tenant Name',
    accessorKey: 'tenantName',
    className: 'font-medium',
    cell: (row) => <span className="text-primary font-medium">{row.tenantName}</span>
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Created by',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.createdBy.avatar} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-grey-900 dark:text-white">{row.createdBy.name}</span>
          <span className="text-xs text-primary">{row.createdBy.email}</span>
        </div>
      </div>
    ),
  },
  {
    header: 'Code',
    accessorKey: 'code',
    cell: (row) => <span className="text-primary">{row.code}</span>
  },
  {
    header: 'Purchasing date',
    accessorKey: 'purchasingDate',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    className: 'font-medium',
    cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.amount}</span>
  },
  {
    header: 'Type',
    accessorKey: 'type',
  },
  {
    header: 'Status',
    cell: (row) => (
      <Badge
        variant="soft"
        color={row.status === 'Active' ? 'success' : row.status === 'Inactive' ? 'danger' : 'warning'}
        className="rounded-full px-3"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Action',
    className: 'text-right',
    cell: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
          <DownloadIcon size={16} />
        </button>
        <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
          <MoreHorizontal size={16} />
        </button>
        {onDelete && (
          <button 
             onClick={(e) => onDelete(e, row.id)}
             className="text-danger hover:text-red-700 dark:hover:text-red-400 transition-colors ml-2"
             title="Delete"
          >
             <Trash2 size={16} />
          </button>
        )}
      </div>
    ),
  },
];

export const tenantColumns = getTenantColumns();

export const TENANT_DATA: Tenant[] = [
  {
    id: '1',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=1',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '2',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=2',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '3',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=3',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '4',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=4',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '5',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=5',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '6',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=6',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '7',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=7',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '8',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=8',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '9',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=9',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '10',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=10',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '11',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=11',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
  {
    id: '12',
    tenantName: 'MSC Falcons',
    email: 'mscfalcon@gmail.com',
    createdBy: {
      name: 'Sushma',
      email: 'Sushma21@shipskart.com',
      avatar: 'https://i.pravatar.cc/150?u=12',
    },
    code: '#52134121',
    purchasingDate: '15 Feb, 2024',
    amount: '$259.00',
    type: 'Plan',
    status: 'Active',
  },
];