import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';
export type ButtonColor = 'primary' | 'success' | 'danger' | 'info' | 'warning' | 'dark' | 'light' | 'grey';
export type ButtonSize = 'large' | 'medium' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'solid',
      color = 'primary',
      size = 'medium',
      leftIcon,
      rightIcon,
      iconOnly,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-black rounded-lg';

    // Size styles
    const sizeStyles = {
      large: iconOnly ? 'h-12 w-12 p-0' : 'h-12 px-6 text-[16px]',
      medium: iconOnly ? 'h-10 w-10 p-0' : 'h-10 px-4 text-[14px]',
      small: iconOnly ? 'h-8 w-8 p-0' : 'h-8 px-3 text-[12px]',
    };

    // Static mappings
    const solidVariants: Record<ButtonColor, string> = {
      primary: 'bg-primary hover:bg-primary-active text-white focus:ring-primary/50',
      success: 'bg-success hover:bg-success-active text-white focus:ring-success/50',
      danger: 'bg-danger hover:bg-danger-active text-white focus:ring-danger/50',
      info: 'bg-info hover:bg-info-active text-white focus:ring-info/50',
      warning: 'bg-warning hover:bg-warning-active text-white focus:ring-warning/50',
      dark: 'bg-dark text-white hover:bg-dark-active dark:bg-white dark:text-black dark:hover:bg-grey-200 focus:ring-dark/50',
      light: 'bg-light text-grey-900 border border-grey-200 hover:bg-grey-50 dark:bg-light dark:text-white dark:border-grey-700 dark:hover:bg-light-active focus:ring-grey-200',
      grey: 'bg-grey-200 text-grey-900 hover:bg-grey-300 dark:bg-grey-800 dark:text-white dark:hover:bg-grey-700 focus:ring-grey-400',
    };

    const softVariants: Record<ButtonColor, string> = {
      primary: 'bg-primary-soft text-primary hover:brightness-95 dark:hover:brightness-110',
      success: 'bg-success-soft text-success hover:brightness-95 dark:hover:brightness-110',
      danger: 'bg-danger-soft text-danger hover:brightness-95 dark:hover:brightness-110',
      info: 'bg-info-soft text-info hover:brightness-95 dark:hover:brightness-110',
      warning: 'bg-warning-soft text-warning hover:brightness-95 dark:hover:brightness-110',
      dark: 'bg-dark-soft text-dark hover:bg-grey-200 dark:bg-dark-active dark:text-white', 
      light: 'bg-grey-100 text-grey-900 hover:bg-grey-200 dark:bg-grey-800 dark:text-grey-100',
      grey: 'bg-grey-100 text-grey-900 hover:bg-grey-200 dark:bg-grey-800 dark:text-grey-100',
    };

    const outlineVariants: Record<ButtonColor, string> = {
      primary: 'bg-transparent border border-primary text-primary hover:bg-primary-soft',
      success: 'bg-transparent border border-success text-success hover:bg-success-soft',
      danger: 'bg-transparent border border-danger text-danger hover:bg-danger-soft',
      info: 'bg-transparent border border-info text-info hover:bg-info-soft',
      warning: 'bg-transparent border border-warning text-warning hover:bg-warning-soft',
      dark: 'bg-transparent border border-dark text-dark hover:bg-grey-100 dark:border-white dark:text-white dark:hover:bg-grey-800',
      light: 'bg-transparent border border-grey-300 text-grey-700 hover:bg-grey-50 hover:text-grey-900 dark:border-grey-700 dark:text-grey-300 dark:hover:bg-grey-800 dark:hover:text-white',
      grey: 'bg-transparent border border-grey-400 text-grey-600 hover:bg-grey-50 dark:border-grey-600 dark:text-grey-400 dark:hover:bg-grey-900',
    };

    const ghostVariants: Record<ButtonColor, string> = {
      primary: 'bg-transparent text-primary hover:bg-primary-soft',
      success: 'bg-transparent text-success hover:bg-success-soft',
      danger: 'bg-transparent text-danger hover:bg-danger-soft',
      info: 'bg-transparent text-info hover:bg-info-soft',
      warning: 'bg-transparent text-warning hover:bg-warning-soft',
      dark: 'bg-transparent text-dark hover:bg-grey-100 dark:text-white dark:hover:bg-grey-800',
      light: 'bg-transparent text-grey-600 hover:bg-grey-100 dark:text-grey-400 dark:hover:bg-grey-800 dark:hover:text-white',
      grey: 'bg-transparent text-grey-600 hover:bg-grey-100 dark:text-grey-400 dark:hover:bg-grey-800 dark:hover:text-white',
    };

    const linkVariants: Record<ButtonColor, string> = {
       primary: 'bg-transparent text-primary hover:underline p-0 h-auto justify-start',
       success: 'bg-transparent text-success hover:underline p-0 h-auto justify-start',
       danger: 'bg-transparent text-danger hover:underline p-0 h-auto justify-start',
       info: 'bg-transparent text-info hover:underline p-0 h-auto justify-start',
       warning: 'bg-transparent text-warning hover:underline p-0 h-auto justify-start',
       dark: 'bg-transparent text-dark hover:underline p-0 h-auto justify-start dark:text-white',
       light: 'bg-transparent text-grey-600 hover:underline p-0 h-auto justify-start dark:text-grey-400',
       grey: 'bg-transparent text-grey-600 hover:underline p-0 h-auto justify-start dark:text-grey-400',
    }

    // Determine styles based on variant
    let variantClasses = '';
    switch (variant) {
      case 'solid': variantClasses = solidVariants[color]; break;
      case 'soft': variantClasses = softVariants[color]; break;
      case 'outline': variantClasses = outlineVariants[color]; break;
      case 'ghost': variantClasses = ghostVariants[color]; break;
      case 'link': variantClasses = linkVariants[color]; break;
      default: variantClasses = solidVariants[color];
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantClasses} ${className}`}
        {...props}
      >
        {leftIcon && <span className={iconOnly ? '' : 'mr-2'}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={iconOnly ? '' : 'ml-2'}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;