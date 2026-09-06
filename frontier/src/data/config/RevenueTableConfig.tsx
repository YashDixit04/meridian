import React from 'react';
import { Column } from '../../components/common/table/table';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';


export const STATUS_STYLES = {
    'Active': 'bg-success-soft text-success-accent dark:bg-success-soft/20 dark:text-success-active',
    'Renewal Due': 'bg-info-soft text-info-accent dark:bg-info-soft/20 dark:text-info-active',
    'Expiring Soon': 'bg-primary-soft text-primary-accent dark:bg-primary-soft/20 dark:text-primary-active',
    'Inactive': 'bg-danger-soft text-danger-accent dark:bg-danger-soft/20 dark:text-danger-active',
};

export const PLAN_STYLES = {
    'Free': 'bg-grey-200 text-grey-700 dark:bg-grey-800 dark:text-grey-300',
    'Gold': 'bg-warning-soft text-warning-accent dark:bg-warning-soft/20 dark:text-warning-active',
    'Platinum': 'bg-grey-300 text-grey-800 dark:bg-grey-700 dark:text-grey-200',
};

export const REVENUE_TABLE_DATA = [
    {
        id: 1,
        tenantName: 'Star Vendor Company',
        status: 'Active',
        plan: 'Free',
        revenue: '$ 200 /-',
        trend: '+12 this month',
        trendType: 'positive',
    },
    {
        id: 2,
        tenantName: 'Silver Eagle Shipping',
        status: 'Renewal Due',
        plan: 'Gold',
        revenue: '$ 1200 /-',
        trend: '92%',
        trendType: 'positive',
    },
    {
        id: 3,
        tenantName: 'Nirav Trading CO',
        status: 'Expiring Soon',
        plan: 'Platinum',
        revenue: '$ 900 /-',
        trend: 'In 7 Days',
        trendType: 'positive',
    },
    {
        id: 4,
        tenantName: 'MVP Enterprices',
        status: 'Inactive',
        plan: 'Gold',
        revenue: '$ 2100 /-',
        trend: '-1 tenant',
        trendType: 'negative',
    },
    {
        id: 5,
        tenantName: 'Global Logistics',
        status: 'Active',
        plan: 'Platinum',
        revenue: '$ 3500 /-',
        trend: '+5 this month',
        trendType: 'positive',
    },
    {
        id: 6,
        tenantName: 'FastTrack Shipping',
        status: 'Active',
        plan: 'Gold',
        revenue: '$ 1800 /-',
        trend: '+2 this month',
        trendType: 'positive',
    },
    {
        id: 7,
        tenantName: 'Oceanic Traders',
        status: 'Renewal Due',
        plan: 'Free',
        revenue: '$ 0 /-',
        trend: 'In 2 Days',
        trendType: 'neutral',
    },
    {
        id: 8,
        tenantName: 'Skyline Imports',
        status: 'Inactive',
        plan: 'Free',
        revenue: '$ 150 /-',
        trend: '-2 tenants',
        trendType: 'negative',
    },
    {
        id: 9,
        tenantName: 'Prime Distributors',
        status: 'Active',
        plan: 'Platinum',
        revenue: '$ 4200 /-',
        trend: '+8 this month',
        trendType: 'positive',
    },
    {
        id: 10,
        tenantName: 'Elite Cargo',
        status: 'Expiring Soon',
        plan: 'Gold',
        revenue: '$ 1100 /-',
        trend: 'In 15 Days',
        trendType: 'neutral',
    },
];

export const revenueTableColumns: Column<typeof REVENUE_TABLE_DATA[0]>[] = [
    {
        header: 'Tenant Name',
        accessorKey: 'tenantName',
        className: 'min-w-[200px]',
        cell: (row) => <span className="font-medium text-grey-900 dark:text-white">{row.tenantName}</span>,
    },
    {
        header: 'Status',
        accessorKey: 'status',
        className: 'min-w-[150px]',
        cell: (row) => (
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center justify-center min-w-[100px] ${STATUS_STYLES[row.status as keyof typeof STATUS_STYLES] || 'bg-grey-100 text-grey-600'
                    }`}
            >
                {row.status}
            </span>
        ),
    },
    {
        header: 'Plans',
        accessorKey: 'plan',
        className: 'min-w-[120px]',
        cell: (row) => (
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center justify-center min-w-[80px] ${PLAN_STYLES[row.plan as keyof typeof PLAN_STYLES] || 'bg-grey-100 text-grey-600'
                    }`}
            >
                {row.plan}
            </span>
        ),
    },
    {
        header: 'Revenue',
        accessorKey: 'revenue',
        className: 'min-w-[120px]',
        cell: (row) => <span className="text-grey-700 dark:text-grey-300">{row.revenue}</span>,
    },
    {
        header: 'Trend / Renewal %',
        accessorKey: 'trend',
        className: 'min-w-[180px]',
        cell: (row) => {
            let Icon = Minus;
            let colorClass = 'text-grey-500';

            if (row.trendType === 'positive') {
                Icon = ArrowUp;
                colorClass = 'text-success-active';
            } else if (row.trendType === 'negative') {
                Icon = ArrowDown;
                colorClass = 'text-danger-active';
            }

            return (
                <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
                    <span>{row.trend}</span>
                    {row.trendType !== 'neutral' && <Icon className="w-3 h-3" />}
                </div>
            );
        },
    },
];
