import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import { Table, Column } from '../table/table';
import ViewToggle, { ViewMode } from '@/components/layout/viewTableLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ReusableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  renderGrid?: (data: T[]) => React.ReactNode;
  searchPredicate?: (row: T, searchTerm: string) => boolean;
  createButtonLabel?: string;
  onCreateClick?: () => void;
  filters?: React.ReactNode;
}

function TenantTable<T extends { id: string | number }>({ 
  data, 
  columns,
  onRowClick,
  renderGrid,
  searchPredicate,
  createButtonLabel,
  onCreateClick,
  filters
}: ReusableTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter data
  const filteredData = data.filter((row) => {
    if (searchPredicate) {
      return searchPredicate(row, searchTerm);
    }
    return Object.values(row as any).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: Search and Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-grey-50 dark:bg-grey-200 border-none"
            />
          </div>
          {filters ? filters : (
            <Button variant="outline" size="small" iconOnly className="bg-grey-50 border-none text-grey-500">
              <Filter size={18} />
            </Button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {renderGrid && <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}

          <Button variant="outline" size="small" iconOnly className="bg-grey-50 border-none text-grey-500">
            <Download size={18} />
          </Button>

          <Button variant="outline" size="small" iconOnly className="bg-grey-50 border-none text-grey-500">
            <ArrowUpDown size={18} />
          </Button>

          {createButtonLabel && (
            <Button variant="solid" color="primary" size="small" className="gap-2 ml-2" onClick={onCreateClick}>
              <Plus size={18} />
              {createButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Content Container */}
      {viewMode === 'list' || !renderGrid ? (
        <Table
          data={filteredData}
          columns={columns}
          itemsPerPage={7}
          showSearch={false}
          onRowClick={onRowClick}
        />
      ) : (
        renderGrid(filteredData)
      )}
    </div>
  );
}

export default TenantTable;
