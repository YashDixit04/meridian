import React from 'react';
import Button, { ButtonColor } from './Button';
import { Plus, Settings, Trash, ChevronRight } from 'lucide-react';

const ButtonsDisplay: React.FC = () => {
  const colors: ButtonColor[] = ['light', 'dark', 'primary', 'info', 'success', 'warning', 'danger'];
  
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Buttons</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Button components across different variants, sizes, and states.
        </p>
      </div>

      {/* Solid Buttons Grid */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Solid Variants</h3>
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px] space-y-6">
            {colors.map((color) => (
                <div key={color} className="flex flex-nowrap items-center gap-6">
                {/* Large Group */}
                <div className="flex items-center gap-3 w-[380px]">
                    <Button color={color} size="large">Large</Button>
                    <Button color={color} size="large" leftIcon={<Plus size={18} />}>Large</Button>
                    <Button color={color} size="large" rightIcon={<Plus size={18} />}>Large</Button>
                </div>
                
                {/* Medium Group */}
                <div className="flex items-center gap-3 w-[320px]">
                    <Button color={color} size="medium">Medium</Button>
                    <Button color={color} size="medium" leftIcon={<Plus size={16} />}>Medium</Button>
                    <Button color={color} size="medium" rightIcon={<Plus size={16} />}>Medium</Button>
                </div>

                {/* Small Group */}
                <div className="flex items-center gap-3 w-[280px]">
                    <Button color={color} size="small">Small</Button>
                    <Button color={color} size="small" leftIcon={<Plus size={14} />}>Small</Button>
                    <Button color={color} size="small" rightIcon={<Plus size={14} />}>Small</Button>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* Soft Buttons Grid */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Soft Variants</h3>
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px] space-y-6">
            {['primary', 'info', 'warning'].map((color) => (
                <div key={color} className="flex flex-nowrap items-center gap-6">
                <div className="flex items-center gap-3 w-[380px]">
                    <Button variant="soft" color={color as ButtonColor} size="large">Large</Button>
                    <Button variant="soft" color={color as ButtonColor} size="large" leftIcon={<Plus size={18} />}>Large</Button>
                    <Button variant="soft" color={color as ButtonColor} size="large" rightIcon={<Plus size={18} />}>Large</Button>
                </div>
                <div className="flex items-center gap-3 w-[320px]">
                    <Button variant="soft" color={color as ButtonColor} size="medium">Medium</Button>
                    <Button variant="soft" color={color as ButtonColor} size="medium" leftIcon={<Plus size={16} />}>Medium</Button>
                    <Button variant="soft" color={color as ButtonColor} size="medium" rightIcon={<Plus size={16} />}>Medium</Button>
                </div>
                <div className="flex items-center gap-3 w-[280px]">
                    <Button variant="soft" color={color as ButtonColor} size="small">Small</Button>
                    <Button variant="soft" color={color as ButtonColor} size="small" leftIcon={<Plus size={14} />}>Small</Button>
                    <Button variant="soft" color={color as ButtonColor} size="small" rightIcon={<Plus size={14} />}>Small</Button>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
      
       {/* Ghost Buttons Grid */}
       <div className="space-y-8">
        <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Ghost Variants</h3>
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px] space-y-6">
            <div className="flex flex-nowrap items-center gap-6">
                <div className="flex items-center gap-3 w-[380px]">
                    <Button variant="ghost" color="primary" size="large">Large</Button>
                    <Button variant="ghost" color="primary" size="large" leftIcon={<Plus size={18} />}>Large</Button>
                    <Button variant="ghost" color="primary" size="large" rightIcon={<Plus size={18} />}>Large</Button>
                </div>
                <div className="flex items-center gap-3 w-[320px]">
                    <Button variant="ghost" color="primary" size="medium">Medium</Button>
                    <Button variant="ghost" color="primary" size="medium" leftIcon={<Plus size={16} />}>Medium</Button>
                    <Button variant="ghost" color="primary" size="medium" rightIcon={<Plus size={16} />}>Medium</Button>
                </div>
                <div className="flex items-center gap-3 w-[280px]">
                    <Button variant="ghost" color="primary" size="small">Small</Button>
                    <Button variant="ghost" color="primary" size="small" leftIcon={<Plus size={14} />}>Small</Button>
                    <Button variant="ghost" color="primary" size="small" rightIcon={<Plus size={14} />}>Small</Button>
                </div>
            </div>
            </div>
        </div>
      </div>

      {/* Icon Only Buttons */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Icon Only</h3>
        <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" color="light" size="large" iconOnly><Settings size={20} /></Button>
                <Button variant="outline" color="light" size="large" iconOnly><Trash size={20} /></Button>
                <Button variant="ghost" color="light" size="large" iconOnly><Trash size={20} /></Button>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" color="light" size="medium" iconOnly><Settings size={18} /></Button>
                <Button variant="outline" color="light" size="medium" iconOnly><Trash size={18} /></Button>
                <Button variant="ghost" color="light" size="medium" iconOnly><Trash size={18} /></Button>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" color="light" size="small" iconOnly><Settings size={16} /></Button>
                <Button variant="outline" color="light" size="small" iconOnly><Trash size={16} /></Button>
                <Button variant="ghost" color="light" size="small" iconOnly><Trash size={16} /></Button>
            </div>
        </div>
        
         {/* Dark Theme Icons Preview */}
         <div className="flex flex-wrap gap-8 p-4 bg-dark rounded-xl">
             <div className="flex items-center gap-4">
                <Button variant="outline" color="dark" size="large" iconOnly><Settings size={20} /></Button>
                <Button variant="outline" color="dark" size="large" iconOnly><Trash size={20} /></Button>
                <Button variant="ghost" color="dark" size="large" iconOnly><Trash size={20} /></Button>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" color="dark" size="medium" iconOnly><Settings size={18} /></Button>
                <Button variant="outline" color="dark" size="medium" iconOnly><Trash size={18} /></Button>
                <Button variant="ghost" color="dark" size="medium" iconOnly><Trash size={18} /></Button>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" color="dark" size="small" iconOnly><Settings size={16} /></Button>
                <Button variant="outline" color="dark" size="small" iconOnly><Trash size={16} /></Button>
                <Button variant="ghost" color="dark" size="small" iconOnly><Trash size={16} /></Button>
            </div>
         </div>
      </div>

      {/* Links */}
      <div className="space-y-8">
         <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Links</h3>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
             <div className="space-y-4">
                <Button variant="link" color="primary" size="large" rightIcon={<ChevronRight size={18} />}>View page</Button>
                <Button variant="link" color="primary" size="medium" rightIcon={<ChevronRight size={16} />}>View page</Button>
                <Button variant="link" color="primary" size="small" rightIcon={<ChevronRight size={14} />}>View page</Button>
             </div>
             <div className="space-y-4">
                <Button variant="link" color="primary" size="large">Large</Button>
                <Button variant="link" color="primary" size="medium">Medium</Button>
                <Button variant="link" color="primary" size="small">Small</Button>
             </div>
             <div className="space-y-4">
                <Button variant="link" color="primary" size="large">Large</Button>
                <Button variant="link" color="primary" size="medium">Medium</Button>
                <Button variant="link" color="primary" size="small">Small</Button>
             </div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-4 bg-dark rounded-xl">
             <div className="space-y-4">
                <Button variant="link" color="primary" size="large" rightIcon={<ChevronRight size={18} />}>View page</Button>
             </div>
             <div className="space-y-4">
                <Button variant="link" color="primary" size="large">Large</Button>
                <Button variant="link" color="primary" size="medium">Medium</Button>
                <Button variant="link" color="primary" size="small">Small</Button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default ButtonsDisplay;