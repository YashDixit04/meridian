import React, { useState } from 'react';
import TimePicker from './TimePicker';

const TimePickerDisplay: React.FC = () => {
  const [time1, setTime1] = useState<Date>(new Date());
  const [time2, setTime2] = useState<Date>(new Date());

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Time Picker</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          A dedicated time selection component with arrow controls and intuitive AM/PM toggling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Standard */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Standard</h3>
            <div className="space-y-4 min-h-[300px]">
                <p className="text-sm text-grey-500">Basic time picker configuration.</p>
                <div className="w-full max-w-xs">
                    <TimePicker 
                        label="Start Time"
                        value={time1} 
                        onChange={setTime1} 
                    />
                </div>
                <div className="p-4 bg-grey-50 dark:bg-grey-900 rounded-lg text-xs font-mono text-grey-600 dark:text-grey-400">
                    Selected: {time1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>

        {/* With Date Link */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">With Date Option</h3>
            <div className="space-y-4 min-h-[300px]">
                <p className="text-sm text-grey-500">Includes a link to switch back to date selection.</p>
                <div className="w-full max-w-xs">
                    <TimePicker 
                        label="End Time"
                        value={time2} 
                        onChange={setTime2} 
                        onSelectDate={() => alert("Switch to Date View triggered")}
                    />
                </div>
                 <div className="p-4 bg-grey-50 dark:bg-grey-900 rounded-lg text-xs font-mono text-grey-600 dark:text-grey-400">
                    Selected: {time2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TimePickerDisplay;