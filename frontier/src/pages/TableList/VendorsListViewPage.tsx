import React, { useEffect, useState } from 'react';
import { Calendar, ChevronDown, Eye, Plus } from 'lucide-react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import Button from '@/components/ui/Button';
import { Vendor, vendorsColumns } from '@/data/vendorsData';
import { authService } from '@/services/authService';
import tenantService, { TenantVendor } from '@/services/tenantService';

const isVendorOnlyTenantSelection = (selection?: string): boolean => {
  if (typeof selection !== 'string') {
    return false;
  }

  const normalized = selection.toLowerCase();
  if (!normalized.includes('vendor')) {
    return false;
  }

  return !normalized.includes('both') && !normalized.includes('smc');
};

interface VendorsPageProps {
  tenantId?: string;
  onNavigate?: (target: string) => void;
}

const mapTenantVendorToRow = (vendor: TenantVendor, index: number): Vendor => ({
  id: index + 1,
  companyName: vendor.basicInfo.companyName,
  registrationNumber: vendor.basicInfo.registrationNumber,
  email: vendor.basicInfo.email,
  companyType: vendor.basicInfo.companyType,
  kycStatus: vendor.kyc.kycStatus,
  serviceType: vendor.capability.serviceType,
  portsCovered: vendor.coverage.portsServed?.length || 0,
  approvalStatus: vendor.systemFlags.isApproved ? 'Approved' : 'Not Approved',
  _backendId: vendor.id,
  _tenantId: vendor.tenantId,
});

const VendorsListViewPage: React.FC<VendorsPageProps> = ({ tenantId: propTenantId, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [pageNotice, setPageNotice] = useState('');
  const [tenantUserTypeSelection, setTenantUserTypeSelection] = useState('');

  const session = authService.getSession();
  const tenantId = propTenantId || session?.tenantId || '';

  const fetchVendors = async () => {
    if (!tenantId) {
      setVendors([]);
      setIsLoading(false);
      setPageError('Tenant context is missing. Open this page from Tenant Details.');
      return;
    }

    try {
      setIsLoading(true);
      const [data, tenantDetails] = await Promise.all([
        tenantService.getVendors(tenantId),
        tenantService.getTenantDetails(tenantId),
      ]);

      const mappedRows = data.map(mapTenantVendorToRow);
      const resolvedUserTypeSelection = tenantDetails?.userConfigurations?.userTypeSelection || '';
      const vendorOnlyTenant = isVendorOnlyTenantSelection(resolvedUserTypeSelection);

      setTenantUserTypeSelection(resolvedUserTypeSelection);
      setVendors(mappedRows);

      if (vendorOnlyTenant && mappedRows.length > 0) {
        setPageNotice('Vendor-only tenants can maintain a single Vendor KYC profile.');
      } else {
        setPageNotice('');
      }

      if (vendorOnlyTenant && mappedRows.length === 1 && mappedRows[0]._backendId) {
        onNavigate?.(`/tenant/${tenantId}/vendors/${mappedRows[0]._backendId}`);
      }

      setPageError('');
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setVendors([]);
      setPageError('Failed to load tenant vendors. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [tenantId]);

  const navigateToCreatePage = () => {
    if (!tenantId) {
      setPageError('Tenant context is missing. Open this page from Tenant Details.');
      return;
    }

    if (isVendorOnlyTenantSelection(tenantUserTypeSelection) && vendors.length > 0) {
      setPageError('Vendor-only tenants can create only one Vendor KYC profile.');
      return;
    }

    onNavigate?.(`/tenant/${tenantId}/vendors/new`);
  };

  const allowCreateVendor = !(isVendorOnlyTenantSelection(tenantUserTypeSelection) && vendors.length > 0);

  const openVendorDetails = (row: Vendor) => {
    if (!tenantId || !row._backendId) {
      return;
    }

    onNavigate?.(`/tenant/${tenantId}/vendors/${row._backendId}`);
  };

  const tableColumns = vendorsColumns.map((column) => {
    if (column.header !== 'Action') {
      return column;
    }

    return {
      ...column,
      cell: (row: Vendor) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              openVendorDetails(row);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-grey-200 dark:border-grey-700 px-2 py-1 text-xs font-medium text-grey-700 dark:text-grey-300 hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Eye size={12} /> View
          </button>
        </div>
      ),
    };
  });

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Tenant', href: '#' },
    { label: 'Vendors', href: '#', active: true },
  ];

  const actions = (
    <div className="w-full sm:w-auto flex items-center justify-end gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
        <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
        <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
        <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
      </div>
      {allowCreateVendor && (
        <Button variant="solid" color="primary" size="small" onClick={navigateToCreatePage}>
          <Plus size={14} className="mr-1" /> Add Vendor
        </Button>
      )}
    </div>
  );

  return (
    <GenericTablePage
      breadcrumbItems={breadcrumbItems}
      data={vendors}
      columns={tableColumns}
      createButtonLabel={allowCreateVendor ? 'Add Vendor' : undefined}
      onCreateClick={navigateToCreatePage}
      itemsPerPage={7}
      viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
      viewMode={viewMode}
      actions={actions}
      onRowClick={openVendorDetails}
      customContent={
        <>
          {pageNotice && (
            <div className="rounded-lg border border-info/30 bg-info-soft px-4 py-2 text-sm text-info">
              {pageNotice}
            </div>
          )}
          {isLoading && (
            <div className="rounded-lg border border-primary/20 bg-primary-soft px-4 py-2 text-sm text-primary">
              Loading tenant-scoped vendors...
            </div>
          )}
          {pageError && (
            <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger">
              {pageError}
            </div>
          )}
        </>
      }
    />
  );
};

export default VendorsListViewPage;
