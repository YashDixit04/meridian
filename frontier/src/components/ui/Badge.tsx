import React from 'react';

export type BadgeVariant = 'solid' | 'soft';
export type BadgeColor = 'primary' | 'success' | 'danger' | 'info' | 'warning' | 'dark' | 'light';
export type BadgeSize = 'large' | 'medium' | 'small';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';

  const sizeStyles = {
    large: 'px-3 py-1 text-sm',
    medium: 'px-2.5 py-0.5 text-xs',
    small: 'px-2 py-0.5 text-[10px]',
  };

  const solidVariants: Record<BadgeColor, string> = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    info: 'bg-info text-white',
    warning: 'bg-warning text-white',
    dark: 'bg-grey-900 text-white dark:bg-white dark:text-grey-900',
    light: 'bg-grey-100 text-grey-800 dark:bg-grey-800 dark:text-grey-200',
  };

  const softVariants: Record<BadgeColor, string> = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
    warning: 'bg-warning-soft text-warning',
    dark: 'bg-grey-200 text-grey-800 dark:bg-grey-700 dark:text-white',
    light: 'bg-grey-50 text-grey-600 dark:bg-grey-800/50 dark:text-grey-400',
  };

  const variantStyles = variant === 'solid' ? solidVariants[color] : softVariants[color];

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;