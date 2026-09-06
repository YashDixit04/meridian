import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Checkbox from '../../ui/Checkbox';
import Input from '../../ui/Input';
import Pagination from '../../ui/Pagination';
import { Heading5 } from '@/components/ui/Typography';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  showInGrid?: boolean; // Controls field visibility in DynamicGrid layouts
}

interface TableProps<T> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  showSearch?: boolean;
  onRowClick?: (row: T) => void;
}

export function Table<T extends { id: string | number }>({
  title,
  data,
  columns,
  searchPlaceholder = 'Search...',
  itemsPerPage = 5,
  showSearch = true,
  onRowClick,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Filter data
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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

  const allSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.has(row.id));

  const toggleAllSelection = () => {
    const newSelected = new Set(selectedRows);
    if (allSelected) {
      paginatedData.forEach((row) => newSelected.delete(row.id));
    } else {
      paginatedData.forEach((row) => newSelected.add(row.id));
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="bg-white dark:bg-light-soft rounded-xl shadow-sm border border-grey-200 overflow-hidden flex flex-col">
      {/* Header */}
      {(title || showSearch) && (
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-grey-200 ">
          {title && <Heading5 className="text-grey-900 dark:text-grey-900">{title}</Heading5>}
          {showSearch && (
            <div className="relative w-full sm:w-64">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                size="small"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-grey-50 dark:bg-grey-950/50 border-b border-grey-200 dark:border-grey-400">
              <th className="p-4 w-12">
                <Checkbox
                  checked={allSelected}
                  onChange={toggleAllSelection}
                />
              </th>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-4 text-xs font-medium text-grey-500 uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1 cursor-pointer hover:text-grey-700 dark:hover:text-grey-300 transition-colors group">
                    {col.header}
                    {/* <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" /> */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-100 dark:divide-grey-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-grey-50 dark:hover:bg-grey-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${selectedRows.has(row.id) ? 'bg-primary-soft dark:bg-primary-soft/10' : ''
                    }`}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                  {columns.map((col, index) => (
                    <td key={index} className="p-4 text-sm text-grey-700 dark:text-grey-300 whitespace-nowrap">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-grey-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-grey-200 dark:border-grey-400 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-grey-500">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            className="border border-grey-200 dark:border-grey-400 rounded px-2 py-1 bg-white dark:bg-grey-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={itemsPerPage}
            disabled
          >
            <option>{itemsPerPage}</option>
          </select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}