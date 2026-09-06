import React, { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import Pagination from '@/components/ui/Pagination';
import { Column } from './table';
import { MoreHorizontal } from 'lucide-react';

interface DynamicGridProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  onCardClick?: (row: T) => void;
}

export function DynamicGrid<T extends { id: string | number }>({
  data,
  columns,
  itemsPerPage = 8,
  onCardClick,
}: DynamicGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleRowSelection = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Filter out actions or empty headers from displaying in standard card body
  const displayColumns = columns.filter(col => col.header && col.header.toLowerCase() !== 'action');

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((row) => (
            <div
              key={row.id}
              className={`bg-white dark:bg-light-soft rounded-xl shadow-sm border border-grey-200 dark:border-grey-400 p-4 flex flex-col gap-3 transition-all hover:shadow-md group ${
                selectedRows.has(row.id) ? 'ring-2 ring-primary/20 border-primary' : ''
              } ${onCardClick ? 'cursor-pointer' : ''}`}
              onClick={() => onCardClick?.(row)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start pb-2 border-b border-grey-100 dark:border-grey-800">
                <div 
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                  />
                  <span className="text-sm font-semibold text-primary truncate">
                    #{row.id}
                  </span>
                </div>
                <button 
                  className="text-grey-400 hover:text-grey-600 dark:text-grey-500 dark:hover:text-grey-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Card Body */}
              <div className="flex flex-col gap-2 text-sm flex-1">
                {displayColumns.map((col, index) => (
                  <div key={index} className="flex justify-between items-center gap-4">
                    <span className="text-grey-500 text-xs whitespace-nowrap">{col.header}:</span>
                    <div className="text-right text-grey-900 dark:text-white truncate max-w-[70%] text-xs font-medium">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey]) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-grey-500 bg-white dark:bg-light-soft rounded-xl border border-grey-200">
            No results found.
          </div>
        )}
      </div>

      {/* Grid Pagination Footer */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-grey-500 pt-2 border-t border-grey-200 dark:border-grey-400 mt-2">
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, data.length)} of {data.length} items
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default DynamicGrid;
