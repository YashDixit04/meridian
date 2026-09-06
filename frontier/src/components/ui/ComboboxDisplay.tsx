import React from 'react';
import Combobox, { ComboboxOption } from './Combobox';
import { Lock, FileKey, Languages } from 'lucide-react';

const ComboboxDisplay: React.FC = () => {
  // Columns definition for the top grid
  const states: {
    label: string;
    state: 'default' | 'error' | 'disabled';
    force?: 'hover' | 'focus' | 'active';
  }[] = [
    { label: 'Active', state: 'default' },
    { label: 'Hover', state: 'default', force: 'hover' },
    { label: 'Focus', state: 'default', force: 'focus' },
    { label: 'Error', state: 'error' },
    { label: 'Disabled', state: 'disabled' },
  ];

  const basicOptions = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
  ];

  // Data for visual examples in the second row
  const numericOptions = [
      { label: 'Ten', value: '10' },
      { label: 'Twenty', value: '20' },
      { label: 'Thirty', value: '30' },
      { label: 'Fourty', value: '40' },
  ];

  const groupedOptions: ComboboxOption[] = [
      { label: 'Frodo', value: 'frodo', group: 'HOBBITS' },
      { label: 'Sam', value: 'sam', group: 'HOBBITS' },
      { label: 'Merry', value: 'merry', group: 'HOBBITS' },
      { label: 'Galadriel', value: 'galadriel', group: 'ELVES' },
      { label: 'Legolas', value: 'legolas', group: 'ELVES' },
  ];

  const iconOptions: ComboboxOption[] = [
      { label: 'SAML', value: 'saml', icon: <Lock size={14} /> },
      { label: 'OAuth', value: 'oauth', icon: <FileKey size={14} /> },
      { label: 'JWT', value: 'jwt', icon: <FileKey size={14} /> },
      { label: 'Netherlands (NL)', value: 'nl', icon: '🇳🇱' },
      { label: 'United States (US)', value: 'us', icon: '🇺🇸' },
      { label: 'Spain (ES)', value: 'es', icon: '🇪🇸' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Combobox & Select</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Dropdown selection components with support for single select, multi-select, grouping, and icons.
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="space-y-12">
        
        {/* Section: Top Grid - Closed States */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">States</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    {/* Headers */}
                    <div className="col-span-1"></div>
                    {states.map(s => (
                        <div key={s.label} className="text-sm font-medium text-grey-500 dark:text-grey-400 pb-2">
                            {s.label}
                        </div>
                    ))}

                    {/* Large Row */}
                    <div className="text-sm text-grey-500 pt-3">Select - Large</div>
                    {states.map((s, i) => (
                        <Combobox key={i} size="large" state={s.state} forceState={s.force} placeholder="Select - Large" options={basicOptions} />
                    ))}

                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Select - Medium</div>
                    {states.map((s, i) => (
                        <Combobox key={i} size="medium" state={s.state} forceState={s.force} placeholder="Select - Medium" options={basicOptions} />
                    ))}

                    {/* Small Row */}
                    <div className="text-sm text-grey-500 pt-1.5">Select - Small</div>
                    {states.map((s, i) => (
                        <Combobox key={i} size="small" state={s.state} forceState={s.force} placeholder="Select - Small" options={basicOptions} />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Bottom Row - Open Visuals */}
        <div className="space-y-6">
             <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Dropdown Variants</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start h-[300px]">
                 
                 {/* 1. Simple Select Open */}
                 <div className="space-y-2">
                     <span className="text-xs font-medium text-grey-500 uppercase tracking-wider">Single Select</span>
                     <Combobox 
                        size="medium" 
                        placeholder="Ten" 
                        value="10"
                        options={numericOptions} 
                        forceOpen={true}
                     />
                 </div>

                 {/* 2. Multi Select Open */}
                 <div className="space-y-2">
                     <span className="text-xs font-medium text-grey-500 uppercase tracking-wider">Multi-Select</span>
                     <Combobox 
                        size="medium" 
                        placeholder="Select..." 
                        multiple
                        value={['10', '20']}
                        options={numericOptions} 
                        forceOpen={true}
                     />
                 </div>

                 {/* 3. Grouped Select Open */}
                 <div className="space-y-2">
                     <span className="text-xs font-medium text-grey-500 uppercase tracking-wider">Grouped</span>
                     <Combobox 
                        size="medium" 
                        placeholder="Choose a character..." 
                        value="frodo"
                        options={groupedOptions} 
                        forceOpen={true}
                     />
                 </div>

                 {/* 4. Icon Select Open */}
                 <div className="space-y-2">
                     <span className="text-xs font-medium text-grey-500 uppercase tracking-wider">With Icons</span>
                     <Combobox 
                        size="medium" 
                        placeholder="SAML"
                        value="saml"
                        leftIcon={<Lock size={14} />}
                        options={iconOptions} 
                        forceOpen={true}
                     />
                 </div>

             </div>
        </div>

        {/* Section: Bottom Extras */}
        <div className="space-y-6 pt-12">
             <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Additional Examples</h3>
             <div className="flex gap-8 items-center">
                 <div className="w-64">
                    <Combobox 
                        size="large" 
                        placeholder="Select Country" 
                        leftIcon={<Languages size={18} />}
                        options={iconOptions.filter(o => ['nl','us','es'].includes(o.value))} 
                    />
                 </div>
                 <div className="w-64">
                    <Combobox 
                        size="medium" 
                        placeholder="Select Language" 
                        value="us"
                        leftIcon={'🇺🇸'}
                        options={iconOptions.filter(o => ['nl','us','es'].includes(o.value))} 
                        onChange={() => {}}
                    />
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ComboboxDisplay;