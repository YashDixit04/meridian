import React, { useState } from 'react';
import Pagination from './Pagination';
import Tooltip from './Tooltip';
import Button from './Button';
import Badge from './Badge';
import { Info, HelpCircle } from 'lucide-react';

const PaginationTooltipDisplay: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLongPage, setCurrentLongPage] = useState(5);

  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-grey-900 dark:text-white">Pagination & Tooltips</h2>
        <p className="text-grey-600 dark:text-grey-500 max-w-2xl">
          Navigation controls for lists and contextual information popups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Pagination Section */}
        <div className="space-y-12">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Pagination</h3>
            
            <div className="space-y-8 p-6 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-xl">
                 <div className="space-y-2">
                    <p className="text-sm text-grey-500">Short Range</p>
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={5} 
                        onPageChange={setCurrentPage} 
                    />
                 </div>

                 <div className="space-y-2">
                    <p className="text-sm text-grey-500">Long Range (Truncated)</p>
                    <Pagination 
                        currentPage={currentLongPage} 
                        totalPages={20} 
                        onPageChange={setCurrentLongPage} 
                    />
                 </div>
            </div>
        </div>

        {/* Tooltips Section */}
        <div className="space-y-12">
            <h3 className="text-xl font-semibold text-grey-900 dark:text-white border-b border-grey-200 dark:border-grey-800 pb-2">Tooltips</h3>
            
            <div className="space-y-8 p-6 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-xl">
                 <div className="space-y-6">
                    <p className="text-sm text-grey-500 mb-4">Hover over the elements below:</p>
                    
                    <div className="flex flex-wrap gap-8 items-center">
                        {/* Text Tooltip */}
                        <Tooltip content="This is helpful information" position="top">
                            <Button variant="outline" color="light" size="small" leftIcon={<Info size={16}/>}>
                                Info (Top)
                            </Button>
                        </Tooltip>

                         {/* Rich Content Tooltip */}
                         <Tooltip 
                            position="right"
                            content={
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] opacity-70">June, 2024 Uploads</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">100.00</span>
                                        <Badge variant="solid" color="success" size="small" className="px-1 py-0 h-4 text-[9px]">+19%</Badge>
                                    </div>
                                </div>
                            }
                        >
                            <Button variant="solid" color="dark" size="small">
                                Stats (Right)
                            </Button>
                        </Tooltip>
                    </div>

                    <div className="flex flex-wrap gap-8 items-center pt-4">
                        <Tooltip content="Bottom Tooltip" position="bottom">
                             <span className="cursor-help text-grey-500 hover:text-primary transition-colors flex items-center gap-1">
                                <HelpCircle size={18} />
                                <span className="text-sm underline decoration-dotted underline-offset-4">Hover text</span>
                             </span>
                        </Tooltip>

                        <Tooltip content="Left Side" position="left">
                            <Button variant="soft" color="warning" size="small">
                                Warning (Left)
                            </Button>
                        </Tooltip>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PaginationTooltipDisplay;