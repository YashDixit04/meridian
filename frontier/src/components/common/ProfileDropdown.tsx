
import React, { useRef, useEffect } from 'react';
import {
  User, Settings, Bell, Moon, Sun, Keyboard, Gift, Download, HelpCircle, LogOut,
  ChevronRight, VolumeX, Clock, ExternalLink
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Switch from '../ui/Switch';
import { useAuth, getRoleDisplayName } from '../../utils/rbac';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  onLogout?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleTheme,
  triggerRef,
  onLogout
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-grey-50 border border-grey-200 dark:border-grey-200 absolute top-full right-0 mt-3 w-80 rounded-2xl shadow-xl shadow-grey-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 origin-top-right"
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-center gap-3">
        <Avatar
          src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&h=256&auto=format&fit=crop"
          alt={user?.username || 'User'}
          size="lg"
          status="online"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold leading-tight text-dark truncate">{user?.username || 'User'}</h4>
          <p className="text-xs text-grey-500 truncate">{user?.email || ''}</p>
          <p className="text-[10px] text-primary font-medium mt-0.5">
            {getRoleDisplayName(user?.roleType)}
          </p>
        </div>
      </div>

      {/* Status Input */}
      <div className="px-4 pb-4 border-b border-grey-200 dark:border-grey-200">
        <Input
          placeholder="Set status"
          size="small"
          leftIcon={<Clock size={14} />}
          className="!rounded-full !bg-grey-50 dark:!bg-grey-200 !border-transparent focus-within:!bg-white dark:focus-within:!bg-black focus-within:!ring-1 focus-within:!ring-grey-200 dark:focus-within:!ring-grey-800"
        />
      </div>

      {/* Group 1 */}
      <div className="py-2 border-b border-grey-200 dark:border-grey-200">
        <MenuItem icon={<VolumeX size={18} />} label="Mute notifications" rightElement={<ChevronRight size={16} />} />
        <MenuItem icon={<User size={18} />} label="Profile" />
        <MenuItem icon={<Settings size={18} />} label="Settings" />
        <MenuItem icon={<Bell size={18} />} label="Notification settings" />
      </div>

      <div className="py-2 border-b border-grey-200 dark:border-grey-200">
        <div
          className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-grey-50 dark:hover:bg-grey-200 transition-colors cursor-pointer text-dark"
          onClick={toggleTheme}
        >
          <div className="flex items-center gap-3">
            <span className="text-grey-500"><Moon size={18} /></span>
            <span>Dark mode</span>
          </div>
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            className="pointer-events-none"
            iconOff={<Sun size={12} className="text-grey-400" />}
            iconOn={<Moon size={12} className="text-primary" />}
          />
        </div>
      </div>

      {/* Group 3 */}
      <div className="py-2 border-b border-grey-200 dark:border-grey-200">
        <MenuItem icon={<Keyboard size={18} />} label="Keyboard shortcuts" />
        <MenuItem
          icon={<Gift size={18} />}
          label="Referrals"
          rightElement={<Badge variant="soft" color="info" size="small" className="text-[10px] px-1.5 py-0.5 font-bold">New</Badge>}
        />
        <MenuItem icon={<Download size={18} />} label="Download apps" rightElement={<ExternalLink size={14} />} />
        <MenuItem icon={<HelpCircle size={18} />} label="Help" rightElement={<ExternalLink size={14} />} />
      </div>

      {/* Group 4 - Logout */}
      <div className="py-2">
        <MenuItem icon={<LogOut size={18} />} label="Log out" onClick={handleLogout} />
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, rightElement, onClick, className = '' }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-grey-50 dark:hover:bg-grey-200 transition-colors text-dark ${className}`}
  >
    <div className="flex items-center gap-3">
      <span className="text-grey-500">{icon}</span>
      <span>{label}</span>
    </div>
    {rightElement && <div className="text-grey-400">{rightElement}</div>}
  </button>
);

export default ProfileDropdown;
