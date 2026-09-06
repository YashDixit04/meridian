import React from 'react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Column } from '@/components/common/table/table';

export interface ActivityLog {
  id: number;
  person: {
    name: string;
    avatar: string;
  };
  action: string;
  module: string;
  ipAddress: string;
  location: string;
  timestamp: string;
}

export const activityLogsColumns: Column<ActivityLog>[] = [
  {
    header: 'Person',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.person.avatar} size="sm" />
        <span className="text-sm font-medium text-grey-900 dark:text-white">{row.person.name}</span>
      </div>
    ),
  },
  {
    header: 'Action',
    accessorKey: 'action',
    cell: (row) => (
      <Badge
        variant="soft"
        color={
          row.action.includes('Created') || row.action.includes('Added') ? 'success' :
          row.action.includes('Deleted') || row.action.includes('Removed') ? 'danger' :
          row.action.includes('Updated') || row.action.includes('Modified') ? 'info' :
          'warning'
        }
        className="rounded-full px-3"
      >
        {row.action}
      </Badge>
    ),
  },
  {
    header: 'Module',
    accessorKey: 'module',
  },
  {
    header: 'IP Address',
    accessorKey: 'ipAddress',
    showInGrid: false,
    cell: (row) => <span className="text-primary">{row.ipAddress}</span>,
  },
  {
    header: 'Location',
    accessorKey: 'location',
    showInGrid: false,
  },
  {
    header: 'Timestamp',
    accessorKey: 'timestamp',
  },
];

export const activityLogsTableData: ActivityLog[] = [
  {
    id: 1,
    person: { name: "Jason Tatum", avatar: "https://i.pravatar.cc/150?u=3" },
    action: "Created User",
    module: "User Management",
    ipAddress: "102.150.137.255",
    location: "United States",
    timestamp: "2024-02-22 10:12 AM",
  },
  {
    id: 2,
    person: { name: "John Carter", avatar: "https://i.pravatar.cc/150?u=21" },
    action: "Updated Order",
    module: "Requisitions",
    ipAddress: "76.216.214.248",
    location: "Singapore",
    timestamp: "2024-02-22 09:45 AM",
  },
  {
    id: 3,
    person: { name: "Emma Watson", avatar: "https://i.pravatar.cc/150?u=22" },
    action: "Added Vessel",
    module: "Fleet Management",
    ipAddress: "233.182.185.28",
    location: "Netherlands",
    timestamp: "2024-02-21 04:30 PM",
  },
  {
    id: 4,
    person: { name: "Robert Downey", avatar: "https://i.pravatar.cc/150?u=23" },
    action: "Deleted Document",
    module: "Documents",
    ipAddress: "76.216.214.248",
    location: "United States",
    timestamp: "2024-02-21 02:15 PM",
  },
  {
    id: 5,
    person: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=24" },
    action: "Modified Settings",
    module: "Configuration",
    ipAddress: "140.92.152.213",
    location: "India",
    timestamp: "2024-02-21 11:00 AM",
  },
  {
    id: 6,
    person: { name: "David Chen", avatar: "https://i.pravatar.cc/150?u=25" },
    action: "Created Order",
    module: "Requisitions",
    ipAddress: "102.150.137.255",
    location: "China",
    timestamp: "2024-02-20 03:22 PM",
  },
  {
    id: 7,
    person: { name: "Lisa Thompson", avatar: "https://i.pravatar.cc/150?u=26" },
    action: "Updated Profile",
    module: "User Management",
    ipAddress: "75.243.106.80",
    location: "Turkey",
    timestamp: "2024-02-20 10:45 AM",
  },
  {
    id: 8,
    person: { name: "James Wilson", avatar: "https://i.pravatar.cc/150?u=27" },
    action: "Removed User",
    module: "User Management",
    ipAddress: "70.218.212.162",
    location: "Germany",
    timestamp: "2024-02-19 09:30 AM",
  },
  {
    id: 9,
    person: { name: "Maria Garcia", avatar: "https://i.pravatar.cc/150?u=28" },
    action: "Added Integration",
    module: "Integrations",
    ipAddress: "102.150.137.255",
    location: "Spain",
    timestamp: "2024-02-18 05:00 PM",
  },
  {
    id: 10,
    person: { name: "Jason Tatum", avatar: "https://i.pravatar.cc/150?u=3" },
    action: "Updated Subscription",
    module: "Billing",
    ipAddress: "102.150.137.255",
    location: "United States",
    timestamp: "2024-02-18 11:15 AM",
  },
];
