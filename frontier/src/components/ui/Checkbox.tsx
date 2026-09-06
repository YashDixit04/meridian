import React, { useRef, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  label?: string;
  color?: 'primary' | 'success';
  forceState?: 'focus';
}

const Checkbox: React.FC<CheckboxProps> = ({
  className = '',
  checked,
  indeterminate,
  disabled,
  label,
  color = 'primary',
  forceState,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  // Color mappings
  const colorClasses = {
    primary: {
        checked: 'bg-primary border-primary dark:border-primary',
        focus: 'ring-primary/20',
    },
    success: {
        checked: 'bg-success border-success dark:border-success',
        focus: 'ring-success/20',
    }
  };

  const currentColor = colorClasses[color];

  // Logic to determine visual state
  const isCheckedOrIndeterminate = checked || indeterminate;
  const isFocus = forceState === 'focus';

  return (
    <label className={`inline-flex items-center group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={inputRef}
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange || (() => {})}
          {...props}
        />
        
        <div
          className={`
            w-5 h-5 border rounded transition-all duration-200 flex items-center justify-center
            ${isCheckedOrIndeterminate 
                ? currentColor.checked 
                : 'bg-white dark:bg-[#0A0A0D] border-grey-300 dark:border-grey-600 hover:border-primary dark:hover:border-primary'
            }
            ${disabled ? 'bg-grey-100 dark:bg-grey-800 border-grey-200 dark:border-grey-700' : ''}
            ${isFocus ? `ring-4 ${currentColor.focus}` : 'peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20'}
          `}
        >
          {checked && !indeterminate && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
          {indeterminate && (
            <Minus size={14} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      
      {label && (
        <span className={`ml-3 text-sm font-medium select-none ${disabled ? 'text-grey-400 dark:text-grey-600' : 'text-grey-700 dark:text-grey-300'}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;