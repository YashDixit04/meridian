import React, { useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { tenantDetailsData, getTenantQuickLinks } from '@/data/tenantDetailsData';

const TenantDetailsView: React.FC<{ onNavigate?: (url: string) => void }> = ({ onNavigate }) => {
    const [isEditMode, setIsEditMode] = useState(false);

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenants', href: '#' },
        { label: 'Tenant Details', href: '#', active: true }
    ];

    const actions = (
        <Button
            variant={isEditMode ? 'outline' : 'solid'}
            color={isEditMode ? 'danger' : 'primary'}
            size="small"
            onClick={() => setIsEditMode(prev => !prev)}
            className="gap-2"
        >
            {isEditMode ? (
                <>
                    Disable Edit Mode
                </>
            ) : (
                <>
                    Edit Details
                </>
            )}
        </Button>
    );

    return (
        <DetailsView
            data={tenantDetailsData}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
            pageTitle={`${tenantDetailsData.type} Details`}
            pageSubtitle="Comprehensive overview of tenant information, subscription, and usage"
            isEditMode={isEditMode}
            quickLinks={getTenantQuickLinks(tenantDetailsData.advanced?.users?.userTypeSelection)}
            onQuickLinkClick={onNavigate}
        />
    );
};

export default TenantDetailsView;
