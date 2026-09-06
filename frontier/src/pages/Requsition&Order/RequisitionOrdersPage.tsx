import React from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import GenericModal from '@/components/ui/GenericModal';
import Combobox from '@/components/ui/Combobox';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import { useRequisitionOrderLogic, STATUS_FILTER_OPTIONS } from './useRequisitionOrderLogic.tsx';

interface RequisitionOrderPageProps {
  onNavigate?: (target: string) => void;
}

const RequisitionOrderPage: React.FC<RequisitionOrderPageProps> = ({ onNavigate }) => {
  const {
    filteredData,
    selectedStatus,
    onStatusChange,
    isModalOpen,
    openModal,
    closeModal,
    modalConfig,
    columns,
    handleRowClick,
  } = useRequisitionOrderLogic(onNavigate);

  const breadcrumbItems: BreadcrumbLink[] = [
    { label: 'Home', href: '#' },
    { label: 'Requisition & Orders', href: '#', active: true },
  ];

  // ── Action button in the page header ────────────────────────────────────────
  const actions = (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <Button
        variant="solid"
        color="primary"
        size="small"
        className="gap-2"
        onClick={openModal}
      >
        <Plus size={14} />
        Create Requisition
      </Button>
    </div>
  );

  // ── Status filter rendered inside GenericTablePage's filters slot ────────────
  const filters = (
    <div className="flex items-center gap-2">
      <div className="w-44">
        <Combobox
          options={STATUS_FILTER_OPTIONS}
          value={selectedStatus}
          onChange={onStatusChange}
          placeholder="Filter by Status"
          size="small"
        />
      </div>
    </div>
  );

  return (
    <>
      <GenericTablePage
        breadcrumbItems={breadcrumbItems}
        data={filteredData}
        columns={columns}
        itemsPerPage={8}
        actions={actions}
        filters={filters}
        /* Export & Import are intentionally omitted — pass moreActions={undefined}
           and do NOT pass createButtonLabel so the default download/sort icons
           from GenericTablePage are also suppressed via the moreActions guard. */
        moreActions={<></>}
        onRowClick={(row) => handleRowClick(row, onNavigate)}
      />

      {/* Shared GenericModal — same component used on the Catalogue page */}
      {isModalOpen && (
        <GenericModal
          config={{
            ...modalConfig,
            isOpen: isModalOpen,
            onClose: closeModal,
          }}
        />
      )}
    </>
  );
};

export default RequisitionOrderPage;
