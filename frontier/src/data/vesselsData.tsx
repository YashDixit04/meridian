import React from 'react';
import Badge from '../components/ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { Column } from '@/components/common/table/table';

export interface Vessel {
  id: number;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  captain: string;
  location: string;
  status: 'Active' | 'In Port' | 'Sailing' | 'Dry Dock';
  lastInspection: string;
  _backendId?: string;
  _tenantId?: string;
}

export const vesselsColumns: Column<Vessel>[] = [
  {
    header: 'Vessel Name',
    accessorKey: 'vesselName',
    cell: (row) => <span className="text-primary font-medium">{row.vesselName}</span>,
  },
  {
    header: 'IMO Number',
    accessorKey: 'imoNumber',
    cell: (row) => <span className="text-primary">{row.imoNumber}</span>,
  },
  {
    header: 'Vessel Type',
    accessorKey: 'vesselType',
  },
  {
    header: 'Captain',
    accessorKey: 'captain',
    cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.captain}</span>,
  },
  {
    header: 'Location',
    accessorKey: 'location',
  },
  {
    header: 'Status',
    cell: (row) => (
      <Badge
        variant="soft"
        color={
          row.status === 'Active'
            ? 'success'
            : row.status === 'In Port'
              ? 'info'
              : row.status === 'Sailing'
                ? 'warning'
                : 'danger'
        }
        className="rounded-full px-3"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Last Inspection',
    accessorKey: 'lastInspection',
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

export const vesselsTableData: Vessel[] = [
  {
    id: 1,
    vesselName: "MSC Vessel",
    imoNumber: "IMO-9837261",
    vesselType: "Container Ship",
    captain: "Captain James Walker",
    location: "Singapore Port",
    status: "Active",
    lastInspection: "2024-01-10",
  },
  {
    id: 2,
    vesselName: "MSC Neptune",
    imoNumber: "IMO-9127384",
    vesselType: "Cargo Vessel",
    captain: "Captain Michael Ross",
    location: "Dubai Port",
    status: "In Port",
    lastInspection: "2024-01-25",
  },
  {
    id: 3,
    vesselName: "MSC Titan",
    imoNumber: "IMO-9452187",
    vesselType: "Bulk Carrier",
    captain: "Captain Sarah Lee",
    location: "Rotterdam Port",
    status: "Sailing",
    lastInspection: "2024-02-05",
  },
  {
    id: 4,
    vesselName: "MSC Voyager",
    imoNumber: "IMO-9615823",
    vesselType: "Tanker",
    captain: "Captain David Brown",
    location: "Houston Port",
    status: "Active",
    lastInspection: "2024-01-18",
  },
  {
    id: 5,
    vesselName: "MSC Pioneer",
    imoNumber: "IMO-9783456",
    vesselType: "Container Ship",
    captain: "Captain Emily Chen",
    location: "Shanghai Port",
    status: "Dry Dock",
    lastInspection: "2024-02-10",
  },
  {
    id: 6,
    vesselName: "MSC Endeavour",
    imoNumber: "IMO-9321654",
    vesselType: "Cargo Vessel",
    captain: "Captain Robert Kim",
    location: "Busan Port",
    status: "Active",
    lastInspection: "2024-01-30",
  },
  {
    id: 7,
    vesselName: "MSC Horizon",
    imoNumber: "IMO-9567890",
    vesselType: "Bulk Carrier",
    captain: "Captain Lisa Park",
    location: "Mumbai Port",
    status: "In Port",
    lastInspection: "2024-02-12",
  },
];
