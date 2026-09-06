import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Checkbox from '@/components/ui/Checkbox';
import Pagination from '@/components/ui/Pagination';
import { Tenant } from '@/data/tenantdata';

interface TenantGridProps {
  data: Tenant[];
  itemsPerPage?: number;
  onCardClick?: (row: Tenant) => void;
}

const TenantGrid: React.FC<TenantGridProps> = ({ data, itemsPerPage = 8, onCardClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((row) => (
            <div
              key={row.id}
              className={`bg-white dark:bg-light-soft rounded-xl shadow-sm border border-grey-200 dark:border-grey-400 p-4 flex flex-col gap-4 transition-all hover:shadow-md ${onCardClick ? 'cursor-pointer' : ''} ${selectedRows.has(row.id) ? 'ring-2 ring-primary/20 border-primary' : ''}`}
              onClick={() => onCardClick?.(row)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">{row.tenantName}</span>
                    <span className="text-xs text-grey-500 dark:text-grey-400">{row.email}</span>
                  </div>
                </div>
                <button className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Card Body */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-grey-500">Code:</span>
                  <span className="text-primary">{row.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grey-500">Date:</span>
                  <span className="text-grey-900 dark:text-white">{row.purchasingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grey-500">Amount:</span>
                  <span className="font-medium text-grey-900 dark:text-white">{row.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-grey-500">Status:</span>
                  <Badge
                    variant="soft"
                    color={row.status === 'Active' ? 'success' : row.status === 'Inactive' ? 'danger' : 'warning'}
                    className="rounded-full px-2 py-0.5 text-[10px]"
                  >
                    {row.status}
                  </Badge>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-auto border-t border-grey-100 dark:border-grey-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={row.createdBy.avatar} size="xs" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-grey-900 dark:text-white">{row.createdBy.name}</span>
                  </div>
                </div>
                <span className="text-xs text-grey-500">{row.type}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-grey-500 bg-white dark:bg-light-soft rounded-xl border border-grey-200">
            No results found.
          </div>
        )}
      </div>

      {/* Grid Pagination */}
      <div className="flex justify-end pt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default TenantGrid;
