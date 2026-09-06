import React from 'react';
import Badge from '../components/ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { Column } from '@/components/common/table/table';

export interface Vendor {
  id: number;
  companyName: string;
  registrationNumber: string;
  email: string;
  companyType: 'Supplier' | 'Manufacturer' | 'Trader';
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  serviceType: 'Supply' | 'Service' | 'Both';
  portsCovered: number;
  approvalStatus: 'Approved' | 'Not Approved';
  _backendId?: string;
  _tenantId?: string;
}

export const vendorsColumns: Column<Vendor>[] = [
  {
    header: 'Company',
    accessorKey: 'companyName',
    cell: (row) => <span className="text-primary font-medium">{row.companyName}</span>,
  },
  {
    header: 'Registration #',
    accessorKey: 'registrationNumber',
    cell: (row) => <span className="text-primary">{row.registrationNumber}</span>,
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Type',
    accessorKey: 'companyType',
  },
  {
    header: 'KYC',
    cell: (row) => (
      <Badge
        variant="soft"
        color={
          row.kycStatus === 'Verified'
            ? 'success'
            : row.kycStatus === 'Rejected'
              ? 'danger'
              : 'warning'
        }
        className="rounded-full px-3"
      >
        {row.kycStatus}
      </Badge>
    ),
  },
  {
    header: 'Service',
    accessorKey: 'serviceType',
  },
  {
    header: 'Ports',
    accessorKey: 'portsCovered',
    className: 'font-medium',
  },
  {
    header: 'Approval',
    cell: (row) => (
      <Badge
        variant="soft"
        color={row.approvalStatus === 'Approved' ? 'success' : 'warning'}
        className="rounded-full px-3"
      >
        {row.approvalStatus}
      </Badge>
    ),
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
