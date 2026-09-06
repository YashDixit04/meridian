import React from 'react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { Column } from '@/components/common/table/table';

export interface SubUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  vesselAssigned: 'Yes' | 'No';
  status: 'Active';
  createdAt: string;
  _backendId?: string;
  _tenantId?: string;
  _roleType?: 'tenantadmin' | 'tenantadmin_subusers';
  _firstName?: string;
  _lastName?: string;
  _assignedVesselIds?: string[];
  _permissions?: {
    pages: string[];
    fields: Record<string, string[]>;
  };
}

export const subUsersColumns: Column<SubUser>[] = [
  {
    header: 'Name',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={`https://i.pravatar.cc/150?u=${row.id + 20}`} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-grey-900 dark:text-white">{row.name}</span>
          <span className="text-xs text-primary">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    header: 'Role',
    accessorKey: 'role',
    cell: (row) => <span className="text-primary font-medium">{row.role}</span>,
  },
  {
    header: 'Department',
    accessorKey: 'department',
  },
  {
    header: 'Vessel Assigned',
    accessorKey: 'vesselAssigned',
    cell: (row) => (
      <span className="font-medium text-grey-900 dark:text-white">
        {row.vesselAssigned}
      </span>
    ),
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
    header: 'Created At',
    accessorKey: 'createdAt',
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

export const subUsersTableData: SubUser[] = [
  {
    id: 1,
    name: "John Carter",
    email: "john.carter@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Operations",
    vesselAssigned: "Yes",
    status: "Active",
    createdAt: "2024-02-22 10:12 AM",
  },
  {
    id: 2,
    name: "Emma Watson",
    email: "emma.watson@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Supply Chain",
    vesselAssigned: "No",
    status: "Active",
    createdAt: "2024-02-21 08:30 AM",
  },
  {
    id: 3,
    name: "Robert Downey",
    email: "robert@mscfalcons.com",
    role: "Tenant Admin",
    department: "Finance",
    vesselAssigned: "Yes",
    status: "Active",
    createdAt: "2024-02-18 03:12 PM",
  },
  {
    id: 4,
    name: "Sarah Miller",
    email: "sarah.miller@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Operations",
    vesselAssigned: "Yes",
    status: "Active",
    createdAt: "2024-02-22 09:00 AM",
  },
  {
    id: 5,
    name: "David Chen",
    email: "david.chen@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Supply Chain",
    vesselAssigned: "No",
    status: "Active",
    createdAt: "2024-02-21 11:45 AM",
  },
  {
    id: 6,
    name: "Lisa Thompson",
    email: "lisa.t@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Finance",
    vesselAssigned: "No",
    status: "Active",
    createdAt: "2024-02-19 02:30 PM",
  },
  {
    id: 7,
    name: "James Wilson",
    email: "james.w@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Operations",
    vesselAssigned: "Yes",
    status: "Active",
    createdAt: "2024-02-22 08:15 AM",
  },
  {
    id: 8,
    name: "Maria Garcia",
    email: "maria.g@mscfalcons.com",
    role: "Tenant Sub Admin",
    department: "Legal",
    vesselAssigned: "No",
    status: "Active",
    createdAt: "2024-02-20 04:00 PM",
  },
];
