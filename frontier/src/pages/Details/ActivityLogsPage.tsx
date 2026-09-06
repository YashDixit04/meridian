import React, { useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import { activityLogsTableData, activityLogsColumns } from '@/data/activityLogsData';
import Button from '@/components/ui/Button';
import { Calendar, ChevronDown } from 'lucide-react';
import ViewToggle from '@/components/layout/viewTableLayout';

const ActivityLogsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'User Details', href: '#' },
        { label: 'Activity Logs', href: '#', active: true },
    ];
    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            {/* Date Picker Trigger */}
            <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
                <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
                <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
            </div>

            {/* Create Tenant Button */}
            <Button variant="solid" color="primary" size="small">
                Account Settings
            </Button>
        </div>
    );

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={activityLogsTableData}
            columns={activityLogsColumns}
            itemsPerPage={7}
            actions={actions}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
        />
    );
};

export default ActivityLogsPage;
