import React, { ReactNode } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  forceState?: 'focus';
  iconOn?: ReactNode;
  iconOff?: ReactNode;
  label?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled,
  forceState,
  iconOn,
  iconOff,
  label,
  className = ''
}) => {
  const isFocus = forceState === 'focus';

  return (
    <label className={`inline-flex items-center group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        
        {/* Track */}
        <div 
            className={`
                w-11 h-6 rounded-full transition-colors duration-200
                ${checked 
                    ? 'bg-primary' 
                    : 'bg-grey-300 dark:bg-grey-600'
                }
                ${disabled ? 'opacity-80' : ''}
                ${isFocus ? 'ring-4 ring-primary/20' : 'peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20'}
            `}
        ></div>

        {/* Thumb */}
        <div 
            className={`
                absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center
                ${checked ? 'translate-x-full' : 'translate-x-0'}
            `}
        >
            {/* Icons inside thumb */}
            <div className={`transition-opacity duration-200 absolute inset-0 flex items-center justify-center ${checked ? 'opacity-100' : 'opacity-0'}`}>
               {iconOn}
            </div>
            <div className={`transition-opacity duration-200 absolute inset-0 flex items-center justify-center ${checked ? 'opacity-0' : 'opacity-100'}`}>
               {iconOff}
            </div>
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

export default Switch;