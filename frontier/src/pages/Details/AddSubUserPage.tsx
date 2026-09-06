import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Combobox from '@/components/ui/Combobox';
import PageLayout from '@/components/layout/PageLayout';
import { BodyBase, Heading2 } from '@/components/ui/Typography';
import { ApiException } from '@/lib/apiClient';
import tenantService from '@/services/tenantService';
import { authService } from '@/services/authService';
import {
    Building2,
    Lock,
    Mail,
    Plus,
    User,
    X,
} from 'lucide-react';
import UserAccessPermissionsSection from '@/components/users/UserAccessPermissionsSection';
import {
    clonePermissionFields,
    isTenantRoleType,
    PermissionFields,
    TENANT_COMPONENT_FIELD_OPTIONS,
    getDepartmentOptions,
    TENANT_PAGE_OPTIONS,
    TENANT_ROLE_OPTIONS,
    TENANT_ROLE_PRESETS,
    TenantRoleType,
} from '@/components/users/userFormConfig';

interface AddSubUserPageProps {
    onNavigate?: (tab: string) => void;
    tenantId?: string;
}

interface AddSubUserFormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleType: TenantRoleType;
    department: string;
    vesselAssigned: boolean;
    assignedVesselIds: string[];
}

const DEFAULT_TENANT_ROLE: TenantRoleType = 'tenantadmin_subusers';

const AddSubUserPage: React.FC<AddSubUserPageProps> = ({ onNavigate, tenantId: propTenantId }) => {
    const session = authService.getSession();
    const tenantId = propTenantId || session?.tenantId || '';
    const defaultPreset = TENANT_ROLE_PRESETS[DEFAULT_TENANT_ROLE];

    const [formData, setFormData] = useState<AddSubUserFormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleType: DEFAULT_TENANT_ROLE,
        department: '', // Will be set dynamically based on options
        vesselAssigned: false,
        assignedVesselIds: [],
    });
    const [quota, setQuota] = useState<{ limit: number; current: number; reached: boolean }>({
        limit: 4,
        current: 0,
        reached: false,
    });
    const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<string[]>([...defaultPreset.pages]);
    const [componentFields, setComponentFields] = useState<PermissionFields>(
        clonePermissionFields(defaultPreset.fields),
    );
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableVessels, setAvailableVessels] = useState<Array<{ value: string; label: string }>>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!tenantId) {
                setAvailableVessels([]);
                return;
            }

            try {
                const [vessels, details] = await Promise.all([
                    tenantService.getVessels(tenantId),
                    tenantService.getTenantDetails(tenantId)
                ]);

                setAvailableVessels(
                    vessels.map((vessel) => ({
                        value: vessel.id,
                        label: `${vessel.coreInfo.vesselName} (${vessel.coreInfo.imoNumber})`,
                    })),
                );

                const userTypeSelection = details?.userConfigurations?.userTypeSelection || details?.advanced?.users?.userTypeSelection;
                const options = getDepartmentOptions(userTypeSelection);
                setDepartmentOptions(options);
                const userLimit = details?.planFeatures?.maxSubUsers ?? details?.basic?.planFeatures?.maxSubUsers ?? details?.userConfigurations?.baseUsersCount ?? details?.planFeatures?.maxUserCreations ?? 4;
                const currentCount = details?.usersCount ?? 0;
                setQuota({
                    limit: userLimit,
                    current: currentCount,
                    reached: currentCount >= userLimit,
                });

                // Set default department if not already set or invalid
                setFormData(prev => ({
                    ...prev,
                    department: prev.department && options.includes(prev.department) ? prev.department : options[0]
                }));

            } catch (err) {
                console.error('Failed to load initial data for sub-user assignment:', err);
                setAvailableVessels([]);
                const fallbackOptions = getDepartmentOptions();
                setDepartmentOptions(fallbackOptions);
                setFormData(prev => ({
                    ...prev,
                    department: fallbackOptions[0]
                }));
            }
        };

        loadInitialData();
    }, [tenantId]);

    const navigateBack = () => {
        if (tenantId) {
            onNavigate?.(`/tenant/${tenantId}/sub-users`);
            return;
        }

        onNavigate?.('tenantSubUsers');
    };

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenant', href: '#' },
        { label: 'Sub Users', href: '#' },
        { label: 'Add Sub User', active: true },
    ];

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handlePageToggle = (pageId: string) => {
        setSelectedPages((prev) =>
            prev.includes(pageId)
                ? prev.filter((page) => page !== pageId)
                : [...prev, pageId],
        );
    };

    const handleComponentFieldToggle = (component: string, field: string) => {
        setComponentFields((prev) => {
            const currentFields = prev[component] || [];
            const nextFields = currentFields.includes(field)
                ? currentFields.filter((item) => item !== field)
                : [...currentFields, field];

            return {
                ...prev,
                [component]: nextFields,
            };
        });
    };

    const applyRolePreset = (roleType: TenantRoleType) => {
        const preset = TENANT_ROLE_PRESETS[roleType];

        setFormData((prev) => ({ ...prev, roleType }));
        setSelectedPages([...preset.pages]);
        setComponentFields(clonePermissionFields(preset.fields));
    };

    const handleRoleChange = (nextRoleType: string) => {
        if (!isTenantRoleType(nextRoleType)) {
            return;
        }

        applyRolePreset(nextRoleType);
    };

    const handleCreateSubUser = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!tenantId) {
            setError('Missing tenant context. Open this page from Tenant Details.');
            setLoading(false);
            return;
        }

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('First name, last name, email and password are required.');
            setLoading(false);
            return;
        }

        if (formData.password.trim().length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        if (!departmentOptions.includes(formData.department)) {
            setError('Please select a valid department.');
            setLoading(false);
            return;
        }

        if (formData.vesselAssigned && formData.assignedVesselIds.length === 0) {
            setError('Select at least one vessel when vessel assignment is enabled.');
            setLoading(false);
            return;
        }

        if (selectedPages.length === 0) {
            setError('Select at least one page permission.');
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Please provide a valid email address.');
            setLoading(false);
            return;
        }

        try {
            await tenantService.createTenantUser(tenantId, {
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password.trim(),
                roleType: formData.roleType,
                department: formData.department,
                vesselAssigned: formData.vesselAssigned,
                assignedVesselIds: formData.vesselAssigned ? formData.assignedVesselIds : [],
                permissions: {
                    pages: selectedPages,
                    fields: componentFields,
                },
            });

            setSuccess(`Sub user "${formData.firstName} ${formData.lastName}" created successfully!`);

            const resetPreset = TENANT_ROLE_PRESETS[DEFAULT_TENANT_ROLE];
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                roleType: DEFAULT_TENANT_ROLE,
                department: departmentOptions[0] || '',
                vesselAssigned: false,
                assignedVesselIds: [],
            });
            setSelectedPages([...resetPreset.pages]);
            setComponentFields(clonePermissionFields(resetPreset.fields));

            setTimeout(() => {
                navigateBack();
            }, 1200);
        } catch (err) {
            if (err instanceof ApiException) {
                setError(err.errorMessage);
            } else {
                setError('Failed to create sub user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const actions = (
        <Button
            variant="outline"
            color="grey"
            size="small"
            onClick={navigateBack}
            className="gap-2"
        >
            <X size={16} /> Cancel
        </Button>
    );

    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            <div className="p-6 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <Heading2 className="text-grey-900 dark:text-white mb-2">Add Tenant Sub User</Heading2>
                    <BodyBase className="text-grey-500 dark:text-grey-400">
                        Create a tenant sub user using the same account and permission flow.
                    </BodyBase>
                </div>
                {quota.reached && (
                    <div className="mb-6 p-4 bg-warning-soft border border-warning/30 rounded-xl">
                        <p className="text-warning font-medium text-sm">
                            ⚠️ User creation limit reached for your subscription plan ({quota.current}/{quota.limit} users created).
                            You cannot create more users under this plan. Please contact superadmin to upgrade.
                        </p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-success-soft border border-success/20 rounded-xl">
                        <p className="text-success font-medium">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-danger-soft border border-danger/20 rounded-xl">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-[#0A0A0D] rounded-2xl border border-grey-200 dark:border-grey-800 p-8 shadow-sm">
                    <form onSubmit={handleCreateSubUser} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        First Name
                                    </label>
                                    <Input
                                        name="firstName"
                                        type="text"
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        leftIcon={<User size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Last Name
                                    </label>
                                    <Input
                                        name="lastName"
                                        type="text"
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        leftIcon={<User size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        leftIcon={<Mail size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Password
                                    </label>
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        leftIcon={<Lock size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Department
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-lg text-grey-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors"
                                        >
                                            {departmentOptions.map((department) => (
                                                <option key={department} value={department}>
                                                    {department}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Building2 size={18} className="text-grey-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-300">
                                        <input
                                            type="checkbox"
                                            checked={formData.vesselAssigned}
                                            onChange={(event) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    vesselAssigned: event.target.checked,
                                                    assignedVesselIds: event.target.checked ? prev.assignedVesselIds : [],
                                                }))
                                            }
                                            className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary"
                                        />
                                        Vessel Assigned
                                    </label>
                                </div>

                                {formData.vesselAssigned && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                            Assigned Vessels
                                        </label>
                                        <Combobox
                                            options={availableVessels}
                                            value={formData.assignedVesselIds}
                                            onChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    assignedVesselIds: Array.isArray(value) ? value : [value],
                                                }))
                                            }
                                            multiple
                                            placeholder={
                                                availableVessels.length > 0
                                                    ? 'Select vessel(s)'
                                                    : 'No vessels available for this tenant'
                                            }
                                        />
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <UserAccessPermissionsSection
                                        roleType={formData.roleType}
                                        roleOptions={TENANT_ROLE_OPTIONS}
                                        onRoleChange={handleRoleChange}
                                        selectedPages={selectedPages}
                                        pageOptions={TENANT_PAGE_OPTIONS}
                                        onTogglePage={handlePageToggle}
                                        componentFields={componentFields}
                                        componentFieldOptions={TENANT_COMPONENT_FIELD_OPTIONS}
                                        onToggleComponentField={handleComponentFieldToggle}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-grey-100 dark:border-grey-800">
                            <Button
                                type="button"
                                variant="outline"
                                color="grey"
                                size="large"
                                onClick={navigateBack}
                                className="w-32"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                color="primary"
                                size="large"
                                leftIcon={<Plus size={18} />}
                                disabled={loading || quota.reached}
                                className="w-48"
                            >
                                {loading ? 'Creating...' : 'Create Sub User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
};

export default AddSubUserPage;
