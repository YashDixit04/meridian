import React, { useState } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { tenantDetailsData } from '@/data/tenantDetailsData';
import tenantService from '@/services/tenantService';
import { ApiException } from '@/lib/apiClient';

const normalizeOptionalText = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeProfilePhoto = (value: unknown): string | undefined => {
    const normalized = normalizeOptionalText(value);
    if (!normalized || normalized.startsWith('blob:')) {
        return undefined;
    }
    return normalized;
};

const emptyTenantData = {
    ...tenantDetailsData,
    basic: {
        ...tenantDetailsData.basic,
        tenantInformation: {
            ...tenantDetailsData.basic.tenantInformation,
            tenantProfilePhoto: '',
            tenantName: '',
            domain: '',
            address: '',
            contactEmail: '',
            contactPhone: '',
            country: '',
            timezone: 'UTC',
            currency: 'USD',
        },
        subscription: {
            ...tenantDetailsData.basic.subscription,
            planName: 'Enterprise Plan',
            planType: 'Annual',
            autoRenew: true,
            amountPaid: '',
        },
        planFeatures: {
            ...tenantDetailsData.basic.planFeatures,
            requisitionManagement: false,
            catalogueServices: false,
            subUsersCreation: false,
            vesselsAdditions: false,
            catalogueManagement: false,
            mealsCreation: false,
            victuallingManagementServices: false,
            activeLogsMapping: false,
            ordersManagement: false,
            invoiceManagement: false,
            maxUserCreations: 200,
            maxSubUsers: 500,
            maxStorageGB: 500,
            apiRequestsTier: 'Unlimited',
        }
    },
    advanced: {
        ...tenantDetailsData.advanced,
        users: {
            ...tenantDetailsData.advanced.users,
            tenantAdminName: '',
            tenantAdminEmail: '',
            tenantAdminPassword: '',
            userTypeSelection: 'Both SMC and Vendor Users',
            baseUsersCount: 4,
            totalVendorUsersCount: 4,
        },
        catalogueAndProducts: {
            ...tenantDetailsData.advanced.catalogueAndProducts,
            companySpecificCatalogueCount: 0,
            productAvailability: 'Specific Ports',
            specificPorts: '',
        }
    }
};

const AddTenantPage: React.FC<{ onNavigate?: (url: string) => void }> = ({ onNavigate }) => {
    const [details, setDetails] = useState<any>(emptyTenantData);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const handleSave = async () => {
        setSaveError('');
        setIsSaving(true);

        const tenantName = normalizeOptionalText(details.basic.tenantInformation.tenantName);
        if (!tenantName) {
            setSaveError('Tenant name is required.');
            setIsSaving(false);
            return;
        }

        const tenantDomain = normalizeOptionalText(details.basic.tenantInformation.domain);
        if (!tenantDomain) {
            setSaveError('Tenant domain is required.');
            setIsSaving(false);
            return;
        }

        try {
            const payload = {
                profilePhoto: sanitizeProfilePhoto(details.basic.tenantInformation.tenantProfilePhoto),
                name: tenantName,
                domain: tenantDomain,
                status: 'Active',
                address: normalizeOptionalText(details.basic.tenantInformation.address),
                contactEmail: normalizeOptionalText(details.basic.tenantInformation.contactEmail),
                contactPhone: normalizeOptionalText(details.basic.tenantInformation.contactPhone),
                country: normalizeOptionalText(details.basic.tenantInformation.country),
                timezone: normalizeOptionalText(details.basic.tenantInformation.timezone),
                currency: normalizeOptionalText(details.basic.tenantInformation.currency),
                
                planName: normalizeOptionalText(details.basic.subscription?.planName),
                planType: normalizeOptionalText(details.basic.subscription?.planType),
                amountPaid: normalizeOptionalText(details.basic.subscription?.amountPaid),

                requisitionManagement: Boolean(details.basic.planFeatures?.requisitionManagement),
                catalogueServices: Boolean(details.basic.planFeatures?.catalogueServices),
                subUsersCreation: Boolean(details.basic.planFeatures?.subUsersCreation),
                vesselsAdditions: Boolean(details.basic.planFeatures?.vesselsAdditions),
                catalogueManagement: Boolean(details.basic.planFeatures?.catalogueManagement),
                mealsCreation: Boolean(details.basic.planFeatures?.mealsCreation),
                victuallingManagementServices: Boolean(details.basic.planFeatures?.victuallingManagementServices),
                activeLogsMapping: Boolean(details.basic.planFeatures?.activeLogsMapping),
                ordersManagement: Boolean(details.basic.planFeatures?.ordersManagement),
                invoiceManagement: Boolean(details.basic.planFeatures?.invoiceManagement),

                maxUserCreations: details.basic.planFeatures?.maxUserCreations,
                maxSubUsers: details.basic.planFeatures?.maxSubUsers,
                maxStorageGB: details.basic.planFeatures?.maxStorageGB,
                apiRequestsTier: normalizeOptionalText(details.basic.planFeatures?.apiRequestsTier),

                tenantAdminName: normalizeOptionalText(details.advanced.users?.tenantAdminName),
                tenantAdminEmail: normalizeOptionalText(details.advanced.users?.tenantAdminEmail) || normalizeOptionalText(details.basic.tenantInformation.contactEmail),
                tenantAdminPassword: normalizeOptionalText(details.advanced.users?.tenantAdminPassword) || 'tenant123',
                userTypeSelection: normalizeOptionalText(details.advanced.users?.userTypeSelection),
                baseUsersCount: details.advanced.users?.baseUsersCount ?? 4,
                totalVendorUsersCount: details.advanced.users?.totalVendorUsersCount ?? 4,
                companySpecificCatalogueCount: details.advanced.catalogueAndProducts?.companySpecificCatalogueCount,
                productAvailability: normalizeOptionalText(details.advanced.catalogueAndProducts?.productAvailability),
                specificPorts: normalizeOptionalText(details.advanced.catalogueAndProducts?.specificPorts),
            };

            await tenantService.createTenant(payload);
            if (onNavigate) onNavigate('users');
        } catch (err) {
            console.error('Failed to create tenant', err);
            if (err instanceof ApiException) {
                setSaveError(err.errorMessage);
            } else {
                setSaveError('Failed to create tenant. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenants', href: '#' },
        { label: 'Add Tenant', active: true }
    ];

    const actions = (
        <div className="flex flex-col items-end gap-2">
            {saveError && (
                <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger">
                    {saveError}
                </div>
            )}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    color="grey"
                    size="small"
                    onClick={() => onNavigate?.('users')}
                    className="gap-2"
                >
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    color="primary"
                    size="small"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                >
                    {isSaving ? 'Creating...' : 'Create Tenant'}
                </Button>
            </div>
        </div>
    );

    return (
        <DetailsView
            data={details}
            onChange={setDetails}
            showSectionSaveButtons={false}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
            pageTitle="Create New Tenant"
            pageSubtitle="Fill in the comprehensive details to onboard a new tenant."
            isEditMode={true}
        />
    );
};

export default AddTenantPage;
