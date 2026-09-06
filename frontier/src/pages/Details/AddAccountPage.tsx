import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService, RoleType } from '@/services/authService';
import { ApiException } from '@/lib/apiClient';
import { User, Mail, Lock, Plus, X } from 'lucide-react';
import { isAdmin } from '@/utils/rbac';
import PageLayout from '@/components/layout/PageLayout';
import { Heading2, BodyBase } from '@/components/ui/Typography';
import UserAccessPermissionsSection from '@/components/users/UserAccessPermissionsSection';
import {
    clonePermissionFields,
    isPlatformRoleType,
    PLATFORM_COMPONENT_FIELD_OPTIONS,
    PLATFORM_PAGE_OPTIONS,
    PLATFORM_ROLE_OPTIONS,
    PLATFORM_ROLE_PRESETS,
    PlatformRoleType,
} from '@/components/users/userFormConfig';

const DEFAULT_PLATFORM_ROLE: PlatformRoleType = 'admin';

interface AddAccountFormState {
    username: string;
    email: string;
    password: string;
    roleType: PlatformRoleType;
}

const AddAccountPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const defaultPreset = PLATFORM_ROLE_PRESETS[DEFAULT_PLATFORM_ROLE];

    const [formData, setFormData] = useState<AddAccountFormState>({
        username: '',
        email: '',
        password: '',
        roleType: DEFAULT_PLATFORM_ROLE,
    });
    const [selectedPages, setSelectedPages] = useState<string[]>([...defaultPreset.pages]);
    const [componentFields, setComponentFields] = useState<{ [key: string]: string[] }>(
        clonePermissionFields(defaultPreset.fields),
    );
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Default breadcrumbs based on previous views might be nice, but we'll use a standard one.
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', href: '#' },
        { label: 'Add a User', active: true }
    ];

    if (!isAdmin()) {
        return (
            <PageLayout breadcrumbItems={breadcrumbItems}>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <Heading2 className="text-grey-900 dark:text-white mb-2">Access Denied</Heading2>
                        <BodyBase className="text-grey-500">You don't have permission to view this page. Only Admins and Superadmins can create accounts.</BodyBase>
                    </div>
                </div>
            </PageLayout>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handlePageToggle = (pageId: string) => {
        if (selectedPages.includes(pageId)) {
            setSelectedPages(selectedPages.filter((p) => p !== pageId));
        } else {
            setSelectedPages([...selectedPages, pageId]);
        }
    };

    const handleComponentFieldToggle = (component: string, field: string) => {
        const currentFields = componentFields[component] || [];
        if (currentFields.includes(field)) {
            setComponentFields({
                ...componentFields,
                [component]: currentFields.filter((f) => f !== field),
            });
        } else {
            setComponentFields({
                ...componentFields,
                [component]: [...currentFields, field],
            });
        }
    };

    const applyRolePreset = (roleType: PlatformRoleType) => {
        const preset = PLATFORM_ROLE_PRESETS[roleType];

        setFormData((prev) => ({ ...prev, roleType }));
        setSelectedPages([...preset.pages]);
        setComponentFields(clonePermissionFields(preset.fields));
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.username || !formData.email || !formData.password) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        if (selectedPages.length === 0) {
            setError('Please select at least one page access');
            setLoading(false);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const success = await authService.signup({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                roleType: formData.roleType as RoleType,
                permissions: {
                    pages: selectedPages,
                    fields: componentFields,
                },
            });

            if (!success) {
                setError('Username or email already exists');
                return;
            }

            setSuccess(`Account "${formData.username}" created successfully!`);
            const resetPreset = PLATFORM_ROLE_PRESETS[DEFAULT_PLATFORM_ROLE];
            setFormData({ username: '', email: '', password: '', roleType: DEFAULT_PLATFORM_ROLE });
            setSelectedPages([...resetPreset.pages]);
            setComponentFields(clonePermissionFields(resetPreset.fields));
            // Navigate back to the Users list after a short delay
            setTimeout(() => onNavigate?.('platformUsers'), 1500);
        } catch (err) {
            if (err instanceof ApiException) {
                setError(err.errorMessage);
            } else {
                setError('An error occurred while creating. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (nextRoleType: string) => {
        if (!isPlatformRoleType(nextRoleType)) {
            return;
        }

        applyRolePreset(nextRoleType);
    };

    const actions = (
        <Button
            variant="outline"
            color="grey"
            size="small"
            onClick={() => onNavigate?.('platformUsers')}
            className="gap-2"
        >
            <X size={16} /> Cancel
        </Button>
    );

    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            <div className="p-6 max-w-5xl mx-auto w-full">
                <div className="mb-8">
                    <Heading2 className="text-grey-900 dark:text-white mb-2">Create Account</Heading2>
                    <BodyBase className="text-grey-500 dark:text-grey-400">
                        Create and configure a new tenant or user with specific role-based permissions.
                    </BodyBase>
                </div>

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
                    <form onSubmit={handleAddUser} className="space-y-8">
                        {/* Basis Information Section - similar flow to details view */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                        Username
                                    </label>
                                    <Input
                                        name="username"
                                        type="text"
                                        placeholder="Enter username"
                                        value={formData.username}
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
                                        placeholder="Enter secure password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        leftIcon={<Lock size={18} />}
                                        size="medium"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <UserAccessPermissionsSection
                                        roleType={formData.roleType}
                                        roleOptions={PLATFORM_ROLE_OPTIONS}
                                        onRoleChange={handleRoleChange}
                                        selectedPages={selectedPages}
                                        pageOptions={PLATFORM_PAGE_OPTIONS}
                                        onTogglePage={handlePageToggle}
                                        componentFields={componentFields}
                                        componentFieldOptions={PLATFORM_COMPONENT_FIELD_OPTIONS}
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
                                onClick={() => onNavigate?.('platformUsers')}
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
                                disabled={loading}
                                className="w-48"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
};

export default AddAccountPage;
