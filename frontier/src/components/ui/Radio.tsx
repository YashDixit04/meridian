import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  forceState?: 'focus';
}

const Radio: React.FC<RadioProps> = ({
  className = '',
  checked,
  disabled,
  label,
  forceState,
  onChange,
  ...props
}) => {
  const isFocus = forceState === 'focus';

  return (
    <label className={`inline-flex items-center group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={onChange || (() => {})}
          {...props}
        />
        
        {/* Outer Circle */}
        <div
          className={`
            w-5 h-5 rounded-full border transition-all duration-200 flex items-center justify-center
            ${checked 
                ? 'bg-primary border-primary dark:border-primary' 
                : 'bg-white dark:bg-[#0A0A0D] border-grey-300 dark:border-grey-600 group-hover:border-primary dark:group-hover:border-primary'
            }
            ${disabled ? 'bg-grey-100 dark:bg-grey-800 border-grey-200 dark:border-grey-700' : ''}
            ${isFocus ? 'ring-4 ring-primary/20' : 'peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20'}
          `}
        >
           {/* Inner Dot */}
           <div 
             className={`
               w-2 h-2 rounded-full bg-white transform transition-transform duration-200
               ${checked ? 'scale-100' : 'scale-0'}
             `} 
           />
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

export default Radio;