import React, { useEffect, useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import { SubUser, subUsersColumns } from '@/data/subUsersData';
import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import Input from '@/components/ui/Input';
import { ApiException } from '@/lib/apiClient';
import UserAccessPermissionsSection from '@/components/users/UserAccessPermissionsSection';
import {
    Building2,
    Calendar,
    ChevronDown,
    Lock,
    Mail,
    Pencil,
    Plus,
    User,
    X,
} from 'lucide-react';
import { authService } from '@/services/authService';

import tenantService, { TenantUser } from '@/services/tenantService';
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

interface SubUserFormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleType: TenantRoleType;
    department: string;
    vesselAssigned: boolean;
    assignedVesselIds: string[];
    pages: string[];
    fields: PermissionFields;
}

const sanitizeFields = (value: unknown): PermissionFields => {
    if (!value || typeof value !== 'object') {
        return {};
    }

    const result: PermissionFields = {};
    for (const [component, fields] of Object.entries(value as Record<string, unknown>)) {
        if (!Array.isArray(fields)) {
            continue;
        }
        result[component] = fields.filter((field): field is string => typeof field === 'string');
    }

    return result;
};

const getRoleLabel = (roleType?: string): string =>
    roleType === 'tenantadmin' ? 'Tenant Admin' : 'Tenant Sub Admin';

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString();
};

const validateForm = (form: SubUserFormState, requirePassword: boolean, departmentOptions: string[]): string | null => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
        return 'First name, last name, and email are required.';
    }

    if (requirePassword && form.password.trim().length < 6) {
        return 'Password must be at least 6 characters.';
    }

    if (!requirePassword && form.password.trim().length > 0 && form.password.trim().length < 6) {
        return 'Password must be at least 6 characters if provided.';
    }

    if (!isTenantRoleType(form.roleType)) {
        return 'Role must be Tenant Admin or Tenant Sub Admin.';
    }

    if (!departmentOptions.includes(form.department)) {
        return 'Please select a valid department.';
    }

    if (form.vesselAssigned && form.assignedVesselIds.length === 0) {
        return 'Select at least one vessel when vessel assignment is enabled.';
    }

    if (form.pages.length === 0) {
        return 'Select at least one page permission.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
        return 'Please provide a valid email address.';
    }

    return null;
};

const mapTenantUserToRow = (user: TenantUser, index: number, departmentOptions: string[]): SubUser => {
    const roleType: TenantRoleType = user.roleType === 'tenantadmin' ? 'tenantadmin' : 'tenantadmin_subusers';

    return {
        id: index + 1,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        role: getRoleLabel(user.roleType),
        department: user.department || departmentOptions[0] || 'Unknown',
        vesselAssigned: user.vesselAssigned ? 'Yes' : 'No',
        status: 'Active',
        createdAt: formatDateTime(user.createdAt),
        _backendId: user.id,
        _tenantId: user.tenantId,
        _roleType: roleType,
        _firstName: user.firstName,
        _lastName: user.lastName,
        _assignedVesselIds: user.assignedVesselIds || [],
        _permissions: {
            pages: Array.isArray(user.permissions?.pages)
                ? user.permissions.pages.filter((page): page is string => typeof page === 'string')
                : [],
            fields: sanitizeFields(user.permissions?.fields),
        },
    };
};

const SubUsersPage: React.FC<{ tenantId?: string; onNavigate?: (tab: string) => void }> = ({
    tenantId: propTenantId,
    onNavigate,
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [subUsers, setSubUsers] = useState<SubUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [editingUser, setEditingUser] = useState<SubUser | null>(null);
    const [editForm, setEditForm] = useState<SubUserFormState | null>(null);
    const [editError, setEditError] = useState('');
    const [creating, setCreating] = useState(false);
    const [availableVessels, setAvailableVessels] = useState<Array<{ value: string; label: string }>>([]);
    const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
    const [quota, setQuota] = useState<{ limit: number; current: number; reached: boolean } | null>(null);

    const session = authService.getSession();
    const tenantId = propTenantId || session?.tenantId || '';

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
                const current = details?.usersCount ?? 0;
                setQuota({ limit: userLimit, current, reached: current >= userLimit });
            } catch (err) {
                console.error('Failed to load initial data for edit assignment:', err);
                setAvailableVessels([]);
                setDepartmentOptions(getDepartmentOptions());
            }
        };

        loadInitialData();
    }, [tenantId]);

    const fetchSubUsers = async () => {
        if (!tenantId) {
            setSubUsers([]);
            setIsLoading(false);
            setPageError('Tenant context is missing. Open this page from Tenant Details.');
            return;
        }
        try {
            setIsLoading(true);

            const users = await tenantService.getTenantScopedUsers(tenantId);
            setSubUsers(users.map((u, i) => mapTenantUserToRow(u, i, departmentOptions)));
            setPageError('');
        } catch (err) {
            console.error('Failed to fetch sub-users:', err);
            setSubUsers([]);
            setPageError('Failed to load tenant sub users. Please refresh and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (departmentOptions.length > 0) {
            fetchSubUsers();
        }
    }, [tenantId, departmentOptions]);

    const openEditModal = (row: SubUser) => {
        if (!row._backendId) {
            return;
        }

        const roleType: TenantRoleType = row._roleType === 'tenantadmin' ? 'tenantadmin' : 'tenantadmin_subusers';
        const preset = TENANT_ROLE_PRESETS[roleType];
        const sourcePages = row._permissions?.pages?.length ? row._permissions.pages : preset.pages;
        const sourceFields = Object.keys(row._permissions?.fields || {}).length
            ? row._permissions!.fields
            : preset.fields;

        setEditingUser(row);
        setEditForm({
            firstName: row._firstName || row.name.split(' ')[0] || '',
            lastName: row._lastName || row.name.split(' ').slice(1).join(' '),
            email: row.email,
            password: '',
            roleType,
            department: row.department,
            vesselAssigned: row.vesselAssigned === 'Yes',
            assignedVesselIds: row._assignedVesselIds || [],
            pages: [...sourcePages],
            fields: clonePermissionFields(sourceFields),
        });
        setEditError('');
    };

    const tableColumns = subUsersColumns.map((column) => {
        if (column.header !== 'Action') {
            return column;
        }

        return {
            ...column,
            cell: (row: SubUser) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            openEditModal(row);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-grey-200 dark:border-grey-700 px-2 py-1 text-xs font-medium text-grey-700 dark:text-grey-300 hover:border-primary/40 hover:text-primary transition-colors"
                    >
                        <Pencil size={12} /> Edit
                    </button>
                </div>
            ),
        };
    });

    const toggleEditPage = (pageId: string) => {
        setEditForm((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                pages: prev.pages.includes(pageId)
                    ? prev.pages.filter((page) => page !== pageId)
                    : [...prev.pages, pageId],
            };
        });
    };

    const toggleEditField = (component: string, field: string) => {
        setEditForm((prev) => {
            if (!prev) {
                return prev;
            }

            const currentFields = prev.fields[component] || [];
            const nextFields = currentFields.includes(field)
                ? currentFields.filter((item) => item !== field)
                : [...currentFields, field];

            return {
                ...prev,
                fields: {
                    ...prev.fields,
                    [component]: nextFields,
                },
            };
        });
    };

    const applyEditRolePreset = (roleType: TenantRoleType) => {
        const preset = TENANT_ROLE_PRESETS[roleType];
        setEditForm((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                roleType,
                pages: [...preset.pages],
                fields: clonePermissionFields(preset.fields),
            };
        });
    };

    const handleUpdate = async () => {
        if (!editingUser || !editForm || !editingUser._backendId) {
            return;
        }

        const validationError = validateForm(editForm, false, departmentOptions);
        if (validationError) {
            setEditError(validationError);
            return;
        }

        if (!tenantId) {
            setEditError('Missing tenant context. Please open this page from Tenant Details.');
            return;
        }

        setCreating(true);
        setEditError('');

        try {
            const payload: Parameters<typeof tenantService.updateTenantUser>[2] = {
                email: editForm.email.trim(),
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                roleType: editForm.roleType,
                department: editForm.department,
                vesselAssigned: editForm.vesselAssigned,
                assignedVesselIds: editForm.vesselAssigned ? editForm.assignedVesselIds : [],
                permissions: {
                    pages: editForm.pages,
                    fields: editForm.fields,
                },
            };

            const password = editForm.password.trim();
            if (password.length > 0) {
                payload.password = password;
            }

            await tenantService.updateTenantUser(tenantId, editingUser._backendId, {
                ...payload,
            });

            setEditingUser(null);
            setEditForm(null);
            await fetchSubUsers();
        } catch (err) {
            console.error('Failed to update sub-user:', err);
            if (err instanceof ApiException) {
                setEditError(err.errorMessage);
            } else {
                setEditError('Failed to update sub user. Please try again.');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!editingUser || !editingUser._backendId || !tenantId) {
            return;
        }

        const confirmed = window.confirm(`Delete ${editingUser.name}? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        setCreating(true);
        setEditError('');

        try {
            await tenantService.deleteTenantUser(tenantId, editingUser._backendId);
            setEditingUser(null);
            setEditForm(null);
            await fetchSubUsers();
        } catch (err) {
            console.error('Failed to delete sub-user:', err);
            if (err instanceof ApiException) {
                setEditError(err.errorMessage);
            } else {
                setEditError('Failed to delete sub user. Please try again.');
            }
        } finally {
            setCreating(false);
        }
    };

    const navigateToCreatePage = () => {
        if (!tenantId) {
            setPageError('Tenant context is missing. Open this page from Tenant Details.');
            return;
        }

        onNavigate?.(`/tenant/${tenantId}/sub-users/new`);
    };

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenant', href: '#' },
        { label: 'Sub Users', href: '#', active: true },
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
                <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
                <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
            </div>
            <Button
                variant="solid"
                color="primary"
                size="small"
                onClick={navigateToCreatePage}
                disabled={quota?.reached}
                title={quota?.reached ? 'User limit reached for your subscription plan' : undefined}
            >
                <Plus size={14} className="mr-1" /> Add Sub User
            </Button>
        </div>
    );

    return (
        <>
            <GenericTablePage
                breadcrumbItems={breadcrumbItems}
                data={subUsers}
                columns={tableColumns}
                createButtonLabel="Add Sub User"
                onCreateClick={navigateToCreatePage}
                itemsPerPage={7}
                viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
                viewMode={viewMode}
                actions={actions}
                customContent={
                    <>
                        {isLoading && (
                            <div className="rounded-lg border border-primary/20 bg-primary-soft px-4 py-2 text-sm text-primary">
                                Loading tenant-scoped sub users...
                            </div>
                        )}
                        {pageError && (
                            <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger">
                                {pageError}
                            </div>
                        )}
                        {quota && (
                            <div className="flex items-center justify-between rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-900/50 px-4 py-2 text-xs text-grey-700 dark:text-grey-300">
                                <span>Plan User Quota: <strong>{subUsers.length}</strong> / <strong>{quota.limit}</strong> active users</span>
                                {quota.reached ? (
                                    <span className="font-semibold text-warning">Quota Full — Upgrade Plan to add more</span>
                                ) : (
                                    <span className="text-success font-medium">{quota.limit - subUsers.length} slots remaining</span>
                                )}
                            </div>
                        )}
                    </>
                }
            />

            {/* Edit Sub User Modal */}
            {editingUser && editForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0A0A0D] rounded-2xl border border-grey-200 dark:border-grey-800 p-8 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white">Edit Sub User</h3>
                            <button
                                onClick={() => {
                                    setEditingUser(null);
                                    setEditForm(null);
                                    setEditError('');
                                }}
                                className="text-grey-400 hover:text-grey-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {editError && (
                            <div className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                                {editError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">First Name</label>
                                <Input
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter first name"
                                    value={editForm.firstName}
                                    onChange={(event) => setEditForm({ ...editForm, firstName: event.target.value })}
                                    leftIcon={<User size={18} />}
                                    size="medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Last Name</label>
                                <Input
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter last name"
                                    value={editForm.lastName}
                                    onChange={(event) => setEditForm({ ...editForm, lastName: event.target.value })}
                                    leftIcon={<User size={18} />}
                                    size="medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Email Address</label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="user@company.com"
                                    value={editForm.email}
                                    onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
                                    leftIcon={<Mail size={18} />}
                                    size="medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Password (Optional)</label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Leave blank to keep existing"
                                    value={editForm.password}
                                    onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
                                    leftIcon={<Lock size={18} />}
                                    size="medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Department</label>
                                <div className="relative">
                                    <select
                                        value={editForm.department}
                                        onChange={(event) => setEditForm({ ...editForm, department: event.target.value })}
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
                                        checked={editForm.vesselAssigned}
                                        onChange={(event) =>
                                            setEditForm({
                                                ...editForm,
                                                vesselAssigned: event.target.checked,
                                                assignedVesselIds: event.target.checked ? editForm.assignedVesselIds : [],
                                            })
                                        }
                                        className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary"
                                    />
                                    Vessel Assigned
                                </label>
                            </div>

                            {editForm.vesselAssigned && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Assigned Vessels
                                    </label>
                                    <Combobox
                                        options={availableVessels}
                                        value={editForm.assignedVesselIds}
                                        onChange={(value) =>
                                            setEditForm({
                                                ...editForm,
                                                assignedVesselIds: Array.isArray(value) ? value : [value],
                                            })
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
                        </div>

                        <div className="mt-6">
                            <UserAccessPermissionsSection
                                roleType={editForm.roleType}
                                roleOptions={TENANT_ROLE_OPTIONS}
                                onRoleChange={(roleType) => {
                                    if (!isTenantRoleType(roleType)) {
                                        return;
                                    }

                                    applyEditRolePreset(roleType);
                                }}
                                selectedPages={editForm.pages}
                                pageOptions={TENANT_PAGE_OPTIONS}
                                onTogglePage={toggleEditPage}
                                componentFields={editForm.fields}
                                componentFieldOptions={TENANT_COMPONENT_FIELD_OPTIONS}
                                onToggleComponentField={toggleEditField}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" color="danger" size="small" onClick={handleDelete} disabled={creating}>
                                Delete User
                            </Button>
                            <Button
                                variant="outline"
                                color="grey"
                                size="small"
                                onClick={() => {
                                    setEditingUser(null);
                                    setEditForm(null);
                                    setEditError('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button variant="solid" color="primary" size="small" onClick={handleUpdate} disabled={creating}>
                                {creating ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SubUsersPage;
