import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  value: number;
}

const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  value,
  className = '',
  disabled,
  onChange,
  ...props
}) => {
  // Calculate percentage for background gradient
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full relative h-6 flex items-center ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={onChange || (() => {})}
        {...props}
        className="
          w-full absolute z-10 opacity-0 cursor-pointer h-full
          disabled:cursor-not-allowed
        "
      />
      
      {/* Track Background (Grey) */}
      <div className="w-full h-1.5 bg-primary-soft dark:bg-grey-800 rounded-full overflow-hidden">
         {/* Filled Track (Primary) */}
         <div 
           className="h-full bg-primary"
           style={{ width: `${percentage}%` }}
         ></div>
      </div>

      {/* Thumb Handle (Custom visual) */}
      <div 
        className="absolute h-5 w-5 bg-primary rounded-full shadow border-2 border-white dark:border-[#0A0A0D] pointer-events-none transition-transform"
        style={{ left: `calc(${percentage}% - 10px)` }}
      ></div>
    </div>
  );
};

export default Slider;