import React, { forwardRef, ReactNode } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'large' | 'medium' | 'small';
  state?: 'default' | 'error' | 'disabled';
  forceState?: 'hover' | 'focus' | 'active'; // For display purposes to force visual state
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  prefixLabel?: string; // e.g., "https://" outside the input
  suffixLabel?: string; // e.g. ".com" outside the input
  suffixText?: string; // e.g. "kg" inside the input
  isTextarea?: boolean;
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      className = '',
      size = 'medium',
      state = 'default',
      forceState,
      leftIcon,
      rightIcon,
      prefixLabel,
      suffixLabel,
      suffixText,
      isTextarea = false,
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Determine effective state (prop overrides disabled prop)
    const isDisabled = disabled || state === 'disabled';
    const isError = state === 'error';

    // Base Container Styles (The border and background wrapper)
    const baseWrapperClasses = `
      group flex items-center w-full transition-all duration-200 border rounded-lg overflow-hidden
      bg-white dark:bg-[#0A0A0D]
    `;

    // State Styles (Border colors, shadows)
    let stateClasses = 'border-grey-200 dark:border-grey-800 text-grey-900 dark:text-white';
    
    if (isDisabled) {
        stateClasses = 'bg-grey-50 dark:bg-[#151518] border-grey-200 dark:border-grey-800 opacity-60 cursor-not-allowed text-grey-400 dark:text-grey-600';
    } else if (isError) {
        stateClasses = 'border-danger text-danger focus-within:ring-1 focus-within:ring-danger';
    } else {
        // Normal interactive states
        // We use group-focus-within for the real focus state, and forced classes for the gallery
        stateClasses += ' hover:border-primary dark:hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-primary/20';
        
        if (forceState === 'hover') stateClasses += ' border-primary dark:border-primary';
        if (forceState === 'focus') stateClasses += ' border-primary ring-2 ring-primary/20 dark:ring-primary/20';
        if (forceState === 'active') stateClasses += ' border-primary dark:border-primary'; // Simulating active same as hover/focus for visual
    }

    // Size Styles
    const sizeClasses = {
        large: 'min-h-12 text-base',
        medium: 'min-h-10 text-sm',
        small: 'min-h-8 text-xs',
    };
    
    // Textarea specific size adjustments
    const textAreaPadding = {
        large: 'p-3',
        medium: 'p-2.5',
        small: 'p-2',
    };

    // Inner Input Styles
    const inputClasses = `
      w-full bg-transparent border-none outline-none placeholder:text-grey-400 dark:placeholder:text-grey-600
      disabled:cursor-not-allowed
      ${isTextarea ? 'h-auto resize-none' : 'h-full truncate'}
    `;

    // Padding Logic
    const paddingX = size === 'small' ? 'px-2' : 'px-3';

    return (
      <div className={`${baseWrapperClasses} ${stateClasses} ${!isTextarea ? sizeClasses[size] : ''} ${className}`}>
        {/* Prefix Label (Outside visual container part of flex) */}
        {prefixLabel && (
           <div className={`
             flex items-center justify-center border-r border-grey-200 dark:border-grey-800 bg-grey-50 dark:bg-[#151518] text-grey-500 dark:text-grey-500 font-medium whitespace-nowrap
             ${paddingX} ${!isTextarea ? 'h-full' : ''}
           `}>
             {prefixLabel}
           </div>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <div className={`flex items-center justify-center text-grey-400 dark:text-grey-500 pl-3 ${isError ? 'text-danger' : ''}`}>
            {leftIcon}
          </div>
        )}

        {/* Input Element */}
        {isTextarea ? (
             <textarea
             ref={ref as any}
             disabled={isDisabled}
             className={`${inputClasses} ${textAreaPadding[size]} ${leftIcon ? 'pl-2' : paddingX} ${rightIcon ? 'pr-2' : paddingX}`}
             placeholder={placeholder}
             {...(props as any)}
           />
        ) : (
            <input
            ref={ref as any}
            disabled={isDisabled}
            className={`${inputClasses} ${leftIcon ? 'pl-2' : paddingX} ${rightIcon || suffixText ? 'pr-2' : paddingX}`}
            placeholder={placeholder}
            {...props}
          />
        )}
       

        {/* Suffix Text (Internal "kg", etc) */}
        {suffixText && (
            <span className="text-grey-400 dark:text-grey-600 pr-3 whitespace-nowrap select-none">
                {suffixText}
            </span>
        )}

        {/* Right Icon */}
        {rightIcon && (
          <div className={`flex items-center justify-center text-grey-400 dark:text-grey-500 pr-3 ${isError ? 'text-danger' : ''}`}>
            {rightIcon}
          </div>
        )}

        {/* Suffix Label (Outside addon) */}
         {suffixLabel && (
           <div className={`
             flex items-center justify-center border-l border-grey-200 dark:border-grey-800 bg-grey-50 dark:bg-[#151518] text-grey-500 dark:text-grey-500 font-medium whitespace-nowrap
             ${paddingX} ${!isTextarea ? 'h-full' : ''}
           `}>
             {suffixLabel}
           </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;