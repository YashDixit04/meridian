import React, { useState, useEffect } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import { activityLogsTableData, activityLogsColumns } from '@/data/activityLogsData';
import Button from '@/components/ui/Button';
import ViewToggle from '@/components/layout/viewTableLayout';
import { authService } from '@/services/authService';
import tenantService from '@/services/tenantService';

interface ActivityLogsPageProps {
    tenantId?: string;
}

const ActivityLogsPage: React.FC<ActivityLogsPageProps> = ({ tenantId: propTenantId }) => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [logs, setLogs] = useState<any[]>(activityLogsTableData);
    const [isLoading, setIsLoading] = useState(true);

    const session = authService.getSession();
    const tenantId = propTenantId || session?.tenantId || '';

    useEffect(() => {
        const fetchLogs = async () => {
            if (!tenantId) return;
            try {
                setIsLoading(true);
                const data = await tenantService.getActivityLogs(tenantId);

                const mapped = data.map((log: any, idx: number) => ({
                    id: idx + 1,
                    person: {
                        name: log.user
                            ? `${log.user.firstName} ${log.user.lastName}`.trim()
                            : 'System',
                        avatar: `https://i.pravatar.cc/150?u=${log.userId || idx}`,
                    },
                    action: log.action,
                    module: log.description || 'General',
                    ipAddress: '—',
                    location: '—',
                    timestamp: new Date(log.createdAt).toLocaleString(),
                }));

                if (mapped.length > 0) {
                    setLogs(mapped);
                }
                // If empty, keep mock data
            } catch (err) {
                console.error('Failed to fetch activity logs:', err);
                // Keep mock data as fallback
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [tenantId]);

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenant', href: '#' },
        { label: 'Activity Logs', href: '#', active: true },
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <Button variant="solid" color="primary" size="small">
                Export Logs
            </Button>
        </div>
    );

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={logs}
            columns={activityLogsColumns}
            itemsPerPage={7}
            actions={actions}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
        />
    );
};

export default ActivityLogsPage;
