import React, { useState, useEffect } from 'react';
import { Heading3 } from '../components/ui/Typography';
import Button from '@/components/ui/Button';
import { Calendar, ChevronDown } from 'lucide-react';
import { User, userColumns } from '@/data/usersdata';
import TenantTable from '@/components/common/listfield/tenanttable';
import PageLayout from '@/components/layout/PageLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Combobox from '@/components/ui/Combobox';

const Users: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
    const [selectedRole, setSelectedRole] = useState<string>('All');

    useEffect(() => {
        // Fetch users from the JSON file
        const fetchUsers = async () => {
            try {
                const data = await import('@/data/json/users.json');
                setUsers(data.default || data);
            } catch (error) {
                console.error("Failed to load users data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Users', active: true }
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            {/* Date Picker Trigger */}
            <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
                <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
                <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
            </div>

            {/* Account Settings Button */}
            <Button variant="solid" color="primary" size="small">
                Account Settings
            </Button>
        </div>
    );

    const hasData = users && users.length > 0;

    // Filter logic
    const departments = ['All', ...Array.from(new Set(users.map(user => user.department)))];
    const availableRoles = ['All', ...Array.from(new Set(
        users
            .filter(user => selectedDepartment === 'All' || user.department === selectedDepartment)
            .map(user => user.role)
    ))];

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        setSelectedRole('All');
    };

    const searchPredicate = (row: User, searchTerm: string) => {
        const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              row.role.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = selectedDepartment === 'All' || row.department === selectedDepartment;
        const matchesRole = selectedRole === 'All' || row.role === selectedRole;

        return matchesSearch && matchesDepartment && matchesRole;
    };

    const departmentOptions = departments.map(dept => ({
        value: dept,
        label: dept === 'All' ? 'All Departments' : dept
    }));

    const roleOptions = availableRoles.map(role => ({
        value: role,
        label: role === 'All' ? 'All Roles' : role
    }));

    const filters = (
        <div className="flex items-center gap-2">
            <div className="w-40">
                <Combobox
                    options={departmentOptions}
                    value={selectedDepartment}
                    onChange={(val) => handleDepartmentChange(val as string)}
                    placeholder="All Departments"
                    size="small"
                />
            </div>
            <div className="w-36 hidden sm:block">
                <Combobox
                    options={roleOptions}
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val as string)}
                    placeholder="All Roles"
                    size="small"
                />
            </div>
        </div>
    );

    const renderUserGrid = (data: User[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((user) => (
                <div 
                    key={user.id} 
                    className="p-4 rounded-xl border border-grey-200 dark:border-grey-800 bg-white dark:bg-[#0A0A0D] hover:border-primary/50 cursor-pointer transition-colors flex flex-col gap-4"
                    onClick={() => onNavigate?.('userDetails')}
                >
                    <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} size="md" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-grey-900 dark:text-white truncate">{user.name}</span>
                            <span className="text-xs text-primary truncate">{user.email}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-grey-500">Department</span>
                            <span className="font-medium text-grey-900 dark:text-white">{user.department}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-grey-500">Role</span>
                            <span className="text-grey-900 dark:text-white">{user.role}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-grey-500">Type</span>
                            <Badge
                                variant="soft"
                                color={user.userType === 'Internal' ? 'success' : user.userType === 'External' ? 'warning' : 'primary'}
                                className="rounded-full px-2 py-0 text-[10px]"
                            >
                                {user.userType}
                            </Badge>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : hasData ? (
                <div className="flex-1 flex flex-col p-6">
                    <TenantTable
                        data={users}
                        columns={userColumns}
                        searchPredicate={searchPredicate}
                        filters={filters}
                        renderGrid={renderUserGrid}
                        onRowClick={() => onNavigate?.('userDetails')}
                        createButtonLabel="Add User"
                        onCreateClick={() => console.log('Add User clicked')}
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

export default Users;
