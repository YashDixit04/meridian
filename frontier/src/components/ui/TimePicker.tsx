import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { setHours, setMinutes } from 'date-fns';

interface TimePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onSelectDate?: () => void;
  className?: string;
  label?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  onSelectDate,
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use provided value or default to current time
  const date = value || new Date();

  // Helper to get parts
  const getParts = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return { hours, minutes, ampm };
  };

  const { hours, minutes, ampm } = getParts(date);

  // Handle Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateTime = (type: 'hour' | 'minute' | 'ampm', direction: 'up' | 'down' | 'toggle') => {
    let newDate = new Date(date);
    const currentHours = newDate.getHours();
    const currentMinutes = newDate.getMinutes();

    if (type === 'hour') {
      if (direction === 'up') newDate = setHours(newDate, currentHours + 1);
      if (direction === 'down') newDate = setHours(newDate, currentHours - 1);
    } else if (type === 'minute') {
      // Increment by 1 for precision, or 5 for speed. Using 1 based on typical UI.
      if (direction === 'up') newDate = setMinutes(newDate, currentMinutes + 1);
      if (direction === 'down') newDate = setMinutes(newDate, currentMinutes - 1);
    } else if (type === 'ampm') {
      // Toggle AM/PM
      if (currentHours >= 12) {
        newDate = setHours(newDate, currentHours - 12);
      } else {
        newDate = setHours(newDate, currentHours + 12);
      }
    }

    onChange?.(newDate);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative w-full max-w-[300px] ${className}`} ref={containerRef}>
        {label && <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">{label}</label>}
        
        {/* Input Trigger */}
        <div 
            onClick={handleToggle}
            className={`
                flex items-center justify-between px-4 h-12 w-full
                bg-white dark:bg-[#0A0A0D] 
                border rounded-lg cursor-pointer transition-all duration-200
                ${isOpen 
                    ? 'border-primary ring-2 ring-primary/20 dark:ring-primary/20' 
                    : 'border-grey-200 dark:border-grey-800 hover:border-primary dark:hover:border-primary'
                }
            `}
        >
            <div className="flex items-center gap-4 text-grey-900 dark:text-white font-medium text-base mx-auto">
                <span className="w-6 text-center">{hours.toString().padStart(2, '0')}</span>
                <span className="text-grey-400">:</span>
                <span className="w-6 text-center">{minutes.toString().padStart(2, '0')}</span>
                <span className="w-8 text-center text-grey-500 dark:text-grey-400 font-semibold text-sm">{ampm}</span>
            </div>
        </div>

        {/* Popover */}
        {isOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-xl shadow-xl w-full p-6 animate-in fade-in zoom-in-95 duration-100">
                
                <div className="flex items-center justify-center gap-4 mb-6">
                    {/* Hours Column */}
                    <div className="flex flex-col items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateTime('hour', 'up'); }}
                            className="text-grey-400 hover:text-primary transition-colors p-1"
                        >
                            <ChevronUp size={20} />
                        </button>
                        <span className="text-xl font-bold text-grey-900 dark:text-white w-8 text-center select-none">
                            {hours.toString().padStart(2, '0')}
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateTime('hour', 'down'); }}
                            className="text-grey-400 hover:text-primary transition-colors p-1"
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    {/* Separator */}
                    <div className="flex flex-col gap-2 h-full justify-center pb-1">
                         <span className="text-xl font-bold text-grey-300 dark:text-grey-600">:</span>
                    </div>

                    {/* Minutes Column */}
                    <div className="flex flex-col items-center gap-2">
                         <button 
                            onClick={(e) => { e.stopPropagation(); updateTime('minute', 'up'); }}
                            className="text-grey-400 hover:text-primary transition-colors p-1"
                        >
                            <ChevronUp size={20} />
                        </button>
                        <span className="text-xl font-bold text-grey-900 dark:text-white w-8 text-center select-none">
                            {minutes.toString().padStart(2, '0')}
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateTime('minute', 'down'); }}
                            className="text-grey-400 hover:text-primary transition-colors p-1"
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>

                    {/* AM/PM Column */}
                    <div className="flex flex-col items-center justify-center h-full ml-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); updateTime('ampm', 'toggle'); }}
                            className="w-10 h-10 rounded-lg bg-primary text-white font-semibold text-sm shadow-md hover:bg-primary-active transition-colors flex items-center justify-center"
                        >
                            {ampm}
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                {onSelectDate && (
                    <div className="flex justify-center border-t border-grey-100 dark:border-grey-800 pt-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSelectDate(); setIsOpen(false); }}
                            className="text-xs font-medium text-grey-500 hover:text-primary dark:text-grey-400 dark:hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                            <CalendarIcon size={14} />
                            Select Date
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default TimePicker;