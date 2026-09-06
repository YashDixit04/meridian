import React, { useState, useEffect, useCallback } from 'react';
import type { Column } from '@/components/common/table/table';
import { Heading3 } from '../../components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { userColumns } from '@/data/usersdata';
import TenantTable from '@/components/common/listfield/tenanttable';
import PageLayout from '@/components/layout/PageLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Combobox from '@/components/ui/Combobox';
import { Plus, X, Pencil, Trash2, User as UserIcon, Mail, Lock, Shield, AlertTriangle } from 'lucide-react';
import tenantService from '@/services/tenantService';
import { authService, RoleType } from '@/services/authService';

interface PlatformUser {
    id: string;
    name: string;
    email: string;
    username: string;
    department: string;
    role: string;
    roleType: string;
    userType: string;
    avatar: string;
    _backendId: string;
    _tenantId: string;
    _rawRoleType: string;
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    adminusers: 'Admin User',
    tenantadmin: 'Tenant Admin',
    tenantadmin_subusers: 'Tenant Sub User',
};

const getRoleLabel = (roleType: string): string => ROLE_LABELS[roleType] ?? roleType;

const getDepartmentLabel = (roleType: string): string => {
    if (roleType === 'admin') {
        return 'Administration';
    }

    if (roleType === 'tenantadmin' || roleType === 'tenantadmin_subusers') {
        return 'Tenant Operations';
    }

    return 'Operations';
};

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'adminusers', label: 'Admin User' },
    { value: 'tenantadmin', label: 'Tenant Admin' },
];

const FILTER_ROLE_OPTIONS = ['All', 'Admin', 'Admin User', 'Tenant Admin'];

const Users: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [selectedRole, setSelectedRole] = useState<string>('All');

    // Edit modal state
    const [editUser, setEditUser] = useState<PlatformUser | null>(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', roleType: 'admin' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    // Delete modal state
    const [deleteUser, setDeleteUser] = useState<PlatformUser | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const session = authService.getSession();
    const tenantId = session?.tenantId || '';

    const fetchUsers = useCallback(async () => {
        if (!tenantId) return;
        try {
            setIsLoading(true);
            const data = await tenantService.getPlatformUsers(tenantId);
            const mapped: PlatformUser[] = data.map((u: any) => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`.trim() || u.username || u.email,
                email: u.email,
                username: u.username || u.email.split('@')[0],
                department: getDepartmentLabel(u.roleType),
                role: getRoleLabel(u.roleType),
                roleType: getRoleLabel(u.roleType),
                userType: u.role === 'ADMIN' ? 'Internal' : 'External',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName || u.email)}&bg=random`,
                _backendId: u.id,
                _tenantId: u.tenantId,
                _rawRoleType: u.roleType,
            }));
            setUsers(mapped);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Edit handlers ────────────────────────────────────────────────────────
    const openEdit = (user: PlatformUser) => {
        setEditUser(user);
        const parts = user.name.split(' ');
        setEditForm({
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || '',
            email: user.email,
            username: user.username,
            password: '',   // blank = don't change
            roleType: user._rawRoleType,
        });
        setEditError('');
    };

    const handleEditSave = async () => {
        if (!editUser) return;
        setEditLoading(true);
        setEditError('');
        try {
            const payload: any = {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                username: editForm.username,
                roleType: editForm.roleType,
                role: editForm.roleType === 'admin' ? 'ADMIN' : 'USER',
            };
            if (editForm.password.length >= 6) {
                payload.password = editForm.password;
            } else if (editForm.password.length > 0) {
                setEditError('Password must be at least 6 characters');
                setEditLoading(false);
                return;
            }
            await tenantService.updateTenantUser(editUser._tenantId, editUser._backendId, payload);
            setEditUser(null);
            await fetchUsers();
        } catch (err) {
            setEditError('Failed to update user. Please try again.');
        } finally {
            setEditLoading(false);
        }
    };

    // ── Delete handlers ──────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteUser) return;
        setDeleteLoading(true);
        try {
            await tenantService.deleteTenantUser(deleteUser._tenantId, deleteUser._backendId);
            setDeleteUser(null);
            await fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Layout helpers ───────────────────────────────────────────────────────
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', active: true },
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <Button variant="solid" color="primary" size="small"
                leftIcon={<Plus size={14} />}
                onClick={() => onNavigate?.('addAccount')}
            >
                Add User
            </Button>
        </div>
    );

    // ── Filter logic ─────────────────────────────────────────────────────────
    const departments = ['All', ...Array.from(new Set(users.map(u => u.department)))];
    const availableRoles = FILTER_ROLE_OPTIONS;

    const searchPredicate = (row: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            row.name.toLowerCase().includes(term) ||
            row.email.toLowerCase().includes(term) ||
            row.role.toLowerCase().includes(term);
        const matchesDept = selectedDepartment === 'All' || row.department === selectedDepartment;
        const matchesRole = selectedRole === 'All' || row.role === selectedRole;
        return matchesSearch && matchesDept && matchesRole;
    };

    // Add Edit + Delete columns dynamically — using the correct Column<T> shape
    const columnsWithActions: Column<PlatformUser>[] = [
        ...userColumns as any,
        {
            header: '',
            className: 'text-right w-20',
            cell: (row: PlatformUser) => (
                <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg text-grey-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit user"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => setDeleteUser(row)}
                        className="p-1.5 rounded-lg text-grey-400 hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete user"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    const filters = (
        <div className="flex items-center gap-2">
            <div className="w-40">
                <Combobox
                    options={departments.map(d => ({ value: d, label: d === 'All' ? 'All Departments' : d }))}
                    value={selectedDepartment}
                    onChange={(val) => { setSelectedDepartment(val as string); setSelectedRole('All'); }}
                    placeholder="All Departments" size="small"
                />
            </div>
            <div className="w-36 hidden sm:block">
                <Combobox
                    options={availableRoles.map(r => ({ value: r, label: r === 'All' ? 'All Roles' : r }))}
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val as string)}
                    placeholder="All Roles" size="small"
                />
            </div>
        </div>
    );

    const renderUserGrid = (data: any[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((user) => (
                <div key={user.id}
                    className="p-4 rounded-xl border border-grey-200 dark:border-grey-800 bg-white dark:bg-[#0A0A0D] hover:border-primary/50 transition-colors flex flex-col gap-3"
                >
                    <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} size="md" />
                        <div className="flex flex-col overflow-hidden flex-1">
                            <span className="font-medium text-grey-900 dark:text-white truncate">{user.name}</span>
                            <span className="text-xs text-primary truncate">{user.email}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-grey-500">Role</span>
                            <span className="font-medium text-grey-900 dark:text-white">{user.role}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-grey-500">Type</span>
                            <Badge variant="soft"
                                color={user.userType === 'Internal' ? 'success' : 'warning'}
                                className="rounded-full px-2 py-0 text-[10px]"
                            >{user.userType}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-grey-100 dark:border-grey-800">
                        <button onClick={() => openEdit(user)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-grey-600 hover:text-primary hover:bg-primary/5 transition-colors"
                        ><Pencil size={12} /> Edit</button>
                        <button onClick={() => setDeleteUser(user)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-grey-600 hover:text-danger hover:bg-danger/5 transition-colors"
                        ><Trash2 size={12} /> Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center h-full p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : users.length > 0 ? (
                    <div className="flex-1 flex flex-col p-6">
                        <TenantTable
                            data={users}
                            columns={columnsWithActions}
                            searchPredicate={searchPredicate}
                            filters={filters}
                            renderGrid={renderUserGrid}
                            onRowClick={() => { }}
                            createButtonLabel="Add User"
                            onCreateClick={() => onNavigate?.('addAccount')}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
                        <div className="flex flex-col items-center gap-6 max-w-md text-center">
                            <img src="/nousers.svg" alt="No Users Found" className="w-64 h-64 object-contain opacity-80" />
                            <Heading3 className="text-grey-900 dark:text-white">No Users Found</Heading3>
                            <p className="text-grey-500 dark:text-grey-400">
                                No platform users yet. Click "Add User" to create one.
                            </p>
                            <Button variant="solid" color="primary" size="small"
                                leftIcon={<Plus size={14} />}
                                onClick={() => onNavigate?.('addAccount')}
                            >Add User</Button>
                        </div>
                    </div>
                )}
            </PageLayout>

            {/* ── Edit Modal ──────────────────────────────────────────────────── */}
            {editUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0A0A0D] rounded-2xl border border-grey-200 dark:border-grey-800 p-8 shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white">Edit User</h3>
                            <button onClick={() => setEditUser(null)} className="text-grey-400 hover:text-grey-600">
                                <X size={20} />
                            </button>
                        </div>
                        {editError && (
                            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{editError}</div>
                        )}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">First Name</label>
                                    <Input name="firstName" type="text" placeholder="First name"
                                        value={editForm.firstName}
                                        onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                                        leftIcon={<UserIcon size={16} />} size="medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Last Name</label>
                                    <Input name="lastName" type="text" placeholder="Last name"
                                        value={editForm.lastName}
                                        onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                                        size="medium" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Username</label>
                                <Input name="username" type="text" placeholder="username"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    leftIcon={<UserIcon size={16} />} size="medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Email</label>
                                <Input name="email" type="email" placeholder="email@example.com"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    leftIcon={<Mail size={16} />} size="medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                                    New Password <span className="text-grey-400 font-normal">(leave blank to keep current)</span>
                                </label>
                                <Input name="password" type="password" placeholder="Min 6 characters"
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                    leftIcon={<Lock size={16} />} size="medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Role</label>
                                <div className="relative">
                                    <select
                                        value={editForm.roleType}
                                        onChange={e => setEditForm({ ...editForm, roleType: e.target.value })}
                                        className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-lg text-grey-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                    >
                                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                    <Shield size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" color="grey" size="small" onClick={() => setEditUser(null)}>Cancel</Button>
                            <Button variant="solid" color="primary" size="small" onClick={handleEditSave} disabled={editLoading}>
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
            {deleteUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0A0A0D] rounded-2xl border border-grey-200 dark:border-grey-800 p-8 shadow-xl max-w-sm w-full text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-danger/10 rounded-full">
                                <AlertTriangle size={28} className="text-danger" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-grey-900 dark:text-white mb-2">Delete User</h3>
                        <p className="text-sm text-grey-500 dark:text-grey-400 mb-6">
                            Are you sure you want to delete <strong className="text-grey-900 dark:text-white">{deleteUser.name}</strong>?<br />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" color="grey" size="small" className="flex-1" onClick={() => setDeleteUser(null)}>Cancel</Button>
                            <Button variant="solid" color="danger" size="small" className="flex-1" onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;
