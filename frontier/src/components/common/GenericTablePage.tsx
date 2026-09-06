import React, { useState } from 'react';
import { Search, Filter, Download, ArrowUpDown, Plus } from 'lucide-react';
import { Table, Column } from '@/components/common/table/table';
import { DynamicGrid } from '@/components/common/table/DynamicGrid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageLayout from '@/components/layout/PageLayout';
import { BreadcrumbLink } from '@/components/common/Breadcrub/dynamicbreadcrub';
import { Heading3 } from '@/components/ui/Typography';

interface GenericTablePageProps<T extends { id: string | number }> {
  breadcrumbItems: BreadcrumbLink[];
  data: T[];
  columns: Column<T>[];
  title?: string;
  createButtonLabel?: string;
  itemsPerPage?: number;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  viewToggle?: React.ReactNode;
  moreActions?: React.ReactNode;
  viewMode?: 'list' | 'grid';
  renderGrid?: (data: T[]) => React.ReactNode;
  onRowClick?: (row: T) => void;
  onCreateClick?: () => void;
  customContent?: React.ReactNode;
}

function GenericTablePage<T extends { id: string | number }>({
  breadcrumbItems,
  data,
  columns,
  createButtonLabel,
  actions,
  filters,
  viewToggle,
  moreActions,
  viewMode = 'list',
  renderGrid,
  itemsPerPage = 7,
  onRowClick,
  onCreateClick,
  customContent,
}: GenericTablePageProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const hasData = filteredData.length > 0 || searchTerm.length > 0;

  return (
    <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex flex-col gap-4 w-full h-full">
          {customContent}
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
                <Button variant="outline" className="bg-grey-50 border-none text-grey-500">
                  <Filter size={18} />
                </Button>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {viewToggle}
              {moreActions}

              {!moreActions && (
                <>
                  <Button variant="outline" className="bg-grey-50 border-none text-grey-500">
                    <Download size={18} />
                  </Button>

                  <Button variant="outline" className="bg-grey-50 border-none text-grey-500">
                    <ArrowUpDown size={18} />
                  </Button>
                </>
              )}

              {createButtonLabel && (
                <Button variant="solid" color="primary" size="small" className="gap-2 ml-2" onClick={onCreateClick}>
                  <Plus size={18} />
                  {createButtonLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Content Display: Table or Grid */}
          {hasData || data.length > 0 ? (
            viewMode === 'grid' ? (
              renderGrid ? renderGrid(filteredData) : (
                <DynamicGrid
                  data={filteredData}
                  columns={columns}
                  itemsPerPage={itemsPerPage}
                  onCardClick={onRowClick}
                />
              )
            ) : (
              <Table
                data={filteredData}
                columns={columns}
                itemsPerPage={itemsPerPage}
                showSearch={false}
                onRowClick={onRowClick}
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0A0A0D] rounded-xl border border-grey-200 dark:border-grey-800 min-h-[400px]">
              <div className="flex flex-col items-center gap-6 max-w-md text-center">
                <img
                    src="/nousers.svg"
                    alt="No Data Found"
                    className="w-64 h-64 object-contain opacity-80"
                />
                <Heading3 className="text-grey-900 dark:text-white">No Data Found</Heading3>
                <p className="text-grey-500 dark:text-grey-400">
                  There are currently no records to display.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default GenericTablePage;
