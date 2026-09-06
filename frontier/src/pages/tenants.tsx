import React from 'react';
import { Heading3 } from '../components/ui/Typography';
import Button from '@/components/ui/Button';
import { Calendar, ChevronDown } from 'lucide-react';
import { TENANT_DATA, tenantColumns } from '@/data/tenantdata';
import TenantTable from '@/components/common/listfield/tenanttable';
import TenantGrid from '@/components/common/table/gridtable';
import PageLayout from '@/components/layout/PageLayout';

const Tenants: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenants', active: true }
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

    const hasData = TENANT_DATA && TENANT_DATA.length > 0;
    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            {hasData ? (
                <div className="flex-1 flex flex-col p-6">
                    <TenantTable
                        data={TENANT_DATA}
                        columns={tenantColumns}
                        createButtonLabel="Create a new tenant"
                        renderGrid={(data) => <TenantGrid data={data} itemsPerPage={8} onCardClick={() => onNavigate?.('tenantDetails')} />}
                        onRowClick={() => onNavigate?.('tenantDetails')}
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
                    <div className="flex flex-col items-center gap-6 max-w-md text-center">
                        <img
                            src="/nousers.svg"
                            alt="No Users Found"
                            className="w-64 h-64 object-contain opacity-80"
                        />
                        <Heading3 className="text-grey-900 dark:text-white">No Users Found</Heading3>
                        <p className="text-grey-500 dark:text-grey-400">
                            There are currently no users to display in this section.
                        </p>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Tenants;
