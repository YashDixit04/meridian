import React from 'react';
import Checkbox from './Checkbox';
import Radio from './Radio';
import Switch from './Switch';
import Slider from './Slider';
import { Sun, Moon } from 'lucide-react';

const TogglesDisplay: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Toggles & Selection</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Interactive selection controls including checkboxes, radio buttons, switches, and sliders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column: Checkboxes */}
          <div className="space-y-12">
               <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Checkboxes</h3>
                    
                    {/* Grid Header */}
                    <div className="grid grid-cols-5 gap-4 text-sm text-grey-500 mb-4">
                        <div className="text-center">Default</div>
                        <div className="text-center">Checked</div>
                        <div className="text-center">Focus</div>
                        <div className="text-center">Indeter.</div>
                        <div className="text-center">Disabled</div>
                    </div>

                    {/* Primary Row */}
                    <div className="grid grid-cols-5 gap-4 justify-items-center">
                        <Checkbox />
                        <Checkbox checked />
                        <Checkbox checked forceState="focus" />
                        <Checkbox indeterminate />
                        <Checkbox disabled checked />
                    </div>

                    {/* Success Row */}
                    <div className="grid grid-cols-5 gap-4 justify-items-center">
                        <Checkbox color="success" />
                        <Checkbox color="success" checked />
                        <Checkbox color="success" checked forceState="focus" />
                        <Checkbox color="success" indeterminate />
                        <Checkbox color="success" disabled checked />
                    </div>

                     {/* Labelled Examples */}
                     <div className="flex gap-8 justify-center pt-4">
                         <Checkbox label="Remember me" />
                         <Checkbox label="Subscribe" checked />
                     </div>
               </div>

               {/* Radios */}
               <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Radio Buttons</h3>
                    
                    {/* Grid Header */}
                    <div className="grid grid-cols-5 gap-4 text-sm text-grey-500 mb-4">
                        <div className="text-center">Default</div>
                        <div className="text-center">Checked</div>
                        <div className="text-center">Focus</div>
                        <div className="text-center">Disabled</div>
                        <div className="text-center">Disabled</div>
                    </div>

                    {/* Radio Row */}
                    <div className="grid grid-cols-5 gap-4 justify-items-center">
                        <Radio />
                        <Radio checked />
                        <Radio checked forceState="focus" />
                        <Radio disabled />
                        <Radio disabled checked />
                    </div>

                    {/* Labelled Examples */}
                    <div className="flex gap-8 justify-center pt-4">
                        <Radio name="plan" label="Free Plan" />
                        <Radio name="plan" label="Pro Plan" checked />
                    </div>
               </div>
          </div>


          {/* Right Column: Switches & Sliders */}
          <div className="space-y-12">
               
               {/* Switches */}
               <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Switches</h3>
                    
                    {/* Grid Header */}
                    <div className="grid grid-cols-5 gap-4 text-sm text-grey-500 mb-4">
                        <div className="text-center">Default</div>
                        <div className="text-center">Active</div>
                        <div className="text-center">Focus</div>
                        <div className="text-center">Disabled</div>
                        <div className="text-center">Disabled</div>
                    </div>

                    {/* Switch Row */}
                    <div className="grid grid-cols-5 gap-4 justify-items-center">
                        <Switch checked={false} />
                        <Switch checked={true} />
                        <Switch checked={true} forceState="focus" />
                        <Switch checked={false} disabled />
                        <Switch checked={true} disabled />
                    </div>

                    {/* Icon Switch Row */}
                    <div className="grid grid-cols-5 gap-4 justify-items-center mt-6">
                         <div className="col-span-2 flex justify-center">
                            <Switch 
                                checked={false} 
                                iconOff={<Sun size={12} className="text-grey-400" />} 
                                iconOn={<Moon size={12} className="text-primary" />}
                            />
                         </div>
                         <div className="col-span-1 flex justify-center">
                            <Switch 
                                checked={true} 
                                iconOff={<Sun size={12} className="text-grey-400" />} 
                                iconOn={<Moon size={12} className="text-primary" />}
                            />
                         </div>
                         <div className="col-span-2"></div>
                    </div>

                     {/* Labelled Examples */}
                     <div className="flex gap-8 justify-center pt-4">
                         <Switch label="Notifications" checked={false} />
                         <Switch label="Dark Mode" checked={true} />
                     </div>
               </div>

               {/* Sliders */}
               <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Sliders</h3>
                    <div className="space-y-8 px-4">
                        <Slider value={0} />
                        <Slider value={25} />
                        <Slider value={50} />
                        <Slider value={75} disabled />
                    </div>
               </div>

          </div>
      </div>
    </div>
  );
};

export default TogglesDisplay;