
import React from 'react';

interface SidebarProps {
  isDarkMode?: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}
import {
  LayoutGrid,
  ShieldCheck,
  BadgePercent,
  Wallet,
  MousePointer2,
  Cpu,
  HelpCircle,
  Settings,
  Users,
  Building2,
  UserCog,
  Ship,
  ShoppingCart,
  BookOpen,
  FileText,
  Activity
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { filterMenuByPermissions, isAdmin, isSuperAdmin } from '../../utils/rbac';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  id?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <Tooltip content={label} position="right" delay={0} className="z-50">
      <button
        onClick={onClick}
        className={`
          w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group relative
          ${isActive
            ? 'bg-primary text-white shadow-md shadow-primary/25'
            : 'text-grey-400 hover:text-primary hover:bg-primary-soft dark:hover:bg-grey-800'
          }
        `}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} strokeWidth={1.5} /> },
    ...(isAdmin() ? [
      { id: 'users', label: 'Tenants', icon: <Building2 size={18} strokeWidth={1.5} /> },
      { id: 'platformUsers', label: 'Users', icon: <Users size={18} strokeWidth={1.5} /> },
    ] : []),
    ...(isSuperAdmin()
      ? [{ id: 'superadminCatalogue', label: 'Catalogue', icon: <BookOpen size={18} strokeWidth={1.5} /> }]
      : []),
    ...(!isAdmin() ? [
      { id: 'tenantSubUsers', label: 'Sub Users', icon: <Users size={18} strokeWidth={1.5} /> },
      { id: 'tenantVendors', label: 'Vendors', icon: <UserCog size={18} strokeWidth={1.5} /> },
      { id: 'tenantVessels', label: 'Vessels', icon: <Ship size={18} strokeWidth={1.5} /> },
      { id: 'tenantOrders', label: 'Requisitions', icon: <ShoppingCart size={18} strokeWidth={1.5} /> },
      { id: 'tenantCatalogue', label: 'Catalogue', icon: <BookOpen size={18} strokeWidth={1.5} /> },
      { id: 'tenantDocuments', label: 'Documents', icon: <FileText size={18} strokeWidth={1.5} /> },
      { id: 'tenantActivityLogs', label: 'Activity Logs', icon: <Activity size={18} strokeWidth={1.5} /> }
    ] : []),
    { id: 'security', label: 'Security', icon: <ShieldCheck size={18} strokeWidth={1.5} /> },
    { id: 'offers', label: 'Offers', icon: <BadgePercent size={18} strokeWidth={1.5} /> },
    { id: 'finance', label: 'Finance', icon: <Wallet size={18} strokeWidth={1.5} /> },
    { id: 'actions', label: 'Actions', icon: <MousePointer2 size={18} strokeWidth={1.5} /> },
    { id: 'integrations', label: 'Integrations', icon: <Cpu size={18} strokeWidth={1.5} /> },
  ];

  // Filter menu items based on user permissions
  const accessibleMenuItems = filterMenuByPermissions(menuItems);

  // Bottom actions
  const bottomActions = [
    { id: 'userDetails', label: 'Settings', icon: <Settings size={18} strokeWidth={1.5} /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle size={18} strokeWidth={1.5} /> },
  ];

  const accessibleBottomActions = filterMenuByPermissions(bottomActions);

  return (
    <aside className="hidden md:flex w-16 flex-col items-center py-2 sticky top-[56px] h-[calc(100vh-56px)] bg-grey-50 dark:bg-grey-50 z-20">

      {/* Main Navigation */}
      <div className="flex flex-col gap-2 w-full items-center">
        {accessibleMenuItems.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-2 w-full items-center">
        {accessibleBottomActions.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;