import React from 'react';
import { Shield } from 'lucide-react';

export interface UserRoleOption {
    value: string;
    label: string;
}

export interface UserPageOption {
    id: string;
    label: string;
}

export interface UserComponentFieldOption {
    component: string;
    fields: string[];
}

interface UserAccessPermissionsSectionProps {
    roleType: string;
    roleOptions: UserRoleOption[];
    onRoleChange: (roleType: string) => void;
    roleHelpText?: string;
    selectedPages: string[];
    pageOptions: UserPageOption[];
    onTogglePage: (pageId: string) => void;
    componentFields: Record<string, string[]>;
    componentFieldOptions: UserComponentFieldOption[];
    onToggleComponentField: (component: string, field: string) => void;
}

const UserAccessPermissionsSection: React.FC<UserAccessPermissionsSectionProps> = ({
    roleType,
    roleOptions,
    onRoleChange,
    roleHelpText = 'Selecting a role will auto-populate recommended permissions.',
    selectedPages,
    pageOptions,
    onTogglePage,
    componentFields,
    componentFieldOptions,
    onToggleComponentField,
}) => {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">
                    Role Type
                </label>
                <div className="relative">
                    <select
                        name="roleType"
                        value={roleType}
                        onChange={(event) => onRoleChange(event.target.value)}
                        className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-lg text-grey-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-colors"
                        required
                    >
                        {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Shield size={18} className="text-grey-400" />
                    </div>
                </div>
                <p className="text-xs text-grey-500 dark:text-grey-400 mt-1.5">{roleHelpText}</p>
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                    Page Access Permissions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pageOptions.map((page) => (
                        <label
                            key={page.id}
                            className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedPages.includes(page.id)
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-grey-200 dark:border-grey-800 bg-grey-50 dark:bg-grey-900 hover:border-primary/50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedPages.includes(page.id)}
                                onChange={() => onTogglePage(page.id)}
                                className="rounded border-grey-300 text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-sm font-medium text-grey-700 dark:text-grey-300">
                                {page.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-grey-900 dark:text-white border-b border-grey-100 dark:border-grey-800 pb-2">
                    Component Field Permissions
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {componentFieldOptions.map((component) => (
                        <div
                            key={component.component}
                            className="p-4 rounded-xl border border-grey-200 dark:border-grey-800 bg-grey-50/50 dark:bg-grey-900/50"
                        >
                            <p className="text-sm font-semibold text-grey-800 dark:text-grey-200 mb-3 capitalize">
                                {component.component.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {component.fields.map((field) => {
                                    const isSelected = (componentFields[component.component] || []).includes(field);
                                    return (
                                        <label
                                            key={field}
                                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${isSelected
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-grey-200 dark:border-grey-700 bg-white dark:bg-[#0A0A0D] text-grey-600 dark:text-grey-400 hover:border-primary/30'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleComponentField(component.component, field)}
                                                className="sr-only"
                                            />
                                            <span className="text-xs font-medium">{field}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default UserAccessPermissionsSection;
