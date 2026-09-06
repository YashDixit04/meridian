import React, { useState } from 'react';
import DatePicker from './DatePicker';

const DatePickerDisplay: React.FC = () => {
  const [date1, setDate1] = useState<any>(null);
  const [date2, setDate2] = useState<any>(null);
  const [range1, setRange1] = useState<any>(null);

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Date & Time Picker</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Versatile date and time selection components supporting single dates, ranges, and time inputs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 items-start">
        
        {/* Single Date */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Single Date</h3>
            <div className="space-y-4 min-h-[400px]">
                <p className="text-sm text-grey-500">Basic date picker.</p>
                <div className="w-full max-w-xs">
                    <DatePicker 
                        label="Birthday"
                        value={date1} 
                        onChange={setDate1} 
                    />
                </div>
                <div className="p-4 bg-grey-50 dark:bg-grey-900 rounded-lg text-xs font-mono text-grey-600 dark:text-grey-400">
                    Selected: {date1 ? date1.toString() : 'None'}
                </div>
            </div>
        </div>

        {/* Date + Time */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Date & Time</h3>
            <div className="space-y-4 min-h-[400px]">
                <p className="text-sm text-grey-500">Includes time selection.</p>
                <div className="w-full max-w-xs">
                    <DatePicker 
                        label="Meeting Time"
                        withTime 
                        value={date2} 
                        onChange={setDate2} 
                    />
                </div>
                <div className="p-4 bg-grey-50 dark:bg-grey-900 rounded-lg text-xs font-mono text-grey-600 dark:text-grey-400">
                    Selected: {date2 ? date2.toString() : 'None'}
                </div>
            </div>
        </div>

        {/* Date Range */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Date Range</h3>
            <div className="space-y-4 min-h-[400px]">
                <p className="text-sm text-grey-500">Select a start and end date.</p>
                <div className="w-full max-w-xs">
                    <DatePicker 
                        label="Trip Duration"
                        variant="range" 
                        value={range1} 
                        onChange={setRange1} 
                    />
                </div>
                <div className="p-4 bg-grey-50 dark:bg-grey-900 rounded-lg text-xs font-mono text-grey-600 dark:text-grey-400">
                    From: {range1?.from ? range1.from.toString() : 'None'} <br/>
                    To: {range1?.to ? range1.to.toString() : 'None'}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DatePickerDisplay;