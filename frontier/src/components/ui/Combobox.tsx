import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: ReactNode;
  group?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  className?: string;
  size?: 'large' | 'medium' | 'small';
  state?: 'default' | 'error' | 'disabled';
  forceState?: 'hover' | 'focus' | 'active'; // For display purposes
  forceOpen?: boolean; // For display purposes
  placeholder?: string;
  options: ComboboxOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  leftIcon?: ReactNode;
}

const Combobox: React.FC<ComboboxProps> = ({
  className = '',
  size = 'medium',
  state = 'default',
  forceState,
  forceOpen = false,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  multiple = false,
  leftIcon,
}) => {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDisabled = state === 'disabled';
  const isError = state === 'error';

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Handle outside click to close (unless forced open)
  useEffect(() => {
    if (forceOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [forceOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Handle interactions
  const toggleOpen = () => {
    if (!isDisabled && !forceOpen) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValue = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      if (!forceOpen) setIsOpen(false);
    }
  };

  // Base Trigger Styles (Identical to Input.tsx)
  const baseWrapperClasses = `
    group flex items-center w-full transition-all duration-200 border rounded-lg overflow-hidden relative
    bg-light cursor-pointer select-none
  `;

  // State Styles
  let stateClasses = 'border-grey-200 dark:border-grey-800 text-grey-900 dark:text-white';

  if (isDisabled) {
    stateClasses = 'bg-grey-50 border-grey-200 dark:border-grey-800 opacity-60 cursor-not-allowed text-grey-400 dark:text-grey-600';
  } else if (isError) {
    stateClasses = 'border-danger text-danger';
  } else {
    // Logic to mimic Input's focus-within via isOpen state or forceState
    if (isOpen || forceState === 'focus') {
      stateClasses += ' border-primary ring-2 ring-primary/20 dark:ring-primary/20';
    } else if (forceState === 'hover') {
      stateClasses += ' border-primary dark:border-primary';
    } else {
      stateClasses += ' hover:border-primary dark:hover:border-primary';
    }
  }

  // Size Styles
  const sizeClasses = {
    large: 'min-h-12 text-base px-3',
    medium: 'min-h-10 text-sm px-3',
    small: 'min-h-8 text-xs px-2',
  };

  // Display Value Logic
  const getDisplayValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) return placeholder;

    if (multiple && Array.isArray(value)) {
      const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean);
      return selectedLabels.join(', ');
    }

    const selectedOption = options.find(o => o.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Grouping Options
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, ComboboxOption[]>);

  const hasGroups = Object.keys(groupedOptions).length > 1 || (Object.keys(groupedOptions).length === 1 && Object.keys(groupedOptions)[0] !== 'default');

  // Dropdown content
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="p-1 bg-light dark:bg-grey-50 border border-grey-200 dark:border-grey-800 rounded-lg shadow-lg"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999,
      }}
    >
      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedOptions).map(([group, groupOptions]) => (
          <React.Fragment key={group}>
            {hasGroups && (
              <div className="px-2 py-1.5 text-xs font-semibold text-grey-500 uppercase tracking-wider">
                {group}
              </div>
            )}
            {(groupOptions as ComboboxOption[]).map((option) => {
              const isSelected = multiple
                ? Array.isArray(value) && value.includes(option.value)
                : value === option.value;

              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                            flex items-center justify-between px-2 py-2 rounded-md cursor-pointer text-sm transition-colors
                            ${isSelected
                      ? 'bg-primary text-white'
                      : 'text-grey-900 dark:text-white hover:bg-grey-50 dark:hover:bg-grey-800'
                    }
                        `}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className={`${isSelected ? 'text-white' : 'text-grey-400 dark:text-grey-500'}`}>
                        {option.icon}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && !multiple && <Check size={14} />}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={toggleOpen}
        className={`${baseWrapperClasses} ${stateClasses} ${sizeClasses[size]}`}
      >
        {leftIcon && (
          <span className={`mr-2 flex items-center ${isError ? 'text-danger' : 'text-grey-400 dark:text-grey-500'}`}>
            {leftIcon}
          </span>
        )}

        <span className={`flex-1 truncate ${!value || (Array.isArray(value) && value.length === 0) ? 'text-grey-400 dark:text-grey-600' : ''}`}>
          {getDisplayValue()}
        </span>

        <ChevronDown
          size={size === 'small' ? 14 : 16}
          className={`
                ml-2 transition-transform duration-200
                ${isError ? 'text-danger' : 'text-grey-400 dark:text-grey-500'}
                ${isOpen ? 'rotate-180' : ''}
            `}
        />
      </div>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default Combobox;
