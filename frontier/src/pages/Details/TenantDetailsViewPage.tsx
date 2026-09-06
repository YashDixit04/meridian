import React, { useState, useEffect } from 'react';
import DetailsView from '@/components/common/DetailsView';
import Button from '@/components/ui/Button';
import { tenantDetailsData, getTenantQuickLinks } from '@/data/tenantDetailsData';
import tenantService from '@/services/tenantService';
import { ApiException } from '@/lib/apiClient';
import { authService } from '@/services/authService';

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

const resolveQuickLinkRedirect = (redirectUrl: string, tenantId: string): string => {
    if (!tenantId) {
        return redirectUrl;
    }

    const suffixMap: Record<string, string> = {
        '/tenant/sub-users': 'sub-users',
        '/tenant/vendors': 'vendors',
        '/tenant/vendor-kyc': 'vendors',
        '/tenant/vessels': 'vessels',
        '/tenant/orders': 'orders',
        '/tenant/catalogue': 'catalogue',
        '/tenant/documents': 'documents',
        '/tenant/activity-logs': 'activity-logs',
    };

    const mappedSuffix = suffixMap[redirectUrl];
    if (mappedSuffix) {
        return `/tenant/${tenantId}/${mappedSuffix}`;
    }

    return redirectUrl;
};

const TenantDetailsView: React.FC<{ onNavigate?: (url: string) => void, tenantId?: string }> = ({ onNavigate, tenantId: propTenantId }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [resourceCounts, setResourceCounts] = useState({
        usersCount: 0,
        vendorsCount: 0,
        vesselsCount: 0,
        ordersCount: 0,
        catalogsCount: 0,
    });
    const [saveError, setSaveError] = useState('');
    const session = authService.getSession();
    const tenantId = propTenantId || session?.tenantId || 'default-id';

    useEffect(() => {
        // Fetch Tenant Details Dynamically
        const fetchTenant = async () => {
            try {
                // In actual deployment, parse UUID from URL: const id = useParams().tenantId 
                // Currently fetching the default seed global tenant
                const data = await tenantService.getTenantDetails(tenantId);

                const dynamicDetails = {
                    ...tenantDetailsData,
                    basic: {
                        ...tenantDetailsData.basic,
                        tenantInformation: {
                            ...tenantDetailsData.basic.tenantInformation,
                            tenantProfilePhoto: sanitizeProfilePhoto(data.tenantInformation?.profilePhoto) || '',
                            tenantName: data.tenantInformation?.tenantName || '',
                            domain: data.tenantInformation?.domain || '',
                            address: data.tenantInformation?.address || '',
                            contactEmail: data.tenantInformation?.contactEmail || '',
                            contactPhone: data.tenantInformation?.contactPhone || '',
                            country: data.tenantInformation?.country || '',
                            timezone: data.tenantInformation?.timezone || 'UTC',
                            currency: data.tenantInformation?.currency || 'USD',
                        },
                        subscription: {
                            ...tenantDetailsData.basic.subscription,
                            planName: data.subscription?.planName || 'Enterprise Plan',
                            planType: data.subscription?.planType || 'Annual',
                            amountPaid: data.subscription?.amountPaid || '',
                        },
                        planFeatures: {
                            ...tenantDetailsData.basic.planFeatures,
                            requisitionManagement: data.planFeatures?.requisitionManagement ?? false,
                            catalogueServices: data.planFeatures?.catalogueServices ?? false,
                            subUsersCreation: data.planFeatures?.subUsersCreation ?? false,
                            vesselsAdditions: data.planFeatures?.vesselsAdditions ?? false,
                            catalogueManagement: data.planFeatures?.catalogueManagement ?? false,
                            mealsCreation: data.planFeatures?.mealsCreation ?? false,
                            victuallingManagementServices: data.planFeatures?.victuallingManagementServices ?? false,
                            activeLogsMapping: data.planFeatures?.activeLogsMapping ?? false,
                            ordersManagement: data.planFeatures?.ordersManagement ?? false,
                            invoiceManagement: data.planFeatures?.invoiceManagement ?? false,
                            maxUserCreations: data.planFeatures?.maxUserCreations ?? 200,
                            maxSubUsers: data.planFeatures?.maxSubUsers ?? 500,
                            maxStorageGB: data.planFeatures?.maxStorageGB ?? 500,
                            apiRequestsTier: data.planFeatures?.apiRequestsTier || 'Unlimited',
                        }
                    },
                    advanced: {
                        ...tenantDetailsData.advanced,
                        users: {
                            ...tenantDetailsData.advanced.users,
                            tenantAdminName: data.userConfigurations?.tenantAdminName || 'Admin',
                            tenantAdminEmail: data.userConfigurations?.tenantAdminEmail || data.tenantInformation?.contactEmail || '',
                            tenantAdminPassword: '',
                            userTypeSelection: data.userConfigurations?.userTypeSelection || 'Both SMC and Vendor Users',
                            baseUsersCount: data.userConfigurations?.baseUsersCount ?? 4,
                            totalVendorUsersCount: data.userConfigurations?.totalVendorUsersCount ?? 4,
                        },
                        catalogueAndProducts: {
                            ...tenantDetailsData.advanced.catalogueAndProducts,
                            companySpecificCatalogueCount: data.catalogueSettings?.companySpecificCatalogueCount ?? 0,
                            productAvailability: data.catalogueSettings?.productAvailability || 'Specific Ports',
                            specificPorts: data.catalogueSettings?.specificPorts || '',
                            canViewOtherTenantVendors: data.canViewOtherTenantVendors ?? false,
                        }
                    }
                };

                setResourceCounts({
                    usersCount: data.usersCount ?? 0,
                    vendorsCount: data.vendorsCount ?? 0,
                    vesselsCount: data.vesselsCount ?? 0,
                    ordersCount: data.ordersCount ?? 0,
                    catalogsCount: data.catalogsCount ?? 0,
                });

                setDetails(dynamicDetails);

            } catch (err) {
                console.error("Failed to load dynamic details", err);
                setDetails(tenantDetailsData); // Fallback so view doesn't crash
            }
        };

        fetchTenant();
    }, [tenantId]);

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenants', href: '#' },
        { label: 'Tenant Details', href: '#', active: true }
    ];

    // Ensure canViewOtherTenantVendors is only available when userTypeSelection is "Both SMC and Vendor Users"
    useEffect(() => {
        if (!details) return;
        
        const userType = details.advanced?.users?.userTypeSelection;
        const currentCanView = details.advanced?.catalogueAndProducts?.canViewOtherTenantVendors;
        
        if (userType === 'Both SMC and Vendor Users') {
            // Make sure it exists if it should
            if (currentCanView === undefined) {
                setDetails(prev => ({
                    ...prev,
                    advanced: {
                        ...prev.advanced,
                        catalogueAndProducts: {
                            ...prev.advanced?.catalogueAndProducts,
                            canViewOtherTenantVendors: false
                        }
                    }
                }));
            }
        } else {
            // Remove it if it shouldn't be there
            if (currentCanView !== undefined) {
                setDetails(prev => {
                    const newCatalogueAndProducts = { ...prev.advanced?.catalogueAndProducts };
                    delete newCatalogueAndProducts.canViewOtherTenantVendors;
                    
                    return {
                        ...prev,
                        advanced: {
                            ...prev.advanced,
                            catalogueAndProducts: newCatalogueAndProducts
                        }
                    };
                });
            }
        }
    }, [details?.advanced?.users?.userTypeSelection]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        try {
            const isTenantAdmin = session?.roleType === 'tenantadmin';
            const tenantAdminPassword = normalizeOptionalText(details.advanced?.users?.tenantAdminPassword);

            if (tenantAdminPassword && tenantAdminPassword.length < 6) {
                setSaveError('Password must be at least 6 characters long.');
                setIsSaving(false);
                return;
            }

            // If Tenant Admin, only allow editing profile/common fields and password.
            // Subscription, Plan Features, and Quotas remain locked.
            const payload = isTenantAdmin
                ? {
                    profilePhoto: sanitizeProfilePhoto(details.basic.tenantInformation.tenantProfilePhoto),
                    address: normalizeOptionalText(details.basic.tenantInformation.address),
                    contactPhone: normalizeOptionalText(details.basic.tenantInformation.contactPhone),
                    country: normalizeOptionalText(details.basic.tenantInformation.country),
                    timezone: normalizeOptionalText(details.basic.tenantInformation.timezone),
                    currency: normalizeOptionalText(details.basic.tenantInformation.currency),
                    tenantAdminPassword,
                }
                : {
                    profilePhoto: sanitizeProfilePhoto(details.basic.tenantInformation.tenantProfilePhoto),
                    name: normalizeOptionalText(details.basic.tenantInformation.tenantName),
                    domain: normalizeOptionalText(details.basic.tenantInformation.domain),
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

                    tenantAdminPassword,
                    userTypeSelection: normalizeOptionalText(details.advanced.users?.userTypeSelection),
                    baseUsersCount: details.advanced.users?.baseUsersCount,
                    totalVendorUsersCount: details.advanced.users?.totalVendorUsersCount,

                    companySpecificCatalogueCount: details.advanced.catalogueAndProducts?.companySpecificCatalogueCount,
                    productAvailability: normalizeOptionalText(details.advanced.catalogueAndProducts?.productAvailability),
                    specificPorts: normalizeOptionalText(details.advanced.catalogueAndProducts?.specificPorts),
                    canViewOtherTenantVendors: Boolean(details.advanced.catalogueAndProducts?.canViewOtherTenantVendors),
                };
            await tenantService.updateTenant(tenantId, payload);
            setIsEditMode(false);
            // Optionally, show a toast here
        } catch (err) {
            console.error('Failed to save tenant', err);
            if (err instanceof ApiException) {
                setSaveError(err.errorMessage);
            } else {
                setSaveError('Failed to save tenant details. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const actions = (
        <div className="flex flex-col items-end gap-2">
            {saveError && (
                <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm text-danger">
                    {saveError}
                </div>
            )}
            <div className="flex gap-3">
                <Button
                    variant={isEditMode ? 'outline' : 'solid'}
                    color={isEditMode ? 'danger' : 'primary'}
                    size="small"
                    onClick={() => isEditMode ? setIsEditMode(false) : setIsEditMode(true)}
                    className="gap-2"
                >
                    {isEditMode ? 'Cancel Edit' : 'Edit Details'}
                </Button>
                {isEditMode && (
                    <Button
                        variant="solid"
                        color="primary"
                        size="small"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                )}
            </div>
        </div>
    );

    const pf = details?.basic?.planFeatures ?? {};
    const tenantScopedQuickLinks = getTenantQuickLinks(details?.advanced?.users?.userTypeSelection)
        .filter((link) => {
            if (link.redirectUrl === '/tenant/sub-users' && pf.subUsersCreation === false) return false;
            if (link.redirectUrl === '/tenant/vessels' && pf.vesselsAdditions === false) return false;
            if (link.redirectUrl === '/tenant/orders' && pf.requisitionManagement === false && pf.ordersManagement === false) return false;
            if (link.redirectUrl === '/tenant/catalogue' && pf.catalogueServices === false && pf.catalogueManagement === false) return false;
            if (link.redirectUrl === '/tenant/activity-logs' && pf.activeLogsMapping === false) return false;
            return true;
        })
        .map((link) => {
            let total = link.total;
            if (link.redirectUrl === '/tenant/sub-users') {
                total = resourceCounts.usersCount;
            }
            if (link.redirectUrl === '/tenant/vendors' || link.redirectUrl === '/tenant/vendor-kyc') {
                total = resourceCounts.vendorsCount;
            }
            if (link.redirectUrl === '/tenant/vessels') {
                total = resourceCounts.vesselsCount;
            }
            if (link.redirectUrl === '/tenant/orders') {
                total = resourceCounts.ordersCount;
            }
            if (link.redirectUrl === '/tenant/catalogue') {
                total = resourceCounts.catalogsCount;
            }

            return {
                ...link,
                total,
                redirectUrl: resolveQuickLinkRedirect(link.redirectUrl, tenantId),
            };
        });

    if (!details) return null; // Simple loading boundary

    return (
        <DetailsView
            data={details}
            onChange={setDetails}
            showSectionSaveButtons={true}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
            pageTitle={`${details.type} Details`}
            pageSubtitle="Comprehensive overview of tenant information, subscription, and usage"
            isEditMode={isEditMode}
            readOnlySectionKeys={
                session?.roleType === 'tenantadmin'
                    ? ['subscription', 'planFeatures', 'catalogueAndProducts', 'billingIntegrationsSecurity']
                    : []
            }
            quickLinks={tenantScopedQuickLinks}
            onQuickLinkClick={onNavigate}
        />
    );
};

export default TenantDetailsView;
