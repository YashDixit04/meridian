import React from 'react';
import Button from '../components/ui/Button';
import DetailsView from '@/components/common/DetailsView';
import { Calendar, ChevronDown } from 'lucide-react';
import { tenantAdminData } from '@/data/userDeatilsData';

const UserDetails: React.FC = () => {
    const breadcrumbItems = [
        { label: 'Settings', href: '#' },
        { label: tenantAdminData.type, href: '#', active: true }
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
        <DetailsView
            data={tenantAdminData}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
            pageTitle={`Settings - ${tenantAdminData.type}`}
            pageSubtitle="Intuitive Access to In-Depth Customization"
        />
    );
};

export default UserDetails;
