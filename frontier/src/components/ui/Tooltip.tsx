import React, { ReactNode, useState } from 'react';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number; // delay in ms
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const showTooltip = () => {
    const id = window.setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Positioning Classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow Classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-grey-900 dark:border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-grey-900 dark:border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-grey-900 dark:border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-grey-900 dark:border-r-white',
  };
  
  // Override specific border color based on position (inline style logic helper)
  // Actually, simpler to use specific class logic:
  // For 'top', we need border-top-color to be visible, others transparent.
  // Tailwind border-color utilities set all sides, so we use border-t-black etc.
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div 
          role="tooltip"
          className={`
            absolute z-50 whitespace-nowrap px-3 py-2 rounded-lg shadow-xl
            bg-grey-900 text-grey-100 text-xs font-medium
            animate-in fade-in zoom-in-95 duration-200
            ${positionClasses[position]}
          `}
        >
          {content}
          
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;