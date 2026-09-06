import React, { useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import { requisitionOrdersTableData, requisitionOrdersColumns } from '@/data/requisitionOrdersData';
import Button from '@/components/ui/Button';
import { Calendar, ChevronDown } from 'lucide-react';

const RequisitionOrdersPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Requisition & Orders', href: '#', active: true },
    ];
     // PageLayout Actions
  const actions = (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      {/* Date Picker Trigger */}
      <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
        <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
        <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
        <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
      </div>

      <Button variant="solid" color="primary" size="small">
        Account Settings
      </Button>
    </div>
  );

    return (
        <GenericTablePage
            breadcrumbItems={breadcrumbItems}
            data={requisitionOrdersTableData}
            columns={requisitionOrdersColumns}
            createButtonLabel="Create Order"
            itemsPerPage={7}
            viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
            viewMode={viewMode}
            actions={actions}
        />
    );
};

export default RequisitionOrdersPage;
