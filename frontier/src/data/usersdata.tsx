import React from 'react';
import { Column } from '@/components/common/table/table';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { MoreHorizontal, Download as DownloadIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  userType: string;
  avatar?: string;
}

export const userColumns: Column<User>[] = [
  {
    header: 'User',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.avatar} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-grey-900 dark:text-white">{row.name}</span>
          <span className="text-xs text-primary">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    header: 'Department',
    accessorKey: 'department',
    className: 'font-medium',
    cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.department}</span>
  },
  {
    header: 'Role',
    accessorKey: 'role',
    cell: (row) => <span className="text-grey-700 dark:text-grey-300">{row.role}</span>
  },
  {
    header: 'User Type',
    cell: (row) => (
      <Badge
        variant="soft"
        color={row.userType === 'Internal' ? 'success' : row.userType === 'External' ? 'warning' : 'primary'}
        className="rounded-full px-3"
      >
        {row.userType}
      </Badge>
    ),
  },
  {
    header: 'Action',
    className: 'text-right',
    cell: () => (
      <div className="flex items-center justify-end gap-2">
        <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
          <DownloadIcon size={16} />
        </button>
        <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
    ),
  },
];
