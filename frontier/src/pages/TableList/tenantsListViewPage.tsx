import React, { useState, useEffect } from 'react';
import { Heading3 } from '../../components/ui/Typography';
import Button from '@/components/ui/Button';
import { Calendar, ChevronDown } from 'lucide-react';
import { TENANT_DATA, getTenantColumns } from '@/data/tenantdata';
import tenantService from '@/services/tenantService';
import TenantTable from '@/components/common/listfield/tenanttable';
import TenantGrid from '@/components/common/table/gridtable';
import PageLayout from '@/components/layout/PageLayout';
import apiClient from '@/lib/apiClient';

const isRenderableImageSrc = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0 && !value.startsWith('blob:');
};

const toSlug = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const Tenants: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const [tenants, setTenants] = useState<any[]>(TENANT_DATA); // fallback initially
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                setIsLoading(true);
                // Call the tenants endpoint
                const res = await apiClient.get<any>('/tenants');
                const tenantArray = res.data || [];
                const mappedTenants = tenantArray.map((t: any) => ({
                    id: t.id,
                    tenantName: t.name,
                    email: t.contactEmail || `${(t.domain || t.name).replace(/\s/g, '').toLowerCase()}@admin.com`,
                    createdBy: {
                        name: 'Admin',
                        email: t.contactEmail || `${(t.domain || t.name).replace(/\s/g, '').toLowerCase()}@admin.com`,
                        avatar: isRenderableImageSrc(t.profilePhoto)
                            ? t.profilePhoto
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&bg=random`,
                    },
                    code: t.tenantCode || t.id.substring(0, 8).toUpperCase(),
                    purchasingDate: new Date(t.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    amount: t.amountPaid ? (t.amountPaid.startsWith('$') ? t.amountPaid : `$${t.amountPaid}`) : '$0.00',
                    type: t.planType || 'Annual',
                    status: t.status || 'Active',
                }));

                setTenants(mappedTenants);

                // Fallback to static if empty and we want to demo
                if (mappedTenants.length === 0) {
                    setTenants(TENANT_DATA);
                }
            } catch (err) {
                console.error('Failed to fetch tenants:', err);
                setTenants(TENANT_DATA); // Fallback so UI still looks good
            } finally {
                setIsLoading(false);
            }
        };

        fetchTenants();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            try {
                await tenantService.deleteTenant(id);
                setTenants(prev => prev.filter(t => t.id !== id));
            } catch (err) {
                console.error('Failed to delete tenant', err);
            }
        }
    };

    const columns = getTenantColumns(handleDelete);

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

    const hasData = tenants && tenants.length > 0;
    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : hasData ? (
                <div className="flex-1 flex flex-col p-6">
                    <TenantTable
                        data={tenants}
                        columns={columns}
                        createButtonLabel="Create a new tenant"
                        onCreateClick={() => onNavigate?.('addTenant')}
                        renderGrid={(data) => (
                            <TenantGrid
                                data={data}
                                itemsPerPage={8}
                                onCardClick={(item) => onNavigate?.(`/tenant/${item.id}/${toSlug(item.tenantName || 'details')}`)}
                            />
                        )}
                        onRowClick={(row) => onNavigate?.(`/tenant/${row.id}/${toSlug(row.tenantName || 'details')}`)}
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
                    <div className="flex flex-col items-center gap-6 max-w-md text-center">
                        <img
                            src="/nousers.svg"
                            alt="No Tenants Found"
                            className="w-64 h-64 object-contain opacity-80"
                        />
                        <Heading3 className="text-grey-900 dark:text-white">No Tenants Found</Heading3>
                        <p className="text-grey-500 dark:text-grey-400">
                            There are currently no tenants to display in this section.
                        </p>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Tenants;
