import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import DashboardHead from '@/components/common/dashboardhead';
import SubscriptionRevenueChart from '@/components/common/SubscriptionRevenueChart';
import Highlights from '@/components/common/Highlights';
import RevenueTable from '@/components/common/RevenueTable';
import { REVENUE_TABLE_DATA, revenueTableColumns } from '@/data/config/RevenueTableConfig';
import RequisitionStatusChart from '@/components/common/statusChart';
import PageLayout from '@/components/layout/PageLayout';

import apiClient from '@/lib/apiClient';

const Dashboard: React.FC = () => {
    const [revenueData, setRevenueData] = React.useState<typeof REVENUE_TABLE_DATA>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Determine dark mode for charts (this is a simple check, in a real app use context)
    const isDarkMode = document.documentElement.classList.contains('dark');

    React.useEffect(() => {
        // Example: Dynamic API fetch for the dashboard as per the microservice plan
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                // Call the actual microservice endpoint
                const data = await apiClient.get<typeof REVENUE_TABLE_DATA>('/dashboard/revenue');
                // Ensure data is array or fallback to empty array
                setRevenueData(Array.isArray(data) ? data : []);

                // Fallback static data used for UI testing previously
                // setRevenueData(REVENUE_TABLE_DATA);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Dashboard', active: true }
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            {/* Date Picker Trigger */}
            <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
                <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
                <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
            </div>

            {/* Account Settings (Primary) */}
            <Button variant="solid" color="primary" size="small">
                Account Settings
            </Button>
        </div>
    );

    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            {/* Main Content Scroll Area */}
            <div className="p-6 space-y-6">
                {/* Business Snapshot Section */}
                <DashboardHead />

                {/* Main Content Grid */}
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* Primary Chart - Takes ~70% width on large screens */}
                    <div className="w-full xl:w-[70%] flex flex-col gap-6">
                        <SubscriptionRevenueChart isDarkMode={isDarkMode} />
                        <RevenueTable data={revenueData} columns={revenueTableColumns} />
                    </div>

                    {/* Side Panel / Secondary Widgets - Takes remaining width */}
                    <div className="w-full xl:w-[30%] flex flex-col gap-6">
                        <Highlights />
                        <RequisitionStatusChart isDarkMode={isDarkMode} />
                    </div>
                </div>

            </div>

        </PageLayout>
    );
};

export default Dashboard;
