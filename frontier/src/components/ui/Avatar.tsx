import React from 'react';
import { User } from 'lucide-react';

export type AvatarSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
export type AvatarStatus = 'online' | 'busy' | 'away' | 'offline';
export type AvatarShape = 'circle' | 'square';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  icon?: React.ReactNode;
  size?: AvatarSize;
  status?: AvatarStatus;
  shape?: AvatarShape;
  className?: string;
  isSoft?: boolean; // For the soft background initial variants
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  initials,
  icon,
  size = 'md',
  status,
  shape = 'circle',
  className = '',
  isSoft = false,
}) => {
  // Size mappings
  const sizeClasses = {
    xl: 'w-16 h-16 text-2xl',
    lg: 'w-14 h-14 text-xl',
    md: 'w-12 h-12 text-lg',
    sm: 'w-10 h-10 text-base',
    xs: 'w-8 h-8 text-sm',
    xxs: 'w-6 h-6 text-xs',
  };

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  // Status Indicator Styles
  const statusColors = {
    online: 'bg-success border-white dark:border-[#0A0A0D]',
    busy: 'bg-danger border-white dark:border-[#0A0A0D]',
    away: 'bg-warning border-white dark:border-[#0A0A0D]',
    offline: 'bg-grey-400 border-white dark:border-[#0A0A0D]',
  };

  const statusSizes = {
    xl: 'w-4 h-4 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    md: 'w-3 h-3 border-2',
    sm: 'w-2.5 h-2.5 border-2',
    xs: 'w-2 h-2 border-[1.5px]',
    xxs: 'w-1.5 h-1.5 border-[1px]',
  };

  // Content rendering
  const renderContent = () => {
    if (src) {
      return <img src={src} alt={alt} className={`w-full h-full object-cover ${shapeClasses}`} />;
    }
    
    // Background for non-image avatars
    const bgClass = isSoft 
        ? 'bg-grey-100 dark:bg-grey-800 text-grey-600 dark:text-grey-300' 
        : 'bg-grey-800 dark:bg-grey-700 text-white dark:text-grey-200';
        
    return (
      <div className={`w-full h-full flex items-center justify-center ${bgClass} ${shapeClasses}`}>
        {initials ? (
          <span className="font-medium leading-none">{initials}</span>
        ) : (
          icon || <User size="50%" strokeWidth={1.5} />
        )}
      </div>
    );
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      {renderContent()}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full block
            ${statusColors[status]}
            ${statusSizes[size]}
            ${shape === 'square' ? '-translate-x-[20%] -translate-y-[20%]' : ''}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;