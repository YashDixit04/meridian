
import React, { useState, useRef } from 'react';
import { Search, MessageSquare, ShoppingCart, Bell } from 'lucide-react';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import ProfileDropdown from '../common/ProfileDropdown';
import { useCart } from '../../context/CartContext';
import { canAccessPage } from '../../utils/rbac';

interface NavbarProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onLogout?: () => void;
  onNavigate?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode = false, toggleTheme = () => { }, onLogout, onNavigate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  const iconButtonClass = 'rounded-full hover:!bg-grey-100 [&_svg]:text-grey-900 [&_svg]:stroke-grey-900 dark:hover:!bg-grey-800 dark:[&_svg]:text-white dark:[&_svg]:stroke-white';

  return (
    <nav className="sticky top-0 z-50 w-full transition-colors duration-300 h-[56px] bg-grey-50 dark:bg-grey-50">
      <div className="max-w-[1920px] mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full gap-4">

          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <img
              src="/Shipskartlogo.png"
              alt="Shipskart"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Center: Search Bar */}
          <div className="tour-step-search hidden md:flex flex-1 max-w-lg px-8 lg:px-1">
            <Input
              placeholder="Search"
              leftIcon={<Search size={16} className="text-grey-500" />}
              // Updated input background for dark mode to stand out against grey-50 navbar
              className="!rounded-full !bg-white dark:!bg-grey-200 !border-transparent h-10 w-full focus-within:!bg-white dark:focus-within:!bg-grey-100 focus-within:!border-primary focus-within:!ring-primary/20 placeholder:text-grey-500 text-xs font-medium text-grey-900 dark:text-white"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Chat */}
            <Button
              variant="ghost"
              color="dark"
              iconOnly
              className={`hidden sm:inline-flex ${iconButtonClass}`}
              leftIcon={<MessageSquare size={18} strokeWidth={1.8} />}
            />

            {/* Cart */}
            {canAccessPage('cart') && (
              <div className="relative cursor-pointer" onClick={() => onNavigate && onNavigate('/tenant/cart')}>
                <Button
                  variant="ghost"
                  color="dark"
                  iconOnly
                  className={`hidden sm:inline-flex ${iconButtonClass}`}
                  leftIcon={<ShoppingCart size={18} strokeWidth={1.8} />}
                />
                {totalItems > 0 && (
                  <span className="absolute top-[2px] right-[2px] h-[18px] w-[18px] flex items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white border-[2px] border-white dark:border-[#141419]">
                    {totalItems}
                  </span>
                )}
              </div>
            )}

            {/* Notifications */}
            <div className="relative tour-step-notifications">
              <Button
                variant="ghost"
                color="dark"
                iconOnly
                className={iconButtonClass}
                leftIcon={<Bell size={18} strokeWidth={1.8} />}
              />
              <span className="absolute top-[2px] right-[2px] h-[18px] w-[18px] flex items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white border-[2px] border-white dark:border-[#141419]">
                6
              </span>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative pl-2 tour-step-profile" ref={profileRef}>
              <div onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <Avatar
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&h=256&auto=format&fit=crop"
                  alt="Sean"
                  size="xs"
                  status="online"
                  className={`cursor-pointer ring-2 transition-all ${isProfileOpen ? 'ring-primary' : 'ring-transparent hover:ring-primary/20'}`}
                />
              </div>

              {/* Dropdown Component */}
              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                triggerRef={profileRef}
                onLogout={onLogout}
              />
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
