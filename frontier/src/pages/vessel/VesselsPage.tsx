import React, { useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import { vesselsTableData, vesselsColumns } from '@/data/vesselsData';

const VesselsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'User Details', href: '#' },
        { label: 'Vessels', href: '#', active: true },
    ];

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={vesselsTableData}
            columns={vesselsColumns}
            createButtonLabel="Add Vessel"
            itemsPerPage={7}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
        />
    );
};

export default VesselsPage;
