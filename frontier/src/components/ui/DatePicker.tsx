import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isWithinInterval,
  isBefore,
  setHours,
  setMinutes
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Button from './Button';
import Input from './Input';

export interface DatePickerProps {
  label?: string;
  placeholder?: string;
  variant?: 'single' | 'range';
  withTime?: boolean;
  value?: Date | { from: Date; to?: Date } | null;
  onChange?: (val: Date | { from: Date; to?: Date } | null) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder = 'Select date',
  variant = 'single',
  withTime = false,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); // The month currently being viewed
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal state to hold selection before applying (for Cancel/Apply logic)
  const [internalValue, setInternalValue] = useState<Date | { from: Date; to?: Date } | null>(value || null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMode('date'); // Reset mode on close
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      setInternalValue(value || null); // Reset to current confirmed value on open
      // Set view date to currently selected date if exists
      if (variant === 'single' && value instanceof Date) {
        setViewDate(value);
      } else if (variant === 'range' && (value as any)?.from) {
        setViewDate((value as any).from);
      }
    }
    setIsOpen(!isOpen);
    setMode('date');
  };

  const handleApply = () => {
    onChange?.(internalValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // --- Date Logic ---
  const handleDateClick = (day: Date) => {
    if (variant === 'single') {
      let newValue = day;
      // Preserve time if switching days in single mode with time enabled
      if (internalValue instanceof Date && withTime) {
          newValue = setHours(newValue, internalValue.getHours());
          newValue = setMinutes(newValue, internalValue.getMinutes());
      } else if (withTime) {
          // Default to 12:00 PM if new date
          newValue = setHours(newValue, 12);
          newValue = setMinutes(newValue, 0);
      }
      setInternalValue(newValue);
    } else {
      // Range logic
      const current = internalValue as { from: Date; to?: Date } | null;
      
      if (!current || (current.from && current.to) || !current.from) {
        // Start new range
        setInternalValue({ from: day, to: undefined });
      } else {
        // Complete range
        if (isBefore(day, current.from)) {
          setInternalValue({ from: day, to: current.from });
        } else {
          setInternalValue({ ...current, to: day });
        }
      }
    }
  };

  // --- Time Logic ---
  const updateTime = (type: 'hour' | 'minute' | 'ampm', val: number | string) => {
    let baseDate: Date;
    if (variant === 'single') {
       baseDate = (internalValue instanceof Date) ? internalValue : new Date();
    } else {
       // For range, usually time applies to 'from' or 'to'. 
       // For this simplified component, we'll assume we are editing the 'Start' time if range is selected.
       // A full range+time picker is very complex UI.
       baseDate = ((internalValue as any)?.from) ? (internalValue as any).from : new Date();
    }

    let hours = baseDate.getHours();
    let minutes = baseDate.getMinutes();

    if (type === 'hour') {
        const isPM = hours >= 12;
        let newHour = val as number;
        if (isPM && newHour < 12) newHour += 12;
        if (!isPM && newHour === 12) newHour = 0; // Midnight handling if user selects 12 AM
        hours = (val as number) % 12; 
        if (isPM && hours === 0) hours = 12; // Maintain PM
        
        // Simpler logic: 'val' is 1-12.
        // We need to know current AM/PM state.
        if (isPM) {
             hours = (val as number) === 12 ? 12 : (val as number) + 12;
        } else {
             hours = (val as number) === 12 ? 0 : (val as number);
        }
    } else if (type === 'minute') {
        minutes = val as number;
    } else if (type === 'ampm') {
        if (val === 'PM' && hours < 12) hours += 12;
        if (val === 'AM' && hours >= 12) hours -= 12;
    }

    const newDate = setMinutes(setHours(baseDate, hours), minutes);

    if (variant === 'single') {
        setInternalValue(newDate);
    } else {
        // For range, complex time logic omitted for brevity, update 'from'
        const current = internalValue as { from: Date; to?: Date };
        setInternalValue({ ...current, from: newDate });
    }
  };

  // --- Calendar Generation ---
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate))
  });

  const weeks = [];
  for (let i = 0; i < daysInMonth.length; i += 7) {
    weeks.push(daysInMonth.slice(i, i + 7));
  }

  // --- Helpers ---
  const isSelected = (day: Date) => {
    if (variant === 'single') {
      return internalValue instanceof Date && isSameDay(day, internalValue);
    } else {
      const range = internalValue as { from: Date; to?: Date } | null;
      if (!range) return false;
      return isSameDay(day, range.from) || (range.to && isSameDay(day, range.to));
    }
  };

  const isInRange = (day: Date) => {
    if (variant === 'single') return false;
    const range = internalValue as { from: Date; to?: Date } | null;
    if (!range || !range.to) return false;
    return isWithinInterval(day, { start: range.from, end: range.to });
  };

  // Format Display Value
  const getDisplayValue = () => {
    if (!value) return '';
    const formatStr = withTime ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy';
    if (variant === 'single' && value instanceof Date) {
      return format(value, formatStr);
    }
    if (variant === 'range') {
      const { from, to } = value as { from: Date; to?: Date };
      if (!from) return '';
      return `${format(from, formatStr)}${to ? ' - ' + format(to, formatStr) : ''}`;
    }
    return '';
  };

  // Time Picker Helper Data
  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesList = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...

  const getCurrentTimeParts = () => {
      let d = new Date();
      if (variant === 'single' && internalValue instanceof Date) d = internalValue;
      if (variant === 'range' && (internalValue as any)?.from) d = (internalValue as any).from;
      
      const h24 = d.getHours();
      const h12 = h24 % 12 || 12;
      const m = d.getMinutes();
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      return { h12, m, ampm };
  };
  
  const timeParts = getCurrentTimeParts();

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">{label}</label>}
      <Input
        readOnly
        placeholder={placeholder}
        value={getDisplayValue()}
        onClick={handleToggle}
        rightIcon={<CalendarIcon size={18} />}
        className="cursor-pointer"
        forceState={isOpen ? 'focus' : undefined}
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-xl shadow-xl w-[320px] animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-grey-100 dark:border-grey-800">
             {mode === 'date' ? (
                 <>
                    <Button variant="ghost" size="small" iconOnly onClick={() => setViewDate(subMonths(viewDate, 1))}>
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="font-semibold text-grey-900 dark:text-white">
                        {format(viewDate, 'MMMM yyyy')}
                    </span>
                    <Button variant="ghost" size="small" iconOnly onClick={() => setViewDate(addMonths(viewDate, 1))}>
                        <ChevronRight size={16} />
                    </Button>
                 </>
             ) : (
                <div className="w-full text-center font-semibold text-grey-900 dark:text-white">Select Time</div>
             )}
          </div>

          {/* Body */}
          <div className="p-4 min-h-[300px]">
            {mode === 'date' ? (
                <>
                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <span key={day} className="text-xs font-medium text-grey-400 dark:text-grey-500">{day}</span>
                        ))}
                    </div>
                    {/* Calendar Grid */}
                    <div className="flex flex-col gap-1">
                        {weeks.map((week, i) => (
                            <div key={i} className="grid grid-cols-7 gap-0">
                                {week.map((day, dIndex) => {
                                    const isCurrentMonth = isSameMonth(day, viewDate);
                                    const selected = isSelected(day);
                                    const inRange = isInRange(day);
                                    const today = isToday(day);
                                    
                                    // Range Start/End Rounded Corners logic
                                    let roundedClass = 'rounded-md';
                                    if (variant === 'range' && inRange) {
                                        roundedClass = 'rounded-none'; // Middle
                                        const range = internalValue as { from: Date; to?: Date };
                                        if (isSameDay(day, range.from)) roundedClass = 'rounded-l-md';
                                        if (range.to && isSameDay(day, range.to)) roundedClass = 'rounded-r-md';
                                    }

                                    return (
                                        <div key={dIndex} className={`aspect-square p-0.5 ${inRange && !selected ? 'bg-primary-soft dark:bg-primary/20' : ''} ${roundedClass}`}>
                                            <button
                                                onClick={() => handleDateClick(day)}
                                                className={`
                                                    w-full h-full flex items-center justify-center text-sm rounded-md transition-colors
                                                    ${!isCurrentMonth ? 'text-grey-300 dark:text-grey-700' : 'text-grey-700 dark:text-grey-300'}
                                                    ${selected ? '!bg-primary !text-white hover:bg-primary-active' : 'hover:bg-grey-100 dark:hover:bg-grey-800'}
                                                    ${today && !selected ? 'ring-1 ring-primary text-primary font-semibold' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                    
                    {withTime && (
                         <div className="mt-4 pt-4 border-t border-grey-100 dark:border-grey-800 flex justify-center">
                             <Button variant="ghost" size="small" onClick={() => setMode('time')} leftIcon={<Clock size={14} />}>
                                 Select Time
                             </Button>
                         </div>
                    )}
                </>
            ) : (
                <div className="h-full flex flex-col">
                    <div className="flex-1 grid grid-cols-3 gap-4 h-[240px]">
                        {/* Hours */}
                        <div className="flex flex-col overflow-y-auto custom-scrollbar gap-1 text-center">
                            <span className="text-xs text-grey-400 mb-2 sticky top-0 bg-white dark:bg-[#0A0A0D]">Hour</span>
                            {hoursList.map(h => (
                                <button 
                                    key={h} 
                                    onClick={() => updateTime('hour', h)}
                                    className={`p-2 rounded text-sm hover:bg-grey-100 dark:hover:bg-grey-800 ${timeParts.h12 === h ? 'bg-primary text-white hover:bg-primary-active' : 'text-grey-700 dark:text-grey-300'}`}
                                >
                                    {h.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                        {/* Minutes */}
                        <div className="flex flex-col overflow-y-auto custom-scrollbar gap-1 text-center">
                            <span className="text-xs text-grey-400 mb-2 sticky top-0 bg-white dark:bg-[#0A0A0D]">Min</span>
                            {minutesList.map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => updateTime('minute', m)}
                                    className={`p-2 rounded text-sm hover:bg-grey-100 dark:hover:bg-grey-800 ${timeParts.m === m ? 'bg-primary text-white hover:bg-primary-active' : 'text-grey-700 dark:text-grey-300'}`}
                                >
                                    {m.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                        {/* AM/PM */}
                        <div className="flex flex-col gap-1 text-center">
                             <span className="text-xs text-grey-400 mb-2">Meridiem</span>
                             {['AM', 'PM'].map(p => (
                                 <button 
                                    key={p} 
                                    onClick={() => updateTime('ampm', p)}
                                    className={`p-2 rounded text-sm hover:bg-grey-100 dark:hover:bg-grey-800 ${timeParts.ampm === p ? 'bg-primary text-white hover:bg-primary-active' : 'text-grey-700 dark:text-grey-300'}`}
                                 >
                                    {p}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-grey-100 dark:border-grey-800 flex justify-center">
                         <Button variant="ghost" size="small" onClick={() => setMode('date')} leftIcon={<CalendarIcon size={14} />}>
                             Back to Date
                         </Button>
                    </div>
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-grey-50 dark:bg-[#111114] border-t border-grey-200 dark:border-grey-800 flex justify-end gap-2">
            <Button variant="outline" color="light" size="small" onClick={handleCancel}>Cancel</Button>
            <Button variant="solid" color="primary" size="small" onClick={handleApply}>Apply</Button>
          </div>

        </div>
      )}
    </div>
  );
};

export default DatePicker;