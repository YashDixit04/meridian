import React, { useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import { subUsersTableData, subUsersColumns } from '@/data/subUsersData';

const SubUsersPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'User Details', href: '#' },
        { label: 'Sub Users', href: '#', active: true },
    ];

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={subUsersTableData}
            columns={subUsersColumns}
            createButtonLabel="Add Sub User"
            itemsPerPage={7}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
        />
    );
};

export default SubUsersPage;
