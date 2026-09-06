import React from 'react';
import Input from './Input';
import { Search, Command, CreditCard, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';

const InputsDisplay: React.FC = () => {
  // Columns definition for the grid
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

  // Custom visual for number stepper arrows
  const NumberStepper = () => (
    <div className="flex flex-col -mr-1">
       <ChevronUp size={12} className="text-grey-400 hover:text-primary cursor-pointer -mb-[2px]" />
       <ChevronDown size={12} className="text-grey-400 hover:text-primary cursor-pointer -mt-[2px]" />
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Inputs</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Consistent input styles for cohesive and accessible form fields across sizes and states.
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="space-y-12">
        
        {/* Section: Basic Text Inputs */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Text Inputs</h3>
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
                    <div className="text-sm text-grey-500 pt-3">Text - Large</div>
                    {states.map((s, i) => (
                        <Input key={i} size="large" state={s.state} forceState={s.force} placeholder="Text - Large" />
                    ))}

                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Text - Medium</div>
                    {states.map((s, i) => (
                        <Input key={i} size="medium" state={s.state} forceState={s.force} placeholder="Text - Medium" />
                    ))}

                    {/* Small Row */}
                    <div className="text-sm text-grey-500 pt-1.5">Text - Small</div>
                    {states.map((s, i) => (
                        <Input key={i} size="small" state={s.state} forceState={s.force} placeholder="Text - Small" />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Text with Suffix */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Text with Suffix</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    {/* Large Row */}
                    <div className="text-sm text-grey-500 pt-3">Text - Large (kg)</div>
                    {states.map((s, i) => (
                        <Input key={i} size="large" state={s.state} forceState={s.force} placeholder="Weight" suffixText="kg" />
                    ))}

                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Text - Medium (kg)</div>
                    {states.map((s, i) => (
                        <Input key={i} size="medium" state={s.state} forceState={s.force} placeholder="Weight" suffixText="kg" />
                    ))}

                     {/* Small Row */}
                     <div className="text-sm text-grey-500 pt-1.5">Text - Small (kg)</div>
                    {states.map((s, i) => (
                        <Input key={i} size="small" state={s.state} forceState={s.force} placeholder="Weight" suffixText="kg" />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Search Inputs */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Search</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    {/* Large Row */}
                    <div className="text-sm text-grey-500 pt-3">Search - Large</div>
                    {states.map((s, i) => (
                        <Input key={i} size="large" state={s.state} forceState={s.force} placeholder="Search..." leftIcon={<Search size={20} />} />
                    ))}

                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Search - Medium</div>
                    {states.map((s, i) => (
                        <Input key={i} size="medium" state={s.state} forceState={s.force} placeholder="Search..." leftIcon={<Search size={18} />} />
                    ))}

                     {/* Small Row */}
                     <div className="text-sm text-grey-500 pt-1.5">Search - Small</div>
                    {states.map((s, i) => (
                        <Input key={i} size="small" state={s.state} forceState={s.force} placeholder="Search..." leftIcon={<Search size={16} />} />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Search with Shortcut */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Search w/ Shortcut</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Search - Medium</div>
                    {states.map((s, i) => (
                        <Input 
                            key={i} 
                            size="medium" 
                            state={s.state} 
                            forceState={s.force} 
                            placeholder="Quick search..." 
                            leftIcon={<Search size={18} />} 
                            rightIcon={
                                <div className="flex items-center gap-1 bg-grey-100 dark:bg-grey-800 px-1.5 py-0.5 rounded text-xs border border-grey-200 dark:border-grey-700">
                                    <Command size={10} /> K
                                </div>
                            }
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Card Inputs */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Card Input</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    {/* Large Row */}
                    <div className="text-sm text-grey-500 pt-3">Card - Large</div>
                    {states.map((s, i) => (
                        <Input key={i} size="large" state={s.state} forceState={s.force} placeholder="0000 0000 0000 0000" rightIcon={<CreditCard size={20} />} />
                    ))}
                    
                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Card - Medium</div>
                    {states.map((s, i) => (
                        <Input key={i} size="medium" state={s.state} forceState={s.force} placeholder="0000 0000 0000 0000" rightIcon={<CreditCard size={18} />} />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Number Inputs */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Number</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    {/* Large Row */}
                    <div className="text-sm text-grey-500 pt-3">Number - Large</div>
                    {states.map((s, i) => (
                        <Input key={i} size="large" state={s.state} forceState={s.force} placeholder="0" rightIcon={<NumberStepper />} />
                    ))}

                    {/* Medium Row */}
                    <div className="text-sm text-grey-500 pt-2.5">Number - Medium</div>
                    {states.map((s, i) => (
                        <Input key={i} size="medium" state={s.state} forceState={s.force} placeholder="0" rightIcon={<NumberStepper />} />
                    ))}
                </div>
            </div>
        </div>

        {/* Section: Textarea */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Textarea</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-6 gap-6">
                    <div className="text-sm text-grey-500 pt-3">Textarea</div>
                    {states.map((s, i) => (
                        <Input key={i} isTextarea rows={3} state={s.state} forceState={s.force} placeholder="Enter description..." />
                    ))}
                </div>
            </div>
        </div>

         {/* Section: Addons Examples */}
         <div className="space-y-6">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Addons</h3>
            <div className="flex flex-wrap gap-8">
                 <div className="w-80">
                    <Input size="medium" prefixLabel="$" placeholder="Amount" />
                 </div>
                 <div className="w-80">
                    <Input size="medium" prefixLabel="https://" placeholder="www.example.com" />
                 </div>
                 <div className="w-80">
                    <Input 
                        size="medium" 
                        prefixLabel="figma.com/" 
                        placeholder="design-system" 
                        rightIcon={<CheckCircle size={16} className="text-success" />} 
                    />
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default InputsDisplay;